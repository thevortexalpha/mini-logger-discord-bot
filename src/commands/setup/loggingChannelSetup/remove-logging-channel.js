'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const loggingChannelSchema = require('../../../models/LoggingChannel');

const data = new SlashCommandBuilder()
    .setName('remove-logging-channel')
    .setDescription('Stops a channel to receive guild logs like member join, leave etc.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption( (option) =>
        option  
            .setName('log-channel')
            .setDescription('Channel where you want to stop receiving guild logs')
            .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText)
            .setRequired(true)
    );

/** @param {import('commandkit').SlashCommandProps} param0*/
async function run({interaction}){
    try{
        /** Getting the channel from the user. */
        const logChannel = interaction.options.getChannel('log-channel');

        /** Deferring the reply because we're fetching the details from Database. */
        await interaction.deferReply({ephemeral: true});

        const query = {
            guildId: interaction.guildId,
            channelId: logChannel.id,
        };

        /** Checking whether the channel has been already configured in Database. */
        const channelExists = await loggingChannelSchema.exists(query);

        if(!channelExists) {
            interaction.followUp(`${logChannel} was not configured to receive guild logs.`);
            return;
        }

        /** Deleting the existing channel details in Database */
        await loggingChannelSchema.findOneAndDelete(query)
        .then(() => {
            interaction.followUp(`Removed ${logChannel} from receiving guild logs.`);
            return;
        })
        .catch((error) => {
            interaction.followUp(`Configuration failed due to database error. Try again later sometime.`);
            console.log(`Error happened in ${__filename}.\nError: `, error);
            return;
        });


    } catch (error) {
        console.log(`Error happened in ${__filename}.\nError: `,error);
    }
};

module.exports = { data, run }