import { TSDParser } from "./TSDParser.js";
export class TSDDocument {
    data = null;
    root = null;
    constructor(str) {
        this.parseFromString(str);
    }
    parseFromString(str) {
        this.data = str;
        this.root = TSDParser.parse(str);
    }
    toString(compact = false) {
        return this.root?.toString(compact);
    }
    query(path) {
        return this.root?.query(path);
    }
    /**
     * query
     */
    q(path) {
        return this.root?.query(path);
    }
}
