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

// ===== IDs =====
const PANEL_CHANNEL_ID = "1498441200062169159";

// ===== DESIGN =====
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png";

client.once('ready', async () => {
console.log("✅ Bot online");

const channel = await client.channels.fetch(PANEL_CHANNEL_ID);

// Nachrichten holen
const messages = await channel.messages.fetch({ limit: 10 });

// Panel suchen
const panelMsg = messages.find(msg =>
msg.author.id === client.user.id &&
msg.embeds.length &&
msg.embeds[0].title?.includes("Mitarbeiter Panel")
);

// Embed
const embed = new EmbedBuilder()
.setColor(0x00ff00)
.setAuthor({ name: "Top Gear Performance", iconURL: LOGO })
.setThumbnail(LOGO)
.setTitle("🔧 Mitarbeiter Panel")
.setDescription("Wähle eine Aktion")
.setImage(BANNER);

// Buttons
const row = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('news').setLabel('📢 News').setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId('xenon').setLabel('🚗 Xenon').setStyle(ButtonStyle.Success),
new ButtonBuilder().setCustomId('stance').setLabel('🏁 Stance').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('familie').setLabel('🎨 Familie').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('urlaub').setLabel('🛫 Urlaub').setStyle(ButtonStyle.Success)
);

// 👉 UPDATE ODER SEND
if (panelMsg) {
await panelMsg.edit({
embeds: [embed],
components: [row]
});
console.log("♻️ Panel aktualisiert");
} else {
await channel.send({
embeds: [embed],
components: [row]
});
console.log("🆕 Panel erstellt");
}
});
client.login(TOKEN);
