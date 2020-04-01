// helper function
function botMsgActions(bot, channelID) {
  const sendMsg = msg => {
    bot.sendMessage({
      to: channelID,
      message: msg
    });
  };

  return {
    sendAll(data) {

      let counselorIndex = 0;
      let counselorTable = "```\nCounselor \t | \t Time \t | Zoom Mtg ID  "
      counselorTable += "\rSkills\n"
      counselorTable += "----------------\n"

      data.forEach((counselorInfo, counselorIndex, data) => {
        let zoomId=counselorInfo[3].slice(-10)
        counselorTable+=`${counselorInfo[0]} | ${counselorInfo[2]} | Zoom Mtg ID: ${zoomId}\n${counselorInfo[1]}  \n\n`
          counselorIndex++;
          if(counselorIndex === data.length){
            counselorTable+='```'
            sendMsg(`
              ${counselorTable}
              `);
          }
      });
    },
    sendSkillMatched(data, keyword) {
      const matched = data.filter(counselorInfo => {
        return (
          counselorInfo.filter(info => {
            return info.toLowerCase().search(keyword.toLowerCase()) > -1;
          }).length > 0
        );
      });

      let matchedIndex = 0;
      let msg = '```';

      // Would prefer this format
      // Billy knows p5.js - try Monday 2-5pm!
      // Mark knows p5.js - try Tuesday 2-5pm!

      if (matched.length > 0) {
        matched.forEach((counselor, matchedIndex, matched) => {
          msg += `${counselor[0]} knows ${keyword}! Try ${counselor[2]}\n`;
          matchedIndex++;
          if(matchedIndex === matched.length){
            msg+='```'
            sendMsg(`
              ${msg}
              `);
          }
        });
      } else {
        sendMsg(`😅 Sorry! We have no ${keyword} experts at this time.  Try an ITP resident or faculty member here: https://itp.nyu.edu/help/in-person-help/office-hours/`);
      }
    }
  };
}

exports.botMsgActions = botMsgActions;
