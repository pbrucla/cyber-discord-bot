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
  PermissionFlagsBits,
} = require("discord.js");
const db = require("../database");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify your school affiliation")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand.setName("ucla").setDescription("Verify as a ucla student")
    ),
  async execute(interaction) {
    console.log(
      `${interaction.user.username} (${interaction.user.id}) ran /verify in ${interaction.channel.name} (${interaction.channel.id})`
    );
    if (interaction.options.getSubcommand(false) === "ucla") {
      await interaction.deferReply({ ephemeral: true });
      let verification = await db.verifyRequests.findByPk(interaction.user.id);
      if (verification === null || verification.expiration < Date.now()) {
        if (verification !== null) {
          await verification.destroy();
        }
        verification = await db.verifyRequests.create({
          discordID: interaction.user.id,
          email: null,
          verifyToken: randomUUID(),
          expiration:
            Date.now() + config["verification max time in minutes"] * 60 * 1000,
        });
      }
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
          "Submit a verification request by clicking the first button, and then click the second button after you have submitted.\n\nThis verification request will expire in 15 minutes.",
        components: [row],
      });
    }
  },
  async onMessageInteraction(interaction) {
    if (interaction.customId.startsWith("verify--ucla--")) {
      const uuid = interaction.customId.substring("verify--ucla--".length);
      const verifyRequest = db.verifyRequests.findOne({
        where: {
          discordID: interaction.user.id,
          verifyToken: uuid,
          expiration: { [Op.lt]: new Date() },
        },
      });
      console.log(uuid);
      if (verifyRequest === null) {
        await interaction.reply(
          "No active verification request was found for your discord account. Re-run the /verify command again."
        );
      } else {
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
              Date.now() -
                config["verification"]["verification max time in minutes"] *
                  60 *
                  1000
            ).toISOString(),
        });
        console.log(JSON.stringify(res.data));
        const match = res.data.responses.find((r) => {
          return (
            r.answers[config["verification"]["discord id field id"]].textAnswers
              .answers[0].value === interaction.user.id &&
            r.answers[config["verification"]["discord name field id"]]
              .textAnswers.answers[0].value === interaction.user.tag &&
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
        console.log("MATCH: " + JSON.stringify(match));
        return res.data.responses[0].answers;
      }
    } else {
      await interaction.reply({
        ephemeral: true,
        content: "An unknown error occurred",
      });
    }
  },
};
