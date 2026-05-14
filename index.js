const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

app.use(express.json());

// --- SECTION UPTIME ROBOT / RENDER ---
// Cette route répond à UptimeRobot pour garder le bot éveillé
app.get('/', (req, res) => {
    res.send('✅ Le Bot MFY est en ligne et opérationnel !');
});

// Un seul serveur qui écoute sur le port fourni par Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur web actif sur le port ${PORT}`);
});
// -------------------------------------

// Récupération sécurisée du TOKEN
// Remplace client.login(process.env.TOKEN); par ceci :
client.login(process.env.TOKEN).catch(err => {
    console.error("❌ ERREUR DE CONNEXION DISCORD :");
    console.error(err);
});

const CHANNEL_ID = '1350539647154917537'; // Ton ID de salon Discord

client.once('ready', () => {
    console.log(`✅ Bot Discord connecté : ${client.user.tag}`);
});

// Route pour recevoir les suggestions du site Python
app.post('/nouvelle-suggestion', async (req, res) => {
    try {
        const { titre, user, affiche, film_id } = req.body;
        const channel = await client.channels.fetch(CHANNEL_ID);

        const embed = new EmbedBuilder()
            .setTitle('💡 Nouvelle suggestion')
            .setDescription(`Film : **${titre}**\nProposé par : **${user}**`)
            .setThumbnail(affiche)
            .setColor(0x00FF00);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('🔗 Gérer la demande')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://moviesforyou.ddns.net/admin/approve_form/${film_id}`)
        );

        await channel.send({ embeds: [embed], components: [row] });
        res.status(200).send('Notification envoyée');
    } catch (error) {
        console.error("Erreur bot:", error);
        res.status(500).send('Erreur lors de l\'envoi');
    }
});