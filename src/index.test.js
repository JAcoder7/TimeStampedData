// @ts-check

import { test, expect } from "bun:test";
import { TMap } from ".";

test("core", () => {
    expect(TMap).toBeDefined()
    let map = new TMap()
    map.set("1", 5)

    // @ts-expect-error
    map.set(6, 5)
    map.set("7", null)
    map.set("8", true)

    try {
        // @ts-expect-error
        expect(map.set("6", { "a": 5 })).toThrow()
    } catch (error) { }
    try {
        // @ts-expect-error
        expect(map.set("6", undefined)).toThrow()
    } catch (error) { }
    try {
        // @ts-expect-error
        expect(map.set("6",)).toThrow()
    } catch (error) { }

    expect(map.remove("1")).toBeTrue()
    expect(map.getSize()).toBe(3)
    console.log(map);
    console.log(map.toJSON());
})

test("serialization", () => {
    let map = TMap.fromObject({
        users: [
            {name: "Test User 1"},
            {name: "Test User 2"}
        ],
        b: 2,
        c: {
            ca: new Date(),
            cb: [{ "a": 3 }, "b"]
        }
    });

    map.get("users")?.remove([...map.get("users").keys()][0])
    console.log(map.get("users").get([...map.keys()][0]));
    
    //map.set("d", 4)

    //console.log(map);

    let json = map.toJSON()
    let map2 = TMap.fromJSON(json)
    let json2 = map2.toJSON()
            
    expect(JSON.stringify(json)).toBe(JSON.stringify(json2))
    expect(JSON.stringify(map.toJSON(false))).toBe(JSON.stringify(map2.toJSON(false)))

    console.log("from Object: ", map.toFormattedString());
    //console.log("from Object: ", map.toJSON(true, true));
})