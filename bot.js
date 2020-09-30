require("dotenv").config()
let channelID = process.env.CHANNEL_ID;
console.log(`Working with the Channel ID: ${channelID}`);

var googlesheetsapi = require("./googlesheetapi.js");
var Discord = require("discord.js");
var logger = require("winston");
var auth = require("./secret/discord.json");
const cron = require("node-cron");

const { botMsgActions } = require("./botMsgActions.js");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true
});
logger.level = "debug";

// Initialize Discord Bot
var bot = new Discord.Client();

bot.login(auth.token);

bot.on("ready", () => {
  logger.info("Logged in as: " + bot.user.tag);
});

bot.on("message", (message) => {
  // console.log(message)
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.channel.id == channelID && message.content.substring(0, 1) == "!") {
    var args = message.content.substring(1).split(" ");
    var cmd = args[0];

    args = args.splice(1);
    switch (cmd) {
      // !ping
      case "codinglab":
        const subCmd = args[0];
        const unresolvedData = googlesheetsapi.fetchGoogle();
        const botMsgAct = botMsgActions(message, Discord);

        switch (subCmd) {
          case "help":
            message.channel.send(
                "To find help a lab tech with a particular skill, use: \n`!codinglab skill <anyskill>` \nor you can list all lab techs with: \n`!codinglab`"
            );
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

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Cron does time like so:
// ('<minutes(of 60)> <hours(of 24)> <days(of month)> <months> <year>')
// * means "every"
cron.schedule('0 10 * * *', function (err) {
    if (err) {
      console.log('Cron Job - There was an error ' + error);
    }

    const apptCal = 'https://itp.nyu.edu/help/in-person-help/coding-lab/'

    // get the google sheet
    const unresolvedData = googlesheetsapi.fetchGoogle();

    unresolvedData.then(rawData => {
      const data = rawData.data.values;
      const day = new Date().getDay(); //returns 0-6 for Sun-Sat
      const dayName = days[day]
      const matched = data.filter(counselorInfo => {
        return (
          counselorInfo.filter(info => {
            return info.toLowerCase().search(dayName.toLowerCase()) > -1;
          }).length > 0
        );
      });
      // console.log(`the day is ${dayNum} \nand matched is ${matched}`)
      if (matched.length > 0) {
        // let msg = '```*** New Shifts Starting Now! ***\n\n';
        const embed = new Discord.MessageEmbed()
          .setColor('#000000')
          .setTitle(`Here\'s who\'s on duty for ${dayName}`);

        matched.forEach((counselor, counselorIndex) => {
          embed.addField(`${counselor[0]} is in the lab ${counselor[2].split(' ')[1]}!`, `Feel free to drop by at ${counselor[3]}`);
        });

        embed.addField('\u200b', `If you missed us, you can always make an appointment at ${apptCal}`);
        bot.channels.cache.get(channelID).send(embed);
      }
    });
  },
{
  scheduled: true, timezone: "America/New_York"
});
