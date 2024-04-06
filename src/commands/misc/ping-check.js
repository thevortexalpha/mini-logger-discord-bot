/** @type {import('commandkit').CommandData} */
const data = {
    name: 'ping',
    description: `Will reply with bot's latency.`,
};

/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({interaction, client}){
    try {
        interaction.reply(`${client.user.username}'s ping is ${client.ws.ping}ms.`);
        return;
    } catch (error) {
        console.log(`Error happened in ${__filename}.\nError: `, error);
    }
};

// /** @type {import('commandkit').CommandOptions} */
// const options = {
//     devOnly: true
// }

module.exports = { data, run };