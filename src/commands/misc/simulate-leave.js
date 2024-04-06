const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
 
const data = new SlashCommandBuilder()
    .setName('simulate-leave')
    .setDescription('Simulate a member leaving the guild')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
        option
            .setName('target-user')
            .setDescription('The user you want to emulate leaving.')
    );
 
/**
 * @param {import('commandkit').SlashCommandProps} param0
 */
async function run({ interaction, client }) {
    const targetUser = interaction.options.getUser('target-user');
 
    let member;
 
    if (targetUser) {
        member =
            interaction.guild.members.cache.get(targetUser.id) ||
            (await interaction.guild.members.fetch(targetUser.id));
    } else {
        member = interaction.member;
    }
 
    client.emit('guildMemberRemove', member);
 
    interaction.reply({
        content: 'Simulated leave!',
        ephemeral: true
    });
}
 
module.exports = { data, run };