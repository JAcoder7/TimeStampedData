import { TSDElement } from "./TSDElement.js";
import { TSDParser } from "./TSDParser.js";


export class TSDDocument {
    private data: string | null = null;
    root: TSDElement | null = null;

    constructor(str: string) {
        this.parseFromString(str);
    }

    parseFromString(str: string) {
        this.data = str;
        try {
            //this.root = (new TSDParser()).parseFromString(str);
        } catch (error) {
            console.error("Error while parsing:", error);
        }
    }

    toString(compact = false) {
        return this.root?.toString(compact);
    }
}
