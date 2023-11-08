const Ticket = require('../models/TicketModel');
const SurveyResponse = require('../models/ResponseModel');

exports.getCustomerSatisfactionMetrics = async (req, res) => {
    try {
        const { startDate, endDate, ownerBusinessName } = req.query;
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        const ownerBusinessNames = Array.isArray(req.query.ownerBusinessName)
            ? req.query.ownerBusinessName.map(decodeURIComponent)
            : [decodeURIComponent(req.query.ownerBusinessName)];

        // Busca inicial no banco de dados com lógica aprimorada
        const ticketsResolvidosRaw = await Ticket.find({
            'owner.businessName': { $in: ownerBusinessNames },
            'statusHistories': {
                $elemMatch: {
                    status: 'Resolvido',
                    'changedDate': { $gte: startDateTime, $lte: endDateTime }
                }
            },
            'statusHistories.status': { $ne: 'Cancelado' },
            'resolvedIn': { $ne: null }
        }).lean();

        // Filtragem adicional para garantir a última data de resolução dentro do intervalo
        const ticketsResolvidos = ticketsResolvidosRaw.filter(ticket => {
            const resolvedHistories = ticket.statusHistories
                .filter(history => history.status === 'Resolvido')
                .map(history => new Date(history.changedDate))
                .sort((a, b) => b - a);
            if (resolvedHistories.length === 0) {
                return false;
            }
            const lastResolutionDate = resolvedHistories[0];
            return (lastResolutionDate >= startDateTime && lastResolutionDate <= endDateTime);
        });

        // Obtendo os IDs dos tickets resolvidos
        const ticketIds = ticketsResolvidos.map(ticket => ticket.id);

        // Buscar as respostas da pesquisa com base nos tickets resolvidos
        const surveyResponses = await SurveyResponse.find({
            ticketId: { $in: ticketIds }
        });

        const calculateSatisfaction = (responses, questionId) => {
            const filteredResponses = responses.filter(response => response.questionId === questionId);
            const totalResponses = filteredResponses.length;
            const totalScore = filteredResponses.reduce((acc, curr) => acc + curr.value, 0);

            return {
                satisfaction: totalResponses ? (totalScore / totalResponses) * 10 : 0,
                responsesCount: totalResponses
            };
        };

        const metrics = {
            nps: calculateSatisfaction(surveyResponses, "YgZj"),
            solutionQuality: calculateSatisfaction(surveyResponses, "r5Vn"),
            solutionTime: calculateSatisfaction(surveyResponses, "B07n")
        };

        // Se 'res' for fornecido, envie a resposta via HTTP; caso contrário, retorne os dados diretamente
        if (res) {
            res.json(metrics);
        } else {
            return metrics;
        }

    } catch (error) {
        console.error("Erro ao buscar métricas de satisfação do cliente:", error);
        if (res) {
            res.status(500).json({
                success: false,
                message: "Erro interno do servidor.",
                error: error.message
            });
        } else {
            throw error;
        }
    }
};
