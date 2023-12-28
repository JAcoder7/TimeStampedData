export class TSDDocument {
    data = null;
    root = null;
    constructor(str) {
        this.parseFromString(str);
    }
    parseFromString(str) {
        this.data = str;
        try {
            //this.root = (new TSDParser()).parseFromString(str);
        }
        catch (error) {
            console.error("Error while parsing:", error);
        }
    }
    toString(compact = false) {
        return this.root?.toString(compact);
    }
}
