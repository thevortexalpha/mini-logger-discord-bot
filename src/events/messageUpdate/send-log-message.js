const { EmbedBuilder, Client } = require('discord.js');
const loggingChannelSchema = require('../../models/LoggingChannel');

/**
 * @param {import('discord.js').Message} oldMessage 
 * @param {import('discord.js').Message} newMessage 
 */
module.exports = async (oldMessage, newMessage) => {
    try {

        if(!oldMessage.author) return;

        /** Fetching the configurations for the particular server */
        const logConfigs = await loggingChannelSchema.find({
            guildId: oldMessage.guild.id
        });

        /** If we don't find anything from fetched schema, we're doing nothing. */
        if(!logConfigs.length) return;

        /** Might receive several configs. Iterating to find the needed one. */
        for(const logConfig of logConfigs){
            /** Getting the channel id directly or from cache(Channel might be deleted) */
            const loggingChannel = oldMessage.guild.channels.cache.get(logConfig.channelId) ||
                await oldMessage.guild.channels.fetch(logConfig.channelId);
            
            if(!loggingChannel){
                loggingChannelSchema.findOneAndDelete({
                    guildId: oldMessage.guild.id,
                    channelId: logConfig.channelId,
                }).catch((error) => console.log(`Error on ${__filename}.\nError: `,error));
            }

            /** Creating a log embed message when user updates a message. PENDING */ 
            const messageUpdateEmbed = new EmbedBuilder()
                .setColor('Purple')
                .setAuthor({ 
                    name: `${oldMessage.author.globalName}`, 
                    iconURL: oldMessage.author.avatarURL(), 
                })
                .setDescription(`<@${oldMessage.author.id}> updated their message in <#${oldMessage.channelId}>`)
                .addFields(
                    { name: 'Now', value: `${oldMessage.content}`, inline: false },
                    { name: 'Previous', value: `${newMessage.content}`, inline: false },
                )
                .addFields({
                    name: 'ID',
                    value: `\`\`\`js\nUser = ${oldMessage.author.id}\nMessage = ${oldMessage.id}\n\`\`\``
                })
                .setTimestamp()
                .setFooter({ 
                    text: '👈(ﾟヮﾟ👈) Road Warrior Enterprise (👉ﾟヮﾟ)👉', 
                    iconURL: 'https://i.imgur.com/GmM7g7F.png', 
                });
            loggingChannel.send({embeds: [messageUpdateEmbed]}).catch(() => {});
        }

    } catch(error) {
        console.log(`Error in ${__filename}\nError:`, error);
    }
};