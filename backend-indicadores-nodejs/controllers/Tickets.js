const axios = require('axios');
const { fetchWithRetry } = require('./config/movideskService');
const { unpackCustomFields, convertMovideskDateToJSDate } = require('./config/utils');
const { MOVIDESK_API_URL, MOVIDESK_TOKEN, LIMIT } = require('./config/config');
const Ticket = require('../models/TicketModel');

async function getLastTicketId() {
    const lastTicket = await Ticket.findOne().sort({ id: -1 }).limit(1);
    return lastTicket ? lastTicket.id : null;
}

exports.fetchAndStoreTickets = async (req, res) => {
    try {
        let tickets = [];
        let hasMoreData = true;
        const lastId = await getLastTicketId();

        while (hasMoreData) {
            const filterId = lastId ? `id gt ${lastId}` : '';
            const responseData = await fetchWithRetry(MOVIDESK_API_URL, {
                $select: 'id,protocol,type,subject,category,urgency,status,baseStatus,justification,origin,createdDate,originEmailAccount,owner,ownerTeam,createdBy,serviceFull,serviceFirstLevelId,serviceFirstLevel,serviceSecondLevel,serviceThirdLevel,contactForm,tags,cc,resolvedIn,reopenedIn,closedIn,lastActionDate,actionCount,lastUpdate,lifetimeWorkingTime,stoppedTime,stoppedTimeWorkingTime,resolvedInFirstCall,chatWidget,chatGroup,chatTalkTime,chatWaitingTime,sequence,slaAgreement,slaAgreementRule,slaSolutionTime,slaResponseTime,slaSolutionChangedByUser,slaSolutionChangedBy,slaSolutionDate,slaSolutionDateIsPaused,slaResponseDate,slaRealResponseDate,jiraIssueKey,redmineIssueId,clients,actions,parentTickets,childrenTickets,ownerHistories,statusHistories,satisfactionSurveyResponses,customFieldValues,assets',
                $filter: filterId,
                $orderby: 'id',
                $expand: 'customFieldValues($expand=items),clients,owner,ownerHistories,statusHistories',
                $top: LIMIT
            });

            if (responseData.length < LIMIT) {
                hasMoreData = false;
            }

            tickets = tickets.concat(responseData);
        }

        // Transformando e atualizando/criando tickets
        const transformedTickets = tickets.map(unpackCustomFields);
        for (const ticket of transformedTickets) {
            await Ticket.updateOne({ id: ticket.id }, ticket, { upsert: true });
        }

        res.json({ message: 'Tickets fetched and stored successfully!' });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Erro ao consumir a API.');
    }
};

exports.getTickets = async (req, res) => {
    try {
        const BATCH_SIZE = 300;
        let totalProcessed = 0;
        let page = 1;
        const lastTicket = await Ticket.findOne().sort({ id: -1 });
        const lastTicketId = lastTicket ? lastTicket.id : 0;

        while (true) {
            const responseData = await fetchWithRetry(MOVIDESK_API_URL, {
                token: MOVIDESK_TOKEN,
                $select: 'id,protocol,type,subject,category,urgency,status,baseStatus,justification,origin,createdDate,originEmailAccount,owner,ownerTeam,createdBy,serviceFull,serviceFirstLevelId,serviceFirstLevel,serviceSecondLevel,serviceThirdLevel,contactForm,tags,cc,resolvedIn,reopenedIn,closedIn,lastActionDate,actionCount,lastUpdate,lifetimeWorkingTime,stoppedTime,stoppedTimeWorkingTime,resolvedInFirstCall,chatWidget,chatGroup,chatTalkTime,chatWaitingTime,sequence,slaAgreement,slaAgreementRule,slaSolutionTime,slaResponseTime,slaSolutionChangedByUser,slaSolutionChangedBy,slaSolutionDate,slaSolutionDateIsPaused,slaResponseDate,slaRealResponseDate,jiraIssueKey,redmineIssueId,clients,actions,parentTickets,childrenTickets,ownerHistories,statusHistories,satisfactionSurveyResponses,customFieldValues,assets',
                $filter: `id gt ${lastTicketId} and createdDate gt 2022-10-01T00:00:00.00z`,
                $orderby: 'id',
                $expand: 'customFieldValues($expand=items),clients,owner,actions,ownerHistories,statusHistories',
                $top: BATCH_SIZE,
                $skip: (page - 1) * BATCH_SIZE
            });

            if (!responseData || responseData.length === 0) {
                break;
            }

            const ticketsToProcess = responseData.map(ticket => {
                let transformedTicket = unpackCustomFields(ticket); 
                transformedTicket.createdDate = convertMovideskDateToJSDate(transformedTicket.createdDate);
                return transformedTicket;
            });

            for (let ticket of ticketsToProcess) {
                await Ticket.updateOne({ id: ticket.id }, ticket, { upsert: true });
                totalProcessed++;
            }

            if (ticketsToProcess.length < BATCH_SIZE) {
                break;
            }
            page++;
        }

        res.json({ message: `Foram processados e armazenados ${totalProcessed} novos tickets com sucesso!` });
    } catch (error) {
        console.error("Erro detalhado:", error);
        res.status(500).send(`Erro ao processar tickets: ${error.message}`);
    }
};

exports.syncTickets = async (req, res) => {
    try {
        const allTicketsInDB = await Ticket.find({});
        let updatedCount = 0;
        let deletedCount = 0;

        for (const ticket of allTicketsInDB) {
            const responseData = await checkTicketExistsInMovidesk(ticket.id);
            const transformedTicket = unpackCustomFields(responseData);

            if (responseData && responseData.length > 0) {
                // Se o ticket existe na Movidesk, atualize-o no MongoDB
                await Ticket.updateOne({ id: ticket.id }, transformedTicket);
                updatedCount++;
            } else {
                // Se o ticket não existe na Movidesk, delete-o do MongoDB
                await Ticket.deleteOne({ id: ticket.id });
                deletedCount++;
            }
        }

        res.json({ message: `Sincronização concluída. Tickets atualizados: ${updatedCount}. Tickets excluídos: ${deletedCount}` });
    } catch (error) {
        console.error("Erro ao sincronizar tickets:", error);
        res.status(500).send('Erro ao sincronizar tickets.');
    }
};


exports.saveTickets = async (req, res) => {
    const ticketsData = req.body;
    if (!Array.isArray(ticketsData)) {
        return res.status(400).send('Os dados dos tickets devem ser um array.');
    }
    const transformedTickets = ticketsData.map(unpackCustomFields);
    try {
        await Ticket.insertMany(transformedTickets);
        res.json({ message: 'Tickets armazenados com sucesso!' });
    } catch (error) {
        console.error("Erro ao armazenar tickets no MongoDB:", error);
        res.status(500).send('Erro ao armazenar tickets no MongoDB.');
    }
};

exports.updateStoredTickets = async (req, res) => {
    try {
        let tickets = [];
        let hasMoreData = true;
        let page = 1;

        while (hasMoreData) {
            const responseData = await fetchWithRetry(MOVIDESK_API_URL, {
                $select: 'id,protocol,type,subject,category,urgency,status,baseStatus,justification,origin,createdDate,originEmailAccount,owner,ownerTeam,createdBy,serviceFull,serviceFirstLevelId,serviceFirstLevel,serviceSecondLevel,serviceThirdLevel,contactForm,tags,cc,resolvedIn,reopenedIn,closedIn,lastActionDate,actionCount,lastUpdate,lifetimeWorkingTime,stoppedTime,stoppedTimeWorkingTime,resolvedInFirstCall,chatWidget,chatGroup,chatTalkTime,chatWaitingTime,sequence,slaAgreement,slaAgreementRule,slaSolutionTime,slaResponseTime,slaSolutionChangedByUser,slaSolutionChangedBy,slaSolutionDate,slaSolutionDateIsPaused,slaResponseDate,slaRealResponseDate,jiraIssueKey,redmineIssueId,clients,actions,parentTickets,childrenTickets,ownerHistories,statusHistories,satisfactionSurveyResponses,customFieldValues,assets',
                $orderby: 'id',
                $expand: 'customFieldValues($expand=items),clients,owner,ownerHistories,statusHistories',
                $top: LIMIT,
                $skip: (page - 1) * LIMIT
            });
            if (responseData.length < LIMIT) {
                hasMoreData = false;
            } else {
                page++;
            }

            tickets = tickets.concat(responseData);
        }
        const transformedTickets = responseData.map(unpackCustomFields);
        for (let ticket of transformedTickets) {
            await Ticket.updateOne({ id: ticket.id }, ticket, { upsert: false });
        }
        res.json({ message: 'Stored tickets updated successfully!' });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Deu ruim ao atualizar os tickets.');
    }
};

exports.deleteAllTickets = async (req, res) => {
    try {
        await Ticket.deleteMany({});
        res.json({ message: 'Todos os tickets foram deletados com sucesso!' });
    } catch (error) {
        console.error("Erro ao deletar todos os tickets:", error);
        res.status(500).send('Erro ao deletar todos os tickets.');
    }
};