//.env for environmental variables
let env = require("dotenv").config();
let channelID = process.env.CHANNEL_ID;
console.log(`Working with the Channel ID: ${channelID}`);

var googlesheetsapi = require("./googlesheetapi.js");
var Discord = require("discord.io");
var logger = require("winston");
var auth = require("./auth.json");
const cron = require("node-cron");

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

// Cron does time like so:
// ('<minutes(of 60)> <hours(of 24)> <days(of month)> <months> <year>')
// * means "every"
// cron.schedule('0 10 * * *', function (err) {
  cron.schedule('* * * * *', function (err) {
    if (err) {
      console.log('Cron Job - There was an error ' + error);
    }

    const apptCal = 'https://itp.nyu.edu/help/in-person-help/coding-lab/'

    const hour = new Date().getHours(); // returns 0-23 for 12am - 11pm
    const min = new Date().getMinutes(); // returns 0-59
    const time = `${hour}:${min}`;

    // get the google sheet
    const unresolvedData = googlesheetsapi.fetchGoogle();
    const botMsgAct = botMsgActions(bot, channelID);

    unresolvedData.then(rawData => {
      const data = rawData.data.values;
      const day = new Date().getDay(); //returns 0-6 for Sun-Sat
      const dayNum = checkDay(day);
      const matched = data.filter(counselorInfo => {
        return (
          counselorInfo.filter(info => {
            return info.toLowerCase().search(dayNum.toLowerCase()) > -1;
          }).length > 0
        );
      });
      // console.log(`the day is ${dayNum} \nand matched is ${matched}`)
      let matchedIndex = 0;
      if (matched.length > 0) {
        // let msg = '```*** New Shifts Starting Now! ***\n\n';
        let theDay = dayNum
        if (theDay == 'Wed'){
          theDay = 'Wednes'
        }
        let msg = '```'
        msg += `*** Here\'s who\'s on duty for ${theDay}day! ***\n\n`;
        matched.forEach((counselor, matchedIndex, matched) => {
          // let zoomId=counselorInfo[3].slice(-10)
          let zoomId=counselor[3];

          msg += `${counselor[0]} is in the lab from ${counselor[2].split(' ')[1]}\n`;
          msg += `Feel free to drop in here: ${zoomId}\n\n`
          matchedIndex++;
          if(matchedIndex === matched.length){
            msg += `If you missed us, you can always make an appt here: \n${apptCal}\n\n`
            msg += '```';
          }
        });
        // console.log(`We send this daily announcement:\n${msg}`);
        bot.sendMessage({
          to: channelID,
          message: msg
        });
      }
    });
  },
{
  scheduled: true, timezone: "America/New_York"
});

function checkDay(day){
  switch (day) {
    case 1:
    return 'Mon'
    break;
    case 2:
    return 'Tues'
    break;
    case 3:
    return 'Wed'
    break;
    case 4:
    return 'Thurs'
    break;
    case 5:
    return 'Fri'
    break;
    default:
      return "no day found"
    break;
  }
}
