const {
  ActionRowBuilder,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

const xpostConfig = require("../utilities/config.js").xpost || { servers: {} };
if (xpostConfig.servers["all"] !== undefined) {
  throw 'ERROR: xpost config contains a server named "all"!';
}

const options = [
  {
    label: "All Servers",
    description: "Cross post to every server subscribed to yours!",
    value: "all",
  },
  ...Object.entries(xpostConfig.servers).map(([id, value]) => ({
    label: value.label || id,
    description: value.description || id,
    value: id,
  })),
];

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setType(ApplicationCommandType.Message)
    .setName("Cross Post"),

  async execute(interaction) {
    console.log(
      `${interaction.user.username} (${interaction.user.id}) started an x-post interaction in ${interaction.channel.name} (${interaction.channel.id})`
    );

    const components = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("xpost--" + interaction.targetMessage.id)
        .setPlaceholder("destination server")
        .addOptions(options)
    );
    await interaction.reply({
      content: "Cross-Post to...",
      components: [components],
      ephemeral: true,
    });
  },

  async onMessageInteraction(interaction) {
    if (!interaction.isStringSelectMenu()) return;

    const destServer = options.find(x => x.value == interaction.values[0]).label;
    await interaction.update({ content: `Cross-Posted to **${destServer}**!`, components: [] });
    
    const srcServer = Object.values(xpostConfig.servers).find(server => server.id == interaction.channel.guildId).label;
    const srcUsername = interaction.member?.nickname || interaction.user.username;
    const message = await interaction.channel.messages.fetch(interaction.customId.split("--")[1]);
    const timestamp = Math.floor(message.createdTimestamp / 1000);
    
    interaction.channel.send(`[Cross-Post | ${srcServer} | ${srcUsername} (<t:${timestamp}:R>)]\n ${message.content}`);
  }
};
