const model= require("../../models/prof")

const bcrypt= require("bcrypt");

const jwt = require("jsonwebtoken");

require("dotenv").config();


const login = async (req,res)=>{
    const {mail , mdp}=req.body;
    try {
        const prof_data = await model.prof.getprofbymail(mail);
        if (!prof_data) return res.status(404).json({"message": "Email invalide"});

        const mdp_valid = await bcrypt.compare(mdp,prof_data.mdp);
        if(!mdp_valid) return res.status(401).json({"message": "Mot de passe invalide"});

        const token = jwt.sign({ id: prof_data.id, mail: prof_data.mail },process.env.SECRET_KEY)
        
        res.status(200).json({"message": "Connexion réussie","token": token});
       
    } catch (err) {
        res.status(500).json({"message":err.message});
    }
}
const classe=async(req,res)=>{
    try {
        const rows=await model.prof.mesClasses(req.params.id);
        return res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({"message":error.message});
    }
}
const emploi=async(req,res)=>{
    try {
        const rows=await model.prof.emploiDuTemps(req.params.id);
        return res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({"message":error.message});
    }
}
const matieres=async(req,res)=>{
    try {
        const rows=await model.prof.mesMatieres(req.params.id);
        return res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({"message":error.message});
    }
}
module.exports={login,classe,emploi,matieres}