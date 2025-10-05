require('dotenv').config();
//variáveis das bibliotecas 
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./src/routes/apiRoutes");

//atribuição do app ao express e a porta do servidor
const app = express();
const PORT = 5000;

//cors que possibilita a interação do frontend com o backend
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

//delimitação dos usos de como as requisições podem ir
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//uso das rotas
app.use("/", apiRoutes);

//servidor rodando
app.listen(PORT, () => console.log(`Servidor rodando em  http://localhost:${PORT}`));