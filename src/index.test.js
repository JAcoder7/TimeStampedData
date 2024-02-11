// @ts-check

import { test, expect } from "bun:test";
import { TMap } from ".";

test("core", () => {
    expect(TMap).toBeDefined()
    let map = new TMap()
    map.set("1", 5)
    // @ts-expect-error
    map.set(6, 5)
    expect(map.delete("1")).toBeTrue()
    expect(map.size).toBe(1)
    console.log(map);
})