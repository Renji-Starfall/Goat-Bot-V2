const axios = require("axios");

module.exports = {
  config: {
    name: "blague",
    version: "1.0",
    author: "Renji Starfall",
    role: 0,
    shortDescription: "Affiche une blague",
    longDescription: "Récupère et affiche une blague aléatoire depuis une API publique",
    category: "fun",
    guide: {
      fr: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    const url = "https://blague-api.vercel.app/api?mode=global";

    try {
      const res = await axios.get(url);
      const data = res.data;

      const blague = data.blague;
      const reponse = data.reponse;

      
      message.reply(`😄 Blague : ${blague}`, async (err, info) => {
        if (err) return;

        // Attend 3 secondes puis envoie la réponse
        setTimeout(() => {
          message.reply(`👉 Réponse : ${reponse}`);
        }, 2000);
      });
    } catch (error) {
      console.error(error);
      message.reply("❌ Impossible de récupérer une blague pour le moment.");
    }
  }
};
