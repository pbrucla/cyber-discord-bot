const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Administrator)
    .setName("request-role")
    .setDescription("Send a message to allow you to choose a role."),
  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("role-request--cyber-academy")
        .setLabel("Cyber Academy")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("role-request--special-topics")
        .setLabel("Special Topics")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ content: "Choose a role: ", components: [row] });
  },
  async onMessageInteraction(interaction) {
    interaction.inCachedGuild();
    if (interaction.customId === "role-request--cyber-academy") {
      if(interaction.member.roles.cache.find((r) => r.name === "Cyber Academy") === undefined){
        await interaction.reply({
          content: "You have been given the Cyber Academy role.",
          ephemeral: true,
        });
        const role = interaction.guild.roles.cache.find(
          (r) => r.name === "Cyber Academy"
        );
        await interaction.member.roles.add(role);
      }
      else{
        await interaction.reply({
          content: "The Cyber Academy role has been removed.",
          ephemeral: true,
        });
        await interaction.member.roles.remove(interaction.member.roles.cache.find((r) => r.name === "Cyber Academy"));
      }
    } else if (interaction.customId === "role-request--special-topics") {
        if(interaction.member.roles.cache.find((r) => r.name === "Special Topics") === undefined){
          await interaction.reply({
          content: "You have been given the Special Topics role.",
          ephemeral: true,
        });
        const role = interaction.guild.roles.cache.find(
          (r) => r.name === "Special Topics"
        );
        await interaction.member.roles.add(role);
      }
      else{
        await interaction.reply({
          content: "The Special Topics role has been removed.",
          ephemeral: true,
        });
        await interaction.member.roles.remove(interaction.member.roles.cache.find((r) => r.name === "Special Topics"));
      }
    }
  },
};
