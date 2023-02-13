"use strict";
import assert from "assert";
import fs from "fs";
import path from "path";
import { test } from "@textlint/ast-tester";
import { parse } from "../src/rst-to-ast";
import type { TxtParentNode } from "@textlint/ast-node-types";

const fixturesDir = path.join(__dirname, "testcases");

const assertUndefinedType = (node: TxtParentNode) => {
    if (!("type" in node)) {
        console.error(node);
        // @ts-ignore
        throw new Error(`Unknown type: ${node._debug_type}`);
    }
    if (node.children) {
        node.children.forEach(child => {
            assertUndefinedType(child as TxtParentNode);
        });
    }
}

describe("testcase", () => {
    fs.readdirSync(fixturesDir)
        .map(caseName => {
            it(`Test ${caseName}`, async function () {
                const fixtureDir = path.join(fixturesDir, caseName)
                const inputFile = path.join(fixtureDir, "input.rst")
                const inputContent = fs.readFileSync(inputFile, "utf-8")
                // const actual = parse(inputContent, { debug: true })
                const actual = parse(inputContent)
                const expectedFile = path.join(fixtureDir, "expected.json")
                // Usage: update snapshots
                // UPDATE_SNAPSHOT=1 npm test
                if (!fs.existsSync(expectedFile) || process.env.UPDATE_SNAPSHOT) {
                    fs.writeFileSync(expectedFile, JSON.stringify(actual, null, 2))
                    this.skip()
                    return
                }
                // assertUndefinedType(actual)
                const expectedContent = JSON.parse(fs.readFileSync(expectedFile, "utf-8"))
                assert.deepStrictEqual(actual, expectedContent)
            })
        })
})
