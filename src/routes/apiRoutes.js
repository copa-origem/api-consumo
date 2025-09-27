//atribuição das bibliotecas as variáveis
const express = require("express");
const router = express.Router();
//funções das rotas
const { createProblem, getProblems, voteProblem } = require("../controllers/apiController.js");
const authenticate = require("../middlewares/authMiddleware.js");

//rotas da api
router.post("/create", createProblem);
router.get("/get", getProblems);
router.post("/vote", authenticate, voteProblem)

//export das rotas
module.exports = router;