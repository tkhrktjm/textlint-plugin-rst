'use strict'

import { execSync } from 'child_process'
import traverse from 'traverse'
import { StructuredSource } from 'structured-source'
import { syntaxMap, reSTAttributeKeyMap } from './mapping'
import { TxtNode, ASTNodeTypes } from "@textlint/ast-node-types";

function filterAndReplaceNodeAttributes(node: TxtNode) {
  Object.keys(reSTAttributeKeyMap).forEach((key) => {
    let v = node[key]
    node[reSTAttributeKeyMap[key]] = v
    if (v !== undefined) {
      delete node[key]
    }
  })
}

/**
 * parse reStructuredText and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
export function parse(text: string): any {
  let ast = JSON.parse(execSync('rst2ast -q', { input: text, maxBuffer: 8192 * 8192 }))
  const src = new StructuredSource(text)

  traverse(ast).forEach(function (node: TxtNode) {
    if (this.notLeaf) {
      filterAndReplaceNodeAttributes(node)
      // console.log("===== node ===============================")
      // console.dir(node, {depth: null})
      // type
      if (node.type === null) {
        node.type = ASTNodeTypes.Str
      }
      node.type = syntaxMap[node.type]
      if (!node.type) {
        node.type = 'Unknown'
      }
      // raw
      node.raw = node.raw || node.value || ''
      // loc
      if (node.line) {
        if (node.raw.length === 0) {
          node.loc = {
            start: { line: 1, column: 0 },
            end: { line: 1, column: 0 },
          }
          node.range = [0, 0]
        } else {
          let searchStartPos = {
            line: node.line.start,
            column: 0,
          }
          // Header の場合 node.line.start が1行下にずれるので補正する。
          // (rst2ast のバグの可能性もある)
          if (node.type === ASTNodeTypes.Header) {
            searchStartPos.line -= 1
          }
          const fromIndex = src.positionToIndex(searchStartPos)
          // DEBUG
          // console.log("--------------------------")
          // console.log(`fromIndex: ${fromIndex}`)
          // console.log(`substr (20): ${text.substring(fromIndex, fromIndex+20)}`)
          let start = text.indexOf(node.raw, fromIndex)
          let end = 0
          // 見つからない場合は range = [0, 0] を設定
          if (start < 0) {
            start = 0
          } else {
            end = start + node.raw.length
          }
          node.range = [start, end]
          node.loc = src.rangeToLocation(node.range)
        }
        // DEBUG
        // if (node.range[0] === 0 && node.range[1] === 0) {
        //   console.log("-------------------------")
        //   console.log(`node.line:`)
        //   console.dir(node.line, { depth: null })
        //   console.log(`node.type: ${node.type}`)
        //   console.log(`node.raw: ${node.raw}`)
        //   console.log(`node.range: ${node.range[0]} - ${node.range[1]}`)
        //   console.log(`node.loc:`)
        //   console.dir(node.loc, { depth: null })
        //   console.log(`cut: ${text.substring(node.range[0], node.range[1])}`)
        // }
        delete node.line
      }
    }
  })
  return ast
}
