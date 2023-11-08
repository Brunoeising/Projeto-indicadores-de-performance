const ExecutionLog = require('../models/LogModel');

exports.logExecution = async (wasSuccessful, taskName, errorMessage = '') => {
    try {
        const log = new ExecutionLog({
            taskName: taskName,
            executionDate: new Date(),
            wasSuccessful: wasSuccessful,
            errorMessage: errorMessage
        });
        await log.save();
    } catch (err) {
        console.error('Erro ao salvar o log:', err);
    }
};

exports.getExecutionLogs = async (req, res) => {
    try {
        const logs = await ExecutionLog.find({}).sort({ executionDate: -1 }); // Ordena do mais recente para o mais antigo
        res.json(logs);
    } catch (err) {
        console.error('Erro ao buscar logs:', err);
        res.status(500).send('Erro ao buscar logs.');
    }
};
