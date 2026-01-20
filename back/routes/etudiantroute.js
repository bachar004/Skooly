const express = require("express");
const router = express.Router();
const etudiantcontroller = require("../controllers/etudiant/authentification");
const acceuilcontroller = require("../controllers/etudiant/acceuil");

const db = require("../database/connexion");

// Authentification
router.post("/login", etudiantcontroller.login);

// Informations étudiant
router.get("/cart/:id", acceuilcontroller.affiche);
router.get("/emploi/:id", acceuilcontroller.emploi);
router.get("/cours/:id", acceuilcontroller.cours);

// Absences et présences
router.get("/abscence", acceuilcontroller.absenceParJour);
router.get("/presences", acceuilcontroller.presencesParJour);

// ✅ Récupérer notifications de l'ÉTUDIANT (ses classes)
router.get('/:etudiantId/notifications', async (req, res) => {
  const { etudiantId } = req.params;
  
  try {
    const [notifications] = await db.query(`
      SELECT DISTINCT n.id, n.titre, n.message, n.type, 
             n.date_creation, n.lu, 
             GROUP_CONCAT(DISTINCT c.nom_classe SEPARATOR ', ') as classes_noms,
             p.nom as prof_nom
      FROM notifications n
      JOIN notifications_classes nc ON n.id = nc.notification_id
      JOIN inscription i ON nc.classe_id = i.classe_id
      JOIN classe c ON i.classe_id = c.id_classe
      LEFT JOIN prof p ON n.prof_id = p.id
      WHERE i.etudiant_id = ? 
      GROUP BY n.id, n.titre, n.message, n.type, n.date_creation, n.lu, p.nom
      ORDER BY n.date_creation DESC
      LIMIT 20
    `, [etudiantId]);
    
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Marquer lue (étudiant)
router.post('/:etudiantId/notifications/:notifId/lu', async (req, res) => {
  const { etudiantId, notifId } = req.params;
  
  // Vérifie que l'étudiant est dans une classe de cette notif
  const [check] = await db.query(`
    SELECT 1 FROM notifications_classes nc
    JOIN inscription i ON nc.classe_id = i.classe_id
    WHERE i.etudiant_id = ? AND nc.notification_id = ?
  `, [etudiantId, notifId]);
  
  if (check.length === 0) {
    return res.status(403).json({ error: 'Notification non autorisée' });
  }
  
  const [result] = await db.query(
    `UPDATE notifications n
     JOIN notifications_classes nc ON n.id = nc.notification_id
     JOIN inscription i ON nc.classe_id = i.classe_id
     SET n.lu = TRUE, n.date_lecture = CURRENT_TIMESTAMP
     WHERE i.etudiant_id = ? AND n.id = ?`,
    [etudiantId, notifId]
  );
  
  res.json({ success: result.affectedRows > 0 });
});

// ✅ Notes de l'étudiant par matière
router.get('/:etudiantId/notes', async (req, res) => {
  const { etudiantId } = req.params;
  
  try {
    const [notes] = await db.query(`
      SELECT 
        n.id_note,
        n.etudiant_id,
        n.matiere_id,
        m.nom_matiere,
        m.coefficient,
        m.semestre as semestre_matiere,
        n.note_ds,
        n.note_examen,
        COALESCE(n.note_ds * 0.3 + n.note_examen * 0.7, 0) as moyenne,
        n.semestre,
        n.annee_scolaire,
        c.nom_classe
      FROM note n
      JOIN matiere m ON n.matiere_id = m.id_matiere
      JOIN inscription i ON n.etudiant_id = i.etudiant_id 
        AND n.annee_scolaire = i.annee_scolaire
      JOIN classe c ON i.classe_id = c.id_classe
      JOIN programme p ON i.classe_id = p.classe_id 
        AND n.matiere_id = p.matiere_id
      WHERE n.etudiant_id = ?
        AND n.annee_scolaire = '2025-2026'
      ORDER BY n.semestre, m.nom_matiere
    `, [etudiantId]);
    
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;