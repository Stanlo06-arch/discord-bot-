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
  ChannelType,
  MessageFlags,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const TOKEN = process.env.TOKEN;

// ===== IDs =====
const CLIENT_ID = "1496235501139660980";
const GUILD_ID = "1321858825401401426";

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
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const pending = new Map();
const familieChoice = new Map();

// ===== LOG =====
function log(text) {
  const ch = client.channels.cache.get(LOG_CHANNEL_ID);
  if (ch) ch.send(text);
}

// ===== READY =====
client.once('clientReady', async () => {

  // 📢 PANEL
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

  // 🎟️ TICKET PANEL
  const ticketPanel = await client.channels.fetch(TICKET_PANEL_ID).catch(() => null);
  if (ticketPanel) {
    ticketPanel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setAuthor({ name: "🎫 Ticket öffnen", iconURL: LOGO })
          .setThumbnail(LOGO)
          .setDescription(
`🎫 Ticket öffnen

Hast du Probleme oder Fragen?
Mach ein Ticket auf

Wir helfen dir gerne!`
          )
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

  // ===== BUTTONS =====
  if (interaction.isButton()) {

    // 🎟️ TICKET
    if (interaction.customId === 'ticket') {

      const ch = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: SUPPORT_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
      });

      ch.send(`🎟️ Support für <@${interaction.user.id}>`);
      log(`🎟️ Ticket | ${interaction.user.tag}`);

      return interaction.reply({
        content: "✅ Ticket erstellt!",
        flags: MessageFlags.Ephemeral
      });
    }

    // 🎨 FAMILIE BUTTON
    if (interaction.customId === 'familie') {

      const menu = new StringSelectMenuBuilder()
        .setCustomId('familie_select')
        .setPlaceholder('Kategorie auswählen')
        .addOptions([
          { label: 'Primer', value: 'Primer' },
          { label: 'Sekundär', value: 'Sekundär' },
          { label: 'Perleffekt', value: 'Perleffekt' },
          { label: 'Unterboden', value: 'Unterboden' },
          { label: 'Extra', value: 'Extra' }
        ]);

      return interaction.reply({
        content: "Kategorie wählen:",
        components: [new ActionRowBuilder().addComponents(menu)],
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // ===== DROPDOWN =====
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === 'familie_select') {

      const typ = interaction.values[0];
      familieChoice.set(interaction.user.id, typ);

      await interaction.deferUpdate();

      const modal = new ModalBuilder()
        .setCustomId('familie_modal')
        .setTitle('Familien Auftrag');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('text')
            .setLabel('Beschreibung')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );

      return interaction.showModal(modal);
    }
  }

  // ===== MODAL =====
  if (interaction.isModalSubmit()) {

    if (interaction.customId === 'familie_modal') {

      const typ = familieChoice.get(interaction.user.id);
      const text = interaction.fields.getTextInputValue('text');

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setAuthor({ name: "🎨 Familien Auftrag", iconURL: LOGO })
        .setThumbnail(LOGO)
        .addFields(
          { name: "Typ", value: typ },
          { name: "Beschreibung", value: text }
        );

      const ch = interaction.client.channels.cache.get(FAMILIE_CHANNEL_ID);
      if (ch) ch.send({ embeds: [embed] });

      log(`🎨 Familie | ${interaction.user.tag} | ${typ}`);

      return interaction.reply({
        content: "✅ Auftrag gesendet!",
        flags: MessageFlags.Ephemeral
      });
    }
  }

});

// ===== WELCOME =====
client.on('guildMemberAdd', member => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (ch) {
    ch.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setAuthor({ name: "Willkommen!", iconURL: LOGO })
          .setThumbnail(LOGO)
          .setDescription(`Willkommen <@${member.id}>`)
          .setImage(BANNER)
      ]
    });
  }
  log(`👋 Join: ${member.user.tag}`);
});

client.login(TOKEN);
