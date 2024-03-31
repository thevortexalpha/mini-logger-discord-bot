/** @param {import('discord.js').Client} client */
/** This method will log in terminal when the bot is online. */
module.exports = (client) => {
    console.log(`${client.user.username} is online!`);
}