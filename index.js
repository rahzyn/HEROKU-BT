function hi() {
  const _0x1d5d32 = function () {
    let _0x2de554 = true;
    return function (_0x538bbf, _0x555f9e) {
      const _0x1c24c8 = _0x2de554 ? function () {
        if (_0x555f9e) {
          const _0x3a2431 = _0x555f9e.apply(_0x538bbf, arguments);
          _0x555f9e = null;
          return _0x3a2431;
        }
      } : function () {};
      _0x2de554 = false;
      return _0x1c24c8;
    };
  }();
  const _0x5ebd1b = _0x1d5d32(this, function () {
    return _0x5ebd1b.toString().search('(((.+)+)+)+$').toString().constructor(_0x5ebd1b).search("(((.+)+)+)+$");
  });
  _0x5ebd1b();
  const _0x1fa82b = function () {
    let _0x17e62e = true;
    return function (_0x433755, _0x1858dc) {
      const _0x3eacab = _0x17e62e ? function () {
        if (_0x1858dc) {
          const _0x587d75 = _0x1858dc.apply(_0x433755, arguments);
          _0x1858dc = null;
          return _0x587d75;
        }
      } : function () {};
      _0x17e62e = false;
      return _0x3eacab;
    };
  }();
  const _0x11c610 = _0x1fa82b(this, function () {
    const _0x5dd883 = function () {
      let _0x51abd6;
      try {
        _0x51abd6 = Function("return (function() {}.constructor(\"return this\")( ));")();
      } catch (_0x1abe7b) {
        _0x51abd6 = window;
      }
      return _0x51abd6;
    };
    const _0x236b75 = _0x5dd883();
    const _0x2ee1cf = _0x236b75.console = _0x236b75.console || {};
    const _0x9a48ea = ["log", "warn", "info", "error", 'exception', "table", "trace"];
    for (let _0x2a845a = 0x0; _0x2a845a < _0x9a48ea.length; _0x2a845a++) {
      const _0x51720e = _0x1fa82b.constructor.prototype.bind(_0x1fa82b);
      const _0x49b8d3 = _0x9a48ea[_0x2a845a];
      const _0x598108 = _0x2ee1cf[_0x49b8d3] || _0x51720e;
      _0x51720e.__proto__ = _0x1fa82b.bind(_0x1fa82b);
      _0x51720e.toString = _0x598108.toString.bind(_0x598108);
      _0x2ee1cf[_0x49b8d3] = _0x51720e;
    }
  });
  _0x11c610();
  console.log("Hello World!");
}
hi();
"use strict";
var __createBinding = this && this.__createBinding || (Object.create ? function (_0x502825, _0x4c73fc, _0x4b834b, _0x49b047) {
  if (_0x49b047 === undefined) {
    _0x49b047 = _0x4b834b;
  }
  var _0x490dd6 = Object.getOwnPropertyDescriptor(_0x4c73fc, _0x4b834b);
  if (!_0x490dd6 || ("get" in _0x490dd6 ? !_0x4c73fc.__esModule : _0x490dd6.writable || _0x490dd6.configurable)) {
    _0x490dd6 = {
      'enumerable': true,
      'get': function () {
        return _0x4c73fc[_0x4b834b];
      }
    };
  }
  Object.defineProperty(_0x502825, _0x49b047, _0x490dd6);
} : function (_0x5e2ba1, _0x4fa789, _0x42c5be, _0x9b43e4) {
  if (_0x9b43e4 === undefined) {
    _0x9b43e4 = _0x42c5be;
  }
  _0x5e2ba1[_0x9b43e4] = _0x4fa789[_0x42c5be];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (_0x508675, _0x1254b5) {
  Object.defineProperty(_0x508675, "default", {
    'enumerable': true,
    'value': _0x1254b5
  });
} : function (_0x62b5e6, _0x52083b) {
  _0x62b5e6['default'] = _0x52083b;
});
var __importStar = this && this.__importStar || function (_0x25ac08) {
  if (_0x25ac08 && _0x25ac08.__esModule) {
    return _0x25ac08;
  }
  var _0x3f1ec6 = {};
  if (_0x25ac08 != null) {
    for (var _0x30e50c in _0x25ac08) if (_0x30e50c !== "default" && Object.prototype.hasOwnProperty.call(_0x25ac08, _0x30e50c)) {
      __createBinding(_0x3f1ec6, _0x25ac08, _0x30e50c);
    }
  }
  __setModuleDefault(_0x3f1ec6, _0x25ac08);
  return _0x3f1ec6;
};
var __importDefault = this && this.__importDefault || function (_0xc7ce2d) {
  return _0xc7ce2d && _0xc7ce2d.__esModule ? _0xc7ce2d : {
    'default': _0xc7ce2d
  };
};
Object.defineProperty(exports, "__esModule", {
  'value': true
});
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const logger = logger_1["default"].child({});
logger.level = 'silent';
const pino = require("pino");
const boom_1 = require('@hapi/boom');
const conf = require("./set");
let fs = require('fs-extra');
let path = require("path");
const FileType = require("file-type");
const {
  Sticker,
  createSticker,
  StickerTypes
} = require('wa-sticker-formatter');
const {
  verifierEtatJid,
  recupererActionJid
} = require('./bdd/antilien');
const {
  atbverifierEtatJid,
  atbrecupererActionJid
} = require("./bdd/antibot");
let evt = require(__dirname + "/framework/zokou");
const {
  isUserBanned,
  addUserToBanList,
  removeUserFromBanList
} = require("./bdd/banUser");
const {
  addGroupToBanList,
  isGroupBanned,
  removeGroupFromBanList
} = require("./bdd/banGroup");
const {
  isGroupOnlyAdmin,
  addGroupToOnlyAdminList,
  removeGroupFromOnlyAdminList
} = require("./bdd/onlyAdmin");
let {
  reagir
} = require(__dirname + '/framework/app');
var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g, '');
const prefixe = conf.PREFIXE;
async function authentification() {
  try {
    if (!fs.existsSync(__dirname + "/auth/creds.json")) {
      console.log("connexion en cour ...");
      await fs.writeFileSync(__dirname + '/auth/creds.json', atob(session), "utf8");
    } else if (fs.existsSync(__dirname + '/auth/creds.json') && session != "zokk") {
      await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
    }
  } catch (_0x514ceb) {
    console.log("Session Invalid " + _0x514ceb);
    return;
  }
}
authentification();
0x0;
const store = baileys_1.makeInMemoryStore({
  'logger': pino().child({
    'level': "silent",
    'stream': "store"
  })
});
setTimeout(() => {
  async function _0xbc60a7() {
    0x0;
    const {
      version: _0x295699,
      isLatest: _0x535adf
    } = await baileys_1.fetchLatestBaileysVersion();
    0x0;
    const {
      state: _0x4cc50b,
      saveCreds: _0x17507d
    } = await baileys_1.useMultiFileAuthState(__dirname + "/auth");
    0x0;
    const _0x306d6a = {
      'version': _0x295699,
      'logger': pino({
        'level': "silent"
      }),
      'browser': ["Heroku bt", "safari", "1.0.0"],
      'printQRInTerminal': true,
      'fireInitQueries': false,
      'shouldSyncHistoryMessage': true,
      'downloadHistory': true,
      'syncFullHistory': true,
      'generateHighQualityLinkPreview': true,
      'markOnlineOnConnect': false,
      'keepAliveIntervalMs': 0x7530,
      'auth': {
        'creds': _0x4cc50b.creds,
        'keys': baileys_1.makeCacheableSignalKeyStore(_0x4cc50b.keys, logger)
      },
      'getMessage': async _0x5ee449 => {
        if (store) {
          const _0x5d53fb = await store.loadMessage(_0x5ee449.remoteJid, _0x5ee449.id, undefined);
          return _0x5d53fb.message || undefined;
        }
        return {
          'conversation': "An Error Occurred, Repeat Command!"
        };
      }
    };
    0x0;
    const _0x269238 = baileys_1["default"](_0x306d6a);
    store.bind(_0x269238.ev);

    // ==========================================
    // SEHEMU MPYA: AUTO LIKE & REACT STATUS
    // ==========================================
    _0x269238.ev.on("messages.upsert", async (upsert) => {
        const { messages } = upsert;
        for (const msg of messages) {
            if (msg.key && msg.key.remoteJid === "status@broadcast") {
                if (conf.AUTO_READ_STATUS === "yes") {
                    await _0x269238.readMessages([msg.key]);
                }
                if (conf.AUTOREACT_STATUS === "yes" || conf.AUTO_LIKE_STATUS === "yes") {
                    try {
                        const emojis = ['👍', '❤️', '🔥', '✨', '🙌', '🤩', '✅'];
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay ya usalama

                        await _0x269238.sendMessage("status@broadcast", {
                            react: {
                                text: randomEmoji,
                                key: msg.key
                            }
                        }, { statusJidList: [msg.key.participant] });
                        
                        console.log("✅ Liked status from: " + msg.key.participant);
                    } catch (e) {
                        console.error("Error in Auto Like:", e);
                    }
                }
            }
        }
    });
    // ==========================================

    _0x269238.ev.on('messages.upsert', async _0x5c1ba5 => {
      const {
        messages: _0x12d2bf
      } = _0x5c1ba5;
      const _0x1b009c = _0x12d2bf[0x0];
      if (!_0x1b009c.message) {
        return;
      }
      const _0x3368f2 = _0x18f03a => {
        if (!_0x18f03a) {
          return _0x18f03a;
        }
        if (/:\d+@/gi.test(_0x18f03a)) {
          0x0;
          let _0x59f98d = baileys_1.jidDecode(_0x18f03a) || {};
          return _0x59f98d.user && _0x59f98d.server && _0x59f98d.user + '@' + _0x59f98d.server || _0x18f03a;
        } else {
          return _0x18f03a;
        }
      };
      0x0;
      var _0x578740 = baileys_1.getContentType(_0x1b009c.message);
      var _0x230518 = _0x578740 == "conversation" ? _0x1b009c.message.conversation : _0x578740 == 'imageMessage' ? _0x1b009c.message.imageMessage?.["caption"] : _0x578740 == "videoMessage" ? _0x1b009c.message.videoMessage?.['caption'] : _0x578740 == 'extendedTextMessage' ? _0x1b009c.message?.["extendedTextMessage"]?.["text"] : _0x578740 == "buttonsResponseMessage" ? _0x1b009c?.["message"]?.["buttonsResponseMessage"]?.["selectedButtonId"] : _0x578740 == "listResponseMessage" ? _0x1b009c.message?.["listResponseMessage"]?.["singleSelectReply"]?.["selectedRowId"] : _0x578740 == "messageContextInfo" ? _0x1b009c?.["message"]?.["buttonsResponseMessage"]?.['selectedButtonId'] || _0x1b009c.message?.["listResponseMessage"]?.['singleSelectReply']?.["selectedRowId"] || _0x1b009c.text : '';
      var _0x1deb7e = _0x1b009c.key.remoteJid;
      var _0x477c5e = _0x3368f2(_0x269238.user.id);
      var _0x1103cb = _0x477c5e.split('@')[0x0];
      const _0x43d599 = _0x1deb7e?.["endsWith"]("@g.us");
      var _0x52411e = _0x43d599 ? await _0x269238.groupMetadata(_0x1deb7e) : '';
      var _0x5ac29d = _0x43d599 ? _0x52411e.subject : '';
      var _0x9ed37e = _0x1b009c.message.extendedTextMessage?.['contextInfo']?.["quotedMessage"];
      var _0x5d0524 = _0x3368f2(_0x1b009c.message?.['extendedTextMessage']?.['contextInfo']?.["participant"]);
      var _0x3ce998 = _0x43d599 ? _0x1b009c.key.participant ? _0x1b009c.key.participant : _0x1b009c.participant : _0x1deb7e;
      if (_0x1b009c.key.fromMe) {
        _0x3ce998 = _0x477c5e;
      }
      var _0x417bcc = _0x43d599 ? _0x1b009c.key.participant : '';
      const {
        getAllSudoNumbers: _0x68a8f
      } = require("./bdd/sudo");
      const _0x1ff551 = _0x1b009c.pushName;
      const _0x2f5b0e = await _0x68a8f();
      const _0x511f3b = [_0x1103cb, '255693629079', '255693629079', "255693629079", "255693629079", conf.NUMERO_OWNER].map(_0x44828a => _0x44828a.replace(/[^0-9]/g) + "@s.whatsapp.net");
      const _0x27262e = _0x511f3b.concat(_0x2f5b0e);
      const _0x29b3ea = _0x27262e.includes(_0x3ce998);
      var _0x2683a6 = ['255693629079', '255693629079', "255693629079", "255693629079"].map(_0x24e0fc => _0x24e0fc.replace(/[^0-9]/g) + '@s.whatsapp.net').includes(_0x3ce998);
      function _0x2ec988(_0x57def9) {
        _0x269238.sendMessage(_0x1deb7e, {
          'text': _0x57def9
        }, {
          'quoted': _0x1b009c
        });
      }
      console.log("HEROKU-BT is ONLINE");
      console.log("=========== written message===========");
      if (_0x43d599) {
        console.log("message provenant du groupe : " + _0x5ac29d);
      }
      console.log("message envoyé par : [" + _0x1ff551 + " : " + _0x3ce998.split("@s.whatsapp.net")[0x0] + " ]");
      console.log("type de message : " + _0x578740);
      console.log("------ contenu du message ------");
      console.log(_0x230518);
      function _0x2d0cf7(_0x2596a5) {
        let _0x3081b2 = [];
        for (_0x5c1ba5 of _0x2596a5) {
          if (_0x5c1ba5.admin == null) {
            continue;
          }
          _0x3081b2.push(_0x5c1ba5.id);
        }
        return _0x3081b2;
      }
      var _0x2e3e3f = conf.ETAT;
      if (_0x2e3e3f == 0x1) {
        await _0x269238.sendPresenceUpdate('available', _0x1deb7e);
      } else {
        if (_0x2e3e3f == 0x2) {
          await _0x269238.sendPresenceUpdate("composing", _0x1deb7e);
        } else if (_0x2e3e3f == 0x3) {
          await _0x269238.sendPresenceUpdate("recording", _0x1deb7e);
        } else {
          await _0x269238.sendPresenceUpdate("unavailable", _0x1deb7e);
        }
      }
      const _0x5abd86 = _0x43d599 ? await _0x52411e.participants : '';
      let _0x1a095b = _0x43d599 ? _0x2d0cf7(_0x5abd86) : '';
      const _0x122e5e = _0x43d599 ? _0x1a095b.includes(_0x3ce998) : false;
      var _0x390549 = _0x43d599 ? _0x1a095b.includes(_0x477c5e) : false;
      const _0x2f6168 = _0x230518 ? _0x230518.trim().split(/ +/).slice(0x1) : null;
      const _0x20b615 = _0x230518 ? _0x230518.startsWith(prefixe) : false;
      const _0x4d257d = _0x20b615 ? _0x230518.slice(0x1).trim().split(/ +/).shift().toLowerCase() : false;
      const _0x52e904 = conf.URL.split(',');
      function _0x1adb06() {
        const _0x894c6b = Math.floor(Math.random() * _0x52e904.length);
        const _0x4c7dca = _0x52e904[_0x894c6b];
        return _0x4c7dca;
      }
      var _0x24c6a5 = {
        'superUser': _0x29b3ea,
        'dev': _0x2683a6,
        'verifGroupe': _0x43d599,
        'mbre': _0x5abd86,
        'membreGroupe': _0x417bcc,
        'verifAdmin': _0x122e5e,
        'infosGroupe': _0x52411e,
        'nomGroupe': _0x5ac29d,
        'auteurMessage': _0x3ce998,
        'nomAuteurMessage': _0x1ff551,
        'idBot': _0x477c5e,
        'verifZokouAdmin': _0x390549,
        'prefixe': prefixe,
        'arg': _0x2f6168,
        'repondre': _0x2ec988,
        'mtype': _0x578740,
        'groupeAdmin': _0x2d0cf7,
        'msgRepondu': _0x9ed37e,
        'auteurMsgRepondu': _0x5d0524,
        'ms': _0x1b009c,
        'mybotpic': _0x1adb06
      };
      if (_0x1b009c.message.protocolMessage && _0x1b009c.message.protocolMessage.type === 0x0 && conf.ADM.toLocaleLowerCase() === 'yes') {
        if (_0x1b009c.key.fromMe || _0x1b009c.message.protocolMessage.key.fromMe) {
          console.log("Message supprimer me concernant");
          return;
        }
        console.log("Message supprimer");
        let _0x155e65 = _0x1b009c.message.protocolMessage.key;
        try {
          const _0x5ac898 = fs.readFileSync('./store.json', "utf8");
          const _0x39c47b = JSON.parse(_0x5ac898);
          let _0x4e1b15 = _0x39c47b.messages[_0x155e65.remoteJid];
          let _0x32a3a8;
          for (let _0x1a3793 = 0x0; _0x1a3793 < _0x4e1b15.length; _0x1a3793++) {
            if (_0x4e1b15[_0x1a3793].key.id === _0x155e65.id) {
              _0x32a3a8 = _0x4e1b15[_0x1a3793];
              break;
            }
          }
          if (_0x32a3a8 === null || !_0x32a3a8 || _0x32a3a8 === "undefined") {
            console.log("Message non trouver");
            return;
          }
          await _0x269238.sendMessage(_0x477c5e, {
            'image': {
              'url': './media/deleted-message.jpg'
            },
            'caption': "        😎Anti-delete-message🥵\n Message from @" + _0x32a3a8.key.participant.split('@')[0x0] + '​',
            'mentions': [_0x32a3a8.key.participant]
          }).then(() => {
            _0x269238.sendMessage(_0x477c5e, {
              'forward': _0x32a3a8
            }, {
              'quoted': _0x32a3a8
            });
          });
        } catch (_0x38b239) {
          console.log(_0x38b239);
        }
      }
      
      // Imetolewa hapa kwani imeshawekwa juu kwenye loop mpya
      /*
      if (_0x1b009c.key && _0x1b009c.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "yes") {
        await _0x269238.readMessages([_0x1b009c.key]);
      }
      */

      if (_0x1b009c.key && _0x1b009c.key.remoteJid === "status@broadcast" && conf.AUTO_DOWNLOAD_STATUS === "yes") {
        if (_0x1b009c.message.extendedTextMessage) {
          var _0xfa3f4e = _0x1b009c.message.extendedTextMessage.text;
          await _0x269238.sendMessage(_0x477c5e, {
            'text': _0xfa3f4e
          }, {
            'quoted': _0x1b009c
          });
        } else {
          if (_0x1b009c.message.imageMessage) {
            var _0x5dee67 = _0x1b009c.message.imageMessage.caption;
            var _0x38d661 = await _0x269238.downloadAndSaveMediaMessage(_0x1b009c.message.imageMessage);
            await _0x269238.sendMessage(_0x477c5e, {
              'image': {
                'url': _0x38d661
              },
              'caption': _0x5dee67
            }, {
              'quoted': _0x1b009c
            });
          } else {
            if (_0x1b009c.message.videoMessage) {
              var _0x5dee67 = _0x1b009c.message.videoMessage.caption;
              var _0x1aa468 = await _0x269238.downloadAndSaveMediaMessage(_0x1b009c.message.videoMessage);
              await _0x269238.sendMessage(_0x477c5e, {
                'video': {
                  'url': _0x1aa468
                },
                'caption': _0x5dee67
              }, {
                'quoted': _0x1b009c
              });
            }
          }
        }
      }
      if (!_0x2683a6 && _0x1deb7e == "120363158701337904@g.us") {
        return;
      }
      if (_0x230518 && _0x3ce998.endsWith("s.whatsapp.net")) {
        const {
          ajouterOuMettreAJourUserData: _0x5856c0
        } = require("./bdd/level");
        try {
          await _0x5856c0(_0x3ce998);
        } catch (_0x3e8447) {
          console.error(_0x3e8447);
        }
      }
      try {
        if (_0x1b009c.message[_0x578740].contextInfo.mentionedJid && (_0x1b009c.message[_0x578740].contextInfo.mentionedJid.includes(_0x477c5e) || _0x1b009c.message[_0x578740].contextInfo.mentionedJid.includes(conf.NUMERO_OWNER + "@s.whatsapp.net"))) {
          if (_0x1deb7e == "120363158701337904@g.us") {
            return;
          }
          ;
          if (_0x29b3ea) {
            console.log("hummm");
            return;
          }
          let _0x1fde63 = require("./bdd/mention");
          let _0xc1829f = await _0x1fde63.recupererToutesLesValeurs();
          let _0x199580 = _0xc1829f[0x0];
          if (_0x199580.status === "non") {
            console.log("mention pas actifs");
            return;
          }
          let _0x1818d8;
          if (_0x199580.type.toLocaleLowerCase() === "image") {
            _0x1818d8 = {
              'image': {
                'url': _0x199580.url
              },
              'caption': _0x199580.message
            };
          } else {
            if (_0x199580.type.toLocaleLowerCase() === "video") {
              _0x1818d8 = {
                'video': {
                  'url': _0x199580.url
                },
                'caption': _0x199580.message
              };
            } else {
              if (_0x199580.type.toLocaleLowerCase() === "sticker") {
                let _0x3d8396 = new Sticker(_0x199580.url, {
                  'pack': conf.NOM_OWNER,
                  'type': StickerTypes.FULL,
                  'categories': ['🤩', '🎉'],
                  'id': "12345",
                  'quality': 0x46,
                  'background': "transparent"
                });
                const _0x32ded3 = await _0x3d8396.toBuffer();
                _0x1818d8 = {
                  'sticker': _0x32ded3
                };
              } else if (_0x199580.type.toLocaleLowerCase() === "audio") {
                _0x1818d8 = {
                  'audio': {
                    'url': _0x199580.url
                  },
                  'mimetype': "audio/mp4"
                };
              }
            }
          }
          _0x269238.sendMessage(_0x1deb7e, _0x1818d8, {
            'quoted': _0x1b009c
          });
        }
      } catch (_0x4d46ba) {}
      try {
        const _0x556902 = await verifierEtatJid(_0x1deb7e);
        if (_0x230518.includes("https://") && _0x43d599 && _0x556902) {
          console.log("lien detecté");
          var _0x31c0f7 = _0x43d599 ? _0x1a095b.includes(_0x477c5e) : false;
          if (_0x29b3ea || _0x122e5e || !_0x31c0f7) {
            console.log("je fais rien");
            return;
          }
          ;
          const _0x54060a = {
            'remoteJid': _0x1deb7e,
            'fromMe': false,
            'id': _0x1b009c.key.id,
            'participant': _0x3ce998
          };
          var _0x597c1c = "lien detected, \n";
          var _0x18713a = new Sticker("https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif", {
            'pack': "Zoou-Md",
            'author': conf.OWNER_NAME,
            'type': StickerTypes.FULL,
            'categories': ['🤩', '🎉'],
            'id': '12345',
            'quality': 0x32,
            'background': "#000000"
          });
          await _0x18713a.toFile("st1.webp");
          var _0x3a38e8 = await recupererActionJid(_0x1deb7e);
          if (_0x3a38e8 === "remove") {
            _0x597c1c += "message deleted \n @" + _0x3ce998.split('@')[0x0] + " removed from group.";
            await _0x269238.sendMessage(_0x1deb7e, {
              'sticker': fs.readFileSync("st1.webp")
            });
            0x0;
            baileys_1.delay(0x320);
            await _0x269238.sendMessage(_0x1deb7e, {
              'text': _0x597c1c,
              'mentions': [_0x3ce998]
            }, {
              'quoted': _0x1b009c
            });
            try {
              await _0x269238.groupParticipantsUpdate(_0x1deb7e, [_0x3ce998], "remove");
            } catch (_0x5849b5) {
              console.log("antiien ") + _0x5849b5;
            }
            await _0x269238.sendMessage(_0x1deb7e, {
              'delete': _0x54060a
            });
            await fs.unlink('st1.webp');
          } else {
            if (_0x3a38e8 === "delete") {
              _0x597c1c += "message deleted \n @" + _0x3ce998.split('@')[0x0] + " avoid sending link.";
              await _0x269238.sendMessage(_0x1deb7e, {
                'text': _0x597c1c,
                'mentions': [_0x3ce998]
              }, {
                'quoted': _0x1b009c
              });
              await _0x269238.sendMessage(_0x1deb7e, {
                'delete': _0x54060a
              });
              await fs.unlink("st1.webp");
            } else {
              if (_0x3a38e8 === 'warn') {
                const {
                  getWarnCountByJID: _0x278f56,
                  ajouterUtilisateurAvecWarnCount: _0x2e996d
                } = require('./bdd/warn');
                let _0xe9e7e9 = await _0x278f56(_0x3ce998);
                let _0x58ea16 = conf.WARN_COUNT;
                if (_0xe9e7e9 >= _0x58ea16) {
                  var _0x493bfd = "link detected , you will be remove because of reaching warn-limit";
                  await _0x269238.sendMessage(_0x1deb7e, {
                    'text': _0x493bfd,
                    'mentions': [_0x3ce998]
                  }, {
                    'quoted': _0x1b009c
                  });
                  await _0x269238.groupParticipantsUpdate(_0x1deb7e, [_0x3ce998], "remove");
                  await _0x269238.sendMessage(_0x1deb7e, {
                    'delete': _0x54060a
                  });
                } else {
                  var _0x630a82 = _0x58ea16 - _0xe9e7e9;
                  var _0x5c0443 = "Link detected , your warn_count was upgrade ;\n rest : " + _0x630a82 + " ";
                  await _0x2e996d(_0x3ce998);
                  await _0x269238.sendMessage(_0x1deb7e, {
                    'text': _0x5c0443,
                    'mentions': [_0x3ce998]
                  }, {
                    'quoted': _0x1b009c
                  });
                  await _0x269238.sendMessage(_0x1deb7e, {
                    'delete': _0x54060a
                  });
                }
              }
            }
          }
        }
      } catch (_0x43163c) {
        console.log("bdd err " + _0x43163c);
      }
      try {
        const _0x5304f8 = _0x1b009c.key?.['id']?.["startsWith"]('BAES') && _0x1b009c.key?.['id']?.["length"] === 0x10;
        const _0x5eb54b = _0x1b009c.key?.['id']?.["startsWith"]("BAE5") && _0x1b009c.key?.['id']?.["length"] === 0x10;
        if (_0x5304f8 || _0x5eb54b) {
          if (_0x578740 === "reactionMessage") {
            console.log("Je ne reagis pas au reactions");
            return;
          }
          ;
          const _0x2d6be6 = await atbverifierEtatJid(_0x1deb7e);
          if (!_0x2d6be6) {
            return;
          }
          ;
          if (_0x122e5e || _0x3ce998 === _0x477c5e) {
            console.log("je fais rien");
            return;
          }
          ;
          const _0x282f7d = {
            'remoteJid': _0x1deb7e,
            'fromMe': false,
            'id': _0x1b009c.key.id,
            'participant': _0x3ce998
          };
          var _0x597c1c = "bot detected, \n";
          var _0x18713a = new Sticker("https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif", {
            'pack': "Kibore md",
            'author': conf.OWNER_NAME,
            'type': StickerTypes.FULL,
            'categories': ['🤩', '🎉'],
            'id': "12345",
            'quality': 0x32,
            'background': "#000000"
          });
          await _0x18713a.toFile('st1.webp');
          var _0x3a38e8 = await atbrecupererActionJid(_0x1deb7e);
          if (_0x3a38e8 === 'remove') {
            _0x597c1c += "message deleted \n @" + _0x3ce998.split('@')[0x0] + " removed from group.";
            await _0x269238.sendMessage(_0x1deb7e, {
              'sticker': fs.readFileSync("st1.webp")
            });
            0x0;
            baileys_1.delay(0x320);
            await _0x269238.sendMessage(_0x1deb7e, {
              'text': _0x597c1c,
              'mentions': [_0x3ce998]
            }, {
              'quoted': _0x1b009c
            });
            try {
              await _0x269238.groupParticipantsUpdate(_0x1deb7e, [_0x3ce998], 'remove');
            } catch (_0x230011) {
              console.log("antibot ") + _0x230011;
            }
            await _0x269238.sendMessage(_0x1deb7e, {
              'delete': _0x282f7d
            });
            await fs.unlink('st1.webp');
          } else {
            if (_0x3a38e8 === "delete") {
              _0x597c1c += "message delete \n @" + _0x3ce998.split('@')[0x0] + " Avoid sending link.";
              await _0x269238.sendMessage(_0x1deb7e, {
                'text': _0x597c1c,
                'mentions': [_0x3ce998]
              }, {
                'quoted': _0x1b009c
              });
              await _0x269238.sendMessage(_0x1deb7e, {
                'delete': _0x282f7d
              });
              await fs.unlink("st1.webp");
            } else {
              if (_0x3a38e8 === 'warn') {
                const {
                  getWarnCountByJID: _0x32325b,
                  ajouterUtilisateurAvecWarnCount: _0x578b84
                } = require("./bdd/warn");
                let _0x4b703d = await _0x32325b(_0x3ce998);
                let _0x372e59 = conf.WARN_COUNT;
                if (_0x4b703d >= _0x372e59) {
                  var _0x493bfd = "bot detected ;you will be remove because of reaching warn-limit";
                  await _0x269238.sendMessage(_0x1deb7e, {
                    'text': _0x493bfd,
                    'mentions': [_0x3ce998]
                  }, {
                    'quoted': _0x1b009c
                  });
                  await _0x269238.groupParticipantsUpdate(_0x1deb7e, [_0x3ce998], "remove");
                  await _0x269238.sendMessage(_0x1deb7e, {
                    'delete': _0x282f7d
                  });
                } else {
                  var _0x630a82 = _0x372e59 - _0x4b703d;
                  var _0x5c0443 = "bot detected , your warn_count was upgrade ;\n rest : " + _0x630a82 + " ";
                  await _0x578b84(_0x3ce998);
                  await _0x269238.sendMessage(_0x1deb7e, {
                    'text': _0x5c0443,
                    'mentions': [_0x3ce998]
                  }, {
                    'quoted': _0x1b009c
                  });
                  await _0x269238.sendMessage(_0x1deb7e, {
                    'delete': _0x282f7d
                  });
                }
              }
            }
          }
        }
      } catch (_0x58c2cb) {
        console.log(".... " + _0x58c2cb);
      }
      if (_0x20b615) {
        const _0xfe3d9c = evt.cm.find(_0xb43339 => _0xb43339.nomCom === _0x4d257d);
        if (_0xfe3d9c) {
          try {
            if (conf.MODE.toLocaleLowerCase() != "yes" && !_0x29b3ea) {
              return;
            }
            if (!_0x29b3ea && _0x1deb7e === _0x3ce998 && conf.PM_PERMIT === "yes") {
              _0x2ec988("You don't have acces to commands here");
              return;
            }
            if (!_0x29b3ea && _0x43d599) {
              let _0x1a1081 = await isGroupBanned(_0x1deb7e);
              if (_0x1a1081) {
                return;
              }
            }
            if (!_0x122e5e && _0x43d599) {
              let _0x16c2e7 = await isGroupOnlyAdmin(_0x1deb7e);
              if (_0x16c2e7) {
                return;
              }
            }
            if (!_0x29b3ea) {
              let _0x521b22 = await isUserBanned(_0x3ce998);
              if (_0x521b22) {
                _0x2ec988("You are banned from bot commands");
                return;
              }
            }
            reagir(_0x1deb7e, _0x269238, _0x1b009c, _0xfe3d9c.reaction);
            _0xfe3d9c.fonction(_0x1deb7e, _0x269238, _0x24c6a5);
          } catch (_0x4669a3) {
            console.log("😡😡 " + _0x4669a3);
            _0x269238.sendMessage(_0x1deb7e, {
              'text': "😡😡 " + _0x4669a3
            }, {
              'quoted': _0x1b009c
            });
          }
        }
      }
    });
    const {
      recupevents: _0x463346
    } = require("./bdd/welcome");
    _0x269238.ev.on('group-participants.update', async _0x4ff030 => {
      console.log(_0x4ff030);
      let _0x4f1a9a;
      try {
        _0x4f1a9a = await _0x269238.profilePictureUrl(_0x4ff030.id, "image");
      } catch {
        _0x4f1a9a = '';
      }
      try {
        const _0x367f00 = await _0x269238.groupMetadata(_0x4ff030.id);
        if (_0x4ff030.action == "add" && (await _0x463346(_0x4ff030.id, "welcome")) == 'on') {
          let _0xc5e53f = "*𝐇𝐄𝐑𝐎𝐊𝐔 𝐁𝐓. 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐈𝐍 𝐓𝐇𝐄 𝐆𝐑𝐎𝐔𝐏 𝐌𝐄𝐒𝐒𝐀𝐆𝐄*";
          let _0x11caf9 = _0x4ff030.participants;
          for (let _0x1af75c of _0x11caf9) {
            _0xc5e53f += " \n]|I{•------»*𝐇𝐄𝐘* 🖐️ @" + _0x1af75c.split('@')[0x0] + " 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐎𝐔𝐑 𝐆𝐑𝐎𝐔𝐏. \n\n";
          }
          _0xc5e53f += "❒ *𝑅𝐸𝐴𝐷 𝑇𝐻𝐸 𝐺𝑅𝑂𝑈𝑃 𝐷𝐸𝑆𝐶𝑅𝐼𝑃𝑇𝐼𝑂𝑁 𝑇𝑂 𝐴𝑉𝑂𝐼𝐷 𝐺𝐸𝑇𝑇𝐼𝑁𝐺 𝑅𝐸𝑀𝑂𝑉𝐸𝐷 𝒚𝒐𝒖 🫩* ";
          _0x269238.sendMessage(_0x4ff030.id, {
            'image': {
              'url': _0x4f1a9a
            },
            'caption': _0xc5e53f,
            'mentions': _0x11caf9
          });
        } else {
          if (_0x4ff030.action == "remove" && (await _0x463346(_0x4ff030.id, "goodbye")) == 'on') {
            let _0x6be89 = "𝐎𝐍𝐄 𝐎𝐑 𝐒𝐎𝐌𝐄𝐒 𝐌𝐄𝐌𝐁𝐄𝐑(s) 𝐋𝐄𝐅𝐓 𝐆𝐑𝐎𝐔𝐏 🥲;\n";
            let _0x4ad4cf = _0x4ff030.participants;
            for (let _0x32be09 of _0x4ad4cf) {
              _0x6be89 += '@' + _0x32be09.split('@')[0x0] + "\n";
            }
            _0x269238.sendMessage(_0x4ff030.id, {
              'text': _0x6be89,
              'mentions': _0x4ad4cf
            });
          } else {
            if (_0x4ff030.action == "promote" && (await _0x463346(_0x4ff030.id, "antipromote")) == 'on') {
              if (_0x4ff030.author == _0x367f00.owner || _0x4ff030.author == conf.NUMERO_OWNER + "@s.whatsapp.net" || _0x4ff030.author == decodeJid(_0x269238.user.id) || _0x4ff030.author == _0x4ff030.participants[0x0]) {
                console.log("Cas de superUser je fais rien");
                return;
              }
              ;
              await _0x269238.groupParticipantsUpdate(_0x4ff030.id, [_0x4ff030.author, _0x4ff030.participants[0x0]], "demote");
              _0x269238.sendMessage(_0x4ff030.id, {
                'text': '@' + _0x4ff030.author.split('@')[0x0] + " has violated the anti-promotion rule, therefore both " + _0x4ff030.author.split('@')[0x0] + " and @" + _0x4ff030.participants[0x0].split('@')[0x0] + " have been removed from administrative rights.",
                'mentions': [_0x4ff030.author, _0x4ff030.participants[0x0]]
              });
            } else {
              if (_0x4ff030.action == "demote" && (await _0x463346(_0x4ff030.id, "antidemote")) == 'on') {
                if (_0x4ff030.author == _0x367f00.owner || _0x4ff030.author == conf.NUMERO_OWNER + "@s.whatsapp.net" || _0x4ff030.author == decodeJid(_0x269238.user.id) || _0x4ff030.author == _0x4ff030.participants[0x0]) {
                  console.log("Cas de superUser je fais rien");
                  return;
                }
                ;
                await _0x269238.groupParticipantsUpdate(_0x4ff030.id, [_0x4ff030.author], 'demote');
                await _0x269238.groupParticipantsUpdate(_0x4ff030.id, [_0x4ff030.participants[0x0]], "promote");
                _0x269238.sendMessage(_0x4ff030.id, {
                  'text': '@' + _0x4ff030.author.split('@')[0x0] + " has violated the anti-demotion rule by removing @" + _0x4ff030.participants[0x0].split('@')[0x0] + ". Consequently, he has been stripped of administrative rights.",
                  'mentions': [_0x4ff030.author, _0x4ff030.participants[0x0]]
                });
              }
            }
          }
        }
      } catch (_0x560d6c) {
        console.error(_0x560d6c);
      }
    });
    async function _0x441823() {
      const _0x2b50b9 = require("node-cron");
      const {
        getCron: _0x4a4355
      } = require('./bdd/cron');
      let _0xb7e3cc = await _0x4a4355();
      console.log(_0xb7e3cc);
      if (_0xb7e3cc.length > 0x0) {
        for (let _0x3113a0 = 0x0; _0x3113a0 < _0xb7e3cc.length; _0x3113a0++) {
          if (_0xb7e3cc[_0x3113a0].mute_at != null) {
            let _0x4ccb11 = _0xb7e3cc[_0x3113a0].mute_at.split(':');
            console.log("etablissement d'un automute pour " + _0xb7e3cc[_0x3113a0].group_id + " a " + _0x4ccb11[0x0] + " H " + _0x4ccb11[0x1]);
            _0x2b50b9.schedule(_0x4ccb11[0x1] + " " + _0x4ccb11[0x0] + " * * *", async () => {
              await _0x269238.groupSettingUpdate(_0xb7e3cc[_0x3113a0].group_id, "announcement");
              _0x269238.sendMessage(_0xb7e3cc[_0x3113a0].group_id, {
                'image': {
                  'url': "./media/chrono.webp"
                },
                'caption': "Hello, it's time to close the group; sayonara."
              });
            }, {
              'timezone': 'Africa/Tanzania'
            });
          }
          if (_0xb7e3cc[_0x3113a0].unmute_at != null) {
            let _0x3c8761 = _0xb7e3cc[_0x3113a0].unmute_at.split(':');
            console.log("etablissement d'un autounmute pour " + _0x3c8761[0x0] + " H " + _0x3c8761[0x1] + " ");
            _0x2b50b9.schedule(_0x3c8761[0x1] + " " + _0x3c8761[0x0] + " * * *", async () => {
              await _0x269238.groupSettingUpdate(_0xb7e3cc[_0x3113a0].group_id, "not_announcement");
              _0x269238.sendMessage(_0xb7e3cc[_0x3113a0].group_id, {
                'image': {
                  'url': "./media/chrono.webp"
                },
                'caption': "Good morning; It's time to open the group."
              });
            }, {
              'timezone': "Africa/Tanzania"
            });
          }
        }
      } else {
        console.log("Les crons n'ont pas été activés");
      }
      return;
    }
    _0x269238.ev.on("contacts.upsert", async _0x3ee2e3 => {
      const _0x9b0c2d = _0x10f097 => {
        for (const _0x3527d1 of _0x10f097) {
          if (store.contacts[_0x3527d1.id]) {
            Object.assign(store.contacts[_0x3527d1.id], _0x3527d1);
          } else {
            store.contacts[_0x3527d1.id] = _0x3527d1;
          }
        }
        return;
      };
      _0x9b0c2d(_0x3ee2e3);
    });
    _0x269238.ev.on("connection.update", async _0x539049 => {
      const {
        lastDisconnect: _0x5ae86,
        connection: _0x4d48ba
      } = _0x539049;
      if (_0x4d48ba === 'connecting') {
        console.log("ℹ️ HEROKU BT is connecting...");
      } else {
        if (_0x4d48ba === "open") {
          console.log("✅ HEROKU-BT Connected to WhatsApp! ☺️");
          console.log('--');
          0x0;
          await baileys_1.delay(0xc8);
          console.log('------');
          0x0;
          await baileys_1.delay(0x12c);
          console.log('------------------/-----');
          console.log("HEROKU BT is Online 🕸\n\n");
          console.log("Loading HEROKU BT Commands ...\n");
          fs.readdirSync(__dirname + "/commandes").forEach(_0x575102 => {
            if (path.extname(_0x575102).toLowerCase() == ".js") {
              try {
                require(__dirname + "/commandes/" + _0x575102);
                console.log(_0x575102 + " Installed Successfully✔️");
              } catch (_0x5a3b49) {
                console.log(_0x575102 + " could not be installed due to : " + _0x5a3b49);
              }
              0x0;
              baileys_1.delay(0x12c);
            }
          });
          0x0;
          baileys_1.delay(0x2bc);
          var _0x5a74b0;
          if (conf.MODE.toLocaleLowerCase() === "yes") {
            _0x5a74b0 = "public";
          } else if (conf.MODE.toLocaleLowerCase() === 'no') {
            _0x5a74b0 = 'private';
          } else {
            _0x5a74b0 = "undefined";
          }
          console.log("Commands Installation Completed ✅");
          await _0x441823();
          if (conf.DP.toLowerCase() === "yes") {
            let _0x144271 = "      HEROKU-BT\n╭─────────────━┈⊷ \n│🌏 HEROKU-BT CONNECTED\n│💫 ᴘʀᴇғɪx: *[ " + prefixe + " ]*\n│⭕ ᴍᴏᴅᴇ: *" + _0x5a74b0 + "*\n╰─────────────━┈⊷⁠⁠⁠⁠";
            await _0x269238.sendMessage(_0x269238.user.id, {
              'text': _0x144271
            });
          }
        } else {
          if (_0x4d48ba == "close") {
            let _0x370e37 = new boom_1.Boom(_0x5ae86?.["error"])?.["output"]['statusCode'];
            if (_0x370e37 === baileys_1.DisconnectReason.badSession) {
              console.log("Session id error, rescan again...");
            } else {
              if (_0x370e37 === baileys_1.DisconnectReason.connectionClosed) {
                console.log("!!! connexion fermée, reconnexion en cours ...");
                _0xbc60a7();
              } else {
                if (_0x370e37 === baileys_1.DisconnectReason.connectionLost) {
                  console.log("connection error 😞 ,,, trying to reconnect... ");
                  _0xbc60a7();
                } else {
                  if (_0x370e37 === baileys_1.DisconnectReason?.['connectionReplaced']) {
                    console.log("connexion réplacée ,,, une sesssion est déjà ouverte veuillez la fermer svp !!!");
                  } else {
                    if (_0x370e37 === baileys_1.DisconnectReason.loggedOut) {
                      console.log("vous êtes déconnecté,,, veuillez rescanner le code qr svp");
                    } else {
                      if (_0x370e37 === baileys_1.DisconnectReason.restartRequired) {
                        console.log("redémarrage en cours ▶️");
                        _0xbc60a7();
                      } else {
                        console.log("redemarrage sur le coup de l'erreur  ", _0x370e37);
                        const {
                          exec: _0x47019d
                        } = require("child_process");
                        _0x47019d("pm2 restart all");
                      }
                    }
                  }
                }
              }
            }
            console.log("hum " + _0x4d48ba);
            _0xbc60a7();
          }
        }
      }
    });
    _0x269238.ev.on('creds.update', _0x17507d);
    _0x269238.downloadAndSaveMediaMessage = async (_0x18defa, _0x5d714d = '', _0x3a840d = true) => {
      let _0x15411d = _0x18defa.msg ? _0x18defa.msg : _0x18defa;
      let _0x5b8bca = (_0x18defa.msg || _0x18defa).mimetype || '';
      let _0xcde611 = _0x18defa.mtype ? _0x18defa.mtype.replace(/Message/gi, '') : _0x5b8bca.split('/')[0x0];
      0x0;
      const _0x384cf7 = await baileys_1.downloadContentFromMessage(_0x15411d, _0xcde611);
      let _0x330c1e = Buffer.from([]);
      for await (const _0x26cf2d of _0x384cf7) {
        _0x330c1e = Buffer.concat([_0x330c1e, _0x26cf2d]);
      }
      let _0x51adc4 = await FileType.fromBuffer(_0x330c1e);
      let _0x5c6d75 = './' + _0x5d714d + '.' + _0x51adc4.ext;
      await fs.writeFileSync(_0x5c6d75, _0x330c1e);
      return _0x5c6d75;
    };
    _0x269238.awaitForMessage = async (_0x376b3c = {}) => {
      return new Promise((_0x2772de, _0x20effa) => {
        if (typeof _0x376b3c !== "object") {
          _0x20effa(new Error("Options must be an object"));
        }
        if (typeof _0x376b3c.sender !== "string") {
          _0x20effa(new Error("Sender must be a string"));
        }
        if (typeof _0x376b3c.chatJid !== 'string') {
          _0x20effa(new Error("ChatJid must be a string"));
        }
        if (_0x376b3c.timeout && typeof _0x376b3c.timeout !== "number") {
          _0x20effa(new Error("Timeout must be a number"));
        }
        if (_0x376b3c.filter && typeof _0x376b3c.filter !== "function") {
          _0x20effa(new Error("Filter must be a function"));
        }
        const _0x14e01d = _0x376b3c?.["timeout"] || undefined;
        const _0x216942 = _0x376b3c?.["filter"] || (() => true);
        let _0x13d70c = undefined;
        let _0x17b68c = _0x5439ae => {
          let {
            type: _0xb4f3e8,
            messages: _0x1cbab0
          } = _0x5439ae;
          if (_0xb4f3e8 == "notify") {
            for (let _0x125733 of _0x1cbab0) {
              const _0x55c9cb = _0x125733.key.fromMe;
              const _0x520a77 = _0x125733.key.remoteJid;
              const _0x4962c6 = _0x520a77.endsWith('@g.us');
              const _0x396de9 = _0x520a77 == "status@broadcast";
              const _0x2068de = _0x55c9cb ? _0x269238.user.id.replace(/:.*@/g, '@') : _0x4962c6 || _0x396de9 ? _0x125733.key.participant.replace(/:.*@/g, '@') : _0x520a77;
              if (_0x2068de == _0x376b3c.sender && _0x520a77 == _0x376b3c.chatJid && _0x216942(_0x125733)) {
                _0x269238.ev.off("messages.upsert", _0x17b68c);
                clearTimeout(_0x13d70c);
                _0x2772de(_0x125733);
              }
            }
          }
        };
        _0x269238.ev.on("messages.upsert", _0x17b68c);
        if (_0x14e01d) {
          _0x13d70c = setTimeout(() => {
            _0x269238.ev.off('messages.upsert', _0x17b68c);
            _0x20effa(new Error("Timeout"));
          }, _0x14e01d);
        }
      });
    };
    return _0x269238;
  }
  let _0x7f53cf = require.resolve(__filename);
  fs.watchFile(_0x7f53cf, () => {
    fs.unwatchFile(_0x7f53cf);
    console.log("mise à jour " + __filename);
    delete require.cache[_0x7f53cf];
    require(_0x7f53cf);
  });
  _0xbc60a7();
}, 0x1388);
