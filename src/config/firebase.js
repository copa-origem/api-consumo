//imports das bibliotecas e funções a serem usadas
const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const path = require("path");

//monta o caminho absoluto até o JSON da chave
const serviceAccountPath = path.join(__dirname, "../../firebase-key.json");

//Lê o arquivo JSON e transforma ele em um objeto js
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

//caso o banco de dados não tenha sido iniciado
if (!admin.apps.length) {
    //ele inicializa com as credenciais
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
}

//obtém a instância do Firestore
const db = admin.firestore();

module.exports = db;