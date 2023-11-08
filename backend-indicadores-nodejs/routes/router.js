const router = require("express").Router();

const personRouter = require("./personRoute");
const capacityRouter = require("./capacityRoute");
const ticketRouter = require("./ticketRoute")
const responseRouter = require("./responseRoute")
const indicatorRouter = require("./indicatorRoute")
const analistaRouter = require("./analistaRoute")
const logRouter = require("./logRoute")
const snapshotRouter = require('./snapshotRoute')

router.use("/", capacityRouter)
router.use("/personRoute", personRouter);
router.use("/ticket", ticketRouter);
router.use("/response", responseRouter);
router.use('/indicators', indicatorRouter );
router.use('/analista', analistaRouter );
router.use('/logs', logRouter );
router.use('/snapshot', snapshotRouter );




module.exports = router;
