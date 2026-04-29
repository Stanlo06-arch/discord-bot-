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
  StringSelectMenuBuilder,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

const TOKEN = process.env.TOKEN;

// ===== IDs =====
const PANEL_CHANNEL_ID = "1498441200062169159";
const TICKET_PANEL_ID = "1498024704726929468";
const LOG_CHANNEL_ID = "1496743068785709096";
const FAMILIE_CHANNEL_ID = "1442699333068783736";

const SUPPORT_ROLE_ID = "1497953436514255089";
const CATEGORY_ID = "1321858825929621584";
const WELCOME_CHANNEL_ID = "1457160970811080910";

// ===== DESIGN =====
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image.png";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const familieChoice = new Map();

// ===== LOG =====
async function log(text) {
  const ch = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
  if (ch) ch.send(text);
}

// ===== READY =====
client.once('clientReady', async () => {
  console.log("✅ Bot online");

  const panel = await client.channels.fetch(PANEL_CHANNEL_ID).catch(() => null);
  if (panel) {
    panel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setDescription("📢 Button System")
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('familie').setLabel('🎨 Familie').setStyle(ButtonStyle.Primary)
        )
      ]
    });
  }

  const ticketPanel = await client.channels.fetch(TICKET_PANEL_ID).catch(() => null);
  if (ticketPanel) {
    ticketPanel.send({
      content: "🎟️ Ticket öffnen",
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('ticket').setLabel('Ticket').setStyle(ButtonStyle.Success)
        )
      ]
    });
  }
});

// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {
  try {

    // ===== BUTTON =====
    if (interaction.isButton()) {

      // 🎟️ Ticket
      if (interaction.customId === 'ticket') {

        await interaction.deferReply({ ephemeral: true });

        const ch = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.id}`,
          type: ChannelType.GuildText,
          parent: CATEGORY_ID,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: ['ViewChannel'] },
            { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
            { id: SUPPORT_ROLE_ID, allow: ['ViewChannel', 'SendMessages'] }
          ]
        });

        ch.send(`🎟️ Support für <@${interaction.user.id}>`);
        await interaction.editReply("✅ Ticket erstellt!");
      }

      // 🎨 Familie Button
      if (interaction.customId === 'familie') {
        const menu = new StringSelectMenuBuilder()
          .setCustomId('familie_select')
          .setPlaceholder('Kategorie wählen')
          .addOptions([
            { label: 'Primer', value: 'Primer' },
            { label: 'Sekundär', value: 'Sekundär' }
          ]);

        await interaction.reply({
          content: "Wähle Kategorie:",
          components: [new ActionRowBuilder().addComponents(menu)],
          ephemeral: true
        });
      }
    }

    // ===== DROPDOWN =====
    else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'familie_select') {

        const typ = interaction.values[0];
        familieChoice.set(interaction.user.id, typ);

        const modal = new ModalBuilder()
          .setCustomId('familie_modal')
          .setTitle('Familie Auftrag')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('text')
                .setLabel('Beschreibung')
                .setStyle(TextInputStyle.Paragraph)
            )
          );

        await interaction.showModal(modal);
      }
    }

    // ===== MODAL =====
    else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'familie_modal') {

        const typ = familieChoice.get(interaction.user.id);
        const text = interaction.fields.getTextInputValue('text');

        const ch = await client.channels.fetch(FAMILIE_CHANNEL_ID).catch(() => null);

        if (ch) {
          ch.send(`🎨 ${typ}: ${text}`);
        }

        familieChoice.delete(interaction.user.id);

        await interaction.reply({
          content: "✅ Gesendet!",
          ephemeral: true
        });
      }
    }

  } catch (err) {
    console.error(err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Fehler!",
        ephemeral: true
      });
    }
  }
});

// ===== WELCOME =====
client.on('guildMemberAdd', async member => {
  const ch = await member.guild.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);
  if (ch) {
    ch.send(`Willkommen <@${member.id}>`);
  }
});

client.login(TOKEN);
