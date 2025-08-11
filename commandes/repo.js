const axios = require('axios');
const moment = require("moment-timezone");
const {
  zokou
} = require(__dirname + "/../framework/zokou");
let dynamicForks = 5000;
const fetchGitHubRepoDetails = async () => {
  try {
    const _0x299604 = await axios.get("https://api.github.com/repos/rahzyn/HEROKU-BT
  ");
    const {
      name: _0x5f1a24,
      stargazers_count: _0x1940ac,
      watchers_count: _0x2365d6,
      open_issues_count: _0x53a2fc,
      forks_count: _0x2e6046,
      owner: _0x1152ca
    } = _0x299604.data;
    dynamicForks += _0x2e6046;
    return {
      'name': _0x5f1a24,
      'stars': _0x1940ac,
      'watchers': _0x2365d6,
      'issues': _0x53a2fc,
      'forks': dynamicForks,
      'owner': _0x1152ca.login,
      'url': _0x299604.data.html_url
    };
  } catch (_0xe7174e) {
    console.error("Error fetching GitHub repository details:", _0xe7174e);
    return null;
  }
};
const commands = ['repo'];
commands.forEach(_0x1ca6ff => {
  zokou({
    'nomCom': _0x1ca6ff,
    'categorie': 'GitHub'
  }, async (_0x5572c8, _0x1227ab, _0x12485d) => {
    let {
      repondre: _0x2b154b
    } = _0x12485d;
    const _0x273797 = await fetchGitHubRepoDetails();
    if (!_0x273797) {
      _0x2b154b("âŒ Failed to fetch GitHub repository information.");
      return;
    }
    const {
      name: _0x163d01,
      stars: _0x338fb7,
      watchers: _0x845e6c,
      issues: _0x492e00,
      forks: _0x3bf668,
      owner: _0x327d1d,
      url: _0x1b763d
    } = _0x273797;
    const _0x41ff89 = moment().tz("Africa/Dodoma").format("DD/MM/YYYY HH:mm:ss");
    const _0x291a03 = "\n *Name:* " + _0x163d01 + "\n *Stars:* " + _0x338fb7.toLocaleString() + "\n *Forks:* " + _0x3bf668.toLocaleString() + "\n *Watchers:* " + _0x845e6c.toLocaleString() + "\n *Open Issues:* " + _0x492e00.toLocaleString() + "\n *Owner:* " + _0x327d1d + "\n\n✅ *Fetched on:* " + _0x41ff89 + "\n\n🪡 *Repo Link:* " + _0x1b763d + "\n\n𝚂𝚃𝙰𝚈 𝚄𝙿𝙳𝙰𝚃𝙴 𝚆𝙸𝚃𝙷 𝙷𝙴𝚁𝙾𝙺𝚄-𝙱𝚃";
    try {
      await _0x1227ab.sendMessage(_0x5572c8, {
        'text': _0x291a03,
        'contextInfo': {
          'externalAdReply': {
            'title': "𝚂𝚃𝙰𝚈 𝚄𝙿𝙳𝙰𝚃𝙴 𝚆𝙸𝚃𝙷 𝙷𝙴𝚁𝙾𝙺𝚄-𝙱𝚃",
            'body': "ᴛᴀᴘ ʜᴇʀ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ!",
            'thumbnailUrl': "https://files.catbox.moe/zotx9t.jpg",
            'mediaType': 0x1,
            'renderLargerThumbnail': true,
            'mediaUrl': "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
            'sourceUrl': "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X"
          }
        }
      });
    } catch (_0x339e0c) {
      console.error("âŒ Error sending GitHub info:", _0x339e0c);
      _0x2b154b("âŒ Error sending GitHub info: " + _0x339e0c.message);
    }
  });
});
