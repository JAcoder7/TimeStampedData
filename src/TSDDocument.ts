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
        this.root = TSDParser.parse(str);
    }

    toString(compact = false) {
        return this.root?.toString(compact);
    }
}
