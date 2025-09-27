require('dotenv').config();
const axios = require('axios');
const db = require("../config/firebase.js");
const { Timestamp } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const uuidv4 = require("uuid").v4;

//função que cria os problemas
async function createProblemDB(data) {
    //variáveis que virão da requisição
    const { type, description, lng, lat, image } = data;

    //caso uma imagem seja atribuída a problemática
    let imageUrl = "";
    if (image) {
        imageUrl = await generateUrlImage(image); //ele gera o url da imagem
    }

    //aqui são preparados todos os dados que serão enviados para o bd
    const problem = {
        type,
        description,
        lng,
        lat,
        imageUrl,
        createdAt: new Date(),
        votes_not_exists: 0,
        userVotes: []
    };

    //aqui os dados são de fato colocados no bd na coleção de problems
    const docRef = await db.collection("problems").add(problem);
    return { id: docRef.id, ...problem};
}

//função que vai gerar a url da imagem usando o cloudnary
async function generateUrlImage(imageBase64) {
    try {
        //pega a imagem que vai vir do frontend em base 64 e a prepara
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        //upa a imagem no cloudinary e extrai o url
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                file: `data:image/jpeg;base64,${base64Data}`, //envia a imagem
                upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET, //faz upload no preset certo
                public_id: `relatos/${uuidv4()}` //gera um link aleatório
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data' //cabeçalho necessário para reconhecer os dados vindo do .env
                }
            }
        );

        //retorna a url da imagem para ser amazenada no banco
        return response.data.secure_url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error.response?.data || error.message);
        throw new Error('Failed to upload image');
    }

};

// função que pega os problemas no firebase
async function getProblemsDB() {
    // variável que pega a coleção problems no banco de dados
    const snapshot = await db.collection("problems").get();

    //variável problems que vai se tornar um objeto de documentos da coleção problems com id
    const problems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));

    //variável para tratamento de dados expirados
    let expired_problems = [];

    //dia atual como parâmetro
    const today = new Date();

    //tratamento de problemas expirados
    problems.map(async (p, index) => {
        //pega a diferença dos dias em milisegundos
        const diffInMs = today - p.createdAt;

        //pega a diferença em dias
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        //se a problemática existir a 30 dias o problema é excluido
        if (diffInDays == 30) {
            expired_problems.push(index);
            await db.collection("problems").doc(p.id).delete();            
        }

        //se o problema já obtiver 3 votos de que ele não existe, o problema é excluido
        if (p.votes_not_exists == 3) {
            expired_problems.push(index);
            await db.collection("problems").doc(p.id).delete();
        }
    });

    //loop para tirar os problemas expirados do objeto de problems
    for (let i = 0; i < expired_problems.length; i++) {
        problems.splice(expired_problems[i]);
    }

    //retorna os problems
    return problems;
}

//função que vai gerenciar os votos
async function voteProblemDB(problemId, uid, status) {

    try {
        //consulta ao problema específico que foi votado
        const problemRef = db.collection("problems").doc(problemId);
        //pega a snapshot do problema referenciado
        const problemSnap = await problemRef.get();

        //caso  o problema não exista
        if (!problemSnap.exists) {
            return { message: "Problema não encontrado" }
        }

        //se o problema existir pega os dados dele
        const problemData = problemSnap.data();
        //faz a verificação pra saber se a pessoa já votou
        const alreadyVoted = (problemData.userVotes || []).includes(uid);

        //caso a pessoa já tenha votado ela retorna
        if (alreadyVoted) {
            return {message: "Você já votou nesse problema"};
        }

        //se o status do front for de voto para "exists"
        if (status == "exists") {
            //fazemos o update da data de criação para resetar o timing e adicionamos seu voto
            await problemRef.update({
                createdAt: Timestamp.fromDate(new Date()),
                userVotes: admin.firestore.FieldValue.arrayUnion(uid)
            });
        } else if (status == "not_exists") { //caso o voto seja para "not_exists"
            //fazemos o update dos votos para not_exists e adicionamos seu voto
            await problemRef.update({
                votes_not_exists: admin.firestore.FieldValue.increment(1),
                userVotes: admin.firestore.FieldValue.arrayUnion(uid)
            })
        } else {
            return {message: "Status não definido"}; //caso o status não seja definido
        }

        //mensagem de retorno de sucesso
        return {message: "Voto registrado com sucesso"};

    } catch (error) {
        console.error(error);
        return { error: "Erro interno no servidor" };

    }
}

//exports das funções
module.exports = { createProblemDB, getProblemsDB, voteProblemDB };