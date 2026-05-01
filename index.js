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

const XENON_CHANNEL_ID = "1439386475572756570";
const STANCE_CHANNEL_ID = "1363997615305523411";
const FAMILIE_CHANNEL_ID = "1442699333068783736";
const URLAUB_CHANNEL_ID = "1457161825530548416";

const SUPPORT_ROLE_ID = "1497953436514255089";
const CATEGORY_ID = "1321858825929621584";

const REGEL_CHANNEL_ID = "DEIN_REGEL_CHANNEL";
const KUNDEN_ROLE_ID = "DEINE_KUNDEN_ROLLE";

// ===== DESIGN =====
const LOGO = "https://cdn.discordapp.com/attachments/1475610426766262333/1495199546035146822/Top_Gear.png";
const BANNER = "https://cdn.discordapp.com/attachments/1475610426766262333/1496968229585944676/ChatGPT_Image_23._Apr._2026_20_49_03.png";

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
});

const pending = new Map();
const vorlageData = new Map();
const vorlagePages = new Map();

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
    new ButtonBuilder().setCustomId('news').setLabel('📢 News').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('xenon').setLabel('🚗 Xenon').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('stance').setLabel('🏁 Stance').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('familie').setLabel('🎨 Familie').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('urlaub').setLabel('🛫 Urlaub').setStyle(ButtonStyle.Success)
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

const regelChannel = await client.channels.fetch(REGEL_CHANNEL_ID);

await regelChannel.send({
  embeds: [
    new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("📜 Server Regeln")
      .setDescription("Bitte bestätige die Regeln um Zugriff zu erhalten.")
      .setThumbnail(LOGO)
      .setImage(BANNER)
  ],
  components: [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify')
        .setLabel('✅ Regeln akzeptieren')
        .setStyle(ButtonStyle.Success)
    )
  ]
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

    await interaction.reply("🔒 Ticket wird geschlossen...");  
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);  
  }  

  if (interaction.customId === 'verify') {

  const role = interaction.guild.roles.cache.get(KUNDEN_ROLE_ID);

  if (!role) {
    return interaction.reply({
      content: "❌ Rolle nicht gefunden!",
      flags: MessageFlags.Ephemeral
    });
  }

  await interaction.member.roles.add(role);

  return interaction.reply({
    content: "✅ Du hast Zugriff erhalten!",
    flags: MessageFlags.Ephemeral
  });
}

  // Vorlage Modal  
  if (interaction.customId === 'news') {  
    return interaction.showModal(  
      new ModalBuilder()  
        .setCustomId('news')  
        .setTitle('news')  
        .addComponents(  
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title').setLabel('Titel').setStyle(TextInputStyle.Short)),  
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('text').setLabel('Text').setStyle(TextInputStyle.Paragraph)),  
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('role').setLabel('Rolle (@Name optional)').setStyle(TextInputStyle.Short).setRequired(false))  
        )  
    );  
  }  

  // Xenon  
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

  // Stance  
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

  // Familie  
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

  // ===== URLAUB =====
if (interaction.customId === 'urlaub') {
  return interaction.showModal(
    new ModalBuilder()
      .setCustomId('urlaub_modal')
      .setTitle('Urlaub')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('datum')
            .setLabel('Zeitraum')
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('grund')
            .setLabel('Grund')
            .setStyle(TextInputStyle.Paragraph)
        )
      )
  );
}

  // ===== VORLAGE SEITEN =====
if (interaction.customId === 'next' || interaction.customId === 'back') {

  const data = vorlageData.get(interaction.user.id);
  let page = vorlagePages.get(interaction.user.id);

  if (!data) return;

  const channels = data.channels;

  if (interaction.customId === 'next') page++;
  if (interaction.customId === 'back') page--;

  const maxPage = Math.ceil(channels.length / 25) - 1;

  if (page < 0) page = 0;
  if (page > maxPage) page = maxPage;

  vorlagePages.set(interaction.user.id, page);

  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('vorlage_channel')
      .setPlaceholder(`Seite ${page + 1}`)
      .addOptions(channels.slice(page * 25, page * 25 + 25))
  );

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('back').setLabel('⬅️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Secondary)
  );

  return interaction.update({
    content: `📢 Wähle den Channel (Seite ${page + 1}/${maxPage + 1})`,
    components: [menu, buttons]
  });
}

// ===== MODAL SUBMIT =====  
if (interaction.isModalSubmit()) {  

  if (interaction.customId === 'news') {  

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
        .setCustomId('vorlage_channel')  
        .setPlaceholder('Seite 1')  
        .addOptions(channels.slice(0, 25))  
    );  

    const buttons = new ActionRowBuilder().addComponents(  
      new ButtonBuilder().setCustomId('back').setLabel('⬅️').setStyle(ButtonStyle.Secondary),  
      new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Secondary)  
    );  

    return interaction.reply({  
      content: "📢 Wähle den Channel:",  
      components: [menu, buttons],  
      flags: MessageFlags.Ephemeral  
    });  
  }  

  if (interaction.customId === 'familie') {  
    const embed = new EmbedBuilder()  
      .setColor(0x00ff00)  
      .setTitle("🎨 Familie Auftrag")  
      .setThumbnail(LOGO)  
      .setDescription(`🎨 **Primer**

${interaction.fields.getTextInputValue('primer')}

🎨 Sekundär
${interaction.fields.getTextInputValue('sek')}

✨ Perleffekt
${interaction.fields.getTextInputValue('perl')}

🚗 Unterboden
${interaction.fields.getTextInputValue('unter')}

➕ Extra
${interaction.fields.getTextInputValue('extra')}`)
.setImage(BANNER);

const ch = await client.channels.fetch(FAMILIE_CHANNEL_ID);  
    ch.send({ embeds: [embed] });  

    return interaction.reply({ content: "✅ Gesendet!", flags: MessageFlags.Ephemeral });  
  }  

  if (interaction.customId === 'xenon' || interaction.customId === 'stance') {  
    pending.set(interaction.user.id, {  
      type: interaction.customId,  
      data: interaction.fields  
    });  

    return interaction.reply({ content: "📸 Bitte sende dein Bild", flags: MessageFlags.Ephemeral });  
  }  
}  

  // ===== URLAUB SEND =====
if (interaction.customId === 'urlaub_modal') {

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("🛫 Urlaub")
    .setThumbnail(LOGO)
    .setDescription(
`👤 <@${interaction.user.id}>

📅 **Zeitraum**
${interaction.fields.getTextInputValue('datum')}

📄 **Grund**
${interaction.fields.getTextInputValue('grund')}`
    )
    .setImage(BANNER);

  const ch = await client.channels.fetch(URLAUB_CHANNEL_ID);

  await ch.send({ embeds: [embed] });

  return interaction.reply({
    content: "✅ Urlaub gesendet!",
    flags: MessageFlags.Ephemeral
  });
}
  
// ===== SELECT =====  
if (interaction.isStringSelectMenu()) {  

  if (interaction.customId === 'vorlage_channel') {  

    const data = vorlageData.get(interaction.user.id);  
    if (!data) return;  

    let roleMention = null;  
    if (data.role) {  
      const role = interaction.guild.roles.cache.find(r =>  
        r.name.toLowerCase() === data.role.replace('@', '').toLowerCase()  
      );  
      if (role) roleMention = `<@&${role.id}>`;  
    }  

    const ch = await client.channels.fetch(interaction.values[0]);  

    const embed = new EmbedBuilder()  
      .setColor(0x00ff00)  
      .setTitle(data.title)  
      .setDescription(`${roleMention ? `👥 **Rolle**\n${roleMention}\n\n` : ''}${data.text}`)  
      .setThumbnail(LOGO)  
      .setImage(BANNER);  

    await ch.send({  
      content: roleMention || null,  
      embeds: [embed],  
      allowedMentions: { parse: ['roles'] }  
    });  

    vorlageData.delete(interaction.user.id);  

    return interaction.update({  
      content: "✅ Vorlage gesendet!",  
      components: []  
    });  
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
setTimeout(() => msg.delete().catch(() => {}), 3000);

const embed = new EmbedBuilder()
.setColor(0x00ff00)
.setThumbnail(LOGO)
.setImage("attachment://car.png");

if (user.type === 'xenon') {
embed.setTitle("🚗 Xenon Auftrag")
.setDescription(`👤 Kundenname
${user.data.getTextInputValue('name')}

🚘 Kennzeichen
${user.data.getTextInputValue('kz')}

🎨 Farbe
${user.data.getTextInputValue('farbe')}`);
}

if (user.type === 'stance') {
embed.setTitle("🏁 Stance Auftrag")
.setDescription(`👤 Kundenname
${user.data.getTextInputValue('name')}

🚘 Kennzeichen
${user.data.getTextInputValue('kz')}`);
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

// ===== WELCOME =====
client.on('guildMemberAdd', member => {
const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
if (!ch) return;

const embed = new EmbedBuilder()
.setColor(0x00ff00)
.setAuthor({ name: "Top Gear Performance", iconURL: LOGO })
.setThumbnail(LOGO)
.setDescription(
`🚗 Willkommen bei 𝒯𝑜𝓅 𝒢𝑒𝒶𝓇 𝒫𝑒𝓇𝒻𝑜𝓇𝓂𝒶𝓃𝒸𝑒

<@${member.id}> 👋

🔧 Schön dass du da bist!
Hier dreht sich alles um Performance, Style und Geschwindigkeit.

📍 Standort: 1015

🔥 🏁 Steig ein und erlebe echte Performance!`
)
.setImage(BANNER);

ch.send({ embeds: [embed] });
});

client.login(TOKEN);
