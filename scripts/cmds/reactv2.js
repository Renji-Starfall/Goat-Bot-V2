const emojiRegex = require("emoji-regex");
const { isValidReaction } = require("./utils/facebookUtils"); // Voir explication plus bas

module.exports = {
  config: {
    name: 'reactv2',
    author: 'Sandip x Jun',
    version: '2.1',
    countDown: 1,
    role: 0,
    category: 'interaction',
    shortDescription: {
      en: "Ajoute des réactions aux messages avec des emojis",
      fr: "React to messages with emojis"
    },
    longDescription: {
      en: "Automatically reacts to messages containing emojis with the same emoji",
      fr: "Réagit automatiquement aux messages contenant des emojis avec le même emoji"
    }
  },

  onStart: async function({ api, event }) {
    // Message d'aide si la commande est appelée directement
    if (event.body.toLowerCase() === `${this.config.name} help`) {
      return api.sendMessage(
        `✨ ${this.config.name} - Guide d'utilisation ✨\n\n` +
        "Cette commande permet de réagir aux messages avec des emojis.\n\n" +
        "Comment utiliser:\n" +
        "1. Envoyez un message contenant un ou plusieurs emojis\n" +
        "2. Le bot réagira avec les mêmes emojis\n\n" +
        "Exemple:\n" +
        "Envoyez 'Hello! 😍👍' et le bot réagira avec 😍 et 👍",
        event.threadID
      );
    }
  },

  onChat: async function({ event, api, message }) {
    const { body, messageID, threadID, senderID } = event;

    // Ignorer les messages du bot lui-même
    if (senderID === api.getCurrentUserID()) return;

    // Vérifier si le message contient des emojis
    const emojis = body?.match(emojiRegex());
    
    if (emojis && emojis.length > 0) {
      try {
        // Filtrer les emojis valides pour Facebook
        const validEmojis = emojis.filter(emoji => isValidReaction(emoji));
        
        if (validEmojis.length === 0) return;

        // Réagir avec chaque emoji valide
        for (const emoji of validEmojis) {
          try {
            await api.setMessageReaction(emoji, messageID, (err) => {
              if (err) console.error(`Failed to react with ${emoji}:`, err);
            });
            
            // Délai entre les réactions pour éviter les rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Error reacting with ${emoji}:`, error);
          }
        }
      } catch (error) {
        console.error("Error in reactv2 command:", error);
      }
    }
  }
};

// Créez un fichier facebookUtils.js dans un dossier utils avec ce contenu :
/*
const FB_ALLOWED_REACTIONS = new Set([
  "👍", "❤️", "😆", "😮", "😢", "😠", "👎", // Réactions de base
  "🥰", "😂", "😍", "🤔", "🙏", "🎉",      // Emojis supplémentaires supportés
  // Ajoutez d'autres emojis selon vos besoins
]);

module.exports = {
  isValidReaction: (emoji) => FB_ALLOWED_REACTIONS.has(emoji)
};
*/
