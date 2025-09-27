//pega os serviços que vão ser usados
const { createProblemDB, getProblemsDB, voteProblemDB } =  require("../services/problemService.js");

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

async function getProblems(req, res) {
    try {
        const problems = await getProblemsDB(); //linha responsável por montar o problema no bd
        res.status(201).json(problems);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function voteProblem(req, res) {
    try {
        const { problemId, status } = req.body;
        const uid = req.user.uid;
        const vote = await voteProblemDB(problemId, uid, status);
        res.status(201).json(vote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

//export dos modulos
module.exports = { createProblem, getProblems, voteProblem };