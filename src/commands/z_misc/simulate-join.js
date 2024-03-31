const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
 
const data = new SlashCommandBuilder()
    .setName('simulate-join')
    .setDescription('Simulate a member joining')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
        option
            .setName('target-user')
            .setDescription('The user you want to emulate joining.')
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
 
    client.emit('guildMemberAdd', member);
 
    interaction.reply({
        content: 'Simulated join!',
        ephemeral: true
    });
}
 
module.exports = { data, run };