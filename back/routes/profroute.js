const express = require("express");
const router = express.Router();
const profcontroller = require("../controllers/prof/authentification");
const db = require("../database/connexion");

// Login et infos prof
router.post("/login", profcontroller.login);
router.get("/:id/emploi", profcontroller.emploi);
router.get("/:id/classes", profcontroller.classe);
router.get("/:id/matieres", profcontroller.matieres);

// ✅ Récupérer la liste pour l'appel
router.get('/:profId/appel/:seanceId/:date', async (req, res) => {
  const { profId, seanceId, date } = req.params;
  const annee_scolaire = '2025-2026';

  try {
    // 1️⃣ Infos de la séance
    const [seance] = await db.query(
      `SELECT s.id_sceance, s.jour, s.heure_debut, s.heure_fin, s.salle,
              s.classe_id, c.nom_classe, c.niveau, m.nom_matiere
       FROM sceance s
       JOIN classe c ON s.classe_id = c.id_classe
       JOIN matiere m ON s.matiere_id = m.id_matiere
       WHERE s.id_sceance = ? AND s.prof_id = ?`,
      [seanceId, profId]
    );


    if (seance.length === 0) return res.status(404).json({ error: 'Séance introuvable' });
    const s = seance[0];

    // 2️⃣ Étudiants inscrits
    const [etudiants] = await db.query(
      `SELECT e.id AS id_etudiant, e.nom, e.prenom, e.date_naissance,
              p.id AS id_presence, p.statut, p.remarque, p.date_saisie
       FROM etudiant e
       JOIN inscription i ON i.etudiant_id = e.id
       LEFT JOIN presences p ON p.etudiant_id = e.id
          AND p.sceance_id = ?
          AND DATE(p.date_sceance) = ?
       WHERE i.classe_id = ? AND i.annee_scolaire = ?
       ORDER BY e.nom, e.prenom`,
      [seanceId, date, s.classe_id, annee_scolaire]
    );
    console.log(etudiants);


    res.json({
      seance: s,
      etudiants,
      total_etudiants: etudiants.length,
      deja_saisi: etudiants.some(e => e.statut !== null)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Sauvegarder l'appel
router.post('/:profId/appel/sauvegarder', async (req, res) => {
  const { profId } = req.params;
  const { seanceId, date, presences } = req.body;

  if (!seanceId || !date || !presences || !Array.isArray(presences)) {
    return res.status(400).json({ 
      error: 'Données invalides. Format attendu: { seanceId, date, presences: [] }' 
    });
  }

  try {
    const results = [];
    for (const p of presences) {
      // Vérifier si présence existe
      const [existing] = await db.query(
        `SELECT id FROM presences WHERE etudiant_id = ? AND sceance_id = ? AND DATE(date_sceance) = ?`,
        [p.id_etudiant, seanceId, date]
      );

      if (existing.length > 0) {
        // UPDATE
        const [updateResult] = await db.query(
          `UPDATE presences 
           SET statut = ?, remarque = ?, date_saisie = CURRENT_TIMESTAMP, saisie_par = ?
           WHERE id = ?`,
          [p.statut || 'present', p.remarque || null, profId, existing[0].id]
        );
        results.push(updateResult);
      } else {
        // INSERT
        const [insertResult] = await db.query(
          `INSERT INTO presences 
           (etudiant_id, sceance_id, date_sceance, statut, saisie_par, remarque, date_saisie)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [p.id_etudiant, seanceId, date, p.statut || 'present', profId, p.remarque || null]
        );
        results.push(insertResult);
      }
    }

    res.json({
      success: true,
      message: 'Appel sauvegardé avec succès',
      total_enregistrements: results.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde', details: err.message });
  }
});

// ✅ Historique des présences
router.get('/:profId/historique-presences/:classeId', async (req, res) => {
  const { classeId } = req.params;
  const { dateDebut, dateFin } = req.query;

  try {
    let query = `
      SELECT 
        p.date_sceance,
        p.statut,
        COUNT(*) as nombre,
        s.jour,
        m.nom_matiere
      FROM presences p
      JOIN sceance s ON p.sceance_id = s.id_sceance
      JOIN matiere m ON s.matiere_id = m.id_matiere
      WHERE s.classe_id = ?`;
    const params = [classeId];

    if (dateDebut) { query += ` AND p.date_sceance >= ?`; params.push(dateDebut); }
    if (dateFin)   { query += ` AND p.date_sceance <= ?`; params.push(dateFin); }

    query += ` GROUP BY p.date_sceance, p.statut, s.jour, m.nom_matiere
               ORDER BY p.date_sceance DESC, m.nom_matiere`;

    const [results] = await db.query(query, params);
    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Statistiques d'un étudiant
router.get('/:profId/statistiques-etudiant/:etudiantId', async (req, res) => {
  const { etudiantId } = req.params;

  try {
    const [results] = await db.query(
      `SELECT 
         COUNT(*) as total_seances,
         SUM(CASE WHEN statut = 'present' THEN 1 ELSE 0 END) as presences,
         SUM(CASE WHEN statut = 'absent' THEN 1 ELSE 0 END) as absences,
         SUM(CASE WHEN statut = 'retard' THEN 1 ELSE 0 END) as retards,
         SUM(CASE WHEN statut = 'justifie' THEN 1 ELSE 0 END) as justifies,
         ROUND(
           (SUM(CASE WHEN statut = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100,
           2
         ) as taux_presence
       FROM presences
       WHERE etudiant_id = ?`,
      [etudiantId]
    );

    res.json(results[0] || {
      total_seances: 0,
      presences: 0,
      absences: 0,
      retards: 0,
      justifies: 0,
      taux_presence: 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Classes pour notifications (SES classes seulement)
router.get('/:profId/classes-notifications', async (req, res) => {
  const { profId } = req.params;
  
  try {
    const [classes] = await db.query(`
      SELECT DISTINCT c.id_classe, c.nom_classe, c.niveau,
             COUNT(n.id) as notifications_non_lues
      FROM classe c
      JOIN sceance s ON c.id_classe = s.classe_id
      LEFT JOIN notifications_classes nc ON c.id_classe = nc.classe_id
      LEFT JOIN notifications n ON nc.notification_id = n.id AND n.lu = FALSE
      WHERE s.prof_id = ?
      GROUP BY c.id_classe, c.nom_classe, c.niveau
      ORDER BY c.nom_classe
    `, [profId]);
    
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Envoyer notification (PROF SEUL)
router.post('/:profId/notifications/envoyer', async (req, res) => {
  const { profId } = req.params;
  const { titre, message, type, classes } = req.body;

  if (!titre || !message || !classes?.length) {
    return res.status(400).json({ error: 'Titre, message et classes requis' });
  }

  try {
    // VÉRIFIE classes autorisées pour ce prof
    const [profClasses] = await db.query(`
      SELECT c.id_classe FROM classe c 
      JOIN sceance s ON c.id_classe = s.classe_id 
      WHERE s.prof_id = ?
    `, [profId]);
    
    const classesAutorisées = profClasses.map(c => c.id_classe);
    const classesInvalides = classes.filter(id => !classesAutorisées.includes(Number(id)));
    
    if (classesInvalides.length > 0) {
      return res.status(403).json({ error: 'Classes non autorisées' });
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    const [notifResult] = await conn.query(
      'INSERT INTO notifications (titre, message, type, prof_id) VALUES (?, ?, ?, ?)',
      [titre, message, type || 'info', profId]
    );
    const notifId = notifResult.insertId;

    const classBindings = classes.map(classeId => [notifId, classeId]);
    await conn.query(
      'INSERT INTO notifications_classes (notification_id, classe_id) VALUES ?',
      [classBindings]
    );

    await conn.commit();
    res.json({ success: true, id: notifId, classes_envoyees: classes.length });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Récupérer ses notifications
router.get('/:profId/notifications', async (req, res) => {
  const { profId } = req.params;
  const { lu = 'toutes' } = req.query;

  try {
    const [notifications] = await db.query(`
      SELECT n.*, 
             GROUP_CONCAT(c.nom_classe SEPARATOR ', ') as classes_noms,
             COUNT(nc.id) as nb_classes
      FROM notifications n
      LEFT JOIN notifications_classes nc ON n.id = nc.notification_id
      LEFT JOIN classe c ON nc.classe_id = c.id_classe
      WHERE n.prof_id = ?
      ${lu === 'non_lues' ? 'AND n.lu = FALSE' : ''}
      GROUP BY n.id
      ORDER BY n.date_creation DESC
      LIMIT 50
    `, [profId]);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marquer lue
router.post('/:profId/notifications/:notifId/lu', async (req, res) => {
  const { profId, notifId } = req.params;
  const [result] = await db.query(
    'UPDATE notifications SET lu = TRUE, date_lecture = CURRENT_TIMESTAMP WHERE id = ? AND prof_id = ?',
    [notifId, profId]
  );
  res.json({ success: result.affectedRows > 0 });
});

router.get('/:profId/classes-saisie-notes', async (req, res) => {
  const { profId } = req.params;
  try {
    const [classes] = await db.query(`
      SELECT DISTINCT c.id_classe, c.nom_classe, c.niveau
      FROM classe c
      JOIN sceance s ON c.id_classe = s.classe_id
      WHERE s.prof_id = ?
      ORDER BY c.nom_classe
    `, [profId]);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Liste matières prof/classe/semestre
router.get('/:profId/matieres-classe/:classeId/:semestre', async (req, res) => {
  const { profId, classeId, semestre } = req.params;
  
  const [matieres] = await db.query(`
    SELECT DISTINCT m.id_matiere, m.nom_matiere, m.coefficient
    FROM sceance s
    JOIN matiere m ON s.matiere_id = m.id_matiere
    JOIN programme p ON s.matiere_id = p.matiere_id AND p.classe_id = ?
    WHERE s.prof_id = ? AND s.classe_id = ? AND m.semestre = ?
    ORDER BY m.nom_matiere
  `, [classeId, profId, classeId, semestre]);
  
  res.json(matieres);
});

// ✅ Saisie notes : UNE SEULE MATIÈRE
router.get('/:profId/saisie-notes/:classeId/:semestre/:matiereId', async (req, res) => {
  const { profId, classeId, semestre, matiereId } = req.params;
  
  const [data] = await db.query(`
    SELECT DISTINCT
      e.id as etudiant_id, e.nom, e.prenom,
      m.id_matiere as matiere_id, m.nom_matiere, m.coefficient,
      n.id_note, n.note_ds, n.note_examen,
      COALESCE(n.note_ds * 0.3 + n.note_examen * 0.7, 0) as moyenne
    FROM classe c
    JOIN inscription i ON c.id_classe = i.classe_id AND i.annee_scolaire = '2025-2026'
    JOIN etudiant e ON i.etudiant_id = e.id
    JOIN programme p ON c.id_classe = p.classe_id AND p.matiere_id = ?
    JOIN matiere m ON p.matiere_id = m.id_matiere AND m.semestre = ?
    JOIN sceance s ON c.id_classe = s.classe_id AND s.prof_id = ? AND s.matiere_id = ?
    LEFT JOIN note n ON e.id = n.etudiant_id 
      AND n.matiere_id = ? AND n.semestre = ? AND n.annee_scolaire = '2025-2026'
    WHERE c.id_classe = ?
    ORDER BY e.nom, e.prenom
  `, [matiereId, semestre, profId, matiereId, matiereId, semestre, classeId]);
  
  res.json(data);
});

// ✅ Liste matières prof/classe/semestre
router.get('/:profId/matieres-classe/:classeId/:semestre', async (req, res) => {
  const { profId, classeId, semestre } = req.params;
  
  const [matieres] = await db.query(`
    SELECT DISTINCT m.id_matiere, m.nom_matiere, m.coefficient
    FROM sceance s
    JOIN matiere m ON s.matiere_id = m.id_matiere
    JOIN programme p ON s.matiere_id = p.matiere_id AND p.classe_id = ?
    WHERE s.prof_id = ? AND s.classe_id = ? AND m.semestre = ?
    ORDER BY m.nom_matiere
  `, [classeId, profId, classeId, semestre]);
  
  res.json(matieres);
});

// ✅ Sauvegarder notes
router.post('/:profId/notes/sauvegarder', async (req, res) => {
  const { profId } = req.params;
  const { notes, classeId, semestre } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    for (const note of notes) {
      await conn.query(`
        INSERT INTO note (etudiant_id, matiere_id, note_ds, note_examen, semestre, annee_scolaire)
        VALUES (?, ?, ?, ?, ?, '2025-2026')
        ON DUPLICATE KEY UPDATE 
          note_ds = VALUES(note_ds),
          note_examen = VALUES(note_examen)
      `, [note.etudiant_id, note.matiere_id, note.note_ds || null, note.note_examen || null, semestre]);
    }
    await conn.commit();
    res.json({ success: true, notesSauvees: notes.length });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
