const mongoose = require("mongoose");
const { Schema } = mongoose;

const MetricsSnapshotSchema = new Schema({
    dateGenerated: {
        type: Date,
        default: Date.now
    },
    analystName: String,  
    referenceMonth: Number,
    // Backlog
    backlog: {
        ongoing: Number,
        superior30d: Number,
        percentSuperior: Number,
        percentSquad: Number,
        percentTime: Number
    },
    // Capacity
    capacity: {
        capacidadeNaoEncontrada: Boolean,
        novos: Number,
        resolvidos: Number,
        diferencaCapacidade: Number,
        porcentagemCapacidade: Number,
        porcentagemSquad: Number,
        porcentagemOwnerEmRelacaoEquipe: Number
    },
    // First Response
    firstResponse: {
        averageFirstResponseTimeInSeconds: Number,
        averageFirstResponseTimeFormatted: String,
        differenceFromPreviousMonthInSeconds: Number,
        differenceFromPreviousMonthFormatted: String
    },
    // Open 24h
    open24h: {
        countTicketsOpenBeyond24WorkingHours: Number,
        ticketIdsOpenBeyond24WorkingHours: [String] // assumindo que são IDs em formato de string
    },
    // Reopen
    reopen: {
        analystReopenedCount: Number,
        teamReopenedCount: Number
    },
    // Response
    response: {
        nps: {
          satisfaction: Number,
          responsesCount: Number
        },
        solutionQuality: {
          satisfaction: Number,
          responsesCount: Number
        },
        solutionTime: {
          satisfaction: Number,
          responsesCount: Number
        }},
    // Solution Time
    solutionTime: {
        averageSolutionTimeInDays: Number,
        averageSolutionTimeInWorkingHours: String,
        differenceFromPreviousMonthInDays: Number
    },
    // Tramites
    tramites: {
        duvida: {
            mediaReal: Number,
            desvioPadrao: Number
        },
        problema: {
            mediaReal: Number,
            desvioPadrao: Number
        },
        tarefa: {
            mediaReal: Number,
            desvioPadrao: Number
        }
    } 
}, { timestamps: true });

const MetricsSnapshot = mongoose.model('MetricsSnapshot', MetricsSnapshotSchema);

module.exports = MetricsSnapshot;
