function command({msg, arg, raw, rawArg}) {
    let msgToSend = "";

    rawArg = rawArg.replace(/(```[^\n]*\n)((.*|\n){0,})(\n```)/, "$2");

    if (msg.author.id === "357504806358614035") {
        try {
            let evalOutput = eval(rawArg);
            if (typeof evalOutput === "object" && evalOutput !== null) {
                evalOutput = JSON.stringify(evalOutput);
            }
            
            msgToSend += `\`\`\`js\n${evalOutput}\n\`\`\``;
        } catch (e) {
            msgToSend += `\`\`\`js\n${e}\n\`\`\``
        }
    } else {
        msgToSend = "This is Dev command!";
    }

    return {
        toSend: msgToSend
    };
}

module.exports = command;