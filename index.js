const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
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
const CLIENT_ID = "1496235501139660980";
const GUILD_ID = "1321858825401401426";

// 🔧 IDs
const SUPPORT_ROLE_ID = "1497953436514255089";
const TICKET_PANEL_ID = "1498024704726929468";
const VORLAGE_PANEL_ID = "1498441200062169159";
const CATEGORY_ID = "1321858825929621584";
const WELCOME_CHANNEL_ID = "1457160970811080910";

// 🖼️ BILDER
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png?ex=69f1e6d7&is=69f09557&hm=d50c91502382112c78c5d6a8b7de5d497b846a17f3c4421f21b22ed77383eb58&
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png?ex=69f1be8e&is=69f06d0e&hm=f3d564ac33f15aaba8aca8953b2944f9087a330c6b00b10e4cd43bbcda00acaa&

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});


// 🔥 COMMANDS
const commands = [

  new SlashCommandBuilder()
    .setName('xenon')
    .setDescription('Xenon Auftrag')
    .addStringOption(o => o.setName('kunde').setRequired(true))
    .addStringOption(o => o.setName('kennzeichen').setRequired(true))
    .addStringOption(o => o.setName('farbe').setRequired(true)),

  new SlashCommandBuilder()
    .setName('stance')
    .setDescription('Stance Auftrag')
    .addStringOption(o => o.setName('kunde').setRequired(true))
    .addStringOption(o => o.setName('kennzeichen').setRequired(true))

].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
})();


// 🟢 READY
client.once('clientReady', async () => {
  console.log(`Bot online: ${client.user.tag}`);

  // 🎟️ Ticket Panel
  const ticket = await client.channels.fetch(TICKET_PANEL_ID).catch(() => null);
  if (ticket) {
    await ticket.send({
      content: "🎟️ Support\nTicket öffnen",
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('open_ticket')
            .setLabel('🎟️ Ticket')
            .setStyle(ButtonStyle.Success)
        )
      ]
    });
  }

  // 📢 Vorlage Panel
  const vorlage = await client.channels.fetch(VORLAGE_PANEL_ID).catch(() => null);
  if (vorlage) {
    await vorlage.send({
      content: "📢 Vorlage erstellen",
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('open_vorlage')
            .setLabel('📢 Start')
            .setStyle(ButtonStyle.Primary)
        )
      ]
    });
  }
});


// 💬 INTERACTIONS
client.on('interactionCreate', async interaction => {

  // ===== XENON =====
  if (interaction.isChatInputCommand() && interaction.commandName === 'xenon') {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setAuthor({ name: "Xenon Auftrag", iconURL: LOGO })
          .setThumbnail(LOGO)
          .addFields(
            { name: "Kunde", value: interaction.options.getString('kunde') },
            { name: "Kennzeichen", value: interaction.options.getString('kennzeichen') },
            { name: "Farbe", value: interaction.options.getString('farbe') }
          )
      ]
    });
  }

  // ===== STANCE =====
  if (interaction.isChatInputCommand() && interaction.commandName === 'stance') {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setAuthor({ name: "Stance Auftrag", iconURL: LOGO })
          .setThumbnail(LOGO)
          .addFields(
            { name: "Kunde", value: interaction.options.getString('kunde') },
            { name: "Kennzeichen", value: interaction.options.getString('kennzeichen') }
          )
      ]
    });
  }

  // ===== TICKET =====
  if (interaction.isButton() && interaction.customId === 'open_ticket') {

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
    return interaction.reply({ content: `Ticket: ${channel}`, flags: MessageFlags.Ephemeral });
  }

  // ===== VORLAGE SYSTEM =====
  if (interaction.isButton() && interaction.customId === 'open_vorlage') {

    const menu = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('select_channel')
        .setPlaceholder('Channel wählen')
    );

    return interaction.reply({
      content: "Channel auswählen:",
      components: [menu],
      flags: MessageFlags.Ephemeral
    });
  }

  if (interaction.isAnySelectMenu() && interaction.customId === 'select_channel') {

    const modal = new ModalBuilder()
      .setCustomId(`vorlage_${interaction.values[0]}`)
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

  if (interaction.isModalSubmit() && interaction.customId.startsWith('vorlage_')) {

    const channel = interaction.guild.channels.cache.get(
      interaction.customId.split('_')[1]
    );

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setAuthor({ name: interaction.fields.getTextInputValue('titel'), iconURL: LOGO })
      .setThumbnail(LOGO)
      .setDescription(interaction.fields.getTextInputValue('text'))
      .setImage(BANNER);

    await channel.send({ embeds: [embed] });

    return interaction.reply({
      content: `Gesendet in ${channel}`,
      flags: MessageFlags.Ephemeral
    });
  }

});


// 👋 WELCOME
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
