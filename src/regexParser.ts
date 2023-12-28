import { TSDElement } from "./TSDElement.js";

const TOKENS = {
    "KEY": /^(?<val>\w+)\s*(?<removed>\[rem\]|\[removed\])?\s*:/,
    "BRACKET_OPEN": /^{/,
    "BRACKET_CLOSE": /^}/,
    "COMMA": /^,/,
    "STRING": /^"(?<val>[^"]*)"/,
    "NUMBER": /^(?<val>\d+(\.\d*)?)/,
    "NULL": /^null/,
    "TIMESTAMP": /^\|\s*(?<val>\d+)/,
}

export function parse(str: string) {
    let tokens: Array<{ type, groups }> = [];
    while (str.length != 0) {
        let { remainder, token } = parseToken(str);
        str = remainder;
        tokens.push(token);
    }

    console.log(parseElement(tokens).toString());
    console.log(tokens);


}

function parseElement(tokens: Array<{ type, groups }>): TSDElement {
    let key = tokens.splice(0, 1)[0];
    if (key.type != "KEY") throw new SyntaxError("Unexpected Token: " + key.type + ".  Expected: KEY");

    let value: any = null;
    let valToken = tokens.splice(0, 1)[0];
    switch (valToken.type) {
        case "BRACKET_OPEN":
            let elements: Array<TSDElement> = [];
            while (tokens[0].type != "BRACKET_CLOSE") {
                console.log(JSON.parse(JSON.stringify(tokens)));
                
                elements.push(parseElement(tokens));
                if (tokens[0].type == "COMMA") {
                    tokens.splice(0, 1)
                }
            }
            value = elements;
            
            if (tokens.splice(0, 1)[0].type != "BRACKET_CLOSE") {
                throw new SyntaxError("Unexpected Token: " + key.type + ".  Expected: BRACKET_CLOSE")
                
            }
            break;
        case "STRING":
            value = valToken.groups.val;
            break;
        case "NUMBER":
            value = Number(valToken.groups.val);
            break;
        case "NULL":
            value = null;
            break;
        default:
            throw new SyntaxError("Unexpected Token: " + tokens.slice(0, 1)[0].type);
    }

    let lastModified: Date | null = null;
    if (tokens[0]?.type == "TIMESTAMP") {
        lastModified = new Date(Number(tokens.splice(0, 1)[0].groups.val))
    }

    return new TSDElement(key.groups.val, value, key.groups.removed != undefined, lastModified)
}


function parseToken(text: string): { remainder, token: { type, groups } } {
    text = text.trim();
    let token: { type, groups } | null = null;

    for (const key of Object.keys(TOKENS)) {
        const result = TOKENS[key].exec(text);
        if (result) {
            token = { type: key, groups: result.groups };
            text = text.replace(TOKENS[key], "");
            break;
        }
    }
    if (!token) {
        throw new Error("Parse Error: Unknown token (" + text + ")");

    }
    return { remainder: text, token: token }
}

