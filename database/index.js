const Sequelize = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "data/database.sqlite",
  logging: false,
});

let reminders = sequelize.define("reminders", {
  discordID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  reminderID: {
    type: Sequelize.UUIDV4,
    primaryKey: true,
  },
  remindTime: {
    type: Sequelize.DATE,
  },
  data: {
    type: Sequelize.TEXT,
  },
});

reminders.sync();

module.exports.reminders = reminders;

verifiedUsers = sequelize.define("VerifiedUsers", {
  discordID: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  university: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "UCLA",
  },
});

verifiedUsers.sync();

module.exports.verifiedUsers = verifiedUsers;

verifyRequests = sequelize.define("VerificationRequest", {
  discordID: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  verifyToken: {
    type: Sequelize.UUIDV4,
    allowNull: false,
  },
  expiration: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

verifyRequests.sync();

module.exports.verifyRequests = verifyRequests;
