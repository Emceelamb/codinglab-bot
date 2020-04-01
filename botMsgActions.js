/**
 * Getting keyword in database that's synonymous with input:
 * @param {string} input
 */
function getSynonymous(input) {
  switch (input) {
    case "js":
      return "javascript";
    case "react":
      return "reactjs";
    case "vue":
      return "vuejs";
    case "p5":
      return "p5js";
    case "node":
      return "nodejs";
    default:
      return input;
  }
}

/**
 * Format keyword into shape that conforms database skill strings:
 * @param {string} keyword
 */
function getFormattedKeyword(keyword) {
  const regexPattern = /\w/gi;
  return keyword
    .match(regexPattern)
    .join("")
    .toLowerCase();
}

/**
 * Function that includes message sending actions of the bot:
 * @param {Discord.Client} bot
 * @param {string} channelID
 */
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
      // let counselorTable = "```\nCounselor \t | \t Time \t | Zoom ID"
      // counselorTable += "\rSkills\n"
      let counselorTable = "```*** Coding Lab Tech Info *** \n\n";
      // counselorTable += "----------------\n"

      data.forEach((counselorInfo, counselorIndex, data) => {
        let zoomId = counselorInfo[3].slice(-10);
        counselorTable += `${counselorInfo[0]} | ${counselorInfo[2]} | ZoomID: ${zoomId}\n${counselorInfo[1]}  \n\n`;
        counselorIndex++;
        if (counselorIndex === data.length) {
          counselorTable += "```";
          sendMsg(`
              ${counselorTable}
              `);
        }
      });
    },
    sendSkillMatched(data, inputSkill) {
      const matched = data.filter(counselorInfo => {
        // formatted skills is matched with F column in the sheet
        const rawSkills = counselorInfo[5].split(", ");
        const formattedInputSkill = getSynonymous(
          getFormattedKeyword(inputSkill)
        );

        return (
          rawSkills.filter(skill => {
            const formattedSkill = getFormattedKeyword(skill);
            return formattedSkill === formattedInputSkill;
          }).length > 0
        );
        c;
      });

      if (matched.length > 0) {
        let matchedIndex = 0;
        let msg = "```";

        matched.forEach(counselor => {
          msg += `${counselor[0]} knows ${inputSkill}! Try ${counselor[2]}\n`;
          matchedIndex++;
          if (matchedIndex === matched.length) {
            msg += "```";
            msg +=
              "Book hours here: https://calendar.google.com/calendar/selfsched?sstoken=UUQtTkNDbVFiUEhRfGRlZmF1bHR8NGNkOWNlZWVjOTZhYzI0MjAxNDYyMzFiMTJmNWZiZmE";
            sendMsg(`
              ${msg}
              `);
          }
        });
      } else {
        sendMsg(
          `😅 Sorry! We have no ${inputSkill} experts at this time.  Try an ITP resident or faculty member here: https://itp.nyu.edu/help/in-person-help/office-hours/`
        );
      }
    }
  };
}

exports.botMsgActions = botMsgActions;
