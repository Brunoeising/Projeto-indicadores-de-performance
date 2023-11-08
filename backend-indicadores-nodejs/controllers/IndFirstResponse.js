const Ticket = require('../models/TicketModel');

exports.getAverageFirstResponseTime = async (req, res) => {
    try {
        const { startDate, endDate, ownerBusinessName } = req.query;
        const ownerBusinessNames = Array.isArray(ownerBusinessName)
            ? ownerBusinessName.map(decodeURIComponent)
            : [decodeURIComponent(ownerBusinessName)];
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        const previousMonthStart = new Date(startDateTime);
        previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
        const previousMonthEnd = new Date(endDateTime);
        previousMonthEnd.setMonth(previousMonthEnd.getMonth() - 1);
        
        // Corrigido para usar os parâmetros de início e fim corretos
        const getAverageResponseTimeForPeriod = async (start, end, ownerNames) => {
            const tickets = await Ticket.find({
                'owner.businessName': { $in: ownerNames },
                'statusHistories': {
                    $elemMatch: {
                        status: 'Novo',
                        'changedDate': { $gte: start, $lte: end }
                    }
                },
                'statusHistories.status': { $ne: 'Cancelado' } 
            });

            let totalFirstResponseTime = 0;
            let countTicketsWithResponse = 0;
            for (const ticket of tickets) {
                const newStatusEntry = ticket.statusHistories.find(entry => entry.status === "Novo");
                if (newStatusEntry) {
                    // Garantir que o valor está em segundos
                    const responseTimeInSeconds = newStatusEntry.permanencyTimeFullTime;
                    totalFirstResponseTime += responseTimeInSeconds;
                    countTicketsWithResponse++;
                }
            }

            return countTicketsWithResponse ? totalFirstResponseTime / countTicketsWithResponse : 0;
        };

        const currentMonthAverage = await getAverageResponseTimeForPeriod(startDateTime, endDateTime, ownerBusinessNames);
        const previousMonthAverage = await getAverageResponseTimeForPeriod(previousMonthStart, previousMonthEnd, ownerBusinessNames);
        const differenceInSeconds = currentMonthAverage - previousMonthAverage;

        const formatTime = (timeInSeconds) => {
            const hours = Math.floor(timeInSeconds / 3600);
            const minutes = Math.floor((timeInSeconds % 3600) / 60);
            const seconds = timeInSeconds % 60;
            return `${hours}h ${minutes}m ${seconds}s`;
        };

        const metricsData = {
            averageFirstResponseTimeInSeconds: currentMonthAverage,
            averageFirstResponseTimeFormatted: formatTime(currentMonthAverage),
            differenceFromPreviousMonthInSeconds: differenceInSeconds,
            differenceFromPreviousMonthFormatted: formatTime(differenceInSeconds)
        };

        if (res) {
            res.json(metricsData);
        } else {
            return metricsData;
        }

    } catch (error) {
        console.error("Erro ao buscar a média do tempo da primeira resposta e sua comparação com o mês anterior:", error);
        const errorResponse = {
            success: false,
            message: "Erro interno do servidor.",
            error: error.message
        };

        if (res) {
            res.status(500).json(errorResponse);
        } else {
            throw errorResponse;
        }
    }
};
