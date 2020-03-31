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
      let counselorTable = "```\nCounselor \t | \t Time \t | Zoom ID  "
      counselorTable += "\rSkills\n"
      counselorTable += "----------------\n"

      data.forEach((counselorInfo, counselorIndex, data) => {
        let zoomId=counselorInfo[3].slice(-10)
        counselorTable+=`${counselorInfo[0]} | ${counselorInfo[2]} | Zoom ID: ${zoomId}\n${counselorInfo[1]}  \n\n`
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

      if (matched.length > 0) {
        matched.forEach(counselor => {
          sendMsg(
            `${counselor[0]} knows ${keyword}! Book the office hour at ${counselor[2]}`
          );
        });
      } else {
        sendMsg(`😅 Sorry! No one knows ${keyword} at this moment.`);
      }
    }
  };
}

exports.botMsgActions = botMsgActions;
