const { EmbedBuilder } = require('discord.js');
const loggingChannelSchema = require('DiscordProjects/mini-logger-discord-bot/mini-logger-discord-bot/src/models/LoggingChannel');

/** @param {import('discord.js').GuildMember} guildMember */
module.exports = async (guildMember) => {

    try {
        /** Doing nothing if a bot joins */
        if(guildMember.user.bot) return;

        /** Fetching the configurations for the particular server */
        const logConfigs = await loggingChannelSchema.find({
            guildId: guildMember.guild.id,
        });

        /** If we don't find anything from fetched schema, we're doing nothing. */
        if(!logConfigs.length) return;

        /** Might receive several configs. Iterating to find the needed one. */
        for(const logConfig of logConfigs){
            /** Getting the channel id directly or from cache(Channel might be deleted) */
            const loggingChannel = guildMember.guild.channels.cache.get(logConfig.channelId) ||
                await guildMember.guild.channels.fetch(logConfig.channelId);

            if(!loggingChannel){
                loggingChannelSchema.findOneAndDelete({
                    guildId: guildMember.guild.id,
                    channelId: logConfig.channelId,
                }).catch((error) => console.log(`Error on ${__filename}.\nError: `,error));
            }

            const rolesUserHad = guildMember.roles.cache.filter(role => role.name !== '@everyone').map(role => role.name);
            const joinDateTimeStamp = Math.floor(guildMember.joinedTimestamp / 1000);
            const createdAtTimeStamp = Math.floor(guildMember.user.createdAt / 1000);

            /** Creating a log embed message when user leave the guild. PENDING */ 
            const userLeaveLogEmbed = new EmbedBuilder()
                .setColor('DarkRed')
                .setAuthor({ 
                    name: `${guildMember.user.globalName}`, 
                    iconURL: guildMember.user.avatarURL(), 
                })
                .setDescription(`<@${guildMember.id}> left the server.`)
                .addFields(
                    { name: 'Roles', value: `${rolesUserHad.join(', ')}`, inline: false },
                    { name: 'Joined At', value: `<t:${joinDateTimeStamp}:F> (<t:${joinDateTimeStamp}:R>)`, inline: false },
                    { name: 'Created At', value: `<t:${createdAtTimeStamp}:F> (<t:${createdAtTimeStamp}:R>)`, inline: false },
                )
                .addFields({
                    name: 'ID',
                    value: `\`\`\`js\nUser = ${guildMember.user.id}\n\`\`\``
                })
                .setTimestamp()
                .setFooter({ 
                    text: '👈(ﾟヮﾟ👈) Road Warrior Enterprise (👉ﾟヮﾟ)👉', 
                    iconURL: 'https://i.imgur.com/GmM7g7F.png', 
                });
            loggingChannel.send({embeds: [userLeaveLogEmbed]}).catch(() => {});
        }

    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
}