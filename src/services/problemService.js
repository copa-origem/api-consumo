require('dotenv').config();
const axios = require('axios');
const db = require("../config/firebase.js");
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
        createAT: new Date(),
        votes: 0
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

async function getProblemsDB() {
    const snapshot = await db.collection("problems").get();

    const problems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));

    return problems;
}

//exports das funções
module.exports = { createProblemDB, getProblemsDB };