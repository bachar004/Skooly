const model=require("../../models/admin");
const nodemailer=require("nodemailer");
const bcrypt=require("bcrypt")
require("dotenv").config();

const affiche_classe= async(req,res)=>{
    try {
        const classes= await model.classe.Allclasses();
        return  res.status(200).json(classes);
    } catch (error) {
        return res.status(500).json({"message d'erreur":error.message});
    }
};
const affiche_etudbyclass=async(req,res)=>{
    try {
        const etudiants=await model.inscription.etudiantbyclass(req.params.id);
        return res.status(200).json(etudiants)
    } catch (error) {
        return res.status(500).json({"message d'erreur":error.message})
    }
};
const aff_niv=async(req,res)=>{
    try {
        const niv=await model.classe.niv();
        return res.status(200).json(niv);
    } catch (error) {
        return res.status(500).json({"message d'erreur":error.message})
    }
};
const aff_spec=async(req,res)=>{
    try {
        const spec=await model.classe.spec();
        return res.status(200).json(spec);
    } catch (error) {
        return res.status(500).json({"message d'erreur":error.message})
    }
};
const ajout_class=async(req,res)=>{
    try {
        const id_ajout=await model.classe.addclass(req.body);
        return res.status(201).json(id_ajout);
    } catch (error) {
        return res.status(500).json({"message d'erreur":error.message})
    }
};
const emploi=async(req,res)=>{
    try {
        const emploi= await model.classe.emploi(req.params.id);
        return res.status(200).json(emploi);
    } catch (error) {
        return res.status(500).json({"message d'erreur":error.message})
    }
};
const ajout_etudiant_inscri=async(req,res)=>{
    try {
        const mdp=req.body.mdp;
        const mail =req.body.mail;
        req.body.mdp=await bcrypt.hash(req.body.mdp,parseInt(process.env.SALT))
        data=req.body
        const etud={
            nom:data.nom,
            prenom:data.prenom,
            date_naissance:data.date_naissance,
            mail:data.mail,
            mdp:data.mdp
        };
        const inscri={
            etudiant_id:"",
            classe_id:data.classe_id,
            annee_scolaire:data.annee_scolaire
        }
        const id_etud=await model.etudiant.add(etud);
        inscri.etudiant_id=id_etud;
        const id_inscri=await model.inscription.add(inscri);

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
            subject:"Cordonnées pour accéder a votre espace etudiant Skooly ",
            html:`<p> votre login: ${mail}</p> <br> <p>votre mot de passe:${mdp}</p>`
        })
        return res.status(201).json({"etud":id_etud,"inscr":id_inscri});
    } catch (error) {
        return res.status(500).json({"message d'erreur":error.message})
    }
};
const delete_etud_inscri=async(req,res)=>{
    try {
        const inscri=await model.inscription.delete(req.params.etudiant_id,req.params.classe_id);
        const etud=await model.etudiant.delete(req.params.etudiant_id);
        return res.status(200).json({"etud":etud,"inscr":inscri});
    } catch (error) {
        return res.status(500).json({"message d'erreur":error.message})
    }
};
const majetud=async(req,res)=>{
    try {
        const maj = await model.etudiant.update(req.params.id,req.body)
        if(maj===0){
            return res.status(404).json({"message":"etudiant n'existe pas"})
        }
        return res.status(200).json({"message":"etudiant modifié avec succéess"});
    } catch (error) {
        return res.status(500).json({"message d'erreur":error.message})
    }
}

module.exports={affiche_classe,affiche_etudbyclass,aff_niv,aff_spec,ajout_class,emploi,ajout_etudiant_inscri,delete_etud_inscri,majetud}