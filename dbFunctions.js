mongoose = require('mongoose')
const {pointSchema, userSchema} = require('./userSchema.js')
Point = mongoose.model('points', pointSchema)
User = mongoose.model('users', userSchema)

async function createUser(sender_psid, point) {
    return new User({
        PSID: sender_psid,
        location: point
    }).save()
}

async function createPoint(state) {
    return new Point({
        type: 'Point',
        coordinates: state
    })
}

module.exports = { createUser, createPoint }