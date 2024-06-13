import * as os from 'os';
let eppoSdk = null;
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/quick-format-unescaped/index.js
  var require_quick_format_unescaped = __commonJS({
    "node_modules/quick-format-unescaped/index.js"(exports, module) {
      "use strict";
      function tryStringify(o) {
        try {
          return JSON.stringify(o);
        } catch (e) {
          return '"[Circular]"';
        }
      }
      module.exports = format;
      function format(f, args, opts) {
        var ss = opts && opts.stringify || tryStringify;
        var offset = 1;
        if (typeof f === "object" && f !== null) {
          var len = args.length + offset;
          if (len === 1) return f;
          var objects = new Array(len);
          objects[0] = ss(f);
          for (var index = 1; index < len; index++) {
            objects[index] = ss(args[index]);
          }
          return objects.join(" ");
        }
        if (typeof f !== "string") {
          return f;
        }
        var argLen = args.length;
        if (argLen === 0) return f;
        var str = "";
        var a = 1 - offset;
        var lastPos = -1;
        var flen = f && f.length || 0;
        for (var i = 0; i < flen; ) {
          if (f.charCodeAt(i) === 37 && i + 1 < flen) {
            lastPos = lastPos > -1 ? lastPos : 0;
            switch (f.charCodeAt(i + 1)) {
              case 100:
              case 102:
                if (a >= argLen)
                  break;
                if (args[a] == null) break;
                if (lastPos < i)
                  str += f.slice(lastPos, i);
                str += Number(args[a]);
                lastPos = i + 2;
                i++;
                break;
              case 105:
                if (a >= argLen)
                  break;
                if (args[a] == null) break;
                if (lastPos < i)
                  str += f.slice(lastPos, i);
                str += Math.floor(Number(args[a]));
                lastPos = i + 2;
                i++;
                break;
              case 79:
              case 111:
              case 106:
                if (a >= argLen)
                  break;
                if (args[a] === void 0) break;
                if (lastPos < i)
                  str += f.slice(lastPos, i);
                var type = typeof args[a];
                if (type === "string") {
                  str += "'" + args[a] + "'";
                  lastPos = i + 2;
                  i++;
                  break;
                }
                if (type === "function") {
                  str += args[a].name || "<anonymous>";
                  lastPos = i + 2;
                  i++;
                  break;
                }
                str += ss(args[a]);
                lastPos = i + 2;
                i++;
                break;
              case 115:
                if (a >= argLen)
                  break;
                if (lastPos < i)
                  str += f.slice(lastPos, i);
                str += String(args[a]);
                lastPos = i + 2;
                i++;
                break;
              case 37:
                if (lastPos < i)
                  str += f.slice(lastPos, i);
                str += "%";
                lastPos = i + 2;
                i++;
                a--;
                break;
            }
            ++a;
          }
          ++i;
        }
        if (lastPos === -1)
          return f;
        else if (lastPos < flen) {
          str += f.slice(lastPos);
        }
        return str;
      }
    }
  });

  // node_modules/pino/browser.js
  var require_browser = __commonJS({
    "node_modules/pino/browser.js"(exports, module) {
      "use strict";
      var format = require_quick_format_unescaped();
      module.exports = pino;
      var _console = pfGlobalThisOrFallback().console || {};
      var stdSerializers = {
        mapHttpRequest: mock,
        mapHttpResponse: mock,
        wrapRequestSerializer: passthrough,
        wrapResponseSerializer: passthrough,
        wrapErrorSerializer: passthrough,
        req: mock,
        res: mock,
        err: asErrValue,
        errWithCause: asErrValue
      };
      function levelToValue(level, logger) {
        return level === "silent" ? Infinity : logger.levels.values[level];
      }
      var baseLogFunctionSymbol = Symbol("pino.logFuncs");
      var hierarchySymbol = Symbol("pino.hierarchy");
      var logFallbackMap = {
        error: "log",
        fatal: "error",
        warn: "error",
        info: "log",
        debug: "log",
        trace: "log"
      };
      function appendChildLogger(parentLogger, childLogger) {
        const newEntry = {
          logger: childLogger,
          parent: parentLogger[hierarchySymbol]
        };
        childLogger[hierarchySymbol] = newEntry;
      }
      function setupBaseLogFunctions(logger, levels, proto) {
        const logFunctions = {};
        levels.forEach((level) => {
          logFunctions[level] = proto[level] ? proto[level] : _console[level] || _console[logFallbackMap[level] || "log"] || noop;
        });
        logger[baseLogFunctionSymbol] = logFunctions;
      }
      function shouldSerialize(serialize, serializers) {
        if (Array.isArray(serialize)) {
          const hasToFilter = serialize.filter(function(k) {
            return k !== "!stdSerializers.err";
          });
          return hasToFilter;
        } else if (serialize === true) {
          return Object.keys(serializers);
        }
        return false;
      }
      function pino(opts) {
        opts = opts || {};
        opts.browser = opts.browser || {};
        const transmit2 = opts.browser.transmit;
        if (transmit2 && typeof transmit2.send !== "function") {
          throw Error("pino: transmit option must have a send function");
        }
        const proto = opts.browser.write || _console;
        if (opts.browser.write) opts.browser.asObject = true;
        const serializers = opts.serializers || {};
        const serialize = shouldSerialize(opts.browser.serialize, serializers);
        let stdErrSerialize = opts.browser.serialize;
        if (Array.isArray(opts.browser.serialize) && opts.browser.serialize.indexOf("!stdSerializers.err") > -1) stdErrSerialize = false;
        const customLevels = Object.keys(opts.customLevels || {});
        const levels = ["error", "fatal", "warn", "info", "debug", "trace"].concat(customLevels);
        if (typeof proto === "function") {
          levels.forEach(function(level2) {
            proto[level2] = proto;
          });
        }
        if (opts.enabled === false || opts.browser.disabled) opts.level = "silent";
        const level = opts.level || "info";
        const logger = Object.create(proto);
        if (!logger.log) logger.log = noop;
        setupBaseLogFunctions(logger, levels, proto);
        appendChildLogger({}, logger);
        Object.defineProperty(logger, "levelVal", {
          get: getLevelVal
        });
        Object.defineProperty(logger, "level", {
          get: getLevel,
          set: setLevel
        });
        const setOpts = {
          transmit: transmit2,
          serialize,
          asObject: opts.browser.asObject,
          formatters: opts.browser.formatters,
          levels,
          timestamp: getTimeFunction(opts)
        };
        logger.levels = getLevels(opts);
        logger.level = level;
        logger.setMaxListeners = logger.getMaxListeners = logger.emit = logger.addListener = logger.on = logger.prependListener = logger.once = logger.prependOnceListener = logger.removeListener = logger.removeAllListeners = logger.listeners = logger.listenerCount = logger.eventNames = logger.write = logger.flush = noop;
        logger.serializers = serializers;
        logger._serialize = serialize;
        logger._stdErrSerialize = stdErrSerialize;
        logger.child = child;
        if (transmit2) logger._logEvent = createLogEventShape();
        function getLevelVal() {
          return levelToValue(this.level, this);
        }
        function getLevel() {
          return this._level;
        }
        function setLevel(level2) {
          if (level2 !== "silent" && !this.levels.values[level2]) {
            throw Error("unknown level " + level2);
          }
          this._level = level2;
          set(this, setOpts, logger, "error");
          set(this, setOpts, logger, "fatal");
          set(this, setOpts, logger, "warn");
          set(this, setOpts, logger, "info");
          set(this, setOpts, logger, "debug");
          set(this, setOpts, logger, "trace");
          customLevels.forEach((level3) => {
            set(this, setOpts, logger, level3);
          });
        }
        function child(bindings, childOptions) {
          if (!bindings) {
            throw new Error("missing bindings for child Pino");
          }
          childOptions = childOptions || {};
          if (serialize && bindings.serializers) {
            childOptions.serializers = bindings.serializers;
          }
          const childOptionsSerializers = childOptions.serializers;
          if (serialize && childOptionsSerializers) {
            var childSerializers = Object.assign({}, serializers, childOptionsSerializers);
            var childSerialize = opts.browser.serialize === true ? Object.keys(childSerializers) : serialize;
            delete bindings.serializers;
            applySerializers([bindings], childSerialize, childSerializers, this._stdErrSerialize);
          }
          function Child(parent) {
            this._childLevel = (parent._childLevel | 0) + 1;
            this.bindings = bindings;
            if (childSerializers) {
              this.serializers = childSerializers;
              this._serialize = childSerialize;
            }
            if (transmit2) {
              this._logEvent = createLogEventShape(
                  [].concat(parent._logEvent.bindings, bindings)
              );
            }
          }
          Child.prototype = this;
          const newLogger = new Child(this);
          appendChildLogger(this, newLogger);
          newLogger.level = this.level;
          return newLogger;
        }
        return logger;
      }
      function getLevels(opts) {
        const customLevels = opts.customLevels || {};
        const values = Object.assign({}, pino.levels.values, customLevels);
        const labels = Object.assign({}, pino.levels.labels, invertObject(customLevels));
        return {
          values,
          labels
        };
      }
      function invertObject(obj) {
        const inverted = {};
        Object.keys(obj).forEach(function(key) {
          inverted[obj[key]] = key;
        });
        return inverted;
      }
      pino.levels = {
        values: {
          fatal: 60,
          error: 50,
          warn: 40,
          info: 30,
          debug: 20,
          trace: 10
        },
        labels: {
          10: "trace",
          20: "debug",
          30: "info",
          40: "warn",
          50: "error",
          60: "fatal"
        }
      };
      pino.stdSerializers = stdSerializers;
      pino.stdTimeFunctions = Object.assign({}, { nullTime, epochTime, unixTime, isoTime });
      function getBindingChain(logger) {
        const bindings = [];
        if (logger.bindings) {
          bindings.push(logger.bindings);
        }
        let hierarchy = logger[hierarchySymbol];
        while (hierarchy.parent) {
          hierarchy = hierarchy.parent;
          if (hierarchy.logger.bindings) {
            bindings.push(hierarchy.logger.bindings);
          }
        }
        return bindings.reverse();
      }
      function set(self2, opts, rootLogger, level) {
        self2[level] = levelToValue(self2.level, rootLogger) > levelToValue(level, rootLogger) ? noop : rootLogger[baseLogFunctionSymbol][level];
        if (!opts.transmit && self2[level] === noop) {
          return;
        }
        self2[level] = createWrap(self2, opts, rootLogger, level);
        const bindings = getBindingChain(self2);
        if (bindings.length === 0) {
          return;
        }
        self2[level] = prependBindingsInArguments(bindings, self2[level]);
      }
      function prependBindingsInArguments(bindings, logFunc) {
        return function() {
          return logFunc.apply(this, [...bindings, ...arguments]);
        };
      }
      function createWrap(self2, opts, rootLogger, level) {
        return /* @__PURE__ */ function(write) {
          return function LOG() {
            const ts = opts.timestamp();
            const args = new Array(arguments.length);
            const proto = Object.getPrototypeOf && Object.getPrototypeOf(this) === _console ? _console : this;
            for (var i = 0; i < args.length; i++) args[i] = arguments[i];
            if (opts.serialize && !opts.asObject) {
              applySerializers(args, this._serialize, this.serializers, this._stdErrSerialize);
            }
            if (opts.asObject || opts.formatters) {
              write.call(proto, asObject(this, level, args, ts, opts.formatters));
            } else write.apply(proto, args);
            if (opts.transmit) {
              const transmitLevel = opts.transmit.level || self2._level;
              const transmitValue = rootLogger.levels.values[transmitLevel];
              const methodValue = rootLogger.levels.values[level];
              if (methodValue < transmitValue) return;
              transmit(this, {
                ts,
                methodLevel: level,
                methodValue,
                transmitLevel,
                transmitValue: rootLogger.levels.values[opts.transmit.level || self2._level],
                send: opts.transmit.send,
                val: levelToValue(self2._level, rootLogger)
              }, args);
            }
          };
        }(self2[baseLogFunctionSymbol][level]);
      }
      function asObject(logger, level, args, ts, formatters = {}) {
        const {
          level: levelFormatter = () => logger.levels.values[level],
          log: logObjectFormatter = (obj) => obj
        } = formatters;
        if (logger._serialize) applySerializers(args, logger._serialize, logger.serializers, logger._stdErrSerialize);
        const argsCloned = args.slice();
        let msg = argsCloned[0];
        const logObject = {};
        if (ts) {
          logObject.time = ts;
        }
        logObject.level = levelFormatter(level, logger.levels.values[level]);
        let lvl = (logger._childLevel | 0) + 1;
        if (lvl < 1) lvl = 1;
        if (msg !== null && typeof msg === "object") {
          while (lvl-- && typeof argsCloned[0] === "object") {
            Object.assign(logObject, argsCloned.shift());
          }
          msg = argsCloned.length ? format(argsCloned.shift(), argsCloned) : void 0;
        } else if (typeof msg === "string") msg = format(argsCloned.shift(), argsCloned);
        if (msg !== void 0) logObject.msg = msg;
        const formattedLogObject = logObjectFormatter(logObject);
        return formattedLogObject;
      }
      function applySerializers(args, serialize, serializers, stdErrSerialize) {
        for (const i in args) {
          if (stdErrSerialize && args[i] instanceof Error) {
            args[i] = pino.stdSerializers.err(args[i]);
          } else if (typeof args[i] === "object" && !Array.isArray(args[i])) {
            for (const k in args[i]) {
              if (serialize && serialize.indexOf(k) > -1 && k in serializers) {
                args[i][k] = serializers[k](args[i][k]);
              }
            }
          }
        }
      }
      function transmit(logger, opts, args) {
        const send = opts.send;
        const ts = opts.ts;
        const methodLevel = opts.methodLevel;
        const methodValue = opts.methodValue;
        const val = opts.val;
        const bindings = logger._logEvent.bindings;
        applySerializers(
            args,
            logger._serialize || Object.keys(logger.serializers),
            logger.serializers,
            logger._stdErrSerialize === void 0 ? true : logger._stdErrSerialize
        );
        logger._logEvent.ts = ts;
        logger._logEvent.messages = args.filter(function(arg) {
          return bindings.indexOf(arg) === -1;
        });
        logger._logEvent.level.label = methodLevel;
        logger._logEvent.level.value = methodValue;
        send(methodLevel, logger._logEvent, val);
        logger._logEvent = createLogEventShape(bindings);
      }
      function createLogEventShape(bindings) {
        return {
          ts: 0,
          messages: [],
          bindings: bindings || [],
          level: { label: "", value: 0 }
        };
      }
      function asErrValue(err) {
        const obj = {
          type: err.constructor.name,
          msg: err.message,
          stack: err.stack
        };
        for (const key in err) {
          if (obj[key] === void 0) {
            obj[key] = err[key];
          }
        }
        return obj;
      }
      function getTimeFunction(opts) {
        if (typeof opts.timestamp === "function") {
          return opts.timestamp;
        }
        if (opts.timestamp === false) {
          return nullTime;
        }
        return epochTime;
      }
      function mock() {
        return {};
      }
      function passthrough(a) {
        return a;
      }
      function noop() {
      }
      function nullTime() {
        return false;
      }
      function epochTime() {
        return Date.now();
      }
      function unixTime() {
        return Math.round(Date.now() / 1e3);
      }
      function isoTime() {
        return new Date(Date.now()).toISOString();
      }
      function pfGlobalThisOrFallback() {
        function defd(o) {
          return typeof o !== "undefined" && o;
        }
        try {
          if (typeof globalThis !== "undefined") return globalThis;
          Object.defineProperty(Object.prototype, "globalThis", {
            get: function() {
              delete Object.prototype.globalThis;
              return this.globalThis = this;
            },
            configurable: true
          });
          return globalThis;
        } catch (e) {
          return defd(self) || defd(window) || defd(this) || {};
        }
      }
      module.exports.default = pino;
      module.exports.pino = pino;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/application-logger.js
  var require_application_logger = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/application-logger.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.logger = exports.loggerPrefix = void 0;
      var pino_1 = require_browser();
      exports.loggerPrefix = "[Eppo SDK]";
      exports.logger = (0, pino_1.default)({
        level: false ? "warn" : "info",
        // https://getpino.io/#/docs/browser
        browser: { disabled: true }
      });
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/lru-cache.js
  var require_lru_cache = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/lru-cache.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.LRUCache = void 0;
      var LRUCache = class {
        constructor(capacity) {
          this.capacity = capacity;
          this.cache = /* @__PURE__ */ new Map();
        }
        has(key) {
          return this.cache.has(key);
        }
        get(key) {
          if (!this.cache.has(key)) {
            return void 0;
          }
          const value = this.cache.get(key);
          if (value !== void 0) {
            this.cache.delete(key);
            this.cache.set(key, value);
          }
          return value;
        }
        set(key, value) {
          if (this.capacity === 0) {
            return;
          }
          if (this.cache.has(key)) {
            this.cache.delete(key);
          } else if (this.cache.size >= this.capacity) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
          }
          this.cache.set(key, value);
        }
      };
      exports.LRUCache = LRUCache;
    }
  });

  // node_modules/js-base64/base64.js
  var require_base64 = __commonJS({
    "node_modules/js-base64/base64.js"(exports, module) {
      (function(global2, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (
            // cf. https://github.com/dankogai/js-base64/issues/119
            function() {
              var _Base64 = global2.Base64;
              var gBase64 = factory();
              gBase64.noConflict = function() {
                global2.Base64 = _Base64;
                return gBase64;
              };
              if (global2.Meteor) {
                Base64 = gBase64;
              }
              global2.Base64 = gBase64;
            }()
        );
      })(typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : exports, function() {
        "use strict";
        var version = "3.7.7";
        var VERSION = version;
        var _hasBuffer = typeof Buffer === "function";
        var _TD = typeof TextDecoder === "function" ? new TextDecoder() : void 0;
        var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
        var b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var b64chs = Array.prototype.slice.call(b64ch);
        var b64tab = function(a) {
          var tab = {};
          a.forEach(function(c, i) {
            return tab[c] = i;
          });
          return tab;
        }(b64chs);
        var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
        var _fromCC = String.fromCharCode.bind(String);
        var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : function(it) {
          return new Uint8Array(Array.prototype.slice.call(it, 0));
        };
        var _mkUriSafe = function(src) {
          return src.replace(/=/g, "").replace(/[+\/]/g, function(m0) {
            return m0 == "+" ? "-" : "_";
          });
        };
        var _tidyB64 = function(s) {
          return s.replace(/[^A-Za-z0-9\+\/]/g, "");
        };
        var btoaPolyfill = function(bin) {
          var u32, c0, c1, c2, asc = "";
          var pad = bin.length % 3;
          for (var i = 0; i < bin.length; ) {
            if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255)
              throw new TypeError("invalid character found");
            u32 = c0 << 16 | c1 << 8 | c2;
            asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
          }
          return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
        };
        var _btoa = typeof btoa === "function" ? function(bin) {
          return btoa(bin);
        } : _hasBuffer ? function(bin) {
          return Buffer.from(bin, "binary").toString("base64");
        } : btoaPolyfill;
        var _fromUint8Array = _hasBuffer ? function(u8a) {
          return Buffer.from(u8a).toString("base64");
        } : function(u8a) {
          var maxargs = 4096;
          var strs = [];
          for (var i = 0, l = u8a.length; i < l; i += maxargs) {
            strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
          }
          return _btoa(strs.join(""));
        };
        var fromUint8Array = function(u8a, urlsafe) {
          if (urlsafe === void 0) {
            urlsafe = false;
          }
          return urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
        };
        var cb_utob = function(c) {
          if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 128 ? c : cc < 2048 ? _fromCC(192 | cc >>> 6) + _fromCC(128 | cc & 63) : _fromCC(224 | cc >>> 12 & 15) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
          } else {
            var cc = 65536 + (c.charCodeAt(0) - 55296) * 1024 + (c.charCodeAt(1) - 56320);
            return _fromCC(240 | cc >>> 18 & 7) + _fromCC(128 | cc >>> 12 & 63) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
          }
        };
        var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
        var utob = function(u) {
          return u.replace(re_utob, cb_utob);
        };
        var _encode = _hasBuffer ? function(s) {
          return Buffer.from(s, "utf8").toString("base64");
        } : _TE ? function(s) {
          return _fromUint8Array(_TE.encode(s));
        } : function(s) {
          return _btoa(utob(s));
        };
        var encode = function(src, urlsafe) {
          if (urlsafe === void 0) {
            urlsafe = false;
          }
          return urlsafe ? _mkUriSafe(_encode(src)) : _encode(src);
        };
        var encodeURI = function(src) {
          return encode(src, true);
        };
        var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
        var cb_btou = function(cccc) {
          switch (cccc.length) {
            case 4:
              var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
              return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
            case 3:
              return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
            default:
              return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
          }
        };
        var btou = function(b) {
          return b.replace(re_btou, cb_btou);
        };
        var atobPolyfill = function(asc) {
          asc = asc.replace(/\s+/g, "");
          if (!b64re.test(asc))
            throw new TypeError("malformed base64.");
          asc += "==".slice(2 - (asc.length & 3));
          var u24, bin = "", r1, r2;
          for (var i = 0; i < asc.length; ) {
            u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
            bin += r1 === 64 ? _fromCC(u24 >> 16 & 255) : r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255) : _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
          }
          return bin;
        };
        var _atob = typeof atob === "function" ? function(asc) {
          return atob(_tidyB64(asc));
        } : _hasBuffer ? function(asc) {
          return Buffer.from(asc, "base64").toString("binary");
        } : atobPolyfill;
        var _toUint8Array = _hasBuffer ? function(a) {
          return _U8Afrom(Buffer.from(a, "base64"));
        } : function(a) {
          return _U8Afrom(_atob(a).split("").map(function(c) {
            return c.charCodeAt(0);
          }));
        };
        var toUint8Array = function(a) {
          return _toUint8Array(_unURI(a));
        };
        var _decode = _hasBuffer ? function(a) {
          return Buffer.from(a, "base64").toString("utf8");
        } : _TD ? function(a) {
          return _TD.decode(_toUint8Array(a));
        } : function(a) {
          return btou(_atob(a));
        };
        var _unURI = function(a) {
          return _tidyB64(a.replace(/[-_]/g, function(m0) {
            return m0 == "-" ? "+" : "/";
          }));
        };
        var decode = function(src) {
          return _decode(_unURI(src));
        };
        var isValid = function(src) {
          if (typeof src !== "string")
            return false;
          var s = src.replace(/\s+/g, "").replace(/={0,2}$/, "");
          return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
        };
        var _noEnum = function(v) {
          return {
            value: v,
            enumerable: false,
            writable: true,
            configurable: true
          };
        };
        var extendString = function() {
          var _add = function(name, body) {
            return Object.defineProperty(String.prototype, name, _noEnum(body));
          };
          _add("fromBase64", function() {
            return decode(this);
          });
          _add("toBase64", function(urlsafe) {
            return encode(this, urlsafe);
          });
          _add("toBase64URI", function() {
            return encode(this, true);
          });
          _add("toBase64URL", function() {
            return encode(this, true);
          });
          _add("toUint8Array", function() {
            return toUint8Array(this);
          });
        };
        var extendUint8Array = function() {
          var _add = function(name, body) {
            return Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
          };
          _add("toBase64", function(urlsafe) {
            return fromUint8Array(this, urlsafe);
          });
          _add("toBase64URI", function() {
            return fromUint8Array(this, true);
          });
          _add("toBase64URL", function() {
            return fromUint8Array(this, true);
          });
        };
        var extendBuiltins = function() {
          extendString();
          extendUint8Array();
        };
        var gBase64 = {
          version,
          VERSION,
          atob: _atob,
          atobPolyfill,
          btoa: _btoa,
          btoaPolyfill,
          fromBase64: decode,
          toBase64: encode,
          encode,
          encodeURI,
          encodeURL: encodeURI,
          utob,
          btou,
          decode,
          isValid,
          fromUint8Array,
          toUint8Array,
          extendString,
          extendUint8Array,
          extendBuiltins
        };
        gBase64.Base64 = {};
        Object.keys(gBase64).forEach(function(k) {
          return gBase64.Base64[k] = gBase64[k];
        });
        return gBase64;
      });
    }
  });

  // node_modules/crypt/crypt.js
  var require_crypt = __commonJS({
    "node_modules/crypt/crypt.js"(exports, module) {
      (function() {
        var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", crypt = {
          // Bit-wise rotation left
          rotl: function(n, b) {
            return n << b | n >>> 32 - b;
          },
          // Bit-wise rotation right
          rotr: function(n, b) {
            return n << 32 - b | n >>> b;
          },
          // Swap big-endian to little-endian and vice versa
          endian: function(n) {
            if (n.constructor == Number) {
              return crypt.rotl(n, 8) & 16711935 | crypt.rotl(n, 24) & 4278255360;
            }
            for (var i = 0; i < n.length; i++)
              n[i] = crypt.endian(n[i]);
            return n;
          },
          // Generate an array of any length of random bytes
          randomBytes: function(n) {
            for (var bytes = []; n > 0; n--)
              bytes.push(Math.floor(Math.random() * 256));
            return bytes;
          },
          // Convert a byte array to big-endian 32-bit words
          bytesToWords: function(bytes) {
            for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
              words[b >>> 5] |= bytes[i] << 24 - b % 32;
            return words;
          },
          // Convert big-endian 32-bit words to a byte array
          wordsToBytes: function(words) {
            for (var bytes = [], b = 0; b < words.length * 32; b += 8)
              bytes.push(words[b >>> 5] >>> 24 - b % 32 & 255);
            return bytes;
          },
          // Convert a byte array to a hex string
          bytesToHex: function(bytes) {
            for (var hex = [], i = 0; i < bytes.length; i++) {
              hex.push((bytes[i] >>> 4).toString(16));
              hex.push((bytes[i] & 15).toString(16));
            }
            return hex.join("");
          },
          // Convert a hex string to a byte array
          hexToBytes: function(hex) {
            for (var bytes = [], c = 0; c < hex.length; c += 2)
              bytes.push(parseInt(hex.substr(c, 2), 16));
            return bytes;
          },
          // Convert a byte array to a base-64 string
          bytesToBase64: function(bytes) {
            for (var base64 = [], i = 0; i < bytes.length; i += 3) {
              var triplet = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
              for (var j = 0; j < 4; j++)
                if (i * 8 + j * 6 <= bytes.length * 8)
                  base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 63));
                else
                  base64.push("=");
            }
            return base64.join("");
          },
          // Convert a base-64 string to a byte array
          base64ToBytes: function(base64) {
            base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");
            for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
              if (imod4 == 0) continue;
              bytes.push((base64map.indexOf(base64.charAt(i - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << imod4 * 2 | base64map.indexOf(base64.charAt(i)) >>> 6 - imod4 * 2);
            }
            return bytes;
          }
        };
        module.exports = crypt;
      })();
    }
  });

  // node_modules/charenc/charenc.js
  var require_charenc = __commonJS({
    "node_modules/charenc/charenc.js"(exports, module) {
      var charenc = {
        // UTF-8 encoding
        utf8: {
          // Convert a string to a byte array
          stringToBytes: function(str) {
            return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
          },
          // Convert a byte array to a string
          bytesToString: function(bytes) {
            return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
          }
        },
        // Binary encoding
        bin: {
          // Convert a string to a byte array
          stringToBytes: function(str) {
            for (var bytes = [], i = 0; i < str.length; i++)
              bytes.push(str.charCodeAt(i) & 255);
            return bytes;
          },
          // Convert a byte array to a string
          bytesToString: function(bytes) {
            for (var str = [], i = 0; i < bytes.length; i++)
              str.push(String.fromCharCode(bytes[i]));
            return str.join("");
          }
        }
      };
      module.exports = charenc;
    }
  });

  // node_modules/is-buffer/index.js
  var require_is_buffer = __commonJS({
    "node_modules/is-buffer/index.js"(exports, module) {
      module.exports = function(obj) {
        return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
      };
      function isBuffer(obj) {
        return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
      }
      function isSlowBuffer(obj) {
        return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isBuffer(obj.slice(0, 0));
      }
    }
  });

  // node_modules/md5/md5.js
  var require_md5 = __commonJS({
    "node_modules/md5/md5.js"(exports, module) {
      (function() {
        var crypt = require_crypt(), utf8 = require_charenc().utf8, isBuffer = require_is_buffer(), bin = require_charenc().bin, md5 = function(message, options) {
          if (message.constructor == String)
            if (options && options.encoding === "binary")
              message = bin.stringToBytes(message);
            else
              message = utf8.stringToBytes(message);
          else if (isBuffer(message))
            message = Array.prototype.slice.call(message, 0);
          else if (!Array.isArray(message) && message.constructor !== Uint8Array)
            message = message.toString();
          var m = crypt.bytesToWords(message), l = message.length * 8, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
          for (var i = 0; i < m.length; i++) {
            m[i] = (m[i] << 8 | m[i] >>> 24) & 16711935 | (m[i] << 24 | m[i] >>> 8) & 4278255360;
          }
          m[l >>> 5] |= 128 << l % 32;
          m[(l + 64 >>> 9 << 4) + 14] = l;
          var FF = md5._ff, GG = md5._gg, HH = md5._hh, II = md5._ii;
          for (var i = 0; i < m.length; i += 16) {
            var aa = a, bb = b, cc = c, dd = d;
            a = FF(a, b, c, d, m[i + 0], 7, -680876936);
            d = FF(d, a, b, c, m[i + 1], 12, -389564586);
            c = FF(c, d, a, b, m[i + 2], 17, 606105819);
            b = FF(b, c, d, a, m[i + 3], 22, -1044525330);
            a = FF(a, b, c, d, m[i + 4], 7, -176418897);
            d = FF(d, a, b, c, m[i + 5], 12, 1200080426);
            c = FF(c, d, a, b, m[i + 6], 17, -1473231341);
            b = FF(b, c, d, a, m[i + 7], 22, -45705983);
            a = FF(a, b, c, d, m[i + 8], 7, 1770035416);
            d = FF(d, a, b, c, m[i + 9], 12, -1958414417);
            c = FF(c, d, a, b, m[i + 10], 17, -42063);
            b = FF(b, c, d, a, m[i + 11], 22, -1990404162);
            a = FF(a, b, c, d, m[i + 12], 7, 1804603682);
            d = FF(d, a, b, c, m[i + 13], 12, -40341101);
            c = FF(c, d, a, b, m[i + 14], 17, -1502002290);
            b = FF(b, c, d, a, m[i + 15], 22, 1236535329);
            a = GG(a, b, c, d, m[i + 1], 5, -165796510);
            d = GG(d, a, b, c, m[i + 6], 9, -1069501632);
            c = GG(c, d, a, b, m[i + 11], 14, 643717713);
            b = GG(b, c, d, a, m[i + 0], 20, -373897302);
            a = GG(a, b, c, d, m[i + 5], 5, -701558691);
            d = GG(d, a, b, c, m[i + 10], 9, 38016083);
            c = GG(c, d, a, b, m[i + 15], 14, -660478335);
            b = GG(b, c, d, a, m[i + 4], 20, -405537848);
            a = GG(a, b, c, d, m[i + 9], 5, 568446438);
            d = GG(d, a, b, c, m[i + 14], 9, -1019803690);
            c = GG(c, d, a, b, m[i + 3], 14, -187363961);
            b = GG(b, c, d, a, m[i + 8], 20, 1163531501);
            a = GG(a, b, c, d, m[i + 13], 5, -1444681467);
            d = GG(d, a, b, c, m[i + 2], 9, -51403784);
            c = GG(c, d, a, b, m[i + 7], 14, 1735328473);
            b = GG(b, c, d, a, m[i + 12], 20, -1926607734);
            a = HH(a, b, c, d, m[i + 5], 4, -378558);
            d = HH(d, a, b, c, m[i + 8], 11, -2022574463);
            c = HH(c, d, a, b, m[i + 11], 16, 1839030562);
            b = HH(b, c, d, a, m[i + 14], 23, -35309556);
            a = HH(a, b, c, d, m[i + 1], 4, -1530992060);
            d = HH(d, a, b, c, m[i + 4], 11, 1272893353);
            c = HH(c, d, a, b, m[i + 7], 16, -155497632);
            b = HH(b, c, d, a, m[i + 10], 23, -1094730640);
            a = HH(a, b, c, d, m[i + 13], 4, 681279174);
            d = HH(d, a, b, c, m[i + 0], 11, -358537222);
            c = HH(c, d, a, b, m[i + 3], 16, -722521979);
            b = HH(b, c, d, a, m[i + 6], 23, 76029189);
            a = HH(a, b, c, d, m[i + 9], 4, -640364487);
            d = HH(d, a, b, c, m[i + 12], 11, -421815835);
            c = HH(c, d, a, b, m[i + 15], 16, 530742520);
            b = HH(b, c, d, a, m[i + 2], 23, -995338651);
            a = II(a, b, c, d, m[i + 0], 6, -198630844);
            d = II(d, a, b, c, m[i + 7], 10, 1126891415);
            c = II(c, d, a, b, m[i + 14], 15, -1416354905);
            b = II(b, c, d, a, m[i + 5], 21, -57434055);
            a = II(a, b, c, d, m[i + 12], 6, 1700485571);
            d = II(d, a, b, c, m[i + 3], 10, -1894986606);
            c = II(c, d, a, b, m[i + 10], 15, -1051523);
            b = II(b, c, d, a, m[i + 1], 21, -2054922799);
            a = II(a, b, c, d, m[i + 8], 6, 1873313359);
            d = II(d, a, b, c, m[i + 15], 10, -30611744);
            c = II(c, d, a, b, m[i + 6], 15, -1560198380);
            b = II(b, c, d, a, m[i + 13], 21, 1309151649);
            a = II(a, b, c, d, m[i + 4], 6, -145523070);
            d = II(d, a, b, c, m[i + 11], 10, -1120210379);
            c = II(c, d, a, b, m[i + 2], 15, 718787259);
            b = II(b, c, d, a, m[i + 9], 21, -343485551);
            a = a + aa >>> 0;
            b = b + bb >>> 0;
            c = c + cc >>> 0;
            d = d + dd >>> 0;
          }
          return crypt.endian([a, b, c, d]);
        };
        md5._ff = function(a, b, c, d, x, s, t) {
          var n = a + (b & c | ~b & d) + (x >>> 0) + t;
          return (n << s | n >>> 32 - s) + b;
        };
        md5._gg = function(a, b, c, d, x, s, t) {
          var n = a + (b & d | c & ~d) + (x >>> 0) + t;
          return (n << s | n >>> 32 - s) + b;
        };
        md5._hh = function(a, b, c, d, x, s, t) {
          var n = a + (b ^ c ^ d) + (x >>> 0) + t;
          return (n << s | n >>> 32 - s) + b;
        };
        md5._ii = function(a, b, c, d, x, s, t) {
          var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
          return (n << s | n >>> 32 - s) + b;
        };
        md5._blocksize = 16;
        md5._digestsize = 16;
        module.exports = function(message, options) {
          if (message === void 0 || message === null)
            throw new Error("Illegal argument " + message);
          var digestbytes = crypt.wordsToBytes(md5(message, options));
          return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt.bytesToHex(digestbytes);
        };
      })();
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/obfuscation.js
  var require_obfuscation = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/obfuscation.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.decodeBase64 = exports.encodeBase64 = exports.getMD5Hash = void 0;
      var base64 = require_base64();
      var md5 = require_md5();
      function getMD5Hash(input) {
        return md5(input);
      }
      exports.getMD5Hash = getMD5Hash;
      function encodeBase64(input) {
        return base64.btoaPolyfill(input);
      }
      exports.encodeBase64 = encodeBase64;
      function decodeBase64(input) {
        return base64.atobPolyfill(input);
      }
      exports.decodeBase64 = decodeBase64;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/assignment-cache.js
  var require_assignment_cache = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/assignment-cache.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.LRUInMemoryAssignmentCache = exports.NonExpiringInMemoryAssignmentCache = exports.AssignmentCache = void 0;
      var lru_cache_1 = require_lru_cache();
      var obfuscation_1 = require_obfuscation();
      var AssignmentCache = class {
        constructor(cacheInstance) {
          this.cache = cacheInstance;
        }
        hasLoggedAssignment(key) {
          if (!this.cache.has(this.getCacheKey(key))) {
            return false;
          }
          if (this.cache.get(this.getCacheKey(key)) !== (0, obfuscation_1.getMD5Hash)(key.variationKey)) {
            return false;
          }
          return true;
        }
        setLastLoggedAssignment(key) {
          this.cache.set(this.getCacheKey(key), (0, obfuscation_1.getMD5Hash)(key.variationKey));
        }
        getCacheKey({ subjectKey, flagKey, allocationKey }) {
          return [`subject:${subjectKey}`, `flag:${flagKey}`, `allocation:${allocationKey}`].join(";");
        }
      };
      exports.AssignmentCache = AssignmentCache;
      var NonExpiringInMemoryAssignmentCache = class extends AssignmentCache {
        constructor() {
          super(/* @__PURE__ */ new Map());
        }
      };
      exports.NonExpiringInMemoryAssignmentCache = NonExpiringInMemoryAssignmentCache;
      var LRUInMemoryAssignmentCache = class extends AssignmentCache {
        constructor(maxSize) {
          super(new lru_cache_1.LRUCache(maxSize));
        }
      };
      exports.LRUInMemoryAssignmentCache = LRUInMemoryAssignmentCache;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/api-endpoints.js
  var require_api_endpoints = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/api-endpoints.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var UFC_ENDPOINT = "/flag-config/v1/config";
      var ApiEndpoints = class {
        constructor(baseUrl, queryParams) {
          this.baseUrl = baseUrl;
          this.queryParams = queryParams;
        }
        endpoint(resource) {
          const url = new URL(this.baseUrl + resource);
          Object.entries(this.queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
          return url;
        }
        ufcEndpoint() {
          return this.endpoint(UFC_ENDPOINT);
        }
      };
      exports.default = ApiEndpoints;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/constants.js
  var require_constants = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/constants.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.MAX_EVENT_QUEUE_SIZE = exports.NULL_SENTINEL = exports.SESSION_ASSIGNMENT_CONFIG_LOADED = exports.BASE_URL = exports.DEFAULT_POLL_CONFIG_REQUEST_RETRIES = exports.DEFAULT_INITIAL_CONFIG_REQUEST_RETRIES = exports.POLL_JITTER_PCT = exports.POLL_INTERVAL_MS = exports.REQUEST_TIMEOUT_MILLIS = exports.DEFAULT_REQUEST_TIMEOUT_MS = void 0;
      exports.DEFAULT_REQUEST_TIMEOUT_MS = 5e3;
      exports.REQUEST_TIMEOUT_MILLIS = exports.DEFAULT_REQUEST_TIMEOUT_MS;
      exports.POLL_INTERVAL_MS = 3e4;
      exports.POLL_JITTER_PCT = 0.1;
      exports.DEFAULT_INITIAL_CONFIG_REQUEST_RETRIES = 1;
      exports.DEFAULT_POLL_CONFIG_REQUEST_RETRIES = 7;
      exports.BASE_URL = "https://fscdn.eppo.cloud/api";
      exports.SESSION_ASSIGNMENT_CONFIG_LOADED = "eppo-session-assignment-config-loaded";
      exports.NULL_SENTINEL = "EPPO_NULL";
      exports.MAX_EVENT_QUEUE_SIZE = 100;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/interfaces.js
  var require_interfaces = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/interfaces.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.VariationType = void 0;
      var VariationType;
      (function(VariationType2) {
        VariationType2["STRING"] = "STRING";
        VariationType2["INTEGER"] = "INTEGER";
        VariationType2["NUMERIC"] = "NUMERIC";
        VariationType2["BOOLEAN"] = "BOOLEAN";
        VariationType2["JSON"] = "JSON";
      })(VariationType = exports.VariationType || (exports.VariationType = {}));
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/decoding.js
  var require_decoding = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/decoding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.decodeObject = exports.decodeShard = exports.decodeSplit = exports.decodeAllocation = exports.decodeValue = exports.decodeVariations = exports.decodeFlag = void 0;
      var interfaces_1 = require_interfaces();
      var obfuscation_1 = require_obfuscation();
      function decodeFlag(flag) {
        return Object.assign(Object.assign({}, flag), { variations: decodeVariations(flag.variations, flag.variationType), allocations: flag.allocations.map(decodeAllocation) });
      }
      exports.decodeFlag = decodeFlag;
      function decodeVariations(variations, variationType) {
        return Object.fromEntries(Object.entries(variations).map(([, variation]) => {
          const decodedKey = (0, obfuscation_1.decodeBase64)(variation.key);
          return [decodedKey, { key: decodedKey, value: decodeValue(variation.value, variationType) }];
        }));
      }
      exports.decodeVariations = decodeVariations;
      function decodeValue(encodedValue, type) {
        switch (type) {
          case interfaces_1.VariationType.INTEGER:
          case interfaces_1.VariationType.NUMERIC:
            return Number((0, obfuscation_1.decodeBase64)(encodedValue));
          case interfaces_1.VariationType.BOOLEAN:
            return (0, obfuscation_1.decodeBase64)(encodedValue) === "true";
          default:
            return (0, obfuscation_1.decodeBase64)(encodedValue);
        }
      }
      exports.decodeValue = decodeValue;
      function decodeAllocation(allocation) {
        return Object.assign(Object.assign({}, allocation), { key: (0, obfuscation_1.decodeBase64)(allocation.key), splits: allocation.splits.map(decodeSplit), startAt: allocation.startAt ? new Date((0, obfuscation_1.decodeBase64)(allocation.startAt)).toISOString() : void 0, endAt: allocation.endAt ? new Date((0, obfuscation_1.decodeBase64)(allocation.endAt)).toISOString() : void 0 });
      }
      exports.decodeAllocation = decodeAllocation;
      function decodeSplit(split) {
        return {
          extraLogging: split.extraLogging ? decodeObject(split.extraLogging) : void 0,
          variationKey: (0, obfuscation_1.decodeBase64)(split.variationKey),
          shards: split.shards.map(decodeShard)
        };
      }
      exports.decodeSplit = decodeSplit;
      function decodeShard(shard) {
        return Object.assign(Object.assign({}, shard), { salt: (0, obfuscation_1.decodeBase64)(shard.salt) });
      }
      exports.decodeShard = decodeShard;
      function decodeObject(obj) {
        return Object.fromEntries(Object.entries(obj).map(([key, value]) => [(0, obfuscation_1.decodeBase64)(key), (0, obfuscation_1.decodeBase64)(value)]));
      }
      exports.decodeObject = decodeObject;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/eppo_value.js
  var require_eppo_value = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/eppo_value.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.EppoValue = exports.EppoValueType = void 0;
      var interfaces_1 = require_interfaces();
      var obfuscation_1 = require_obfuscation();
      var EppoValueType;
      (function(EppoValueType2) {
        EppoValueType2[EppoValueType2["NullType"] = 0] = "NullType";
        EppoValueType2[EppoValueType2["BoolType"] = 1] = "BoolType";
        EppoValueType2[EppoValueType2["NumericType"] = 2] = "NumericType";
        EppoValueType2[EppoValueType2["StringType"] = 3] = "StringType";
        EppoValueType2[EppoValueType2["JSONType"] = 4] = "JSONType";
      })(EppoValueType = exports.EppoValueType || (exports.EppoValueType = {}));
      var EppoValue = class _EppoValue {
        constructor(valueType, boolValue, numericValue, stringValue, objectValue) {
          this.valueType = valueType;
          this.boolValue = boolValue;
          this.numericValue = numericValue;
          this.stringValue = stringValue;
          this.objectValue = objectValue;
        }
        static valueOf(value, valueType) {
          if (value == null) {
            return _EppoValue.Null();
          }
          switch (valueType) {
            case interfaces_1.VariationType.BOOLEAN:
              return _EppoValue.Bool(value);
            case interfaces_1.VariationType.NUMERIC:
              return _EppoValue.Numeric(value);
            case interfaces_1.VariationType.INTEGER:
              return _EppoValue.Numeric(value);
            case interfaces_1.VariationType.STRING:
              return _EppoValue.String(value);
            case interfaces_1.VariationType.JSON:
              return _EppoValue.JSON(value);
            default:
              return _EppoValue.String(value);
          }
        }
        toString() {
          var _a, _b, _c;
          switch (this.valueType) {
            case EppoValueType.NullType:
              return "null";
            case EppoValueType.BoolType:
              return this.boolValue ? "true" : "false";
            case EppoValueType.NumericType:
              return this.numericValue ? this.numericValue.toString() : "0";
            case EppoValueType.StringType:
              return (_a = this.stringValue) !== null && _a !== void 0 ? _a : "";
            case EppoValueType.JSONType:
              try {
                return (_b = JSON.stringify(this.objectValue)) !== null && _b !== void 0 ? _b : "";
              } catch (_d) {
                return (_c = this.stringValue) !== null && _c !== void 0 ? _c : "";
              }
          }
        }
        /**
         * Useful when storing or transmitting the entire value,
         * in particular the JsonType, is not desired.
         *
         * @returns MD5 hashed string of the value
         */
        toHashedString() {
          const value = this.toString();
          return (0, obfuscation_1.getMD5Hash)(value);
        }
        static Bool(value) {
          return new _EppoValue(EppoValueType.BoolType, value, void 0, void 0, void 0);
        }
        static Numeric(value) {
          return new _EppoValue(EppoValueType.NumericType, void 0, value, void 0, void 0);
        }
        static String(value) {
          return new _EppoValue(EppoValueType.StringType, void 0, void 0, value, void 0);
        }
        static JSON(value) {
          return new _EppoValue(EppoValueType.JSONType, void 0, void 0, void 0, typeof value === "string" ? JSON.parse(value) : value);
        }
        static Null() {
          return new _EppoValue(EppoValueType.NullType, void 0, void 0, void 0, void 0);
        }
      };
      exports.EppoValue = EppoValue;
    }
  });

  // node_modules/semver/internal/constants.js
  var require_constants2 = __commonJS({
    "node_modules/semver/internal/constants.js"(exports, module) {
      var SEMVER_SPEC_VERSION = "2.0.0";
      var MAX_LENGTH = 256;
      var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
          9007199254740991;
      var MAX_SAFE_COMPONENT_LENGTH = 16;
      var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
      var RELEASE_TYPES = [
        "major",
        "premajor",
        "minor",
        "preminor",
        "patch",
        "prepatch",
        "prerelease"
      ];
      module.exports = {
        MAX_LENGTH,
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_SAFE_INTEGER,
        RELEASE_TYPES,
        SEMVER_SPEC_VERSION,
        FLAG_INCLUDE_PRERELEASE: 1,
        FLAG_LOOSE: 2
      };
    }
  });

  // node_modules/semver/internal/debug.js
  var require_debug = __commonJS({
    "node_modules/semver/internal/debug.js"(exports, module) {
      var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
      };
      module.exports = debug;
    }
  });

  // node_modules/semver/internal/re.js
  var require_re = __commonJS({
    "node_modules/semver/internal/re.js"(exports, module) {
      var {
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_LENGTH
      } = require_constants2();
      var debug = require_debug();
      exports = module.exports = {};
      var re = exports.re = [];
      var safeRe = exports.safeRe = [];
      var src = exports.src = [];
      var t = exports.t = {};
      var R = 0;
      var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
      var safeRegexReplacements = [
        ["\\s", 1],
        ["\\d", MAX_LENGTH],
        [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
      ];
      var makeSafeRegex = (value) => {
        for (const [token, max] of safeRegexReplacements) {
          value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
        }
        return value;
      };
      var createToken = (name, value, isGlobal) => {
        const safe = makeSafeRegex(value);
        const index = R++;
        debug(name, index, value);
        t[name] = index;
        src[index] = value;
        re[index] = new RegExp(value, isGlobal ? "g" : void 0);
        safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
      };
      createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
      createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
      createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
      createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
      createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
      createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
      createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
      createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
      createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
      createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
      createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
      createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
      createToken("FULL", `^${src[t.FULLPLAIN]}$`);
      createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
      createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
      createToken("GTLT", "((?:<|>)?=?)");
      createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
      createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
      createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
      createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
      createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
      createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("COERCE", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:$|[^\\d])`);
      createToken("COERCERTL", src[t.COERCE], true);
      createToken("LONETILDE", "(?:~>?)");
      createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
      exports.tildeTrimReplace = "$1~";
      createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
      createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("LONECARET", "(?:\\^)");
      createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
      exports.caretTrimReplace = "$1^";
      createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
      createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
      createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
      createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
      exports.comparatorTrimReplace = "$1$2$3";
      createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
      createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
      createToken("STAR", "(<|>)?=?\\s*\\*");
      createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
      createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
    }
  });

  // node_modules/semver/internal/parse-options.js
  var require_parse_options = __commonJS({
    "node_modules/semver/internal/parse-options.js"(exports, module) {
      var looseOption = Object.freeze({ loose: true });
      var emptyOpts = Object.freeze({});
      var parseOptions = (options) => {
        if (!options) {
          return emptyOpts;
        }
        if (typeof options !== "object") {
          return looseOption;
        }
        return options;
      };
      module.exports = parseOptions;
    }
  });

  // node_modules/semver/internal/identifiers.js
  var require_identifiers = __commonJS({
    "node_modules/semver/internal/identifiers.js"(exports, module) {
      var numeric = /^[0-9]+$/;
      var compareIdentifiers = (a, b) => {
        const anum = numeric.test(a);
        const bnum = numeric.test(b);
        if (anum && bnum) {
          a = +a;
          b = +b;
        }
        return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
      };
      var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
      module.exports = {
        compareIdentifiers,
        rcompareIdentifiers
      };
    }
  });

  // node_modules/semver/classes/semver.js
  var require_semver = __commonJS({
    "node_modules/semver/classes/semver.js"(exports, module) {
      var debug = require_debug();
      var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants2();
      var { safeRe: re, t } = require_re();
      var parseOptions = require_parse_options();
      var { compareIdentifiers } = require_identifiers();
      var SemVer = class _SemVer {
        constructor(version, options) {
          options = parseOptions(options);
          if (version instanceof _SemVer) {
            if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
              return version;
            } else {
              version = version.version;
            }
          } else if (typeof version !== "string") {
            throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
          }
          if (version.length > MAX_LENGTH) {
            throw new TypeError(
                `version is longer than ${MAX_LENGTH} characters`
            );
          }
          debug("SemVer", version, options);
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
          if (!m) {
            throw new TypeError(`Invalid Version: ${version}`);
          }
          this.raw = version;
          this.major = +m[1];
          this.minor = +m[2];
          this.patch = +m[3];
          if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
            throw new TypeError("Invalid major version");
          }
          if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
            throw new TypeError("Invalid minor version");
          }
          if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
            throw new TypeError("Invalid patch version");
          }
          if (!m[4]) {
            this.prerelease = [];
          } else {
            this.prerelease = m[4].split(".").map((id) => {
              if (/^[0-9]+$/.test(id)) {
                const num = +id;
                if (num >= 0 && num < MAX_SAFE_INTEGER) {
                  return num;
                }
              }
              return id;
            });
          }
          this.build = m[5] ? m[5].split(".") : [];
          this.format();
        }
        format() {
          this.version = `${this.major}.${this.minor}.${this.patch}`;
          if (this.prerelease.length) {
            this.version += `-${this.prerelease.join(".")}`;
          }
          return this.version;
        }
        toString() {
          return this.version;
        }
        compare(other) {
          debug("SemVer.compare", this.version, this.options, other);
          if (!(other instanceof _SemVer)) {
            if (typeof other === "string" && other === this.version) {
              return 0;
            }
            other = new _SemVer(other, this.options);
          }
          if (other.version === this.version) {
            return 0;
          }
          return this.compareMain(other) || this.comparePre(other);
        }
        compareMain(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
        }
        comparePre(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          if (this.prerelease.length && !other.prerelease.length) {
            return -1;
          } else if (!this.prerelease.length && other.prerelease.length) {
            return 1;
          } else if (!this.prerelease.length && !other.prerelease.length) {
            return 0;
          }
          let i = 0;
          do {
            const a = this.prerelease[i];
            const b = other.prerelease[i];
            debug("prerelease compare", i, a, b);
            if (a === void 0 && b === void 0) {
              return 0;
            } else if (b === void 0) {
              return 1;
            } else if (a === void 0) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        compareBuild(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          let i = 0;
          do {
            const a = this.build[i];
            const b = other.build[i];
            debug("prerelease compare", i, a, b);
            if (a === void 0 && b === void 0) {
              return 0;
            } else if (b === void 0) {
              return 1;
            } else if (a === void 0) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        // preminor will bump the version up to the next minor release, and immediately
        // down to pre-release. premajor and prepatch work the same way.
        inc(release, identifier, identifierBase) {
          switch (release) {
            case "premajor":
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor = 0;
              this.major++;
              this.inc("pre", identifier, identifierBase);
              break;
            case "preminor":
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor++;
              this.inc("pre", identifier, identifierBase);
              break;
            case "prepatch":
              this.prerelease.length = 0;
              this.inc("patch", identifier, identifierBase);
              this.inc("pre", identifier, identifierBase);
              break;
            case "prerelease":
              if (this.prerelease.length === 0) {
                this.inc("patch", identifier, identifierBase);
              }
              this.inc("pre", identifier, identifierBase);
              break;
            case "major":
              if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
                this.major++;
              }
              this.minor = 0;
              this.patch = 0;
              this.prerelease = [];
              break;
            case "minor":
              if (this.patch !== 0 || this.prerelease.length === 0) {
                this.minor++;
              }
              this.patch = 0;
              this.prerelease = [];
              break;
            case "patch":
              if (this.prerelease.length === 0) {
                this.patch++;
              }
              this.prerelease = [];
              break;
            case "pre": {
              const base = Number(identifierBase) ? 1 : 0;
              if (!identifier && identifierBase === false) {
                throw new Error("invalid increment argument: identifier is empty");
              }
              if (this.prerelease.length === 0) {
                this.prerelease = [base];
              } else {
                let i = this.prerelease.length;
                while (--i >= 0) {
                  if (typeof this.prerelease[i] === "number") {
                    this.prerelease[i]++;
                    i = -2;
                  }
                }
                if (i === -1) {
                  if (identifier === this.prerelease.join(".") && identifierBase === false) {
                    throw new Error("invalid increment argument: identifier already exists");
                  }
                  this.prerelease.push(base);
                }
              }
              if (identifier) {
                let prerelease = [identifier, base];
                if (identifierBase === false) {
                  prerelease = [identifier];
                }
                if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                  if (isNaN(this.prerelease[1])) {
                    this.prerelease = prerelease;
                  }
                } else {
                  this.prerelease = prerelease;
                }
              }
              break;
            }
            default:
              throw new Error(`invalid increment argument: ${release}`);
          }
          this.raw = this.format();
          if (this.build.length) {
            this.raw += `+${this.build.join(".")}`;
          }
          return this;
        }
      };
      module.exports = SemVer;
    }
  });

  // node_modules/semver/functions/parse.js
  var require_parse = __commonJS({
    "node_modules/semver/functions/parse.js"(exports, module) {
      var SemVer = require_semver();
      var parse = (version, options, throwErrors = false) => {
        if (version instanceof SemVer) {
          return version;
        }
        try {
          return new SemVer(version, options);
        } catch (er) {
          if (!throwErrors) {
            return null;
          }
          throw er;
        }
      };
      module.exports = parse;
    }
  });

  // node_modules/semver/functions/valid.js
  var require_valid = __commonJS({
    "node_modules/semver/functions/valid.js"(exports, module) {
      var parse = require_parse();
      var valid = (version, options) => {
        const v = parse(version, options);
        return v ? v.version : null;
      };
      module.exports = valid;
    }
  });

  // node_modules/semver/functions/clean.js
  var require_clean = __commonJS({
    "node_modules/semver/functions/clean.js"(exports, module) {
      var parse = require_parse();
      var clean = (version, options) => {
        const s = parse(version.trim().replace(/^[=v]+/, ""), options);
        return s ? s.version : null;
      };
      module.exports = clean;
    }
  });

  // node_modules/semver/functions/inc.js
  var require_inc = __commonJS({
    "node_modules/semver/functions/inc.js"(exports, module) {
      var SemVer = require_semver();
      var inc = (version, release, options, identifier, identifierBase) => {
        if (typeof options === "string") {
          identifierBase = identifier;
          identifier = options;
          options = void 0;
        }
        try {
          return new SemVer(
              version instanceof SemVer ? version.version : version,
              options
          ).inc(release, identifier, identifierBase).version;
        } catch (er) {
          return null;
        }
      };
      module.exports = inc;
    }
  });

  // node_modules/semver/functions/diff.js
  var require_diff = __commonJS({
    "node_modules/semver/functions/diff.js"(exports, module) {
      var parse = require_parse();
      var diff = (version1, version2) => {
        const v1 = parse(version1, null, true);
        const v2 = parse(version2, null, true);
        const comparison = v1.compare(v2);
        if (comparison === 0) {
          return null;
        }
        const v1Higher = comparison > 0;
        const highVersion = v1Higher ? v1 : v2;
        const lowVersion = v1Higher ? v2 : v1;
        const highHasPre = !!highVersion.prerelease.length;
        const lowHasPre = !!lowVersion.prerelease.length;
        if (lowHasPre && !highHasPre) {
          if (!lowVersion.patch && !lowVersion.minor) {
            return "major";
          }
          if (highVersion.patch) {
            return "patch";
          }
          if (highVersion.minor) {
            return "minor";
          }
          return "major";
        }
        const prefix = highHasPre ? "pre" : "";
        if (v1.major !== v2.major) {
          return prefix + "major";
        }
        if (v1.minor !== v2.minor) {
          return prefix + "minor";
        }
        if (v1.patch !== v2.patch) {
          return prefix + "patch";
        }
        return "prerelease";
      };
      module.exports = diff;
    }
  });

  // node_modules/semver/functions/major.js
  var require_major = __commonJS({
    "node_modules/semver/functions/major.js"(exports, module) {
      var SemVer = require_semver();
      var major = (a, loose) => new SemVer(a, loose).major;
      module.exports = major;
    }
  });

  // node_modules/semver/functions/minor.js
  var require_minor = __commonJS({
    "node_modules/semver/functions/minor.js"(exports, module) {
      var SemVer = require_semver();
      var minor = (a, loose) => new SemVer(a, loose).minor;
      module.exports = minor;
    }
  });

  // node_modules/semver/functions/patch.js
  var require_patch = __commonJS({
    "node_modules/semver/functions/patch.js"(exports, module) {
      var SemVer = require_semver();
      var patch = (a, loose) => new SemVer(a, loose).patch;
      module.exports = patch;
    }
  });

  // node_modules/semver/functions/prerelease.js
  var require_prerelease = __commonJS({
    "node_modules/semver/functions/prerelease.js"(exports, module) {
      var parse = require_parse();
      var prerelease = (version, options) => {
        const parsed = parse(version, options);
        return parsed && parsed.prerelease.length ? parsed.prerelease : null;
      };
      module.exports = prerelease;
    }
  });

  // node_modules/semver/functions/compare.js
  var require_compare = __commonJS({
    "node_modules/semver/functions/compare.js"(exports, module) {
      var SemVer = require_semver();
      var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
      module.exports = compare;
    }
  });

  // node_modules/semver/functions/rcompare.js
  var require_rcompare = __commonJS({
    "node_modules/semver/functions/rcompare.js"(exports, module) {
      var compare = require_compare();
      var rcompare = (a, b, loose) => compare(b, a, loose);
      module.exports = rcompare;
    }
  });

  // node_modules/semver/functions/compare-loose.js
  var require_compare_loose = __commonJS({
    "node_modules/semver/functions/compare-loose.js"(exports, module) {
      var compare = require_compare();
      var compareLoose = (a, b) => compare(a, b, true);
      module.exports = compareLoose;
    }
  });

  // node_modules/semver/functions/compare-build.js
  var require_compare_build = __commonJS({
    "node_modules/semver/functions/compare-build.js"(exports, module) {
      var SemVer = require_semver();
      var compareBuild = (a, b, loose) => {
        const versionA = new SemVer(a, loose);
        const versionB = new SemVer(b, loose);
        return versionA.compare(versionB) || versionA.compareBuild(versionB);
      };
      module.exports = compareBuild;
    }
  });

  // node_modules/semver/functions/sort.js
  var require_sort = __commonJS({
    "node_modules/semver/functions/sort.js"(exports, module) {
      var compareBuild = require_compare_build();
      var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
      module.exports = sort;
    }
  });

  // node_modules/semver/functions/rsort.js
  var require_rsort = __commonJS({
    "node_modules/semver/functions/rsort.js"(exports, module) {
      var compareBuild = require_compare_build();
      var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
      module.exports = rsort;
    }
  });

  // node_modules/semver/functions/gt.js
  var require_gt = __commonJS({
    "node_modules/semver/functions/gt.js"(exports, module) {
      var compare = require_compare();
      var gt = (a, b, loose) => compare(a, b, loose) > 0;
      module.exports = gt;
    }
  });

  // node_modules/semver/functions/lt.js
  var require_lt = __commonJS({
    "node_modules/semver/functions/lt.js"(exports, module) {
      var compare = require_compare();
      var lt = (a, b, loose) => compare(a, b, loose) < 0;
      module.exports = lt;
    }
  });

  // node_modules/semver/functions/eq.js
  var require_eq = __commonJS({
    "node_modules/semver/functions/eq.js"(exports, module) {
      var compare = require_compare();
      var eq = (a, b, loose) => compare(a, b, loose) === 0;
      module.exports = eq;
    }
  });

  // node_modules/semver/functions/neq.js
  var require_neq = __commonJS({
    "node_modules/semver/functions/neq.js"(exports, module) {
      var compare = require_compare();
      var neq = (a, b, loose) => compare(a, b, loose) !== 0;
      module.exports = neq;
    }
  });

  // node_modules/semver/functions/gte.js
  var require_gte = __commonJS({
    "node_modules/semver/functions/gte.js"(exports, module) {
      var compare = require_compare();
      var gte = (a, b, loose) => compare(a, b, loose) >= 0;
      module.exports = gte;
    }
  });

  // node_modules/semver/functions/lte.js
  var require_lte = __commonJS({
    "node_modules/semver/functions/lte.js"(exports, module) {
      var compare = require_compare();
      var lte = (a, b, loose) => compare(a, b, loose) <= 0;
      module.exports = lte;
    }
  });

  // node_modules/semver/functions/cmp.js
  var require_cmp = __commonJS({
    "node_modules/semver/functions/cmp.js"(exports, module) {
      var eq = require_eq();
      var neq = require_neq();
      var gt = require_gt();
      var gte = require_gte();
      var lt = require_lt();
      var lte = require_lte();
      var cmp = (a, op, b, loose) => {
        switch (op) {
          case "===":
            if (typeof a === "object") {
              a = a.version;
            }
            if (typeof b === "object") {
              b = b.version;
            }
            return a === b;
          case "!==":
            if (typeof a === "object") {
              a = a.version;
            }
            if (typeof b === "object") {
              b = b.version;
            }
            return a !== b;
          case "":
          case "=":
          case "==":
            return eq(a, b, loose);
          case "!=":
            return neq(a, b, loose);
          case ">":
            return gt(a, b, loose);
          case ">=":
            return gte(a, b, loose);
          case "<":
            return lt(a, b, loose);
          case "<=":
            return lte(a, b, loose);
          default:
            throw new TypeError(`Invalid operator: ${op}`);
        }
      };
      module.exports = cmp;
    }
  });

  // node_modules/semver/functions/coerce.js
  var require_coerce = __commonJS({
    "node_modules/semver/functions/coerce.js"(exports, module) {
      var SemVer = require_semver();
      var parse = require_parse();
      var { safeRe: re, t } = require_re();
      var coerce = (version, options) => {
        if (version instanceof SemVer) {
          return version;
        }
        if (typeof version === "number") {
          version = String(version);
        }
        if (typeof version !== "string") {
          return null;
        }
        options = options || {};
        let match = null;
        if (!options.rtl) {
          match = version.match(re[t.COERCE]);
        } else {
          let next;
          while ((next = re[t.COERCERTL].exec(version)) && (!match || match.index + match[0].length !== version.length)) {
            if (!match || next.index + next[0].length !== match.index + match[0].length) {
              match = next;
            }
            re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
          }
          re[t.COERCERTL].lastIndex = -1;
        }
        if (match === null) {
          return null;
        }
        return parse(`${match[2]}.${match[3] || "0"}.${match[4] || "0"}`, options);
      };
      module.exports = coerce;
    }
  });

  // node_modules/yallist/iterator.js
  var require_iterator = __commonJS({
    "node_modules/yallist/iterator.js"(exports, module) {
      "use strict";
      module.exports = function(Yallist) {
        Yallist.prototype[Symbol.iterator] = function* () {
          for (let walker = this.head; walker; walker = walker.next) {
            yield walker.value;
          }
        };
      };
    }
  });

  // node_modules/yallist/yallist.js
  var require_yallist = __commonJS({
    "node_modules/yallist/yallist.js"(exports, module) {
      "use strict";
      module.exports = Yallist;
      Yallist.Node = Node;
      Yallist.create = Yallist;
      function Yallist(list) {
        var self2 = this;
        if (!(self2 instanceof Yallist)) {
          self2 = new Yallist();
        }
        self2.tail = null;
        self2.head = null;
        self2.length = 0;
        if (list && typeof list.forEach === "function") {
          list.forEach(function(item) {
            self2.push(item);
          });
        } else if (arguments.length > 0) {
          for (var i = 0, l = arguments.length; i < l; i++) {
            self2.push(arguments[i]);
          }
        }
        return self2;
      }
      Yallist.prototype.removeNode = function(node) {
        if (node.list !== this) {
          throw new Error("removing node which does not belong to this list");
        }
        var next = node.next;
        var prev = node.prev;
        if (next) {
          next.prev = prev;
        }
        if (prev) {
          prev.next = next;
        }
        if (node === this.head) {
          this.head = next;
        }
        if (node === this.tail) {
          this.tail = prev;
        }
        node.list.length--;
        node.next = null;
        node.prev = null;
        node.list = null;
        return next;
      };
      Yallist.prototype.unshiftNode = function(node) {
        if (node === this.head) {
          return;
        }
        if (node.list) {
          node.list.removeNode(node);
        }
        var head = this.head;
        node.list = this;
        node.next = head;
        if (head) {
          head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
          this.tail = node;
        }
        this.length++;
      };
      Yallist.prototype.pushNode = function(node) {
        if (node === this.tail) {
          return;
        }
        if (node.list) {
          node.list.removeNode(node);
        }
        var tail = this.tail;
        node.list = this;
        node.prev = tail;
        if (tail) {
          tail.next = node;
        }
        this.tail = node;
        if (!this.head) {
          this.head = node;
        }
        this.length++;
      };
      Yallist.prototype.push = function() {
        for (var i = 0, l = arguments.length; i < l; i++) {
          push(this, arguments[i]);
        }
        return this.length;
      };
      Yallist.prototype.unshift = function() {
        for (var i = 0, l = arguments.length; i < l; i++) {
          unshift(this, arguments[i]);
        }
        return this.length;
      };
      Yallist.prototype.pop = function() {
        if (!this.tail) {
          return void 0;
        }
        var res = this.tail.value;
        this.tail = this.tail.prev;
        if (this.tail) {
          this.tail.next = null;
        } else {
          this.head = null;
        }
        this.length--;
        return res;
      };
      Yallist.prototype.shift = function() {
        if (!this.head) {
          return void 0;
        }
        var res = this.head.value;
        this.head = this.head.next;
        if (this.head) {
          this.head.prev = null;
        } else {
          this.tail = null;
        }
        this.length--;
        return res;
      };
      Yallist.prototype.forEach = function(fn, thisp) {
        thisp = thisp || this;
        for (var walker = this.head, i = 0; walker !== null; i++) {
          fn.call(thisp, walker.value, i, this);
          walker = walker.next;
        }
      };
      Yallist.prototype.forEachReverse = function(fn, thisp) {
        thisp = thisp || this;
        for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
          fn.call(thisp, walker.value, i, this);
          walker = walker.prev;
        }
      };
      Yallist.prototype.get = function(n) {
        for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
          walker = walker.next;
        }
        if (i === n && walker !== null) {
          return walker.value;
        }
      };
      Yallist.prototype.getReverse = function(n) {
        for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
          walker = walker.prev;
        }
        if (i === n && walker !== null) {
          return walker.value;
        }
      };
      Yallist.prototype.map = function(fn, thisp) {
        thisp = thisp || this;
        var res = new Yallist();
        for (var walker = this.head; walker !== null; ) {
          res.push(fn.call(thisp, walker.value, this));
          walker = walker.next;
        }
        return res;
      };
      Yallist.prototype.mapReverse = function(fn, thisp) {
        thisp = thisp || this;
        var res = new Yallist();
        for (var walker = this.tail; walker !== null; ) {
          res.push(fn.call(thisp, walker.value, this));
          walker = walker.prev;
        }
        return res;
      };
      Yallist.prototype.reduce = function(fn, initial) {
        var acc;
        var walker = this.head;
        if (arguments.length > 1) {
          acc = initial;
        } else if (this.head) {
          walker = this.head.next;
          acc = this.head.value;
        } else {
          throw new TypeError("Reduce of empty list with no initial value");
        }
        for (var i = 0; walker !== null; i++) {
          acc = fn(acc, walker.value, i);
          walker = walker.next;
        }
        return acc;
      };
      Yallist.prototype.reduceReverse = function(fn, initial) {
        var acc;
        var walker = this.tail;
        if (arguments.length > 1) {
          acc = initial;
        } else if (this.tail) {
          walker = this.tail.prev;
          acc = this.tail.value;
        } else {
          throw new TypeError("Reduce of empty list with no initial value");
        }
        for (var i = this.length - 1; walker !== null; i--) {
          acc = fn(acc, walker.value, i);
          walker = walker.prev;
        }
        return acc;
      };
      Yallist.prototype.toArray = function() {
        var arr = new Array(this.length);
        for (var i = 0, walker = this.head; walker !== null; i++) {
          arr[i] = walker.value;
          walker = walker.next;
        }
        return arr;
      };
      Yallist.prototype.toArrayReverse = function() {
        var arr = new Array(this.length);
        for (var i = 0, walker = this.tail; walker !== null; i++) {
          arr[i] = walker.value;
          walker = walker.prev;
        }
        return arr;
      };
      Yallist.prototype.slice = function(from, to) {
        to = to || this.length;
        if (to < 0) {
          to += this.length;
        }
        from = from || 0;
        if (from < 0) {
          from += this.length;
        }
        var ret = new Yallist();
        if (to < from || to < 0) {
          return ret;
        }
        if (from < 0) {
          from = 0;
        }
        if (to > this.length) {
          to = this.length;
        }
        for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
          walker = walker.next;
        }
        for (; walker !== null && i < to; i++, walker = walker.next) {
          ret.push(walker.value);
        }
        return ret;
      };
      Yallist.prototype.sliceReverse = function(from, to) {
        to = to || this.length;
        if (to < 0) {
          to += this.length;
        }
        from = from || 0;
        if (from < 0) {
          from += this.length;
        }
        var ret = new Yallist();
        if (to < from || to < 0) {
          return ret;
        }
        if (from < 0) {
          from = 0;
        }
        if (to > this.length) {
          to = this.length;
        }
        for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
          walker = walker.prev;
        }
        for (; walker !== null && i > from; i--, walker = walker.prev) {
          ret.push(walker.value);
        }
        return ret;
      };
      Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
        if (start > this.length) {
          start = this.length - 1;
        }
        if (start < 0) {
          start = this.length + start;
        }
        for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
          walker = walker.next;
        }
        var ret = [];
        for (var i = 0; walker && i < deleteCount; i++) {
          ret.push(walker.value);
          walker = this.removeNode(walker);
        }
        if (walker === null) {
          walker = this.tail;
        }
        if (walker !== this.head && walker !== this.tail) {
          walker = walker.prev;
        }
        for (var i = 0; i < nodes.length; i++) {
          walker = insert(this, walker, nodes[i]);
        }
        return ret;
      };
      Yallist.prototype.reverse = function() {
        var head = this.head;
        var tail = this.tail;
        for (var walker = head; walker !== null; walker = walker.prev) {
          var p = walker.prev;
          walker.prev = walker.next;
          walker.next = p;
        }
        this.head = tail;
        this.tail = head;
        return this;
      };
      function insert(self2, node, value) {
        var inserted = node === self2.head ? new Node(value, null, node, self2) : new Node(value, node, node.next, self2);
        if (inserted.next === null) {
          self2.tail = inserted;
        }
        if (inserted.prev === null) {
          self2.head = inserted;
        }
        self2.length++;
        return inserted;
      }
      function push(self2, item) {
        self2.tail = new Node(item, self2.tail, null, self2);
        if (!self2.head) {
          self2.head = self2.tail;
        }
        self2.length++;
      }
      function unshift(self2, item) {
        self2.head = new Node(item, null, self2.head, self2);
        if (!self2.tail) {
          self2.tail = self2.head;
        }
        self2.length++;
      }
      function Node(value, prev, next, list) {
        if (!(this instanceof Node)) {
          return new Node(value, prev, next, list);
        }
        this.list = list;
        this.value = value;
        if (prev) {
          prev.next = this;
          this.prev = prev;
        } else {
          this.prev = null;
        }
        if (next) {
          next.prev = this;
          this.next = next;
        } else {
          this.next = null;
        }
      }
      try {
        require_iterator()(Yallist);
      } catch (er) {
      }
    }
  });

  // node_modules/semver/node_modules/lru-cache/index.js
  var require_lru_cache2 = __commonJS({
    "node_modules/semver/node_modules/lru-cache/index.js"(exports, module) {
      "use strict";
      var Yallist = require_yallist();
      var MAX = Symbol("max");
      var LENGTH = Symbol("length");
      var LENGTH_CALCULATOR = Symbol("lengthCalculator");
      var ALLOW_STALE = Symbol("allowStale");
      var MAX_AGE = Symbol("maxAge");
      var DISPOSE = Symbol("dispose");
      var NO_DISPOSE_ON_SET = Symbol("noDisposeOnSet");
      var LRU_LIST = Symbol("lruList");
      var CACHE = Symbol("cache");
      var UPDATE_AGE_ON_GET = Symbol("updateAgeOnGet");
      var naiveLength = () => 1;
      var LRUCache = class {
        constructor(options) {
          if (typeof options === "number")
            options = { max: options };
          if (!options)
            options = {};
          if (options.max && (typeof options.max !== "number" || options.max < 0))
            throw new TypeError("max must be a non-negative number");
          const max = this[MAX] = options.max || Infinity;
          const lc = options.length || naiveLength;
          this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
          this[ALLOW_STALE] = options.stale || false;
          if (options.maxAge && typeof options.maxAge !== "number")
            throw new TypeError("maxAge must be a number");
          this[MAX_AGE] = options.maxAge || 0;
          this[DISPOSE] = options.dispose;
          this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
          this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
          this.reset();
        }
        // resize the cache when the max changes.
        set max(mL) {
          if (typeof mL !== "number" || mL < 0)
            throw new TypeError("max must be a non-negative number");
          this[MAX] = mL || Infinity;
          trim(this);
        }
        get max() {
          return this[MAX];
        }
        set allowStale(allowStale) {
          this[ALLOW_STALE] = !!allowStale;
        }
        get allowStale() {
          return this[ALLOW_STALE];
        }
        set maxAge(mA) {
          if (typeof mA !== "number")
            throw new TypeError("maxAge must be a non-negative number");
          this[MAX_AGE] = mA;
          trim(this);
        }
        get maxAge() {
          return this[MAX_AGE];
        }
        // resize the cache when the lengthCalculator changes.
        set lengthCalculator(lC) {
          if (typeof lC !== "function")
            lC = naiveLength;
          if (lC !== this[LENGTH_CALCULATOR]) {
            this[LENGTH_CALCULATOR] = lC;
            this[LENGTH] = 0;
            this[LRU_LIST].forEach((hit) => {
              hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
              this[LENGTH] += hit.length;
            });
          }
          trim(this);
        }
        get lengthCalculator() {
          return this[LENGTH_CALCULATOR];
        }
        get length() {
          return this[LENGTH];
        }
        get itemCount() {
          return this[LRU_LIST].length;
        }
        rforEach(fn, thisp) {
          thisp = thisp || this;
          for (let walker = this[LRU_LIST].tail; walker !== null; ) {
            const prev = walker.prev;
            forEachStep(this, fn, walker, thisp);
            walker = prev;
          }
        }
        forEach(fn, thisp) {
          thisp = thisp || this;
          for (let walker = this[LRU_LIST].head; walker !== null; ) {
            const next = walker.next;
            forEachStep(this, fn, walker, thisp);
            walker = next;
          }
        }
        keys() {
          return this[LRU_LIST].toArray().map((k) => k.key);
        }
        values() {
          return this[LRU_LIST].toArray().map((k) => k.value);
        }
        reset() {
          if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
            this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
          }
          this[CACHE] = /* @__PURE__ */ new Map();
          this[LRU_LIST] = new Yallist();
          this[LENGTH] = 0;
        }
        dump() {
          return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
            k: hit.key,
            v: hit.value,
            e: hit.now + (hit.maxAge || 0)
          }).toArray().filter((h) => h);
        }
        dumpLru() {
          return this[LRU_LIST];
        }
        set(key, value, maxAge) {
          maxAge = maxAge || this[MAX_AGE];
          if (maxAge && typeof maxAge !== "number")
            throw new TypeError("maxAge must be a number");
          const now = maxAge ? Date.now() : 0;
          const len = this[LENGTH_CALCULATOR](value, key);
          if (this[CACHE].has(key)) {
            if (len > this[MAX]) {
              del(this, this[CACHE].get(key));
              return false;
            }
            const node = this[CACHE].get(key);
            const item = node.value;
            if (this[DISPOSE]) {
              if (!this[NO_DISPOSE_ON_SET])
                this[DISPOSE](key, item.value);
            }
            item.now = now;
            item.maxAge = maxAge;
            item.value = value;
            this[LENGTH] += len - item.length;
            item.length = len;
            this.get(key);
            trim(this);
            return true;
          }
          const hit = new Entry(key, value, len, now, maxAge);
          if (hit.length > this[MAX]) {
            if (this[DISPOSE])
              this[DISPOSE](key, value);
            return false;
          }
          this[LENGTH] += hit.length;
          this[LRU_LIST].unshift(hit);
          this[CACHE].set(key, this[LRU_LIST].head);
          trim(this);
          return true;
        }
        has(key) {
          if (!this[CACHE].has(key)) return false;
          const hit = this[CACHE].get(key).value;
          return !isStale(this, hit);
        }
        get(key) {
          return get(this, key, true);
        }
        peek(key) {
          return get(this, key, false);
        }
        pop() {
          const node = this[LRU_LIST].tail;
          if (!node)
            return null;
          del(this, node);
          return node.value;
        }
        del(key) {
          del(this, this[CACHE].get(key));
        }
        load(arr) {
          this.reset();
          const now = Date.now();
          for (let l = arr.length - 1; l >= 0; l--) {
            const hit = arr[l];
            const expiresAt = hit.e || 0;
            if (expiresAt === 0)
              this.set(hit.k, hit.v);
            else {
              const maxAge = expiresAt - now;
              if (maxAge > 0) {
                this.set(hit.k, hit.v, maxAge);
              }
            }
          }
        }
        prune() {
          this[CACHE].forEach((value, key) => get(this, key, false));
        }
      };
      var get = (self2, key, doUse) => {
        const node = self2[CACHE].get(key);
        if (node) {
          const hit = node.value;
          if (isStale(self2, hit)) {
            del(self2, node);
            if (!self2[ALLOW_STALE])
              return void 0;
          } else {
            if (doUse) {
              if (self2[UPDATE_AGE_ON_GET])
                node.value.now = Date.now();
              self2[LRU_LIST].unshiftNode(node);
            }
          }
          return hit.value;
        }
      };
      var isStale = (self2, hit) => {
        if (!hit || !hit.maxAge && !self2[MAX_AGE])
          return false;
        const diff = Date.now() - hit.now;
        return hit.maxAge ? diff > hit.maxAge : self2[MAX_AGE] && diff > self2[MAX_AGE];
      };
      var trim = (self2) => {
        if (self2[LENGTH] > self2[MAX]) {
          for (let walker = self2[LRU_LIST].tail; self2[LENGTH] > self2[MAX] && walker !== null; ) {
            const prev = walker.prev;
            del(self2, walker);
            walker = prev;
          }
        }
      };
      var del = (self2, node) => {
        if (node) {
          const hit = node.value;
          if (self2[DISPOSE])
            self2[DISPOSE](hit.key, hit.value);
          self2[LENGTH] -= hit.length;
          self2[CACHE].delete(hit.key);
          self2[LRU_LIST].removeNode(node);
        }
      };
      var Entry = class {
        constructor(key, value, length, now, maxAge) {
          this.key = key;
          this.value = value;
          this.length = length;
          this.now = now;
          this.maxAge = maxAge || 0;
        }
      };
      var forEachStep = (self2, fn, node, thisp) => {
        let hit = node.value;
        if (isStale(self2, hit)) {
          del(self2, node);
          if (!self2[ALLOW_STALE])
            hit = void 0;
        }
        if (hit)
          fn.call(thisp, hit.value, hit.key, self2);
      };
      module.exports = LRUCache;
    }
  });

  // node_modules/semver/classes/range.js
  var require_range = __commonJS({
    "node_modules/semver/classes/range.js"(exports, module) {
      var Range = class _Range {
        constructor(range, options) {
          options = parseOptions(options);
          if (range instanceof _Range) {
            if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
              return range;
            } else {
              return new _Range(range.raw, options);
            }
          }
          if (range instanceof Comparator) {
            this.raw = range.value;
            this.set = [[range]];
            this.format();
            return this;
          }
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          this.raw = range.trim().split(/\s+/).join(" ");
          this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
          if (!this.set.length) {
            throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
          }
          if (this.set.length > 1) {
            const first = this.set[0];
            this.set = this.set.filter((c) => !isNullSet(c[0]));
            if (this.set.length === 0) {
              this.set = [first];
            } else if (this.set.length > 1) {
              for (const c of this.set) {
                if (c.length === 1 && isAny(c[0])) {
                  this.set = [c];
                  break;
                }
              }
            }
          }
          this.format();
        }
        format() {
          this.range = this.set.map((comps) => comps.join(" ").trim()).join("||").trim();
          return this.range;
        }
        toString() {
          return this.range;
        }
        parseRange(range) {
          const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
          const memoKey = memoOpts + ":" + range;
          const cached = cache.get(memoKey);
          if (cached) {
            return cached;
          }
          const loose = this.options.loose;
          const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
          range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
          debug("hyphen replace", range);
          range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
          debug("comparator trim", range);
          range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
          debug("tilde trim", range);
          range = range.replace(re[t.CARETTRIM], caretTrimReplace);
          debug("caret trim", range);
          let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
          if (loose) {
            rangeList = rangeList.filter((comp) => {
              debug("loose invalid filter", comp, this.options);
              return !!comp.match(re[t.COMPARATORLOOSE]);
            });
          }
          debug("range list", rangeList);
          const rangeMap = /* @__PURE__ */ new Map();
          const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
          for (const comp of comparators) {
            if (isNullSet(comp)) {
              return [comp];
            }
            rangeMap.set(comp.value, comp);
          }
          if (rangeMap.size > 1 && rangeMap.has("")) {
            rangeMap.delete("");
          }
          const result = [...rangeMap.values()];
          cache.set(memoKey, result);
          return result;
        }
        intersects(range, options) {
          if (!(range instanceof _Range)) {
            throw new TypeError("a Range is required");
          }
          return this.set.some((thisComparators) => {
            return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
              return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
                return rangeComparators.every((rangeComparator) => {
                  return thisComparator.intersects(rangeComparator, options);
                });
              });
            });
          });
        }
        // if ANY of the sets match ALL of its comparators, then pass
        test(version) {
          if (!version) {
            return false;
          }
          if (typeof version === "string") {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          for (let i = 0; i < this.set.length; i++) {
            if (testSet(this.set[i], version, this.options)) {
              return true;
            }
          }
          return false;
        }
      };
      module.exports = Range;
      var LRU = require_lru_cache2();
      var cache = new LRU({ max: 1e3 });
      var parseOptions = require_parse_options();
      var Comparator = require_comparator();
      var debug = require_debug();
      var SemVer = require_semver();
      var {
        safeRe: re,
        t,
        comparatorTrimReplace,
        tildeTrimReplace,
        caretTrimReplace
      } = require_re();
      var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants2();
      var isNullSet = (c) => c.value === "<0.0.0-0";
      var isAny = (c) => c.value === "";
      var isSatisfiable = (comparators, options) => {
        let result = true;
        const remainingComparators = comparators.slice();
        let testComparator = remainingComparators.pop();
        while (result && remainingComparators.length) {
          result = remainingComparators.every((otherComparator) => {
            return testComparator.intersects(otherComparator, options);
          });
          testComparator = remainingComparators.pop();
        }
        return result;
      };
      var parseComparator = (comp, options) => {
        debug("comp", comp, options);
        comp = replaceCarets(comp, options);
        debug("caret", comp);
        comp = replaceTildes(comp, options);
        debug("tildes", comp);
        comp = replaceXRanges(comp, options);
        debug("xrange", comp);
        comp = replaceStars(comp, options);
        debug("stars", comp);
        return comp;
      };
      var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
      var replaceTildes = (comp, options) => {
        return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
      };
      var replaceTilde = (comp, options) => {
        const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
        return comp.replace(r, (_, M, m, p, pr) => {
          debug("tilde", comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = "";
          } else if (isX(m)) {
            ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
          } else if (pr) {
            debug("replaceTilde pr", pr);
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
          }
          debug("tilde return", ret);
          return ret;
        });
      };
      var replaceCarets = (comp, options) => {
        return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
      };
      var replaceCaret = (comp, options) => {
        debug("caret", comp, options);
        const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
        const z = options.includePrerelease ? "-0" : "";
        return comp.replace(r, (_, M, m, p, pr) => {
          debug("caret", comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = "";
          } else if (isX(m)) {
            ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            if (M === "0") {
              ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
            } else {
              ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
            }
          } else if (pr) {
            debug("replaceCaret pr", pr);
            if (M === "0") {
              if (m === "0") {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
            }
          } else {
            debug("no pr");
            if (M === "0") {
              if (m === "0") {
                ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
            }
          }
          debug("caret return", ret);
          return ret;
        });
      };
      var replaceXRanges = (comp, options) => {
        debug("replaceXRanges", comp, options);
        return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
      };
      var replaceXRange = (comp, options) => {
        comp = comp.trim();
        const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
        return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
          debug("xRange", comp, ret, gtlt, M, m, p, pr);
          const xM = isX(M);
          const xm = xM || isX(m);
          const xp = xm || isX(p);
          const anyX = xp;
          if (gtlt === "=" && anyX) {
            gtlt = "";
          }
          pr = options.includePrerelease ? "-0" : "";
          if (xM) {
            if (gtlt === ">" || gtlt === "<") {
              ret = "<0.0.0-0";
            } else {
              ret = "*";
            }
          } else if (gtlt && anyX) {
            if (xm) {
              m = 0;
            }
            p = 0;
            if (gtlt === ">") {
              gtlt = ">=";
              if (xm) {
                M = +M + 1;
                m = 0;
                p = 0;
              } else {
                m = +m + 1;
                p = 0;
              }
            } else if (gtlt === "<=") {
              gtlt = "<";
              if (xm) {
                M = +M + 1;
              } else {
                m = +m + 1;
              }
            }
            if (gtlt === "<") {
              pr = "-0";
            }
            ret = `${gtlt + M}.${m}.${p}${pr}`;
          } else if (xm) {
            ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
          } else if (xp) {
            ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
          }
          debug("xRange return", ret);
          return ret;
        });
      };
      var replaceStars = (comp, options) => {
        debug("replaceStars", comp, options);
        return comp.trim().replace(re[t.STAR], "");
      };
      var replaceGTE0 = (comp, options) => {
        debug("replaceGTE0", comp, options);
        return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
      };
      var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => {
        if (isX(fM)) {
          from = "";
        } else if (isX(fm)) {
          from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
        } else if (isX(fp)) {
          from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
        } else if (fpr) {
          from = `>=${from}`;
        } else {
          from = `>=${from}${incPr ? "-0" : ""}`;
        }
        if (isX(tM)) {
          to = "";
        } else if (isX(tm)) {
          to = `<${+tM + 1}.0.0-0`;
        } else if (isX(tp)) {
          to = `<${tM}.${+tm + 1}.0-0`;
        } else if (tpr) {
          to = `<=${tM}.${tm}.${tp}-${tpr}`;
        } else if (incPr) {
          to = `<${tM}.${tm}.${+tp + 1}-0`;
        } else {
          to = `<=${to}`;
        }
        return `${from} ${to}`.trim();
      };
      var testSet = (set, version, options) => {
        for (let i = 0; i < set.length; i++) {
          if (!set[i].test(version)) {
            return false;
          }
        }
        if (version.prerelease.length && !options.includePrerelease) {
          for (let i = 0; i < set.length; i++) {
            debug(set[i].semver);
            if (set[i].semver === Comparator.ANY) {
              continue;
            }
            if (set[i].semver.prerelease.length > 0) {
              const allowed = set[i].semver;
              if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
                return true;
              }
            }
          }
          return false;
        }
        return true;
      };
    }
  });

  // node_modules/semver/classes/comparator.js
  var require_comparator = __commonJS({
    "node_modules/semver/classes/comparator.js"(exports, module) {
      var ANY = Symbol("SemVer ANY");
      var Comparator = class _Comparator {
        static get ANY() {
          return ANY;
        }
        constructor(comp, options) {
          options = parseOptions(options);
          if (comp instanceof _Comparator) {
            if (comp.loose === !!options.loose) {
              return comp;
            } else {
              comp = comp.value;
            }
          }
          comp = comp.trim().split(/\s+/).join(" ");
          debug("comparator", comp, options);
          this.options = options;
          this.loose = !!options.loose;
          this.parse(comp);
          if (this.semver === ANY) {
            this.value = "";
          } else {
            this.value = this.operator + this.semver.version;
          }
          debug("comp", this);
        }
        parse(comp) {
          const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
          const m = comp.match(r);
          if (!m) {
            throw new TypeError(`Invalid comparator: ${comp}`);
          }
          this.operator = m[1] !== void 0 ? m[1] : "";
          if (this.operator === "=") {
            this.operator = "";
          }
          if (!m[2]) {
            this.semver = ANY;
          } else {
            this.semver = new SemVer(m[2], this.options.loose);
          }
        }
        toString() {
          return this.value;
        }
        test(version) {
          debug("Comparator.test", version, this.options.loose);
          if (this.semver === ANY || version === ANY) {
            return true;
          }
          if (typeof version === "string") {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          return cmp(version, this.operator, this.semver, this.options);
        }
        intersects(comp, options) {
          if (!(comp instanceof _Comparator)) {
            throw new TypeError("a Comparator is required");
          }
          if (this.operator === "") {
            if (this.value === "") {
              return true;
            }
            return new Range(comp.value, options).test(this.value);
          } else if (comp.operator === "") {
            if (comp.value === "") {
              return true;
            }
            return new Range(this.value, options).test(comp.semver);
          }
          options = parseOptions(options);
          if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
            return false;
          }
          if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
            return false;
          }
          if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
            return true;
          }
          if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
            return true;
          }
          if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
            return true;
          }
          if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
            return true;
          }
          if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
            return true;
          }
          return false;
        }
      };
      module.exports = Comparator;
      var parseOptions = require_parse_options();
      var { safeRe: re, t } = require_re();
      var cmp = require_cmp();
      var debug = require_debug();
      var SemVer = require_semver();
      var Range = require_range();
    }
  });

  // node_modules/semver/functions/satisfies.js
  var require_satisfies = __commonJS({
    "node_modules/semver/functions/satisfies.js"(exports, module) {
      var Range = require_range();
      var satisfies = (version, range, options) => {
        try {
          range = new Range(range, options);
        } catch (er) {
          return false;
        }
        return range.test(version);
      };
      module.exports = satisfies;
    }
  });

  // node_modules/semver/ranges/to-comparators.js
  var require_to_comparators = __commonJS({
    "node_modules/semver/ranges/to-comparators.js"(exports, module) {
      var Range = require_range();
      var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
      module.exports = toComparators;
    }
  });

  // node_modules/semver/ranges/max-satisfying.js
  var require_max_satisfying = __commonJS({
    "node_modules/semver/ranges/max-satisfying.js"(exports, module) {
      var SemVer = require_semver();
      var Range = require_range();
      var maxSatisfying = (versions, range, options) => {
        let max = null;
        let maxSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach((v) => {
          if (rangeObj.test(v)) {
            if (!max || maxSV.compare(v) === -1) {
              max = v;
              maxSV = new SemVer(max, options);
            }
          }
        });
        return max;
      };
      module.exports = maxSatisfying;
    }
  });

  // node_modules/semver/ranges/min-satisfying.js
  var require_min_satisfying = __commonJS({
    "node_modules/semver/ranges/min-satisfying.js"(exports, module) {
      var SemVer = require_semver();
      var Range = require_range();
      var minSatisfying = (versions, range, options) => {
        let min = null;
        let minSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach((v) => {
          if (rangeObj.test(v)) {
            if (!min || minSV.compare(v) === 1) {
              min = v;
              minSV = new SemVer(min, options);
            }
          }
        });
        return min;
      };
      module.exports = minSatisfying;
    }
  });

  // node_modules/semver/ranges/min-version.js
  var require_min_version = __commonJS({
    "node_modules/semver/ranges/min-version.js"(exports, module) {
      var SemVer = require_semver();
      var Range = require_range();
      var gt = require_gt();
      var minVersion = (range, loose) => {
        range = new Range(range, loose);
        let minver = new SemVer("0.0.0");
        if (range.test(minver)) {
          return minver;
        }
        minver = new SemVer("0.0.0-0");
        if (range.test(minver)) {
          return minver;
        }
        minver = null;
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let setMin = null;
          comparators.forEach((comparator) => {
            const compver = new SemVer(comparator.semver.version);
            switch (comparator.operator) {
              case ">":
                if (compver.prerelease.length === 0) {
                  compver.patch++;
                } else {
                  compver.prerelease.push(0);
                }
                compver.raw = compver.format();
              case "":
              case ">=":
                if (!setMin || gt(compver, setMin)) {
                  setMin = compver;
                }
                break;
              case "<":
              case "<=":
                break;
              default:
                throw new Error(`Unexpected operation: ${comparator.operator}`);
            }
          });
          if (setMin && (!minver || gt(minver, setMin))) {
            minver = setMin;
          }
        }
        if (minver && range.test(minver)) {
          return minver;
        }
        return null;
      };
      module.exports = minVersion;
    }
  });

  // node_modules/semver/ranges/valid.js
  var require_valid2 = __commonJS({
    "node_modules/semver/ranges/valid.js"(exports, module) {
      var Range = require_range();
      var validRange = (range, options) => {
        try {
          return new Range(range, options).range || "*";
        } catch (er) {
          return null;
        }
      };
      module.exports = validRange;
    }
  });

  // node_modules/semver/ranges/outside.js
  var require_outside = __commonJS({
    "node_modules/semver/ranges/outside.js"(exports, module) {
      var SemVer = require_semver();
      var Comparator = require_comparator();
      var { ANY } = Comparator;
      var Range = require_range();
      var satisfies = require_satisfies();
      var gt = require_gt();
      var lt = require_lt();
      var lte = require_lte();
      var gte = require_gte();
      var outside = (version, range, hilo, options) => {
        version = new SemVer(version, options);
        range = new Range(range, options);
        let gtfn, ltefn, ltfn, comp, ecomp;
        switch (hilo) {
          case ">":
            gtfn = gt;
            ltefn = lte;
            ltfn = lt;
            comp = ">";
            ecomp = ">=";
            break;
          case "<":
            gtfn = lt;
            ltefn = gte;
            ltfn = gt;
            comp = "<";
            ecomp = "<=";
            break;
          default:
            throw new TypeError('Must provide a hilo val of "<" or ">"');
        }
        if (satisfies(version, range, options)) {
          return false;
        }
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let high = null;
          let low = null;
          comparators.forEach((comparator) => {
            if (comparator.semver === ANY) {
              comparator = new Comparator(">=0.0.0");
            }
            high = high || comparator;
            low = low || comparator;
            if (gtfn(comparator.semver, high.semver, options)) {
              high = comparator;
            } else if (ltfn(comparator.semver, low.semver, options)) {
              low = comparator;
            }
          });
          if (high.operator === comp || high.operator === ecomp) {
            return false;
          }
          if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
            return false;
          } else if (low.operator === ecomp && ltfn(version, low.semver)) {
            return false;
          }
        }
        return true;
      };
      module.exports = outside;
    }
  });

  // node_modules/semver/ranges/gtr.js
  var require_gtr = __commonJS({
    "node_modules/semver/ranges/gtr.js"(exports, module) {
      var outside = require_outside();
      var gtr = (version, range, options) => outside(version, range, ">", options);
      module.exports = gtr;
    }
  });

  // node_modules/semver/ranges/ltr.js
  var require_ltr = __commonJS({
    "node_modules/semver/ranges/ltr.js"(exports, module) {
      var outside = require_outside();
      var ltr = (version, range, options) => outside(version, range, "<", options);
      module.exports = ltr;
    }
  });

  // node_modules/semver/ranges/intersects.js
  var require_intersects = __commonJS({
    "node_modules/semver/ranges/intersects.js"(exports, module) {
      var Range = require_range();
      var intersects = (r1, r2, options) => {
        r1 = new Range(r1, options);
        r2 = new Range(r2, options);
        return r1.intersects(r2, options);
      };
      module.exports = intersects;
    }
  });

  // node_modules/semver/ranges/simplify.js
  var require_simplify = __commonJS({
    "node_modules/semver/ranges/simplify.js"(exports, module) {
      var satisfies = require_satisfies();
      var compare = require_compare();
      module.exports = (versions, range, options) => {
        const set = [];
        let first = null;
        let prev = null;
        const v = versions.sort((a, b) => compare(a, b, options));
        for (const version of v) {
          const included = satisfies(version, range, options);
          if (included) {
            prev = version;
            if (!first) {
              first = version;
            }
          } else {
            if (prev) {
              set.push([first, prev]);
            }
            prev = null;
            first = null;
          }
        }
        if (first) {
          set.push([first, null]);
        }
        const ranges = [];
        for (const [min, max] of set) {
          if (min === max) {
            ranges.push(min);
          } else if (!max && min === v[0]) {
            ranges.push("*");
          } else if (!max) {
            ranges.push(`>=${min}`);
          } else if (min === v[0]) {
            ranges.push(`<=${max}`);
          } else {
            ranges.push(`${min} - ${max}`);
          }
        }
        const simplified = ranges.join(" || ");
        const original = typeof range.raw === "string" ? range.raw : String(range);
        return simplified.length < original.length ? simplified : range;
      };
    }
  });

  // node_modules/semver/ranges/subset.js
  var require_subset = __commonJS({
    "node_modules/semver/ranges/subset.js"(exports, module) {
      var Range = require_range();
      var Comparator = require_comparator();
      var { ANY } = Comparator;
      var satisfies = require_satisfies();
      var compare = require_compare();
      var subset = (sub, dom, options = {}) => {
        if (sub === dom) {
          return true;
        }
        sub = new Range(sub, options);
        dom = new Range(dom, options);
        let sawNonNull = false;
        OUTER: for (const simpleSub of sub.set) {
          for (const simpleDom of dom.set) {
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
              continue OUTER;
            }
          }
          if (sawNonNull) {
            return false;
          }
        }
        return true;
      };
      var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
      var minimumVersion = [new Comparator(">=0.0.0")];
      var simpleSubset = (sub, dom, options) => {
        if (sub === dom) {
          return true;
        }
        if (sub.length === 1 && sub[0].semver === ANY) {
          if (dom.length === 1 && dom[0].semver === ANY) {
            return true;
          } else if (options.includePrerelease) {
            sub = minimumVersionWithPreRelease;
          } else {
            sub = minimumVersion;
          }
        }
        if (dom.length === 1 && dom[0].semver === ANY) {
          if (options.includePrerelease) {
            return true;
          } else {
            dom = minimumVersion;
          }
        }
        const eqSet = /* @__PURE__ */ new Set();
        let gt, lt;
        for (const c of sub) {
          if (c.operator === ">" || c.operator === ">=") {
            gt = higherGT(gt, c, options);
          } else if (c.operator === "<" || c.operator === "<=") {
            lt = lowerLT(lt, c, options);
          } else {
            eqSet.add(c.semver);
          }
        }
        if (eqSet.size > 1) {
          return null;
        }
        let gtltComp;
        if (gt && lt) {
          gtltComp = compare(gt.semver, lt.semver, options);
          if (gtltComp > 0) {
            return null;
          } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
            return null;
          }
        }
        for (const eq of eqSet) {
          if (gt && !satisfies(eq, String(gt), options)) {
            return null;
          }
          if (lt && !satisfies(eq, String(lt), options)) {
            return null;
          }
          for (const c of dom) {
            if (!satisfies(eq, String(c), options)) {
              return false;
            }
          }
          return true;
        }
        let higher, lower;
        let hasDomLT, hasDomGT;
        let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
        let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
        if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
          needDomLTPre = false;
        }
        for (const c of dom) {
          hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
          hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
          if (gt) {
            if (needDomGTPre) {
              if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
                needDomGTPre = false;
              }
            }
            if (c.operator === ">" || c.operator === ">=") {
              higher = higherGT(gt, c, options);
              if (higher === c && higher !== gt) {
                return false;
              }
            } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
              return false;
            }
          }
          if (lt) {
            if (needDomLTPre) {
              if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
                needDomLTPre = false;
              }
            }
            if (c.operator === "<" || c.operator === "<=") {
              lower = lowerLT(lt, c, options);
              if (lower === c && lower !== lt) {
                return false;
              }
            } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
              return false;
            }
          }
          if (!c.operator && (lt || gt) && gtltComp !== 0) {
            return false;
          }
        }
        if (gt && hasDomLT && !lt && gtltComp !== 0) {
          return false;
        }
        if (lt && hasDomGT && !gt && gtltComp !== 0) {
          return false;
        }
        if (needDomGTPre || needDomLTPre) {
          return false;
        }
        return true;
      };
      var higherGT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
      };
      var lowerLT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
      };
      module.exports = subset;
    }
  });

  // node_modules/semver/index.js
  var require_semver2 = __commonJS({
    "node_modules/semver/index.js"(exports, module) {
      var internalRe = require_re();
      var constants = require_constants2();
      var SemVer = require_semver();
      var identifiers = require_identifiers();
      var parse = require_parse();
      var valid = require_valid();
      var clean = require_clean();
      var inc = require_inc();
      var diff = require_diff();
      var major = require_major();
      var minor = require_minor();
      var patch = require_patch();
      var prerelease = require_prerelease();
      var compare = require_compare();
      var rcompare = require_rcompare();
      var compareLoose = require_compare_loose();
      var compareBuild = require_compare_build();
      var sort = require_sort();
      var rsort = require_rsort();
      var gt = require_gt();
      var lt = require_lt();
      var eq = require_eq();
      var neq = require_neq();
      var gte = require_gte();
      var lte = require_lte();
      var cmp = require_cmp();
      var coerce = require_coerce();
      var Comparator = require_comparator();
      var Range = require_range();
      var satisfies = require_satisfies();
      var toComparators = require_to_comparators();
      var maxSatisfying = require_max_satisfying();
      var minSatisfying = require_min_satisfying();
      var minVersion = require_min_version();
      var validRange = require_valid2();
      var outside = require_outside();
      var gtr = require_gtr();
      var ltr = require_ltr();
      var intersects = require_intersects();
      var simplifyRange = require_simplify();
      var subset = require_subset();
      module.exports = {
        parse,
        valid,
        clean,
        inc,
        diff,
        major,
        minor,
        patch,
        prerelease,
        compare,
        rcompare,
        compareLoose,
        compareBuild,
        sort,
        rsort,
        gt,
        lt,
        eq,
        neq,
        gte,
        lte,
        cmp,
        coerce,
        Comparator,
        Range,
        satisfies,
        toComparators,
        maxSatisfying,
        minSatisfying,
        minVersion,
        validRange,
        outside,
        gtr,
        ltr,
        intersects,
        simplifyRange,
        subset,
        SemVer,
        re: internalRe.re,
        src: internalRe.src,
        tokens: internalRe.t,
        SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
        RELEASE_TYPES: constants.RELEASE_TYPES,
        compareIdentifiers: identifiers.compareIdentifiers,
        rcompareIdentifiers: identifiers.rcompareIdentifiers
      };
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/rules.js
  var require_rules = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/rules.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.matchesRule = exports.ObfuscatedOperatorType = exports.OperatorType = void 0;
      var semver_1 = require_semver2();
      var obfuscation_1 = require_obfuscation();
      var OperatorType;
      (function(OperatorType2) {
        OperatorType2["MATCHES"] = "MATCHES";
        OperatorType2["NOT_MATCHES"] = "NOT_MATCHES";
        OperatorType2["GTE"] = "GTE";
        OperatorType2["GT"] = "GT";
        OperatorType2["LTE"] = "LTE";
        OperatorType2["LT"] = "LT";
        OperatorType2["ONE_OF"] = "ONE_OF";
        OperatorType2["NOT_ONE_OF"] = "NOT_ONE_OF";
        OperatorType2["IS_NULL"] = "IS_NULL";
      })(OperatorType = exports.OperatorType || (exports.OperatorType = {}));
      var ObfuscatedOperatorType;
      (function(ObfuscatedOperatorType2) {
        ObfuscatedOperatorType2["MATCHES"] = "05015086bdd8402218f6aad6528bef08";
        ObfuscatedOperatorType2["NOT_MATCHES"] = "8323761667755378c3a78e0a6ed37a78";
        ObfuscatedOperatorType2["GTE"] = "32d35312e8f24bc1669bd2b45c00d47c";
        ObfuscatedOperatorType2["GT"] = "cd6a9bd2a175104eed40f0d33a8b4020";
        ObfuscatedOperatorType2["LTE"] = "cc981ecc65ecf63ad1673cbec9c64198";
        ObfuscatedOperatorType2["LT"] = "c562607189d77eb9dfb707464c1e7b0b";
        ObfuscatedOperatorType2["ONE_OF"] = "27457ce369f2a74203396a35ef537c0b";
        ObfuscatedOperatorType2["NOT_ONE_OF"] = "602f5ee0b6e84fe29f43ab48b9e1addf";
        ObfuscatedOperatorType2["IS_NULL"] = "dbd9c38e0339e6c34bd48cafc59be388";
      })(ObfuscatedOperatorType = exports.ObfuscatedOperatorType || (exports.ObfuscatedOperatorType = {}));
      var OperatorValueType;
      (function(OperatorValueType2) {
        OperatorValueType2["PLAIN_STRING"] = "PLAIN_STRING";
        OperatorValueType2["STRING_ARRAY"] = "STRING_ARRAY";
        OperatorValueType2["SEM_VER"] = "SEM_VER";
        OperatorValueType2["NUMERIC"] = "NUMERIC";
      })(OperatorValueType || (OperatorValueType = {}));
      function matchesRule(rule, subjectAttributes, obfuscated) {
        const conditionEvaluations = evaluateRuleConditions(subjectAttributes, rule.conditions, obfuscated);
        return !conditionEvaluations.includes(false);
      }
      exports.matchesRule = matchesRule;
      function evaluateRuleConditions(subjectAttributes, conditions, obfuscated) {
        return conditions.map((condition) => obfuscated ? evaluateObfuscatedCondition(Object.entries(subjectAttributes).reduce((accum, [key, val]) => Object.assign({ [(0, obfuscation_1.getMD5Hash)(key)]: val }, accum), {}), condition) : evaluateCondition(subjectAttributes, condition));
      }
      function evaluateCondition(subjectAttributes, condition) {
        const value = subjectAttributes[condition.attribute];
        const conditionValueType = targetingRuleConditionValuesTypesFromValues(condition.value);
        if (condition.operator === OperatorType.IS_NULL) {
          if (condition.value) {
            return value === null || value === void 0;
          }
          return value !== null && value !== void 0;
        }
        if (value != null) {
          switch (condition.operator) {
            case OperatorType.GTE:
              if (conditionValueType === OperatorValueType.SEM_VER) {
                return compareSemVer(value, condition.value, semver_1.gte);
              }
              return compareNumber(value, condition.value, (a, b) => a >= b);
            case OperatorType.GT:
              if (conditionValueType === OperatorValueType.SEM_VER) {
                return compareSemVer(value, condition.value, semver_1.gt);
              }
              return compareNumber(value, condition.value, (a, b) => a > b);
            case OperatorType.LTE:
              if (conditionValueType === OperatorValueType.SEM_VER) {
                return compareSemVer(value, condition.value, semver_1.lte);
              }
              return compareNumber(value, condition.value, (a, b) => a <= b);
            case OperatorType.LT:
              if (conditionValueType === OperatorValueType.SEM_VER) {
                return compareSemVer(value, condition.value, semver_1.lt);
              }
              return compareNumber(value, condition.value, (a, b) => a < b);
            case OperatorType.MATCHES:
              return new RegExp(condition.value).test(value);
            case OperatorType.NOT_MATCHES:
              return !new RegExp(condition.value).test(value);
            case OperatorType.ONE_OF:
              return isOneOf(value.toString(), condition.value);
            case OperatorType.NOT_ONE_OF:
              return isNotOneOf(value.toString(), condition.value);
          }
        }
        return false;
      }
      function evaluateObfuscatedCondition(hashedSubjectAttributes, condition) {
        const value = hashedSubjectAttributes[condition.attribute];
        const conditionValueType = targetingRuleConditionValuesTypesFromValues(value);
        if (condition.operator === ObfuscatedOperatorType.IS_NULL) {
          if (condition.value === (0, obfuscation_1.getMD5Hash)("true")) {
            return value === null || value === void 0;
          }
          return value !== null && value !== void 0;
        }
        if (value != null) {
          switch (condition.operator) {
            case ObfuscatedOperatorType.GTE:
              if (conditionValueType === OperatorValueType.SEM_VER) {
                return compareSemVer(value, (0, obfuscation_1.decodeBase64)(condition.value), semver_1.gte);
              }
              return compareNumber(value, Number((0, obfuscation_1.decodeBase64)(condition.value)), (a, b) => a >= b);
            case ObfuscatedOperatorType.GT:
              if (conditionValueType === OperatorValueType.SEM_VER) {
                return compareSemVer(value, (0, obfuscation_1.decodeBase64)(condition.value), semver_1.gt);
              }
              return compareNumber(value, Number((0, obfuscation_1.decodeBase64)(condition.value)), (a, b) => a > b);
            case ObfuscatedOperatorType.LTE:
              if (conditionValueType === OperatorValueType.SEM_VER) {
                return compareSemVer(value, (0, obfuscation_1.decodeBase64)(condition.value), semver_1.lte);
              }
              return compareNumber(value, Number((0, obfuscation_1.decodeBase64)(condition.value)), (a, b) => a <= b);
            case ObfuscatedOperatorType.LT:
              if (conditionValueType === OperatorValueType.SEM_VER) {
                return compareSemVer(value, (0, obfuscation_1.decodeBase64)(condition.value), semver_1.lt);
              }
              return compareNumber(value, Number((0, obfuscation_1.decodeBase64)(condition.value)), (a, b) => a < b);
            case ObfuscatedOperatorType.MATCHES:
              return new RegExp((0, obfuscation_1.decodeBase64)(condition.value)).test(value);
            case ObfuscatedOperatorType.NOT_MATCHES:
              return !new RegExp((0, obfuscation_1.decodeBase64)(condition.value)).test(value);
            case ObfuscatedOperatorType.ONE_OF:
              return isOneOf((0, obfuscation_1.getMD5Hash)(value.toString()), condition.value);
            case ObfuscatedOperatorType.NOT_ONE_OF:
              return isNotOneOf((0, obfuscation_1.getMD5Hash)(value.toString()), condition.value);
          }
        }
        return false;
      }
      function isOneOf(attributeValue, conditionValue) {
        return getMatchingStringValues(attributeValue, conditionValue).length > 0;
      }
      function isNotOneOf(attributeValue, conditionValue) {
        return getMatchingStringValues(attributeValue, conditionValue).length === 0;
      }
      function getMatchingStringValues(attributeValue, conditionValues) {
        return conditionValues.filter((value) => value === attributeValue);
      }
      function compareNumber(attributeValue, conditionValue, compareFn) {
        return compareFn(Number(attributeValue), Number(conditionValue));
      }
      function compareSemVer(attributeValue, conditionValue, compareFn) {
        return !!(0, semver_1.valid)(attributeValue) && !!(0, semver_1.valid)(conditionValue) && compareFn(attributeValue, conditionValue);
      }
      function targetingRuleConditionValuesTypesFromValues(value) {
        if (typeof value === "number") {
          return OperatorValueType.NUMERIC;
        }
        if (Array.isArray(value)) {
          return OperatorValueType.STRING_ARRAY;
        }
        if (typeof value === "string" && (0, semver_1.valid)(value)) {
          return OperatorValueType.SEM_VER;
        }
        if (!isNaN(Number(value))) {
          return OperatorValueType.NUMERIC;
        }
        return OperatorValueType.PLAIN_STRING;
      }
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/sharders.js
  var require_sharders = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/sharders.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DeterministicSharder = exports.MD5Sharder = exports.Sharder = void 0;
      var obfuscation_1 = require_obfuscation();
      var Sharder = class {
      };
      exports.Sharder = Sharder;
      var MD5Sharder = class extends Sharder {
        getShard(input, totalShards) {
          const hashOutput = (0, obfuscation_1.getMD5Hash)(input);
          const intFromHash = parseInt(hashOutput.slice(0, 8), 16);
          return intFromHash % totalShards;
        }
      };
      exports.MD5Sharder = MD5Sharder;
      var DeterministicSharder = class extends Sharder {
        constructor(lookup) {
          super();
          this.lookup = lookup;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getShard(input, _totalShards) {
          var _a;
          return (_a = this.lookup[input]) !== null && _a !== void 0 ? _a : 0;
        }
      };
      exports.DeterministicSharder = DeterministicSharder;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/evaluator.js
  var require_evaluator = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/evaluator.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.matchesRules = exports.noneResult = exports.hashKey = exports.isInShardRange = exports.Evaluator = void 0;
      var rules_1 = require_rules();
      var sharders_1 = require_sharders();
      var Evaluator = class {
        constructor(sharder) {
          this.sharder = sharder !== null && sharder !== void 0 ? sharder : new sharders_1.MD5Sharder();
        }
        evaluateFlag(flag, subjectKey, subjectAttributes, obfuscated) {
          var _a, _b;
          if (!flag.enabled) {
            return noneResult(flag.key, subjectKey, subjectAttributes);
          }
          const now = /* @__PURE__ */ new Date();
          for (const allocation of flag.allocations) {
            if (allocation.startAt && now < new Date(allocation.startAt))
              continue;
            if (allocation.endAt && now > new Date(allocation.endAt))
              continue;
            if (matchesRules((_a = allocation === null || allocation === void 0 ? void 0 : allocation.rules) !== null && _a !== void 0 ? _a : [], Object.assign({ id: subjectKey }, subjectAttributes), obfuscated)) {
              for (const split of allocation.splits) {
                if (split.shards.every((shard) => this.matchesShard(shard, subjectKey, flag.totalShards))) {
                  return {
                    flagKey: flag.key,
                    subjectKey,
                    subjectAttributes,
                    allocationKey: allocation.key,
                    variation: flag.variations[split.variationKey],
                    extraLogging: (_b = split.extraLogging) !== null && _b !== void 0 ? _b : {},
                    doLog: allocation.doLog
                  };
                }
              }
            }
          }
          return noneResult(flag.key, subjectKey, subjectAttributes);
        }
        matchesShard(shard, subjectKey, totalShards) {
          const assignedShard = this.sharder.getShard(hashKey(shard.salt, subjectKey), totalShards);
          return shard.ranges.some((range) => isInShardRange(assignedShard, range));
        }
      };
      exports.Evaluator = Evaluator;
      function isInShardRange(shard, range) {
        return range.start <= shard && shard < range.end;
      }
      exports.isInShardRange = isInShardRange;
      function hashKey(salt, subjectKey) {
        return `${salt}-${subjectKey}`;
      }
      exports.hashKey = hashKey;
      function noneResult(flagKey, subjectKey, subjectAttributes) {
        return {
          flagKey,
          subjectKey,
          subjectAttributes,
          allocationKey: null,
          variation: null,
          extraLogging: {},
          doLog: false
        };
      }
      exports.noneResult = noneResult;
      function matchesRules(rules, subjectAttributes, obfuscated) {
        return !rules.length || rules.some((rule) => (0, rules_1.matchesRule)(rule, subjectAttributes, obfuscated));
      }
      exports.matchesRules = matchesRules;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/flag-configuration-requestor.js
  var require_flag_configuration_requestor = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/flag-configuration-requestor.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var FlagConfigurationRequestor = class {
        constructor(configurationStore, httpClient) {
          this.configurationStore = configurationStore;
          this.httpClient = httpClient;
        }
        async fetchAndStoreConfigurations() {
          const responseData = await this.httpClient.getUniversalFlagConfiguration();
          if (!responseData) {
            return {};
          }
          await this.configurationStore.setEntries(responseData.flags);
          return responseData.flags;
        }
      };
      exports.default = FlagConfigurationRequestor;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/http-client.js
  var require_http_client = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/http-client.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.HttpRequestError = void 0;
      var HttpRequestError = class extends Error {
        constructor(message, status, cause) {
          super(message);
          this.message = message;
          this.status = status;
          this.cause = cause;
          if (cause) {
            this.cause = cause;
          }
        }
      };
      exports.HttpRequestError = HttpRequestError;
      var FetchHttpClient = class {
        constructor(apiEndpoints, timeout) {
          this.apiEndpoints = apiEndpoints;
          this.timeout = timeout;
        }
        async getUniversalFlagConfiguration() {
          const url = this.apiEndpoints.ufcEndpoint();
          return await this.rawGet(url);
        }
        async rawGet(url) {
          try {
            const controller = new AbortController();
            const signal = controller.signal;
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            const response = await fetch(url.toString(), { signal });
            clearTimeout(timeoutId);
            if (!response.ok) {
              throw new HttpRequestError("Failed to fetch data", response.status);
            }
            return await response.json();
          } catch (error) {
            if (error.name === "AbortError") {
              throw new HttpRequestError("Request timed out", 408, error);
            } else if (error instanceof HttpRequestError) {
              throw error;
            }
            throw new HttpRequestError("Network error", 0, error);
          }
        }
      };
      exports.default = FetchHttpClient;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/poller.js
  var require_poller = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/poller.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var application_logger_1 = require_application_logger();
      var constants_1 = require_constants();
      function initPoller(intervalMs, callback, options) {
        let stopped = false;
        let failedAttempts = 0;
        let nextPollMs = intervalMs;
        let previousPollFailed = false;
        let nextTimer = void 0;
        const start = async () => {
          var _a;
          stopped = false;
          let startRequestSuccess = false;
          let startAttemptsRemaining = (options === null || options === void 0 ? void 0 : options.skipInitialPoll) ? 0 : 1 + ((_a = options === null || options === void 0 ? void 0 : options.maxStartRetries) !== null && _a !== void 0 ? _a : constants_1.DEFAULT_INITIAL_CONFIG_REQUEST_RETRIES);
          let startErrorToThrow = null;
          while (!startRequestSuccess && startAttemptsRemaining > 0) {
            try {
              await callback();
              startRequestSuccess = true;
              previousPollFailed = false;
              application_logger_1.logger.info("Eppo SDK successfully requested initial configuration");
            } catch (pollingError) {
              previousPollFailed = true;
              application_logger_1.logger.warn(`Eppo SDK encountered an error with initial poll of configurations: ${pollingError.message}`);
              if (--startAttemptsRemaining > 0) {
                const jitterMs = randomJitterMs(intervalMs);
                application_logger_1.logger.warn(`Eppo SDK will retry the initial poll again in ${jitterMs} ms (${startAttemptsRemaining} attempts remaining)`);
                await new Promise((resolve) => setTimeout(resolve, jitterMs));
              } else {
                if (options === null || options === void 0 ? void 0 : options.pollAfterFailedStart) {
                  application_logger_1.logger.warn("Eppo SDK initial poll failed; will attempt regular polling");
                } else {
                  application_logger_1.logger.error("Eppo SDK initial poll failed. Aborting polling");
                  stop();
                }
                if (options === null || options === void 0 ? void 0 : options.errorOnFailedStart) {
                  startErrorToThrow = pollingError;
                }
              }
            }
          }
          const startRegularPolling = !stopped && (startRequestSuccess && (options === null || options === void 0 ? void 0 : options.pollAfterSuccessfulStart) || !startRequestSuccess && (options === null || options === void 0 ? void 0 : options.pollAfterFailedStart));
          if (startRegularPolling) {
            application_logger_1.logger.info(`Eppo SDK starting regularly polling every ${intervalMs} ms`);
            nextTimer = setTimeout(poll, intervalMs);
          } else {
            application_logger_1.logger.info(`Eppo SDK will not poll for configuration updates`);
          }
          if (startErrorToThrow) {
            application_logger_1.logger.info("Eppo SDK rethrowing start error");
            throw startErrorToThrow;
          }
        };
        const stop = () => {
          if (!stopped) {
            stopped = true;
            if (nextTimer) {
              clearTimeout(nextTimer);
            }
            application_logger_1.logger.info("Eppo SDK polling stopped");
          }
        };
        async function poll() {
          var _a;
          if (stopped) {
            return;
          }
          try {
            await callback();
            failedAttempts = 0;
            nextPollMs = intervalMs;
            if (previousPollFailed) {
              previousPollFailed = false;
              application_logger_1.logger.info("Eppo SDK poll successful; resuming normal polling");
            }
          } catch (error) {
            previousPollFailed = true;
            application_logger_1.logger.warn(`Eppo SDK encountered an error polling configurations: ${error.message}`);
            const maxTries = 1 + ((_a = options === null || options === void 0 ? void 0 : options.maxPollRetries) !== null && _a !== void 0 ? _a : constants_1.DEFAULT_POLL_CONFIG_REQUEST_RETRIES);
            if (++failedAttempts < maxTries) {
              const failureWaitMultiplier = Math.pow(2, failedAttempts);
              const jitterMs = randomJitterMs(intervalMs);
              nextPollMs = failureWaitMultiplier * intervalMs + jitterMs;
              application_logger_1.logger.warn(`Eppo SDK will try polling again in ${nextPollMs} ms (${maxTries - failedAttempts} attempts remaining)`);
            } else {
              application_logger_1.logger.error(`Eppo SDK reached maximum of ${failedAttempts} failed polling attempts. Stopping polling`);
              stop();
            }
          }
          setTimeout(poll, nextPollMs);
        }
        return {
          start,
          stop
        };
      }
      exports.default = initPoller;
      function randomJitterMs(intervalMs) {
        const halfPossibleJitter = intervalMs * constants_1.POLL_JITTER_PCT / 2;
        const randomOtherHalfJitter = Math.max(Math.floor(Math.random() * intervalMs * constants_1.POLL_JITTER_PCT / 2), 1);
        return halfPossibleJitter + randomOtherHalfJitter;
      }
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/validation.js
  var require_validation = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/validation.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.validateNotBlank = exports.InvalidArgumentError = void 0;
      var InvalidArgumentError = class extends Error {
      };
      exports.InvalidArgumentError = InvalidArgumentError;
      function validateNotBlank(value, errorMessage) {
        if (value == null || value.length === 0) {
          throw new InvalidArgumentError(errorMessage);
        }
      }
      exports.validateNotBlank = validateNotBlank;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/package.json
  var require_package = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/package.json"(exports, module) {
      module.exports = {
        name: "@eppo/js-client-sdk-common",
        version: "3.2.2",
        description: "Eppo SDK for client-side JavaScript applications (base for both web and react native)",
        main: "dist/index.js",
        files: [
          "/dist",
          "/src",
          "!*.spec.ts"
        ],
        types: "./dist/index.d.ts",
        engines: {
          node: ">=18.x"
        },
        exports: {
          ".": {
            types: "./dist/index.d.ts",
            default: "./dist/index.js"
          }
        },
        scripts: {
          lint: "eslint '**/*.{ts,tsx}' --cache",
          "lint:fix": "eslint --fix '**/*.{ts,tsx}' --cache",
          "lint:fix-pre-commit": "eslint -c .eslintrc.pre-commit.js --fix '**/*.{ts,tsx}' --no-eslintrc --cache",
          prepare: "make prepare",
          "pre-commit": "lint-staged && tsc",
          typecheck: "tsc",
          test: "yarn test:unit",
          "test:unit": "NODE_ENV=test jest '.*\\.spec\\.ts'",
          "obfuscate-mock-ufc": "ts-node test/writeObfuscatedMockUFC"
        },
        jsdelivr: "dist/eppo-sdk.js",
        repository: {
          type: "git",
          url: "git+https://github.com/Eppo-exp/js-client-sdk-common.git"
        },
        author: "",
        license: "MIT",
        bugs: {
          url: "https://github.com/Eppo-exp/js-client-sdk-common/issues"
        },
        homepage: "https://github.com/Eppo-exp/js-client-sdk-common#readme",
        devDependencies: {
          "@types/jest": "^29.5.11",
          "@types/js-base64": "^3.3.1",
          "@types/md5": "^2.3.2",
          "@types/semver": "^7.5.6",
          "@typescript-eslint/eslint-plugin": "^5.13.0",
          "@typescript-eslint/parser": "^5.13.0",
          eslint: "^8.17.0",
          "eslint-config-prettier": "^8.5.0",
          "eslint-import-resolver-typescript": "^2.5.0",
          "eslint-plugin-import": "^2.25.4",
          "eslint-plugin-prettier": "^4.0.0",
          "eslint-plugin-promise": "^6.0.0",
          jest: "^29.7.0",
          "jest-environment-jsdom": "^29.7.0",
          prettier: "^2.7.1",
          "terser-webpack-plugin": "^5.3.3",
          testdouble: "^3.20.1",
          "ts-jest": "^29.1.1",
          "ts-loader": "^9.3.1",
          "ts-node": "^10.9.1",
          typescript: "^4.7.4",
          webpack: "^5.73.0",
          "webpack-cli": "^4.10.0"
        },
        dependencies: {
          "js-base64": "^3.7.7",
          md5: "^2.3.0",
          pino: "^8.19.0",
          semver: "^7.5.4"
        }
      };
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/version.js
  var require_version = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/version.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.LIB_VERSION = void 0;
      var packageJson = require_package();
      exports.LIB_VERSION = packageJson.version;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/client/eppo-client.js
  var require_eppo_client = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/client/eppo-client.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.checkValueTypeMatch = exports.checkTypeMatch = void 0;
      var api_endpoints_1 = require_api_endpoints();
      var application_logger_1 = require_application_logger();
      var assignment_cache_1 = require_assignment_cache();
      var constants_1 = require_constants();
      var decoding_1 = require_decoding();
      var eppo_value_1 = require_eppo_value();
      var evaluator_1 = require_evaluator();
      var flag_configuration_requestor_1 = require_flag_configuration_requestor();
      var http_client_1 = require_http_client();
      var interfaces_1 = require_interfaces();
      var obfuscation_1 = require_obfuscation();
      var poller_1 = require_poller();
      var validation_1 = require_validation();
      var version_1 = require_version();
      var EppoClient = class {
        constructor(configurationStore, configurationRequestParameters, isObfuscated = false) {
          this.isObfuscated = isObfuscated;
          this.queuedEvents = [];
          this.isGracefulFailureMode = true;
          this.evaluator = new evaluator_1.Evaluator();
          this.configurationStore = configurationStore;
          this.configurationRequestParameters = configurationRequestParameters;
        }
        setConfigurationRequestParameters(configurationRequestParameters) {
          this.configurationRequestParameters = configurationRequestParameters;
        }
        setConfigurationStore(configurationStore) {
          this.configurationStore = configurationStore;
        }
        async fetchFlagConfigurations() {
          if (!this.configurationRequestParameters) {
            throw new Error("Eppo SDK unable to fetch flag configurations without configuration request parameters");
          }
          if (this.requestPoller) {
            this.requestPoller.stop();
          }
          const isExpired = await this.configurationStore.isExpired();
          if (!isExpired) {
            application_logger_1.logger.info("[Eppo SDK] Configuration store is not expired. Skipping fetching flag configurations");
            return;
          }
          const { apiKey, sdkName, sdkVersion, baseUrl = constants_1.BASE_URL, requestTimeoutMs = constants_1.DEFAULT_REQUEST_TIMEOUT_MS, numInitialRequestRetries = constants_1.DEFAULT_INITIAL_CONFIG_REQUEST_RETRIES, numPollRequestRetries = constants_1.DEFAULT_POLL_CONFIG_REQUEST_RETRIES, pollAfterSuccessfulInitialization = false, pollAfterFailedInitialization = false, throwOnFailedInitialization = false, skipInitialPoll = false } = this.configurationRequestParameters;
          const apiEndpoints = new api_endpoints_1.default(baseUrl, { apiKey, sdkName, sdkVersion });
          const httpClient = new http_client_1.default(apiEndpoints, requestTimeoutMs);
          const configurationRequestor = new flag_configuration_requestor_1.default(this.configurationStore, httpClient);
          this.requestPoller = (0, poller_1.default)(constants_1.POLL_INTERVAL_MS, configurationRequestor.fetchAndStoreConfigurations.bind(configurationRequestor), {
            maxStartRetries: numInitialRequestRetries,
            maxPollRetries: numPollRequestRetries,
            pollAfterSuccessfulStart: pollAfterSuccessfulInitialization,
            pollAfterFailedStart: pollAfterFailedInitialization,
            errorOnFailedStart: throwOnFailedInitialization,
            skipInitialPoll
          });
          await this.requestPoller.start();
        }
        stopPolling() {
          if (this.requestPoller) {
            this.requestPoller.stop();
          }
        }
        getStringAssignment(flagKey, subjectKey, subjectAttributes, defaultValue) {
          var _a;
          return (_a = this.getAssignmentVariation(flagKey, subjectKey, subjectAttributes, eppo_value_1.EppoValue.String(defaultValue), interfaces_1.VariationType.STRING).stringValue) !== null && _a !== void 0 ? _a : defaultValue;
        }
        getBoolAssignment(flagKey, subjectKey, subjectAttributes, defaultValue) {
          return this.getBooleanAssignment(flagKey, subjectKey, subjectAttributes, defaultValue);
        }
        getBooleanAssignment(flagKey, subjectKey, subjectAttributes, defaultValue) {
          var _a;
          return (_a = this.getAssignmentVariation(flagKey, subjectKey, subjectAttributes, eppo_value_1.EppoValue.Bool(defaultValue), interfaces_1.VariationType.BOOLEAN).boolValue) !== null && _a !== void 0 ? _a : defaultValue;
        }
        getIntegerAssignment(flagKey, subjectKey, subjectAttributes, defaultValue) {
          var _a;
          return (_a = this.getAssignmentVariation(flagKey, subjectKey, subjectAttributes, eppo_value_1.EppoValue.Numeric(defaultValue), interfaces_1.VariationType.INTEGER).numericValue) !== null && _a !== void 0 ? _a : defaultValue;
        }
        getNumericAssignment(flagKey, subjectKey, subjectAttributes, defaultValue) {
          var _a;
          return (_a = this.getAssignmentVariation(flagKey, subjectKey, subjectAttributes, eppo_value_1.EppoValue.Numeric(defaultValue), interfaces_1.VariationType.NUMERIC).numericValue) !== null && _a !== void 0 ? _a : defaultValue;
        }
        getJSONAssignment(flagKey, subjectKey, subjectAttributes, defaultValue) {
          var _a;
          return (_a = this.getAssignmentVariation(flagKey, subjectKey, subjectAttributes, eppo_value_1.EppoValue.JSON(defaultValue), interfaces_1.VariationType.JSON).objectValue) !== null && _a !== void 0 ? _a : defaultValue;
        }
        getAssignmentVariation(flagKey, subjectKey, subjectAttributes, defaultValue, expectedVariationType) {
          try {
            const result = this.getAssignmentDetail(flagKey, subjectKey, subjectAttributes, expectedVariationType);
            if (!result.variation) {
              return defaultValue;
            }
            return eppo_value_1.EppoValue.valueOf(result.variation.value, expectedVariationType);
          } catch (error) {
            return this.rethrowIfNotGraceful(error, defaultValue);
          }
        }
        rethrowIfNotGraceful(err, defaultValue) {
          if (this.isGracefulFailureMode) {
            application_logger_1.logger.error(`[Eppo SDK] Error getting assignment: ${err.message}`);
            return defaultValue !== null && defaultValue !== void 0 ? defaultValue : eppo_value_1.EppoValue.Null();
          }
          throw err;
        }
        /**
         * [Experimental] Get a detailed return of assignment for a particular subject and flag.
         *
         * Note: This method is experimental and may change in future versions.
         * Please only use for debugging purposes, and not in production.
         *
         * @param flagKey The flag key
         * @param subjectKey The subject key
         * @param subjectAttributes The subject attributes
         * @param expectedVariationType The expected variation type
         * @returns A detailed return of assignment for a particular subject and flag
         */
        getAssignmentDetail(flagKey, subjectKey, subjectAttributes = {}, expectedVariationType) {
          (0, validation_1.validateNotBlank)(subjectKey, "Invalid argument: subjectKey cannot be blank");
          (0, validation_1.validateNotBlank)(flagKey, "Invalid argument: flagKey cannot be blank");
          const flag = this.getFlag(flagKey);
          if (flag === null) {
            application_logger_1.logger.warn(`[Eppo SDK] No assigned variation. Flag not found: ${flagKey}`);
            return (0, evaluator_1.noneResult)(flagKey, subjectKey, subjectAttributes);
          }
          if (!checkTypeMatch(expectedVariationType, flag.variationType)) {
            throw new TypeError(`Variation value does not have the correct type. Found: ${flag.variationType} != ${expectedVariationType} for flag ${flagKey}`);
          }
          if (!flag.enabled) {
            application_logger_1.logger.info(`[Eppo SDK] No assigned variation. Flag is disabled: ${flagKey}`);
            return (0, evaluator_1.noneResult)(flagKey, subjectKey, subjectAttributes);
          }
          const result = this.evaluator.evaluateFlag(flag, subjectKey, subjectAttributes, this.isObfuscated);
          if (this.isObfuscated) {
            result.flagKey = flagKey;
          }
          if ((result === null || result === void 0 ? void 0 : result.variation) && !checkValueTypeMatch(expectedVariationType, result.variation.value)) {
            return (0, evaluator_1.noneResult)(flagKey, subjectKey, subjectAttributes);
          }
          try {
            if (result === null || result === void 0 ? void 0 : result.doLog) {
              this.logAssignment(result);
            }
          } catch (error) {
            application_logger_1.logger.error(`[Eppo SDK] Error logging assignment event: ${error}`);
          }
          return result;
        }
        getFlag(flagKey) {
          if (this.isObfuscated) {
            return this.getObfuscatedFlag(flagKey);
          }
          return this.configurationStore.get(flagKey);
        }
        getObfuscatedFlag(flagKey) {
          const flag = this.configurationStore.get((0, obfuscation_1.getMD5Hash)(flagKey));
          return flag ? (0, decoding_1.decodeFlag)(flag) : null;
        }
        getFlagKeys() {
          return this.configurationStore.getKeys();
        }
        isInitialized() {
          return this.configurationStore.isInitialized();
        }
        setLogger(logger) {
          this.assignmentLogger = logger;
          this.flushQueuedEvents();
        }
        /**
         * Assignment cache methods.
         */
        disableAssignmentCache() {
          this.assignmentCache = void 0;
        }
        useNonExpiringInMemoryAssignmentCache() {
          this.assignmentCache = new assignment_cache_1.NonExpiringInMemoryAssignmentCache();
        }
        useLRUInMemoryAssignmentCache(maxSize) {
          this.assignmentCache = new assignment_cache_1.LRUInMemoryAssignmentCache(maxSize);
        }
        useCustomAssignmentCache(cache) {
          this.assignmentCache = cache;
        }
        setIsGracefulFailureMode(gracefulFailureMode) {
          this.isGracefulFailureMode = gracefulFailureMode;
        }
        flushQueuedEvents() {
          var _a;
          const eventsToFlush = this.queuedEvents;
          this.queuedEvents = [];
          try {
            for (const event of eventsToFlush) {
              (_a = this.assignmentLogger) === null || _a === void 0 ? void 0 : _a.logAssignment(event);
            }
          } catch (error) {
            application_logger_1.logger.error(`[Eppo SDK] Error flushing assignment events: ${error.message}`);
          }
        }
        logAssignment(result) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j;
          const event = Object.assign(Object.assign({}, (_a = result.extraLogging) !== null && _a !== void 0 ? _a : {}), { allocation: (_b = result.allocationKey) !== null && _b !== void 0 ? _b : null, experiment: result.allocationKey ? `${result.flagKey}-${result.allocationKey}` : null, featureFlag: result.flagKey, variation: (_d = (_c = result.variation) === null || _c === void 0 ? void 0 : _c.key) !== null && _d !== void 0 ? _d : null, subject: result.subjectKey, timestamp: (/* @__PURE__ */ new Date()).toISOString(), subjectAttributes: result.subjectAttributes, metaData: {
              obfuscated: this.isObfuscated,
              sdkLanguage: "javascript",
              sdkLibVersion: version_1.LIB_VERSION
            } });
          if (result.variation && result.allocationKey && ((_e = this.assignmentCache) === null || _e === void 0 ? void 0 : _e.hasLoggedAssignment({
            flagKey: result.flagKey,
            subjectKey: result.subjectKey,
            allocationKey: result.allocationKey,
            variationKey: result.variation.key
          }))) {
            return;
          }
          if (this.assignmentLogger == null) {
            this.queuedEvents.length < constants_1.MAX_EVENT_QUEUE_SIZE && this.queuedEvents.push(event);
            return;
          }
          try {
            this.assignmentLogger.logAssignment(event);
            (_f = this.assignmentCache) === null || _f === void 0 ? void 0 : _f.setLastLoggedAssignment({
              flagKey: result.flagKey,
              subjectKey: result.subjectKey,
              allocationKey: (_g = result.allocationKey) !== null && _g !== void 0 ? _g : "__eppo_no_allocation",
              variationKey: (_j = (_h = result.variation) === null || _h === void 0 ? void 0 : _h.key) !== null && _j !== void 0 ? _j : "__eppo_no_variation"
            });
          } catch (error) {
            application_logger_1.logger.error(`[Eppo SDK] Error logging assignment event: ${error.message}`);
          }
        }
      };
      exports.default = EppoClient;
      function checkTypeMatch(expectedType, actualType) {
        return expectedType === void 0 || actualType === expectedType;
      }
      exports.checkTypeMatch = checkTypeMatch;
      function checkValueTypeMatch(expectedType, value) {
        if (expectedType == void 0) {
          return true;
        }
        switch (expectedType) {
          case interfaces_1.VariationType.STRING:
            return typeof value === "string";
          case interfaces_1.VariationType.BOOLEAN:
            return typeof value === "boolean";
          case interfaces_1.VariationType.INTEGER:
            return typeof value === "number" && Number.isInteger(value);
          case interfaces_1.VariationType.NUMERIC:
            return typeof value === "number";
          case interfaces_1.VariationType.JSON:
            return typeof value === "string";
          default:
            return false;
        }
      }
      exports.checkValueTypeMatch = checkValueTypeMatch;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/configuration-store/hybrid.store.js
  var require_hybrid_store = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/configuration-store/hybrid.store.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.HybridConfigurationStore = void 0;
      var application_logger_1 = require_application_logger();
      var HybridConfigurationStore = class {
        constructor(servingStore, persistentStore) {
          this.servingStore = servingStore;
          this.persistentStore = persistentStore;
        }
        /**
         * Initialize the configuration store by loading the entries from the persistent store into the serving store.
         */
        async init() {
          if (!this.persistentStore) {
            return;
          }
          if (!this.persistentStore.isInitialized()) {
            application_logger_1.logger.warn(`${application_logger_1.loggerPrefix} Persistent store is not initialized from remote configuration. Serving assignments that may be stale.`);
          }
          const entries = await this.persistentStore.getEntries();
          this.servingStore.setEntries(entries);
        }
        isInitialized() {
          var _a, _b;
          return this.servingStore.isInitialized() && ((_b = (_a = this.persistentStore) === null || _a === void 0 ? void 0 : _a.isInitialized()) !== null && _b !== void 0 ? _b : true);
        }
        async isExpired() {
          var _a, _b;
          const isExpired = (_b = await ((_a = this.persistentStore) === null || _a === void 0 ? void 0 : _a.isExpired())) !== null && _b !== void 0 ? _b : true;
          return isExpired;
        }
        get(key) {
          if (!this.servingStore.isInitialized()) {
            application_logger_1.logger.warn(`${application_logger_1.loggerPrefix} getting a value from a ServingStore that is not initialized.`);
          }
          return this.servingStore.get(key);
        }
        getKeys() {
          return this.servingStore.getKeys();
        }
        async setEntries(entries) {
          if (this.persistentStore) {
            await this.persistentStore.setEntries(entries);
          }
          this.servingStore.setEntries(entries);
        }
      };
      exports.HybridConfigurationStore = HybridConfigurationStore;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/configuration-store/memory.store.js
  var require_memory_store = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/configuration-store/memory.store.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.MemoryOnlyConfigurationStore = exports.MemoryStore = void 0;
      var MemoryStore = class {
        constructor() {
          this.store = {};
          this.initialized = false;
        }
        get(key) {
          var _a;
          return (_a = this.store[key]) !== null && _a !== void 0 ? _a : null;
        }
        getKeys() {
          return Object.keys(this.store);
        }
        isInitialized() {
          return this.initialized;
        }
        setEntries(entries) {
          this.store = Object.assign({}, entries);
          this.initialized = true;
        }
      };
      exports.MemoryStore = MemoryStore;
      var MemoryOnlyConfigurationStore = class {
        constructor() {
          this.servingStore = new MemoryStore();
          this.persistentStore = null;
          this.initialized = false;
        }
        init() {
          this.initialized = true;
          return Promise.resolve();
        }
        get(key) {
          return this.servingStore.get(key);
        }
        getKeys() {
          return this.servingStore.getKeys();
        }
        async isExpired() {
          return true;
        }
        isInitialized() {
          return this.initialized;
        }
        async setEntries(entries) {
          this.servingStore.setEntries(entries);
          this.initialized = true;
        }
      };
      exports.MemoryOnlyConfigurationStore = MemoryOnlyConfigurationStore;
    }
  });

  // node_modules/@eppo/js-client-sdk-common/dist/index.js
  var require_dist = __commonJS({
    "node_modules/@eppo/js-client-sdk-common/dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.VariationType = exports.LRUInMemoryAssignmentCache = exports.NonExpiringInMemoryAssignmentCache = exports.AssignmentCache = exports.MemoryOnlyConfigurationStore = exports.HybridConfigurationStore = exports.MemoryStore = exports.validation = exports.HttpClient = exports.FlagConfigRequestor = exports.constants = exports.EppoClient = exports.applicationLogger = void 0;
      var application_logger_1 = require_application_logger();
      Object.defineProperty(exports, "applicationLogger", { enumerable: true, get: function() {
          return application_logger_1.logger;
        } });
      var assignment_cache_1 = require_assignment_cache();
      Object.defineProperty(exports, "AssignmentCache", { enumerable: true, get: function() {
          return assignment_cache_1.AssignmentCache;
        } });
      Object.defineProperty(exports, "NonExpiringInMemoryAssignmentCache", { enumerable: true, get: function() {
          return assignment_cache_1.NonExpiringInMemoryAssignmentCache;
        } });
      Object.defineProperty(exports, "LRUInMemoryAssignmentCache", { enumerable: true, get: function() {
          return assignment_cache_1.LRUInMemoryAssignmentCache;
        } });
      var eppo_client_1 = require_eppo_client();
      exports.EppoClient = eppo_client_1.default;
      var hybrid_store_1 = require_hybrid_store();
      Object.defineProperty(exports, "HybridConfigurationStore", { enumerable: true, get: function() {
          return hybrid_store_1.HybridConfigurationStore;
        } });
      var memory_store_1 = require_memory_store();
      Object.defineProperty(exports, "MemoryStore", { enumerable: true, get: function() {
          return memory_store_1.MemoryStore;
        } });
      Object.defineProperty(exports, "MemoryOnlyConfigurationStore", { enumerable: true, get: function() {
          return memory_store_1.MemoryOnlyConfigurationStore;
        } });
      var constants = require_constants();
      exports.constants = constants;
      var flag_configuration_requestor_1 = require_flag_configuration_requestor();
      exports.FlagConfigRequestor = flag_configuration_requestor_1.default;
      var http_client_1 = require_http_client();
      exports.HttpClient = http_client_1.default;
      var interfaces_1 = require_interfaces();
      Object.defineProperty(exports, "VariationType", { enumerable: true, get: function() {
          return interfaces_1.VariationType;
        } });
      var validation = require_validation();
      exports.validation = validation;
    }
  });

  // package.json
  var require_package2 = __commonJS({
    "package.json"(exports, module) {
      module.exports = {
        name: "@eppo/node-server-sdk",
        version: "3.0.2",
        description: "Eppo node server SDK",
        main: "dist/index.js",
        files: [
          "/dist"
        ],
        typings: "dist/node-server-sdk.d.ts",
        scripts: {
          lint: "eslint '**/*.{ts,tsx}' '**/*.d.{ts,tsx}' --cache",
          "lint:fix": "eslint --fix '**/*.{ts,tsx}' --cache",
          "lint:fix-pre-commit": "eslint -c .eslintrc.pre-commit.js --fix '**/*.{ts,tsx}' --no-eslintrc --cache",
          prepare: "make prepare",
          "pre-commit": "lint-staged && tsc && yarn docs",
          typecheck: "tsc",
          test: "yarn test:unit",
          "test:unit": "NODE_ENV=test jest '.*\\.spec\\.ts'",
          docs: "api-documenter markdown -i ./temp -o ./docs"
        },
        repository: {
          type: "git",
          url: "git+https://github.com/Eppo-exp/node-server-sdk.git"
        },
        author: "",
        license: "MIT",
        bugs: {
          url: "https://github.com/Eppo-exp/node-server-sdk/issues"
        },
        homepage: "https://github.com/Eppo-exp/node-server-sdk#readme",
        dependencies: {
          "@eppo/js-client-sdk-common": "3.2.2",
          "lru-cache": "^10.0.1"
        },
        devDependencies: {
          "@google-cloud/storage": "^6.9.3",
          "@microsoft/api-documenter": "^7.23.9",
          "@microsoft/api-extractor": "^7.38.0",
          "@types/express": "^4.17.13",
          "@types/jest": "^29.2.4",
          "@typescript-eslint/eslint-plugin": "^5.13.0",
          "@typescript-eslint/parser": "^5.13.0",
          eslint: "7.32.0",
          "eslint-config-prettier": "^8.5.0",
          "eslint-import-resolver-typescript": "^2.5.0",
          "eslint-plugin-import": "^2.25.4",
          "eslint-plugin-prettier": "^4.0.0",
          "eslint-plugin-promise": "^6.0.0",
          express: "^4.18.0",
          husky: "^6.0.0",
          jest: "^29.7.0",
          "lint-staged": "^12.3.5",
          prettier: "^2.2.1",
          testdouble: "^3.16.4",
          "ts-jest": "^29.0.0",
          typescript: "^4.2.4"
        },
        engines: {
          node: ">=18.x",
          yarn: "1.x"
        }
      };
    }
  });

  // dist/sdk-data.js
  var require_sdk_data = __commonJS({
    "dist/sdk-data.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.sdkName = exports.sdkVersion = void 0;
      var packageJson = require_package2();
      exports.sdkVersion = packageJson.version;
      exports.sdkName = "node-server-sdk";
    }
  });

  // dist/index.js
  var require_dist2 = __commonJS({
    "dist/index.js"(exports) {
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getInstance = exports.init = void 0;
      var js_client_sdk_common_1 = require_dist();
      var sdk_data_1 = require_sdk_data();
      var clientInstance;
      async function init(config) {
        var _a, _b, _c, _d, _e, _f;
        js_client_sdk_common_1.validation.validateNotBlank(config.apiKey, "API key required");
        const configurationStore = new js_client_sdk_common_1.MemoryOnlyConfigurationStore();
        const requestConfiguration = {
          apiKey: config.apiKey,
          sdkName: sdk_data_1.sdkName,
          sdkVersion: sdk_data_1.sdkVersion,
          baseUrl: (_a = config.baseUrl) !== null && _a !== void 0 ? _a : void 0,
          requestTimeoutMs: (_b = config.requestTimeoutMs) !== null && _b !== void 0 ? _b : void 0,
          numInitialRequestRetries: (_c = config.numInitialRequestRetries) !== null && _c !== void 0 ? _c : void 0,
          numPollRequestRetries: (_d = config.numPollRequestRetries) !== null && _d !== void 0 ? _d : void 0,
          pollAfterSuccessfulInitialization: true,
          pollAfterFailedInitialization: (_e = config.pollAfterFailedInitialization) !== null && _e !== void 0 ? _e : false,
          throwOnFailedInitialization: (_f = config.throwOnFailedInitialization) !== null && _f !== void 0 ? _f : true
        };
        clientInstance = new js_client_sdk_common_1.EppoClient(configurationStore, requestConfiguration);
        clientInstance.setLogger(config.assignmentLogger);
        clientInstance.useLRUInMemoryAssignmentCache(5e4);
        await clientInstance.fetchFlagConfigurations();
        return clientInstance;
      }
      exports.init = init;
      function getInstance() {
        if (!clientInstance) {
          throw Error("Expected init() to be called to initialize a client instance");
        }
        return clientInstance;
      }
      exports.getInstance = getInstance;
    }
  });
  eppoSdk = require_dist2();
})();
/*! Bundled license information:

is-buffer/index.js:
  (*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/
