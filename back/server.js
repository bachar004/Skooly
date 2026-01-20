const express = require("express");
const app = express();
const env = require("dotenv").config();
const cors = require("cors");
const path = require("path");
const adminroute = require("./routes/adminroute");
const etudiantroute = require("./routes/etudiantroute");
const profroute=require("./routes/profroute");
const courroute=require("./routes/coursrouter")

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/admin", adminroute);
app.use("/api/etudiant", etudiantroute);
app.use("/api/prof", profroute);
app.use("/api/cours", courroute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listen on http://localhost:${PORT}`);
});
