import { TSDElement } from "./TSDElement.js";
export class TSDParser {
    originalStr = "";
    remainingStr = "";
    constructor() {
    }
    parseFromString(str) {
        this.originalStr = str;
        this.remainingStr = str;
        return this.parseElementFromString();
    }
    parseElementFromString() {
        this.remainingStr = this.remainingStr.trim();
        let keyEndIndex = this.remainingStr.indexOf(":");
        if (keyEndIndex == -1)
            throw new Error(`":" expected. ${this.remainingStr}`);
        let key = this.remainingStr.substring(0, keyEndIndex).trim();
        let removed = false;
        let paramIndex = key.indexOf("[");
        let paramEndIndex = key.indexOf("]");
        if (paramIndex != -1 && paramEndIndex != -1) {
            let param = key.substring(paramIndex + 1, paramEndIndex).trim();
            switch (param) {
                case "rem":
                case "removed":
                    removed = true;
                    break;
                default:
                    throw new Error(`unknown parameter "${param}"`);
                    break;
            }
            key = key.substring(0, paramIndex).trim();
        }
        if (!(/^[a-zA-Z0-9\-]+$/.test(key))) {
            throw new Error(`unexpected character in key "${key}"`);
        }
        this.remainingStr = this.remainingStr.substring(keyEndIndex + 1).trim();
        let value = null;
        switch (true) {
            case this.remainingStr[0] == "{":
                value = [];
                this.remainingStr = this.remainingStr.substring(1).trim();
                while (this.remainingStr.trim()[0] != "}" && this.remainingStr[0] != undefined) {
                    value.push(this.parseElementFromString());
                }
                this.remainingStr = this.remainingStr.trim().substring(1).trim();
                break;
            case this.remainingStr[0] == "\"":
                let valueEndIndex = this.remainingStr.indexOf("\"", 1);
                value = this.remainingStr.substring(1, valueEndIndex).trim();
                this.remainingStr = this.remainingStr.substring(valueEndIndex + 1).trim();
                break;
            case !isNaN(Number(this.remainingStr[0])):
                value = this.remainingStr[0];
                this.remainingStr = this.remainingStr.substring(1);
                while (!isNaN(Number(this.remainingStr[0]))) {
                    value += this.remainingStr[0];
                    this.remainingStr = this.remainingStr.substring(1);
                }
                value = Number(value);
                break;
            case this.remainingStr.startsWith("null"):
                value = null;
                this.remainingStr = this.remainingStr.substring(4);
                break;
            case this.remainingStr[0] == undefined:
                throw new Error(`unexpected end of file`);
            default:
                throw new Error(`unexpected character "${this.remainingStr[0]}"`);
                break;
        }
        let lastModified = null;
        this.remainingStr = this.remainingStr.trim();
        if (this.remainingStr[0] == "|") {
            this.remainingStr = this.remainingStr.substring(1).trim();
            let timeStamp = this.remainingStr[0];
            this.remainingStr = this.remainingStr.substring(1);
            while (!isNaN(Number(this.remainingStr[0]))) {
                timeStamp += this.remainingStr[0];
                this.remainingStr = this.remainingStr.substring(1);
            }
            this.remainingStr = this.remainingStr.trim();
            lastModified = new Date(Number(timeStamp));
        }
        switch (this.remainingStr[0]) {
            case ",":
                this.remainingStr = this.remainingStr.substring(1).trim();
                break;
            case "}":
            case undefined:
                // end of collection reached / end of file reached
                break;
            default:
                throw new Error(`unexpected character after value: "${this.remainingStr[0]}" in key "${key}"`);
        }
        let newElement = new TSDElement(key, value, removed, lastModified);
        if (newElement.value != null && newElement.value.constructor == [].constructor) {
            newElement.value.forEach(element => {
                element.parent = newElement;
            });
        }
        return newElement;
    }
}
export class ParserHelper {
    static findClosingBracketIndex(str, openingIndex) {
        let i = 1;
        let lastIndex = openingIndex;
        while (i != 0) {
            let index = str.substring(lastIndex + 1).search(/[\{\}\[\]]/g);
            if (index == -1) {
                throw new Error("Missing Closing Bracket");
            }
            lastIndex = lastIndex + index + 1;
            switch (str[lastIndex]) {
                case "[":
                case "{":
                    i++;
                    break;
                case "]":
                case "}":
                    i--;
                    break;
                default:
                    break;
            }
        }
        return lastIndex;
    }
}
