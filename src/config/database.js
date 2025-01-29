const mongoose = require("mongoose");

const connectDb = async()=>{
    await mongoose.connect("mongodb+srv://sanjaybishtsb90:G85HSiAX3m4n3KPK@namastenode.r3yjr.mongodb.net/devTinder")
};

module.exports = connectDb;