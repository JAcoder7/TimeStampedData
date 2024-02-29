// @ts-check
/**
 * @typedef {TMap | string | number | boolean | null} Tvalue
 */

/** 
 * ["string", "number", "boolean", "null"]
 */
const TValuePrimitives = ["string", "number", "boolean", "null"];

/** @enum {number} */
const ValueTypes = {
  Value: 0,
  Reference: 1,
  Removed: 2,
}

/** @enum {function} */
const MapValue = {
  /**
  * @param {Tvalue} value 
  * @param {Date} timestamp
  * @returns {[Tvalue, Date, number]}
  */
  Value: (value, timestamp = new Date()) => ([value, timestamp, ValueTypes.Value]),
  /**
  * @param {Date} timestamp 
  * @returns {[Tvalue, Date, number]}
  */
  Removed: (timestamp = new Date()) => ([null, timestamp, ValueTypes.Removed]),
  /**
  * @param {string} path 
  * @param {Date} timestamp 
  * @returns {[Tvalue, Date, number]}
  */
  Reference: (path, timestamp = new Date()) => ([path, timestamp, ValueTypes.Reference]),
}



export class TMap {

  // [key: string, [value, timestamp: Date, removed: bool?, isReference?]]

  // [key: string, [value, timestamp: Date, type: number?]]

  /* 
  enum value {
    value(string | number | boolean | null),
    removed,
    reference(string)
  }

  struct v {
    value: value,
    timestamp: Date
  }

  map {

  }
  */

  /** @private @type { Map<string, [Tvalue, Date, number]>} */
  map = new Map();

  /** @type {TMap?} */
  parent = null

  constructor() { }


  /**
   * 
   * @param {string | null} key 
   * @param {Tvalue} value 
   * @returns {TMap}
   */
  set(key, value) {
    if (key == null) {
      key == crypto.randomUUID();
    }

    switch (true) {
      case ["number", "string", "boolean"].includes(typeof value):
      case value === null:
        break;

      case (typeof value == "object" && value instanceof TMap):
        value.parent = this
        // TODO: set parent etc...
        break;

      default:
        throw new TypeError()
    }

    this.map.set(String(key), MapValue.Value(value))

    return this
  }

  /** @param {string} key */
  get(key, includeRemoved = false) {
    let entry = this.map.get(String(key))
    if (entry === undefined) return undefined;

    switch (entry[2]) {
      case ValueTypes.Value:
        return entry[0]

      case ValueTypes.Reference:
        // TODO:
        throw new Error("Not implemented");

      case ValueTypes.Removed:
        if (includeRemoved) {
          return entry[0]
        } else {
          return null
        }

      default:
        throw new Error("Unexpected ValueType: " + entry[2])
    }
  }

  /** @param {string} key */
  getType(key, includeRemoved = false) {
    let entry = this.map.get(String(key))
    return entry !== undefined && (entry[2] !== ValueTypes.Removed || includeRemoved) ? entry[2] : undefined
  }

  keys(includeRemoved = false) {
    if (includeRemoved) {
      return this.map.keys()
    } else {
      /** @type {string[]} */
      let keys = []
      this.map.forEach((val, key, map) => {
        if (val[2] !== ValueTypes.Removed) {
          keys.push(key)
        }
      })
      return keys
    }
  }

  /** @param {string} key */
  getTimestamp(key, includeRemoved = false) {
    let entry = this.map.get(String(key))
    return entry !== undefined && (entry[2] !== ValueTypes.Removed || includeRemoved) ? entry[1] : undefined
  }
  /** @param {string} key */
  getEntry(key, includeRemoved = false) {
    let entry = this.map.get(String(key))
    return entry !== undefined && (entry[2] !== ValueTypes.Removed || includeRemoved) ? entry : undefined
  }

  /** @param {string} key */
  has(key, includeRemoved = false) {
    if (includeRemoved) {
      return this.map.has(String(key))
    } else {
      let entry = this.map.get(String(key))
      return entry === undefined ? false : entry[2] !== ValueTypes.Removed
    }
  }

  /** @param {string} key */
  remove(key, dontDeleteValue = false) {
    let entry = this.map.get(String(key))
    if (entry) {
      entry.splice(2, 1, ValueTypes.Removed)
      if (!dontDeleteValue) {
        entry[0] = null;
      }
    }
    return entry != undefined
  }

  getSize(includeRemoved = false) {
    if (includeRemoved) {
      return this.map.size
    } else {
      return [...this.map.entries()].filter(v => v[1][2] !== ValueTypes.Removed).length
    }
  }

  /** @param {string} path  */
  q(path) {
    return this.query(path)
  }

  /** 
   * @param {string} path 
   * @returns {Tvalue | null}
   */
  query(path) {
    if (path == "") {
      return this
    }
    let segments = path.split(/(?<!\\)\//g)

    switch (segments[0]) {
      case "":
        return this.root.query(segments.slice(1).join("/"))
      case "..":
        return this.parent?.query(segments.slice(1).join("/")) || null
      default:
        let result = this.getEntry(segments[0])
        if (result == undefined) return null

        if (result && typeof result[0] == "object" && result[0] instanceof TMap) {
          return result[0].query(segments.slice(1).join("/"))
        }
        if (result[2] == ValueTypes.Reference) {
          // TODO:
          throw Error()
        }
        if (segments.length > 1) {
          return null
        }
        return result[0]
    }
  }

  /**
   * @returns {TMap}
   */
  get root() {
    return this.parent || this
  }

  toFormattedString() {
    // FIXME:
    return JSON.stringify(this.toJSON(), null, "  ").replace(/((?<=\[)\n *)|(\n *(?=]))|((?<=,)\n *(?=\d))/g, "").replace(/,/g, ", ")
  }

  /** @returns {Object<string, Tvalue|object>} */
  toJSON() {
    return Object.fromEntries([...this.map.entries()].map(([key, value]) => {
      return [key,
        [
          value[0] && value[0] instanceof TMap ? value[0].toJSON() : value[0],
          value[1].getTime(),
          value[2]
        ]
      ]
    }))
  }

  typeCheck() {
    // TODO
  }

  /** 
  * @param {object} obj
  * @return {TMap}
  */
  static fromJSON(obj) {
    let tMap = new TMap()
    // @ts-expect-error
    tMap.map = new Map(Object.entries(obj).map(/** @param {[string, [string | number | boolean | object | null, number, true?]]} */([key, value]) => {
      if (!(Array.isArray(value) && value.length == 3 && [...TValuePrimitives, "object"].includes(typeof value[0]) && typeof value[1] == "number" && typeof value[2] === "number")) {
        throw new TypeError(`Invalid value in key "${key}. expected: [value, timestamp, valueType]   Found: ${value}`)
      }

      if (value[0] != null && typeof value[0] == "object") {
        value[0] = TMap.fromJSON(value[0])
        // @ts-expect-error
        value[0].parent = tMap
      }
      return [String(key), [value[0], new Date(value[1]), value[2]]]
    }))

    return tMap
  }


  /** 
   * @param {Object<string,Tvalue|object>} obj
   * @param {() => string} randomKeyFunction
   * @return {TMap}
   * @example 
   * TMap.fromObject({
        a: 1,
        b: 2,
        c: {
            c_a: [ // arrays will be given keys with randomKeyFunction()
              { "a": 3 },
              { "a": 3 },
            ]
        }
    })
   */
  static fromObject(obj, randomKeyFunction = () => crypto.randomUUID()) {
    let tMap = new TMap()
    // @ts-expect-error
    tMap.map = new Map(Object.entries(obj).map(([key, value]) => {
      // @ts-ignore
      if (value && typeof value == "object" && typeof value.toJSON == "function") {
        // @ts-ignore
        value = value.toJSON()
      }
      if (value && typeof value == "object") {
        if (Array.isArray(value)) {
          let randomKey = randomKeyFunction();
          value = Object.fromEntries(value.map(v => [randomKey, v]))
        }
        // @ts-ignore
        value = TMap.fromObject(value)
        // @ts-expect-error
        value.parent = tMap
      } else if (!TValuePrimitives.includes(typeof value)) {
        throw new TypeError(`Type "${typeof (value)}" not supported (in {"${key}": ${value})}`)
      }
      return [String(key), [value, new Date(0), ValueTypes.Value]]
    }))
    return tMap
  }
}

class Path {
  path = "";
  /** @type {TMap} */
  map;

  /** 
   * @param  {...string} keys 
   * @param {TMap} map 
  */
  constructor(map, ...keys) {
    if (arguments.length >= 2 && map instanceof TMap && typeof keys[0] == "string") {
      this.map = map
      this.path = keys.map(k => String(k).replace(/\//g, "\\/")).join("/")
    } else {
      throw new TypeError("Invalid arguments")
    }
  }

  /** @param {TMap} map */
  eval(map) {

  }
}