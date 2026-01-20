const db=require("mysql2");

require("dotenv").config();

const conn=db.createPool({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PWD,
    database:process.env.DB,
    waitForConnections: true,
    connectionLimit: 15,
});

module.exports=conn.promise();