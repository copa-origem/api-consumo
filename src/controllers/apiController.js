//pega os serviços que vão ser usados
const { createProblemDB } =  require("../services/problemService.js");

// o que a rota vai executar quando for chamada, nesse caso criando o problema
async function createProblem(req, res) {
    try {
        const problem = await createProblemDB(req.body); //linha responsável por montar o problema no bd
        res.status(201).json(problem);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

//export dos modulos
module.exports = { createProblem };