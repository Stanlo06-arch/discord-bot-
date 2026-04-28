const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

// 🔐 TOKEN aus Railway
const TOKEN = process.env.TOKEN;

// 🔧 ANPASSEN
const SUPPORT_ROLE_ID = "1497953436514255089";
const TICKET_CHANNEL_ID = "1498024704726929468";
const VORLAGE_CHANNEL_ID = "1498441200062169159";
const CATEGORY_ID = "1321858825929621584";
const WELCOME_CHANNEL_ID = "1457160970811080910";

// 🤖 BOT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// 🟢 READY
client.once('clientReady', async () => {
  console.log(`Bot online: ${client.user.tag}`);

  // 🎟️ Ticket Panel
  const ticketChannel = await client.channels.fetch(TICKET_CHANNEL_ID).catch(() => null);
  if (ticketChannel) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('🎟️ Ticket öffnen')
        .setStyle(ButtonStyle.Success)
    );

    await ticketChannel.send({
      content: "🎟️ Support\nKlicke um ein Ticket zu öffnen",
      components: [row]
    });
  }

  // 📢 Vorlage Panel
  const vorlageChannel = await client.channels.fetch(VORLAGE_CHANNEL_ID).catch(() => null);
  if (vorlageChannel) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_vorlage')
        .setLabel('📢 Vorlage erstellen')
        .setStyle(ButtonStyle.Primary)
    );

    await vorlageChannel.send({
      content: "📢 Hier klicken um eine Vorlage zu erstellen",
      components: [row]
    });
  }
});

// 💬 INTERACTIONS
client.on('interactionCreate', async interaction => {

  // 🎟️ Ticket öffnen
  if (interaction.isButton() && interaction.customId === 'open_ticket') {

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: SUPPORT_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    await channel.send(`Ticket für <@${interaction.user.id}> erstellt`);
    await interaction.editReply({ content: `Ticket: ${channel}` });
  }

  // 📢 Vorlage Button → Modal
  if (interaction.isButton() && interaction.customId === 'open_vorlage') {

    const modal = new ModalBuilder()
      .setCustomId('vorlage_modal')
      .setTitle('Vorlage erstellen');

    const titel = new TextInputBuilder()
      .setCustomId('titel')
      .setLabel('Titel')
      .setStyle(TextInputStyle.Short);

    const text = new TextInputBuilder()
      .setCustomId('text')
      .setLabel('Text')
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titel),
      new ActionRowBuilder().addComponents(text)
    );

    await interaction.showModal(modal);
  }

  // 📢 Modal absenden
  if (interaction.isModalSubmit() && interaction.customId === 'vorlage_modal') {

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`📢 ${interaction.fields.getTextInputValue('titel')}`)
      .setDescription(interaction.fields.getTextInputValue('text'))
      .setImage("https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png?ex=69f1be8e&is=69f06d0e&hm=f3d564ac33f15aaba8aca8953b2944f9087a330c6b00b10e4cd43bbcda00acaa&

    await interaction.reply({ embeds: [embed] });
  }

});

// 🚪 Welcome
client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (channel) {
    channel.send(`Willkommen <@${member.id}>`);
  }
});

// 🔐 LOGIN
client.login(TOKEN);
