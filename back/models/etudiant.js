const db = require("../database/connexion");

const etudiant = {
    getetudiantbymail: async (mail) => {
        const sql = "SELECT * FROM etudiant WHERE mail = ?";
        const [row] = await db.query(sql, [mail]);
        if (!row[0]) return null;
        return row[0];
    },

    carteetudiant: async (id) => {
        const sql = `
            SELECT 
                E.nom,
                E.prenom,
                E.date_naissance,
                C.nom_classe,
                C.id_classe,
                I.annee_scolaire 
            FROM etudiant AS E 
            JOIN inscription AS I ON E.id = I.etudiant_id
            JOIN classe AS C ON C.id_classe = I.classe_id
            WHERE E.id = ? 
            ORDER BY I.annee_scolaire DESC 
            LIMIT 1`;
        const [result] = await db.query(sql, [id]);
        return result[0];
    },

    emploi: async (id) => {
        const sql = `
            SELECT 
                s.id_sceance,
                s.jour,
                s.heure_debut,
                s.heure_fin,
                s.salle,
                prof.nom AS prof,
                prof.prenom AS prof_prenom,
                matiere.nom_matiere
            FROM sceance s
            JOIN matiere ON matiere.id_matiere = s.matiere_id
            JOIN prof ON prof.id = s.prof_id
            WHERE s.classe_id = ?
            ORDER BY 
                FIELD(s.jour, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'),
                s.heure_debut`;
        const [rows] = await db.query(sql, [id]);
        return rows;
    },

    matiere: async (id) => {
        const sql = `
            SELECT DISTINCT 
                matiere.nom_matiere AS matiere,
                prof.nom,
                prof.prenom  
            FROM sceance
            JOIN matiere ON matiere.id_matiere = sceance.matiere_id
            JOIN prof ON prof.id = sceance.prof_id
            JOIN classe AS C ON sceance.classe_id = C.id_classe
            JOIN inscription AS I ON C.id_classe = I.classe_id
            JOIN etudiant AS E ON E.id = I.etudiant_id
            WHERE E.id = ?`;
        const [row] = await db.query(sql, [id]);
        return row;
    },

    // CORRECTION PRINCIPALE : Retourne SEULEMENT les absences
    getAbsenceParJour: async (etudiantId, date) => {
        const sql = `
            SELECT 
                p.id AS id_absence,
                p.etudiant_id,
                p.sceance_id,
                p.date_sceance,
                p.statut,
                p.remarque,
                s.id_sceance,
                s.jour,
                s.heure_debut,
                s.heure_fin,
                s.salle,
                m.nom_matiere,
                prof.nom AS prof_nom,
                prof.prenom AS prof_prenom
            FROM presences p
            JOIN sceance s ON p.sceance_id = s.id_sceance
            JOIN matiere m ON s.matiere_id = m.id_matiere
            JOIN prof ON s.prof_id = prof.id
            WHERE p.etudiant_id = ? 
                AND DATE(p.date_sceance) = ?
                AND p.statut = 'absent'
            ORDER BY s.heure_debut`;

        const [rows] = await db.query(sql, [etudiantId, date]);
        return rows;
    },

    // NOUVELLE FONCTION : Retourne toutes les présences (utile pour voir tous les statuts)
    getPresencesParJour: async (etudiantId, date) => {
        const sql = `
            SELECT 
                p.id,
                p.etudiant_id,
                p.sceance_id,
                p.date_sceance,
                p.statut,
                p.remarque,
                s.id_sceance,
                s.jour,
                s.heure_debut,
                s.heure_fin,
                s.salle,
                m.nom_matiere,
                prof.nom AS prof_nom,
                prof.prenom AS prof_prenom
            FROM presences p
            JOIN sceance s ON p.sceance_id = s.id_sceance
            JOIN matiere m ON s.matiere_id = m.id_matiere
            JOIN prof ON s.prof_id = prof.id
            WHERE p.etudiant_id = ? 
                AND DATE(p.date_sceance) = ?
            ORDER BY s.heure_debut`;

        const [rows] = await db.query(sql, [etudiantId, date]);
        return rows;
    }
};

module.exports = { etudiant };