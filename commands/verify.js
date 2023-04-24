const { google } = require("googleapis");

const { authorize } = require("../utilities/google-auth");

const { randomUUID } = require("crypto");
const config = require("../utilities/config");
const { Op } = require("sequelize");
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const db = require("../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify your school affiliation")
    .addSubcommand((subcommand) =>
      subcommand.setName("ucla").setDescription("Verify as a UCLA student")
    ),
  async execute(interaction) {
    console.log(
      `${interaction.user.username} (${interaction.user.id}) ran /verify in ${interaction.channel.name} (${interaction.channel.id})`
    );
    if (interaction.options.getSubcommand(false) === "ucla") {
      await interaction.deferReply({ ephemeral: true });
      // if they already are verified with this discord id, give role and stop
      let isVerified = await db.verifiedUsers.findOne({
        where: { discordID: interaction.user.id },
      });
      if (isVerified && isVerified.university === "UCLA") {
        const UCLARole = await interaction.guild.roles.cache.find(
          (r) => r.name === "UCLA"
        );
        await interaction.member.roles.add(UCLARole);
        await interaction.followUp(
          "It appears you are already verified as a UCLA student. If you didn't already have it, the UCLA role was given to you."
        );
        return;
      }
      let verification = await db.verifyRequests.findByPk(interaction.user.id);
      if (verification !== null) {
        await verification.destroy();
      }
      const expr = new Date().setTime(
        new Date().getTime() +
          parseInt(
            config["verification"]["verification max time in minutes"]
          ) *
            60000
      );
      verification = await db.verifyRequests.create({
        discordID: interaction.user.id,
        email: null,
        verifyToken: randomUUID(),
        expiration: expr,
      });

      let link = config["verification"]["ucla verification link"]
        .replace("{{USERNAME}}", encodeURIComponent(interaction.user.tag))
        .replace("{{DISCORDID}}", encodeURIComponent(interaction.user.id))
        .replace(
          "{{UUID}}",
          encodeURIComponent(await verification.verifyToken)
        );

      const formLinkButton = new ButtonBuilder()
        .setLabel("Submit verification request")
        .setURL(link)
        .setStyle(ButtonStyle.Link);

      const verifyButton = new ButtonBuilder()
        .setCustomId("verify--ucla--" + verification.verifyToken)
        .setLabel("Check verification request")
        .setStyle(ButtonStyle.Success);
      const row = new ActionRowBuilder().addComponents(
        verifyButton,
        formLinkButton
      );

      await interaction.followUp({
        content:
          `Submit a verification request using the link below, and then click the "check verification" button after you have submitted.\n\nThis verification request will expire in ${config["verification"]["verification max time in minutes"]} minutes.`,
        components: [row],
      });
    }
  },
  async onMessageInteraction(interaction) {
    if (interaction.customId.startsWith("verify--ucla--")) {
      await interaction.deferReply({ ephemeral: true });
      const uuid = interaction.customId.substring("verify--ucla--".length);
      const verifyRequest = await db.verifyRequests.findOne({
        where: {
          discordID: interaction.user.id,
          verifyToken: uuid,
          expiration: { [Op.gt]: new Date() },
        },
      });
      if (verifyRequest === null) {
        await interaction.followUp(
          "This verification request is invalid. Re-run the /verify command again."
        );
        return;
      }
      let auth = await authorize();
      const forms = google.forms({
        version: "v1",
        auth: auth,
      });
      const res = await forms.forms.responses.list({
        formId: config["verification"]["ucla verification form id"],
        filter:
          "timestamp > " +
          new Date(
            new Date() -
              config["verification"]["verification max time in minutes"] *
                60 *
                1000 * 1.2
          ).toISOString(),
      });
      if (res.data.responses === undefined) {
        await interaction.followUp(
          "No submission found. Either you have not submitted the form yet or submitted the form but changed one of the fields."
        );
        return;
      }
      const match = res.data.responses.find((r) => {
        return (
          r.answers[config["verification"]["discord id field id"]].textAnswers
            .answers[0].value === interaction.user.id &&
          r.answers[config["verification"]["discord name field id"]].textAnswers
            .answers[0].value === interaction.user.tag &&
          r.answers[config["verification"]["verification token field id"]]
            .textAnswers.answers[0].value === uuid
        );
      });

      if (match === undefined) {
        await interaction.followUp(
          "No submission found. Either you have not submitted the form yet, submitted the form but changed one of the fields, or failed to submit the verification request within 15 minutes."
        );
        return;
      }
      await verifyRequest.destroy();
      const UCLARole = await interaction.guild.roles.cache.find(
        (r) => r.name === "UCLA"
      );
      // Check if email was already used, and if so, remove role from old user if they exist
      const oldRecord = await db.verifiedUsers.findByPk(match.respondentEmail);
      if (oldRecord !== null) {
        const oldUser = await interaction.guild.members.fetch(
          await oldRecord.discordID
        );
        try {
          await oldUser.roles.remove(UCLARole);
        } catch {
          // Don't crash if can't find old user
        }
        await oldRecord.destroy();
      }
      await db.verifiedUsers.create({
        discordID: interaction.user.id,
        email: match.respondentEmail,
        university: "UCLA",
      });
      await interaction.member.roles.add(UCLARole);
      await interaction.followUp("You have been verified as a UCLA student!");
    } else {
      await interaction.reply({
        ephemeral: true,
        content: "An unknown error occurred",
      });
    }
  },
};
