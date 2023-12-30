/**
 * Type of a TSD-Element
 * [collection, string, number, null, reference]
 */
export var TSDType;
(function (TSDType) {
    TSDType[TSDType["collection"] = 0] = "collection";
    TSDType[TSDType["string"] = 1] = "string";
    TSDType[TSDType["number"] = 2] = "number";
    TSDType[TSDType["null"] = 3] = "null";
    TSDType[TSDType["reference"] = 4] = "reference";
})(TSDType || (TSDType = {}));
export class TSDElement {
    key;
    _value = null;
    _reference = null;
    removed;
    parent;
    lastModified;
    constructor(key, value, removed = false, lastModified = null, parent = null) {
        this.key = key;
        this.value = value;
        this.lastModified = lastModified;
        this.removed = removed;
        this.parent = parent;
    }
    set value(v) {
        if (v?.constructor == this.constructor) {
            if (v.root != this.root) {
                throw new Error("Reference element does not share the same root");
            }
            this.setReference(this.getRelativePath(v));
            return;
        }
        if (v?.constructor == ([]).constructor) {
            this._value = [];
            v.forEach(element => {
                if (this._value.filter(e => e.key == element.key).length == 0) {
                    element.parent = this;
                    this._value.push(element);
                }
            });
            return;
        }
        this._value = v;
        this.lastModified = new Date();
    }
    get value() {
        if (this._reference) {
            let ref = this.query(this._reference)?.value;
            if (!ref)
                console.error("Invalid reference:", this._reference);
            return ref || null;
        }
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
    setReference(path) {
        this._value = null;
        this._reference = path;
        this.lastModified = new Date();
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
        if (this._reference) {
            return TSDType.reference;
        }
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
    query(path) {
        if (!/^(?<val>(\.){0,2}(\/(\w+|\.\.))+)$/.test(path)) {
            throw new SyntaxError("Invalid path:" + path);
        }
        let segments = path.split("/");
        if (segments[1] == "") {
            return this;
        }
        let searchOrigin;
        if (segments[0] == "") {
            searchOrigin = this.root;
        }
        else if (segments[0] == "..") {
            if (!this.parent)
                return null;
            searchOrigin = this.parent;
        }
        else {
            searchOrigin = this;
        }
        let result;
        if (segments[1] == "..") {
            result = searchOrigin.parent;
        }
        else {
            if (searchOrigin.getType() != TSDType.collection) {
                return null;
            }
            result = searchOrigin.find(v => v.key == segments[1]) || null;
        }
        if (segments.length > 2) {
            return result?.query("./" + segments.slice(2).join("/")) || null;
        }
        else {
            return result;
        }
    }
    /**
     * get the relative path from this element to an other element
     */
    getRelativePath(other) {
        let path = other.getPath();
        let ownPath = this.getPath();
        let i = 0;
        while (i < path.length && i < ownPath.length && path[i] === ownPath[i]) {
            i++;
        }
        return ownPath.substring(i).split("/").map(_ => "..").join("/") + "/" + path.substring(i);
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
        if (this._reference) {
            valueStr = this._reference;
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
