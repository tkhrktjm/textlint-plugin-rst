"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/traverse/index.js
var require_traverse = __commonJS({
  "node_modules/traverse/index.js"(exports, module2) {
    "use strict";
    function toS(obj) {
      return Object.prototype.toString.call(obj);
    }
    function isDate(obj) {
      return toS(obj) === "[object Date]";
    }
    function isRegExp(obj) {
      return toS(obj) === "[object RegExp]";
    }
    function isError(obj) {
      return toS(obj) === "[object Error]";
    }
    function isBoolean(obj) {
      return toS(obj) === "[object Boolean]";
    }
    function isNumber(obj) {
      return toS(obj) === "[object Number]";
    }
    function isString(obj) {
      return toS(obj) === "[object String]";
    }
    var isArray = Array.isArray || function isArray2(xs) {
      return Object.prototype.toString.call(xs) === "[object Array]";
    };
    function forEach(xs, fn) {
      if (xs.forEach) {
        return xs.forEach(fn);
      }
      for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
      }
      return void 0;
    }
    var objectKeys = Object.keys || function keys(obj) {
      var res = [];
      for (var key in obj) {
        res.push(key);
      }
      return res;
    };
    var hasOwnProperty = Object.prototype.hasOwnProperty || function(obj, key) {
      return key in obj;
    };
    function copy(src) {
      if (typeof src === "object" && src !== null) {
        var dst;
        if (isArray(src)) {
          dst = [];
        } else if (isDate(src)) {
          dst = new Date(src.getTime ? src.getTime() : src);
        } else if (isRegExp(src)) {
          dst = new RegExp(src);
        } else if (isError(src)) {
          dst = { message: src.message };
        } else if (isBoolean(src) || isNumber(src) || isString(src)) {
          dst = Object(src);
        } else if (Object.create && Object.getPrototypeOf) {
          dst = Object.create(Object.getPrototypeOf(src));
        } else if (src.constructor === Object) {
          dst = {};
        } else {
          var proto = src.constructor && src.constructor.prototype || src.__proto__ || {};
          var T = function T2() {
          };
          T.prototype = proto;
          dst = new T();
        }
        forEach(objectKeys(src), function(key) {
          dst[key] = src[key];
        });
        return dst;
      }
      return src;
    }
    function walk(root, cb, immutable) {
      var path = [];
      var parents = [];
      var alive = true;
      return function walker(node_) {
        var node = immutable ? copy(node_) : node_;
        var modifiers = {};
        var keepGoing = true;
        var state = {
          node,
          node_,
          path: [].concat(path),
          parent: parents[parents.length - 1],
          parents,
          key: path[path.length - 1],
          isRoot: path.length === 0,
          level: path.length,
          circular: null,
          update: function(x, stopHere) {
            if (!state.isRoot) {
              state.parent.node[state.key] = x;
            }
            state.node = x;
            if (stopHere) {
              keepGoing = false;
            }
          },
          delete: function(stopHere) {
            delete state.parent.node[state.key];
            if (stopHere) {
              keepGoing = false;
            }
          },
          remove: function(stopHere) {
            if (isArray(state.parent.node)) {
              state.parent.node.splice(state.key, 1);
            } else {
              delete state.parent.node[state.key];
            }
            if (stopHere) {
              keepGoing = false;
            }
          },
          keys: null,
          before: function(f) {
            modifiers.before = f;
          },
          after: function(f) {
            modifiers.after = f;
          },
          pre: function(f) {
            modifiers.pre = f;
          },
          post: function(f) {
            modifiers.post = f;
          },
          stop: function() {
            alive = false;
          },
          block: function() {
            keepGoing = false;
          }
        };
        if (!alive) {
          return state;
        }
        function updateState() {
          if (typeof state.node === "object" && state.node !== null) {
            if (!state.keys || state.node_ !== state.node) {
              state.keys = objectKeys(state.node);
            }
            state.isLeaf = state.keys.length === 0;
            for (var i = 0; i < parents.length; i++) {
              if (parents[i].node_ === node_) {
                state.circular = parents[i];
                break;
              }
            }
          } else {
            state.isLeaf = true;
            state.keys = null;
          }
          state.notLeaf = !state.isLeaf;
          state.notRoot = !state.isRoot;
        }
        updateState();
        var ret = cb.call(state, state.node);
        if (ret !== void 0 && state.update) {
          state.update(ret);
        }
        if (modifiers.before) {
          modifiers.before.call(state, state.node);
        }
        if (!keepGoing) {
          return state;
        }
        if (typeof state.node === "object" && state.node !== null && !state.circular) {
          parents.push(state);
          updateState();
          forEach(state.keys, function(key, i) {
            path.push(key);
            if (modifiers.pre) {
              modifiers.pre.call(state, state.node[key], key);
            }
            var child = walker(state.node[key]);
            if (immutable && hasOwnProperty.call(state.node, key)) {
              state.node[key] = child.node;
            }
            child.isLast = i === state.keys.length - 1;
            child.isFirst = i === 0;
            if (modifiers.post) {
              modifiers.post.call(state, child);
            }
            path.pop();
          });
          parents.pop();
        }
        if (modifiers.after) {
          modifiers.after.call(state, state.node);
        }
        return state;
      }(root).node;
    }
    function Traverse(obj) {
      this.value = obj;
    }
    Traverse.prototype.get = function(ps) {
      var node = this.value;
      for (var i = 0; i < ps.length; i++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
          return void 0;
        }
        node = node[key];
      }
      return node;
    };
    Traverse.prototype.has = function(ps) {
      var node = this.value;
      for (var i = 0; i < ps.length; i++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
          return false;
        }
        node = node[key];
      }
      return true;
    };
    Traverse.prototype.set = function(ps, value) {
      var node = this.value;
      for (var i = 0; i < ps.length - 1; i++) {
        var key = ps[i];
        if (!hasOwnProperty.call(node, key)) {
          node[key] = {};
        }
        node = node[key];
      }
      node[ps[i]] = value;
      return value;
    };
    Traverse.prototype.map = function(cb) {
      return walk(this.value, cb, true);
    };
    Traverse.prototype.forEach = function(cb) {
      this.value = walk(this.value, cb, false);
      return this.value;
    };
    Traverse.prototype.reduce = function(cb, init) {
      var skip = arguments.length === 1;
      var acc = skip ? this.value : init;
      this.forEach(function(x) {
        if (!this.isRoot || !skip) {
          acc = cb.call(this, acc, x);
        }
      });
      return acc;
    };
    Traverse.prototype.paths = function() {
      var acc = [];
      this.forEach(function() {
        acc.push(this.path);
      });
      return acc;
    };
    Traverse.prototype.nodes = function() {
      var acc = [];
      this.forEach(function() {
        acc.push(this.node);
      });
      return acc;
    };
    Traverse.prototype.clone = function() {
      var parents = [];
      var nodes = [];
      return function clone(src) {
        for (var i = 0; i < parents.length; i++) {
          if (parents[i] === src) {
            return nodes[i];
          }
        }
        if (typeof src === "object" && src !== null) {
          var dst = copy(src);
          parents.push(src);
          nodes.push(dst);
          forEach(objectKeys(src), function(key) {
            dst[key] = clone(src[key]);
          });
          parents.pop();
          nodes.pop();
          return dst;
        }
        return src;
      }(this.value);
    };
    function traverse2(obj) {
      return new Traverse(obj);
    }
    forEach(objectKeys(Traverse.prototype), function(key) {
      traverse2[key] = function(obj) {
        var args = [].slice.call(arguments, 1);
        var t = new Traverse(obj);
        return t[key].apply(t, args);
      };
    });
    module2.exports = traverse2;
  }
});

// node_modules/boundary/lib/index.js
var require_lib = __commonJS({
  "node_modules/boundary/lib/index.js"(exports) {
    "use strict";
    function compare(v1, v2) {
      return v1 < v2;
    }
    function upperBound(array, value, comp) {
      if (comp === void 0)
        comp = compare;
      return function() {
        var len = array.length;
        var i = 0;
        while (len) {
          var diff = len >>> 1;
          var cursor = i + diff;
          if (comp(value, array[cursor])) {
            len = diff;
          } else {
            i = cursor + 1;
            len -= diff + 1;
          }
        }
        return i;
      }();
    }
    function lowerBound(array, value, comp) {
      if (comp === void 0)
        comp = compare;
      return function() {
        var len = array.length;
        var i = 0;
        while (len) {
          var diff = len >>> 1;
          var cursor = i + diff;
          if (comp(array[cursor], value)) {
            i = cursor + 1;
            len -= diff + 1;
          } else {
            len = diff;
          }
        }
        return i;
      }();
    }
    function binarySearch(array, value, comp) {
      if (comp === void 0)
        comp = compare;
      return function() {
        var cursor = lowerBound(array, value, comp);
        return cursor !== array.length && !comp(value, array[cursor]);
      }();
    }
    exports.compare = compare;
    exports.lowerBound = lowerBound;
    exports.upperBound = upperBound;
    exports.binarySearch = binarySearch;
  }
});

// node_modules/structured-source/lib/structured-source.js
var require_structured_source = __commonJS({
  "node_modules/structured-source/lib/structured-source.js"(exports) {
    "use strict";
    var _classProps = function(child, staticProps, instanceProps) {
      if (staticProps)
        Object.defineProperties(child, staticProps);
      if (instanceProps)
        Object.defineProperties(child.prototype, instanceProps);
    };
    var upperBound = require_lib().upperBound;
    var Position = function Position2(line, column) {
      this.line = line;
      this.column = column;
    };
    exports.Position = Position;
    var SourceLocation = function SourceLocation2(start, end) {
      this.start = start;
      this.end = end;
    };
    exports.SourceLocation = SourceLocation;
    var StructuredSource2 = function() {
      var StructuredSource3 = (
        /**
         * @constructs StructuredSource
         * @param {string} source - source code text.
         */
        function StructuredSource4(source) {
          this.indice = [0];
          var regexp = /[\r\n\u2028\u2029]/g;
          var length = source.length;
          regexp.lastIndex = 0;
          while (true) {
            var result = regexp.exec(source);
            if (!result) {
              break;
            }
            var index = result.index;
            if (source.charCodeAt(index) === 13 && source.charCodeAt(index + 1) === 10) {
              index += 1;
            }
            var nextIndex = index + 1;
            if (length < nextIndex) {
              break;
            }
            this.indice.push(nextIndex);
            regexp.lastIndex = nextIndex;
          }
        }
      );
      StructuredSource3.prototype.locationToRange = function(loc) {
        return [this.positionToIndex(loc.start), this.positionToIndex(loc.end)];
      };
      StructuredSource3.prototype.rangeToLocation = function(range) {
        return new SourceLocation(this.indexToPosition(range[0]), this.indexToPosition(range[1]));
      };
      StructuredSource3.prototype.positionToIndex = function(pos) {
        var start = this.indice[pos.line - 1];
        return start + pos.column;
      };
      StructuredSource3.prototype.indexToPosition = function(index) {
        var startLine = upperBound(this.indice, index);
        return new Position(startLine, index - this.indice[startLine - 1]);
      };
      _classProps(StructuredSource3, null, {
        line: {
          get: function() {
            return this.indice.length;
          }
        }
      });
      return StructuredSource3;
    }();
    exports["default"] = StructuredSource2;
  }
});

// node_modules/structured-source/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/structured-source/lib/index.js"(exports, module2) {
    "use strict";
    var StructuredSource2 = require_structured_source()["default"];
    module2.exports = StructuredSource2;
  }
});

// src/ReSTProcessor.ts
var ReSTProcessor_exports = {};
__export(ReSTProcessor_exports, {
  ReSTProcessor: () => ReSTProcessor
});
module.exports = __toCommonJS(ReSTProcessor_exports);

// src/rst-to-ast.ts
var import_child_process = require("child_process");
var import_traverse = __toESM(require_traverse());
var import_structured_source = __toESM(require_lib2());

// src/mapping.ts
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
  "inline": "Code"
};
var reSTAttributeKeyMap = {
  "tagname": "type",
  "rawsource": "raw",
  "text": "value"
};

// src/rst-to-ast.ts
function filterAndReplaceNodeAttributes(node) {
  Object.keys(reSTAttributeKeyMap).forEach((key) => {
    let v = node[key];
    node[reSTAttributeKeyMap[key]] = v;
    if (v !== void 0) {
      delete node[key];
    }
  });
}
function parse(text) {
  let ast = JSON.parse((0, import_child_process.execSync)("rst2ast -q", { input: text, maxBuffer: 8192 * 8192 }));
  const src = new import_structured_source.default(text);
  (0, import_traverse.default)(ast).forEach(function(node) {
    if (this.notLeaf) {
      filterAndReplaceNodeAttributes(node);
      if (node.type === null) {
        node.type = "text";
      }
      node.type = syntaxMap[node.type];
      if (!node.type) {
        node.type = "Unknown";
      }
      node.raw = node.raw || node.value || "";
      let lines = node.raw.split("\n");
      if (node.line) {
        node.loc = {
          start: { line: node.line.start, column: 0 },
          end: { line: node.line.end, column: lines[lines.length - 1].length }
        };
        node.range = src.locationToRange(node.loc);
        delete node.line;
      }
    }
  });
  return ast;
}

// src/ReSTProcessor.ts
var ReSTProcessor = class {
  config;
  constructor(config = {}) {
    this.config = config;
  }
  static availableExtensions() {
    return [".rst", ".rest"];
  }
  processor(ext) {
    return {
      preProcess(text, filePath) {
        return parse(text);
      },
      postProcess(messages, filePath) {
        return {
          messages,
          filePath: filePath ? filePath : "<rst>"
        };
      }
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReSTProcessor
});
