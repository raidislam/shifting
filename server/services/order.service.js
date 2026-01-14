const { getDb } = require("../config/db");
const {ObjectId} = require('mongodb');

function allParcelCol() {
  const db = getDb("parcelDB");
  const parcelsCollection = db.collection("parcels");
  return parcelsCollection;
}

exports.getAllParcel = async () => {
  try {
    const data = await allParcelCol().find().toArray();
    return data;
  } catch (err) {
    console.log(err);
  }
};

exports.getParcelById = async(id)=>{
    try{
        const parcel = await allParcelCol().findOne({_id: new ObjectId(id)})
        if(!parcel) throw new Error('Parcel not found');
        return parcel;
    }catch(err){
        console.log(err);
    }
}