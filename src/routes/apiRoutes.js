//atribuição das bibliotecas as variáveis
const express = require("express");
const router = express.Router();
//funções das rotas
const { createProblem, getProblems, voteProblem, getProblematicas, deleteproblem } = require("../controllers/apiController.js");
const authenticate = require("../middlewares/authMiddleware.js");

//rotas da api
router.post("/create", createProblem);
router.get("/get", getProblems);
router.post("/vote", authenticate, voteProblem);
router.get("/getproblematicas", getProblematicas);
router.delete("/deleteproblem", deleteproblem)

//export das rotas
module.exports = router;