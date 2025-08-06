const { zokou } = require("../framework/zokou");
const fancy = require("../bmw/style");

zokou({ nomCom: "fancy", categorie: "Fun", reaction: "〽️" }, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe } = commandeOptions;
    const id = arg[0]?.match(/\d+/)?.join('');
    const text = arg.slice(1).join(" ");

    try {
        if (!id || !text.length) {
            return await repondre(
                `\nExemple : ${prefixe}fancy 10 Bmw-Md\n` +
                String.fromCharCode(8206).repeat(4001) +
                fancy.list('KYPHER_XMD', fancy)
            );
        }

        const selectedStyle = fancy[parseInt(id) - 1];
        if (selectedStyle) {
            return await repondre(fancy.apply(selectedStyle, text));
        } else {
            return await repondre('_Style introuvable. Utilisez une ID entre 1 et ' + fancy.length + '._');
        }
    } catch (error) {
        console.error(error);
        return await repondre(`_Erreur :_ ${error.message}`);
    }
});
