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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.TOKEN;

// ===== IDS =====
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

// ===== DESIGN =====
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png";

// ===== STORAGE =====
const pending = new Map();
const newsData = new Map();
const newsPages = new Map();

// ===== READY =====
client.once('ready', async () => {
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

Wähle unten die passende Aktion 👇`)
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
        .setDescription("Klicke unten um ein Ticket zu erstellen")
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

// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {

  if (interaction.isButton()) {

    // ===== TICKET =====
    if (interaction.customId === 'ticket') {
      const ch = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.id}`,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: ['ViewChannel'] },
          { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
          { id: SUPPORT_ROLE_ID, allow: ['ViewChannel', 'SendMessages'] }
        ]
      });

      await ch.send(`<@${interaction.user.id}>`);
      return interaction.reply({ content: "✅ Ticket erstellt!", flags: MessageFlags.Ephemeral });
    }

    // ===== MODALS =====
    if (interaction.customId === 'xenon' || interaction.customId === 'stance') {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId(interaction.customId)
          .setTitle(interaction.customId.toUpperCase())
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId('kz').setLabel('Kennzeichen').setStyle(TextInputStyle.Short)
            ),
            ...(interaction.customId === 'xenon'
              ? [new ActionRowBuilder().addComponents(
                  new TextInputBuilder().setCustomId('farbe').setLabel('Farbe').setStyle(TextInputStyle.Short)
                )]
              : [])
          )
      );
    }

    if (interaction.customId === 'familie') {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId('familie')
          .setTitle('Familie')
          .addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('primer').setLabel('Primer').setStyle(TextInputStyle.Short)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('sek').setLabel('Sekundär').setStyle(TextInputStyle.Short)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('perl').setLabel('Perleffekt').setStyle(TextInputStyle.Short))
          )
      );
    }

    if (interaction.customId === 'sanktion') {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId('sanktion_modal')
          .setTitle('Sanktion')
          .addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('grund').setLabel('Grund').setStyle(TextInputStyle.Paragraph)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('geld').setLabel('Geldstrafe').setStyle(TextInputStyle.Short))
          )
      );
    }

    if (interaction.customId === 'hausverbot') {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId('hausverbot_modal')
          .setTitle('Hausverbot')
          .addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('grund').setLabel('Grund').setStyle(TextInputStyle.Paragraph)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('datum').setLabel('Datum').setStyle(TextInputStyle.Short))
          )
      );
    }

    if (interaction.customId === 'urlaub') {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId('urlaub_modal')
          .setTitle('Urlaub')
          .addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('datum').setLabel('Zeitraum').setStyle(TextInputStyle.Short)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('grund').setLabel('Grund').setStyle(TextInputStyle.Paragraph))
          )
      );
    }
  }

  // ===== MODAL SUBMIT =====
  if (interaction.isModalSubmit()) {

    if (interaction.customId === 'familie') {
      const ch = await client.channels.fetch(FAMILIE_CHANNEL_ID);
      await ch.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle("🎨 Familie")
            .setDescription(`Primer: ${interaction.fields.getTextInputValue('primer')}`)
        ]
      });
      return interaction.reply({ content: "✅ Familie gesendet", flags: MessageFlags.Ephemeral });
    }

    if (interaction.customId === 'xenon' || interaction.customId === 'stance') {
      pending.set(interaction.user.id, {
        type: interaction.customId,
        data: {
          name: interaction.fields.getTextInputValue('name'),
          kz: interaction.fields.getTextInputValue('kz'),
          farbe: interaction.customId === 'xenon'
            ? interaction.fields.getTextInputValue('farbe')
            : null
        }
      });

      return interaction.reply({ content: "📸 Bitte sende ein Bild", flags: MessageFlags.Ephemeral });
    }
  }
});

// ===== IMAGE HANDLER =====
client.on('messageCreate', async msg => {
  if (!msg.attachments.size) return;

  const data = pending.get(msg.author.id);
  if (!data) return;

  const file = msg.attachments.first().url;

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(data.type === 'xenon' ? "🚗 Xenon" : "🏁 Stance")
    .setDescription(`Name: ${data.data.name}`)
    .setImage(file);

  const ch = await client.channels.fetch(
    data.type === 'xenon' ? XENON_CHANNEL_ID : STANCE_CHANNEL_ID
  );

  await ch.send({ embeds: [embed] });

  pending.delete(msg.author.id);
});

// ===== WELCOME =====
client.on('guildMemberAdd', member => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (ch) ch.send(`👋 Willkommen <@${member.id}>`);
});

client.login(TOKEN);
