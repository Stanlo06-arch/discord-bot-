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
StringSelectMenuBuilder 
} = require('discord.js');

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

const newsData = new Map();
const newsPages = new Map();

function buildMenus(userId) {

const data = newsData.get(userId);
const pages = newsPages.get(userId);

if (!data || !pages) return [];

const roleStart = pages.rolePage * 25;
const userStart = pages.userPage * 25;

const roleMenu = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId('select_roles')
.setPlaceholder(`🎭 Rollen Seite ${pages.rolePage + 1}`)
.setMinValues(0)
.setMaxValues(25)
.addOptions(
  data.roles.length
    ? data.roles.slice(roleStart, roleStart + 25)
    : [{ label: "Keine Rollen", value: "none_role" }]
)

const userMenu = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId('select_users')
.setPlaceholder(`👤 User Seite ${pages.userPage + 1}`)
.setMinValues(0)
.setMaxValues(25)
.addOptions(
  data.users.length
    ? data.users.slice(userStart, userStart + 25)
    : [{ label: "Keine User", value: "none_user" }]
)

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

// ===== IDs =====
const PANEL_CHANNEL_ID = "1498441200062169159";

// ===== DESIGN =====
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png";

client.once('clientReady', async () => {
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

client.on('interactionCreate', async interaction => {
try {

// BUTTON
if (interaction.isButton()) {

  if (interaction.customId === 'preview_news') {

const data = newsData.get(interaction.user.id);
if (!data) return;

const mentions = (data.selected || []).map(x => {
if (x.startsWith("role_")) return `<@&${x.replace("role_", "")}>`;
if (x.startsWith("user_")) return `<@${x.replace("user_", "")}>`;
}).filter(Boolean).join(" ");
    
const embed = new EmbedBuilder()
.setColor(0x00ff00)
.setTitle(data.title)
.setDescription(`${mentions}\n\n${data.text}`);

return interaction.update({
content: "📢 Vorschau:",
embeds: [embed],
components: []
});
}

  // PAGINATION
if (
interaction.customId === 'role_next' ||
interaction.customId === 'role_back' ||
interaction.customId === 'user_next' ||
interaction.customId === 'user_back'
) {

const pages = newsPages.get(interaction.user.id);
const data = newsData.get(interaction.user.id);
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

newsPages.set(interaction.user.id, pages);

return interaction.update({
components: buildMenus(interaction.user.id)
});
}

if (interaction.customId === 'news') {
return interaction.showModal(
new ModalBuilder()
.setCustomId('news_modal')
.setTitle('📢 News erstellen')
.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId('title')
.setLabel('Titel')
.setStyle(TextInputStyle.Short)
),
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId('text')
.setLabel('Text')
.setStyle(TextInputStyle.Paragraph)
)
)
);
}

}

  if (interaction.isStringSelectMenu()) {

const data = newsData.get(interaction.user.id);
if (!data) return;

// 👉 HIER ist der BONUS FIX
const filtered = interaction.values.filter(v => !v.startsWith("none_"));

data.selected = [...new Set([...(data.selected || []), ...filtered])];

newsData.set(interaction.user.id, data);

return interaction.reply({
content: `✅ ${data.selected.length} ausgewählt`,
flags: 64
});
}

// MODAL
if (interaction.isModalSubmit()) {

  if (interaction.customId === 'news_modal') {

    const title = interaction.fields.getTextInputValue('title');
    const text = interaction.fields.getTextInputValue('text');

    const roles = interaction.guild.roles.cache
      .filter(r => r.name !== "@everyone")
      .map(r => ({
        label: r.name,
        value: `role_${r.id}`
      }));

    const users = interaction.guild.members.cache
      .map(m => ({
        label: m.user.username,
        value: `user_${m.id}`
      }));

    newsData.set(interaction.user.id, {
      title,
      text,
      roles,
      users,
      selected: []
    });

    // 👉 WICHTIG
    newsPages.set(interaction.user.id, {
      rolePage: 0,
      userPage: 0
    });

    return interaction.reply({
      content: "🎯 Wähle Rollen & User:",
      components: buildMenus(interaction.user.id),
      flags: 64
    });
  }
}

} catch (err) {
  console.error(err);
}
});

client.login(TOKEN);
