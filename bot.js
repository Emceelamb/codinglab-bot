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

    function sendMsg(res) {
      bot.sendMessage({
        to: channelID,
        message: res
      });
    }

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
              message: "You can query skills with the command `!codinglab skill <anyskill>` or you can list all mentors with `!codinglab`"
            })
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
cron.schedule('* * * * *', function (err) {
    if (err) {
      console.log('Cron Job - There was an error ' + error);
    }
    // the Discord channelID for Ms Server General
    const channelID = '693153935917318195';
    const apptCal = 'https://itp.nyu.edu/help/in-person-help/coding-lab/'

    const hour = new Date().getHours(); // returns 0-23 for 12am - 11pm
    const min = new Date().getMinutes(); // returns 0-59
    const time = `${hour}:${min}`;
    console.log("This is the time: " + time);

    // get the google sheet
    const unresolvedData = googlesheetsapi.fetchGoogle();
    const botMsgAct = botMsgActions(bot, channelID);

    unresolvedData.then(rawData => {
      const data = rawData.data.values;
      const day = new Date().getDay(); //returns 0-6 for Sun-Sat
      const dayNum = checkDay(day);
      // console.log(dayNum);
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
        let msg = '```**New Shifts Starting Now!**\n\n'';
        matched.forEach((counselor, matchedIndex, matched) => {
          // let zoomId=counselorInfo[3].slice(-10)
          let zoomId=counselor[3];
          msg += `${counselor[0]} is in the lab today from ${counselor[2].split(' ')[1]}\n`;
          msg += `Feel free to drop in here: ${zoomId}\n`
          msg += `Or make an appt here: ${apptCal}\n\n`
          matchedIndex++;
          if(matchedIndex === matched.length){
            msg += '```'
            bot.sendMessage({
              to: channelID,
              message: msg
            });
          }
            // sendMsg(`
            //    ${msg}
            //    `);
            // }
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
