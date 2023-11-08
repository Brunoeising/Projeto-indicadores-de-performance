const Ticket = require('../models/TicketModel');
const Capacity = require('../models/CapacityModel')

exports.getTicketCapacityMetrics = async (req, res) => {
    try {
        const { startDate, endDate, ownerBusinessName } = req.query;
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime()) || startDateTime > endDateTime) {
            return res.status(400).json({
                success: false,
                message: "Datas de início e fim inválidas ou incoerentes."
            });
        }
        const mes = startDateTime.getUTCMonth() + 1;
        const ano = startDateTime.getUTCFullYear();
        startDateTime.setUTCHours(0, 0, 0, 0);
        endDateTime.setUTCHours(23, 59, 59, 999);
        const ownerBusinessNames = Array.isArray(ownerBusinessName)
            ? ownerBusinessName.map(decodeURIComponent)
            : [decodeURIComponent(ownerBusinessName)];
        const capacities = await Capacity.find({
            analista: { $in: ownerBusinessNames },
            mes: mes,
            ano: ano
        });
        if (capacities.length !== ownerBusinessNames.length) {
            const foundAnalistas = capacities.map(cap => cap.analista);
            const missingAnalistas = ownerBusinessNames.filter(name => !foundAnalistas.includes(name));
            return res.status(400).json({
                success: false,
                message: `Capacidade não encontrada para o analista(s) ${missingAnalistas.join(', ')} no mês ${mes} e ano ${ano}.`
            });
        }
        console.log("Analistas buscados:", ownerBusinessNames);
        console.log("Capacidades retornadas:", capacities);

        // ########################################################
        const ticketsAbertos = await Ticket.find({
            'statusHistories': {
                $elemMatch: {
                    status: 'Novo',
                    'changedDate': { $gte: startDateTime, $lte: endDateTime }
                }
            },
            'statusHistories.status': { $ne: 'Cancelado' },
            'ownerHistories': {
                $elemMatch: {
                    'ownerTeam': "Suporte",
                    'changedDate': { $lte: endDateTime }
                }
            },
            'owner.businessName': { $in: ownerBusinessNames }
        });
        ticketsAbertos.forEach(ticket => {
            console.log(`Ticket ID abertos: ${ticket.id}`);
        });

        // ########################################################
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
        ticketsResolvidos.forEach(ticket => {
            console.log(`Ticket ID resolvidos: ${ticket.id}`);
        });

        // ########################################################
        const novos = ticketsAbertos.length;
        const resolvidos = ticketsResolvidos.length;
        let capacidadeMaxima = capacities.reduce((total, capacity) => total + capacity.capacidadeMaxima, 0);
        const diferencaCapacidade = capacidadeMaxima - resolvidos;
        const porcentagemCapacidade = ((diferencaCapacidade / capacidadeMaxima) * 100).toFixed(2);
        // ########################################################
        const ticketsComSquad = ticketsResolvidos.filter(ticket => {
            const squadField = ticket.customFieldValues?.find(field => field.customFieldId === 67280);
            return squadField !== undefined;
        });
        const porcentagemSquad = ((ticketsComSquad.length / resolvidos) * 100).toFixed(2);
        // ########################################################
        const ticketsResolvidosOwnerTeamRaw = await Ticket.find({
            'ownerTeam': "Suporte",
            'statusHistories': {
                $elemMatch: {
                    status: 'Resolvido',
                    'changedDate': { $gte: startDateTime, $lte: endDateTime }
                }
            },
            'statusHistories.status': { $ne: 'Cancelado' },
        }).lean();
        const ticketsResolvidosOwnerTeam = ticketsResolvidosOwnerTeamRaw.filter(ticket => {
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
        const nomeAnalista = ownerBusinessNames[0];
        const analistaTicketsResolvidos = ticketsResolvidos.filter(ticket => ticket.owner.businessName === nomeAnalista).length;
        const porcentagemOwnerEmRelacaoEquipe = ((analistaTicketsResolvidos / ticketsResolvidosOwnerTeam.length) * 100).toFixed(2);
        // ########################################################
        const responseData = {
            capacidadeNaoEncontrada: !capacities,
            novos: novos,
            resolvidos: resolvidos,
            diferencaCapacidade: diferencaCapacidade,
            porcentagemCapacidade: porcentagemCapacidade,
            porcentagemSquad: porcentagemSquad,
            porcentagemOwnerEmRelacaoEquipe: porcentagemOwnerEmRelacaoEquipe
        };

        if (res) {
            res.json(responseData);
        } else {
            return responseData;
        }
    } catch (error) {
        console.error("Erro ao buscar capacidade:", error);
        const errorResponse = {
            success: false,
            message: "Erro interno do servidor.",
            error: error.message
        };
        
        if (res) {
            res.status(500).json(errorResponse);
        } else {
            throw errorResponse; // Ou retorne o erro, dependendo de como você quer lidar com isso
        }
    }
};