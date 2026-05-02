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
StringSelectMenuBuilder,
MessageFlags
} = require('discord.js');

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent
]
});

const TOKEN = process.env.TOKEN;

// ===== IDs =====
const PANEL_CHANNEL_ID = "1498441200062169159";
const REGEL_CHANNEL_ID = "1457161026108919943";
const TICKET_PANEL_ID = "1498024704726929468";
const CATEGORY_ID = "1321858825929621584";
const SUPPORT_ROLE_ID = "1497953436514255089";
const KUNDEN_ROLE_ID = "1363968895341559961";

const XENON_CHANNEL_ID = "1439386475572756570";
const STANCE_CHANNEL_ID = "1363997615305523411";
const FAMILIE_CHANNEL_ID = "1442699333068783736";
const URLAUB_CHANNEL_ID = "1457161825530548416";
const WELCOME_CHANNEL_ID = "1457160970811080910";

// ===== STORAGE =====
const pending = new Map();
const newsData = new Map();
const pages = new Map();

// ===== READY =====
client.once('ready', async () => {
console.log("✅ Online");

// PANEL
const panel = await client.channels.fetch(PANEL_CHANNEL_ID);
await panel.send({
embeds: [new EmbedBuilder().setDescription("Wähle")],
components: [new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('news').setLabel('News').setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId('xenon').setLabel('Xenon').setStyle(ButtonStyle.Success),
new ButtonBuilder().setCustomId('stance').setLabel('Stance').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('familie').setLabel('Familie').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('urlaub').setLabel('Urlaub').setStyle(ButtonStyle.Success)
)]
});

// REGELN
const regel = await client.channels.fetch(REGEL_CHANNEL_ID);
await regel.send({
content: "📋 Regeln akzeptieren",
components: [new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('verify').setLabel('Akzeptieren').setStyle(ButtonStyle.Success)
)]
});

// TICKET PANEL
const ticket = await client.channels.fetch(TICKET_PANEL_ID);
await ticket.send({
content: "🎟️ Ticket",
components: [new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('ticket').setLabel('Ticket erstellen').setStyle(ButtonStyle.Success)
)]
});
});

// ===== INTERACTION =====
client.on('interactionCreate', async interaction => {
try {

// BUTTONS
if (interaction.isButton()) {

// VERIFY
if (interaction.customId === 'verify') {
await interaction.member.roles.add(KUNDEN_ROLE_ID);
return interaction.reply({ content: "✅ Verifiziert", flags: MessageFlags.Ephemeral });
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
components: [new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('close').setLabel('Schließen').setStyle(ButtonStyle.Danger)
)]
});

return interaction.reply({ content: "Ticket erstellt", flags: MessageFlags.Ephemeral });
}

// CLOSE
if (interaction.customId === 'close') {
if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID))
return interaction.reply({ content: "Nur Support", flags: MessageFlags.Ephemeral });

setTimeout(() => interaction.channel.delete(), 3000);
return interaction.reply("Schließt...");
}

// NEWS
if (interaction.customId === 'news') {
return interaction.showModal(
new ModalBuilder().setCustomId('news')
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

// XENON
if (interaction.customId === 'xenon') {
return interaction.showModal(
new ModalBuilder().setCustomId('xenon')
.setTitle('Xenon')
.addComponents(
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short))
)
);
}

// STANCE
if (interaction.customId === 'stance') {
return interaction.showModal(
new ModalBuilder().setCustomId('stance')
.setTitle('Stance')
.addComponents(
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short))
)
);
}

// FAMILIE
if (interaction.customId === 'familie') {
return interaction.showModal(
new ModalBuilder().setCustomId('familie')
.setTitle('Familie')
.addComponents(
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('text').setLabel('Text').setStyle(TextInputStyle.Paragraph))
)
);
}

// URLAUB
if (interaction.customId === 'urlaub') {
return interaction.showModal(
new ModalBuilder().setCustomId('urlaub')
.setTitle('Urlaub')
.addComponents(
new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('text').setLabel('Grund').setStyle(TextInputStyle.Paragraph))
)
);
}

}

// MODALS
if (interaction.isModalSubmit()) {

// NEWS
if (interaction.customId === 'news') {

const roles = interaction.guild.roles.cache.map(r => ({
label: r.name,
value: r.id
}));

const users = interaction.guild.members.cache.map(m => ({
label: m.user.username,
value: m.id
}));

newsData.set(interaction.user.id, {
title: interaction.fields.getTextInputValue('title'),
text: interaction.fields.getTextInputValue('text'),
roles,
users,
selected: []
});

return interaction.reply({
content: "Wähle Rollen/User",
components: [new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder().setCustomId('select')
.setMinValues(0).setMaxValues(25)
.addOptions(roles.slice(0,25))
)],
flags: MessageFlags.Ephemeral
});
}

// XENON / STANCE
if (interaction.customId === 'xenon' || interaction.customId === 'stance') {
pending.set(interaction.user.id, interaction.customId);
return interaction.reply({ content: "Bild senden", flags: MessageFlags.Ephemeral });
}

// FAMILIE
if (interaction.customId === 'familie') {
const ch = await client.channels.fetch(FAMILIE_CHANNEL_ID);
ch.send(interaction.fields.getTextInputValue('text'));
return interaction.reply({ content: "Gesendet", flags: MessageFlags.Ephemeral });
}

// URLAUB
if (interaction.customId === 'urlaub') {
const ch = await client.channels.fetch(URLAUB_CHANNEL_ID);
ch.send(interaction.fields.getTextInputValue('text'));
return interaction.reply({ content: "Gesendet", flags: MessageFlags.Ephemeral });
}

}

// SELECT
if (interaction.isStringSelectMenu()) {
return interaction.reply({ content: "Ausgewählt", flags: MessageFlags.Ephemeral });
}

} catch (err) {
console.error(err);
}
});

// IMAGE
client.on('messageCreate', async msg => {
if (!msg.attachments.size) return;

const type = pending.get(msg.author.id);
if (!type) return;

const ch = await client.channels.fetch(
type === 'xenon' ? XENON_CHANNEL_ID : STANCE_CHANNEL_ID
);

ch.send({ files: [msg.attachments.first().url] });
pending.delete(msg.author.id);
});

// WELCOME
client.on('guildMemberAdd', member => {
const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
ch.send(`Willkommen <@${member.id}> 🚗`);
});

client.login(TOKEN);
