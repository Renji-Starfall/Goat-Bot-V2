const axios = require('axios');

module.exports = {
  config: {
    name: "blaque",
    version: "1.0",
    author: "Renji Starfall",
    role: 0,
    shortDescription: "Affiche une blague drôle",
    longDescription: "Récupère une blague depuis une API et envoie la réponse sans répondre au message initial.",
    category: "fun",
    guide: {
      fr: "{pn}"
    }
  },

  onStart: async function ({ api, event, message }) {
    const url = "https://blague-api.vercel.app/api?mode=global";

    try {
      const res = await axios.get(url);
      const data = res.data;

      const blague = data.blague || "Blague introuvable";
      const reponse = data.reponse || "Réponse indisponible";

      // Envoie la blague en réponse au message initial
      api.sendMessage(blague, event.threadID, (err, info) => {
        if (err) return message.reply("❌ Erreur lors de l'envoi de la blague.");
        
        // Après 2 secondes, envoie la réponse sans répondre au message initial
        setTimeout(() => {
          api.sendMessage(reponse, event.threadID);
        }, 2000);
      }, event.messageID);
    } catch (error) {
      console.error(error);
      message.reply("❌ Une erreur est survenue lors de la récupération de la blague.");
    }
  }
};
