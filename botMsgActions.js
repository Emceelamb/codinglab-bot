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
function botMsgActions(incoming, Discord) {
  const sendMsg = (msg) => {
    incoming.channel.send(msg)
  };

  return {
    sendAll(data) {
      const embed = new Discord.MessageEmbed()
        .setColor('#000000')
        .setTitle(`Coding Lab Techs`);

      data.forEach((counselor, counselorIndex) => {
        let zoomTokens = counselor[3].split('/');
        embed.addField(counselor[0], `*${counselor[2]}* | Zoom ID: ${zoomTokens[zoomTokens.length - 1]} | [Book Appointments Here](${counselor[5]})\n${counselor[1]}`);
      });
      sendMsg(embed);
    },
    sendSkillMatched(data, inputSkill) {
      const matchedOnes = getter.skillMatchedCounselors(data, inputSkill);

      if (matchedOnes.length > 0) {
        const embed = new Discord.MessageEmbed()
          .setColor('#000000')
          .setTitle(`Following Lab Techs Know \`${inputSkill}\``);

        matchedOnes.forEach((counselor, counselorIndex) => {
          let zoomTokens = counselor[3].split('/');
          embed.addField(counselor[0], `*${counselor[2]}* | Zoom ID: ${zoomTokens[zoomTokens.length - 1]} | [Book Appointments Here](${counselor[5]})`);
        });
  
        sendMsg(embed);
      } else {
        sendMsg(
          `😅 Sorry! We have no ${inputSkill} experts at this time.  Try an ITP resident or faculty member here: https://itp.nyu.edu/help/in-person-help/office-hours/`
        );
      }
    },
  };
}

exports.botMsgActions = botMsgActions;
