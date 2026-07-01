const axios = require('axios');
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const COMMAND_NAME = 'suggerer';
const COMMAND_DESCRIPTION = 'Proposer un film ou une série à l’assistant';

const commandData = new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(COMMAND_DESCRIPTION)
    .addStringOption((option) =>
        option
            .setName('titre')
            .setDescription('Titre du film ou de la série à proposer')
            .setRequired(true)
    );

function register(client, apiBase) {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName !== COMMAND_NAME) return;

        const titre = interaction.options.getString('titre', true);
        const user = interaction.user.username;

        await interaction.deferReply({ ephemeral: true });

        try {
            const response = await axios.post(`${apiBase}/api/discord_suggerer`, {
                titre,
                user
            });

            if (response?.data?.status === 'success') {
                return interaction.editReply(`✅ La demande pour **${titre}** a été envoyée !`);
            }

            console.error('Suggester command failed:', response.status, response.data);
            return interaction.editReply('❌ Erreur : film introuvable ou réponse inattendue du serveur.');
        } catch (error) {
            console.error('Erreur /suggerer :', error?.response?.data || error.message || error);
            return interaction.editReply('❌ Erreur : serveur indisponible ou problème avec l’API.');
        }
    });

    client.once('ready', async () => {
        try {
            const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
            const route = process.env.GUILD_ID
                ? Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID)
                : Routes.applicationCommands(client.user.id);

            await rest.put(route, { body: [commandData.toJSON()] });
            console.log(`✅ Slash command "/${COMMAND_NAME}" enregistrée`);
        } catch (error) {
            console.error('Erreur d’enregistrement de la slash command :', error);
        }
    });
}

module.exports = { register };
