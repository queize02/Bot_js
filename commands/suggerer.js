const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');

const commandData = new SlashCommandBuilder()
    .setName('suggerer')
    .setDescription('Proposer un film ou une série à l’assistant')
    .addStringOption((option) =>
        option
            .setName('titre')
            .setDescription('Titre du film ou de la série à proposer')
            .setRequired(true)
    );

async function execute(interaction, apiBase) {
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
}

module.exports = { commandData, execute };
