require('dotenv').config()
mongoose = require('mongoose')
const userSchema = require('./userSchema.js')
User = mongoose.model('users', userSchema)

async function createUser(sender_psid, point) {
    return new User({
        PSID: sender_psid,
        location: point
    }).save()
}

async function getCoords(city) {
    const NodeGeocoder = require('node-geocoder');

    const options = {
        provider: 'google',

        // Optional depending on the providers
        apiKey: process.env.GEOCODER_API, // for Mapquest, OpenCage, Google Premier
        formatter: null // 'gpx', 'string', ...
    };
    const geocoder = NodeGeocoder(options);

    // Using callback
    const res = await geocoder.geocode(city);
    return res

}

module.exports = { createUser, getCoords }