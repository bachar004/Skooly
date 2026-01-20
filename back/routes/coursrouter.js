const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/connexion');

const router = express.Router();

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/cours';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|jpg|jpeg|png|gif|mp4|mp3|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ============================================
// ROUTES POUR LES PROFESSEURS
// ============================================

// Récupérer les matières enseignées par un professeur
router.get('/prof/:profId/matieres', async (req, res) => {
  try {
    const { profId } = req.params;
    
    const [matieres] = await db.query(`
      SELECT DISTINCT 
        m.id_matiere,
        m.nom_matiere,
        m.coefficient,
        m.semestre,
        c.id_classe,
        c.nom_classe,
        c.niveau
      FROM matiere m
      JOIN programme p ON m.id_matiere = p.matiere_id
      JOIN classe c ON p.classe_id = c.id_classe
      JOIN sceance s ON s.matiere_id = m.id_matiere AND s.classe_id = c.id_classe
      WHERE s.prof_id = ?
      ORDER BY m.nom_matiere, c.nom_classe
    `, [profId]);
    
    res.json(matieres);
  } catch (error) {
    console.error('Erreur récupération matières prof:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer tous les cours d'un professeur
router.get('/prof/:profId/cours', async (req, res) => {
  try {
    const { profId } = req.params;
    const { matiere_id, classe_id, semestre } = req.query;
    
    let query = `
      SELECT 
        c.*,
        m.nom_matiere,
        cl.nom_classe,
        COUNT(DISTINCT dc.id_document) as nb_documents
      FROM cours c
      JOIN matiere m ON c.matiere_id = m.id_matiere
      JOIN classe cl ON c.classe_id = cl.id_classe
      LEFT JOIN document_cours dc ON c.id_cours = dc.cours_id
      WHERE c.prof_id = ?
    `;
    
    const params = [profId];
    
    if (matiere_id) {
      query += ' AND c.matiere_id = ?';
      params.push(matiere_id);
    }
    if (classe_id) {
      query += ' AND c.classe_id = ?';
      params.push(classe_id);
    }
    if (semestre) {
      query += ' AND c.semestre = ?';
      params.push(semestre);
    }
    
    query += ' GROUP BY c.id_cours ORDER BY c.date_creation DESC';
    
    const [cours] = await db.query(query, params);
    res.json(cours);
  } catch (error) {
    console.error('Erreur récupération cours:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un cours spécifique avec ses documents
router.get('/cours/:coursId', async (req, res) => {
  try {
    const { coursId } = req.params;
    
    const [cours] = await db.query(`
      SELECT 
        c.*,
        m.nom_matiere,
        cl.nom_classe,
        CONCAT(p.nom, ' ', p.prenom) as prof_nom
      FROM cours c
      JOIN matiere m ON c.matiere_id = m.id_matiere
      JOIN classe cl ON c.classe_id = cl.id_classe
      JOIN prof p ON c.prof_id = p.id
      WHERE c.id_cours = ?
    `, [coursId]);
    
    if (cours.length === 0) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }
    
    const [documents] = await db.query(`
      SELECT * FROM document_cours 
      WHERE cours_id = ? 
      ORDER BY date_upload DESC
    `, [coursId]);
    
    res.json({
      ...cours[0],
      documents: documents
    });
  } catch (error) {
    console.error('Erreur récupération cours:', error);
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouveau cours
router.post('/cours', async (req, res) => {
  try {
    const { 
      titre, 
      description, 
      matiere_id, 
      prof_id, 
      classe_id, 
      semestre, 
      statut = 'brouillon',
      ordre = 0 
    } = req.body;
    
    // Convertir semestre si nécessaire
    const semestreInt = semestre === 'S1' ? 1 : (semestre === 'S2' ? 2 : parseInt(semestre));
    
    if (!titre || !matiere_id || !prof_id || !classe_id || !semestre) {
      return res.status(400).json({ error: 'Données manquantes' });
    }
    
    const [result] = await db.query(`
      INSERT INTO cours (titre, description, matiere_id, prof_id, classe_id, semestre, statut, ordre, annee_scolaire)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, '2025-2026')
    `, [titre, description, matiere_id, prof_id, classe_id, semestreInt, statut, ordre]);
    
    res.json({ 
      success: true, 
      id_cours: result.insertId,
      message: 'Cours créé avec succès' 
    });
  } catch (error) {
    console.error('Erreur création cours:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un cours
router.put('/cours/:coursId', async (req, res) => {
  try {
    const { coursId } = req.params;
    const { titre, description, statut, ordre } = req.body;
    
    await db.query(`
      UPDATE cours 
      SET titre = ?, description = ?, statut = ?, ordre = ?, date_modification = CURRENT_TIMESTAMP
      WHERE id_cours = ?
    `, [titre, description, statut, ordre, coursId]);
    
    res.json({ success: true, message: 'Cours mis à jour' });
  } catch (error) {
    console.error('Erreur mise à jour cours:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un cours
router.delete('/cours/:coursId', async (req, res) => {
  try {
    const { coursId } = req.params;
    
    // Récupérer les documents pour les supprimer du serveur
    const [documents] = await db.query(
      'SELECT chemin_fichier FROM document_cours WHERE cours_id = ?',
      [coursId]
    );
    
    // Supprimer les fichiers physiques
    documents.forEach(doc => {
      if (fs.existsSync(doc.chemin_fichier)) {
        fs.unlinkSync(doc.chemin_fichier);
      }
    });
    
    // Supprimer les documents de la BDD
    await db.query('DELETE FROM document_cours WHERE cours_id = ?', [coursId]);
    
    // Supprimer le cours
    await db.query('DELETE FROM cours WHERE id_cours = ?', [coursId]);
    
    res.json({ success: true, message: 'Cours supprimé' });
  } catch (error) {
    console.error('Erreur suppression cours:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ROUTES POUR LES DOCUMENTS
// ============================================

// Upload de documents pour un cours
router.post('/cours/:coursId/documents', upload.array('files', 10), async (req, res) => {
  try {
    const { coursId } = req.params;
    const { description } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }
    
    const documents = [];
    
    for (const file of req.files) {
      const [result] = await db.query(`
        INSERT INTO document_cours 
        (cours_id, nom_fichier, nom_original, type_fichier, taille_fichier, chemin_fichier, description, telecharge_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `, [
        coursId,
        file.filename,
        file.originalname,
        file.mimetype,
        file.size,
        file.path,
        description || null
      ]);
      
      documents.push({
        id_document: result.insertId,
        nom_original: file.originalname,
        type_fichier: file.mimetype,
        taille_fichier: file.size
      });
    }
    
    res.json({ 
      success: true, 
      message: `${documents.length} document(s) uploadé(s)`,
      documents: documents
    });
  } catch (error) {
    console.error('Erreur upload documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Télécharger un document (professeur)
router.get('/documents/:documentId/download', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const [documents] = await db.query(
      'SELECT * FROM document_cours WHERE id_document = ?',
      [documentId]
    );
    
    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    const document = documents[0];
    
    // Télécharger le fichier
    res.download(document.chemin_fichier, document.nom_original);
  } catch (error) {
    console.error('Erreur téléchargement document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un document
router.delete('/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const [documents] = await db.query(
      'SELECT chemin_fichier FROM document_cours WHERE id_document = ?',
      [documentId]
    );
    
    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    // Supprimer le fichier physique
    if (fs.existsSync(documents[0].chemin_fichier)) {
      fs.unlinkSync(documents[0].chemin_fichier);
    }
    
    // Supprimer de la BDD
    await db.query('DELETE FROM document_cours WHERE id_document = ?', [documentId]);
    
    res.json({ success: true, message: 'Document supprimé' });
  } catch (error) {
    console.error('Erreur suppression document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Statistiques des documents d'un cours
router.get('/cours/:coursId/documents/stats', async (req, res) => {
  try {
    const { coursId } = req.params;
    
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_documents,
        SUM(taille_fichier) as taille_totale,
        SUM(telecharge_count) as total_telechargements
      FROM document_cours
      WHERE cours_id = ?
    `, [coursId]);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Erreur stats documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ROUTES POUR LES ÉTUDIANTS
// ============================================

// Récupérer tous les cours de la classe d'un étudiant
router.get('/etudiant/:etudiantId/cours', async (req, res) => {
  try {
    const { etudiantId } = req.params;
    const { matiere_id, semestre } = req.query;
    
    let query = `
      SELECT 
        c.id_cours,
        c.titre,
        c.description,
        c.date_creation,
        c.date_modification,
        c.ordre,
        m.nom_matiere,
        m.coefficient,
        m.semestre,
        CONCAT(p.nom, ' ', p.prenom) as prof_nom,
        COUNT(DISTINCT dc.id_document) as nb_documents
      FROM inscription i
      JOIN classe cl ON i.classe_id = cl.id_classe
      JOIN cours c ON c.classe_id = cl.id_classe
      JOIN matiere m ON c.matiere_id = m.id_matiere
      JOIN prof p ON c.prof_id = p.id
      LEFT JOIN document_cours dc ON c.id_cours = dc.cours_id
      WHERE i.etudiant_id = ?
        AND i.annee_scolaire = '2025-2026'
        AND c.statut = 'publié'
    `;
    
    const params = [etudiantId];
    
    if (matiere_id) {
      query += ' AND c.matiere_id = ?';
      params.push(matiere_id);
    }
    
    if (semestre) {
      query += ' AND c.semestre = ?';
      params.push(semestre);
    }
    
    query += ` 
      GROUP BY c.id_cours, c.titre, c.description, c.date_creation, 
               c.date_modification, c.ordre, m.nom_matiere, m.coefficient, 
               m.semestre, p.nom, p.prenom
      ORDER BY m.nom_matiere, c.ordre, c.date_creation DESC
    `;
    
    const [cours] = await db.query(query, params);
    
    res.json(cours);
  } catch (error) {
    console.error('Erreur récupération cours étudiant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les matières de la classe d'un étudiant
router.get('/etudiant/:etudiantId/matieres', async (req, res) => {
  try {
    const { etudiantId } = req.params;
    
    const [matieres] = await db.query(`
      SELECT 
        m.id_matiere,
        m.nom_matiere,
        m.coefficient,
        m.semestre,
        COUNT(DISTINCT c.id_cours) as nb_cours,
        COUNT(DISTINCT dc.id_document) as nb_documents,
        CONCAT(p.nom, ' ', p.prenom) as prof_nom
      FROM inscription i
      JOIN classe cl ON i.classe_id = cl.id_classe
      JOIN programme prog ON cl.id_classe = prog.classe_id
      JOIN matiere m ON prog.matiere_id = m.id_matiere
      LEFT JOIN cours c ON c.matiere_id = m.id_matiere 
        AND c.classe_id = cl.id_classe 
        AND c.statut = 'publié'
      LEFT JOIN document_cours dc ON c.id_cours = dc.cours_id
      LEFT JOIN sceance s ON s.matiere_id = m.id_matiere 
        AND s.classe_id = cl.id_classe
      LEFT JOIN prof p ON s.prof_id = p.id
      WHERE i.etudiant_id = ?
        AND i.annee_scolaire = '2025-2026'
      GROUP BY m.id_matiere, m.nom_matiere, m.coefficient, m.semestre, p.nom, p.prenom
      ORDER BY m.semestre, m.nom_matiere
    `, [etudiantId]);
    
    res.json(matieres);
  } catch (error) {
    console.error('Erreur récupération matières étudiant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les cours récents
router.get('/etudiant/:etudiantId/cours/recents', async (req, res) => {
  try {
    const { etudiantId } = req.params;
    
    const [cours] = await db.query(`
      SELECT 
        c.id_cours,
        c.titre,
        c.description,
        c.date_creation,
        m.nom_matiere,
        CONCAT(p.nom, ' ', p.prenom) as prof_nom,
        COUNT(DISTINCT dc.id_document) as nb_documents
      FROM inscription i
      JOIN classe cl ON i.classe_id = cl.id_classe
      JOIN cours c ON c.classe_id = cl.id_classe
      JOIN matiere m ON c.matiere_id = m.id_matiere
      JOIN prof p ON c.prof_id = p.id
      LEFT JOIN document_cours dc ON c.id_cours = dc.cours_id
      WHERE i.etudiant_id = ?
        AND i.annee_scolaire = '2025-2026'
        AND c.statut = 'publié'
      GROUP BY c.id_cours, c.titre, c.description, c.date_creation, 
               m.nom_matiere, p.nom, p.prenom
      ORDER BY c.date_creation DESC
      LIMIT 10
    `, [etudiantId]);
    
    res.json(cours);
  } catch (error) {
    console.error('Erreur cours récents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les détails d'un cours avec ses documents (étudiant)
router.get('/etudiant/:etudiantId/cours/:coursId', async (req, res) => {
  try {
    const { etudiantId, coursId } = req.params;
    
    // Vérifier l'accès
    const [access] = await db.query(`
      SELECT c.*
      FROM cours c
      JOIN inscription i ON c.classe_id = i.classe_id
      WHERE c.id_cours = ?
        AND i.etudiant_id = ?
        AND i.annee_scolaire = '2025-2026'
        AND c.statut = 'publié'
    `, [coursId, etudiantId]);
    
    if (access.length === 0) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    // Récupérer les détails
    const [cours] = await db.query(`
      SELECT 
        c.*,
        m.nom_matiere,
        m.coefficient,
        CONCAT(p.nom, ' ', p.prenom) as prof_nom,
        p.mail as prof_email,
        cl.nom_classe
      FROM cours c
      JOIN matiere m ON c.matiere_id = m.id_matiere
      JOIN prof p ON c.prof_id = p.id
      JOIN classe cl ON c.classe_id = cl.id_classe
      WHERE c.id_cours = ?
    `, [coursId]);
    
    // Récupérer les documents
    const [documents] = await db.query(`
      SELECT * FROM document_cours
      WHERE cours_id = ?
      ORDER BY date_upload DESC
    `, [coursId]);
    
    res.json({
      ...cours[0],
      documents: documents
    });
  } catch (error) {
    console.error('Erreur récupération détails cours:', error);
    res.status(500).json({ error: error.message });
  }
});

// Télécharger un document (étudiant)
router.get('/etudiant/:etudiantId/documents/:documentId/download', async (req, res) => {
  try {
    const { etudiantId, documentId } = req.params;
    
    // Vérifier l'accès
    const [access] = await db.query(`
      SELECT dc.*
      FROM document_cours dc
      JOIN cours c ON dc.cours_id = c.id_cours
      JOIN inscription i ON c.classe_id = i.classe_id
      WHERE dc.id_document = ?
        AND i.etudiant_id = ?
        AND i.annee_scolaire = '2025-2026'
        AND c.statut = 'publié'
    `, [documentId, etudiantId]);
    
    if (access.length === 0) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const document = access[0];
    
    // Incrémenter le compteur
    await db.query(`
      UPDATE document_cours 
      SET telecharge_count = telecharge_count + 1 
      WHERE id_document = ?
    `, [documentId]);
    
    // Télécharger le fichier
    res.download(document.chemin_fichier, document.nom_original);
  } catch (error) {
    console.error('Erreur téléchargement document étudiant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Statistiques pour un étudiant
router.get('/etudiant/:etudiantId/stats', async (req, res) => {
  try {
    const { etudiantId } = req.params;
    
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT c.id_cours) as total_cours_disponibles,
        COUNT(DISTINCT dc.id_document) as total_documents
      FROM inscription i
      JOIN classe cl ON i.classe_id = cl.id_classe
      JOIN cours c ON c.classe_id = cl.id_classe AND c.statut = 'publié'
      LEFT JOIN document_cours dc ON c.id_cours = dc.cours_id
      WHERE i.etudiant_id = ?
        AND i.annee_scolaire = '2025-2026'
    `, [etudiantId]);
    
    res.json({
      ...stats[0],
      cours_consultes: 0,
      documents_telecharges: 0,
      progression_moyenne: 0,
      temps_total_minutes: 0
    });
  } catch (error) {
    console.error('Erreur stats étudiant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rechercher dans les cours
router.get('/etudiant/:etudiantId/cours/search/:terme', async (req, res) => {
  try {
    const { etudiantId, terme } = req.params;
    
    const [results] = await db.query(`
      SELECT 
        c.id_cours,
        c.titre,
        c.description,
        m.nom_matiere,
        CONCAT(p.nom, ' ', p.prenom) as prof_nom,
        COUNT(DISTINCT dc.id_document) as nb_documents
      FROM inscription i
      JOIN classe cl ON i.classe_id = cl.id_classe
      JOIN cours c ON c.classe_id = cl.id_classe
      JOIN matiere m ON c.matiere_id = m.id_matiere
      JOIN prof p ON c.prof_id = p.id
      LEFT JOIN document_cours dc ON c.id_cours = dc.cours_id
      WHERE i.etudiant_id = ?
        AND i.annee_scolaire = '2025-2026'
        AND c.statut = 'publié'
        AND (
          c.titre LIKE ? 
          OR c.description LIKE ?
          OR m.nom_matiere LIKE ?
        )
      GROUP BY c.id_cours, c.titre, c.description, m.nom_matiere, p.nom, p.prenom
      ORDER BY c.date_creation DESC
      LIMIT 20
    `, [etudiantId, `%${terme}%`, `%${terme}%`, `%${terme}%`]);
    
    res.json(results);
  } catch (error) {
    console.error('Erreur recherche cours:', error);
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;