const axios = require('axios');
const { unpackCustomFields, convertMovideskDateToJSDate } = require('./config/utils');
const { MOVIDESK_TOKEN, MOVIDESK_API_RESPONSES_URL } = require('./config/config');
const { fetchWithRetry } = require('./config/movideskService');
const SurveyResponse = require('../models/ResponseModel');
const Ticket = require('../models/TicketModel');

exports.fetchAndStoreSurveyResponses = async (req, res) => {
    try {
        let surveyResponses = [];
        let hasMoreData = true;
        let lastResponseId;

        while (hasMoreData) {
            const params = {
                token: MOVIDESK_TOKEN,
                limit: 100
            };

            if (lastResponseId) {
                params.startingAfter = lastResponseId;
            }
            const responseData = await fetchWithRetry(MOVIDESK_API_RESPONSES_URL, params);
            if (!responseData.hasMore) {
                hasMoreData = false;
            } else {
                lastResponseId = responseData.items[responseData.items.length - 1].id;
            }
            const convertedResponses = responseData.items.map(response => {
                // Convertendo datas
                if (response.creationDate) {
                    response.creationDate = convertMovideskDateToJSDate(response.creationDate);
                }
                
                // Desempacotar campos personalizados e outros ajustes
                return unpackCustomFields(response);
            });
            
            // Adicione isso:
            surveyResponses = surveyResponses.concat(convertedResponses);
        }
        // Este é o local correto para esta linha:
        await SurveyResponse.insertMany(surveyResponses);

        res.json({ message: 'Survey responses fetched and stored successfully!' });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('An error occurred.');
    }
};

exports.getSurveyResponsesByAnalyst = async (req, res) => {
    try {
        const { ownerBusinessName, startDate, endDate } = req.query;

        // Converter as datas de início e fim para objetos Date
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        // Encontrar os IDs dos tickets associados ao analista e dentro do período especificado
        const tickets = await Ticket.find({
            'owner.businessName': ownerBusinessName,
            createdDate: {
                $gte: startDateTime,
                $lte: endDateTime
            }
        }).select('id'); // Seleciona apenas o campo 'id' dos tickets
        const ticketIds = tickets.map(ticket => ticket.id);

        // Agora, encontrar as respostas da pesquisa associadas a esses tickets
        const surveyResponses = await SurveyResponse.find({
            ticketId: { $in: ticketIds }
        });

        res.json(surveyResponses);
    } catch (error) {
        console.error("Error fetching survey responses by analyst and period:", error);
        res.status(500).send('An error occurred while fetching survey responses by analyst and period.');
    }
};


exports.deleteAllSurveyResponses = async (req, res) => {
    try {
        await SurveyResponse.deleteMany({}); // Isso deletará todos os registros
        res.json({ message: 'All survey responses have been successfully deleted.' });
    } catch (error) {
        console.error("Error deleting all survey responses:", error);
        res.status(500).send('An error occurred while trying to delete all survey responses.');
    }
};
