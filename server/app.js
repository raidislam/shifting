const express =  require('express');
const app =  express();
const cors = require('cors');


// middleware
app.use(cors());
app.use(express.json());

// Routes


// Healcth check
app.get('/', (req, res) => {
    res.send('Parcel Delivery Service')
})



module.exports = app