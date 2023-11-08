const moment = require('moment');
const Ticket = require('../models/TicketModel');

function isWithinWorkingHours(date) {
    const workingHours = {
        startMorning: moment(date).hour(8).minute(0),
        endMorning: moment(date).hour(12).minute(0),
        startAfternoon: moment(date).hour(13).minute(30),
        endAfternoon: moment(date).hour(18).minute(0)
    };

    return date.isBetween(workingHours.startMorning, workingHours.endMorning) ||
           date.isBetween(workingHours.startAfternoon, workingHours.endAfternoon);
}

function calculateWorkingHours(start, end) {
    let hours = 0;
    let current = moment(start);

    // Se o início não estiver dentro do horário de trabalho, mover para o próximo início do horário de trabalho
    if (!isWithinWorkingHours(current)) {
        if (current.hour() < 8 || (current.hour() >= 12 && current.hour() < 13) || current.hour() >= 18) {
            current = moment(current).hour(8).minute(0).second(0);
            if (current.isoWeekday() >= 6) {
                current.add(1, 'days'); // Pula para o próximo dia útil
            }
        } else if (current.hour() >= 12) {
            current = moment(current).hour(13).minute(30).second(0);
        }
    }

    while (current < end) {
        if (current.isoWeekday() <= 5) {
            // Calcular o tempo até o próximo intervalo ou final do dia
            let nextBreak = current.clone();
            if (current.isBetween(moment(current).hour(8).minute(0), moment(current).hour(12).minute(0), undefined, '[)')) {
                nextBreak = moment(current).hour(12).minute(0).second(0);
            } else if (current.isBetween(moment(current).hour(13).minute(30), moment(current).hour(18).minute(0), undefined, '[)')) {
                nextBreak = moment(current).hour(18).minute(0).second(0);
            }

            // Adicionar minutos fracionados
            hours += nextBreak.diff(current, 'minutes') / 60;

            // Avançar para o próximo período de trabalho ou para o próximo dia
            if (nextBreak.hour() === 12) {
                current = moment(nextBreak).hour(13).minute(30).second(0);
            } else if (nextBreak.hour() === 18) {
                current = moment(nextBreak).add(14, 'hours').minute(30).second(0); // Pular para as 8:00 do próximo dia útil
                if (current.isoWeekday() >= 6) {
                    current.add(2, 'days'); // Pula para o próximo dia útil se for fim de semana
                }
            }
        } else {
            current.add(1, 'days'); // Avança para o próximo dia
            current.hour(8).minute(0).second(0); // Começa no início do dia útil
        }
    }

    // Ajustar para o horário de término, se necessário
    if (end.isBefore(current)) {
        hours -= current.diff(end, 'minutes') / 60;
    }

    return hours;
}


exports.getTicketsOpenBeyond24WorkingHours = async (req, res) => {
    try {
        const { startDate, endDate, ownerBusinessName } = req.query;
        const ownerBusinessNames = Array.isArray(ownerBusinessName) ? 
            ownerBusinessName.map(decodeURIComponent) : 
            [decodeURIComponent(ownerBusinessName)];

        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        const tickets = await Ticket.find({
            'owner.businessName': { $in: ownerBusinessNames },
            createdDate: { $gte: startDateTime, $lte: endDateTime }
        });

        const ticketIdsOpenBeyond24WorkingHours = tickets.filter(ticket => {
            // Para cada ticket, verificar cada período aberto individualmente
            return ticket.statusHistories
                .filter(entry => entry.status === "Aberto")
                .some(entry => {
                    // Converte o tempo de permanência de milissegundos para horas
                    const hours = entry.permanencyTimeWorkingTime / 3600;
                    // Comparar com 8.5 horas (jornada de trabalho diária)
                    return hours > 8.5;
                });
        }).map(ticket => ticket.id);
        
        const metricsData = {
            countTicketsOpenBeyond24WorkingHours: ticketIdsOpenBeyond24WorkingHours.length,
            ticketIdsOpenBeyond24WorkingHours: ticketIdsOpenBeyond24WorkingHours
        };

        // Verifica se o objeto 'res' está disponível
        if (res) {
            res.json(metricsData);
        } else {
            // Retorna os dados diretamente se 'res' não estiver disponível
            return metricsData;
        }

    } catch (error) {
        console.error("Erro ao buscar tickets que ficaram 'Aberto' por mais de 24 horas úteis:", error);
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