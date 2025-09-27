const admin = require("firebase-admin");

//função que faz a verificação do token vindo do frontend
async function authenticate(req, res, next) {
    try {
        //variável que vai pegar o header
        const authHeader = req.headers.authorization || "";
        //variável que vai dividir o header em um array
        const match = authHeader.split(' ');

        //caso o header venha sem o token ele retorna o erro
        if (match.length !== 2) {
            return res.status(401).json({ error: 'token mal formatado' });
        }

        //pegamos o token
        const idToken = match[1];

        //decodificamos os dados do usuário verificando seu token
        const decoded = await admin.auth().verifyIdToken(idToken);
        //mandamos o uid e o email
        req.user = { uid: decoded.uid, email: decoded.email };
        //next para que o endpoint possa continuar
        next();
    } catch (err) {
        console.error("auth error", err);
        return res.status(401).json({ error: "invalid token" });
    }
}

module.exports = authenticate;