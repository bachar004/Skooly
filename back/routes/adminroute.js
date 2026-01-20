const controlleretudiant=require("../controllers/admin/etud");

const controllerprof=require("../controllers/admin/prof");

const controllernote=require("../controllers/admin/note");

const controlleradmin=require("../controllers/admin/authentification");

const controlleracceuil=require("../controllers/admin/acceuil");

const express=require("express");

const route=express.Router();

const db = require("../database/connexion");

route.post("/log_admin",controlleradmin.login);
route.post("/verify-otp", controlleradmin.verifotp);
route.post("/classes",controlleretudiant.ajout_class);
route.post("/classes/addetud",controlleretudiant.ajout_etudiant_inscri);
route.post("/prof/add",controllerprof.ajout_prof);

route.get("/acceuil_stats",controlleracceuil.affiche);
route.get("/peretud",controlleracceuil.peretud);
route.get ("/classes",controlleretudiant.affiche_classe);
route.get("/classes/etudiants/:id",controlleretudiant.affiche_etudbyclass);
route.get("/classes/niv",controlleretudiant.aff_niv);
route.get("/classes/spec",controlleretudiant.aff_spec);
route.get("/classes/emploi/:id",controlleretudiant.emploi);
route.get("/generatepwd",controlleradmin.password_auto);
route.get("/prof",controllerprof.affiche_prof);
route.get("/prof/:chaine",controllerprof.recherche);
route.get("/profbyid/:id",controllerprof.getprofbyid);
route.get("/prof/sceance/:id",controllerprof.sceance_prof);
route.get("/matiere", controllernote.affichematiere)

route.delete("/classes/delete/:etudiant_id/:classe_id",controlleretudiant.delete_etud_inscri);
route.delete("/prof/delete/:id",controllerprof.deleteprof);


route.put("/classes/majetud/:id",controlleretudiant.majetud);
route.put("/prof/majprof/:id",controllerprof.majprof);

route.get('/classes-admin', async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT DISTINCT c.id_classe, c.nom_classe, c.niveau, c.specialite,
             COUNT(DISTINCT e.id) as nb_etudiants
      FROM classe c
      JOIN inscription i ON c.id_classe = i.classe_id
      JOIN etudiant e ON i.etudiant_id = e.id
      WHERE i.annee_scolaire = '2025-2026'
      GROUP BY c.id_classe, c.nom_classe, c.niveau, c.specialite
      ORDER BY c.niveau, c.nom_classe
    `);
    res.json(classes);
  } catch (error) {
    console.error('Erreur classes-admin:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les matières d'une classe (CORRIGÉ)
route.get('/classes/:classeId/matieres', async (req, res) => {
  try {
    const { classeId } = req.params;
    
    // Vérifier d'abord si la table programme existe et a des données
    const [matieres] = await db.query(`
      SELECT DISTINCT 
        m.id_matiere, 
        m.nom_matiere, 
        m.coefficient, 
        m.semestre
      FROM matiere m
      WHERE EXISTS (
        SELECT 1 FROM programme p 
        WHERE p.matiere_id = m.id_matiere 
        AND p.classe_id = ?
      )
      ORDER BY m.semestre, m.nom_matiere
    `, [classeId]);
    
    console.log(`Matières trouvées pour classe ${classeId}:`, matieres.length);
    res.json(matieres);
  } catch (error) {
    console.error('Erreur récupération matières:', error);
    res.status(500).json({ error: error.message });
  }
});

// Alternative si la table programme n'existe pas ou est vide
route.get('/classes/:classeId/matieres-all', async (req, res) => {
  try {
    // Récupérer toutes les matières (à utiliser si programme est vide)
    const [matieres] = await db.query(`
      SELECT 
        id_matiere, 
        nom_matiere, 
        coefficient, 
        semestre
      FROM matiere
      ORDER BY semestre, nom_matiere
    `);
    
    res.json(matieres);
  } catch (error) {
    console.error('Erreur récupération toutes matières:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les notes d'une classe pour une matière (CORRIGÉ pour votre structure)
route.get('/notes-classe/:classeId/matiere/:matiereId', async (req, res) => {
  try {
    const { classeId, matiereId } = req.params;
    const { semestre } = req.query;
    
    const [notes] = await db.query(`
      SELECT 
        e.id as etudiant_id, 
        e.nom, 
        e.prenom,
        m.nom_matiere,
        m.coefficient,
        m.semestre,
        COALESCE(n.note_ds, 0) as note_ds,
        COALESCE(n.note_examen, 0) as note_examen,
        ROUND(COALESCE(n.note_ds * 0.3 + n.note_examen * 0.7, 0), 2) as moyenne
      FROM etudiant e
      JOIN inscription i ON e.id = i.etudiant_id
      CROSS JOIN matiere m
      LEFT JOIN note n ON e.id = n.etudiant_id 
        AND n.matiere_id = m.id_matiere 
        AND n.semestre = m.semestre
        AND n.annee_scolaire = '2025-2026'
      WHERE i.classe_id = ? 
        AND i.annee_scolaire = '2025-2026'
        AND m.id_matiere = ?
        ${semestre ? 'AND m.semestre = ?' : ''}
      ORDER BY e.nom, e.prenom
    `, semestre ? [classeId, matiereId, semestre] : [classeId, matiereId]);
    
    console.log(`Notes trouvées: ${notes.length}`);
    res.json(notes);
  } catch (error) {
    console.error('Erreur récupération notes par matière:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer toutes les notes d'une classe par semestre (CORRIGÉ)
route.get('/notes-classe/:classeId/semestre/:semestre', async (req, res) => {
  try {
    const { classeId, semestre } = req.params;
    
    const [notes] = await db.query(`
      SELECT 
        e.id as etudiant_id,
        e.nom,
        e.prenom,
        m.id_matiere,
        m.nom_matiere,
        m.coefficient,
        m.semestre,
        COALESCE(n.note_ds, 0) as note_ds,
        COALESCE(n.note_examen, 0) as note_examen,
        ROUND(COALESCE(n.note_ds * 0.3 + n.note_examen * 0.7, 0), 2) as moyenne
      FROM etudiant e
      JOIN inscription i ON e.id = i.etudiant_id
      CROSS JOIN matiere m
      LEFT JOIN note n ON e.id = n.etudiant_id 
        AND n.matiere_id = m.id_matiere 
        AND n.semestre = m.semestre
        AND n.annee_scolaire = '2025-2026'
      WHERE i.classe_id = ? 
        AND i.annee_scolaire = '2025-2026'
        AND m.semestre = ?
      ORDER BY e.nom, e.prenom, m.nom_matiere
    `, [classeId, semestre]);
    
    console.log(`Notes semestre trouvées: ${notes.length}`);
    res.json(notes);
  } catch (error) {
    console.error('Erreur récupération notes semestre:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une note (CORRIGÉ pour votre structure)
route.put('/notes/update', async (req, res) => {
  try {
    const { etudiant_id, matiere_id, semestre, note_ds, note_examen } = req.body;
    
    // Validation
    if (!etudiant_id || !matiere_id || !semestre) {
      return res.status(400).json({ error: 'Données manquantes' });
    }
    
    if (note_ds < 0 || note_ds > 20 || note_examen < 0 || note_examen > 20) {
      return res.status(400).json({ error: 'Les notes doivent être entre 0 et 20' });
    }
    
    // Vérifier si la note existe déjà
    const [existing] = await db.query(`
      SELECT id_note FROM note 
      WHERE etudiant_id = ? 
        AND matiere_id = ? 
        AND semestre = ?
        AND annee_scolaire = '2025-2026'
    `, [etudiant_id, matiere_id, semestre]);
    
    if (existing.length > 0) {
      // Mise à jour
      await db.query(`
        UPDATE note 
        SET note_ds = ?, note_examen = ?
        WHERE etudiant_id = ? 
          AND matiere_id = ? 
          AND semestre = ?
          AND annee_scolaire = '2025-2026'
      `, [note_ds, note_examen, etudiant_id, matiere_id, semestre]);
      
      console.log(`Note mise à jour: étudiant ${etudiant_id}, matière ${matiere_id}`);
    } else {
      // Insertion
      await db.query(`
        INSERT INTO note (etudiant_id, matiere_id, semestre, note_ds, note_examen, annee_scolaire)
        VALUES (?, ?, ?, ?, ?, '2025-2026')
      `, [etudiant_id, matiere_id, semestre, note_ds, note_examen]);
      
      console.log(`Note insérée: étudiant ${etudiant_id}, matière ${matiere_id}`);
    }
    
    res.json({ success: true, message: 'Note mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour note:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route de débogage pour vérifier la structure
route.get('/debug/check-structure', async (req, res) => {
  try {
    const [classes] = await db.query('SELECT COUNT(*) as count FROM classe');
    const [etudiants] = await db.query('SELECT COUNT(*) as count FROM etudiant');
    const [matieres] = await db.query('SELECT COUNT(*) as count FROM matiere');
    const [notes] = await db.query('SELECT COUNT(*) as count FROM note');
    const [inscriptions] = await db.query('SELECT COUNT(*) as count FROM inscription');
    
    // Vérifier si la table programme existe
    let programme = { count: 0 };
    try {
      const [prog] = await db.query('SELECT COUNT(*) as count FROM programme');
      programme = prog[0];
    } catch (e) {
      programme = { count: 'Table inexistante' };
    }
    
    res.json({
      classes: classes[0].count,
      etudiants: etudiants[0].count,
      matieres: matieres[0].count,
      notes: notes[0].count,
      inscriptions: inscriptions[0].count,
      programme: programme.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

route.get('/absences/classes', async (req, res) => {
  try {
    const dateParam = req.query.date || null;
    const dateCondition = dateParam ? `DATE(p.date_sceance) = ?` : `DATE(p.date_sceance) = CURDATE()`;
    
    // Étape 1: TOUTES les classes avec stats (0 absences inclus)
    const [classesData] = await db.query(`
      SELECT 
        c.id_classe, c.nom_classe, c.niveau,
        COALESCE(COUNT(CASE WHEN p.statut IN ('absent', 'retard') THEN 1 END), 0) as total_absences,
        COALESCE(SUM(CASE WHEN p.statut IN ('absent', 'retard') THEN 60 ELSE 0 END), 0) as total_heures
      FROM classe c
      JOIN inscription i ON c.id_classe = i.classe_id AND i.annee_scolaire = '2025-2026'
      LEFT JOIN etudiant e ON i.etudiant_id = e.id
      LEFT JOIN presences p ON e.id = p.etudiant_id 
        AND ${dateCondition}
        AND p.statut IN ('absent', 'retard')
      GROUP BY c.id_classe, c.nom_classe, c.niveau
      ORDER BY total_absences DESC, c.nom_classe
    `, dateParam ? [dateParam] : []);

    // Étape 2: Absences détaillées par classe
    const result = [];
    for (const classe of classesData) {
      const [absences] = await db.query(`
        SELECT 
          p.id as id_absence,
          e.id as etudiant_id,
          e.nom, e.prenom,
          c.nom_classe,
          DATE(p.date_sceance) as date_absence,
          TIME(p.date_saisie) as heure,
          COALESCE(p.remarque, p.statut) as motif,
          (p.statut = 'justifie') as justifiee,
          60 as duree
        FROM presences p
        JOIN etudiant e ON p.etudiant_id = e.id
        JOIN inscription i ON e.id = i.etudiant_id AND i.annee_scolaire = '2025-2026'
        JOIN classe c ON i.classe_id = c.id_classe
        WHERE c.id_classe = ? 
          AND ${dateCondition}
          AND p.statut IN ('absent', 'retard')
        ORDER BY e.nom, e.prenom
      `, [classe.id_classe, ...(dateParam ? [dateParam] : [])]);

      result.push({
        id_classe: classe.id_classe,
        nom_classe: classe.nom_classe,
        niveau: classe.niveau,
        total_absences: classe.total_absences,
        total_heures: classe.total_heures,
        absences: absences
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Erreur absences:', error);
    res.status(500).json({ error: error.message });
  }
});



module.exports=route;
