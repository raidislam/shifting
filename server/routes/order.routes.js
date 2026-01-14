const router = require("express").Router();
const orderController =  require('../controllers/order.controller')

router.get("/",orderController.getAllParcels);
router.get("/:id",orderController.getParcelById);



module.exports = router;
