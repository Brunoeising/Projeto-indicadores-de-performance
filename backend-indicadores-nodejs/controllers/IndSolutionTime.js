const Ticket = require('../models/TicketModel');

exports.getAverageSolutionTime = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const ownerBusinessNames = Array.isArray(req.query.ownerBusinessName)
            ? req.query.ownerBusinessName.map(decodeURIComponent)
            : [decodeURIComponent(req.query.ownerBusinessName)];
        const decodedOwnerName = ownerBusinessNames[0];
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        const previousMonthStart = new Date(startDateTime);
        previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
        const previousMonthEnd = new Date(endDateTime);
        previousMonthEnd.setMonth(previousMonthEnd.getMonth() - 1);

        const getAverageSolutionTimeForPeriod = async (start, end, ownerName) => {
            const tickets = await Ticket.find({
                'owner.businessName': { $in: ownerBusinessNames },
                createdDate: { $gte: start, $lte: end }
            });

            let totalSolutionTimeInSeconds = 0;
            let totalSolutionTimeInWorkingHours = 0;
            let countTicketsSolved = 0;

            for (const ticket of tickets) {
                const totalTime = ticket.statusHistories.reduce((acc, curr) => acc + (curr.permanencyTimeFullTime || 0), 0);
                const totalWorkingTime = ticket.statusHistories.reduce((acc, curr) => acc + (curr.permanencyTimeWorkingTime || 0), 0);
                const resolvedEntry = ticket.statusHistories.find(entry => entry.status === "Resolvido");
                if (resolvedEntry) {
                    totalSolutionTimeInSeconds += totalTime;
                    totalSolutionTimeInWorkingHours += totalWorkingTime;
                    countTicketsSolved++;
                }
            }

            return {
                averageTimeInSeconds: countTicketsSolved ? totalSolutionTimeInSeconds / countTicketsSolved : 0,
                averageTimeInWorkingHours: countTicketsSolved ? totalSolutionTimeInWorkingHours / countTicketsSolved : 0
            };
        };

        const currentMonthMetrics = await getAverageSolutionTimeForPeriod(startDateTime, endDateTime, decodedOwnerName);
        const previousMonthMetrics = await getAverageSolutionTimeForPeriod(previousMonthStart, previousMonthEnd, decodedOwnerName);
        const differenceInSeconds = currentMonthMetrics.averageTimeInSeconds - previousMonthMetrics.averageTimeInSeconds;
        const averageDays = currentMonthMetrics.averageTimeInSeconds / (24 * 3600);
        const hours_working = Math.floor(currentMonthMetrics.averageTimeInWorkingHours / 3600);
        const remainder_working = currentMonthMetrics.averageTimeInWorkingHours % 3600;
        const minutes_working = Math.floor(remainder_working / 60);
        const seconds_working = Math.floor(remainder_working % 60);
        const differenceInDays = (differenceInSeconds / (24 * 3600)).toFixed(2);

        const metricsData = {
            averageSolutionTimeInDays: averageDays.toFixed(2),
            averageSolutionTimeInWorkingHours: `${hours_working}:${minutes_working}:${seconds_working}`,
            differenceFromPreviousMonthInDays: differenceInDays
        };

        // Verifica se o objeto 'res' está disponível
        if (res) {
            res.json(metricsData);
        } else {
            // Retorna os dados diretamente se 'res' não estiver disponível
            return metricsData;
        }

    } catch (error) {
        console.error("Erro ao buscar o tempo médio de solução e sua comparação com o mês anterior:", error);
        const errorResponse = {
            success: false,
            message: "Erro interno do servidor.",
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