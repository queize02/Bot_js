const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// 1. Définition de la commande (ce que Discord affiche)
const commandData = new SlashCommandBuilder()
    .setName('list')
    .setDescription('Voir la liste des films et séries présents sur le site');

// 2. Logique d'exécution
async function execute(interaction, apiBase) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const response = await axios.get(`${apiBase}/api/medias`);
        const medias = Array.isArray(response.data) ? response.data : [];

        if (medias.length === 0) {
            return interaction.editReply('Aucun film ou série approuvé n’est actuellement disponible sur le site.');
        }

        const films = medias.filter((media) => media.media_type !== 'tv');
        const series = medias.filter((media) => media.media_type === 'tv');

        const buildList = (items) => items.slice(0, 10).map((media, idx) => `${idx + 1}. ${media.titre}`).join('\n') || 'Aucun élément.';
        const moreFilms = films.length > 10 ? `\n... et ${films.length - 10} films supplémentaires.` : '';
        const moreSeries = series.length > 10 ? `\n... et ${series.length - 10} séries supplémentaires.` : '';

        const embed = new EmbedBuilder()
            .setTitle('🎬 Médias disponibles sur le site')
            .setDescription(`Total : ${medias.length} médias (${films.length} films, ${series.length} séries)`)
            .addFields(
                { name: `Films (${films.length})`, value: buildList(films) + moreFilms, inline: false },
                { name: `Séries (${series.length})`, value: buildList(series) + moreSeries, inline: false }
            )
            .setColor(0x1F8B4C)
            .setFooter({ text: 'Affiché depuis le catalogue approuvé' });

        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Erreur /list :', error?.response?.data || error.message || error);
        return interaction.editReply('❌ Impossible de récupérer la liste des médias pour le moment.');
    }
}

module.exports = { commandData, execute };