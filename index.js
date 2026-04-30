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
  MessageFlags
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

const pending = new Map();

// ===== READY =====
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
  const msgs2 = await ticketPanel.messages.fetch({ limit: 10 });
  await ticketPanel.bulkDelete(msgs2, true).catch(() => {});

  await ticketPanel.send({
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

      if (interaction.customId === 'ticket') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

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
          return interaction.reply({ content: "❌ Nur Support!", flags: MessageFlags.Ephemeral });
        }

        await interaction.reply("🔒 Ticket wird in 5 Sekunden geschlossen...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      }

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
    }

    if (interaction.isModalSubmit()) {

      if (interaction.customId === 'xenon' || interaction.customId === 'stance') {
        pending.set(interaction.user.id, {
          type: interaction.customId,
          data: interaction.fields
        });

        return interaction.reply({ content: "📸 Bitte sende dein Bild", flags: MessageFlags.Ephemeral });
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

  const file = msg.attachments.first().url;

  setTimeout(async () => {
    await msg.delete().catch(() => {});
  }, 3000);

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setThumbnail(LOGO)
    .setImage("attachment://car.png");

  if (user.type === 'xenon') {
    embed
      .setTitle("🚗 Xenon Auftrag")
      .setDescription(
`👤 **Kundenname**
${user.data.getTextInputValue('name')}

🚘 **Kennzeichen**
${user.data.getTextInputValue('kz')}

🎨 **Farbe**
${user.data.getTextInputValue('farbe')}`
      );
  }

  if (user.type === 'stance') {
    embed
      .setTitle("🏁 Stance Auftrag")
      .setDescription(
`👤 **Kundenname**
${user.data.getTextInputValue('name')}

🚘 **Kennzeichen**
${user.data.getTextInputValue('kz')}`
      );
  }

  const ch = await client.channels.fetch(
    user.type === 'xenon' ? XENON_CHANNEL_ID : STANCE_CHANNEL_ID
  );

  await ch.send({
    embeds: [embed],
    files: [{ attachment: file, name: "car.png" }]
  });

  pending.delete(msg.author.id);
});

client.login(TOKEN);
