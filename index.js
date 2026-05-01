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
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.TOKEN;

// ===== CONFIG =====
const PANEL_CHANNEL_ID = "1498441200062169159";
const TICKET_PANEL_ID = "1498024704726929468";
const CATEGORY_ID = "1321858825929621584";

const SUPPORT_ROLE_ID = "1497953436514255089";

const SANKTION_CHANNEL_ID = "1457161680776597746";
const HAUSVERBOT_CHANNEL_ID = "1457161848209150104";
const URLAUB_CHANNEL_ID = "1457161825530548416";

const LOG_CHANNEL_ID = "1496743068785709096";
const WELCOME_CHANNEL_ID = "1457160970811080910";

const GREEN = 0x00ff00;
const RED = 0xff0000;

// ===== TEMP =====
const newsData = new Map();

// ===== READY =====
client.once('ready', async () => {
  console.log("✅ Bot Online");

  const panel = await client.channels.fetch(PANEL_CHANNEL_ID);

  await panel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(GREEN)
        .setDescription(
`🚗 **Top Gear Performance – Mitarbeiter Panel**

🔧 **Wir liefern nur die beste Leistung für unsere Kunden**

Erstelle Aufträge schnell, präzise und auf höchstem Niveau  

Wähle unten die passende Aktion 👇  

🏁 **Qualität. Präzision. Performance.**`
        )
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('news').setLabel('📰 News').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('sanktion').setLabel('⚖️ Sanktion').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('hausverbot').setLabel('🚫 Hausverbot').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('urlaub').setLabel('🛫 Urlaub').setStyle(ButtonStyle.Success)
      )
    ]
  });

  // Ticket Panel
  const ticketPanel = await client.channels.fetch(TICKET_PANEL_ID);

  await ticketPanel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(GREEN)
        .setTitle("🎟️ Ticket System")
        .setDescription("Klicke unten um ein Ticket zu erstellen")
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_create')
          .setLabel('🎟️ Ticket erstellen')
          .setStyle(ButtonStyle.Success)
      )
    ]
  });
});

// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {

  // ===== BUTTONS =====
  if (interaction.isButton()) {

    // ===== TICKET =====
    if (interaction.customId === 'ticket_create') {

      const ch = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        parent: CATEGORY_ID,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: ['ViewChannel'] },
          { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
          { id: SUPPORT_ROLE_ID, allow: ['ViewChannel', 'SendMessages'] }
        ]
      });

      await ch.send(`👤 <@${interaction.user.id}>`);

      return interaction.reply({
        content: "✅ Ticket erstellt",
        flags: MessageFlags.Ephemeral
      });
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

    // ===== HAUSVERBOT =====
    if (interaction.customId === 'hausverbot') {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId('hausverbot_modal')
          .setTitle('Hausverbot')
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

    // ===== STATUS BUTTONS =====
    if (interaction.customId === 'bezahlt' || interaction.customId === 'nicht_bezahlt') {

      if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID)) {
        return interaction.reply({ content: "❌ Nur Support!", flags: MessageFlags.Ephemeral });
      }

      const embed = EmbedBuilder.from(interaction.message.embeds[0]);

      embed.data.fields[0].value =
        interaction.customId === 'bezahlt'
          ? "🟢 Bezahlt"
          : "🔴 Nicht bezahlt";

      return interaction.update({ embeds: [embed] });
    }
  }

  // ===== MODALS =====
  if (interaction.isModalSubmit()) {

    // NEWS → Auswahl
    if (interaction.customId === 'news_modal') {

      const channels = interaction.guild.channels.cache
        .filter(c => c.type === ChannelType.GuildText)
        .map(c => ({ label: c.name, value: c.id }));

      newsData.set(interaction.user.id, {
        title: interaction.fields.getTextInputValue('title'),
        text: interaction.fields.getTextInputValue('text')
      });

      return interaction.reply({
        components: [
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('news_channel')
              .addOptions(channels.slice(0, 25))
          )
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    // SANKTION SEND
    if (interaction.customId === 'sanktion_modal') {

      const ch = await client.channels.fetch(SANKTION_CHANNEL_ID);

      const embed = new EmbedBuilder()
        .setColor(RED)
        .setTitle("⚖️ Sanktion")
        .setDescription(`👤 <@${interaction.user.id}>
📄 ${interaction.fields.getTextInputValue('grund')}`)
        .addFields({ name: "💰 Status", value: "🔴 Nicht bezahlt" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('bezahlt').setLabel('Bezahlt').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('nicht_bezahlt').setLabel('Nicht bezahlt').setStyle(ButtonStyle.Danger)
      );

      ch.send({ embeds: [embed], components: [row] });

      return interaction.reply({ content: "✅ Sanktion erstellt", flags: MessageFlags.Ephemeral });
    }

    return interaction.reply({ content: "✅ Gesendet", flags: MessageFlags.Ephemeral });
  }

  // ===== SELECT =====
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === 'news_channel') {

      const data = newsData.get(interaction.user.id);
      if (!data) return;

      const ch = await client.channels.fetch(interaction.values[0]);

      ch.send({
        embeds: [
          new EmbedBuilder()
            .setColor(GREEN)
            .setTitle(data.title)
            .setDescription(data.text)
        ]
      });

      newsData.delete(interaction.user.id);

      return interaction.update({ content: "✅ News gesendet!", components: [] });
    }
  }
});

// ===== WELCOME =====
client.on('guildMemberAdd', member => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (ch) ch.send(`👋 Willkommen <@${member.id}>`);
});

// ===== LOG =====
client.on('messageDelete', msg => {
  if (!msg.guild) return;
  const ch = msg.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (ch) ch.send(`🗑️ Nachricht gelöscht: ${msg.content || "Keine Inhalte"}`);
});

client.login(TOKEN);
