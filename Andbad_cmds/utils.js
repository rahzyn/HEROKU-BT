function delay(ms) {
  console.log(`⏱️ delay for ${ms}ms`)
  return new Promise(resolve => setTimeout(resolve, ms))
}


async function loading (dest, zk) {
var lod = [
⏳ kypher_xmd loading...
🌑 [□□□□□□□□□□] 0%
🌒 [████□□□□□□] 20%
🌓 [██████□□□] 40%
🌔 [████████□□] 60%
🌕 [██████████] 80%
🌕 [███████████] 100%
✅ Loading Complete!
]
let { key } = await zk.sendMessage(dest, {text: 'Loading Please Wait'})

for (let i = 0; i < lod.length; i++) {
await zk.sendMessage(dest, {text: lod[i], edit: key });
}
}

function react(dest, zk, msg, reaction){
  zk.sendMessage(dest, {react: {text : reaction, key: msg.key}});
}

module.exports = {
  delay,
  loading,
  react
}
