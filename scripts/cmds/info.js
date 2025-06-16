const fs = require("fs");

let startTime = Date.now();

module.exports = {
  config: {
    name: "info",
    version: "1.1",
    author: "Renji Starfall",
    role: 0,
    shortDescription: "Infos détaillées du bot",
    longDescription: "Affiche des informations complètes sur le bot sans utiliser de token.",
    category: "system",
    guide: {
      fr: "{pn}"
    }
  },

  onStart: async function ({ message, api }) {
    try {
      const prefix = global.GoatBot.config.prefix;
      const botName = global.GoatBot.config.name || "Bot";
      const botID = api.getCurrentUserID();

      // Nom du bot
      const botInfo = await api.getUserInfo(botID);
      const botPseudo = botInfo[botID]?.name || "Inconnu";

      // Durée d'activité
      const uptime = Date.now() - startTime;
      const seconds = Math.floor((uptime / 1000) % 60);
      const minutes = Math.floor((uptime / (1000 * 60)) % 60);
      const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
      const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
      const duration = `${days}j ${hours}h ${minutes}m ${seconds}s`;

      // Admins
      const admins = global.GoatBot.config.adminBot || [];
      const adminInfo = await api.getUserInfo(admins);
      const adminMentions = [];
      let adminListText = "";

      for (const id of admins) {
        const name = adminInfo[id]?.name || "Inconnu";
        adminMentions.push({ tag: name, id });
        adminListText += `• @${name} (${id})\n`;
      }

      // Nombre d'utilisateurs (fichiers dans data/users)
      const usersPath = `${__dirname}/../data/users`;
      const users = fs.existsSync(usersPath) ? fs.readdirSync(usersPath) : [];
      const userCount = users.length;

      // Nombre de groupes de messagerie (fichiers dans data/threads)
      const threadsPath = `${__dirname}/../data/threads`;
      const threads = fs.existsSync(threadsPath) ? fs.readdirSync(threadsPath) : [];
      const threadCount = threads.length;

      // Message final
      const msg =
        `📌 ${botName} — [ ${botPseudo} ]\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🔹 Préfixe : ${prefix}\n` +
        `🔹 Durée d'activité : ${duration}\n` +
        `🔹 Admins (${admins.length}) :\n${adminListText}` +
        `🔹 Utilisateurs enregistrés : ${userCount}\n` +
        `🔹 Groupes de messagerie : ${threadCount}`;

      return message.reply({
        body: msg,
        mentions: adminMentions
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ Une erreur est survenue lors de la récupération des informations.");
    }
  }
};
