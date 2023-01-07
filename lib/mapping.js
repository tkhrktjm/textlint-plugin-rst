"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/mapping.ts
var mapping_exports = {};
__export(mapping_exports, {
  reSTAttributeKeyMap: () => reSTAttributeKeyMap,
  syntaxMap: () => syntaxMap
});
module.exports = __toCommonJS(mapping_exports);
var syntaxMap = {
  "document": "Document",
  "paragraph": "Paragraph",
  "block_quote": "BlockQuote",
  "list_item": "ListItem",
  "bullet_list": "List",
  "title": "Header",
  "literal_block": "CodeBlock",
  "reference": "Link",
  "meta": "Html",
  "text": "Str",
  "emphasis": "Emphasis",
  "strong": "Strong",
  "image": "Image",
  "inline": "Code",
  "literal": "Code"
};
var reSTAttributeKeyMap = {
  "tagname": "type",
  "rawsource": "raw",
  "text": "value"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  reSTAttributeKeyMap,
  syntaxMap
});
