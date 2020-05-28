const mongoose = require('mongoose')

const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

const userSchema = new mongoose.Schema({
    name: String,
    PSID: String,
    location: pointSchema
})


module.exports = {
    userSchema: userSchema,
    pointSchema: pointSchema
}