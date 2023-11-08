const router = require("express").Router();
const personsController = require('../controllers/Persons');

router.get('/personsByName', personsController.getPersonsByName);
router.get('/fetch-and-store-persons', personsController.fetchAndStorePersons);
router.post('/persons', personsController.savePersons);
router.get("/persons", personsController.getPersons);


module.exports = router;
