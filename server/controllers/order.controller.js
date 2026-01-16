const service = require("../services/order.service");


exports.createParcel = async (req, res, next) => {
    try {
        const newParcel = req.body
        const result = await service.createParcel(newParcel);
        res.status(201).json({ ok: true, result });
    } catch (err) {
        console.log(err)
    }
}
exports.getAllParcels = async (req, res, next) => {
    try {
        const result = await service.getAllParcel();
        res.json({ ok: true, result })
    } catch (err) {
        console.log(err);
    }
}

exports.getParcelByEmail = async (req, res, next) => {
    try {
        const email = req.query.email
        const parcel = await service.getParcelByEmail(email)
        res.json({ ok: true, parcel })
    } catch (err) {
        console.log(err);
    }
}