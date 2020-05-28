const mongoose = require('mongoose')



const userSchema = new mongoose.Schema({
    PSID: String,
    location: {
        formattedAddress: String,
        latitude: Number,
        longitude: Number
    }

})


module.exports = userSchema
