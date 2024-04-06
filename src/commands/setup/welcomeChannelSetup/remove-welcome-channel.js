'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const welcomeChannelSchema = require('../../../models/WelcomeChannel');

const data = new SlashCommandBuilder()
    .setName('remove-welcome-channel')
    .setDescription('Stops a channel to receive welcome messages for new users')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption( (option) =>
        option  
            .setName('target-channel')
            .setDescription('Channel where you want to stop receiving the welcome messages.')
            .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText)
            .setRequired(true)
    );

/** @param {import('commandkit').SlashCommandProps} param0*/
async function run({interaction}){
    try{
        /** Getting the channel from the user. */
        const targetChannel = interaction.options.getChannel('target-channel');

        /** Deferring the reply because we're fetching the details from Database. */
        await interaction.deferReply({ephemeral: true});

        const query = {
            guildId: interaction.guildId,
            channelId: targetChannel.id,
        };

        /** Checking whether the channel has been already configured in Database. */
        const channelExists = await welcomeChannelSchema.exists(query);

        if(!channelExists) {
            interaction.followUp(`${targetChannel} was not configured to receive welcome messages.`);
            return;
        }

        /** Deleting the existing channel details in Database */
        await welcomeChannelSchema.findOneAndDelete(query)
        .then(() => {
            interaction.followUp(`Removed ${targetChannel} from receiving welcome messages.`);
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