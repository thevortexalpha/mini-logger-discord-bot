'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const welcomeChannelSchema = require('../../models/WelcomeChannel');

const data = new SlashCommandBuilder()
    .setName('setup-welcome-channel')
    .setDescription('Setup a channel to send welcome messages for new users')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption( (option) =>
        option  
            .setName('target-channel')
            .setDescription('Channel where you want to receive the welcome messages.')
            .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText)
            .setRequired(true)
    );

/** @param {import('commandkit').SlashCommandProps} param0*/
async function run({interaction}){
    try{
        /** Getting the channel & custom message from the user. */
        const targetChannel = interaction.options.getChannel('target-channel');

        /** Deferring the reply because we're fetching the details from Database. */
        await interaction.deferReply({ephemeral: true});

        const query = {
            guildId: interaction.guildId,
            channelId: targetChannel.id,
        };

        /** Checking whether the channel has been already configured in Database. */
        const welcomeChannelExistInDb = await welcomeChannelSchema.exists(query);

        if (welcomeChannelExistInDb) {
            interaction.followUp(`${targetChannel} has been already configured to receive welcome messages. Remove this one or try with new channels.`);
            return;
        } 

        const newQuery = {
            guildId: interaction.guildId,
            channelId: targetChannel.id,
        };

        const newWelcomeChannel = new welcomeChannelSchema({
            ...newQuery,
        });

        /** Pushing the new details to Database */
        await newWelcomeChannel
            .save()
            .then(() => {
                interaction.followUp(`${targetChannel} is configured successfully to send welcome messages.`);
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