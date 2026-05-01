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

// ===== CONFIG =====
const PANEL_CHANNEL_ID = "1498441200062169159";
const TICKET_PANEL_ID = "1498024704726929468";
const CATEGORY_ID = "1321858825929621584";

const SUPPORT_ROLE_ID = "1497953436514255089";

const XENON_CHANNEL_ID = "1439386475572756570";
const STANCE_CHANNEL_ID = "1363997615305523411";
const FAMILIE_CHANNEL_ID = "1442699333068783736";

const SANKTION_CHANNEL_ID = "1457161680776597746";
const HAUSVERBOT_CHANNEL_ID = "1457161848209150104";
const URLAUB_CHANNEL_ID = "1457161825530548416";

const LOG_CHANNEL_ID = "1496743068785709096";
const WELCOME_CHANNEL_ID = "1457160970811080910";

const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png?ex=69f5db57&is=69f489d7&hm=e5825628ef17bbdf29222bc7d446073b9f628ed4f35b71748f69337f34ce7ec6&";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png?ex=69f5b30e&is=69f4618e&hm=3d81235bbb257b81a4417a3d1990b2a036003dbff83d18680c561bedb571c69f&";

const GREEN = 0x00ff00;
const RED = 0xff0000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== TEMP STORAGE =====
const newsData = new Map();

// ===== LOG =====
function sendLog(guild, embed) {
  const ch = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (ch) ch.send({ embeds: [embed] });
}

// ===== READY =====
client.once('clientReady', async () => {
  console.log("✅ Bot Online");

  const panel = await client.channels.fetch(PANEL_CHANNEL_ID);

  await panel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(GREEN)
        .setAuthor({ name: "Top Gear Performance • Mitarbeiter", iconURL: LOGO })
        .setDescription(`🚗 **Mitarbeiter Panel**

🔧 Beste Leistung für unsere Kunden`)
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
        new ButtonBuilder().setCustomId('urlaub').setLabel('🛫 Urlaub').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket').setLabel('🎟️ Ticket').setStyle(ButtonStyle.Success)
      )
    ]
  });
});

// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {

  // ===== BUTTONS =====
  if (interaction.isButton()) {

    // ===== NEWS =====
    if (interaction.customId === 'news') {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId('news_modal')
          .setTitle('📰 News')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId('title').setLabel('Titel').setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId('text').setLabel('Text').setStyle(TextInputStyle.Paragraph)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId('role').setLabel('Rolle (@ optional)').setStyle(TextInputStyle.Short).setRequired(false)
            )
          )
      );
    }

    // ===== TICKET =====
    if (interaction.customId === 'ticket') {
      const ch = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: ['ViewChannel'] },
          { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
          { id: SUPPORT_ROLE_ID, allow: ['ViewChannel', 'SendMessages'] }
        ]
      });

      ch.send({
        content: `<@${interaction.user.id}>`,
        embeds: [new EmbedBuilder().setColor(GREEN).setTitle("🎟️ Ticket").setDescription("Support hilft dir gleich")]
      });

      return interaction.reply({ content: "✅ Ticket erstellt", flags: MessageFlags.Ephemeral });
    }

    // ===== STATUS BUTTONS =====
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
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId('geld').setLabel('Geld').setStyle(TextInputStyle.Short)
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
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId('datum').setLabel('Datum').setStyle(TextInputStyle.Short)
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
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId('grund').setLabel('Grund').setStyle(TextInputStyle.Paragraph)
            )
          )
      );
    }
  }

  // ===== MODALS =====
  if (interaction.isModalSubmit()) {

    // ===== NEWS → CHANNEL AUSWAHL =====
    if (interaction.customId === 'news_modal') {

      const channels = interaction.guild.channels.cache
        .filter(c => c.type === ChannelType.GuildText)
        .map(c => ({ label: c.name, value: c.id }));

      newsData.set(interaction.user.id, {
        title: interaction.fields.getTextInputValue('title'),
        text: interaction.fields.getTextInputValue('text'),
        role: interaction.fields.getTextInputValue('role')
      });

      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('news_channel')
          .addOptions(channels.slice(0, 25))
      );

      return interaction.reply({
        content: "📂 Channel wählen:",
        components: [menu],
        flags: MessageFlags.Ephemeral
      });
    }

    // ===== SANKTION SEND =====
    if (interaction.customId === 'sanktion_modal') {

      const ch = await client.channels.fetch(SANKTION_CHANNEL_ID);

      const embed = new EmbedBuilder()
        .setColor(RED)
        .setTitle("⚖️ Sanktion")
        .setDescription(`👤 <@${interaction.user.id}>
📄 ${interaction.fields.getTextInputValue('grund')}
💰 ${interaction.fields.getTextInputValue('geld')}€`)
        .addFields({ name: "💰 Status", value: "🔴 Nicht bezahlt" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('bezahlt').setLabel('💰 Bezahlt').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('nicht_bezahlt').setLabel('❌ Nicht bezahlt').setStyle(ButtonStyle.Danger)
      );

      ch.send({ embeds: [embed], components: [row] });
    }

    // ===== HAUSVERBOT SEND =====
    if (interaction.customId === 'hausverbot_modal') {

      const ch = await client.channels.fetch(HAUSVERBOT_CHANNEL_ID);

      const embed = new EmbedBuilder()
        .setColor(RED)
        .setTitle("🚫 Hausverbot")
        .setDescription(`👤 <@${interaction.user.id}>
📄 ${interaction.fields.getTextInputValue('grund')}
📅 ${interaction.fields.getTextInputValue('datum')}`)
        .addFields({ name: "📄 Status", value: "🔴 Nicht aufgehoben" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('aufgehoben').setLabel('✅ Aufgehoben').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('nicht_aufgehoben').setLabel('🚫 Nicht aufgehoben').setStyle(ButtonStyle.Danger)
      );

      ch.send({ embeds: [embed], components: [row] });
    }

    // ===== URLAUB =====
    if (interaction.customId === 'urlaub_modal') {
      const ch = await client.channels.fetch(URLAUB_CHANNEL_ID);

      ch.send({
        embeds: [
          new EmbedBuilder()
            .setColor(GREEN)
            .setTitle("🛫 Urlaub")
            .setDescription(`👤 <@${interaction.user.id}>
📅 ${interaction.fields.getTextInputValue('datum')}
📄 ${interaction.fields.getTextInputValue('grund')}`)
        ]
      });
    }

    return interaction.reply({ content: "✅ Gesendet", flags: MessageFlags.Ephemeral });
  }

  // ===== SELECT MENU =====
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === 'news_channel') {

      const data = newsData.get(interaction.user.id);
      if (!data) return;

      const ch = await client.channels.fetch(interaction.values[0]);

      await ch.send({
        embeds: [
          new EmbedBuilder()
            .setColor(GREEN)
            .setTitle(`📰 ${data.title}`)
            .setDescription(data.text)
            .setImage(BANNER)
        ]
      });

      newsData.delete(interaction.user.id);

      return interaction.update({ content: "✅ News gesendet!", components: [] });
    }
  }
});

// ===== SERVER LOGS =====
client.on('messageDelete', msg => {
  if (!msg.guild) return;
  sendLog(msg.guild, new EmbedBuilder().setColor(RED).setTitle("🗑️ Nachricht gelöscht").setDescription(msg.content || "Keine Inhalte"));
});

// ===== WELCOME =====
client.on('guildMemberAdd', member => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!ch) return;
  ch.send(`👋 Willkommen <@${member.id}>`);
});

client.login(TOKEN);
