const Ticket = require('../models/TicketModel');
const { customFieldIdToNameMapping } = require('./config/config');

exports.getReopenedTicketsMetrics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const ownerBusinessNames = Array.isArray(req.query.ownerBusinessName)
        ? req.query.ownerBusinessName.map(decodeURIComponent)
        : [decodeURIComponent(req.query.ownerBusinessName)];
        const startDateTime = new Date(new Date(startDate).setUTCHours(0, 0, 0, 0));
        const endDateTime = new Date(new Date(endDate).setUTCHours(23, 59, 59, 999));
        const analystRelatedTickets = await Ticket.find({
            'owner.businessName': { $in: ownerBusinessNames },
            'statusHistories': {
                $elemMatch: {
                    status: { $in: ['Resolvido'] },
                    'changedDate': { $gte: startDate, $lte: endDate }
                }
            },
            'statusHistories.status': { $ne: 'Cancelado' },
            'resolvedIn': { $ne: null }
        });
        const teamRelatedTickets = await Ticket.find({
            'owner.team': 'OwnerTeam',
            'resolvedIn': { $gte: startDateTime, $lte: endDateTime },
            'baseStatus': { $in: ["Resolvido", "Closed", "Fechado"] }
        });

        let analystReopenedCount = 0;
        for (const ticket of analystRelatedTickets) {
            const reopeningReasonField = ticket.customFields.find(field => field.name === customFieldIdToNameMapping["77131"]);
            const hasReopeningReasonOtherThanValidated = reopeningReasonField && reopeningReasonField.value !== "Validado, está tudo certo, pode encerrar";
            if (hasReopeningReasonOtherThanValidated) {
                analystReopenedCount++;
                console.log(`Ticket reaberto (Analista): ${ticket.id}`); 
            }
        }
        let teamReopenedCount = 0;
        for (const ticket of teamRelatedTickets) {
            const reopeningReasonField = ticket.customFields.find(field => field.name === customFieldIdToNameMapping["77131"]);
            const hasReopeningReasonOtherThanValidated = reopeningReasonField && reopeningReasonField.value !== "Validado, está tudo certo, pode encerrar";
            if (hasReopeningReasonOtherThanValidated) {
                teamReopenedCount++;
                console.log(`Ticket reaberto (Equipe): ${ticket.id}`); 
            }
        }
        const metricsData = {
            success: true,
            data: {
                analystReopenedCount: analystReopenedCount,
                teamReopenedCount: teamReopenedCount
            }
        };

        // Verifica se o objeto 'res' está disponível
        if (res) {
            res.status(200).json(metricsData);
        } else {
            // Retorna os dados diretamente se 'res' não estiver disponível
            return metricsData;
        }

    } catch (error) {
        console.error('Error fetching reopened tickets:', error.message);
        const errorResponse = {
            success: false,
            error: error.message
        };

        if (res) {
            res.status(500).json(errorResponse);
        } else {
            // Lança ou retorna um erro, dependendo de como você deseja lidar com isso em outro contexto
            throw errorResponse;
        }
    }
};