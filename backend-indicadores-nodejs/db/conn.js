const mongoose = require("mongoose");
 async function main (){

    try {
        mongoose.set("strictQuery", true);
        await mongoose.connect;
    
        console.log('Conectado ao Banco de dados');

    } catch (error) {console.log('Erro: $(error)');

    }
 }

 module.exports = main;