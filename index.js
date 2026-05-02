const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
ChannelType,
MessageFlags,
StringSelectMenuBuilder
} = require('discord.js');

const TOKEN = process.env.TOKEN;

// ===== IDs =====
const PANEL_CHANNEL_ID = "1498441200062169159";
const TICKET_PANEL_ID = "1498024704726929468";
const WELCOME_CHANNEL_ID = "1457160970811080910";

const XENON_CHANNEL_ID = "1439386475572756570";
const STANCE_CHANNEL_ID = "1363997615305523411";
const FAMILIE_CHANNEL_ID = "1442699333068783736";
const URLAUB_CHANNEL_ID = "1457161825530548416";

const SUPPORT_ROLE_ID = "1497953436514255089";
const CATEGORY_ID = "1321858825929621584";

const REGEL_CHANNEL_ID = "1457161026108919943";
const KUNDEN_ROLE_ID = "1363968895341559961";

// ===== DESIGN =====
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png";

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
});

const pending = new Map();
const newsData = new Map();

// ===== READY =====
client.once('clientReady', async () => {
console.log("✅ Bot online");

// PANEL
const panel = await client.channels.fetch(PANEL_CHANNEL_ID);
const msgs = await panel.messages.fetch({ limit: 10 });
await panel.bulkDelete(msgs, true).catch(() => {});

await panel.send({
embeds: [new EmbedBuilder()
.setColor(0x00ff00)
.setAuthor({ name: "Top Gear Performance", iconURL: LOGO })
.setThumbnail(LOGO)
.setDescription("Wähle eine Aktion")
.setImage(BANNER)],
components: [
new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('news').setLabel('📢 News').setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId('xenon').setLabel('🚗 Xenon').setStyle(ButtonStyle.Success),
new ButtonBuilder().setCustomId('stance').setLabel('🏁 Stance').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('familie').setLabel('🎨 Familie').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('urlaub').setLabel('🛫 Urlaub').setStyle(ButtonStyle.Success)
)
]
});

// HAUSORDNUNG
const regel = await client.channels.fetch(REGEL_CHANNEL_ID);
await regel.send({
embeds: [new EmbedBuilder()
.setColor(0x00ff00)
.setTitle("📋 Hausordnung")
.setDescription("Regeln lesen & akzeptieren!")
.setThumbnail(LOGO)
.setImage(BANNER)],
components: [
new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('verify').setLabel('✅ Akzeptieren').setStyle(ButtonStyle.Success)
)
]
});

// TICKET PANEL
const ticket = await client.channels.fetch(TICKET_PANEL_ID);
await ticket.send({
embeds: [new EmbedBuilder()
.setColor(0x00ff00)
.setTitle("Ticket System")
.setDescription("Erstelle ein Ticket")
.setThumbnail(LOGO)
.setImage(BANNER)],
components: [
new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('ticket').setLabel('🎟️ Ticket').setStyle(ButtonStyle.Success)
)
]
});
});

// ===== INTERACTION =====
client.on('interactionCreate', async interaction => {
try {

// ===== BUTTONS =====
if (interaction.isButton()) {

// NEWS BUTTON
if (interaction.customId === 'news') {
return interaction.showModal(
new ModalBuilder()
.setCustomId('news_modal')
.setTitle('News')
.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder().setCustomId('title').setLabel('Titel').setStyle(TextInputStyle.Short)
),
new ActionRowBuilder().addComponents(
new TextInputBuilder().setCustomId('text').setLabel('Text').setStyle(TextInputStyle.Paragraph)
)
)
);
}

// VERIFY
if (interaction.customId === 'verify') {
const role = interaction.guild.roles.cache.get(KUNDEN_ROLE_ID);
await interaction.member.roles.add(role);
return interaction.reply({ content: "✅ Verifiziert!", flags: MessageFlags.Ephemeral });
}

// TICKET
if (interaction.customId === 'ticket') {
const ch = await interaction.guild.channels.create({
name: `ticket-${interaction.user.username}`,
type: ChannelType.GuildText,
parent: CATEGORY_ID
});

ch.send({
content: `<@${interaction.user.id}>`,
embeds: [new EmbedBuilder().setTitle("Ticket erstellt")]
});

return interaction.reply({ content: "✅ Ticket erstellt", flags: MessageFlags.Ephemeral });
}

// XENON
if (interaction.customId === 'xenon') {
return interaction.showModal(
new ModalBuilder().setCustomId('xenon')
.setTitle('Xenon')
.addComponents(
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short)),
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('kz').setLabel('Kennzeichen').setStyle(TextInputStyle.Short)),
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('farbe').setLabel('Farbe').setStyle(TextInputStyle.Short))
)
);
}

// STANCE
if (interaction.customId === 'stance') {
return interaction.showModal(
new ModalBuilder().setCustomId('stance')
.setTitle('Stance')
.addComponents(
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short)),
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('kz').setLabel('Kennzeichen').setStyle(TextInputStyle.Short))
)
);
}

// FAMILIE
if (interaction.customId === 'familie') {
return interaction.showModal(
new ModalBuilder().setCustomId('familie')
.setTitle('Familie')
.addComponents(
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('primer').setLabel('Primer').setStyle(TextInputStyle.Short))
)
);
}

// URLAUB
if (interaction.customId === 'urlaub') {
return interaction.showModal(
new ModalBuilder().setCustomId('urlaub')
.setTitle('Urlaub')
.addComponents(
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('datum').setLabel('Zeitraum').setStyle(TextInputStyle.Short)),
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('grund').setLabel('Grund').setStyle(TextInputStyle.Paragraph))
)
);
}

}

// ===== MODALS =====
if (interaction.isModalSubmit()) {

// NEWS
if (interaction.customId === 'news_modal') {
newsData.set(interaction.user.id, {
title: interaction.fields.getTextInputValue('title'),
text: interaction.fields.getTextInputValue('text')
});

return interaction.reply({
content: "📢 News gespeichert (hier später erweitern)",
flags: MessageFlags.Ephemeral
});
}

// XENON / STANCE
if (interaction.customId === 'xenon' || interaction.customId === 'stance') {
pending.set(interaction.user.id, {
type: interaction.customId,
data: interaction.fields
});
return interaction.reply({ content: "📸 Bild senden!", flags: MessageFlags.Ephemeral });
}

// URLAUB
if (interaction.customId === 'urlaub') {
const embed = new EmbedBuilder()
.setTitle("Urlaub")
.setDescription(`${interaction.fields.getTextInputValue('datum')}\n${interaction.fields.getTextInputValue('grund')}`);

const ch = await client.channels.fetch(URLAUB_CHANNEL_ID);
ch.send({ embeds: [embed] });

return interaction.reply({ content: "✅ Gesendet", flags: MessageFlags.Ephemeral });
}

}

} catch (err) {
console.error(err);
}
});

// ===== IMAGE =====
client.on('messageCreate', async msg => {
if (!msg.attachments.size) return;

const data = pending.get(msg.author.id);
if (!data) return;

const embed = new EmbedBuilder().setImage(msg.attachments.first().url);

const ch = await client.channels.fetch(
data.type === 'xenon' ? XENON_CHANNEL_ID : STANCE_CHANNEL_ID
);

ch.send({ embeds: [embed] });
pending.delete(msg.author.id);
});

// ===== WELCOME =====
client.on('guildMemberAdd', member => {
const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
ch.send({ content: `Willkommen <@${member.id}> 🚗` });
});

client.login(TOKEN);
