const fs = require("fs");
const scribble = require("scribbletune");
const synth = require("synth-js");

async function command({rawArg}) {
    try {
        let options = {};
        rawArg.replace(/--([^ =]+)(=([^ ]+))?/g, function(m, p1, p2, p3) {
            options[p1] = true;
            if (p3) options[p1] = p3;
        });
        let arg = rawArg.replace(/--([^ =]+)(=([^ ]+))?/g, "").replace("  ", " ").trim().split(" ");
        
        const isSaveExist = false;
        for (let i = 0, l = arg.length; i < l; i++) {
            let tmp = arg[i];
            if (tmp.startsWith("save.")) {
                tmp = tmp.substr(5);
                if (/^[\x00-\x7F]*$/.test(tmp) && !tmp.includes("/") && !tmp.includes(".")) {
                    const path = `./saves/${tmp}.json`;
                    if (fs.existsSync(path)) {
                        arg[i] = JSON.parse(fs.readFileSync(path)).arg;
                    } else {
                        return {
                            toSend: "That save key isn't exists!"
                        }
                    }
                } else {
                    return {
                        toSend: "There's wrong save key!"
                    }
                }
            }
        }

        arg = arg.flat();



        let note = "";
        let pattern = "";

        for (let i = 0, l = arg.length; i < l; i++) {
            const tmpArg = arg[i];
            if (["-", "_", "[", "]"].includes(tmpArg)) {
                pattern += tmpArg;
            } else {
                note += tmpArg + " ";
                pattern += "x";
            }
        }

        note = note.trim();

        const clip = scribble.clip({
            notes: note,
            subdiv: options.base ?? "8n",
            pattern: pattern
        });

        const filename = `Generated_${new Date().getTime()}`;

        scribble.midi(clip, `./generated/${filename}.mid`);

        let midiBuffer = fs.readFileSync(`./generated/${filename}.mid`);
        let wavBuffer = synth.midiToWav(midiBuffer).toBuffer();
        fs.writeFileSync(`./generated/${filename}.wav`, wavBuffer, {encoding: 'binary'});



        // save option
        if (typeof options.save !== "undefined" && !isSaveExist) {
            if (/^[\x00-\x7F]*$/.test(options.save) === false && !tmp.includes("/") && !tmp.includes(".")) {
                return {
                    toSend: "Save key musr be ASCII!"
                }
            } else if (options.save.length < 3) {
                return {
                    toSend: "Save key needs to longer then 3 letters!"
                }
            } else {
                const path = `./saves/${options.save}.json`;
                if (fs.existsSync(path)) {
                    return {
                        toSend: "That key already exists!"
                    }
                }

                let toSave = {
                    arg: arg
                };
                fs.writeFileSync(path, JSON.stringify(toSave));
            }
        }

        return {
            toSend: "Here it is!",
            toAttach: `./generated/${filename}.wav`
        }
    } catch(e) {
        return {
            toSend: "Something wrong..." + `\`\`\`js\n${e}\n\`\`\``
        }
    }
}

module.exports = command;