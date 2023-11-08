const Analistas = require('../models/AnalistasModel');
const Capacity = require('../models/CapacityModel');

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, peopleId, celular, imagem, codigoMovidesk, perfil } = req.body;
    
    // Verificar se o email já está em uso
    const existingUser = await Analistas.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso.' });
    }

    // Criar um novo usuário e salvar no banco de dados
    const user = new Analistas({ email, password, name, peopleId, celular, imagem, codigoMovidesk, perfil });
    await user.save();

    res.status(201).json({ message: 'Usuário criado com sucesso.', userId: user._id });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário.', details: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
    try {
      const users = await Analistas.find({}); // Buscar todos os usuários
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar todos os usuários.', details: error.message });
    }
  };
  

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Analistas.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário.', details: error.message });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedData = req.body;

    // Se a senha estiver sendo atualizada, hash a nova senha
    if (updatedData.password) {
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
  }
  
    const user = await Analistas.findByIdAndUpdate(userId, updatedData, { new: true });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário.', details: error.message });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    await Analistas.findByIdAndDelete(userId);
    res.status(200).json({ message: 'Usuário deletado com sucesso.' });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário.', details: error.message });
  }
};

exports.getUserCapacities = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Analistas.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const capacities = await Capacity.find({ analista: user.peopleId });
    res.status(200).json(capacities);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar capacidades do usuário.', details: error.message });
  }
};

