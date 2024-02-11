// @ts-check

export class TMap {
    /** @private @type { Map<string, [TMap | string | number | boolean | null, Date | null]>} */
    map = new Map();
    /** @type {Map<string, Date>} */
     softDeleted = new Map()
  
    /**
     * 
     * @param {string} key 
     * @param {TMap | string | number | boolean | null} value 
     * @returns {TMap}
     */
    set(key, value) {
      if (typeof value != "number"
        && typeof value != "string"
        && typeof value != "boolean"
        && !(value instanceof TMap)
        && value != null) {
        throw new TypeError()
      }
  
      this.map.set(String(key), [value, new Date()])
  
      return this
    }

    /** @param {string} key */
    get(key) {
      return this.map.get(String(key))?.at(0)
    }
  
    /** @param {string} key */
    getTimestamp(key) {
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
  
    toJSON() {
      return Object.fromEntries(this.map.entries())
  
      console.log({
        map: Object.fromEntries(this.map.entries()),
        softDeleted: Object.fromEntries(this.softDeleted.entries())
      });
  
      return {
        map: Object.fromEntries(this.map.entries()),
        softDeleted: Object.fromEntries(this.softDeleted.entries())
      }
    }
  
    /** @param {string} obj */
    static fromObject(obj) { }
  }
  
  class Reference {
    constructor() {
  
    }
  }