const MetricsSnapshot = require('../models/SnapShotModel');
const indCapacity = require('./IndCapacity');
const indBacklog = require('./IndBacklog');
const inFirstResponse = require('./IndFirstResponse');
const indOpen24h = require('./IndOpen24h');
const inReopen = require('./IndReopen');
const inSolutiontime = require('./IndSolutionTime');
const inTramites = require('./IndTramites');
const inResponse = require('./IndResponse');

exports.generateMetricsSnapshot = async (req, res) => {
    try {
        const { startDate, endDate, ownerBusinessName } = req.body;

        const parts = startDate.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Mês começa de 0 em JavaScript
        const day = parseInt(parts[2], 10);

        const referenceDate = new Date(Date.UTC(year, month, day));
        const referenceMonth = referenceDate.getUTCMonth() + 1; // +1 porque getMonth() retorna de 0 a 11
        const formattedMonth = referenceMonth.toString().padStart(2, '0');

        const fakeReq = {
            query: { startDate, endDate, ownerBusinessName }
        };

        const capacityResult = await indCapacity.getTicketCapacityMetrics(fakeReq);
        const backlogResult = await indBacklog.getBacklogMetrics(fakeReq);
        const firstResponseResult = await inFirstResponse.getAverageFirstResponseTime(fakeReq);
        const open24hResult = await indOpen24h.getTicketsOpenBeyond24WorkingHours(fakeReq);
        const reopenResult = await inReopen.getReopenedTicketsMetrics(fakeReq);
        const solutionTimeResult = await inSolutiontime.getAverageSolutionTime(fakeReq);
        const tramitesResult = await inTramites.getTramitesMetrics(fakeReq);
        const responseResult = await inResponse.getCustomerSatisfactionMetrics(fakeReq);

        const snapshot = new MetricsSnapshot({
            dateGenerated: new Date(),
            capacity: capacityResult,
            backlog: backlogResult,
            firstResponse: firstResponseResult,
            open24h: open24hResult,
            reopen: reopenResult,
            solutionTime: solutionTimeResult,
            tramites: tramitesResult,
            response: responseResult,
            analystName: ownerBusinessName,  // Adicionando nome do analista
            referenceMonth: formattedMonth  // Adicionando mês de referência
        });

        await snapshot.save();
        res.status(200).json({ message: "Snapshot das métricas salvo com sucesso." });
    } catch (error) {
        console.error("Erro ao gerar o snapshot das métricas:", error);
        res.status(500).json({ error: error.message });
    }
}

exports.listSnapshots = async (req, res) => {
    try {
        const snapshots = await MetricsSnapshot.find().sort({ dateGenerated: -1 });
        res.status(200).json(snapshots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getSnapshot = async (req, res) => {
    try {
        const snapshot = await MetricsSnapshot.findById(req.params.id);
        if (!snapshot) {
            return res.status(404).json({ message: 'Snapshot não encontrado' });
        }
        res.status(200).json(snapshot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
