'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const loggingChannelSchema = require('../../../models/LoggingChannel');

const data = new SlashCommandBuilder()
    .setName('setup-logging-channel')
    .setDescription('Setup a channel to send logging messages like member join, leave etc.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption( (option) =>
        option  
            .setName('log-channel')
            .setDescription('Channel where you want to send guild logs.')
            .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText)
            .setRequired(true)
    )

/** @param {import('commandkit').SlashCommandProps} param0*/
async function run({interaction}){
    try{
        /** Getting the channel & custom message from the user. */
        const logChannel = interaction.options.getChannel('log-channel');

        /** Deferring the reply because we're fetching the details from Database. */
        await interaction.deferReply({ephemeral: true});

        const query = {
            guildId: interaction.guildId,
            channelId: logChannel.id,
        };

        /** Checking whether the channel has been already configured in Database. */
        const loggingChannelExistInDb = await loggingChannelSchema.exists(query);

        if (loggingChannelExistInDb) {
            interaction.followUp(`${logChannel} has been already configured to receive guild log messages. Remove this one or try with new channels.`);
            return;
        }; 

        const newLogChannel = new loggingChannelSchema({
            ...query,
        });

        /** Pushing the new details to Database */
        await newLogChannel
            .save()
            .then(() => {
                interaction.followUp(`${logChannel} is configured successfully to send guild log messages.`);
                return;
            })
            .catch((error) => {
                interaction.followUp(`Configuration failed due to database error. Try again later sometime.`);
                console.log(`Error happened in ${__filename}.\nError: `, error);
                return;
            })


    } catch (error) {
        console.log(`Error happened in ${__filename}.\nError: `,error);
    }
};

module.exports = { data, run }