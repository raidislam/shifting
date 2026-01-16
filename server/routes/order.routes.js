const router = require("express").Router();
const orderController =  require('../controllers/order.controller')

router.get("/parcels",orderController.getAllParcels);
router.get("/",orderController.getParcelByEmail);
router.post("/order-parcels",orderController.createParcel);



module.exports = router;
