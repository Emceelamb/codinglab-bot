const getter = {
  /**
   * Getting keyword in database that's synonymous with input:
   * @param {string} input
   */
  synonymous(input) {
    switch (input) {
      case "js":
        return "javascript";
      case "react":
        return "reactjs";
      case "reactnative":
        return "reactnativejs";
      case "unreal":
        return "unrealengine";
      case "pcomp":
        return "physicalcomputing"
      case "vue":
        return "vuejs";
      case "p5":
        return "p5js";
      case "node":
        return "nodejs";
      case "max":
      case "msp":
      case "jitter":
        return "maxmsp";
      default:
        return input;
    }
  },

  /**
   * Get counselors that have skills matched with input keyword:
   * @param {object} data
   */

  skillMatchedCounselors(data, inputSkill) {
    return data.filter((counselorInfo) => {
      // formatted skills is matched with F column in the sheet
      const rawSkills = counselorInfo[4].split(", ");
      const formattedInputSkill = getter.synonymous(
        setter.formatKeyword(inputSkill)
      );

      return (
        rawSkills.filter((skill) => {
          const formattedSkill = setter.formatKeyword(skill);
          return formattedSkill === formattedInputSkill;
        }).length > 0
      );
      c;
    });
  },
};

const setter = {
  /**
   * Format keyword into shape that conforms database skill strings:
   * @param {string} keyword
   */
  formatKeyword(keyword) {
    const regexPattern = /\w/gi;
    return keyword.match(regexPattern).join("").toLowerCase();
  },
};

/**
 * Function that includes message sending actions of the bot
 */
function botMsgActions(incoming) {
  const sendMsg = (msg) => {
    incoming.channel.send(msg)
  };

  return {
    sendAll(data) {
      let counselorTable = "```*** Coding Lab Tech Info *** \n\n";
      // console.log(data)
      // 1. loop through fetched array of data
      data.forEach((counselorInfo, counselorIndex) => {
        // 2. Initiate start of the message sending to Discord
        let zoomId = counselorInfo[3].slice(-10);
        counselorTable += `${counselorInfo[0]} | ${counselorInfo[2]} | ZoomID: ${zoomId}\n${counselorInfo[1]}  \n\n`;

        // 3. Send the message at the end of the array
        const midCounselor =  Math.floor((data.length / 2) - 1);
        if (counselorIndex == midCounselor) {
          counselorTable += "```";
          sendMsg(`
              ${counselorTable}
              `);
          counselorTable = "```"
        }
        const isLastCounselor = counselorIndex === data.length - 1;
        if (isLastCounselor) {
          counselorTable += "```";
          sendMsg(`
              ${counselorTable}
              `);
        }
      });
    },
    sendSkillMatched(data, inputSkill) {
      const matchedOnes = getter.skillMatchedCounselors(data, inputSkill);

      if (matchedOnes.length > 0) {
        let msgTable = ` \`\`\`*** Following Techs Know <${inputSkill}>*** \n\n`;

        matchedOnes.forEach((counselor, counselorIndex) => {
          let zoomId = counselor[3].slice(-10);
          msgTable += `${counselor[0]} | ${counselor[2]} | ZoomID: ${zoomId} \n\n`;

          // msgTable += `${counselor[0]} knows ${inputSkill}! Try ${counselor[2]}\n`;

          const isLastCounselor = counselorIndex === matchedOnes.length - 1;
          if (isLastCounselor) {
            msgTable += "```";
            msgTable +=
              "Book hours here: https://calendar.google.com/calendar/selfsched?sstoken=UUQtTkNDbVFiUEhRfGRlZmF1bHR8NGNkOWNlZWVjOTZhYzI0MjAxNDYyMzFiMTJmNWZiZmE";
            sendMsg(`
              ${msgTable}
              `);
          }
        });
      } else {
        sendMsg(
          `😅 Sorry! We have no ${inputSkill} experts at this time.  Try an ITP resident or faculty member here: https://itp.nyu.edu/help/in-person-help/office-hours/`
        );
      }
    },
  };
}

exports.botMsgActions = botMsgActions;
