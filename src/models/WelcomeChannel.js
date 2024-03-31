const { Schema, model } = require('mongoose');

const welcomeUserSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    channelId:{
        type: String,
        required: true,
        unique: true,
    }
}, {timestamps: true});

module.exports = model('WelcomeChannel', welcomeUserSchema);