const model=require("../../models/admin");
const nodemailer=require("nodemailer");
const bcrypt=require("bcrypt");
require("dotenv").config()

const affiche_prof= async(req,res)=>{
    try {
        const prof=await model.prof.allprof();
        return res.status(200).json(prof);
    } catch (error) {
        return res.status(500).json({"message":"erreur"});
    }
};
const recherche=async(req,res)=>{
    try {
        const prof=await model.prof.profbychaine(req.params.chaine);
        if(!prof[0]) return res.status(404).json({"message":"aucun prof"})
        return res.status(200).json(prof);
    } catch (error) {
        return res.status(500).json({"message":"erreur"});
    }
};
const ajout_prof=async(req,res)=>{
    try {
        const mdp=req.body.mdp;
        const mail =req.body.mail;
        req.body.mdp=await bcrypt.hash(req.body.mdp,parseInt(process.env.SALT))
        const id= await model.prof.addprof(req.body);
        const transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.MAIL,
                pass:process.env.MAIL_MDP
            }
        })
        await transporter.sendMail({
            from:process.env.MAIL,
            to:mail,
            subject:"Cordonnées pour accéder a votre espace prof Skooly ",
            html:`<p> votre login: ${mail}</p> <br> <p>votre mot de passe:${mdp}</p>`
        })
        return res.status(200).json({"message":"prof ajouté avec succées"});
    } catch (error) {
        return res.status(500).json(error.message);
    }
}
const getprofbyid=async(req,res)=>{
    try {
        const id=await model.prof.profbyid(req.params.id);
        return res.status(200).json(id);
    } catch (error) {
         return res.status(500).json(error.message);
    }
}
const majprof=async(req,res)=>{
    try {
        const rows=await model.prof.updateprof(req.body,req.params.id);
        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}
const sceance_prof=async(req,res)=>{
    try {
        const rows= await model.prof.profsceance(req.params.id);
        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}
const deleteprof=async(req,res)=>{
    try {
        const id= await model.prof.deleteprof(req.params.id);
        return res.status(200).json(id);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

module.exports={affiche_prof,recherche,ajout_prof,getprofbyid,majprof,sceance_prof,deleteprof};
