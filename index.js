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
app.post('/nouvelle-suggestion', async (req, res) => {
    const { titre, media_type, user, affiche } = req.body;
    console.log(`🤖 Notification reçue pour : ${titre}`);

    try {
        const channel = await client.channels.fetch('1350539647154917537'); // Ton ID de salon
        
        const embed = new EmbedBuilder()
            .setTitle(media_type === 'tv' ? '📢 Nouvelle Série !' : '📢 Nouveau Film !')
            .setDescription(`**Titre :** ${titre}\n**Proposé par :** ${user}`)
            .setThumbnail(affiche)
            .setColor(media_type === 'tv' ? 0x00FF00 : 0xFF9900);

        await channel.send({ embeds: [embed] });
        res.status(200).send('Notification envoyée avec succès');
    } catch (error) {
        console.error("Erreur lors de l'envoi Discord :", error);
        res.status(500).send('Erreur lors de la notification');
    }
});

// Un seul serveur qui écoute sur le port fourni par Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur web actif sur le port ${PORT}`);
});
// -------------------------------------

// Récupération sécurisée du TOKEN
// Remplace client.login(process.env.TOKEN); par ceci :


const CHANNEL_ID = '1350539647154917537'; // Ton ID de salon Discord
const CHANNEL_ID2 = '1501949852387381480'; // Ton ID de salon Discord


client.once('ready', () => {
    console.log(`✅ Bot Discord connecté : ${client.user.tag}`);
});

// Route pour recevoir les suggestions du site Python
// Route pour recevoir les suggestions du site Python

app.post('/admin_manuel', async (req, res) => {
    try {
        // Ajout de media_type dans la déstructuration
        const { titre, affiche, media_type } = req.body; 
        const channel = await client.channels.fetch(CHANNEL_ID2);

        // Logique dynamique
        const titreEmbed = (media_type === 'tv') ? '🎬 Série ajoutée' : '🎬 Film ajouté';
        const descriptionEmbed = (media_type === 'tv') ? `La série **${titre}** est disponible ! 🔥` : `Le film **${titre}** est disponible ! 🔥`;

        const embed = new EmbedBuilder()
            .setTitle(titreEmbed)
            .setDescription(descriptionEmbed)
            .setThumbnail(affiche)
            .setColor(0x00FF00);

        await channel.send({ embeds: [embed] });
        res.status(200).send('Notification envoyée');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur bot');
    }
});
// Ajoute ceci dans index.js
const axios = require('axios'); // Assure-toi d'avoir fait 'npm install axios'

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!suggerer ')) {
        const titre = message.content.replace('!suggerer ', '').trim();
        const user = message.author.username;

        try {
            // Appel à ton API Flask
            await axios.post('https://movies-for-you-kpxa.onarender.com/api/discord_suggerer', {
                titre: titre,
                user: user
            });
            message.reply(`✅ La demande pour **${titre}** a été envoyée !`);
        } catch (error) {
            message.reply("❌ Erreur : Film introuvable ou serveur indisponible.");
        }
    }
});

// --- DÉPLACE CECI TOUT EN BAS DU FICHIER ---
client.login(process.env.TOKEN).catch(err => {
    console.error("❌ ERREUR DE CONNEXION DISCORD :");
    console.error(err);
});