const model = require("../../models/etudiant");

const affiche = async (req, res) => {
    try {
        const row = await model.etudiant.carteetudiant(req.params.id);
        if (!row) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
        }
        return res.status(200).json(row);
    } catch (error) {
        console.error('Erreur affiche:', error);
        return res.status(500).json({ message: error.message });
    }
};

const emploi = async (req, res) => {
    try {
        const rows = await model.etudiant.emploi(req.params.id);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Erreur emploi:', error);
        return res.status(500).json({ message: error.message });
    }
};

const cours = async (req, res) => {
    try {
        const row = await model.etudiant.matiere(req.params.id);
        return res.status(200).json(row);
    } catch (error) {
        console.error('Erreur cours:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Retourne SEULEMENT les absences (statut = 'absent')
const absenceParJour = async (req, res) => {
    try {
        const { etudiantId, date } = req.query;
        
        if (!etudiantId || !date) {
            return res.status(400).json({ 
                message: 'etudiantId et date sont requis' 
            });
        }

        console.log('Recherche absences pour:', { etudiantId, date });
        const data = await model.etudiant.getAbsenceParJour(etudiantId, date);
        console.log('Absences trouvées:', data.length);

        return res.status(200).json(data);

    } catch (error) {
        console.error('Erreur absenceParJour:', error);
        return res.status(500).json({ message: error.message });
    }
};

// OPTIONNEL : Retourne toutes les présences avec leurs statuts
const presencesParJour = async (req, res) => {
    try {
        const { etudiantId, date } = req.query;
        
        if (!etudiantId || !date) {
            return res.status(400).json({ 
                message: 'etudiantId et date sont requis' 
            });
        }

        console.log('Recherche présences pour:', { etudiantId, date });
        const data = await model.etudiant.getPresencesParJour(etudiantId, date);
        console.log('Présences trouvées:', data.length);

        return res.status(200).json(data);

    } catch (error) {
        console.error('Erreur presencesParJour:', error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    affiche, 
    emploi, 
    cours, 
    absenceParJour,
    presencesParJour 
};