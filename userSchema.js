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
    PSID: String,
    location: pointSchema
})


module.exports = {
    pointSchema: pointSchema,
    userSchema: userSchema
}