const Capacity = require('../models/CapacityModel');

exports.createCapacity = async (req, res) => {
  try {
    const { codOwner, analista, squad, mes, ano, capacidadeMinima, capacidadeMaxima } = req.body;
    const analistas = Array.isArray(analista) ? analista : [analista];
    let failedAnalistas = []; 
    for (let analistaName of analistas) {
      const existingCapacity = await Capacity.findOne({ analista: analistaName, mes, ano });
      if (existingCapacity) {
        failedAnalistas.push(analistaName);
        continue; 
      }
      const capacity = new Capacity({ codOwner, analista: analistaName, squad, mes, ano, capacidadeMinima, capacidadeMaxima });
      await capacity.save();
    }
    if (failedAnalistas.length) {
      return res.status(400).json({
        error: "Capacidade duplicada",
        message: `Já existe uma capacidade cadastrada para os analistas: ${failedAnalistas.join(', ')}.`
      });
    }
    res.status(201).json({ message: "Capacidades criadas com sucesso." });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao criar capacidade",
      message: "Ocorreu um erro ao tentar salvar os dados da capacidade no banco de dados.",
      details: error.message
    });
  }
};

exports.deleteAllCapacities = async (req, res) => {
  try {
    await Capacity.deleteMany({});
    res.status(200).json({
      message: "Todas as capacidades foram excluídas com sucesso."
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao excluir capacidades",
      message: "Ocorreu um erro ao tentar excluir as capacidades.",
      details: error.message
    });
  }
};

exports.deleteCapacityByCod = async (req, res) => {
  try {
    const { cod } = req.params; // Pegar o código da URL

    const result = await Capacity.findOneAndDelete({ cod });
    if (!result) {
      return res.status(404).json({
        error: "Capacidade não encontrada",
        message: `Não foi encontrada nenhuma capacidade com o código ${cod}.`
      });
    }

    res.status(200).json({
      message: `Capacidade com código ${cod} foi excluída com sucesso.`
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao excluir capacidade",
      message: "Ocorreu um erro ao tentar excluir a capacidade pelo código.",
      details: error.message
    });
  }
};

exports.updateCapacityByCod = async (req, res) => {
  try {
    const { cod } = req.params; // Pegar o código da URL
    const updateData = req.body;

    const result = await Capacity.findOneAndUpdate({ cod }, updateData, { new: true });
    if (!result) {
      return res.status(404).json({
        error: "Capacidade não encontrada",
        message: `Não foi encontrada nenhuma capacidade com o código ${cod}.`
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao atualizar capacidade",
      message: "Ocorreu um erro ao tentar atualizar a capacidade pelo código.",
      details: error.message
    });
  }
};

exports.getAllCapacities = async (req, res) => {
  try {
    const capacities = await Capacity.find({});
    res.status(200).json(capacities);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar capacidades",
      message: "Ocorreu um erro ao tentar buscar todas as capacidades.",
      details: error.message
    });
  }
};
exports.getCapacityByCod = async (req, res) => {
  try {
    const { cod } = req.params;
    const capacity = await Capacity.findOne({ cod });
    
    if (!capacity) {
      return res.status(404).json({
        error: "Capacidade não encontrada",
        message: `Não foi encontrada nenhuma capacidade com o código ${cod}.`
      });
    }

    res.status(200).json(capacity);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar capacidade",
      message: "Ocorreu um erro ao tentar buscar a capacidade pelo código.",
      details: error.message
    });
  }
};
exports.getCapacitiesByAnalista = async (req, res) => {
  try {
    const { analista } = req.params;
    const capacities = await Capacity.find({ analista });
    
    if (capacities.length === 0) {
      return res.status(404).json({
        error: "Capacidades não encontradas",
        message: `Não foram encontradas capacidades para o analista ${analista}.`
      });
    }

    res.status(200).json(capacities);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar capacidades",
      message: "Ocorreu um erro ao tentar buscar as capacidades pelo analista.",
      details: error.message
    });
  }
};
