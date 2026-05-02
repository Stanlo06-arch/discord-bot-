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

const vorlageData = new Map();
const vorlagePages = new Map();
const pending = new Map();

function buildMenus(userId) {

const data = vorlageData.get(userId);
const pages = vorlagePages.get(userId);

if (!data || !pages) return [];

const roleStart = pages.rolePage * 25;
const userStart = pages.userPage * 25;

const roleMenu = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId('select_roles')
.setPlaceholder(`🎭 Rollen Seite ${pages.rolePage + 1}`)
.setMinValues(0)
.setMaxValues(25)
.addOptions(data.roles.slice(roleStart, roleStart + 25))
);

const userMenu = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId('select_users')
.setPlaceholder(`👤 User Seite ${pages.userPage + 1}`)
.setMinValues(0)
.setMaxValues(25)
.addOptions(data.users.slice(userStart, userStart + 25))
);

const buttons = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('role_back').setLabel('⬅️ Rollen').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('role_next').setLabel('➡️ Rollen').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('user_back').setLabel('⬅️ User').setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId('user_next').setLabel('➡️ User').setStyle(ButtonStyle.Secondary)
);

const confirm = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('preview_news').setLabel('📢 Vorschau').setStyle(ButtonStyle.Success)
);

return [roleMenu, userMenu, buttons, confirm];
}
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
if (interaction.isButton()) {if (
interaction.customId === 'role_next' ||
interaction.customId === 'role_back' ||
interaction.customId === 'user_next' ||
interaction.customId === 'user_back'
) {

const pages = vorlagePages.get(interaction.user.id);
const data = vorlageData.get(interaction.user.id);

if (!pages || !data) return;

if (interaction.customId === 'role_next') pages.rolePage++;
if (interaction.customId === 'role_back') pages.rolePage--;

if (interaction.customId === 'user_next') pages.userPage++;
if (interaction.customId === 'user_back') pages.userPage--;

const maxRole = Math.ceil(data.roles.length / 25) - 1;
const maxUser = Math.ceil(data.users.length / 25) - 1;

if (pages.rolePage < 0) pages.rolePage = 0;
if (pages.rolePage > maxRole) pages.rolePage = maxRole;

if (pages.userPage < 0) pages.userPage = 0;
if (pages.userPage > maxUser) pages.userPage = maxUser;

vorlagePages.set(interaction.user.id, pages);

return interaction.update({
components: buildMenus(interaction.user.id)
});
}

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

// ===== NEWS =====
if (interaction.customId === 'news_modal') {

const roles = interaction.guild.roles.cache
.filter(r => r.name !== "@everyone")
.map(r => ({ label: r.name, value: `role_${r.id}` }));

const users = interaction.guild.members.cache
.map(m => ({ label: m.user.username, value: `user_${m.id}` }));

vorlageData.set(interaction.user.id, {
title: interaction.fields.getTextInputValue('title'),
text: interaction.fields.getTextInputValue('text'),
roles,
users,
selected: []
});

vorlagePages.set(interaction.user.id, {
rolePage: 0,
userPage: 0
});

return interaction.reply({
content: "🎯 Wähle Rollen & User:",
components: buildMenus(interaction.user.id),
flags: MessageFlags.Ephemeral
});
}

// ===== XENON / STANCE =====
if (interaction.customId === 'xenon' || interaction.customId === 'stance') {
pending.set(interaction.user.id, {
type: interaction.customId,
data: interaction.fields
});

return interaction.reply({
content: "📸 Bild senden!",
flags: MessageFlags.Ephemeral
});
}

// ===== URLAUB =====
if (interaction.customId === 'urlaub') {

const embed = new EmbedBuilder()
.setTitle("Urlaub")
.setDescription(
`${interaction.fields.getTextInputValue('datum')}

${interaction.fields.getTextInputValue('grund')}`
);

const ch = await client.channels.fetch(URLAUB_CHANNEL_ID);
await ch.send({ embeds: [embed] });

return interaction.reply({
content: "✅ Gesendet",
flags: MessageFlags.Ephemeral
});
}

// ===== FAMILIE =====
if (interaction.customId === 'familie') {

const embed = new EmbedBuilder()
.setTitle("🎨 Familie Auftrag")
.setDescription(
`Primer:
${interaction.fields.getTextInputValue('primer')}`
);

const ch = await client.channels.fetch(FAMILIE_CHANNEL_ID);
await ch.send({ embeds: [embed] });

return interaction.reply({
content: "✅ Gesendet",
flags: MessageFlags.Ephemeral
});
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
