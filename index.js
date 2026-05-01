// ================= IMPORTS =================
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

// ================= IDS =================
const PANEL_CHANNEL_ID = "1498441200062169159";
const TICKET_PANEL_ID = "1498024704726929468";
const WELCOME_CHANNEL_ID = "1457160970811080910";

const XENON_CHANNEL_ID = "1439386475572756570";
const STANCE_CHANNEL_ID = "1363997615305523411";
const FAMILIE_CHANNEL_ID = "1442699333068783736";

const SANKTION_CHANNEL_ID = "1457161680776597746";
const HAUSVERBOT_CHANNEL_ID = "1457161848209150104";
const URLAUB_CHANNEL_ID = "1457161825530548416";

const SUPPORT_ROLE_ID = "1497953436514255089";
const CATEGORY_ID = "1321858825929621584";

// ================= DESIGN =================
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png";

// ================= CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= STORAGE =================
const pending = new Map();
const newsData = new Map();
const newsPages = new Map();

// ================= READY =================
client.once('clientReady', async () => {
  console.log("✅ Bot online");

  const panel = await client.channels.fetch(PANEL_CHANNEL_ID);
  const msgs = await panel.messages.fetch({ limit: 10 });
  await panel.bulkDelete(msgs, true).catch(() => {});

  await panel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x00ff00)
        .setAuthor({ name: "Top Gear Performance", iconURL: LOGO })
        .setThumbnail(LOGO)
        .setDescription(`🚗 **Top Gear Performance – Mitarbeiter Panel**

🔧 **Wir liefern nur die beste Leistung für unsere Kunden**

Erstelle Aufträge schnell, präzise und auf höchstem Niveau  

Wähle unten die passende Aktion 👇  

🏁 **Qualität. Präzision. Performance.**`)
        .setImage(BANNER)
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('news').setLabel('📰 News').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('xenon').setLabel('🚗 Xenon').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('stance').setLabel('🏁 Stance').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('familie').setLabel('🎨 Familie').setStyle(ButtonStyle.Secondary)
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('sanktion').setLabel('⚖️ Sanktion').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('hausverbot').setLabel('🚫 Hausverbot').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('urlaub').setLabel('🛫 Urlaub').setStyle(ButtonStyle.Success)
      )
    ]
  });

  const ticketPanel = await client.channels.fetch(TICKET_PANEL_ID);
  await ticketPanel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("🎟️ Ticket System")
        .setDescription("Wenn du Hilfe brauchst, sind wir für dich da")
        .setThumbnail(LOGO)
        .setImage(BANNER)
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket').setLabel('🎟️ Ticket erstellen').setStyle(ButtonStyle.Success)
      )
    ]
  });
});

// ================= INTERACTIONS =================
client.on('interactionCreate', async interaction => {

  // ===== BUTTONS =====
  if (interaction.isButton()) {

    // ===== TICKET =====
    if (interaction.customId === 'ticket') {
      const ch = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.id}`,
        parent: CATEGORY_ID,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: ['ViewChannel'] },
          { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
          { id: SUPPORT_ROLE_ID, allow: ['ViewChannel', 'SendMessages'] }
        ]
      });

      ch.send(`👤 <@${interaction.user.id}>`);
      return interaction.reply({ content: "✅ Ticket erstellt!", flags: MessageFlags.Ephemeral });
    }

    // ===== NEWS =====
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

    // ===== STATUS =====
    if (['bezahlt','nicht_bezahlt','aufgehoben','nicht_aufgehoben'].includes(interaction.customId)) {

      if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID)) {
        return interaction.reply({ content: "❌ Nur Support!", flags: MessageFlags.Ephemeral });
      }

      const embed = EmbedBuilder.from(interaction.message.embeds[0]);

      if (interaction.customId === 'bezahlt') embed.data.fields[0].value = "🟢 Bezahlt";
      if (interaction.customId === 'nicht_bezahlt') embed.data.fields[0].value = "🔴 Nicht bezahlt";
      if (interaction.customId === 'aufgehoben') embed.data.fields[0].value = "🟢 Aufgehoben";
      if (interaction.customId === 'nicht_aufgehoben') embed.data.fields[0].value = "🔴 Nicht aufgehoben";

      return interaction.update({ embeds: [embed] });
    }

    // ===== SANKTION =====
    if (interaction.customId === 'sanktion') {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId('sanktion_modal')
          .setTitle('Sanktion')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId('grund').setLabel('Grund').setStyle(TextInputStyle.Paragraph)
            )
          )
      );
    }

    // ===== URLAUB =====
    if (interaction.customId === 'urlaub') {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId('urlaub_modal')
          .setTitle('Urlaub')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId('datum').setLabel('Datum').setStyle(TextInputStyle.Short)
            )
          )
      );
    }
  }

  // ===== MODALS =====
  if (interaction.isModalSubmit()) {

    if (interaction.customId === 'sanktion_modal') {
      const ch = await client.channels.fetch(SANKTION_CHANNEL_ID);

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("⚖️ Sanktion")
        .setDescription(`👤 <@${interaction.user.id}
📄 ${interaction.fields.getTextInputValue('grund')}`)
        .addFields({ name: "💰 Status", value: "🔴 Nicht bezahlt" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('bezahlt').setLabel('Bezahlt').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('nicht_bezahlt').setLabel('Nicht bezahlt').setStyle(ButtonStyle.Danger)
      );

      ch.send({ embeds: [embed], components: [row] });
      return interaction.reply({ content: "✅ Sanktion erstellt", flags: MessageFlags.Ephemeral });
    }
  }

});

// ===== LOGIN =====
client.login(TOKEN);
