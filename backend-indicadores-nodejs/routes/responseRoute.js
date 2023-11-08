const router = require("express").Router();
const responseController = require("../controllers/Response");

router.get('/surveyresponses', responseController.fetchAndStoreSurveyResponses);
router.get('/responses-analyst', responseController.getSurveyResponsesByAnalyst);
router.delete('/delete-responses', responseController.deleteAllSurveyResponses);

module.exports = router;