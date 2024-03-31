const { EmbedBuilder } = require('discord.js');
const welcomeChannelSchema = require('../../models/WelcomeChannel');

/** @param {import('discord.js').GuildMember} guildMember */
module.exports = async (guildMember) => {

    try {
        const rulesChannelId = '1208306538893017098';
        const photoChannelId = '1208306538893017099';
        const applyForDriverChannelId = '1155873117512671276';
        const rolesChannelId = '1212795413841838182';

        /** Doing nothing if a bot joins */
        if(guildMember.user.bot) return;

        /** Fetching the configurations for the particular server */
        const welcomeConfigs = await welcomeChannelSchema.find({
            guildId: guildMember.guild.id,
        });

        /** If we don't find anything from fetched schema, we're doing nothing. */
        if(!welcomeConfigs.length) return;

        /** Might receive several configs. Iterating to find the needed one. */
        for(const welcomeConfig of welcomeConfigs){
            /** Getting the channel id directly or from cache(Channel might be deleted) */
            const targetChannel = guildMember.guild.channels.cache.get(welcomeConfig.channelId) ||
                await guildMember.guild.channels.fetch(welcomeConfig.channelId);

            const loggingChannel = guildMember.guild.channels.cache.get(welcomeConfig.logChannelId) ||
            await guildMember.guild.channels.fetch(welcomeConfig.logChannelId);

            if(!targetChannel && !loggingChannel){
                welcomeChannelSchema.findOneAndDelete({
                    guildId: guildMember.guild.id,
                    channelId: welcomeConfig.channelId,
                    logChannelId: welcomeConfig.logChannelId,
                }).catch((error) => console.log(`Error on ${__filename}.\nError: `,error));
            }

            /** Creating a embed message to welcome the user. PENDING */ 
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#18dbf5')
                .setAuthor({ 
                    name: guildMember.user.username, 
                    iconURL: guildMember.user.avatarURL(), 
                })
                .setDescription(
                    `Welcome to Road Warrior Enterprise <@${guildMember.id}>\n
                    We're glad to have you join us on the road!\nPlease check out our <#${rulesChannelId}> channel for rules and regulations.\n
                    [Click here](https://www.roadwarriorenterprise.nl/) to visit our website!.`
                )
                .addFields(
                    { name: 'VTC server gallery', value: `<#${photoChannelId}>`, inline: true },
                    { name: 'To became a driver', value: `<#${applyForDriverChannelId}>`, inline: true },
                    { name: 'Pick your roles', value: `<#${rolesChannelId}>`, inline: true },
                )
                .setImage('https://cdn.discordapp.com/attachments/851726964552630338/951538541844897883/RWE_advert_2022.png?ex=6605aed3&is=65f339d3&hm=d873e8c2b5890af2d70c715e33dc5e5d989eb538c702de2e73bccef0f3556f9c&')
                .setTimestamp()
                .setFooter({ 
                    text: '👈(ﾟヮﾟ👈) Road Warrior Enterprise (👉ﾟヮﾟ)👉', 
                    iconURL: 'https://i.imgur.com/GmM7g7F.png' 
                });
            
            targetChannel.send({embeds: [welcomeEmbed]}).catch(() => {});
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
}