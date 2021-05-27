const Discord = require("discord.js");
const bot = new Discord.Client();

const command = require("./commandManager");

const prefix = "$";

let sessionData = {};

bot.on("message", async (msg) => {
    // message work condition
    if (
      msg.author.bot ||  // return if author of message is bot
      !msg.content.startsWith(prefix) // return if start of message isn't prefix
    ) return;
  
    const userId = msg.author.id;
    
    // parse message
    let msgParsed = {};
    msgParsed.raw = msg.content.substr(prefix.length);
    msgParsed.command = msgParsed.raw.toLowerCase().split(" ")[0];
    msgParsed.args = msgParsed.raw.toLowerCase().split(" ").slice(1);
    msgParsed.nonDownArgs = msgParsed.raw.split(" ");
    msgParsed.rawArg = msgParsed.raw.split(" ").slice(1).join(" ");
  
    const commamd = command[msgParsed.command];
    if (typeof commamd === "undefined") return; // return if user entered undefined command
  
    // check player
    if (typeof sessionData[userId] === "undefined") sessionData[userId] = {};
    if (sessionData[userId].waiting) return;
    sessionData[userId].waiting = true;
    //let player = playerCheck(userId);
      
    // exeute command
    const cmdOut = await commamd({
        msg: msg,
  
        parsed: msgParsed,
        arg: msgParsed.args,
        nonDownArg: msgParsed.nonDownArgs,
        raw: msgParsed.rawMsg,
        rawArg: msgParsed.rawArg
    }) ?? {};
  
    // send message
    let messageSent;
    if (typeof cmdOut.toSend !== "undefined") {
      if (Array.isArray(cmdOut.toSend)) {
        messageSent = [];
        for (let i = 0, l = cmdOut.toSend.length; i < l; i++) {
          await msg.channel.send(cmdOut.toSend[i])
          .then((msgSent) => messageSent.push(msgSent)).catch(err => console.log(err));
        }
      } else {
        let files = {files:[{}]};
        if (cmdOut.toAttach) files.files[0].attachment = cmdOut.toAttach;

        await msg.channel.send(cmdOut.toSend, cmdOut.toAttach ? files : undefined)
        .then((msgSent) => messageSent = msgSent).catch(err => console.log(err));
      }
    }
  
    // editMessage
    const editTimeout = cmdOut.editTime ?? 750;
    await new Promise(_ => {setTimeout(_, editTimeout)});
    if (typeof cmdOut.toEdit !== "undefined") {
      if (Array.isArray(cmdOut.toEdit)) {
        for (let i = 0, l = cmdOut.toEdit.length; i < l; i++) {
          if (typeof messageSent[i] === "undefined") continue;
          await messageSent[i].edit(cmdOut.toEdit[i]);
        }
      } else {
        if (typeof messageSent !== "undefined") {
          await messageSent.edit(cmdOut.toEdit);
        }
      }
    }
  
  
    // save player's data
    //await fs.writeFileSync(`./UserData/${userId}.json`, JSON.stringify(player));
  
    sessionData[userId].waiting = false;
});



bot.on("ready", () => (console.log("login!")));

bot.login(require("./token.json").token);