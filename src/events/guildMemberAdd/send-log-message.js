const { EmbedBuilder } = require('discord.js');
const loggingChannelSchema = require('../../models/LoggingChannel');

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

            const accountAge = calculateAccountAge(guildMember.user.createdAt);
            const joinDateTimeStamp = Math.floor(guildMember.joinedTimestamp / 1000);

            /** Creating a embed message to welcome the user. PENDING */ 
            const welcomeLogEmbed = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({ 
                    name: `${guildMember.user.globalName}`, 
                    iconURL: guildMember.user.avatarURL(), 
                })
                .setDescription(`<@${guildMember.id}> joined.`)
                .addFields(
                    { name: 'Joined at', value: `<t:${joinDateTimeStamp}:F>`, inline: false },
                    { name: 'Account age', value: `${accountAge}`, inline: true },
                    { name: 'Member count', value: `${guildMember.guild.memberCount}`, inline: true },
                )
                .addFields({
                    name: 'ID',
                    value: `\`\`\`js\nMember = ${guildMember.user.id}\nGuild = ${guildMember.guild.id}\n\`\`\``
                })
                .setTimestamp()
                .setFooter({ 
                    text: '👈(ﾟヮﾟ👈) Road Warrior Enterprise (👉ﾟヮﾟ)👉', 
                    iconURL: 'https://i.imgur.com/GmM7g7F.png', 
                });
            
            loggingChannel.send({embeds: [welcomeLogEmbed]}).catch(() => {});
        }

        function calculateAccountAge(creationDate) {
            const now = new Date();
            const difference = now.getTime() - creationDate.getTime();
        
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const years = Math.floor(days / 365);
            const months = Math.floor((days % 365) / 30);
        
            let ageString = '';
            if (years > 0) {
                ageString += `${years} year${years !== 1 ? 's' : ''} `;
            }
            if (months > 0) {
                ageString += `${months} month${months !== 1 ? 's' : ''} `;
            }
            if (years === 0 && months === 0) {
                ageString += `${days} day${days !== 1 ? 's' : ''} `;
            }
        
            return ageString;
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
}