const mongoose = require('mongoose');
const Person = require('./PersonModel');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const AnalistaSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  celular: {
    type: String,
    required: false
  },
  imagem: {
    type: String,
    required: false
  },
  codigoMovidesk: {
    type: String,
    required: false
  },
  perfil: {
    type: String,
    enum: ['administrador', 'padrão'],
    default: 'padrão'
  },
  codigo: {
    type: Number,
    required: false
  },
  peopleId: { 
    type: String,
   required: true 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
}, { timestamps: true });

AnalistaSchema.pre('save', async function (next) {
  if (!this.isNew) { // Se não for um novo documento, continue
    next();
    return;
  }
  const lastDoc = await this.constructor.findOne({}).sort('-cod');
  this.cod = lastDoc && lastDoc.cod ? lastDoc.cod + 1 : 1;
  next();
});

const Analista = mongoose.model('Analista', AnalistaSchema);
module.exports = Analista;
