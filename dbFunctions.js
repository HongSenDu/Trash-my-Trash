require('dotenv').config()
mongoose = require('mongoose')
const userSchema = require('./userSchema.js')
User = mongoose.model('users', userSchema)

async function createUser(sender_psid, location) {
    return new User({
        PSID: sender_psid,
        location: location
    }).save()
}

async function findUser(PSID) {
    return await User.findOne({ PSID })
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

function convertUsefulCoords(select_city) {
    var usefulInfo = {
        "formattedAddress": select_city.formattedAddress,
        "latitude": select_city.latitude,
        "longitude": select_city.longitude,
    }
    return usefulInfo;
}

module.exports = { createUser, findUser, getCoords, convertUsefulCoords }