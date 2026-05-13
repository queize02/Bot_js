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

// Récupération sécurisée du TOKEN
client.login(process.env.TOKEN);

const CHANNEL_ID = "1350539647154917537"; 

client.once('ready', () => {
    console.log(`✅ Bot connecté : ${client.user.tag}`);
});

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
                .setURL(`https://moviesforyour.ddns.net/admin/approve_form/${film_id}`)
            );

        await channel.send({ embeds: [embed], components: [row] });
        res.status(200).send("OK");
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur");
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));