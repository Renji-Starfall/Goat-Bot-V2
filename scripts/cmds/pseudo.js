const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
};

function applyFont(text) {
    return text.split('').map(char => fontMapping[char] || char).join('');
}

function createBox(content) {
    const lines = content.split('\n');
    let result = `╭─⌾⋅ ${applyFont(" 𝙋𝙎𝙀𝙐𝘿𝙊")} ⌾──╮\n│\n`;
    
    for (const line of lines) {
        if (line.trim() === '') continue;
        result += `│   ${applyFont(line)}\n│\n`;
    }
    
    result += `╰─────⌾⋅  ⋅⌾─────╯`;
    return result;
}

module.exports = {
    config: {
        name: "pseudo",
        version: "2.0",
        author: "VotreNom",
        role: 2, // Seuls les admins peuvent utiliser
        shortDescription: "Change le pseudo du bot partout",
        longDescription: createBox(applyFont("Modifie le pseudonyme du bot dans\n tous les groupes et conversations")),
        category: "admin",
        guide: createBox(applyFont("Utilisation:\n{pn} <nouveau_pseudo>"))
    },

    onStart: async function ({ api, event, args, message, threadsData, usersData }) {
        const BOT_OWNER = "61557674704673"; // Votre UID
        if (event.senderID !== BOT_OWNER) {
            return message.reply(createBox(applyFont("❌ Accès réservé au propriétaire")));
        }

        const newNickname = args.join(" ");
        if (!newNickname) {
            return message.reply(createBox(applyFont("⚠ Veuillez spécifier un pseudo\nEx: pseudo [Mon Super Bot]")));
        }

        try {
            const allThreads = await threadsData.getAll();
            const allUsers = await usersData.getAll();
            
            const results = {
                groups: { success: [], failed: [] },
                privates: { success: [], failed: [] }
            };

            // Changer dans les groupes
            for (const thread of allThreads) {
                try {
                    await api.changeNickname(newNickname, thread.threadID, api.getCurrentUserID());
                    const threadInfo = await api.getThreadInfo(thread.threadID);
                    results.groups.success.push({
                        name: threadInfo.threadName || "Sans nom",
                        id: thread.threadID
                    });
                } catch (error) {
                    results.groups.failed.push({
                        id: thread.threadID,
                        error: error.message
                    });
                }
            }

            // Changer dans les conversations privées
            for (const user of allUsers) {
                if (user.userID === api.getCurrentUserID()) continue;
                
                try {
                    await api.changeNickname(newNickname, user.userID, api.getCurrentUserID());
                    const userInfo = await api.getUserInfo(user.userID);
                    results.privates.success.push({
                        name: userInfo[user.userID].name,
                        id: user.userID
                    });
                } catch (error) {
                    results.privates.failed.push({
                        id: user.userID,
                        error: error.message
                    });
                }
            }

            // Générer le rapport
            let report = `✅ Pseudo changé en: "${newNickname}"\n\n`;
            report += `📊 Groupes:\n`;
            report += `✔ ${results.groups.success.length} succès\n`;
            report += `✖ ${results.groups.failed.length} échecs\n\n`;
            
            report += `📩 Conversations privées:\n`;
            report += `✔ ${results.privates.success.length} succès\n`;
            report += `✖ ${results.privates.failed.length} échecs\n\n`;
            
            if (results.groups.failed.length > 0 || results.privates.failed.length > 0) {
                report += `🔍 Détails des échecs:\n`;
                
                if (results.groups.failed.length > 0) {
                    report += `\nGroupes:\n`;
                    results.groups.failed.slice(0, 5).forEach(fail => {
                        report += `- ID: ${fail.id}\n  Raison: ${fail.error}\n`;
                    });
                    if (results.groups.failed.length > 5) report += `...et ${results.groups.failed.length - 5} autres\n`;
                }
                
                if (results.privates.failed.length > 0) {
                    report += `\nPrivés:\n`;
                    results.privates.failed.slice(0, 5).forEach(fail => {
                        report += `- ID: ${fail.id}\n  Raison: ${fail.error}\n`;
                    });
                    if (results.privates.failed.length > 5) report += `...et ${results.privates.failed.length - 5} autres\n`;
                }
            }

            // Sauvegarder le nouveau pseudo globalement
            global.GoatBot.config.nicknameBot = [newNickname];
            
            message.reply(createBox(applyFont(report)));

        } catch (error) {
            console.error("Erreur dans la commande pseudo:", error);
            message.reply(createBox(applyFont("❌ Erreur critique\nVoir les logs pour détails")));
        }
    }
};
