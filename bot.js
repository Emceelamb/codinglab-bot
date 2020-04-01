var googlesheetsapi = require("./googlesheetapi.js");
var Discord = require("discord.io");
var logger = require("winston");
var auth = require("./auth.json");

const { botMsgActions } = require("./botMsgActions.js");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true
});
logger.level = "debug";

// Initialize Discord Bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

bot.on("ready", function(evt) {
  logger.info("Connected");
  logger.info("Logged in as: ");
  logger.info(bot.username + " - (" + bot.id + ")");
});

bot.on("message", function(user, userID, channelID, message, evt) {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.substring(0, 1) == "!") {
    var args = message.substring(1).split(" ");
    var cmd = args[0];

    args = args.splice(1);
    switch (cmd) {
      // !ping
      case "codinglab":
        const subCmd = args[0];
        const unresolvedData = googlesheetsapi.fetchGoogle();
        const botMsgAct = botMsgActions(bot, channelID);

        switch (subCmd) {
          case "help":
            bot.sendMessage({
              to: channelID,
              message:
                "To find help a lab tech with a particular skill, use: `!codinglab skill <anyskill>` or you can list all lab techs with: `!codinglab`"
            });
            break;
          case "skill":
            const skill = args[1];
            unresolvedData.then(rawData => {
              botMsgAct.sendSkillMatched(rawData.data.values, skill);
            });
            break;
          default:
            unresolvedData.then(rawData => {
              botMsgAct.sendAll(rawData.data.values);
            });
            break;
        }

        break;
      // Just add any case commands if you want to..
    }
  }
});
