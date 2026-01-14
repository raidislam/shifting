const express =  require('express');
const app =  express();
const cors = require('cors');


// middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/orders",require("./routes/order.routes"));


// Healcth check
app.get('/', (req, res) => {
    res.send('Parcel Delivery Service')
})



module.exports = app