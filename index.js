const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, REST, Routes } = require('discord.js');
const express = require('express');
const app = express();
const { commandData: suggererCommand, execute: executeSuggester } = require('./commands/suggerer');
const { commandData: listCommand, execute: executeList } = require('./commands/list');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

app.use(express.json());
const API_BASE = process.env.MFY_API_URL || 'http://flask_app:5000';
const PORT = process.env.PORT || 1000;

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
           // .setTitle(media_type === 'tv' ? '📢 Nouvelle Série !' : '📢 Nouveau Film !')
            //.setDescription(`**Titre :** ${titre}\n**Proposé par :** ${user}`)
            //.setThumbnail(affiche)
            //.setColor(media_type === 'tv' ? 0x00FF00 : 0xFF9900);

        await channel.send({ embeds: [embed] });
        res.status(200).send('Notification envoyée avec succès');
    } catch (error) {
        console.error("Erreur lors de l'envoi Discord :", error);
        res.status(500).send('Erreur lors de la notification');
    }
});

// Un seul serveur qui écoute sur le port fourni par Render
// -----------------------

// Récupération sécurisée du TOKEN
// Remplace client.login(process.env.TOKEN); par ceci :


const CHANNEL_ID = '1521888412754247955'; // Ton ID de salon Discord
const CHANNEL_ID2 = '1501949852387381480'; // Ton ID de salon Discord


client.once('ready', async () => {
    console.log(`✅ Bot Discord connecté : ${client.user.tag}`);
    console.log(`🌐 API_BASE = ${API_BASE}`);

    try {
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        const commandsToRegister = [suggererCommand.toJSON(), listCommand.toJSON()];
        const commandList = commandsToRegister.map((command) => `/${command.name}`).join(', ');
        const commandNames = commandsToRegister.map((command) => command.name);
        const route = process.env.GUILD_ID
            ? Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID)
            : Routes.applicationCommands(client.user.id);

        await rest.put(route, { body: commandsToRegister });
        console.log(`✅ ${commandsToRegister.length} slash command(s) chargée(s) : ${commandList}`);

        if (process.env.GUILD_ID) {
            const globalCommands = await rest.get(Routes.applicationCommands(client.user.id));
            for (const globalCommand of globalCommands) {
                if (commandNames.includes(globalCommand.name)) {
                    await rest.delete(Routes.applicationCommand(client.user.id, globalCommand.id));
                    console.log(`🗑️ Suppression de la commande globale en doublon : /${globalCommand.name}`);
                }
            }
        }
    } catch (error) {
        console.error('Erreur d’enregistrement de la slash command :', error);
    }
});

const suggererCommandName = suggererCommand.toJSON().name;
const listCommandName = listCommand.toJSON().name;

const commandHandlers = new Map([
    [suggererCommandName, executeSuggester],
    [listCommandName, executeList],
]);

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const handler = commandHandlers.get(interaction.commandName);
    if (!handler) return;

    await handler(interaction, API_BASE);
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur web actif sur le port ${PORT}`);
});
// --- DÉPLACE CECI TOUT EN BAS DU FICHIER ---
client.login(process.env.TOKEN).catch(err => {
    console.error("❌ ERREUR DE CONNEXION DISCORD :");
    console.error(err);
});

