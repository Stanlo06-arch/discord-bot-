require('dotenv').config();

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
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== STORAGE =====
const vorlageData = new Map();
const vorlagePages = new Map();

// ===== READY =====
client.once('ready', async () => {
  console.log(`✅ Online als ${client.user.tag}`);

  const panel = await client.channels.fetch(PANEL_CHANNEL_ID);

  await panel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("📢 Mitarbeiter Panel")
        .setThumbnail(LOGO)
        .setImage(BANNER)
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('news')
          .setLabel('📢 News')
          .setStyle(ButtonStyle.Primary)
      )
    ]
  });
});

// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {
  try {

    // ===== BUTTON =====
    if (interaction.isButton()) {

      if (interaction.customId === 'news') {
        return interaction.showModal(
          new ModalBuilder()
            .setCustomId('news_modal')
            .setTitle('📢 News erstellen')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('title')
                  .setLabel('Titel')
                  .setStyle(TextInputStyle.Short)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('text')
                  .setLabel('Text')
                  .setStyle(TextInputStyle.Paragraph)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('role')
                  .setLabel('Rolle (@ optional)')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false)
              )
            )
        );
      }
    }

    // ===== MODAL =====
    if (interaction.isModalSubmit()) {

      if (interaction.customId === 'news_modal') {

        const channels = interaction.guild.channels.cache
          .filter(c => c.type === ChannelType.GuildText)
          .map(c => ({ label: c.name, value: c.id }));

        vorlageData.set(interaction.user.id, {
          title: interaction.fields.getTextInputValue('title'),
          text: interaction.fields.getTextInputValue('text'),
          role: interaction.fields.getTextInputValue('role'),
          channels
        });

        vorlagePages.set(interaction.user.id, 0);

        const menu = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`channel_${interaction.user.id}`)
            .setPlaceholder('Seite 1')
            .addOptions(channels.slice(0, 25))
        );

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('back')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Secondary)
        );

        return interaction.reply({
          content: "📢 Wähle den Channel:",
          components: [menu, buttons],
          flags: MessageFlags.Ephemeral
        });
      }
    }

    // ===== PAGINATION =====
    if (interaction.isButton()) {

      if (interaction.customId === 'next' || interaction.customId === 'back') {

        const data = vorlageData.get(interaction.user.id);
        if (!data) return;

        let page = vorlagePages.get(interaction.user.id) || 0;

        if (interaction.customId === 'next') page++;
        if (interaction.customId === 'back') page--;

        const maxPage = Math.ceil(data.channels.length / 25) - 1;

        if (page < 0) page = 0;
        if (page > maxPage) page = maxPage;

        vorlagePages.set(interaction.user.id, page);

        const menu = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`channel_${interaction.user.id}`)
            .setPlaceholder(`Seite ${page + 1}`)
            .addOptions(data.channels.slice(page * 25, page * 25 + 25))
        );

        return interaction.update({
          content: `📢 Seite ${page + 1}/${maxPage + 1}`,
          components: [
            menu,
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('back').setLabel('⬅️').setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Secondary)
            )
          ]
        });
      }
    }

    // ===== SELECT =====
    if (interaction.isStringSelectMenu()) {

      if (!interaction.customId.startsWith('channel_')) return;

      const userId = interaction.customId.split('_')[1];

      if (interaction.user.id !== userId) {
        return interaction.reply({
          content: "❌ Nicht dein Menü!",
          ephemeral: true
        });
      }

      const data = vorlageData.get(userId);
      if (!data) return;

      let roleMention = null;

      if (data.role) {
        const role = interaction.guild.roles.cache.find(r =>
          r.name.toLowerCase() === data.role.replace('@', '').toLowerCase()
        );
        if (role) roleMention = `<@&${role.id}>`;
      }

      const channel = await client.channels.fetch(interaction.values[0]);

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(data.title)
        .setDescription(`${roleMention ? `${roleMention}\n\n` : ''}${data.text}`)
        .setThumbnail(LOGO)
        .setImage(BANNER);

      await channel.send({
        content: roleMention || null,
        embeds: [embed],
        allowedMentions: { parse: ['roles'] }
      });

      vorlageData.delete(userId);
      vorlagePages.delete(userId);

      return interaction.update({
        content: "✅ News gesendet!",
        components: []
      });
    }

  } catch (err) {
    console.error(err);
  }
});

client.login(TOKEN);
