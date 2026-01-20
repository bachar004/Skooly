const model = require("../../models/admin");

const bcrypt= require("bcrypt");

const jwt = require("jsonwebtoken");

const dotenv = require("dotenv").config();

const nodemailer= require("nodemailer");

const generate_pwd=require("generate-password");


const login = async (req,res)=>{
    const {mail , mdp}=req.body;
    try {
        const admin_data = await model.admin.getadminbymail(mail);
        if (!admin_data) return res.status(404).json({"message": "Email invalide"});

        const mdp_valid = await bcrypt.compare(mdp,admin_data.mdp);
        if(!mdp_valid) return res.status(401).json({"message": "Mot de passe invalide"});

        const otp=Math.floor(100000+Math.random()*900000).toString();

        const otp_crypt=await bcrypt.hash(otp,10)

        await model.admin.updateotp(mail,otp_crypt)

        const trans=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.MAIL,
                pass:process.env.MAIL_MDP
            }
        })
        await trans.sendMail({
            from:process.env.MAIL,
            to:mail,
            subject:"Code de verification OTP",
            html:`<p> votre code est ${otp} qui est valable 5 mins</p> `
        })

        res.status(200).json({"message":"otp envoyé par mail"})        
    } catch (err) {
        res.status(500).json({"message":err.message});
    }
}
//generation mdp auto ki tji tzid compte etudiant
const password_auto=(req,res)=>{
    const password = generate_pwd.generate({
    length: 15,
    numbers: true,
    uppercase: true});
    return res.status(200).json({'mdp':password});
};
const verifotp=async(req,res)=>{
     const { mail, otp } = req.body;
     try {
        const admin_data = await model.admin.getadminbymail(mail);
        if (!admin_data) 
            return res.status(404).json({ "message": "Email invalide" });

        if (!admin_data.otp) 
            return res.status(400).json({ "message": "Aucun OTP trouvé, veuillez vous reconnecter" });

        if (new Date(admin_data.expires) < new Date())
            return res.status(410).json({ "message": "OTP expiré" });


        const otp_valid = await bcrypt.compare(otp, admin_data.otp);
        if (!otp_valid) 
            return res.status(401).json({ "message": "OTP incorrect" });

        const token = jwt.sign({ id: admin_data.id, mail: admin_data.mail },process.env.SECRET_KEY,{ expiresIn: "2h" });

        await model.admin.clearotp(mail);

        res.status(200).json({"message": "Connexion réussie","token": token});
     } catch (err) {
         res.status(500).json({"message":err.message});
     }
}
module.exports = {login,password_auto,verifotp};