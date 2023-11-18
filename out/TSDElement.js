export var TSDType;
(function (TSDType) {
    TSDType[TSDType["collection"] = 0] = "collection";
    TSDType[TSDType["string"] = 1] = "string";
    TSDType[TSDType["number"] = 2] = "number";
    TSDType[TSDType["null"] = 3] = "null";
})(TSDType || (TSDType = {}));
export class TSDElement {
    key;
    _value = null;
    removed;
    parent;
    lastModified;
    constructor(key, value, removed = false, lastModified = null, parent = null) {
        this.key = key;
        this._value = value;
        this.lastModified = lastModified;
        this.removed = removed;
        this.parent = parent;
    }
    set value(v) {
        if (v?.constructor == new TSDElement("", "").constructor) {
            // TODO: add reference
            throw new Error("References not yet supported");
        }
        if (v?.constructor == ([]).constructor) {
            // TODO: check for dublicates
            v.forEach(element => {
                element.parent = this;
            });
        }
        this._value = v;
        this.lastModified = new Date();
    }
    get value() {
        return this._value;
    }
    addElement(element) {
        if (this.getType() == TSDType.collection) {
            if (!Object.keys(this._value).includes(element.key)) {
                element.parent = this;
                this._value.push(element);
            }
            else {
                throw new Error(`An element with the key '${element.key}' already exists in the collection`);
            }
        }
        else {
            throw new Error("Elements can only be added to collections");
        }
    }
    find(predicate) {
        if (this.getType() == TSDType.collection) {
            return Object.values(this.value).find(predicate);
        }
        else {
            throw new Error("Cant call find on a collection");
        }
    }
    getType() {
        switch (this._value?.constructor) {
            case "".constructor:
                return TSDType.string;
            case (0).constructor:
                return TSDType.number;
            case [].constructor:
                return TSDType.collection;
            case undefined:
                if (this._value == null) {
                    return TSDType.null;
                }
            default:
                throw new Error(`type not supported: ${this._value}`);
        }
    }
    getTypeTree() {
        if (this.getType() == TSDType.collection) {
            let typeArr = [];
            this.value.forEach(element => {
                if (!typeArr.includes(element.getTypeTree())) {
                    typeArr.push(element.getTypeTree());
                }
            });
            return typeArr;
        }
        else {
            return TSDType[this.getType()];
        }
    }
    get root() {
        return this.findRoot();
    }
    findRoot() {
        let currentElem = this;
        while (currentElem.parent != null) {
            currentElem = currentElem.parent;
        }
        return currentElem;
    }
    getPath() {
        let currentPath = "/" + this.key;
        let currentElem = this;
        while (currentElem.parent != null) {
            currentElem = currentElem.parent;
            currentPath = "/" + currentElem.key + currentPath;
        }
        return currentPath;
    }
    remove() {
        this.removed = true;
    }
    toString(compact = false) {
        let keyStr = this.key;
        let valueStr = "null";
        switch (this._value?.constructor) {
            case "".constructor:
                valueStr = `"${this._value}"`;
                break;
            case [].constructor:
                if (compact) {
                    valueStr = `{${this._value.map(v => v.toString(compact)).join(",")}}`;
                }
                else {
                    valueStr = `{\n${this._value.map(v => "    " + v.toString(compact).split("\n").join("\n    ")).join(", \n")}\n}`;
                }
                break;
            case (0).constructor:
                valueStr = `${this._value}`;
                break;
            case undefined:
                if (this._value == null) {
                    valueStr = "null";
                    break;
                }
            default:
                throw new Error(`type not supported: ${this._value}`);
                break;
        }
        let param = this.removed ? "[rem]" : "";
        if (compact) {
            let lastModifiedStr = this.lastModified == null ? "" : `|${this.lastModified.getTime()}`;
            return `${keyStr}${param}:${valueStr}${lastModifiedStr}`;
        }
        else {
            let lastModifiedStr = this.lastModified == null ? "" : `| ${this.lastModified.getTime()}`;
            return `${keyStr}${param}: ${valueStr} ${lastModifiedStr}`;
        }
    }
}
