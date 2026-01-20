const db = require("../database/connexion");
const admin = {
    getadminbymail: async(mail)=>{
        const sql = "Select * From admin where mail = ?";
        const [row] = await db.query(sql,[mail]);
        if (! row[0]) return null;
        return row[0];
    },
    updateotp: async (mail, otp_crypt) => {
        const sql = "update admin set otp= ?, \`expires\` = DATE_ADD(NOW(), INTERVAL 5 MINUTE) where mail = ?";
        const [result] = await db.query(sql,[otp_crypt, mail]);
        return result.affectedRows;
    },
    clearotp: async (mail) => {
        const sql = `
            update admin set otp = null, expires = null where mail = ?`;
        const [result] = await db.query(sql,[mail]);
        return result.affectedRows;
    }
};
const etudiant={
    nbetudiant:async()=>{
        const sql=" select count(*) as nbetudiant from inscription where annee_scolaire='2025-2026' ";
        const nb = await db.query(sql);
        return nb;
    },
    findall: async()=>{
        const sql="Select * From etudiant";
        const [result] = await db.query(sql);
        return result;
    },
    findbyname: async(nom)=>{
        const sql="Select * From etudiant where nom = ?";
        const [result]= await db.query(sql,[nom]);
        return result;
    },
    add: async(data)=>{
        const sql="insert into etudiant (nom,prenom,date_naissance,mail,mdp) values (?,?,?,?,?)"
        const [result]= await db.query(sql,[data.nom,data.prenom,data.date_naissance,data.mail,data.mdp]);
        return result.insertId;
    },
    delete: async(id)=>{
        const sql="delete From etudiant where id = ?"
        const [result]= await db.query(sql,[id]);
        return result.affectedRows;
    },
    update: async(id,data)=>{
        const sql="update etudiant set mail= ?,nom = ?,prenom=?,date_naissance=? where id = ?"
        const [result]= await db.query(sql,[data.mail,data.nom,data.prenom,data.date_naissance,id]);
        return result.affectedRows;
    },
    nbetudparniveau:async()=>{
        const sql='select classe.niveau,count(*) as nb from  inscription,classe where inscription.classe_id=classe.id_classe group by classe.niveau';
        const [result]=await db.query(sql);
        return result;
    },

};
const prof={
nbprof:async()=>{
    const sql=" select count(*) as nbprof from prof";
    const nb = await db.query(sql);
    return nb;
},
allprof: async ()=>{
    const sql = "select * From prof limit 20"
    const [result]= await db.query(sql);
    return result;
},
profbyid:async(id)=>{
    sql="select * from prof where id=?";
    const [prof]=await db.query(sql,[id]);
    return prof;
},
profbychaine: async(ch)=>{
    const sql="select * From prof where lower(nom) like ? or lower(prenom) like ? or lower(mail) like ? or cin like ?";
    const like="%"+ch.toLowerCase()+"%";
    const [result]=await db.query(sql,[like,like,like,like]);
    return result;
},
addprof: async(data)=>{
    const sql = "insert into prof (nom,prenom,cin,ddn,mail,mdp) values (?,?,?,?,?,?)";
    const result = await db.query(sql,[data.nom,data.prenom,data.cin,data.ddn,data.mail,data.mdp]);
    return result.insertId;
},
updateprof: async (data,id)=>{
    const sql = "update prof set nom = ? , prenom=? , cin=? , ddn=? , mail=? where id= ? ";
    const result= await db.query(sql,[data.nom,data.prenom,data.cin,data.ddn,data.mail,id]);
    return result.affectedRows;
},
deleteprof: async (id)=>{
    const sql ="Delete from prof where id = ?" ;
    const result = await db.query(sql , [id]);
    return result.affectedRows;
},
profsceance: async (id)=>{
    const sql ="select count(*) as nbsceance from sceance where prof_id=? ";
    const [rows] = await db.query(sql,[id]);
    return rows;
}
};
const classe={
    nbclasse: async()=>{
        const sql=" select count(*) as nbclasse from classe";
        const nb=await db.query(sql);
        return nb;
    },
    Allclasses: async()=>{
        const sql = " select nom_classe as class,niveau,id_classe from classe order by niveau,specialite,nom_classe";
        const [classes]= await db.query(sql);
        return classes;
    },
    niv: async()=>{
        const sql="SELECT DISTINCT niveau FROM classe";
        const [nv]= await db.query(sql);
        return nv;
    },
    spec: async()=>{
        const sql="SELECT DISTINCT specialite FROM classe";
        const [specialite]= await db.query(sql);
        return specialite;
    },
    addclass: async(object)=>{
        const sql="insert into classe (niveau,specialite,nom_classe) values (?,?,?)";
        const [ajout] =await db.query(sql,[object.niv,object.spec,object.nom]);
        return ajout.insertId;
    },
    emploi: async(id)=>{
        const sql="select jour,heure_debut,heure_fin,salle,prof.nom as prof ,matiere.nom_matiere as matiere from sceance,matiere,prof where classe_id=? and matiere.id_matiere=sceance.matiere_id and prof.id=sceance.prof_id;"
        const [emploi]= await db.query(sql,[id]);
        return emploi;
    }
};
const inscription={
    etudiantbyclass:async(id_classe)=>{
        sql='select id,nom,prenom,date_naissance,mail,annee_scolaire,nom_classe from etudiant,inscription,classe  where inscription.etudiant_id=etudiant.id and inscription.classe_id=classe.id_classe and inscription.classe_id= ?';
        const [etudiants]=await db.query(sql,[id_classe]);
        return etudiants;
    },
    add:async(data)=>{
        sql="insert into inscription (etudiant_id,classe_id,annee_scolaire) values (?,?,?)";
        const add=await db.query(sql,[data.etudiant_id,data.classe_id,data.annee_scolaire]);
        return add[0].insertId;
    },
    delete:async(etudiant_id,classe_id)=>{
        sql="delete from inscription where etudiant_id=? and classe_id=? ";
        const res=await db.query(sql,[etudiant_id,classe_id]);
        return res.affectedRows;
    }
};
const matiere={
    allmatiere:async()=>{
        sql="select * from matiere"
        const [res]=await db.query(sql,[]);
        return res;
    }
}
module.exports={admin,etudiant,prof,classe,inscription,matiere};