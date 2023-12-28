
export enum TSDType {
    collection,
    string,
    number,
    null
}

export class TSDElement {
    
    public key: string;
    private _value: TSDElement[] | string | number | null = null;
    public removed: boolean;
    
    public parent: TSDElement | null;
    public lastModified: Date | null;

    constructor(key: string, value: TSDElement[] | string | number | null, removed = false, lastModified: Date | null = null, parent: TSDElement | null = null) {
        this.key = key;
        this._value = value;

        this.lastModified = lastModified;
        this.removed = removed;
        this.parent = parent;
    }


    public set value(v: TSDElement | TSDElement[] | string | number | null) {
        if (v?.constructor == new TSDElement("","").constructor) {
            // TODO: add reference
            throw new Error("References not yet supported");
        }
        if (v?.constructor == ([]).constructor) {
            // TODO: check for dublicates
            (v as TSDElement[]).forEach(element => {
                element.parent = this;
            });
        }
        this._value = v as any;
        this.lastModified = new Date();
    }

    public get value(): TSDElement[] | string | number | null {
        return this._value;
    }

    public addElement(element: TSDElement) {
        if (this.getType() == TSDType.collection) {
            if (!Object.keys(this._value as TSDElement[]).includes(element.key)) {
                element.parent = this;
                (this._value as TSDElement[]).push(element);
            } else {
                throw new Error(`An element with the key '${element.key}' already exists in the collection`);
            }
        } else {
            throw new Error("Elements can only be added to collections");
        }
    }

    public find(predicate: (value: TSDElement, index: number, obj: TSDElement[]) => boolean): TSDElement | undefined {
        if (this.getType() == TSDType.collection) {
            return Object.values(this.value as TSDElement[]).find(predicate);
        } else {
            throw new Error("Cant call find on a collection");
        }
    }

    public getType(): TSDType {
        switch (this._value?.constructor) {
            case "".constructor:
                return TSDType.string;
            case (0).constructor:
                return TSDType.number
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

    public getTypeTree() {
        if (this.getType() == TSDType.collection) {
            let typeArr: any[] = [];
            (this.value as TSDElement[]).forEach(element => {
                if (!typeArr.includes(element.getTypeTree())) {
                    typeArr.push(element.getTypeTree())
                }
            });
            return typeArr;
        } else {
            return TSDType[this.getType()];
        }
    }

    public get root(): TSDElement {
        return this.findRoot()
    }

    public findRoot(): TSDElement {
        let currentElem: TSDElement | null = this;
        while (currentElem.parent != null) {
            currentElem = currentElem.parent;
        }
        return currentElem;
    }

    public getPath(): string {
        let currentPath = "/" + this.key;
        let currentElem: TSDElement | null = this;
        while (currentElem.parent != null) {
            currentElem = currentElem.parent;
            currentPath = "/" + currentElem.key + currentPath;
        }
        return currentPath;
    }

    remove() {
        this.removed = true;
    }

    toString(compact: boolean = false) {
        let keyStr = this.key;
        let valueStr = "null";
        switch (this._value?.constructor) {
            case "".constructor:
                valueStr = `"${this._value as string}"`;
                break;
            case [].constructor:
                if (compact) {
                    valueStr = `{${(this._value as TSDElement[]).map(v => (v as any).toString(compact)).join(",")}}`;
                } else {
                    valueStr = `{\n${(this._value as TSDElement[]).map(v => "    " + (v as any).toString(compact).split("\n").join("\n    ")).join(", \n")}\n}`;
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
        } else {
            let lastModifiedStr = this.lastModified == null ? "" : `| ${this.lastModified.getTime()}`;
            return `${keyStr}${param}: ${valueStr} ${lastModifiedStr}`;
        }
    }
}