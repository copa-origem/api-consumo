//atribuição das bibliotecas as variáveis
const express = require("express");
const router = express.Router();
//funções das rotas
const { createProblem, getProblems } = require("../controllers/apiController.js");

//rota para criar o problema
router.post("/create", createProblem);
router.get("/get", getProblems);

//export das rotas
module.exports = router;