'use strict'

import { execSync } from 'child_process'
import traverse, { TraverseContext } from "traverse"
import { StructuredSource } from 'structured-source'
import { syntaxMap, reSTAttributeKeyMap } from './mapping'
import { TxtNode, TxtParentNode, ASTNodeTypes } from "@textlint/ast-node-types";

function filterAndReplaceNodeAttributes(node: TxtNode) {
  Object.keys(reSTAttributeKeyMap).forEach((key) => {
    let v = node[key]
    node[reSTAttributeKeyMap[key]] = v
    if (v !== undefined) {
      delete node[key]
    }
  })
}

export type ParseOptions = {
  debug: boolean;
}

function findParentNode(parent: TraverseContext | undefined): TxtNode | undefined {
  if (!parent) {
    return parent
  }
  if (!Array.isArray(parent.node)) {
    return parent.node as TxtNode
  }
  return findParentNode(parent.parent)
}


/**
 * parse reStructuredText and return ast mapped location info.
 * @param {string} text
 * @returns {TxtParentNode}
 */
export function parse(text: string, options?: ParseOptions): TxtParentNode {
  const isDebug = process.env.DEBUG?.startsWith("textlint:rst") ?? options?.debug ?? false;
  const ast = JSON.parse(execSync('rst2ast -q', { input: text, maxBuffer: 8192 * 8192 }).toString())
  const src = new StructuredSource(text)
  const typesNeedCalibration: Array<ASTNodeTypes | string> = [
    ASTNodeTypes.Header,
    ASTNodeTypes.Comment,
  ]

  traverse(ast).forEach(function (node: TxtNode | Array<TxtNode>) {
    if (this.notLeaf) {
      if (Array.isArray(node)) {
        return
      }
      filterAndReplaceNodeAttributes(node)
      const parentNode = findParentNode(this.parent)
      if (isDebug) {
        console.log("===== node ===============================")
        console.dir(node, {depth: null})
        console.log("===== parent node ===============================")
        console.log(parentNode)
      }
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
      // value
      if (node.value === undefined) {
        // comment ノードは value を持つ必要がある
        if (node.type === ASTNodeTypes.Comment) {
          node.value = node.raw
        } else {
          delete node.value
        }
      }
      // loc
      if (node.line) {
        if (node.raw.length === 0) {
          node.loc = {
            start: { line: node.line.start, column: 0 },
            end: { line: node.line.end + 1, column: 0 },
          }
          node.range = src.locationToRange(node.loc)
        } else {
          let searchStartPos = {
            line: node.line.start,
            column: 0,
          }
          // 補正対象 node types については node.line.start が期待する値よりも
          // 1 行下にずれるので上方向に補正する。
          // (rst2ast のバグの可能性もある)
          if (typesNeedCalibration.includes(node.type)) {
            searchStartPos.line -= 1
          // Header のテキスト要素 Str も同様にずれるので、親ノードが補正対象なら
          // 子ノードも同様に補正する。
          } else if (parentNode && parentNode.type && typesNeedCalibration.includes(parentNode.type)) {
            searchStartPos.line -= 1
          }
          const fromIndex = src.positionToIndex(searchStartPos)
          if (isDebug) {
            console.log("--------------------------")
            console.log(`fromIndex: ${fromIndex}`)
            console.log(`substr (20): ${text.substring(fromIndex, fromIndex+20)}`)
          }
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
        if (isDebug && node.range[0] === 0 && node.range[1] === 0) {
          console.log("-------------------------")
          console.log(`node.line:`)
          console.dir(node.line, { depth: null })
          console.log(`node.type: ${node.type}`)
          console.log(`node.raw: ${node.raw}`)
          console.log(`node.range: ${node.range[0]} - ${node.range[1]}`)
          console.log(`node.loc:`)
          console.dir(node.loc, { depth: null })
          console.log(`cut: ${text.substring(node.range[0], node.range[1])}`)
        }
        delete node.line
      }
    }
  })
  return ast as TxtParentNode
}
