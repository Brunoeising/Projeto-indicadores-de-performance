const axios = require('axios');
const { fetchWithRetry } = require('./config/movideskService');
const { unpackCustomFields } = require('./config/utils');
const { MOVIDESK_PERSONS_API_URL, MOVIDESK_TOKEN, LIMIT } = require('./config/config');
const Person = require('../models/PersonModel');
const Ticket = require('../models/TicketModel');

exports.getPersons = async (req, res) => {
    const BATCH_SIZE = 500;
    let persons = [];
    let hasMoreData = true;
    let page = 1;

    const postToAPI = async (data) => {
        try {
            await axios.post('http://localhost:3002/api/personRoute/persons', data);
        } catch (error) {
            console.error("Erro ao enviar dados de pessoas para a sua API:", error);
            throw new Error('Erro ao enviar dados de pessoas para a sua API.');
        }
    };

    while (hasMoreData) {
        try {
            const responseData = await fetchWithRetry(MOVIDESK_PERSONS_API_URL, {
                token: MOVIDESK_TOKEN,
                $select: 'id,codeReferenceAdditional,isActive,personType,profileType,accessProfile,corporateName,businessName,businessBranch,cpfCnpj,userName,role,bossId,bossName,classification,cultureId,timeZoneId,authenticateOn,createdDate,createdBy,changedDate,changedBy,observations,addresses,contacts,emails,teams,relationships,customFieldValues,atAssets',
                $expand: 'customFieldValues($expand=items),person.relationships',
                $orderby: 'id',
                $top: LIMIT,
                $skip: (page - 1) * LIMIT
            });

            persons = persons.concat(responseData);

            if (persons.length >= BATCH_SIZE) {
                await postToAPI(persons.slice(0, BATCH_SIZE));
                persons = persons.slice(BATCH_SIZE);
            }

            if (responseData.length < LIMIT) {
                hasMoreData = false;
            } else {
                page++;
            }

        } catch (error) {
            console.error("Erro ao obter pessoas:", error);
            res.status(500).send('Erro ao obter informações das pessoas.');
            return;
        }
    }

    // Para qualquer pessoa restante depois do loop
    if (persons.length > 0) {
        await postToAPI(persons);
    }

    res.json({ message: 'Dados de pessoas enviados com sucesso para a sua API!' });
};


exports.fetchAndStorePersons = async (req, res) => {
    let persons = [];
    let hasMoreData = true;
    let page = 1;

    while (hasMoreData) {
        try {
            const responseData = await fetchWithRetry(MOVIDESK_PERSONS_API_URL, {
                token: MOVIDESK_TOKEN,
                $select: 'id,codeReferenceAdditional,isActive,personType,profileType,accessProfile,corporateName,businessName,businessBranch,cpfCnpj,userName,role,bossId,bossName,classification,cultureId,timeZoneId,authenticateOn,createdDate,createdBy,changedDate,changedBy,observations,addresses,contacts,emails,teams,relationships,customFieldValues,atAssets',
                $expand: 'customFieldValues($expand=items)',
                $orderby: 'id',
                $top: LIMIT,
                $skip: (page - 1) * LIMIT
            });

            if (responseData.length < LIMIT) {
                hasMoreData = false;
            } else {
                page++;
            }

            const transformedData = responseData.map(unpackCustomFields);
            persons = persons.concat(transformedData);

        } catch (error) {
            console.error("Erro ao obter pessoas:", error);
            res.status(500).send('Erro ao obter informações das pessoas.');
            return;
        }
    }

    // Armazenar dados no MongoDB
    try {
        await Person.insertMany(persons, { ordered: false });
        res.json({ message: 'Pessoas armazenadas com sucesso no MongoDB!' });
    } catch (error) {
        if (error.code === 11000) {
            res.json({ message: 'Algumas pessoas já existiam no MongoDB e foram ignoradas.' });
        } else {
            console.error("Erro ao armazenar pessoas no MongoDB:", error);
            res.status(500).send('Erro ao armazenar pessoas no MongoDB.');
        }
    }
};

exports.savePersons = async (req, res) => {
    const personsData = req.body;

    if (!Array.isArray(personsData)) {
        return res.status(400).send('Os dados das pessoas devem ser um array.');
    }

    const transformedPersons = personsData.map(unpackCustomFields);
    
    try {
        await Person.insertMany(transformedPersons, { ordered: false });
        res.json({ message: 'Pessoas armazenadas com sucesso!' });
    } catch (error) {
        if (error.code === 11000) {
            res.json({ message: 'Algumas pessoas já existiam no MongoDB e foram ignoradas.' });
        } else {
            console.error("Erro ao armazenar pessoas no MongoDB:", error);
            res.status(500).send('Erro ao armazenar pessoas no MongoDB.');
        }
    }
};

exports.getPersonsByName = async (req, res) => {
    try {
        const { analista, businessNames } = req.query;

        let query = Ticket.find();

        if (analista) {
            query = query.where("owner.businessName").equals(analista);
        }

        if (businessNames) {
            // Transforma a string delimitada por vírgulas em um array
            const businessNamesArray = businessNames.split(',');

            // Busca por múltiplos businessNames
            query = query.where("owner.businessName").in(businessNamesArray);
        }

        const ownersList = await query.distinct("owner.businessName");

        res.json({ data: ownersList });

    } catch (error) {
        console.error("Erro ao obter a lista de owners do banco de dados:", error);
        res.status(500).send('Erro ao obter a lista de owners.');
    }
};
