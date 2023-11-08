const express = require('express');
const router = express.Router();
const MetricsSnapshot = require('../controllers/Snapshot');


router.post("/create-snapshot", MetricsSnapshot.generateMetricsSnapshot);
router.get('/snapshots', MetricsSnapshot.listSnapshots);
router.get('/snapshots/:id', MetricsSnapshot.getSnapshot);

module.exports = router;
