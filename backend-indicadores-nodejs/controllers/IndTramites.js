const Ticket = require('../models/TicketModel');

exports.getTramitesMetrics = async (req, res) => {
    try {
        const { startDate, endDate, ownerBusinessName } = req.query;
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        const ownerBusinessNames = Array.isArray(req.query.ownerBusinessName)
            ? req.query.ownerBusinessName.map(decodeURIComponent)
            : [decodeURIComponent(req.query.ownerBusinessName)];

        // Busca inicial no banco de dados
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

        // Filtragem adicional
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

        const categorias = {
            "Dúvida": { tramites: [], ideal: 6 },
            "Problema": { tramites: [], ideal: 15 },
            "Tarefa": { tramites: [], ideal: 6 }
        };

        for (const ticket of ticketsResolvidos) {
            if ("actions" in ticket) {
                const tramites_count = ticket.actions.filter(action => action.type === 2 && !action.isDeleted).length;
                if (ticket.category in categorias) {
                    categorias[ticket.category].tramites.push(tramites_count);
                }
                console.log(`${ticket.id} ${ticket.category}  ${tramites_count}`);

            }
        }

        const results = {};
        for (const [categoria, data] of Object.entries(categorias)) {
            const mediaReal = data.tramites.length ? (data.tramites.reduce((a, b) => a + b, 0) / data.tramites.length) : 0;
            const varianca = data.tramites.reduce((acc, t) => acc + Math.pow(t - mediaReal, 2), 0) / (data.tramites.length - 1);
            const desvioPadrao = Math.sqrt(varianca);

            results[categoria] = {
                "Média real": mediaReal,
                "Desvio Padrão": desvioPadrao
            };
        }

        const metricsData = results;

        // Verificar se o objeto 'res' está disponível
        if (res) {
            res.json(metricsData);
        } else {
            // Retornar os dados diretamente se 'res' não estiver disponível
            return metricsData;
        }
    } catch (error) {
        console.error("Erro ao buscar métricas de trâmites:", error);

        const errorResponse = {
            message: "Erro ao buscar métricas de trâmites",
            error: error.message
        };

        if (res) {
            res.status(500).send(errorResponse);
        } else {
            // Lançar ou retornar o erro, dependendo de como deseja lidar com isso em outro contexto
            throw errorResponse;
        }
    }
};
