const model=require("../../models/admin");

const affichematiere=async(req,res)=>{
    try {
        const matiere= await model.matiere.allmatiere();
        return  res.status(200).json(matiere);
    } catch (error) {
        return res.status(500).json({"message d'erreur":error.message});
    }
}
module.exports={affichematiere}