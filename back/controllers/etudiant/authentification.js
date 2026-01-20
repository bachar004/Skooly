const model = require("../../models/etudiant");

const bcrypt= require("bcrypt");

const jwt = require("jsonwebtoken");

require("dotenv").config();


const login = async (req,res)=>{
    const {mail , mdp}=req.body;
    try {
        const etudian_data = await model.etudiant.getetudiantbymail(mail);
        if (!etudian_data) return res.status(404).json({"message": "Email invalide"});

        const mdp_valid = await bcrypt.compare(mdp,etudian_data.mdp);
        if(!mdp_valid) return res.status(401).json({"message": "Mot de passe invalide"});

        const token = jwt.sign({ id: etudian_data.id, mail: etudian_data.mail },process.env.SECRET_KEY)
        
        res.status(200).json({"message": "Connexion réussie","token": token});
       
    } catch (err) {
        res.status(500).json({"message":err.message});
    }
}

module.exports = {login};