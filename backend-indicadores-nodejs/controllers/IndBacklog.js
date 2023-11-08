const Ticket = require('../models/TicketModel');

exports.getBacklogMetrics = async (req, res) => {
    try {
        const { startDate, endDate, ownerBusinessName } = req.query;
        const ownerBusinessNames = Array.isArray(ownerBusinessName)
            ? ownerBusinessName.map(decodeURIComponent)
            : [decodeURIComponent(ownerBusinessName)];

        const ticketsWithHistory = await Ticket.find({
            'owner.businessName': { $in: ownerBusinessNames },
            'statusHistories': {
                $elemMatch: {
                    'changedDate': { $lte: endDate },
                    'status': { $nin: ["Resolvido", "Closed", "Fechado", "Cancelado", "Novo"] }
                }
            }
        }).lean();

        const ongoingTicketsOwner = ticketsWithHistory.filter(ticket => {
            const lastStatusBeforeEndDate = ticket.statusHistories
                .filter(history => new Date(history.changedDate) <= new Date(endDate))
                .sort((a, b) => new Date(b.changedDate) - new Date(a.changedDate))[0];

            // Verificar se o último status antes da endDate não é um dos status excluídos
            return lastStatusBeforeEndDate && !["Resolvido", "Closed", "Fechado", "Cancelado", "Novo"].includes(lastStatusBeforeEndDate.status);
        });
      //  console.log("IDs numéricos dos Tickets em andamento:", ongoingTicketsOwner.map(ticket => ticket.id));

        const filterOlderThan30Days = tickets => tickets.filter(ticket => {
            const creationHistory = ticket.statusHistories
                .find(history => history.status === 'Novo');

            if (!creationHistory) return false;

            const creationDate = creationHistory.changedDate;
            const daysDifference = (new Date(endDate) - new Date(creationDate)) / (1000 * 60 * 60 * 24);
            return daysDifference > 30;
        });


        const olderThan30Owner = filterOlderThan30Days(ongoingTicketsOwner);
       // console.log("IDs numéricos dos Tickets superiores a 30 dias:", olderThan30Owner.map(ticket => ticket.id));

        const percentOlderThan30Owner = ongoingTicketsOwner.length > 0
            ? (olderThan30Owner.length / ongoingTicketsOwner.length) * 100
            : 0;

        const squadTicketsOwner = olderThan30Owner.filter(ticket => ticket.customFields.some(field => field.name === "Squad"));
        const percentSquadOwner = olderThan30Owner.length > 0
            ? (squadTicketsOwner.length / olderThan30Owner.length) * 100
            : 0;

        const ownerTeam = ticketsWithHistory[0]?.ownerTeam; 

        const ongoingTicketsTeam = await Ticket.find({
            'ownerTeam': ownerTeam,
            'statusHistories': {
                $elemMatch: {
                    'changedDate': { $lte: endDate },
                    'status': { $nin: ["Resolvido", "Closed", "Fechado", "Cancelado", "Novo"] }
                }
            }
        }).lean();

        const olderThan30Team = filterOlderThan30Days(ongoingTicketsTeam);
        const olderThan30TotalTeam = olderThan30Team.length;

        // Calculando o percentual de tickets superiores a 30 dias do ownerBusinessName em relação ao total do ownerTeam
        const percentTime = olderThan30TotalTeam > 0
            ? (olderThan30Owner.length / olderThan30TotalTeam) * 100
            : 0;

            const metricsData = {
                ongoing: ongoingTicketsOwner.length,
                superior30d: olderThan30Owner.length,
                percentSuperior: percentOlderThan30Owner.toFixed(2),
                percentSquad: percentSquadOwner.toFixed(2),
                percentTime: percentTime.toFixed(2)
            };
    
            // Verifica se o objeto 'res' está disponível
            if (res) {
                res.json(metricsData);
            } else {
                // Retorna os dados diretamente se 'res' não estiver disponível
                return metricsData;
            }
        } catch (error) {
            console.error("Erro ao buscar backlog metrics:", error);
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