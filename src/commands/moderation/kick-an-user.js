'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const loggingChannelSchema = require('../../models/LoggingChannel');

const data = new SlashCommandBuilder()
    .setName('kick-an-user')
    .setDescription('Kick an user from the guild.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) => 
        option
            .setName('target-user')
            .setDescription('User you would like to kick.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reason-for-kick')
            .setDescription('Reason for kicking the user.')
            .setRequired(true)
    );

/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({interaction}) {
    try {

        /** Doing nothing if a bot joins */
        if(interaction.user.bot) return;

        /** Fetching the configurations for the particular server */
        const logConfigs = await loggingChannelSchema.find({
            guildId: interaction.guild.id,
        });

        /** If we don't find anything from fetched schema, we're doing nothing. */
        if(!logConfigs.length) return;

        /** Might receive several configs. Iterating to find the needed one. */
        for(const logConfig of logConfigs){

            /** Getting the channel id directly or from cache(Channel might be deleted) */
            const loggingChannel = interaction.guild.channels.cache.get(logConfig.channelId) ||
                await interaction.guild.channels.fetch(logConfig.channelId);
            
            if(!loggingChannel){
                loggingChannelSchema.findOneAndDelete({
                    guildId: interaction.guild.id,
                    channelId: logConfig.channelId,
                }).catch((error) => console.log(`Error on ${__filename}.\nError: `,error));
            }

            const targetUserId = interaction.options.get('target-user').value;
            const reasonToKick = interaction.options.get('reason-for-kick').value;

            await interaction.deferReply();

            // const targetUser = await interaction.guild.members.fetch(targetUserId);
            const targetUser = interaction.guild.members.cache.get(targetUserId);

            if(!targetUser) {
                await interaction.editReply(`That user doesn't exist in this guild!`);
                return;
            } else if (targetUser.id === interaction.guild.ownerId) {
                await interaction.editReply(`You can not kick the owner of this guild!`);
                return;
            }

            const targetUserRolePosition = targetUser.roles.highest.position;
            const requestUserRolePosition = interaction.member.roles.highest.position;
            const botRolePosition = interaction.guild.members.me.roles.highest.position;

            if(targetUserRolePosition >= requestUserRolePosition) {
                await interaction.editReply(`You can not kick a member who have the same/higher role than you.`);
                return;
            }

            if(targetUserRolePosition >= botRolePosition) {
                await interaction.editReply(`I can not kick a member who have the same/higher role than me.`);
                return;
            }

            try {
                await targetUser.kick({ reasonToKick });
                await interaction.editReply(`User ${targetUser} was kicked.\nReason: ${reasonToKick}`);

                /** Creating a log embed message when user is kicked from the guild. PENDING */ 
                const userKickEmbed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setAuthor({ 
                    name: `${interaction.user.globalName}`, 
                    iconURL: interaction.user.avatarURL(), 
                })
                .setDescription(`<@${interaction.id}> is kicked from this server.`)
                .addFields(
                    { name: 'Reason', value: `${reasonToKick}`},
                )
                .addFields({
                    name: 'ID',
                    value: `\`\`\`js\nUser = ${interaction.user.id}\n\`\`\``
                })
                .setTimestamp()
                .setFooter({ 
                    text: '👈(ﾟヮﾟ👈) Road Warrior Enterprise (👉ﾟヮﾟ)👉', 
                    iconURL: 'https://i.imgur.com/GmM7g7F.png', 
                });
                loggingChannel.send({embeds: [userKickEmbed]}).catch(() => {});
            } catch(error) {
                console.log(`Error happened while kicking an user on ${__filename}.\nError: `,error);
            }
        }

    } catch(error) {
        console.log(`Error happened in ${__filename}.\nError: `,error);
    }
};

module.exports = { data, run };