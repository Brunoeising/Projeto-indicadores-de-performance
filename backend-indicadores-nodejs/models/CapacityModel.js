const mongoose = require('mongoose');

const CapacitySchema = new mongoose.Schema({
  cod: {
    type: Number,
    required: false,
  },
  analista: {
    type: String,
    required: true,
  },
  squad: {
    type: String,
    required: false,
  },
  mes: {
    type: Number,
    required: true,
  },
  ano: {
    type: Number,
    required: true,
  },
  capacidadeMinima: {
    type: Number,
    required: true,
  },
  capacidadeMaxima: {
    type: Number,
    required: true,
  }
});
CapacitySchema.pre('save', async function (next) {
  if (!this.isNew) { // Se não for um novo documento, continue
    next();
    return;
  }
  const lastDoc = await this.constructor.findOne({}).sort('-cod');
  this.cod = lastDoc && lastDoc.cod ? lastDoc.cod + 1 : 1;
  next();
});

const Capacity = mongoose.model('Capacity', CapacitySchema);
module.exports = Capacity;
