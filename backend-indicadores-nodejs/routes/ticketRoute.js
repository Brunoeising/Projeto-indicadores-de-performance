const router = require("express").Router();
const ticketController = require("../controllers/Tickets");

router.post("/tickets", ticketController.saveTickets);
router.get("/tickets", ticketController.getTickets);
router.get("/verificar", ticketController.syncTickets);
router.get("/store-tickets", ticketController.fetchAndStoreTickets);
router.get("/update-tickets", ticketController.updateStoredTickets);
router.delete("/tickets", ticketController.deleteAllTickets); 


module.exports = router;
