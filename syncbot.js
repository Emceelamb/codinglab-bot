var googlesheetsapi = require('./googlesheetapi.js');
// var googlesheetsapi = require('./gasync.js');
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'codinglab':
                // googlesheetsapi.fetchGoogle();
                let codinglab = googlesheetsapi.fetchGoogle();
                console.log(codinglab)
                // codinglab.then((result)=>{
                //   console.log("fffff")
                // bot.sendMessage({
                //     to: channelID,
                //     message: result
                // });
                // })

                bot.sendMessage({
                    to: channelID,
                    message: codinglab
                });

                // googlesheetsapi.fetchGoogle()
                // .then((codinglab)=>{
                //     console.log(codinglab, "THIS is printk")
                //     bot.sendMessage({
                //         to: channelID,
                //         message: codinglab[0]
                //     });
                // })
                // console.log(codinglabresult, 'coding lab case')
          
                break;
          case 'thetime':
                time = Date.now();
            bot.sendMessage({
                    to: channelID,
                    message: time
                })
                break;

            // Just add any case commands if you want to..
         }
     }
});

