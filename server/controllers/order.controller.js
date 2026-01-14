const service = require("../services/order.service");

exports.getAllParcels = async(req,res,next)=>{
    try{
        const result = await service.getAllParcel();
        res.json({ok:true,result})
    }catch(err){
        console.log(err);
    }
}

exports.getParcelById = async (req,res,next)=>{
    try{
        const parcel = service.getParcelById(req.params.id)
        res.json({ok:true,parcel})
    }catch(err){
        console.log(err);
    }
}