'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const loggingChannelSchema = require('../../models/LoggingChannel');

const data = new SlashCommandBuilder()
    .setName('kick-an-user')
    .setDescription('Ban an user from the guild.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addMentionableOption((option) => 
        option
            .setName('target-user')
            .setDescription('User you would like to ban.')
            .setRequired(true)
    )
    .addStringOption((option) => 
        option 
            .setName('reason-to-ban')
            .setDescription('Reason for banning the user.')
            .setRequired(true)
    );

/** @param {import('commandkit').SlashCommandProps} param0*/
async function run({ interaction }) {
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
            const reasonForBan = interaction.options.get('reason-to-ban').value;

            await interaction.deferReply();

            const targetUser = await interaction.guild.members.fetch(targetUserId);

            if(!targetUser) {
                await interaction.reply(`That user doesn't exist in this guild!`);
                return;
            }
            else if (targetUser.id === interaction.guild.ownerId) {
                await interaction.reply(`You can not ban the owner of this guild!`);
                return;
            }

            /**Highest role of the target user */
            const targetUserRolePosition = targetUser.roles.highest.position; 
            /**Highest role of the user running the command. */
            const requestUserRolePosition = interaction.member.roles.highest.position;
            /**Highest role of the bot */
            const botRolePosition = interaction.guild.members.me.roles.highest.position;

            if(targetUserRolePosition >= requestUserRolePosition){
                await interaction.reply(`You can't ban that user because they have the same/higher role than you.`);
                return;
            }
            if(targetUserRolePosition >= botRolePosition){
                await interaction.reply(`I can't ban that user because they have the same/higher role than me.`);
                return;
            }

            await targetUser.ban({ reasonForBan });
            await interaction.editReply(`User ${targetUser} was banned.\nReason: ${reasonForBan}`);

            /** Creating a log embed message when user leave the guild. PENDING */ 
            const userBanEmbed = new EmbedBuilder()
                .setColor('DarkRed')
                .setAuthor({ 
                    name: `${interaction.user.globalName}`, 
                    iconURL: interaction.user.avatarURL(), 
                })
                .setDescription(`<@${interaction.id}> is banned from this server.`)
                .addFields(
                    { name: 'Reason', value: `${reasonForBan}`},
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
            loggingChannel.send({embeds: [userBanEmbed]}).catch(() => {});
        }
    } catch(error) {
        console.log(`Error happened in ${__filename}.\nError: `,error);
    }
}

module.exports = { data, run }