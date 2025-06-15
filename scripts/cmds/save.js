const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Configuration avec token intégré
const CONFIG = {
  GITHUB_TOKEN: "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v",
  REPO_OWNER: "Renji-Starfall",
  REPO_NAME: "RavenBot",
  BRANCH: "main",
  ADMIN_ID: "61557674704673", // ID Messenger de l'admin
  ALLOWED_USERS: ["61557674704673"], // IDs autorisés
  AUTO_SAVE_INTERVAL: 30 * 60 * 1000 // 30 minutes
};

function getAllJsonFiles(dirPath, root = dirPath) {
  let results = [];
  const list = fs.readdirSync(dirPath);

  list.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsonFiles(filePath, root));
    } else if (file.endsWith(".json")) {
      results.push({
        fullPath: filePath,
        relativePath: path.relative(root, filePath).replace(/\\/g, "/")
      });
    }
  });

  return results;
}

async function saveToGitHub(filePath, content, commitMessage) {
  const apiUrl = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contents/${filePath}`;
  
  try {
    let sha;
    try {
      const { data } = await axios.get(apiUrl, {
        headers: { Authorization: `token ${CONFIG.GITHUB_TOKEN}` }
      });
      sha = data.sha;
    } catch {
      sha = undefined;
    }

    const encodedContent = Buffer.from(content).toString("base64");

    await axios.put(apiUrl, {
      message: commitMessage,
      content: encodedContent,
      branch: CONFIG.BRANCH,
      sha
    }, {
      headers: {
        Authorization: `token ${CONFIG.GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

module.exports = {
  config: {
    name: "save",
    version: "1.6",
    author: "JulioRaven",
    description: "Sauvegarde sur GitHub avec notifications admin",
  },

  async handleCommand({ message, event, args, api }) {
    if (!CONFIG.ALLOWED_USERS.includes(event.senderID)) {
      return message.reply("❌ Accès réservé à l'administrateur.");
    }

    if (!args[0]) {
      return message.reply("ℹ️ Usage: save [nom_commande] ou save -g");
    }

    if (args[0] === "-g") {
      const cmdsPath = path.join(__dirname, "..", "cmds");

      let files;
      try {
        files = getAllJsonFiles(cmdsPath);
      } catch (e) {
        return message.reply("Erreur lecture fichiers: " + e.message);
      }

      if (files.length === 0) {
        return message.reply("Aucun fichier trouvé.");
      }

      await message.reply("⏳ Sauvegarde en cours...");

      const results = [];
      for (const { fullPath, relativePath } of files) {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          const { success, error } = await saveToGitHub(
            `scripts/cmds/${relativePath}`,
            content,
            `Mise à jour: ${relativePath}`
          );
          results.push(success ? `✅ ${relativePath}` : `❌ ${relativePath} - ${error}`);
        } catch (e) {
          results.push(`❌ ${relativePath} - ${e.message}`);
        }
      }

      await api.sendMessage(
        `📦 Sauvegarde terminée:\n\n${results.join("\n")}`,
        CONFIG.ADMIN_ID
      );
      return message.reply("✅ Notification envoyée en privé.");
    }

    const fileName = args[0].endsWith(".js") ? args[0] : `${args[0]}.js`;
    const filePath = path.join(__dirname, "..", "cmds", fileName);

    if (!fs.existsSync(filePath)) {
      return message.reply("❌ Fichier introuvable.");
    }

    await message.reply(`⏳ Sauvegarde de ${fileName}...`);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const { success, error } = await saveToGitHub(
        `scripts/cmds/${fileName}`,
        content,
        `Ajout: ${fileName}`
      );

      if (success) {
        await api.sendMessage(
          `✅ ${fileName} sauvegardé avec succès.`,
          CONFIG.ADMIN_ID
        );
        return message.reply("✔️ Succès - Voir message privé.");
      } else {
        throw new Error(error);
      }
    } catch (e) {
      await api.sendMessage(
        `❌ Erreur sur ${fileName}: ${e.message}`,
        CONFIG.ADMIN_ID
      );
      return message.reply("⚠️ Erreur - Voir message privé.");
    }
  },

  onStart(params) {
    return this.handleCommand(params);
  },

  startAutoSave(api) {
    if (this.interval) clearInterval(this.interval);
    
    this.interval = setInterval(async () => {
      try {
        const cmdsPath = path.join(__dirname, "..", "cmds");
        const files = getAllJsonFiles(cmdsPath);
        
        if (files.length === 0) return;

        console.log("⏳ Sauvegarde auto en cours...");
        
        for (const { fullPath, relativePath } of files) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            await saveToGitHub(
              `scripts/cmds/${relativePath}`,
              content,
              `Auto-save: ${new Date().toLocaleString()}`
            );
          } catch (e) {
            console.error(`Erreur ${relativePath}:`, e);
          }
        }

        await api.sendMessage(
          `✅ Sauvegarde auto terminée à ${new Date().toLocaleString()}`,
          CONFIG.ADMIN_ID
        );
        console.log("✅ Sauvegarde auto terminée");

      } catch (e) {
        console.error("Erreur sauvegarde auto:", e);
        api.sendMessage(
          `❌ Erreur sauvegarde auto: ${e.message}`,
          CONFIG.ADMIN_ID
        ).catch(console.error);
      }
    }, CONFIG.AUTO_SAVE_INTERVAL);
  },

  stopAutoSave() {
    if (this.interval) clearInterval(this.interval);
  }
};
