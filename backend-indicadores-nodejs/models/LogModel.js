const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema({
    taskName: String,           // Nome da tarefa (getTickets ou syncTickets)
    executionDate: Date,       // Data e hora da execução
    wasSuccessful: Boolean,    // Indica se a execução foi bem-sucedida ou não
    errorMessage: String       // Mensagem de erro (se houver)
});

const ExecutionLog = mongoose.model('ExecutionLog', executionLogSchema);

module.exports = ExecutionLog;
