const { getDb } = require("../config/db");
const {ObjectId} = require('mongodb');

function allParcelCol() {
  const db = getDb("parcelDB");
  const parcelsCollection = db.collection("parcels");
  return parcelsCollection;
}

exports.createParcel = async (data)=>{
    try{
        const parcel = await allParcelCol().insertOne(data)
        return parcel;
        
    }catch(err){
        console.log(err)
    }
}

exports.getAllParcel = async () => {
  try {
    const data = await allParcelCol().find().toArray();
    return data;
  } catch (err) {
    console.log(err);
  }
};

exports.getParcelById = async(id,options)=>{
    try{
        const parcel = await allParcelCol().findOne({_id: new ObjectId(id)})
        if(!parcel) throw new Error('Parcel not found');
        return parcel;
    }catch(err){
        console.log(err);
    }
}

exports.getParcelByEmail = async(email)=>{
    try{
        const query = email ? {"created_by.email":email} : {};
        const options = {
            sort:{
                created_at:-1
            }
        }
        const parcel = await allParcelCol().find(query,options).toArray();
        return parcel;
    }catch(err){
        console.log(err);
    }
}