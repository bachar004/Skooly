const db = require("../database/connexion");

const prof={
        getprofbymail: async (mail) => {
            const sql = "SELECT * FROM prof WHERE mail = ?";
            const [row] = await db.query(sql, [mail]);
            if (!row[0]) return null;
            return row[0];
        },
        emploiDuTemps: async (id) => {
        const sql = `
            SELECT 
                s.id_sceance,
                s.jour,
                TIME_FORMAT(s.heure_debut, '%H:%i') as heure_debut,
                TIME_FORMAT(s.heure_fin, '%H:%i') as heure_fin,
                s.salle,
                s.annee_scolaire,
                c.id_classe,
                c.nom_classe,
                c.niveau,
                m.id_matiere,
                m.nom_matiere
            FROM sceance s
            JOIN classe c ON s.classe_id = c.id_classe
            JOIN matiere m ON s.matiere_id = m.id_matiere
            WHERE s.prof_id = ?
            ORDER BY 
                FIELD(s.jour, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'),
                s.heure_debut`;
        
        const [rows] = await db.query(sql, [id]);
        return rows;
    },
        mesClasses: async (id) => {
        const sql = `
            SELECT DISTINCT
                c.id_classe,
                c.nom_classe,
                c.niveau,
                s.annee_scolaire,
                COUNT(DISTINCT s.id_sceance) as nombre_seances,
                (SELECT COUNT(*) FROM inscription WHERE classe_id = c.id_classe AND annee_scolaire = s.annee_scolaire) as nombre_etudiants
            FROM sceance s
            JOIN classe c ON s.classe_id = c.id_classe
            WHERE s.prof_id = ?
            GROUP BY c.id_classe, c.nom_classe, c.niveau, s.annee_scolaire
            ORDER BY c.nom_classe`;
        
        const [rows] = await db.query(sql, [id]);
        return rows;
    },
        mesMatieres: async (profId) => {
        const sql = `
            SELECT DISTINCT
                m.id_matiere,
                m.nom_matiere,
                COUNT(DISTINCT s.id_sceance) as nombre_seances,
                COUNT(DISTINCT s.classe_id) as nombre_classes
            FROM sceance s
            JOIN matiere m ON s.matiere_id = m.id_matiere
            WHERE s.prof_id = ?
            GROUP BY m.id_matiere, m.nom_matiere
            ORDER BY m.nom_matiere`;
        
        const [rows] = await db.query(sql, [profId]);
        return rows;
    },
        listeappel:async(seanceId, date, profId)=>{
    const sql = `
    SELECT 
      e.id as id_etudiant,
      e.nom,
      e.prenom,
      e.date_naissance,
      c.id as id_classe,
      c.nom as nom_classe,
      s.id as id_sceance,
      s.jour,
      s.heure_debut,
      s.heure_fin,
      s.salle,
      m.nom as nom_matiere,
      p.id as id_presence,
      p.statut,
      p.remarque,
      p.date_saisie
    FROM sceances s
    JOIN classes c ON s.classe_id = c.id
    JOIN matieres m ON s.matiere_id = m.id
    JOIN carte_etudiant ce ON c.id = ce.id_classe
    JOIN etudiants e ON ce.id_etudiant = e.id
    LEFT JOIN presences p ON (
      p.etudiant_id = e.id 
      AND p.sceance_id = s.id 
      AND DATE(p.date_sceance) = ?
    )
    WHERE s.id = ? AND s.prof_id = ?
    ORDER BY e.nom, e.prenom
  `;
    const [rows] = await db.query(sql, [seanceId, date, profId]);
    return rows;
    },

}

module.exports={prof}