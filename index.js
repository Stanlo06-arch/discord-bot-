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

const XENON_CHANNEL_ID = "1439386475572756570";
const STANCE_CHANNEL_ID = "1363997615305523411";

const SUPPORT_ROLE_ID = "1497953436514255089";
const CATEGORY_ID = "1321858825929621584";

const WELCOME_CHANNEL_ID = "1457160970811080910";

// ===== DESIGN =====
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png?ex=69f33857&is=69f1e6d7&hm=7259c0ea8487a73edb65d0d0197a164fe9d6ba671710d725eb9b5bb9302ff1c4&";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png?ex=69f3100e&is=69f1be8e&hm=82e8fb16e5860638b0accda11170aec44947039d6d4af7d6a9357b7bfdf72794&";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== TEMP STORAGE =====
const pending = new Map();


// ===== SLASH COMMAND =====
const commands = [
  new SlashCommandBuilder()
    .setName('familie')
    .setDescription('Familien Auftrag')
    .addStringOption(o =>
      o.setName('typ')
        .setDescription('Typ auswählen')
        .setRequired(true)
        .addChoices(
          { name: 'Primer', value: 'Primer' },
          { name: 'Sekundär', value: 'Sekundär' },
          { name: 'Perleffekt', value: 'Perleffekt' },
          { name: 'Unterboden', value: 'Unterboden' },
          { name: 'Extra', value: 'Extra' }
        )
    )
    .addStringOption(o =>
      o.setName('text')
        .setDescription('Beschreibung')
        .setRequired(true)
    )
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
})();


// ===== READY =====
client.once('clientReady', async () => {
  console.log(`Bot online: ${client.user.tag}`);

  // 📢 PANEL
  const panel = await client.channels.fetch(PANEL_CHANNEL_ID).catch(() => null);
  if (panel) {
    await panel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setAuthor({ name: "📢 Button System", iconURL: LOGO })
          .setThumbnail(LOGO)
          .setDescription(
`📢 **Vorlage**
Erstelle ganz einfach eine Vorlage

🚗 **Aufträge**
Erstelle Xenon oder Stance Aufträge`
          )
          .setImage(BANNER)
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('vorlage')
            .setLabel('📢 Vorlage')
            .setStyle(ButtonStyle.Primary)
        ),
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('xenon')
            .setLabel('🚗 Xenon')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('stance')
            .setLabel('🏁 Stance')
            .setStyle(ButtonStyle.Secondary)
        )
      ]
    });
  }

  // 🎟️ TICKET PANEL
  const ticketPanel = await client.channels.fetch(TICKET_PANEL_ID).catch(() => null);
  if (ticketPanel) {
    await ticketPanel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setAuthor({ name: "🎫 Ticket öffnen", iconURL: LOGO })
          .setThumbnail(LOGO)
          .setDescription(
`🎫 **Ticket öffnen**

Hast du Probleme oder Fragen?
Mach einfach ein Ticket auf

Wir helfen dir gerne weiter!`
          )
          .setImage(BANNER)
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('open_ticket')
            .setLabel('🎟️ Ticket öffnen')
            .setStyle(ButtonStyle.Success)
        )
      ]
    });
  }
});


// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {

  // ===== BUTTONS =====
  if (interaction.isButton()) {

    if (interaction.customId === 'vorlage') {
      const modal = new ModalBuilder()
        .setCustomId('vorlage_modal')
        .setTitle('Vorlage');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('titel').setLabel('Titel').setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('text').setLabel('Text').setStyle(TextInputStyle.Paragraph)
        )
      );

      return interaction.showModal(modal);
    }

    if (interaction.customId === 'xenon') {
      const modal = new ModalBuilder()
        .setCustomId('xenon_modal')
        .setTitle('Xenon Auftrag');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('kunde').setLabel('Kunde').setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('kennzeichen').setLabel('Kennzeichen').setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('farbe').setLabel('Farbe').setStyle(TextInputStyle.Short)
        )
      );

      return interaction.showModal(modal);
    }

    if (interaction.customId === 'stance') {
      const modal = new ModalBuilder()
        .setCustomId('stance_modal')
        .setTitle('Stance Auftrag');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('kunde').setLabel('Kunde').setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('kennzeichen').setLabel('Kennzeichen').setStyle(TextInputStyle.Short)
        )
      );

      return interaction.showModal(modal);
    }

    // ===== TICKET OPEN =====
    if (interaction.customId === 'open_ticket') {

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
          { id: SUPPORT_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] }
        ]
      });

      await channel.send(`Support für <@${interaction.user.id}>`);
      return interaction.reply({ content: `Ticket erstellt: ${channel}`, flags: MessageFlags.Ephemeral });
    }
  }

  // ===== MODAL =====
  if (interaction.isModalSubmit()) {

    if (interaction.customId === 'vorlage_modal') {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00ff00)
            .setAuthor({ name: interaction.fields.getTextInputValue('titel'), iconURL: LOGO })
            .setThumbnail(LOGO)
            .setDescription(interaction.fields.getTextInputValue('text'))
            .setImage(BANNER)
        ]
      });
    }

    if (interaction.customId === 'xenon_modal') {
      pending.set(interaction.user.id, {
        type: 'xenon',
        kunde: interaction.fields.getTextInputValue('kunde'),
        kennzeichen: interaction.fields.getTextInputValue('kennzeichen'),
        farbe: interaction.fields.getTextInputValue('farbe')
      });

      return interaction.reply({ content: "🚗 Bild senden 📸", flags: MessageFlags.Ephemeral });
    }

    if (interaction.customId === 'stance_modal') {
      pending.set(interaction.user.id, {
        type: 'stance',
        kunde: interaction.fields.getTextInputValue('kunde'),
        kennzeichen: interaction.fields.getTextInputValue('kennzeichen')
      });

      return interaction.reply({ content: "🏁 Bild senden 📸", flags: MessageFlags.Ephemeral });
    }

    // ===== FAMILIE =====
    if (interaction.isChatInputCommand() && interaction.commandName === 'familie') {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00ff00)
            .setAuthor({ name: "🎨 Familien Auftrag", iconURL: LOGO })
            .setThumbnail(LOGO)
            .addFields(
              { name: "Typ", value: interaction.options.getString('typ') },
              { name: "Details", value: interaction.options.getString('text') }
            )
        ]
      });
    }
  }
});


// ===== BILD =====
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const data = pending.get(message.author.id);
  if (!data || !message.attachments.size) return;

  const bild = message.attachments.first();

  let embed;

  if (data.type === 'xenon') {
    embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setAuthor({ name: "🚗 Xenon Auftrag", iconURL: LOGO })
      .setThumbnail(LOGO)
      .addFields(
        { name: "Kunde", value: data.kunde },
        { name: "Kennzeichen", value: data.kennzeichen },
        { name: "Farbe", value: data.farbe }
      )
      .setImage(bild.url);

    client.channels.cache.get(XENON_CHANNEL_ID).send({ embeds: [embed] });
  }

  if (data.type === 'stance') {
    embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setAuthor({ name: "🏁 Stance Auftrag", iconURL: LOGO })
      .setThumbnail(LOGO)
      .addFields(
        { name: "Kunde", value: data.kunde },
        { name: "Kennzeichen", value: data.kennzeichen }
      )
      .setImage(bild.url);

    client.channels.cache.get(STANCE_CHANNEL_ID).send({ embeds: [embed] });
  }

  pending.delete(message.author.id);
});


// ===== WELCOME =====
client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x00ff00)
        .setAuthor({ name: "Willkommen!", iconURL: LOGO })
        .setThumbnail(LOGO)
        .setDescription(`Willkommen <@${member.id}>`)
        .setImage(BANNER)
    ]
  });
});

client.login(TOKEN);
