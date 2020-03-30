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
      data.forEach(counselorInfo => {
        sendMsg(`YEAH 🎉 \n ${counselorInfo}`);
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
