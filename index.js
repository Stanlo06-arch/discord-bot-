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
  ChannelType
} = require('discord.js');

const TOKEN = process.env.TOKEN;

// ===== IDs =====
const PANEL_CHANNEL_ID = "1498441200062169159";
const TICKET_PANEL_ID = "1498024704726929468";

const XENON_CHANNEL_ID = "1439386475572756570";
const STANCE_CHANNEL_ID = "1363997615305523411";
const FAMILIE_CHANNEL_ID = "1442699333068783736";

const SUPPORT_ROLE_ID = "1497953436514255089";
const CATEGORY_ID = "1321858825929621584";

// ===== DESIGN =====
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== TEMP =====
const pending = new Map();

// ===== READY =====
client.once('clientReady', async () => {
  console.log("✅ Bot online");

  const panel = await client.channels.fetch(PANEL_CHANNEL_ID);
  panel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x00ff00)
        .setAuthor({ name: "Top Gear Performance", iconURL: LOGO })
        .setThumbnail(LOGO)
        .setDescription("Wähle eine Aktion")
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

  const ticketPanel = await client.channels.fetch(TICKET_PANEL_ID);
  ticketPanel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("Ticket System")
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

// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {
  try {

    if (interaction.isButton()) {

      // ===== TICKET =====
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

        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("Ticket System")
          .setDescription(`Erstellt von: <@${interaction.user.id}>`)
          .setThumbnail(LOGO)
          .setImage(BANNER);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('close').setLabel('🔒 Schließen').setStyle(ButtonStyle.Danger)
        );

        ch.send({ embeds: [embed], components: [row] });
        interaction.editReply("✅ Ticket erstellt!");
      }

      if (interaction.customId === 'close') {
        if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID)) {
          return interaction.reply({ content: "❌ Nur Support!", ephemeral: true });
        }

        await interaction.reply("🔒 Ticket wird in 5 Sekunden geschlossen...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      }

      // ===== MODALS =====
      if (interaction.customId === 'vorlage') {
        return interaction.showModal(
          new ModalBuilder()
            .setCustomId('vorlage')
            .setTitle('Vorlage')
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

      if (interaction.customId === 'xenon') {
        return interaction.showModal(
          new ModalBuilder()
            .setCustomId('xenon')
            .setTitle('Xenon')
            .addComponents(
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('kz').setLabel('Kennzeichen').setStyle(TextInputStyle.Short)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('farbe').setLabel('Farbe').setStyle(TextInputStyle.Short))
            )
        );
      }

      if (interaction.customId === 'stance') {
        return interaction.showModal(
          new ModalBuilder()
            .setCustomId('stance')
            .setTitle('Stance')
            .addComponents(
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('kz').setLabel('Kennzeichen').setStyle(TextInputStyle.Short))
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
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('perl').setLabel('Perleffekt').setStyle(TextInputStyle.Short)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('unter').setLabel('Unterboden').setStyle(TextInputStyle.Short)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('extra').setLabel('Extra').setStyle(TextInputStyle.Short))
            )
        );
      }
    }

    // ===== MODAL SUBMIT =====
    if (interaction.isModalSubmit()) {

      if (interaction.customId === 'vorlage') {
        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle(interaction.fields.getTextInputValue('title'))
          .setDescription(interaction.fields.getTextInputValue('text'))
          .setThumbnail(LOGO)
          .setImage(BANNER);

        interaction.channel.send({ embeds: [embed] });
        return interaction.reply({ content: "✅ Gesendet!", ephemeral: true });
      }

      if (interaction.customId === 'xenon' || interaction.customId === 'stance') {
        pending.set(interaction.user.id, {
          type: interaction.customId,
          data: interaction.fields
        });

        return interaction.reply({ content: "📸 Bitte sende dein Bild", ephemeral: true });
      }

      if (interaction.customId === 'familie') {
        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("Top Gear Performance")
          .setDescription(
`Primer: ${interaction.fields.getTextInputValue('primer')}
Sekundär: ${interaction.fields.getTextInputValue('sek')}
Perleffekt: ${interaction.fields.getTextInputValue('perl')}
Unterboden: ${interaction.fields.getTextInputValue('unter')}
Extra: ${interaction.fields.getTextInputValue('extra')}`
          )
          .setThumbnail(LOGO)
          .setImage(BANNER);

        const ch = await client.channels.fetch(FAMILIE_CHANNEL_ID);
        ch.send({ embeds: [embed] });

        return interaction.reply({ content: "✅ Gesendet!", ephemeral: true });
      }
    }

  } catch (err) {
    console.error(err);
  }
});

// ===== IMAGE HANDLER =====
client.on('messageCreate', async msg => {
  if (!msg.attachments.size) return;

  const user = pending.get(msg.author.id);
  if (!user) return;

  const image = msg.attachments.first().url;

  await msg.delete().catch(() => {});

  if (user.type === 'xenon') {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setAuthor({ name: "Top Gear Performance", iconURL: LOGO })
      .setDescription(
`Primär: ${user.data.getTextInputValue('farbe')}
Sekundär: Schwarz
Pearl: Race Yellow`
      )
      .setThumbnail(LOGO)
      .setImage(image);

    const ch = await client.channels.fetch(XENON_CHANNEL_ID);
    ch.send({ embeds: [embed] });
  }

  if (user.type === 'stance') {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setAuthor({ name: "Top Gear Performance", iconURL: LOGO })
      .setDescription(
`Name: ${user.data.getTextInputValue('name')}
Kennzeichen: ${user.data.getTextInputValue('kz')}`
      )
      .setThumbnail(LOGO)
      .setImage(image);

    const ch = await client.channels.fetch(STANCE_CHANNEL_ID);
    ch.send({ embeds: [embed] });
  }

  pending.delete(msg.author.id);
});

client.login(TOKEN);
