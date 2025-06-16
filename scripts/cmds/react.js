const axios = require('axios');

module.exports = {
  config: {
    name: "react",
    version: "2.0",
    author: "Renji Starfall",
    description: "Ajoute des réactions aux publications Facebook (nouveaux formats supportés)",
    usage: "[réaction] [lien]",
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
      angry: "😠",
      care: "🥰"  // Ajout de nouvelles réactions
    };

    // Vérification des permissions
    const allowedUsers = ["61557674704673"]; // Remplacez par votre ID
    if (!allowedUsers.includes(event.senderID)) {
      return api.sendMessage("🔒 Accès réservé à l'administrateur.", event.threadID);
    }

    // Aide si aucun argument
    if (args.length === 0 || args[0] === 'help') {
      let helpMessage = "🌟 Réactions Facebook Bot 🌟\n\n";
      helpMessage += "📌 Usage: react [réaction] [lien]\n\n";
      helpMessage += "🔄 Réactions disponibles:\n";
      for (const [key, emoji] of Object.entries(REACTIONS)) {
        helpMessage += `• ${key.padEnd(6)}: ${emoji}\n`;
      }
      helpMessage += "\n💡 Exemple: react love https://fb.com/xxx";
      return api.sendMessage(helpMessage, event.threadID);
    }

    // Nouvelle structure: [réaction] [lien]
    const reactionType = args[0]?.toLowerCase();
    const postUrl = args[1];

    // Vérification de la réaction
    if (!REACTIONS[reactionType]) {
      return api.sendMessage(`❌ Réaction "${reactionType}" invalide. Utilisez "react help" pour voir les options.`, event.threadID);
    }

    if (!postUrl) {
      return api.sendMessage("❌ Veuillez fournir un lien vers la publication.", event.threadID);
    }

    try {
      // Extraction améliorée de l'ID de la publication
      const postId = extractPostIdV2(postUrl);
      if (!postId) {
        return api.sendMessage("🔗 Lien invalide. Formats acceptés:\n- Liens directs\n- Liens avec paramètres\n- Liens mobiles", event.threadID);
      }

      // Envoi de la réaction
      await api.setPostReaction(postId, REACTIONS[reactionType]);
      
      // Confirmation stylisée
      return api.sendMessage(
        `✅ ${REACTIONS[reactionType]} Réaction "${reactionType}" ajoutée avec succès!\n\nPublication: ${postId}`,
        event.threadID
      );

    } catch (error) {
      console.error("Erreur réaction:", error);
      return api.sendMessage(
        `❌ Échec de la réaction: ${error.message}\n\nAssurez-vous que:\n1. Le lien est valide\n2. La publication existe\n3. Le bot a les permissions`,
        event.threadID
      );
    }
  }
};

// Fonction améliorée pour extraire l'ID avec support des nouveaux formats
function extractPostIdV2(url) {
  // Version améliorée qui gère plus de formats
  const patterns = [
    /(?:\/|%2F)(\d+)(?:[?%/]|$)/i,                      // Format standard
    /(?:posts%2F|posts\/)(\d+)/i,                        // Format mobile
    /story_fbid=(\d+)/i,                                 // Format avec paramètres
    /\/photos\/[^\/]+\/(\d+)/i,                          // Format photos
    /\/permalink\.php\?story_fbid=(\d+)/i                // Format permalink
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}
