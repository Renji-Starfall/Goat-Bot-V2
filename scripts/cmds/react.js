const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: "react",
    version: "1.0",
    author: "Renji Starfall",
    description: "Ajoute des réactions aux publications Facebook",
    usage: "react [lien] [réaction]",
    category: "interaction"
  },

  onStart: async function({ api, event, args }) {
    // Liste des réactions disponibles avec leurs codes
    const REACTIONS = {
      like: "👍",
      love: "❤️",
      haha: "😆",
      wow: "😯",
      sad: "😢",
      angry: "😠"
    };

    // Vérification des permissions
    const allowedUsers = ["61557674704673"]; 
    if (!allowedUsers.includes(event.senderID)) {
      return api.sendMessage("❌ Accès réservé à l'administrateur.", event.threadID);
    }

    // Aide si aucun argument
    if (args.length === 0 || args[0] === 'help') {
      let helpMessage = "📌 Usage: react [lien] [réaction]\n\n";
      helpMessage += "Réactions disponibles:\n";
      for (const [key, emoji] of Object.entries(REACTIONS)) {
        helpMessage += `- ${key}: ${emoji}\n`;
      }
      helpMessage += "\nExemple: react https://fb.com/xxx love";
      return api.sendMessage(helpMessage, event.threadID);
    }

    // Extraction du lien et de la réaction
    const postUrl = args[0];
    const reactionType = args[1]?.toLowerCase() || 'like';

    // Vérification de la réaction
    if (!REACTIONS[reactionType]) {
      return api.sendMessage(`❌ Réaction invalide. Utilisez "react help" pour voir les options.`, event.threadID);
    }

    try {
      // Extraction de l'ID de la publication
      const postId = extractPostId(postUrl);
      if (!postId) {
        return api.sendMessage("❌ Lien invalide. Veuillez fournir un lien direct vers une publication.", event.threadID);
      }

      // Envoi de la réaction
      await api.setPostReaction(postId, REACTIONS[reactionType]);
      
      // Confirmation
      return api.sendMessage(
        `${REACTIONS[reactionType]} Réaction "${reactionType}" ajoutée avec succès!`,
        event.threadID
      );

    } catch (error) {
      console.error("Erreur réaction:", error);
      return api.sendMessage(
        `❌ Erreur lors de l'ajout de la réaction: ${error.message}`,
        event.threadID
      );
    }
  }
};

// Fonction pour extraire l'ID de la publication
function extractPostId(url) {
  const regex = /(?:\/|%2F)(\d+)(?:[?%]|$)/i;
  const match = url.match(regex);
  return match ? match[1] : null;
}
