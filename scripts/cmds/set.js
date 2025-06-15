module.exports = {
  config: {
    name: "set",
    aliases: ['money'],
    version: "1.0",
    author: "Loid Butter",
    role: 0,
    shortDescription: {
      en: "𝐁𝐨𝐬𝐬 𝒗𝒐𝒖𝒔 𝒂𝒗𝒆𝒛 𝒅𝒐𝒏𝒏𝒆𝒓 𝒅𝒆 𝒍'𝒂𝒓𝒈𝒆𝒏𝒕 𝒆𝒕 experience points 𝒂 𝒄𝒆 𝒑𝒂𝒖𝒗𝒓𝒆 a user"
    },
    longDescription: {
      en: "𝐁𝐨𝐬𝐬 𝒗𝒐𝒖𝒔 𝒂𝒗𝒆𝒛 𝒅𝒐𝒏𝒏𝒆𝒓 𝒅𝒆 𝒍'𝒂𝒓𝒈𝒆𝒏𝒕 𝒆t experience points et experience points 𝒂 𝒄𝒆 𝒑𝒂𝒖𝒗𝒓𝒆 a user"
    },
    category: "game",
    guide: {
      en: "{pn}set [money|exp] [amount]"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {
    const permission = ["100092251751272"];
  if (!permission.includes(event.senderID)) {
    api.sendMessage("𝑯𝒆𝒐 𝒔𝒂𝒍𝒆 𝒅𝒆́𝒍𝒊𝒏𝒒𝒖𝒂𝒏𝒕 𝒔𝒆𝒖𝒍 𝒍𝒆 𝐁𝐨𝐬𝐬 𝗦𝗼𝗺𝗮 𝗗𝗲𝘅𝘁𝗲𝘂𝗿 𝒑𝒆𝒖𝒕 𝒇𝒂𝒊𝒓𝒆 𝒄𝒂🖕", event.threadID, event.messageID);
    return;
  }
    const query = args[0];
    const amount = parseInt(args[1]);

    if (!query || !amount) {
      return api.sendMessage("Invalid command arguments. Usage: set [query] [amount]", event.threadID);
    }

    const { messageID, senderID, threadID } = event;

    if (senderID === api.getCurrentUserID()) return;

    let targetUser;
    if (event.type === "message_reply") {
      targetUser = event.messageReply.senderID;
    } else {
      const mention = Object.keys(event.mentions);
      targetUser = mention[0] || senderID;
    }

    const userData = await usersData.get(targetUser);
    if (!userData) {
      return api.sendMessage("User not found.", threadID);
    }

    const name = await usersData.getName(targetUser);

    if (query.toLowerCase() === 'exp') {
      await usersData.set(targetUser, {
        money: userData.money,
        exp: amount,
        data: userData.data
      });

      return api.sendMessage(`Set experience points to ${amount} for ${name}.`, threadID);
    } else if (query.toLowerCase() === 'money') {
      await usersData.set(targetUser, {
        money: amount,
        exp: userData.exp,
        data: userData.data
      });

      return api.sendMessage(`Set coins to ${amount} for ${name}.`, threadID);
    } else {
      return api.sendMessage("Invalid query. Use 'exp' to set experience points or 'money' to set coins.", threadID);
    }
  }
};
