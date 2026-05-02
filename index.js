const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require('discord.js');

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

// 👉 HIER DEIN CHANNEL
const PANEL_CHANNEL_ID = "1498441200062169159";

client.once('ready', async () => {
console.log("✅ Bot online");

// Channel holen
const channel = await client.channels.fetch(PANEL_CHANNEL_ID);

// alte Nachrichten löschen (optional)
const messages = await channel.messages.fetch({ limit: 10 });
await channel.bulkDelete(messages, true).catch(() => {});

// Panel senden
const embed = new EmbedBuilder()
.setColor(0x00ff00)
.setTitle("Mitarbeiter Panel")
.setDescription("Wähle eine Aktion");

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('news').setLabel('📢 News').setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId('xenon').setLabel('🚗 Xenon').setStyle(ButtonStyle.Success),
new ButtonBuilder().setCustomId('stance').setLabel('🏁 Stance').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('familie').setLabel('🎨 Familie').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('urlaub').setLabel('🛫 Urlaub').setStyle(ButtonStyle.Success)
);

await channel.send({
embeds: [embed],
components: [row]
});
});

client.login(TOKEN);
