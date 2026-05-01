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

// ===== IDs =====
const PANEL_CHANNEL_ID = "1498441200062169159";
const TICKET_PANEL_ID = "1498024704726929468";
const WELCOME_CHANNEL_ID = "1457160970811080910";

const SANKTION_CHANNEL_ID = "1457161680776597746";
const HAUSVERBOT_CHANNEL_ID = "1457161848209150104";
const URLAUB_CHANNEL_ID = "1457161825530548416";
const LOG_CHANNEL_ID = "1496743068785709096";

const SUPPORT_ROLE_ID = "1497953436514255089";
const CATEGORY_ID = "1321858825929621584";

// ===== DESIGN =====
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png?ex=69f5db57&is=69f489d7&hm=e5825628ef17bbdf29222bc7d446073b9f628ed4f35b71748f69337f34ce7ec6&";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png?ex=69f5b30e&is=69f4618e&hm=3d81235bbb257b81a4417a3d1990b2a036003dbff83d18680c561bedb571c69f&";

const COLOR_GREEN = 0x00ff00;
const COLOR_RED = 0xff0000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const pending = new Map();

// ===== LOG FUNCTION =====
async function sendLog(guild, embed) {
  const ch = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (ch) ch.send({ embeds: [embed] });
}

// ===== READY =====
client.once('clientReady', async () => {
  console.log("✅ Bot online");

  const panel = await client.channels.fetch(PANEL_CHANNEL_ID);
  await panel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(COLOR_GREEN)
        .setAuthor({ name: "Top Gear Performance • Mitarbeiter", iconURL: LOGO })
        .setDescription(`🚗 **Top Gear Performance – Mitarbeiter Panel**

🔧 **Wir liefern nur die beste Leistung für unsere Kunden**

Wähle unten eine Aktion 👇`)
        .setImage(BANNER)
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('vorlage').setLabel('📢 Vorlage').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('xenon').setLabel('🚗 Xenon').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('stance').setLabel('🏁 Stance').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('familie').setLabel('🎨 Familie').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('sanktion').setLabel('⚖️ Sanktion').setStyle(ButtonStyle.Danger)
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('hausverbot').setLabel('🚫 Hausverbot').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('urlaub').setLabel('🛫 Urlaub').setStyle(ButtonStyle.Primary)
      )
    ]
  });
});

// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {
  try {

    // ===== BUTTONS =====
    if (interaction.isButton()) {

      // 🔒 STATUS BUTTONS
      if (['bezahlt','nicht_bezahlt','aufgehoben','nicht_aufgehoben'].includes(interaction.customId)) {

        if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID)) {
          return interaction.reply({ content: "❌ Nur Support!", flags: MessageFlags.Ephemeral });
        }

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);
        const date = new Date().toLocaleString("de-DE");
        const user = `<@${interaction.user.id}>`;

        if (interaction.customId === 'bezahlt') {
          embed.data.fields = [
            { name: "💰 Status", value: "🟢 Bezahlt", inline: true },
            { name: "👮 Geändert von", value: user, inline: true },
            { name: "📅 Datum", value: date, inline: true }
          ];
        }

        if (interaction.customId === 'nicht_bezahlt') {
          embed.data.fields = [
            { name: "💰 Status", value: "🔴 Nicht bezahlt", inline: true },
            { name: "👮 Geändert von", value: user, inline: true },
            { name: "📅 Datum", value: date, inline: true }
          ];
        }

        if (interaction.customId === 'aufgehoben') {
          embed.data.fields = [
            { name: "📄 Status", value: "🟢 Aufgehoben", inline: true },
            { name: "👮 Geändert von", value: user, inline: true },
            { name: "📅 Datum", value: date, inline: true }
          ];
        }

        if (interaction.customId === 'nicht_aufgehoben') {
          embed.data.fields = [
            { name: "📄 Status", value: "🔴 Nicht aufgehoben", inline: true },
            { name: "👮 Geändert von", value: user, inline: true },
            { name: "📅 Datum", value: date, inline: true }
          ];
        }

        await interaction.update({ embeds: [embed] });

        return sendLog(interaction.guild,
          new EmbedBuilder()
            .setColor(COLOR_GREEN)
            .setTitle("📊 Status geändert")
            .setDescription(`${user} → ${interaction.customId}`)
            .setTimestamp()
        );
      }

      // ===== SANKTION =====
      if (interaction.customId === 'sanktion') {

        if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID)) {
          return interaction.reply({ content: "❌ Nur Support!", flags: MessageFlags.Ephemeral });
        }

        return interaction.showModal(
          new ModalBuilder()
            .setCustomId('sanktion_modal')
            .setTitle('Sanktion')
            .addComponents(
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('user').setLabel('Name').setStyle(TextInputStyle.Short)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('grund').setLabel('Grund').setStyle(TextInputStyle.Paragraph)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('geld').setLabel('Geld').setStyle(TextInputStyle.Short))
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
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('grund').setLabel('Grund').setStyle(TextInputStyle.Paragraph)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('datum').setLabel('Datum').setStyle(TextInputStyle.Short))
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
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('datum').setLabel('Datum').setStyle(TextInputStyle.Short)),
              new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('grund').setLabel('Grund').setStyle(TextInputStyle.Paragraph))
            )
        );
      }
    }

    // ===== MODALS =====
    if (interaction.isModalSubmit()) {

      // ⚖️ Sanktion
      if (interaction.customId === 'sanktion_modal') {

        const embed = new EmbedBuilder()
          .setColor(COLOR_RED)
          .setTitle("⚖️ Sanktion")
          .setDescription(`👤 ${interaction.fields.getTextInputValue('user')}

📄 ${interaction.fields.getTextInputValue('grund')}

💰 ${interaction.fields.getTextInputValue('geld')} €

👮 <@${interaction.user.id}>`)
          .addFields({ name: "💰 Status", value: "🔴 Nicht bezahlt" })
          .setImage(BANNER);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('bezahlt').setLabel('💰 Bezahlt').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('nicht_bezahlt').setLabel('❌ Nicht bezahlt').setStyle(ButtonStyle.Danger)
        );

        const ch = await client.channels.fetch(SANKTION_CHANNEL_ID);
        ch.send({ embeds: [embed], components: [row] });
      }

      // 🚫 Hausverbot
      if (interaction.customId === 'hausverbot_modal') {

        const embed = new EmbedBuilder()
          .setColor(COLOR_RED)
          .setTitle("🚫 Hausverbot")
          .setDescription(`👤 ${interaction.fields.getTextInputValue('name')}

📄 ${interaction.fields.getTextInputValue('grund')}

📅 ${interaction.fields.getTextInputValue('datum')}`)
          .addFields({ name: "📄 Status", value: "🔴 Nicht aufgehoben" })
          .setImage(BANNER);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('aufgehoben').setLabel('✅ Aufgehoben').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('nicht_aufgehoben').setLabel('🚫 Nicht aufgehoben').setStyle(ButtonStyle.Danger)
        );

        const ch = await client.channels.fetch(HAUSVERBOT_CHANNEL_ID);
        ch.send({ embeds: [embed], components: [row] });
      }

      // 🛫 Urlaub
      if (interaction.customId === 'urlaub_modal') {
        const ch = await client.channels.fetch(URLAUB_CHANNEL_ID);
        ch.send({
          embeds: [
            new EmbedBuilder()
              .setColor(COLOR_GREEN)
              .setTitle("🛫 Urlaub")
              .setDescription(`👤 ${interaction.fields.getTextInputValue('name')}

📅 ${interaction.fields.getTextInputValue('datum')}

📄 ${interaction.fields.getTextInputValue('grund')}

👮 <@${interaction.user.id}>`)
              .setImage(BANNER)
          ]
        });
      }

      return interaction.reply({ content: "✅ Gesendet!", flags: MessageFlags.Ephemeral });
    }

  } catch (err) {
    console.error(err);
  }
});

// ===== WELCOME =====
client.on('guildMemberAdd', member => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!ch) return;

  ch.send({
    embeds: [
      new EmbedBuilder()
        .setColor(COLOR_GREEN)
        .setDescription(`🚗 Willkommen <@${member.id}> bei Top Gear Performance`)
        .setImage(BANNER)
    ]
  });
});

client.login(TOKEN);
