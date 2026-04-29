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

const XENON_CHANNEL_ID = "1439386475572756570";
const STANCE_CHANNEL_ID = "1363997615305523411";
const FAMILIE_CHANNEL_ID = "1442699333068783736";

const SUPPORT_ROLE_ID = "1497953436514255089";
const CATEGORY_ID = "1321858825929621584";
const WELCOME_CHANNEL_ID = "1457160970811080910";

// ===== DESIGN =====
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png?ex=69f33857&is=69f1e6d7&hm=7259c0ea8487a73edb65d0d0197a164fe9d6ba671710d725eb9b5bb9302ff1c4&";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png?ex=69f3b8ce&is=69f2674e&hm=5004d65b23e2aeb492d1c837f10ea688e64a8aa19deecaa05e79539aca0d6ef4&";

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
          .setAuthor({ name: "📢 Button System", iconURL: LOGO })
          .setThumbnail(LOGO)
          .setDescription(
`📢 **Vorlage**
Erstelle ganz einfach eine Vorlage

🚗 **Aufträge**
Erstelle Xenon oder Stance

🎨 **Familie**
Wähle Kategorie und erstelle Auftrag`
          )
          .setImage(BANNER)
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('vorlage').setLabel('📢 Vorlage').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('xenon').setLabel('🚗 Xenon').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('stance').setLabel('🏁 Stance').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('familie').setLabel('🎨 Familie').setStyle(ButtonStyle.Secondary)
        )
      ]
    });
  }

  const ticketPanel = await client.channels.fetch(TICKET_PANEL_ID).catch(() => null);
  if (ticketPanel) {
    ticketPanel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setDescription("🎫 Ticket öffnen")
          .setImage(BANNER)
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('ticket').setLabel('🎟️ Ticket öffnen').setStyle(ButtonStyle.Success)
        )
      ]
    });
  }
});

// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {
  try {

    // ===== BUTTONS =====
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

      // 🎨 Familie
      if (interaction.customId === 'familie') {
        const menu = new StringSelectMenuBuilder()
          .setCustomId('familie_select')
          .setPlaceholder('Kategorie wählen')
          .addOptions([
            { label: 'Primer', value: 'Primer' },
            { label: 'Sekundär', value: 'Sekundär' },
            { label: 'Perleffekt', value: 'Perleffekt' },
            { label: 'Unterboden', value: 'Unterboden' },
            { label: 'Extra', value: 'Extra' }
          ]);

        await interaction.reply({
          content: "Kategorie wählen:",
          components: [new ActionRowBuilder().addComponents(menu)],
          ephemeral: true
        });
      }

      // 📢 Vorlage / Xenon / Stance (Modal)
      if (['vorlage', 'xenon', 'stance'].includes(interaction.customId)) {

        const modal = new ModalBuilder()
          .setCustomId(`modal_${interaction.customId}`)
          .setTitle("Auftrag erstellen");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('text')
              .setLabel('Beschreibung')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
          )
        );

        await interaction.showModal(modal);
      }
    }

    // ===== DROPDOWN =====
    else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'familie_select') {

        const typ = interaction.values[0];
        familieChoice.set(interaction.user.id, typ);

        const modal = new ModalBuilder()
          .setCustomId('familie_modal')
          .setTitle('Familien Auftrag')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('text')
                .setLabel('Beschreibung')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );

        await interaction.showModal(modal);
      }
    }

    // ===== MODAL =====
    else if (interaction.isModalSubmit()) {

      const text = interaction.fields.getTextInputValue('text');

      // 🎨 Familie
      if (interaction.customId === 'familie_modal') {
        const typ = familieChoice.get(interaction.user.id);

        const ch = await client.channels.fetch(FAMILIE_CHANNEL_ID).catch(() => null);
        if (ch) ch.send(`🎨 ${typ}: ${text}`);

        familieChoice.delete(interaction.user.id);

        return interaction.reply({ content: "✅ Gesendet!", ephemeral: true });
      }

      // 📢 Vorlage / Xenon / Stance
      const type = interaction.customId.replace("modal_", "");

      let channelId = null;
      if (type === 'xenon') channelId = XENON_CHANNEL_ID;
      if (type === 'stance') channelId = STANCE_CHANNEL_ID;
      if (type === 'vorlage') channelId = PANEL_CHANNEL_ID;

      const ch = await client.channels.fetch(channelId).catch(() => null);
      if (ch) ch.send(`📢 ${type.toUpperCase()}:\n${text}`);

      await interaction.reply({
        content: "✅ Auftrag gesendet!",
        ephemeral: true
      });
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
