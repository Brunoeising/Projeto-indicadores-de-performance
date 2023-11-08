const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Conexão com o banco
const conn = require("./db/conn");
conn();

// Rota raiz
app.get("/", (req, res) => {
  res.send("Bem-vindo ao meu servidor!");
});

// Outras rotas
const routes = require("./routes/router");
app.use("/api", routes); 

app.listen(3002, function() {
  console.log("Servidor Online!");
});
