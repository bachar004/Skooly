const model=require("../../models/admin");

//nb etud,prof et classes 
const affiche=async (req,res)=>{
    try{
        const nbetudiant= await model.etudiant.nbetudiant();
        const nbprof=await model.prof.nbprof();
        const nbclasse=await model.classe.nbclasse();
        return res.status(200).json({"nbetudiants":nbetudiant[0][0].nbetudiant,"nbprofs":nbprof[0][0].nbprof,"nbclasses":nbclasse[0][0].nbclasse});

    }catch(err){
        return res.status(500).send(err.message);
    }
}
//les pourcentage pour chaque niveau d'etud 
const peretud=async(req,res)=>{
    try {
        const nb_total=await model.etudiant.nbetudiant();
        const niveaux=await model.etudiant.nbetudparniveau();
        let l=[];
        for (let val of niveaux){
            l.push({per:((val.nb/nb_total[0][0].nbetudiant)*100).toFixed(2),niv:val.niveau});
        }
        return res.status(200).json(l);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
module.exports={affiche,peretud};