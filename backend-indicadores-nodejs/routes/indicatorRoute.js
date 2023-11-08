const router = require("express").Router();
const indCapacity = require('../controllers/IndCapacity');
const indBacklog = require('../controllers/IndBacklog');
const indTramites = require('../controllers/IndTramites')
const indReopen = require('../controllers/IndReopen')
const indFirstResponse = require('../controllers/IndFirstResponse')
const indSolutionTime = require('../controllers/IndSolutionTime')
const indOpen24h = require('../controllers/IndOpen24h')
const indResponse = require('../controllers/IndResponse')

router.get("/capacity", indCapacity.getTicketCapacityMetrics);
router.get("/backlog", indBacklog.getBacklogMetrics);
router.get("/tramites", indTramites.getTramitesMetrics);
router.get("/reopen", indReopen.getReopenedTicketsMetrics);
router.get("/first", indFirstResponse.getAverageFirstResponseTime);
router.get("/solutiontime", indSolutionTime.getAverageSolutionTime);
router.get("/open24h", indOpen24h.getTicketsOpenBeyond24WorkingHours);
router.get("/satisfation", indResponse.getCustomerSatisfactionMetrics);



module.exports = router;