const {
  zokou
} = require('../framework/zokou');
const s = require('../set');
const fs = require('fs');
function getDescriptionFromEnv(_0x35905a) {
  filePath = './app.json';
  const _0x4e0886 = fs.readFileSync(filePath, "utf-8");
  const _0x2655a8 = JSON.parse(_0x4e0886);
  const _0x34117a = _0x2655a8.env[_0x35905a];
  return _0x34117a && _0x34117a.description ? _0x34117a.description : "The environment variable description was not found.";
}
zokou({
  'nomCom': 'setvar',
  'categorie': "heroku"
}, async (_0x89c838, _0x1b7dd1, _0x458a27) => {
  const {
    ms: _0x49725f,
    repondre: _0x101d12,
    superUser: _0x2649cb,
    arg: _0x17cff4
  } = _0x458a27;
  if (!_0x2649cb) {
    _0x101d12("only Mods can use this commande");
    return;
  }
  ;
  if (s.HEROKU_APP_NAME == null || s.HEROKU_APY_KEY == null) {
    _0x101d12("Please fill in the HEROKU_APP_NAME and HEROKU_APY_KEY environment variables");
    return;
  }
  ;
  if (!_0x17cff4[0x0] || !_0x17cff4.join('').split('=')) {
    _0x101d12("Bad format ; Exemple of using :\nsetvar OWNER_NAME=Fredora");
    return;
  }
  ;
  const _0x381a2c = _0x17cff4.join(" ");
  const _0x1e948b = require('heroku-client');
  const _0x46f1d8 = new _0x1e948b({
    'token': s.HEROKU_APY_KEY
  });
  let _0x2e89e0 = '/apps/' + s.HEROKU_APP_NAME;
  await _0x46f1d8.patch(_0x2e89e0 + "/config-vars", {
    'body': {
      [_0x381a2c.split('=')[0x0]]: _0x381a2c.split('=')[0x1]
    }
  });
  await _0x101d12("Heroku var changes , rebootings....");
});
zokou({
  'nomCom': "getallvar",
  'categorie': "heroku"
}, async (_0x516e99, _0x415586, _0x526c58) => {
  const {
    ms: _0x584daf,
    repondre: _0x5af953,
    superUser: _0x453088,
    arg: _0xe84daa
  } = _0x526c58;
  if (!_0x453088) {
    _0x5af953("only mods can use this commande");
    return;
  }
  ;
  if (s.HEROKU_APP_NAME == null || s.HEROKU_APY_KEY == null) {
    _0x5af953("Please fill in the HEROKU_APP_NAME and HEROKU_APY_KEY environment variables");
    return;
  }
  ;
  const _0x58f4ef = require("heroku-client");
  const _0x4f3535 = new _0x58f4ef({
    'token': s.HEROKU_APY_KEY
  });
  let _0x1480c2 = "/apps/" + s.HEROKU_APP_NAME;
  let _0x5f2c6e = await _0x4f3535.get(_0x1480c2 + "/config-vars");
  let _0x13222b = "*Heroku Vars list *\n\n";
  for (vr in _0x5f2c6e) {
    _0x13222b += "🍁 *" + vr + "* " + "= " + _0x5f2c6e[vr] + "\n";
  }
  _0x5af953(_0x13222b);
});
zokou({
  'nomCom': "getvar",
  'categorie': 'heroku'
}, async (_0x58a6f4, _0x59e6ce, _0x10aa59) => {
  const {
    ms: _0x4cfe9c,
    repondre: _0x191ee9,
    superUser: _0x4017ae,
    arg: _0x23c562
  } = _0x10aa59;
  if (!_0x4017ae) {
    _0x191ee9("Only Mods can use this command");
    return;
  }
  ;
  if (s.HEROKU_APP_NAME == null || s.HEROKU_APY_KEY == null) {
    _0x191ee9("Please fill in the HEROKU_APP_NAME and HEROKU_APY_KEY environment variables");
    return;
  }
  ;
  if (!_0x23c562[0x0]) {
    _0x191ee9("insert the variable name in capital letter");
    return;
  }
  ;
  try {
    const _0x22646 = require("heroku-client");
    const _0x2f7e09 = new _0x22646({
      'token': s.HEROKU_APY_KEY
    });
    let _0x19deba = "/apps/" + s.HEROKU_APP_NAME;
    let _0x269d8a = await _0x2f7e09.get(_0x19deba + "/config-vars");
    for (vr in _0x269d8a) {
      if (_0x23c562.join(" ") === vr) {
        return _0x191ee9(vr + "= " + _0x269d8a[vr]);
      }
    }
  } catch (_0x18606e) {
    _0x191ee9("Error" + _0x18606e);
  }
});
zokou({
  'nomCom': "settings",
  'categorie': 'Heroku'
}, async (_0x53607c, _0x267b79, _0x15523d) => {
  const {
    ms: _0xb66a55,
    repondre: _0x17b1b2,
    superUser: _0x3a5b5c,
    auteurMessage: _0x4c70ac
  } = _0x15523d;
  if (!_0x3a5b5c) {
    _0x17b1b2("command reserved for bot owner");
    return;
  }
  ;
  let _0x39c108 = [{
    'nom': "AUTO_READ_STATUS",
    'choix': ["yes", 'no']
  }, {
    'nom': "AUTO_DOWNLOAD_STATUS",
    'choix': ["yes", 'no']
  }, {
    'nom': "PM_PERMIT",
    'choix': ["yes", 'no']
  }, {
    'nom': "PUBLIC_MODE",
    'choix': ["yes", 'no']
  }, {
    'nom': 'STARTING_BOT_MESSAGE',
    'choix': ["yes", 'no']
  }, {
    'nom': "ANTI_DELETE_MESSAGE",
    'choix': ["yes", 'no']
  }, {
    'nom': "PRESENCE",
    'choix': ['1', '2', '3', '4']
  }, {
    'nom': "PM_CHATBOT",
    'choix': ["yes", 'no']
  }];
  let _0x3723be = "    ╭──────༺♡༻──────╮\n             X20 HEROKU-BT settings\n    ╰──────༺♡༻──────╯\n\n";
  for (v = 0x0; v < _0x39c108.length; v++) {
    _0x3723be += v + 0x1 + "- *" + _0x39c108[v].nom + "*\n";
  }
  _0x3723be += "\nChoose a variable by its number";
  let _0x21ca50 = await _0x267b79.sendMessage(_0x53607c, {
    'text': _0x3723be
  }, {
    'quoted': _0xb66a55
  });
  console.log(_0x21ca50);
  let _0x4cd198 = await _0x267b79.awaitForMessage({
    'chatJid': _0x53607c,
    'sender': _0x4c70ac,
    'timeout': 0xea60,
    'filter': _0x5b57c9 => _0x5b57c9.message.extendedTextMessage && _0x5b57c9.message.extendedTextMessage.contextInfo.stanzaId == _0x21ca50.key.id && _0x5b57c9.message.extendedTextMessage.text > 0x0 && _0x5b57c9.message.extendedTextMessage.text <= _0x39c108.length
  });
  let _0x590e99 = _0x4cd198.message.extendedTextMessage.text - 0x1;
  let {
    nom: _0x44695b,
    choix: _0x39fdd4
  } = _0x39c108[_0x590e99];
  let _0x191a85 = "    ╭──────༺♡༻──────╮\n             X20 HEROKU-BT settings\n    ╰──────༺♡༻──────╯\n\n";
  _0x191a85 += "*Name* :" + _0x44695b + "\n";
  _0x191a85 += "*Description* :" + getDescriptionFromEnv(_0x44695b) + "\n\n";
  _0x191a85 += "┌────── ⋆⋅☆⋅⋆ ──────┐\n\n";
  for (i = 0x0; i < _0x39fdd4.length; i++) {
    _0x191a85 += "* *" + (i + 0x1) + "* => " + _0x39fdd4[i] + "\n";
  }
  _0x191a85 += "\n└────── ⋆⋅☆⋅⋆ ──────┘\n\nPlease reply on message with the number corresponding to your choice";
  let _0x13d36c = await _0x267b79.sendMessage(_0x53607c, {
    'text': _0x191a85
  }, {
    'quoted': _0x4cd198
  });
  let _0x5b72e7 = await _0x267b79.awaitForMessage({
    'chatJid': _0x53607c,
    'sender': _0x4c70ac,
    'timeout': 0xea60,
    'filter': _0x36adeb => _0x36adeb.message.extendedTextMessage && _0x36adeb.message.extendedTextMessage.contextInfo.stanzaId == _0x13d36c.key.id && _0x36adeb.message.extendedTextMessage.text > 0x0 && _0x36adeb.message.extendedTextMessage.text <= _0x39fdd4.length
  });
  let _0x486a86 = _0x5b72e7.message.extendedTextMessage.text - 0x1;
  const _0x706777 = require("heroku-client");
  const _0x578567 = new _0x706777({
    'token': s.HEROKU_APY_KEY
  });
  let _0x113aa4 = "/apps/" + s.HEROKU_APP_NAME;
  await _0x578567.patch(_0x113aa4 + "/config-vars", {
    'body': {
      [_0x44695b]: _0x39fdd4[_0x486a86]
    }
  });
  await _0x17b1b2("variable refresh, restart in progress....");
});
function changevars(_0x272aba, _0x555599) {
  zokou({
    'nomCom': _0x272aba,
    'categorie': "Heroku"
  }, async (_0x28d912, _0x43b135, _0x3034ea) => {
    const {
      arg: _0x3541b7,
      superUser: _0x5c436b,
      repondre: _0x31e1ae
    } = _0x3034ea;
    if (!_0x5c436b) {
      _0x31e1ae("command reserved for bot owner");
      return;
    }
    ;
    if (s.HEROKU_APP_NAME == null || s.HEROKU_APY_KEY == null) {
      _0x31e1ae("Please fill in the HEROKU_APP_NAME and HEROKU_APY_KEY environment variables");
      return;
    }
    ;
    if (!_0x3541b7[0x0]) {
      _0x31e1ae(getDescriptionFromEnv(_0x555599));
      return;
    }
    ;
    const _0x4cb902 = require("heroku-client");
    const _0x5ad476 = new _0x4cb902({
      'token': s.HEROKU_APY_KEY
    });
    let _0x1680e2 = "/apps/" + s.HEROKU_APP_NAME;
    await _0x5ad476.patch(_0x1680e2 + "/config-vars", {
      'body': {
        [_0x555599]: _0x3541b7.join(" ")
      }
    });
    await _0x31e1ae("variable refresh, restart in progress....");
  });
}
;
changevars("setprefix", "PREFIX");
changevars('linkmenu', "BOT_MENU_LINKS");
changevars("warncount", "WARN_COUNT");
changevars('botname', "BOT_NAME");
