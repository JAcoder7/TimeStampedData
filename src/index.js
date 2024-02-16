// @ts-check

const TValuePrimitives = ["string", "number", "boolean", "null"];

/**
 * @typedef {TMap | string | number | boolean | null} Tvalue
 */

export class TMap {
  /** @private @type { Map<string, [Tvalue, Date]>} */
  map = new Map();
  /** @type {Map<string, Date>} */
  softDeleted = new Map()

  /**
   * @param {[string, [Tvalue, Date]][]} [entries]
   */
  constructor(entries) {
    if (entries) {
      this.map = new Map(entries)
    }
  }


  /**
   * 
   * @param {string | null} key 
   * @param {TMap | string | number | boolean | null} value 
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
        // TODO: set parent etc...
        break;

      default:
        throw new TypeError()
    }

    this.map.set(String(key), [value, new Date()])

    return this
  }

  /** @param {string} key */
  get(key) {
    return this.map.get(String(key))?.at(0)
  }

  /** @param {number} index */
  getAtIndex(index) {
    return this.map.get(String([...this.map.keys()][index]))?.at(0)
  }

  keys() {
    return this.map.keys()
  }


  /** @param {string} key */
  getTimestamp(key) {
    // TODO: maybe not working
    return this.map.get(String(key))?.at(1)
  }

  /** @param {string} key */
  has(key) {
    return this.map.has(String(key))
  }

  /** @param {string} key */
  delete(key) {
    let res = this.map.delete(String(key))
    if (res) {
      this.softDeleted.set(String(key), new Date())
    }
    return res;
  }

  get size() {
    return this.map.size
  }

  toFormattedString() {
    return JSON.stringify(this.toJSON(null, true), null, "  ").replace(/((?<=\[)\n *)|(\n *(?=]))|((?<=,)\n *(?=\d))/g, "").replace(/,/g, ", ")
  }

  // @ts-expect-error
  toJSON(_, includeTimestamps = true) {
    return Object.fromEntries([...[...this.map.entries()].map(([key, value]) => {
      if (includeTimestamps) {
        return [key,
          [value[0] instanceof TMap ? value[0].toJSON(null, includeTimestamps) : value[0], value[1]?.getTime() || 0]
        ]
      } else {
        return [key, value[0] instanceof TMap ? value[0].toJSON(null, includeTimestamps) : value[0]]
      }
    }), ...(includeTimestamps?[...this.softDeleted.entries()].map(([key,value])=>[key,{removed:value.getTime()}]):[])
  ])
  }

  typeCheck() {
    // TODO
  }

  /** 
 * @param {Object<string,Tvalue|object>} obj
 * @return {TMap}
 */
  static fromJSON(obj) {
    // @ts-ignore
    return new TMap(Object.entries(obj).map(/** @param {[string, [string | number | boolean | object | null, number]]} */([key, value]) => {
     let entry =(Array.isArray(value) && value.length == 2 && [...TValuePrimitives, "object"].includes(typeof value[0]) && typeof value[1] == "number");
     let isRemoved = typeof value == "object" && typeof value.removed == "number"
      if (!) {
        throw new TypeError(`Type "${typeof (value)}" not supported (in {"${key}": ${value})}`)
      }


      if (value[0] != null && typeof value[0] == "object") {
        // @ts-ignore
        value[0] = TMap.fromJSON(value[0])
      }

      return [String(key), [value[0], new Date(value[1])]]
    }))
  }


  /** 
   * @param {Object<string,Tvalue|object>} obj
   * @return {TMap}
   * @example 
   * TMap.fromObject({
        a: 1,
        b: 2,
        c: {
            c_a: [ // arrays will be given keys with crypto.randomUUID()
              { "a": 3 },
              { "a": 3 },
            ]
        }
    })
   */
  static fromObject(obj) {
    // @ts-ignore
    return new TMap(Object.entries(obj).map(([key, value]) => {
      // @ts-ignore
      if (value && typeof value == "object" && typeof value.toJSON == "function") {
        // @ts-ignore
        value = value.toJSON()
      }
      if (value && typeof value == "object") {
        if (Array.isArray(value)) {
          value = Object.fromEntries(value.map(v => [crypto.randomUUID(), v]))
        }
        // @ts-ignore
        value = TMap.fromObject(value)
      } else if (!TValuePrimitives.includes(typeof value)) {
        throw new TypeError(`Type "${typeof (value)}" not supported (in {"${key}": ${value})}`)
      }
      return [String(key), [value, new Date(0)]]
    }))
  }
}

class Reference {
  path = "";

  /** @param  {...string} keys */
  constructor(...keys) {
    this.path = keys.map(k => String(k).replace(/\//g, "\\/")).join("/")

    if (arguments.length == 1 && typeof keys[0] == "string") {

    }
  }

  /** @param {TMap} map */
  eval(map) {

  }
}

/**
 * 
 * @param {object} value 
 * @param {Function[]} constructors 
 */
function isInstanceOf(value, constructors) {
  for (const constr of constructors) {
    if (value instanceof constr) {
      return true
    }
  }
  return false
}