// Generated from device-services-contracts/schema/ by device-services-contracts/generate.sh. Do not edit.
/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2015-2021 Evgeny Poberezkin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports2.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// validators.js
exports.validateRemoteManagementMessage = validate52;
var schema23 = { "title": "HelloIngestion", "description": "Sampling only. No summaries, records or model updates.", "allOf": [{ "$ref": "#/$defs/HelloV4Common" }, { "type": "object", "properties": { "mode": { "description": "Always `ingestion`.", "type": "string", "enum": ["ingestion"] } }, "required": ["mode"] }] };
var pattern3 = new RegExp("\\S", "u");
var schema25 = { "description": "How the device reaches Remote Management.", "oneOf": [{ "description": "Directly over the network, as the agent does.", "type": "string", "enum": ["ip"] }, { "description": "Through the serial daemon on a host.", "type": "string", "enum": ["daemon"] }] };
function validate58(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate58.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (typeof data !== "string") {
    const err0 = { instancePath, schemaPath: "#/oneOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  if (!(data === "ip")) {
    const err1 = { instancePath, schemaPath: "#/oneOf/0/enum", keyword: "enum", params: { allowedValues: schema25.oneOf[0].enum }, message: "must be equal to one of the allowed values" };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs3 = errors;
  if (typeof data !== "string") {
    const err2 = { instancePath, schemaPath: "#/oneOf/1/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (!(data === "daemon")) {
    const err3 = { instancePath, schemaPath: "#/oneOf/1/enum", keyword: "enum", params: { allowedValues: schema25.oneOf[1].enum }, message: "must be equal to one of the allowed values" };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  var _valid0 = _errs3 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
    }
  }
  if (!valid0) {
    const err4 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
    validate58.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate58.errors = vErrors;
  return errors === 0;
}
validate58.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate60(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate60.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.name === void 0 && (missing0 = "name") || data.maxSampleLengthS === void 0 && (missing0 = "maxSampleLengthS") || data.frequencies === void 0 && (missing0 = "frequencies")) {
        validate60.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.frequencies !== void 0) {
          let data0 = data.frequencies;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (Array.isArray(data0)) {
              var valid1 = true;
              const len0 = data0.length;
              for (let i0 = 0; i0 < len0; i0++) {
                let data1 = data0[i0];
                const _errs3 = errors;
                if (errors === _errs3) {
                  if (!(typeof data1 == "number" && isFinite(data1))) {
                    validate60.errors = [{ instancePath: instancePath + "/frequencies/" + i0, schemaPath: "#/properties/frequencies/items/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                    return false;
                  }
                }
                var valid1 = _errs3 === errors;
                if (!valid1) {
                  break;
                }
              }
            } else {
              validate60.errors = [{ instancePath: instancePath + "/frequencies", schemaPath: "#/properties/frequencies/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.maxSampleLengthS !== void 0) {
            let data2 = data.maxSampleLengthS;
            const _errs5 = errors;
            if (errors === _errs5) {
              if (!(typeof data2 == "number" && isFinite(data2))) {
                validate60.errors = [{ instancePath: instancePath + "/maxSampleLengthS", schemaPath: "#/properties/maxSampleLengthS/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                return false;
              }
            }
            var valid0 = _errs5 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.name !== void 0) {
              const _errs7 = errors;
              if (typeof data.name !== "string") {
                validate60.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs7 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate60.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate60.errors = vErrors;
  return errors === 0;
}
validate60.evaluated = { "props": { "frequencies": true, "maxSampleLengthS": true, "name": true }, "dynamicProps": false, "dynamicItems": false };
var schema27 = { "description": "The Hello version the agent speaks, `4`.", "type": "integer", "enum": [4] };
function validate62(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate62.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (!(typeof data == "number" && (!(data % 1) && !isNaN(data)) && isFinite(data))) {
    validate62.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
    return false;
  }
  if (!(data === 4)) {
    validate62.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema27.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate62.errors = vErrors;
  return errors === 0;
}
validate62.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate57(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate57.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.version === void 0 && (missing0 = "version") || data.apiKey === void 0 && (missing0 = "apiKey") || data.deviceId === void 0 && (missing0 = "deviceId") || data.deviceType === void 0 && (missing0 = "deviceType") || data.connection === void 0 && (missing0 = "connection") || data.sensors === void 0 && (missing0 = "sensors") || data.supportsSnapshotStreaming === void 0 && (missing0 = "supportsSnapshotStreaming")) {
        validate57.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.name !== void 0) {
          let data0 = data.name;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (!pattern3.test(data0)) {
                validate57.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                return false;
              }
            } else {
              validate57.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.apiKey !== void 0) {
            const _errs3 = errors;
            if (typeof data.apiKey !== "string") {
              validate57.errors = [{ instancePath: instancePath + "/apiKey", schemaPath: "#/properties/apiKey/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.authorization !== void 0) {
              const _errs5 = errors;
              if (typeof data.authorization !== "string") {
                validate57.errors = [{ instancePath: instancePath + "/authorization", schemaPath: "#/properties/authorization/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.connection !== void 0) {
                const _errs7 = errors;
                if (!validate58(data.connection, { instancePath: instancePath + "/connection", parentData: data, parentDataProperty: "connection", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate58.errors : vErrors.concat(validate58.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.deviceId !== void 0) {
                  const _errs8 = errors;
                  if (typeof data.deviceId !== "string") {
                    validate57.errors = [{ instancePath: instancePath + "/deviceId", schemaPath: "#/properties/deviceId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.deviceType !== void 0) {
                    const _errs10 = errors;
                    if (typeof data.deviceType !== "string") {
                      validate57.errors = [{ instancePath: instancePath + "/deviceType", schemaPath: "#/properties/deviceType/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.sensors !== void 0) {
                      let data6 = data.sensors;
                      const _errs12 = errors;
                      if (errors === _errs12) {
                        if (Array.isArray(data6)) {
                          var valid1 = true;
                          const len0 = data6.length;
                          for (let i0 = 0; i0 < len0; i0++) {
                            const _errs14 = errors;
                            if (!validate60(data6[i0], { instancePath: instancePath + "/sensors/" + i0, parentData: data6, parentDataProperty: i0, rootData, dynamicAnchors })) {
                              vErrors = vErrors === null ? validate60.errors : vErrors.concat(validate60.errors);
                              errors = vErrors.length;
                            }
                            var valid1 = _errs14 === errors;
                            if (!valid1) {
                              break;
                            }
                          }
                        } else {
                          validate57.errors = [{ instancePath: instancePath + "/sensors", schemaPath: "#/properties/sensors/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                          return false;
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.supportsSnapshotStreaming !== void 0) {
                        const _errs15 = errors;
                        if (typeof data.supportsSnapshotStreaming !== "boolean") {
                          validate57.errors = [{ instancePath: instancePath + "/supportsSnapshotStreaming", schemaPath: "#/properties/supportsSnapshotStreaming/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                          return false;
                        }
                        var valid0 = _errs15 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.version !== void 0) {
                          const _errs17 = errors;
                          if (!validate62(data.version, { instancePath: instancePath + "/version", parentData: data, parentDataProperty: "version", rootData, dynamicAnchors })) {
                            vErrors = vErrors === null ? validate62.errors : vErrors.concat(validate62.errors);
                            errors = vErrors.length;
                          }
                          var valid0 = _errs17 === errors;
                        } else {
                          var valid0 = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate57.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate57.errors = vErrors;
  return errors === 0;
}
validate57.evaluated = { "props": { "name": true, "apiKey": true, "authorization": true, "connection": true, "deviceId": true, "deviceType": true, "sensors": true, "supportsSnapshotStreaming": true, "version": true }, "dynamicProps": false, "dynamicItems": false };
function validate56(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate56.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate57(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate57.errors : vErrors.concat(validate57.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.mode === void 0 && (missing0 = "mode")) {
          validate56.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.mode !== void 0) {
            let data0 = data.mode;
            if (typeof data0 !== "string") {
              validate56.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/allOf/1/properties/mode/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if (!(data0 === "ingestion")) {
              validate56.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/allOf/1/properties/mode/enum", keyword: "enum", params: { allowedValues: schema23.allOf[1].properties.mode.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
          }
        }
      } else {
        validate56.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate56.errors = vErrors;
  return errors === 0;
}
validate56.evaluated = { "props": { "mode": true, "name": true, "apiKey": true, "authorization": true, "connection": true, "deviceId": true, "deviceType": true, "sensors": true, "supportsSnapshotStreaming": true, "version": true }, "dynamicProps": false, "dynamicItems": false };
var schema28 = { "title": "HelloInference", "description": "Model Monitoring: summaries, records on request and model updates.", "allOf": [{ "$ref": "#/$defs/HelloV4Common" }, { "type": "object", "properties": { "availableRecords": { "description": "The range of records the device can serve on request.", "$ref": "#/$defs/AvailableRecords" }, "inferenceInfo": { "description": "The project and impulse the device serves in this session.", "$ref": "#/$defs/InferenceInfo" }, "mode": { "description": "Always `inference`.", "type": "string", "enum": ["inference"] }, "supportsMonitoringSummaryPolicy": { "description": "Whether this inference client supports receiving and refreshing Remote Management's summary interval policy. Clients that omit this field keep their existing reporting cadence.", "type": "boolean" } }, "required": ["mode", "inferenceInfo", "availableRecords"] }] };
function validate68(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate68.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.firstIndex === void 0 && (missing0 = "firstIndex") || data.firstTimestamp === void 0 && (missing0 = "firstTimestamp") || data.lastIndex === void 0 && (missing0 = "lastIndex") || data.lastTimestamp === void 0 && (missing0 = "lastTimestamp")) {
        validate68.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.firstIndex !== void 0) {
          let data0 = data.firstIndex;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate68.errors = [{ instancePath: instancePath + "/firstIndex", schemaPath: "#/properties/firstIndex/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate68.errors = [{ instancePath: instancePath + "/firstIndex", schemaPath: "#/properties/firstIndex/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.firstTimestamp !== void 0) {
            let data1 = data.firstTimestamp;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate68.errors = [{ instancePath: instancePath + "/firstTimestamp", schemaPath: "#/properties/firstTimestamp/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.lastIndex !== void 0) {
              let data2 = data.lastIndex;
              const _errs5 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate68.errors = [{ instancePath: instancePath + "/lastIndex", schemaPath: "#/properties/lastIndex/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs5) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (data2 < 0 || isNaN(data2)) {
                    validate68.errors = [{ instancePath: instancePath + "/lastIndex", schemaPath: "#/properties/lastIndex/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.lastTimestamp !== void 0) {
                let data3 = data.lastTimestamp;
                const _errs7 = errors;
                if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                  validate68.errors = [{ instancePath: instancePath + "/lastTimestamp", schemaPath: "#/properties/lastTimestamp/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate68.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate68.errors = vErrors;
  return errors === 0;
}
validate68.evaluated = { "props": { "firstIndex": true, "firstTimestamp": true, "lastIndex": true, "lastTimestamp": true }, "dynamicProps": false, "dynamicItems": false };
var schema31 = { "description": "What an impulse's learn block produces.", "type": "string", "enum": ["classification", "object_detection", "constrained_object_detection", "freeform"] };
function validate71(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate71.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate71.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  if (!(data === "classification" || data === "object_detection" || data === "constrained_object_detection" || data === "freeform")) {
    validate71.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema31.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate71.errors = vErrors;
  return errors === 0;
}
validate71.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate70(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate70.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.projectId === void 0 && (missing0 = "projectId") || data.projectOwner === void 0 && (missing0 = "projectOwner") || data.projectName === void 0 && (missing0 = "projectName") || data.deploymentVersion === void 0 && (missing0 = "deploymentVersion") || data.modelType === void 0 && (missing0 = "modelType")) {
        validate70.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.deploymentVersion !== void 0) {
          let data0 = data.deploymentVersion;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate70.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate70.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.modelType !== void 0) {
            const _errs3 = errors;
            if (!validate71(data.modelType, { instancePath: instancePath + "/modelType", parentData: data, parentDataProperty: "modelType", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.projectId !== void 0) {
              let data2 = data.projectId;
              const _errs4 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate70.errors = [{ instancePath: instancePath + "/projectId", schemaPath: "#/properties/projectId/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs4) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (data2 < 0 || isNaN(data2)) {
                    validate70.errors = [{ instancePath: instancePath + "/projectId", schemaPath: "#/properties/projectId/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.projectName !== void 0) {
                const _errs6 = errors;
                if (typeof data.projectName !== "string") {
                  validate70.errors = [{ instancePath: instancePath + "/projectName", schemaPath: "#/properties/projectName/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.projectOwner !== void 0) {
                  const _errs8 = errors;
                  if (typeof data.projectOwner !== "string") {
                    validate70.errors = [{ instancePath: instancePath + "/projectOwner", schemaPath: "#/properties/projectOwner/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate70.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate70.errors = vErrors;
  return errors === 0;
}
validate70.evaluated = { "props": { "deploymentVersion": true, "modelType": true, "projectId": true, "projectName": true, "projectOwner": true }, "dynamicProps": false, "dynamicItems": false };
function validate66(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate66.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate57(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate57.errors : vErrors.concat(validate57.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.mode === void 0 && (missing0 = "mode") || data.inferenceInfo === void 0 && (missing0 = "inferenceInfo") || data.availableRecords === void 0 && (missing0 = "availableRecords")) {
          validate66.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.availableRecords !== void 0) {
            const _errs3 = errors;
            if (!validate68(data.availableRecords, { instancePath: instancePath + "/availableRecords", parentData: data, parentDataProperty: "availableRecords", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate68.errors : vErrors.concat(validate68.errors);
              errors = vErrors.length;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.inferenceInfo !== void 0) {
              const _errs4 = errors;
              if (!validate70(data.inferenceInfo, { instancePath: instancePath + "/inferenceInfo", parentData: data, parentDataProperty: "inferenceInfo", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate70.errors : vErrors.concat(validate70.errors);
                errors = vErrors.length;
              }
              var valid1 = _errs4 === errors;
            } else {
              var valid1 = true;
            }
            if (valid1) {
              if (data.mode !== void 0) {
                let data2 = data.mode;
                const _errs5 = errors;
                if (typeof data2 !== "string") {
                  validate66.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/allOf/1/properties/mode/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if (!(data2 === "inference")) {
                  validate66.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/allOf/1/properties/mode/enum", keyword: "enum", params: { allowedValues: schema28.allOf[1].properties.mode.enum }, message: "must be equal to one of the allowed values" }];
                  return false;
                }
                var valid1 = _errs5 === errors;
              } else {
                var valid1 = true;
              }
              if (valid1) {
                if (data.supportsMonitoringSummaryPolicy !== void 0) {
                  const _errs7 = errors;
                  if (typeof data.supportsMonitoringSummaryPolicy !== "boolean") {
                    validate66.errors = [{ instancePath: instancePath + "/supportsMonitoringSummaryPolicy", schemaPath: "#/allOf/1/properties/supportsMonitoringSummaryPolicy/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                    return false;
                  }
                  var valid1 = _errs7 === errors;
                } else {
                  var valid1 = true;
                }
              }
            }
          }
        }
      } else {
        validate66.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate66.errors = vErrors;
  return errors === 0;
}
validate66.evaluated = { "props": { "availableRecords": true, "inferenceInfo": true, "mode": true, "supportsMonitoringSummaryPolicy": true, "name": true, "apiKey": true, "authorization": true, "connection": true, "deviceId": true, "deviceType": true, "sensors": true, "supportsSnapshotStreaming": true, "version": true }, "dynamicProps": false, "dynamicItems": false };
function validate55(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate55.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate56(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.mode = true;
    props0.name = true;
    props0.apiKey = true;
    props0.authorization = true;
    props0.connection = true;
    props0.deviceId = true;
    props0.deviceType = true;
    props0.sensors = true;
    props0.supportsSnapshotStreaming = true;
    props0.version = true;
  }
  const _errs2 = errors;
  if (!validate66(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate66.errors : vErrors.concat(validate66.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.availableRecords = true;
        props0.inferenceInfo = true;
        props0.mode = true;
        props0.supportsMonitoringSummaryPolicy = true;
        props0.name = true;
        props0.apiKey = true;
        props0.authorization = true;
        props0.connection = true;
        props0.deviceId = true;
        props0.deviceType = true;
        props0.sensors = true;
        props0.supportsSnapshotStreaming = true;
        props0.version = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate55.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate55.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate55.evaluated = { "dynamicProps": true, "dynamicItems": false };
function validate54(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate54.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.hello === void 0 && (missing0 = "hello")) {
        validate54.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.hello !== void 0) {
          if (!validate55(data.hello, { instancePath: instancePath + "/hello", parentData: data, parentDataProperty: "hello", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate55.errors : vErrors.concat(validate55.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate54.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate54.errors = vErrors;
  return errors === 0;
}
validate54.evaluated = { "props": { "hello": true }, "dynamicProps": false, "dynamicItems": false };
function validate77(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate77.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.sample === void 0 && (missing0 = "sample")) {
        validate77.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.sample !== void 0) {
          const _errs1 = errors;
          if (typeof data.sample !== "boolean") {
            validate77.errors = [{ instancePath: instancePath + "/sample", schemaPath: "#/properties/sample/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.error !== void 0) {
            const _errs3 = errors;
            if (typeof data.error !== "string") {
              validate77.errors = [{ instancePath: instancePath + "/error", schemaPath: "#/properties/error/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate77.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate77.errors = vErrors;
  return errors === 0;
}
validate77.evaluated = { "props": { "sample": true, "error": true }, "dynamicProps": false, "dynamicItems": false };
function validate79(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate79.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.sampleStarted === void 0 && (missing0 = "sampleStarted")) {
        validate79.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.sampleStarted !== void 0) {
          if (typeof data.sampleStarted !== "boolean") {
            validate79.errors = [{ instancePath: instancePath + "/sampleStarted", schemaPath: "#/properties/sampleStarted/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate79.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate79.errors = vErrors;
  return errors === 0;
}
validate79.evaluated = { "props": { "sampleStarted": true }, "dynamicProps": false, "dynamicItems": false };
function validate81(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate81.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.sampleReading === void 0 && (missing0 = "sampleReading") || data.progressPercentage === void 0 && (missing0 = "progressPercentage")) {
        validate81.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.sampleReading !== void 0) {
          const _errs1 = errors;
          if (typeof data.sampleReading !== "boolean") {
            validate81.errors = [{ instancePath: instancePath + "/sampleReading", schemaPath: "#/properties/sampleReading/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.progressPercentage !== void 0) {
            let data1 = data.progressPercentage;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (!(typeof data1 == "number" && isFinite(data1))) {
                validate81.errors = [{ instancePath: instancePath + "/progressPercentage", schemaPath: "#/properties/progressPercentage/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate81.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate81.errors = vErrors;
  return errors === 0;
}
validate81.evaluated = { "props": { "sampleReading": true, "progressPercentage": true }, "dynamicProps": false, "dynamicItems": false };
function validate83(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate83.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.sampleUploading === void 0 && (missing0 = "sampleUploading")) {
        validate83.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.sampleUploading !== void 0) {
          if (typeof data.sampleUploading !== "boolean") {
            validate83.errors = [{ instancePath: instancePath + "/sampleUploading", schemaPath: "#/properties/sampleUploading/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate83.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate83.errors = vErrors;
  return errors === 0;
}
validate83.evaluated = { "props": { "sampleUploading": true }, "dynamicProps": false, "dynamicItems": false };
function validate85(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate85.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.sampleProcessing === void 0 && (missing0 = "sampleProcessing")) {
        validate85.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.sampleProcessing !== void 0) {
          if (typeof data.sampleProcessing !== "boolean") {
            validate85.errors = [{ instancePath: instancePath + "/sampleProcessing", schemaPath: "#/properties/sampleProcessing/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate85.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate85.errors = vErrors;
  return errors === 0;
}
validate85.evaluated = { "props": { "sampleProcessing": true }, "dynamicProps": false, "dynamicItems": false };
function validate87(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate87.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.sampleFinished === void 0 && (missing0 = "sampleFinished")) {
        validate87.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.sampleFinished !== void 0) {
          if (typeof data.sampleFinished !== "boolean") {
            validate87.errors = [{ instancePath: instancePath + "/sampleFinished", schemaPath: "#/properties/sampleFinished/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate87.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate87.errors = vErrors;
  return errors === 0;
}
validate87.evaluated = { "props": { "sampleFinished": true }, "dynamicProps": false, "dynamicItems": false };
function validate89(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate89.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.snapshotStarted === void 0 && (missing0 = "snapshotStarted")) {
        validate89.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.snapshotStarted !== void 0) {
          if (typeof data.snapshotStarted !== "boolean") {
            validate89.errors = [{ instancePath: instancePath + "/snapshotStarted", schemaPath: "#/properties/snapshotStarted/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate89.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate89.errors = vErrors;
  return errors === 0;
}
validate89.evaluated = { "props": { "snapshotStarted": true }, "dynamicProps": false, "dynamicItems": false };
function validate91(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate91.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.snapshotStopped === void 0 && (missing0 = "snapshotStopped")) {
        validate91.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.snapshotStopped !== void 0) {
          if (typeof data.snapshotStopped !== "boolean") {
            validate91.errors = [{ instancePath: instancePath + "/snapshotStopped", schemaPath: "#/properties/snapshotStopped/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate91.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate91.errors = vErrors;
  return errors === 0;
}
validate91.evaluated = { "props": { "snapshotStopped": true }, "dynamicProps": false, "dynamicItems": false };
function validate93(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate93.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.snapshotFailed === void 0 && (missing0 = "snapshotFailed") || data.error === void 0 && (missing0 = "error")) {
        validate93.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.snapshotFailed !== void 0) {
          const _errs1 = errors;
          if (typeof data.snapshotFailed !== "boolean") {
            validate93.errors = [{ instancePath: instancePath + "/snapshotFailed", schemaPath: "#/properties/snapshotFailed/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.error !== void 0) {
            const _errs3 = errors;
            if (typeof data.error !== "string") {
              validate93.errors = [{ instancePath: instancePath + "/error", schemaPath: "#/properties/error/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate93.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate93.errors = vErrors;
  return errors === 0;
}
validate93.evaluated = { "props": { "snapshotFailed": true, "error": true }, "dynamicProps": false, "dynamicItems": false };
function validate95(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate95.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.snapshotFrame === void 0 && (missing0 = "snapshotFrame") || data.fileName === void 0 && (missing0 = "fileName")) {
        validate95.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.snapshotFrame !== void 0) {
          const _errs1 = errors;
          if (typeof data.snapshotFrame !== "string") {
            validate95.errors = [{ instancePath: instancePath + "/snapshotFrame", schemaPath: "#/properties/snapshotFrame/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.fileName !== void 0) {
            const _errs3 = errors;
            if (typeof data.fileName !== "string") {
              validate95.errors = [{ instancePath: instancePath + "/fileName", schemaPath: "#/properties/fileName/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate95.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate95.errors = vErrors;
  return errors === 0;
}
validate95.evaluated = { "props": { "snapshotFrame": true, "fileName": true }, "dynamicProps": false, "dynamicItems": false };
function validate97(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate97.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.inferenceStreamStarted === void 0 && (missing0 = "inferenceStreamStarted")) {
        validate97.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.inferenceStreamStarted !== void 0) {
          if (typeof data.inferenceStreamStarted !== "boolean") {
            validate97.errors = [{ instancePath: instancePath + "/inferenceStreamStarted", schemaPath: "#/properties/inferenceStreamStarted/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate97.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate97.errors = vErrors;
  return errors === 0;
}
validate97.evaluated = { "props": { "inferenceStreamStarted": true }, "dynamicProps": false, "dynamicItems": false };
function validate99(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate99.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.inferenceStreamStopped === void 0 && (missing0 = "inferenceStreamStopped")) {
        validate99.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.inferenceStreamStopped !== void 0) {
          if (typeof data.inferenceStreamStopped !== "boolean") {
            validate99.errors = [{ instancePath: instancePath + "/inferenceStreamStopped", schemaPath: "#/properties/inferenceStreamStopped/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate99.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate99.errors = vErrors;
  return errors === 0;
}
validate99.evaluated = { "props": { "inferenceStreamStopped": true }, "dynamicProps": false, "dynamicItems": false };
function validate101(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate101.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.inferenceStreamFailed === void 0 && (missing0 = "inferenceStreamFailed") || data.error === void 0 && (missing0 = "error")) {
        validate101.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.inferenceStreamFailed !== void 0) {
          const _errs1 = errors;
          if (typeof data.inferenceStreamFailed !== "boolean") {
            validate101.errors = [{ instancePath: instancePath + "/inferenceStreamFailed", schemaPath: "#/properties/inferenceStreamFailed/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.error !== void 0) {
            const _errs3 = errors;
            if (typeof data.error !== "string") {
              validate101.errors = [{ instancePath: instancePath + "/error", schemaPath: "#/properties/error/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate101.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate101.errors = vErrors;
  return errors === 0;
}
validate101.evaluated = { "props": { "inferenceStreamFailed": true, "error": true }, "dynamicProps": false, "dynamicItems": false };
function validate103(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate103.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.inferenceStarted === void 0 && (missing0 = "inferenceStarted")) {
        validate103.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.inferenceStarted !== void 0) {
          if (typeof data.inferenceStarted !== "boolean") {
            validate103.errors = [{ instancePath: instancePath + "/inferenceStarted", schemaPath: "#/properties/inferenceStarted/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate103.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate103.errors = vErrors;
  return errors === 0;
}
validate103.evaluated = { "props": { "inferenceStarted": true }, "dynamicProps": false, "dynamicItems": false };
function validate107(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate107.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.label === void 0 && (missing0 = "label") || data.value === void 0 && (missing0 = "value")) {
        validate107.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.label !== void 0) {
          const _errs1 = errors;
          if (typeof data.label !== "string") {
            validate107.errors = [{ instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.value !== void 0) {
            let data1 = data.value;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (!(typeof data1 == "number" && isFinite(data1))) {
                validate107.errors = [{ instancePath: instancePath + "/value", schemaPath: "#/properties/value/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate107.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate107.errors = vErrors;
  return errors === 0;
}
validate107.evaluated = { "props": { "label": true, "value": true }, "dynamicProps": false, "dynamicItems": false };
function validate109(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate109.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.index === void 0 && (missing0 = "index") || data.timestamp === void 0 && (missing0 = "timestamp")) {
        validate109.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.index !== void 0) {
          let data0 = data.index;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate109.errors = [{ instancePath: instancePath + "/index", schemaPath: "#/properties/index/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate109.errors = [{ instancePath: instancePath + "/index", schemaPath: "#/properties/index/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.timestamp !== void 0) {
            let data1 = data.timestamp;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate109.errors = [{ instancePath: instancePath + "/timestamp", schemaPath: "#/properties/timestamp/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate109.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate109.errors = vErrors;
  return errors === 0;
}
validate109.evaluated = { "props": { "index": true, "timestamp": true }, "dynamicProps": false, "dynamicItems": false };
function validate113(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate113.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.dsp === void 0 && (missing0 = "dsp") || data.classification === void 0 && (missing0 = "classification")) {
        validate113.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.anomaly !== void 0) {
          let data0 = data.anomaly;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (!(typeof data0 == "number" && isFinite(data0))) {
              validate113.errors = [{ instancePath: instancePath + "/anomaly", schemaPath: "#/properties/anomaly/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.classification !== void 0) {
            let data1 = data.classification;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (!(typeof data1 == "number" && isFinite(data1))) {
                validate113.errors = [{ instancePath: instancePath + "/classification", schemaPath: "#/properties/classification/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.dsp !== void 0) {
              let data2 = data.dsp;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (!(typeof data2 == "number" && isFinite(data2))) {
                  validate113.errors = [{ instancePath: instancePath + "/dsp", schemaPath: "#/properties/dsp/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate113.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate113.errors = vErrors;
  return errors === 0;
}
validate113.evaluated = { "props": { "anomaly": true, "classification": true, "dsp": true }, "dynamicProps": false, "dynamicItems": false };
function validate112(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate112.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.avg_inference_time !== void 0) {
        const _errs1 = errors;
        if (!validate113(data.avg_inference_time, { instancePath: instancePath + "/avg_inference_time", parentData: data, parentDataProperty: "avg_inference_time", rootData, dynamicAnchors })) {
          vErrors = vErrors === null ? validate113.errors : vErrors.concat(validate113.errors);
          errors = vErrors.length;
        }
        var valid0 = _errs1 === errors;
      } else {
        var valid0 = true;
      }
      if (valid0) {
        if (data.visual_anomaly_mean !== void 0) {
          let data1 = data.visual_anomaly_mean;
          const _errs2 = errors;
          if (errors === _errs2) {
            if (!(typeof data1 == "number" && isFinite(data1))) {
              validate112.errors = [{ instancePath: instancePath + "/visual_anomaly_mean", schemaPath: "#/properties/visual_anomaly_mean/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs2 === errors;
        } else {
          var valid0 = true;
        }
      }
    } else {
      validate112.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate112.errors = vErrors;
  return errors === 0;
}
validate112.evaluated = { "props": { "avg_inference_time": true, "visual_anomaly_mean": true }, "dynamicProps": false, "dynamicItems": false };
function validate106(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate106.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.start === void 0 && (missing0 = "start") || data.end === void 0 && (missing0 = "end") || data.classificationCounter === void 0 && (missing0 = "classificationCounter") || data.mean === void 0 && (missing0 = "mean") || data.standardDeviation === void 0 && (missing0 = "standardDeviation") || data.metrics === void 0 && (missing0 = "metrics")) {
        validate106.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.classificationCounter !== void 0) {
          let data0 = data.classificationCounter;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (Array.isArray(data0)) {
              var valid1 = true;
              const len0 = data0.length;
              for (let i0 = 0; i0 < len0; i0++) {
                const _errs3 = errors;
                if (!validate107(data0[i0], { instancePath: instancePath + "/classificationCounter/" + i0, parentData: data0, parentDataProperty: i0, rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate107.errors : vErrors.concat(validate107.errors);
                  errors = vErrors.length;
                }
                var valid1 = _errs3 === errors;
                if (!valid1) {
                  break;
                }
              }
            } else {
              validate106.errors = [{ instancePath: instancePath + "/classificationCounter", schemaPath: "#/properties/classificationCounter/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.end !== void 0) {
            const _errs4 = errors;
            if (!validate109(data.end, { instancePath: instancePath + "/end", parentData: data, parentDataProperty: "end", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate109.errors : vErrors.concat(validate109.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs4 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.mean !== void 0) {
              let data3 = data.mean;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (Array.isArray(data3)) {
                  var valid2 = true;
                  const len1 = data3.length;
                  for (let i1 = 0; i1 < len1; i1++) {
                    const _errs7 = errors;
                    if (!validate107(data3[i1], { instancePath: instancePath + "/mean/" + i1, parentData: data3, parentDataProperty: i1, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate107.errors : vErrors.concat(validate107.errors);
                      errors = vErrors.length;
                    }
                    var valid2 = _errs7 === errors;
                    if (!valid2) {
                      break;
                    }
                  }
                } else {
                  validate106.errors = [{ instancePath: instancePath + "/mean", schemaPath: "#/properties/mean/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.metrics !== void 0) {
                const _errs8 = errors;
                if (!validate112(data.metrics, { instancePath: instancePath + "/metrics", parentData: data, parentDataProperty: "metrics", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate112.errors : vErrors.concat(validate112.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs8 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.rulesVersion !== void 0) {
                  let data6 = data.rulesVersion;
                  const _errs9 = errors;
                  if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
                    validate106.errors = [{ instancePath: instancePath + "/rulesVersion", schemaPath: "#/properties/rulesVersion/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                    return false;
                  }
                  if (errors === _errs9) {
                    if (typeof data6 == "number" && isFinite(data6)) {
                      if (data6 < 0 || isNaN(data6)) {
                        validate106.errors = [{ instancePath: instancePath + "/rulesVersion", schemaPath: "#/properties/rulesVersion/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                        return false;
                      }
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.standardDeviation !== void 0) {
                    let data7 = data.standardDeviation;
                    const _errs11 = errors;
                    if (errors === _errs11) {
                      if (Array.isArray(data7)) {
                        var valid3 = true;
                        const len2 = data7.length;
                        for (let i2 = 0; i2 < len2; i2++) {
                          const _errs13 = errors;
                          if (!validate107(data7[i2], { instancePath: instancePath + "/standardDeviation/" + i2, parentData: data7, parentDataProperty: i2, rootData, dynamicAnchors })) {
                            vErrors = vErrors === null ? validate107.errors : vErrors.concat(validate107.errors);
                            errors = vErrors.length;
                          }
                          var valid3 = _errs13 === errors;
                          if (!valid3) {
                            break;
                          }
                        }
                      } else {
                        validate106.errors = [{ instancePath: instancePath + "/standardDeviation", schemaPath: "#/properties/standardDeviation/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                        return false;
                      }
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.start !== void 0) {
                      const _errs14 = errors;
                      if (!validate109(data.start, { instancePath: instancePath + "/start", parentData: data, parentDataProperty: "start", rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate109.errors : vErrors.concat(validate109.errors);
                        errors = vErrors.length;
                      }
                      var valid0 = _errs14 === errors;
                    } else {
                      var valid0 = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate106.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate106.errors = vErrors;
  return errors === 0;
}
validate106.evaluated = { "props": { "classificationCounter": true, "end": true, "mean": true, "metrics": true, "rulesVersion": true, "standardDeviation": true, "start": true }, "dynamicProps": false, "dynamicItems": false };
function validate105(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate105.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.inferenceSummary === void 0 && (missing0 = "inferenceSummary")) {
        validate105.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.inferenceSummary !== void 0) {
          if (!validate106(data.inferenceSummary, { instancePath: instancePath + "/inferenceSummary", parentData: data, parentDataProperty: "inferenceSummary", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate106.errors : vErrors.concat(validate106.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate105.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate105.errors = vErrors;
  return errors === 0;
}
validate105.evaluated = { "props": { "inferenceSummary": true }, "dynamicProps": false, "dynamicItems": false };
function validate123(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate123.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.label === void 0 && (missing0 = "label") || data.value === void 0 && (missing0 = "value") || data.x === void 0 && (missing0 = "x") || data.y === void 0 && (missing0 = "y") || data.width === void 0 && (missing0 = "width") || data.height === void 0 && (missing0 = "height")) {
        validate123.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.height !== void 0) {
          let data0 = data.height;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (!(typeof data0 == "number" && isFinite(data0))) {
              validate123.errors = [{ instancePath: instancePath + "/height", schemaPath: "#/properties/height/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.label !== void 0) {
            const _errs3 = errors;
            if (typeof data.label !== "string") {
              validate123.errors = [{ instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.value !== void 0) {
              let data2 = data.value;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (!(typeof data2 == "number" && isFinite(data2))) {
                  validate123.errors = [{ instancePath: instancePath + "/value", schemaPath: "#/properties/value/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.width !== void 0) {
                let data3 = data.width;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (!(typeof data3 == "number" && isFinite(data3))) {
                    validate123.errors = [{ instancePath: instancePath + "/width", schemaPath: "#/properties/width/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                    return false;
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.x !== void 0) {
                  let data4 = data.x;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (!(typeof data4 == "number" && isFinite(data4))) {
                      validate123.errors = [{ instancePath: instancePath + "/x", schemaPath: "#/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.y !== void 0) {
                    let data5 = data.y;
                    const _errs11 = errors;
                    if (errors === _errs11) {
                      if (!(typeof data5 == "number" && isFinite(data5))) {
                        validate123.errors = [{ instancePath: instancePath + "/y", schemaPath: "#/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                        return false;
                      }
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate123.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate123.errors = vErrors;
  return errors === 0;
}
validate123.evaluated = { "props": { "height": true, "label": true, "value": true, "width": true, "x": true, "y": true }, "dynamicProps": false, "dynamicItems": false };
function validate125(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate125.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.object_id === void 0 && (missing0 = "object_id") || data.label === void 0 && (missing0 = "label") || data.value === void 0 && (missing0 = "value") || data.x === void 0 && (missing0 = "x") || data.y === void 0 && (missing0 = "y") || data.width === void 0 && (missing0 = "width") || data.height === void 0 && (missing0 = "height")) {
        validate125.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.height !== void 0) {
          let data0 = data.height;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (!(typeof data0 == "number" && isFinite(data0))) {
              validate125.errors = [{ instancePath: instancePath + "/height", schemaPath: "#/properties/height/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.label !== void 0) {
            const _errs3 = errors;
            if (typeof data.label !== "string") {
              validate125.errors = [{ instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.object_id !== void 0) {
              let data2 = data.object_id;
              const _errs5 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate125.errors = [{ instancePath: instancePath + "/object_id", schemaPath: "#/properties/object_id/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs5) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (data2 < 0 || isNaN(data2)) {
                    validate125.errors = [{ instancePath: instancePath + "/object_id", schemaPath: "#/properties/object_id/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.value !== void 0) {
                let data3 = data.value;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (!(typeof data3 == "number" && isFinite(data3))) {
                    validate125.errors = [{ instancePath: instancePath + "/value", schemaPath: "#/properties/value/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                    return false;
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.width !== void 0) {
                  let data4 = data.width;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (!(typeof data4 == "number" && isFinite(data4))) {
                      validate125.errors = [{ instancePath: instancePath + "/width", schemaPath: "#/properties/width/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.x !== void 0) {
                    let data5 = data.x;
                    const _errs11 = errors;
                    if (errors === _errs11) {
                      if (!(typeof data5 == "number" && isFinite(data5))) {
                        validate125.errors = [{ instancePath: instancePath + "/x", schemaPath: "#/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                        return false;
                      }
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.y !== void 0) {
                      let data6 = data.y;
                      const _errs13 = errors;
                      if (errors === _errs13) {
                        if (!(typeof data6 == "number" && isFinite(data6))) {
                          validate125.errors = [{ instancePath: instancePath + "/y", schemaPath: "#/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                          return false;
                        }
                      }
                      var valid0 = _errs13 === errors;
                    } else {
                      var valid0 = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate125.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate125.errors = vErrors;
  return errors === 0;
}
validate125.evaluated = { "props": { "height": true, "label": true, "object_id": true, "value": true, "width": true, "x": true, "y": true }, "dynamicProps": false, "dynamicItems": false };
var schema57 = { "description": "How the runner resized the input image before inference.", "type": "string", "enum": ["none", "fit-shortest", "fit-longest", "squash"] };
function validate127(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate127.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate127.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  if (!(data === "none" || data === "fit-shortest" || data === "fit-longest" || data === "squash")) {
    validate127.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema57.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate127.errors = vErrors;
  return errors === 0;
}
validate127.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate129(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate129.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.originalWidth === void 0 && (missing0 = "originalWidth") || data.originalHeight === void 0 && (missing0 = "originalHeight") || data.newWidth === void 0 && (missing0 = "newWidth") || data.newHeight === void 0 && (missing0 = "newHeight")) {
        validate129.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.newHeight !== void 0) {
          let data0 = data.newHeight;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate129.errors = [{ instancePath: instancePath + "/newHeight", schemaPath: "#/properties/newHeight/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate129.errors = [{ instancePath: instancePath + "/newHeight", schemaPath: "#/properties/newHeight/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.newWidth !== void 0) {
            let data1 = data.newWidth;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate129.errors = [{ instancePath: instancePath + "/newWidth", schemaPath: "#/properties/newWidth/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs3) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 0 || isNaN(data1)) {
                  validate129.errors = [{ instancePath: instancePath + "/newWidth", schemaPath: "#/properties/newWidth/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.originalHeight !== void 0) {
              let data2 = data.originalHeight;
              const _errs5 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate129.errors = [{ instancePath: instancePath + "/originalHeight", schemaPath: "#/properties/originalHeight/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs5) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (data2 < 0 || isNaN(data2)) {
                    validate129.errors = [{ instancePath: instancePath + "/originalHeight", schemaPath: "#/properties/originalHeight/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.originalWidth !== void 0) {
                let data3 = data.originalWidth;
                const _errs7 = errors;
                if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                  validate129.errors = [{ instancePath: instancePath + "/originalWidth", schemaPath: "#/properties/originalWidth/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs7) {
                  if (typeof data3 == "number" && isFinite(data3)) {
                    if (data3 < 0 || isNaN(data3)) {
                      validate129.errors = [{ instancePath: instancePath + "/originalWidth", schemaPath: "#/properties/originalWidth/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate129.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate129.errors = vErrors;
  return errors === 0;
}
validate129.evaluated = { "props": { "newHeight": true, "newWidth": true, "originalHeight": true, "originalWidth": true }, "dynamicProps": false, "dynamicItems": false };
function validate122(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate122.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.anomaly !== void 0) {
        let data0 = data.anomaly;
        const _errs1 = errors;
        if (errors === _errs1) {
          if (!(typeof data0 == "number" && isFinite(data0))) {
            validate122.errors = [{ instancePath: instancePath + "/anomaly", schemaPath: "#/properties/anomaly/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
            return false;
          }
        }
        var valid0 = _errs1 === errors;
      } else {
        var valid0 = true;
      }
      if (valid0) {
        if (data.bounding_boxes !== void 0) {
          let data1 = data.bounding_boxes;
          const _errs3 = errors;
          if (errors === _errs3) {
            if (Array.isArray(data1)) {
              var valid1 = true;
              const len0 = data1.length;
              for (let i0 = 0; i0 < len0; i0++) {
                const _errs5 = errors;
                if (!validate123(data1[i0], { instancePath: instancePath + "/bounding_boxes/" + i0, parentData: data1, parentDataProperty: i0, rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate123.errors : vErrors.concat(validate123.errors);
                  errors = vErrors.length;
                }
                var valid1 = _errs5 === errors;
                if (!valid1) {
                  break;
                }
              }
            } else {
              validate122.errors = [{ instancePath: instancePath + "/bounding_boxes", schemaPath: "#/properties/bounding_boxes/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
              return false;
            }
          }
          var valid0 = _errs3 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.classification !== void 0) {
            let data3 = data.classification;
            const _errs6 = errors;
            if (errors === _errs6) {
              if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
                for (const key0 in data3) {
                  let data4 = data3[key0];
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (!(typeof data4 == "number" && isFinite(data4))) {
                      validate122.errors = [{ instancePath: instancePath + "/classification/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/classification/additionalProperties/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                  }
                  var valid2 = _errs9 === errors;
                  if (!valid2) {
                    break;
                  }
                }
              } else {
                validate122.errors = [{ instancePath: instancePath + "/classification", schemaPath: "#/properties/classification/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                return false;
              }
            }
            var valid0 = _errs6 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.freeform !== void 0) {
              let data5 = data.freeform;
              const _errs11 = errors;
              if (errors === _errs11) {
                if (Array.isArray(data5)) {
                  var valid3 = true;
                  const len1 = data5.length;
                  for (let i1 = 0; i1 < len1; i1++) {
                    let data6 = data5[i1];
                    const _errs13 = errors;
                    if (errors === _errs13) {
                      if (Array.isArray(data6)) {
                        var valid4 = true;
                        const len2 = data6.length;
                        for (let i2 = 0; i2 < len2; i2++) {
                          let data7 = data6[i2];
                          const _errs15 = errors;
                          if (errors === _errs15) {
                            if (!(typeof data7 == "number" && isFinite(data7))) {
                              validate122.errors = [{ instancePath: instancePath + "/freeform/" + i1 + "/" + i2, schemaPath: "#/properties/freeform/items/items/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                              return false;
                            }
                          }
                          var valid4 = _errs15 === errors;
                          if (!valid4) {
                            break;
                          }
                        }
                      } else {
                        validate122.errors = [{ instancePath: instancePath + "/freeform/" + i1, schemaPath: "#/properties/freeform/items/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                        return false;
                      }
                    }
                    var valid3 = _errs13 === errors;
                    if (!valid3) {
                      break;
                    }
                  }
                } else {
                  validate122.errors = [{ instancePath: instancePath + "/freeform", schemaPath: "#/properties/freeform/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs11 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.object_tracking !== void 0) {
                let data8 = data.object_tracking;
                const _errs17 = errors;
                if (errors === _errs17) {
                  if (Array.isArray(data8)) {
                    var valid5 = true;
                    const len3 = data8.length;
                    for (let i3 = 0; i3 < len3; i3++) {
                      const _errs19 = errors;
                      if (!validate125(data8[i3], { instancePath: instancePath + "/object_tracking/" + i3, parentData: data8, parentDataProperty: i3, rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate125.errors : vErrors.concat(validate125.errors);
                        errors = vErrors.length;
                      }
                      var valid5 = _errs19 === errors;
                      if (!valid5) {
                        break;
                      }
                    }
                  } else {
                    validate122.errors = [{ instancePath: instancePath + "/object_tracking", schemaPath: "#/properties/object_tracking/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                    return false;
                  }
                }
                var valid0 = _errs17 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.resizeMode !== void 0) {
                  const _errs20 = errors;
                  if (!validate127(data.resizeMode, { instancePath: instancePath + "/resizeMode", parentData: data, parentDataProperty: "resizeMode", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate127.errors : vErrors.concat(validate127.errors);
                    errors = vErrors.length;
                  }
                  var valid0 = _errs20 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.resized !== void 0) {
                    const _errs21 = errors;
                    if (!validate129(data.resized, { instancePath: instancePath + "/resized", parentData: data, parentDataProperty: "resized", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate129.errors : vErrors.concat(validate129.errors);
                      errors = vErrors.length;
                    }
                    var valid0 = _errs21 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.visual_anomaly_grid !== void 0) {
                      let data12 = data.visual_anomaly_grid;
                      const _errs22 = errors;
                      if (errors === _errs22) {
                        if (Array.isArray(data12)) {
                          var valid6 = true;
                          const len4 = data12.length;
                          for (let i4 = 0; i4 < len4; i4++) {
                            const _errs24 = errors;
                            if (!validate123(data12[i4], { instancePath: instancePath + "/visual_anomaly_grid/" + i4, parentData: data12, parentDataProperty: i4, rootData, dynamicAnchors })) {
                              vErrors = vErrors === null ? validate123.errors : vErrors.concat(validate123.errors);
                              errors = vErrors.length;
                            }
                            var valid6 = _errs24 === errors;
                            if (!valid6) {
                              break;
                            }
                          }
                        } else {
                          validate122.errors = [{ instancePath: instancePath + "/visual_anomaly_grid", schemaPath: "#/properties/visual_anomaly_grid/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                          return false;
                        }
                      }
                      var valid0 = _errs22 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.visual_anomaly_max !== void 0) {
                        let data14 = data.visual_anomaly_max;
                        const _errs25 = errors;
                        if (errors === _errs25) {
                          if (!(typeof data14 == "number" && isFinite(data14))) {
                            validate122.errors = [{ instancePath: instancePath + "/visual_anomaly_max", schemaPath: "#/properties/visual_anomaly_max/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                            return false;
                          }
                        }
                        var valid0 = _errs25 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.visual_anomaly_mean !== void 0) {
                          let data15 = data.visual_anomaly_mean;
                          const _errs27 = errors;
                          if (errors === _errs27) {
                            if (!(typeof data15 == "number" && isFinite(data15))) {
                              validate122.errors = [{ instancePath: instancePath + "/visual_anomaly_mean", schemaPath: "#/properties/visual_anomaly_mean/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                              return false;
                            }
                          }
                          var valid0 = _errs27 === errors;
                        } else {
                          var valid0 = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate122.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate122.errors = vErrors;
  return errors === 0;
}
validate122.evaluated = { "props": { "anomaly": true, "bounding_boxes": true, "classification": true, "freeform": true, "object_tracking": true, "resizeMode": true, "resized": true, "visual_anomaly_grid": true, "visual_anomaly_max": true, "visual_anomaly_mean": true }, "dynamicProps": false, "dynamicItems": false };
function validate133(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate133.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.dsp === void 0 && (missing0 = "dsp") || data.classification === void 0 && (missing0 = "classification") || data.anomaly === void 0 && (missing0 = "anomaly")) {
        validate133.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.anomaly !== void 0) {
          let data0 = data.anomaly;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (!(typeof data0 == "number" && isFinite(data0))) {
              validate133.errors = [{ instancePath: instancePath + "/anomaly", schemaPath: "#/properties/anomaly/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.classification !== void 0) {
            let data1 = data.classification;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (!(typeof data1 == "number" && isFinite(data1))) {
                validate133.errors = [{ instancePath: instancePath + "/classification", schemaPath: "#/properties/classification/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.dsp !== void 0) {
              let data2 = data.dsp;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (!(typeof data2 == "number" && isFinite(data2))) {
                  validate133.errors = [{ instancePath: instancePath + "/dsp", schemaPath: "#/properties/dsp/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.postprocessing !== void 0) {
                let data3 = data.postprocessing;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (!(typeof data3 == "number" && isFinite(data3))) {
                    validate133.errors = [{ instancePath: instancePath + "/postprocessing", schemaPath: "#/properties/postprocessing/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                    return false;
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate133.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate133.errors = vErrors;
  return errors === 0;
}
validate133.evaluated = { "props": { "anomaly": true, "classification": true, "dsp": true, "postprocessing": true }, "dynamicProps": false, "dynamicItems": false };
function validate121(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate121.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.result === void 0 && (missing0 = "result") || data.timing === void 0 && (missing0 = "timing")) {
        validate121.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.result !== void 0) {
          const _errs1 = errors;
          if (!validate122(data.result, { instancePath: instancePath + "/result", parentData: data, parentDataProperty: "result", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate122.errors : vErrors.concat(validate122.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.timing !== void 0) {
            const _errs2 = errors;
            if (!validate133(data.timing, { instancePath: instancePath + "/timing", parentData: data, parentDataProperty: "timing", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate133.errors : vErrors.concat(validate133.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate121.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate121.errors = vErrors;
  return errors === 0;
}
validate121.evaluated = { "props": { "result": true, "timing": true }, "dynamicProps": false, "dynamicItems": false };
var schema61 = { "description": "The encoding of a sample or an input.", "type": "string", "enum": ["wav", "jpg"] };
function validate137(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate137.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate137.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  if (!(data === "wav" || data === "jpg")) {
    validate137.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema61.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate137.errors = vErrors;
  return errors === 0;
}
validate137.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate136(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate136.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.type === void 0 && (missing0 = "type") || data.bufferBase64 === void 0 && (missing0 = "bufferBase64")) {
        validate136.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.bufferBase64 !== void 0) {
          const _errs1 = errors;
          if (typeof data.bufferBase64 !== "string") {
            validate136.errors = [{ instancePath: instancePath + "/bufferBase64", schemaPath: "#/properties/bufferBase64/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.type !== void 0) {
            const _errs3 = errors;
            if (!validate137(data.type, { instancePath: instancePath + "/type", parentData: data, parentDataProperty: "type", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate137.errors : vErrors.concat(validate137.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate136.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate136.errors = vErrors;
  return errors === 0;
}
validate136.evaluated = { "props": { "bufferBase64": true, "type": true }, "dynamicProps": false, "dynamicItems": false };
function validate120(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate120.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.impulseRecord === void 0 && (missing0 = "impulseRecord") || data.timestamp === void 0 && (missing0 = "timestamp") || data.index === void 0 && (missing0 = "index") || data.rawData === void 0 && (missing0 = "rawData")) {
        validate120.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.impulseRecord !== void 0) {
          const _errs1 = errors;
          if (!validate121(data.impulseRecord, { instancePath: instancePath + "/impulseRecord", parentData: data, parentDataProperty: "impulseRecord", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate121.errors : vErrors.concat(validate121.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.timestamp !== void 0) {
            let data1 = data.timestamp;
            const _errs2 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate120.errors = [{ instancePath: instancePath + "/timestamp", schemaPath: "#/properties/timestamp/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.index !== void 0) {
              let data2 = data.index;
              const _errs4 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate120.errors = [{ instancePath: instancePath + "/index", schemaPath: "#/properties/index/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs4) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (data2 < 0 || isNaN(data2)) {
                    validate120.errors = [{ instancePath: instancePath + "/index", schemaPath: "#/properties/index/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.rawData !== void 0) {
                const _errs6 = errors;
                if (!validate136(data.rawData, { instancePath: instancePath + "/rawData", parentData: data, parentDataProperty: "rawData", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate136.errors : vErrors.concat(validate136.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate120.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate120.errors = vErrors;
  return errors === 0;
}
validate120.evaluated = { "props": { "impulseRecord": true, "timestamp": true, "index": true, "rawData": true }, "dynamicProps": false, "dynamicItems": false };
function validate141(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate141.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.impulseRecordsResponse === void 0 && (missing0 = "impulseRecordsResponse")) {
        validate141.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.error !== void 0) {
          const _errs1 = errors;
          if (typeof data.error !== "string") {
            validate141.errors = [{ instancePath: instancePath + "/error", schemaPath: "#/properties/error/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.impulseRecordsResponse !== void 0) {
            const _errs3 = errors;
            if (typeof data.impulseRecordsResponse !== "boolean") {
              validate141.errors = [{ instancePath: instancePath + "/impulseRecordsResponse", schemaPath: "#/properties/impulseRecordsResponse/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.index !== void 0) {
              let data2 = data.index;
              const _errs5 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate141.errors = [{ instancePath: instancePath + "/index", schemaPath: "#/properties/index/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs5) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (data2 < 0 || isNaN(data2)) {
                    validate141.errors = [{ instancePath: instancePath + "/index", schemaPath: "#/properties/index/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.rawData !== void 0) {
                const _errs7 = errors;
                if (!validate136(data.rawData, { instancePath: instancePath + "/rawData", parentData: data, parentDataProperty: "rawData", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate136.errors : vErrors.concat(validate136.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.record !== void 0) {
                  const _errs8 = errors;
                  if (!validate121(data.record, { instancePath: instancePath + "/record", parentData: data, parentDataProperty: "record", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate121.errors : vErrors.concat(validate121.errors);
                    errors = vErrors.length;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.timestamp !== void 0) {
                    let data5 = data.timestamp;
                    const _errs9 = errors;
                    if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5)) && isFinite(data5))) {
                      validate141.errors = [{ instancePath: instancePath + "/timestamp", schemaPath: "#/properties/timestamp/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                      return false;
                    }
                    var valid0 = _errs9 === errors;
                  } else {
                    var valid0 = true;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate141.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate141.errors = vErrors;
  return errors === 0;
}
validate141.evaluated = { "props": { "error": true, "impulseRecordsResponse": true, "index": true, "rawData": true, "record": true, "timestamp": true }, "dynamicProps": false, "dynamicItems": false };
var schema64 = { "title": "ModelUpdateSuccess", "description": "The new version runs and registered with the agent.", "type": "object", "properties": { "bundleDigest": { "description": "New, optional. The verified digest of the inference bundle now active, including after rollback. Identifies the deployed model or workflow independently of the container image; absent when no verified bundle digest is available.", "type": "string", "minLength": 1 }, "imageDigest": { "description": "New, optional. The digest of the container image now running, when known. Bundle activation can leave this unchanged; bundleDigest identifies the active inference bundle.", "type": "string" }, "inferenceInfo": { "description": "The project and impulse the device serves after the update.", "$ref": "#/$defs/InferenceInfo" }, "modelUpdateSuccess": { "description": "Always `true`.", "type": "boolean", "enum": [true] }, "operation": { "description": "New, optional. Which operation finished. The agent always sends it.", "$ref": "#/$defs/UpdateOperation" } }, "required": ["modelUpdateSuccess", "inferenceInfo"] };
var func1 = require_ucs2length().default;
var schema65 = { "description": "Which way a model update went.", "type": "string", "enum": ["deploy", "rollback"] };
function validate148(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate148.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate148.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  if (!(data === "deploy" || data === "rollback")) {
    validate148.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema65.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate148.errors = vErrors;
  return errors === 0;
}
validate148.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate146(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate146.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.modelUpdateSuccess === void 0 && (missing0 = "modelUpdateSuccess") || data.inferenceInfo === void 0 && (missing0 = "inferenceInfo")) {
        validate146.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.bundleDigest !== void 0) {
          let data0 = data.bundleDigest;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (func1(data0) < 1) {
                validate146.errors = [{ instancePath: instancePath + "/bundleDigest", schemaPath: "#/properties/bundleDigest/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                return false;
              }
            } else {
              validate146.errors = [{ instancePath: instancePath + "/bundleDigest", schemaPath: "#/properties/bundleDigest/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.imageDigest !== void 0) {
            const _errs3 = errors;
            if (typeof data.imageDigest !== "string") {
              validate146.errors = [{ instancePath: instancePath + "/imageDigest", schemaPath: "#/properties/imageDigest/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.inferenceInfo !== void 0) {
              const _errs5 = errors;
              if (!validate70(data.inferenceInfo, { instancePath: instancePath + "/inferenceInfo", parentData: data, parentDataProperty: "inferenceInfo", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate70.errors : vErrors.concat(validate70.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.modelUpdateSuccess !== void 0) {
                let data3 = data.modelUpdateSuccess;
                const _errs6 = errors;
                if (typeof data3 !== "boolean") {
                  validate146.errors = [{ instancePath: instancePath + "/modelUpdateSuccess", schemaPath: "#/properties/modelUpdateSuccess/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                  return false;
                }
                if (!(data3 === true)) {
                  validate146.errors = [{ instancePath: instancePath + "/modelUpdateSuccess", schemaPath: "#/properties/modelUpdateSuccess/enum", keyword: "enum", params: { allowedValues: schema64.properties.modelUpdateSuccess.enum }, message: "must be equal to one of the allowed values" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.operation !== void 0) {
                  const _errs8 = errors;
                  if (!validate148(data.operation, { instancePath: instancePath + "/operation", parentData: data, parentDataProperty: "operation", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate148.errors : vErrors.concat(validate148.errors);
                    errors = vErrors.length;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate146.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate146.errors = vErrors;
  return errors === 0;
}
validate146.evaluated = { "props": { "bundleDigest": true, "imageDigest": true, "inferenceInfo": true, "modelUpdateSuccess": true, "operation": true }, "dynamicProps": false, "dynamicItems": false };
var schema66 = { "title": "ModelUpdateFailure", "description": "The update failed, and the previous version runs again.", "type": "object", "properties": { "deploymentVersion": { "description": "New, optional. The version that failed to come up.", "type": "integer", "format": "uint32", "minimum": 0 }, "error": { "description": "Why the update failed.", "type": "string" }, "modelUpdateSuccess": { "description": "Always `false`.", "type": "boolean", "enum": [false] }, "operation": { "description": "New, optional. Which operation failed.", "$ref": "#/$defs/UpdateOperation" } }, "required": ["modelUpdateSuccess", "error"] };
function validate151(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate151.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.modelUpdateSuccess === void 0 && (missing0 = "modelUpdateSuccess") || data.error === void 0 && (missing0 = "error")) {
        validate151.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.deploymentVersion !== void 0) {
          let data0 = data.deploymentVersion;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate151.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate151.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.error !== void 0) {
            const _errs3 = errors;
            if (typeof data.error !== "string") {
              validate151.errors = [{ instancePath: instancePath + "/error", schemaPath: "#/properties/error/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.modelUpdateSuccess !== void 0) {
              let data2 = data.modelUpdateSuccess;
              const _errs5 = errors;
              if (typeof data2 !== "boolean") {
                validate151.errors = [{ instancePath: instancePath + "/modelUpdateSuccess", schemaPath: "#/properties/modelUpdateSuccess/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                return false;
              }
              if (!(data2 === false)) {
                validate151.errors = [{ instancePath: instancePath + "/modelUpdateSuccess", schemaPath: "#/properties/modelUpdateSuccess/enum", keyword: "enum", params: { allowedValues: schema66.properties.modelUpdateSuccess.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.operation !== void 0) {
                const _errs7 = errors;
                if (!validate148(data.operation, { instancePath: instancePath + "/operation", parentData: data, parentDataProperty: "operation", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate148.errors : vErrors.concat(validate148.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate151.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate151.errors = vErrors;
  return errors === 0;
}
validate151.evaluated = { "props": { "deploymentVersion": true, "error": true, "modelUpdateSuccess": true, "operation": true }, "dynamicProps": false, "dynamicItems": false };
function validate145(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate145.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate146(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate146.errors : vErrors.concat(validate146.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.bundleDigest = true;
    props0.imageDigest = true;
    props0.inferenceInfo = true;
    props0.modelUpdateSuccess = true;
    props0.operation = true;
  }
  const _errs2 = errors;
  if (!validate151(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate151.errors : vErrors.concat(validate151.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.deploymentVersion = true;
        props0.error = true;
        props0.modelUpdateSuccess = true;
        props0.operation = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate145.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate145.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate145.evaluated = { "dynamicProps": true, "dynamicItems": false };
function validate157(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate157.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.version === void 0 && (missing0 = "version") || data.os === void 0 && (missing0 = "os") || data.arch === void 0 && (missing0 = "arch")) {
        validate157.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.arch !== void 0) {
          const _errs1 = errors;
          if (typeof data.arch !== "string") {
            validate157.errors = [{ instancePath: instancePath + "/arch", schemaPath: "#/properties/arch/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.os !== void 0) {
            const _errs3 = errors;
            if (typeof data.os !== "string") {
              validate157.errors = [{ instancePath: instancePath + "/os", schemaPath: "#/properties/os/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.version !== void 0) {
              const _errs5 = errors;
              if (typeof data.version !== "string") {
                validate157.errors = [{ instancePath: instancePath + "/version", schemaPath: "#/properties/version/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate157.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate157.errors = vErrors;
  return errors === 0;
}
validate157.evaluated = { "props": { "arch": true, "os": true, "version": true }, "dynamicProps": false, "dynamicItems": false };
function validate159(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate159.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.capturesDeleted !== void 0) {
        let data0 = data.capturesDeleted;
        const _errs1 = errors;
        if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
          validate159.errors = [{ instancePath: instancePath + "/capturesDeleted", schemaPath: "#/properties/capturesDeleted/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
          return false;
        }
        if (errors === _errs1) {
          if (typeof data0 == "number" && isFinite(data0)) {
            if (data0 < 0 || isNaN(data0)) {
              validate159.errors = [{ instancePath: instancePath + "/capturesDeleted", schemaPath: "#/properties/capturesDeleted/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
              return false;
            }
          }
        }
        var valid0 = _errs1 === errors;
      } else {
        var valid0 = true;
      }
      if (valid0) {
        if (data.capturesPending !== void 0) {
          let data1 = data.capturesPending;
          const _errs3 = errors;
          if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
            validate159.errors = [{ instancePath: instancePath + "/capturesPending", schemaPath: "#/properties/capturesPending/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs3) {
            if (typeof data1 == "number" && isFinite(data1)) {
              if (data1 < 0 || isNaN(data1)) {
                validate159.errors = [{ instancePath: instancePath + "/capturesPending", schemaPath: "#/properties/capturesPending/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs3 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.capturesRefused !== void 0) {
            let data2 = data.capturesRefused;
            const _errs5 = errors;
            if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
              validate159.errors = [{ instancePath: instancePath + "/capturesRefused", schemaPath: "#/properties/capturesRefused/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs5) {
              if (typeof data2 == "number" && isFinite(data2)) {
                if (data2 < 0 || isNaN(data2)) {
                  validate159.errors = [{ instancePath: instancePath + "/capturesRefused", schemaPath: "#/properties/capturesRefused/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid0 = _errs5 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.connectedS !== void 0) {
              let data3 = data.connectedS;
              const _errs7 = errors;
              if (errors === _errs7) {
                if (!(typeof data3 == "number" && isFinite(data3))) {
                  validate159.errors = [{ instancePath: instancePath + "/connectedS", schemaPath: "#/properties/connectedS/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                  return false;
                }
              }
              var valid0 = _errs7 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.reconnects !== void 0) {
                let data4 = data.reconnects;
                const _errs9 = errors;
                if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
                  validate159.errors = [{ instancePath: instancePath + "/reconnects", schemaPath: "#/properties/reconnects/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs9) {
                  if (typeof data4 == "number" && isFinite(data4)) {
                    if (data4 < 0 || isNaN(data4)) {
                      validate159.errors = [{ instancePath: instancePath + "/reconnects", schemaPath: "#/properties/reconnects/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs9 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.uploadsDroppedByBudget !== void 0) {
                  let data5 = data.uploadsDroppedByBudget;
                  const _errs11 = errors;
                  if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5)) && isFinite(data5))) {
                    validate159.errors = [{ instancePath: instancePath + "/uploadsDroppedByBudget", schemaPath: "#/properties/uploadsDroppedByBudget/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                    return false;
                  }
                  if (errors === _errs11) {
                    if (typeof data5 == "number" && isFinite(data5)) {
                      if (data5 < 0 || isNaN(data5)) {
                        validate159.errors = [{ instancePath: instancePath + "/uploadsDroppedByBudget", schemaPath: "#/properties/uploadsDroppedByBudget/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                        return false;
                      }
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.uploadsQueued !== void 0) {
                    let data6 = data.uploadsQueued;
                    const _errs13 = errors;
                    if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
                      validate159.errors = [{ instancePath: instancePath + "/uploadsQueued", schemaPath: "#/properties/uploadsQueued/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                      return false;
                    }
                    if (errors === _errs13) {
                      if (typeof data6 == "number" && isFinite(data6)) {
                        if (data6 < 0 || isNaN(data6)) {
                          validate159.errors = [{ instancePath: instancePath + "/uploadsQueued", schemaPath: "#/properties/uploadsQueued/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                          return false;
                        }
                      }
                    }
                    var valid0 = _errs13 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.uploadsRejected !== void 0) {
                      let data7 = data.uploadsRejected;
                      const _errs15 = errors;
                      if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                        validate159.errors = [{ instancePath: instancePath + "/uploadsRejected", schemaPath: "#/properties/uploadsRejected/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                        return false;
                      }
                      if (errors === _errs15) {
                        if (typeof data7 == "number" && isFinite(data7)) {
                          if (data7 < 0 || isNaN(data7)) {
                            validate159.errors = [{ instancePath: instancePath + "/uploadsRejected", schemaPath: "#/properties/uploadsRejected/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                            return false;
                          }
                        }
                      }
                      var valid0 = _errs15 === errors;
                    } else {
                      var valid0 = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate159.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate159.errors = vErrors;
  return errors === 0;
}
validate159.evaluated = { "props": { "capturesDeleted": true, "capturesPending": true, "capturesRefused": true, "connectedS": true, "reconnects": true, "uploadsDroppedByBudget": true, "uploadsQueued": true, "uploadsRejected": true }, "dynamicProps": false, "dynamicItems": false };
function validate162(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate162.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data["system.filesystem.free"] !== void 0) {
        let data0 = data["system.filesystem.free"];
        const _errs1 = errors;
        if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
          validate162.errors = [{ instancePath: instancePath + "/system.filesystem.free", schemaPath: "#/properties/system.filesystem.free/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
          return false;
        }
        if (errors === _errs1) {
          if (typeof data0 == "number" && isFinite(data0)) {
            if (data0 < 0 || isNaN(data0)) {
              validate162.errors = [{ instancePath: instancePath + "/system.filesystem.free", schemaPath: "#/properties/system.filesystem.free/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
              return false;
            }
          }
        }
        var valid0 = _errs1 === errors;
      } else {
        var valid0 = true;
      }
      if (valid0) {
        if (data["system.filesystem.utilization"] !== void 0) {
          let data1 = data["system.filesystem.utilization"];
          const _errs3 = errors;
          if (errors === _errs3) {
            if (!(typeof data1 == "number" && isFinite(data1))) {
              validate162.errors = [{ instancePath: instancePath + "/system.filesystem.utilization", schemaPath: "#/properties/system.filesystem.utilization/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs3 === errors;
        } else {
          var valid0 = true;
        }
      }
    } else {
      validate162.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate162.errors = vErrors;
  return errors === 0;
}
validate162.evaluated = { "props": { "system.filesystem.free": true, "system.filesystem.utilization": true }, "dynamicProps": false, "dynamicItems": false };
function validate161(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate161.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data["hw.temperature"] !== void 0) {
        let data0 = data["hw.temperature"];
        const _errs1 = errors;
        if (errors === _errs1) {
          if (!(typeof data0 == "number" && isFinite(data0))) {
            validate161.errors = [{ instancePath: instancePath + "/hw.temperature", schemaPath: "#/properties/hw.temperature/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
            return false;
          }
        }
        var valid0 = _errs1 === errors;
      } else {
        var valid0 = true;
      }
      if (valid0) {
        if (data.spoolVolume !== void 0) {
          const _errs3 = errors;
          if (!validate162(data.spoolVolume, { instancePath: instancePath + "/spoolVolume", parentData: data, parentDataProperty: "spoolVolume", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate162.errors : vErrors.concat(validate162.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs3 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.stateVolume !== void 0) {
            const _errs4 = errors;
            if (!validate162(data.stateVolume, { instancePath: instancePath + "/stateVolume", parentData: data, parentDataProperty: "stateVolume", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate162.errors : vErrors.concat(validate162.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs4 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data["system.cpu.utilization"] !== void 0) {
              let data3 = data["system.cpu.utilization"];
              const _errs5 = errors;
              if (errors === _errs5) {
                if (!(typeof data3 == "number" && isFinite(data3))) {
                  validate161.errors = [{ instancePath: instancePath + "/system.cpu.utilization", schemaPath: "#/properties/system.cpu.utilization/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data["system.memory.usage"] !== void 0) {
                let data4 = data["system.memory.usage"];
                const _errs7 = errors;
                if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
                  validate161.errors = [{ instancePath: instancePath + "/system.memory.usage", schemaPath: "#/properties/system.memory.usage/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs7) {
                  if (typeof data4 == "number" && isFinite(data4)) {
                    if (data4 < 0 || isNaN(data4)) {
                      validate161.errors = [{ instancePath: instancePath + "/system.memory.usage", schemaPath: "#/properties/system.memory.usage/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data["system.memory.utilization"] !== void 0) {
                  let data5 = data["system.memory.utilization"];
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (!(typeof data5 == "number" && isFinite(data5))) {
                      validate161.errors = [{ instancePath: instancePath + "/system.memory.utilization", schemaPath: "#/properties/system.memory.utilization/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data["system.uptime"] !== void 0) {
                    let data6 = data["system.uptime"];
                    const _errs11 = errors;
                    if (errors === _errs11) {
                      if (!(typeof data6 == "number" && isFinite(data6))) {
                        validate161.errors = [{ instancePath: instancePath + "/system.uptime", schemaPath: "#/properties/system.uptime/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                        return false;
                      }
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate161.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate161.errors = vErrors;
  return errors === 0;
}
validate161.evaluated = { "props": { "hw.temperature": true, "spoolVolume": true, "stateVolume": true, "system.cpu.utilization": true, "system.memory.usage": true, "system.memory.utilization": true, "system.uptime": true }, "dynamicProps": false, "dynamicItems": false };
function validate167(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate167.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.operation === void 0 && (missing0 = "operation") || data.deploymentVersion === void 0 && (missing0 = "deploymentVersion") || data.success === void 0 && (missing0 = "success") || data.timestamp === void 0 && (missing0 = "timestamp")) {
        validate167.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.deploymentVersion !== void 0) {
          let data0 = data.deploymentVersion;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate167.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate167.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.error !== void 0) {
            const _errs3 = errors;
            if (typeof data.error !== "string") {
              validate167.errors = [{ instancePath: instancePath + "/error", schemaPath: "#/properties/error/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.operation !== void 0) {
              const _errs5 = errors;
              if (!validate148(data.operation, { instancePath: instancePath + "/operation", parentData: data, parentDataProperty: "operation", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate148.errors : vErrors.concat(validate148.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.success !== void 0) {
                const _errs6 = errors;
                if (typeof data.success !== "boolean") {
                  validate167.errors = [{ instancePath: instancePath + "/success", schemaPath: "#/properties/success/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.timestamp !== void 0) {
                  let data4 = data.timestamp;
                  const _errs8 = errors;
                  if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
                    validate167.errors = [{ instancePath: instancePath + "/timestamp", schemaPath: "#/properties/timestamp/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate167.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate167.errors = vErrors;
  return errors === 0;
}
validate167.evaluated = { "props": { "deploymentVersion": true, "error": true, "operation": true, "success": true, "timestamp": true }, "dynamicProps": false, "dynamicItems": false };
var schema75 = { "description": "What the agent knows about a workload's life.", "oneOf": [{ "description": "Started, not registered yet.", "type": "string", "enum": ["starting"] }, { "description": "Registered, with a live command stream.", "type": "string", "enum": ["running"] }, { "description": "The command stream stayed down past the timeout.", "type": "string", "enum": ["unhealthy"] }, { "description": "Not running.", "type": "string", "enum": ["stopped"] }] };
function validate170(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate170.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (typeof data !== "string") {
    const err0 = { instancePath, schemaPath: "#/oneOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  if (!(data === "starting")) {
    const err1 = { instancePath, schemaPath: "#/oneOf/0/enum", keyword: "enum", params: { allowedValues: schema75.oneOf[0].enum }, message: "must be equal to one of the allowed values" };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs3 = errors;
  if (typeof data !== "string") {
    const err2 = { instancePath, schemaPath: "#/oneOf/1/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (!(data === "running")) {
    const err3 = { instancePath, schemaPath: "#/oneOf/1/enum", keyword: "enum", params: { allowedValues: schema75.oneOf[1].enum }, message: "must be equal to one of the allowed values" };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  var _valid0 = _errs3 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
    }
    const _errs5 = errors;
    if (typeof data !== "string") {
      const err4 = { instancePath, schemaPath: "#/oneOf/2/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (!(data === "unhealthy")) {
      const err5 = { instancePath, schemaPath: "#/oneOf/2/enum", keyword: "enum", params: { allowedValues: schema75.oneOf[2].enum }, message: "must be equal to one of the allowed values" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    var _valid0 = _errs5 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
      }
      const _errs7 = errors;
      if (typeof data !== "string") {
        const err6 = { instancePath, schemaPath: "#/oneOf/3/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (!(data === "stopped")) {
        const err7 = { instancePath, schemaPath: "#/oneOf/3/enum", keyword: "enum", params: { allowedValues: schema75.oneOf[3].enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid0 = _errs7 === errors;
      if (_valid0 && valid0) {
        valid0 = false;
        passing0 = [passing0, 3];
      } else {
        if (_valid0) {
          valid0 = true;
          passing0 = 3;
        }
      }
    }
  }
  if (!valid0) {
    const err8 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
    validate170.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate170.errors = vErrors;
  return errors === 0;
}
validate170.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate166(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate166.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.workloadId === void 0 && (missing0 = "workloadId") || data.state === void 0 && (missing0 = "state")) {
        validate166.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.acceleratorUtilization !== void 0) {
          let data0 = data.acceleratorUtilization;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (!(typeof data0 == "number" && isFinite(data0))) {
              validate166.errors = [{ instancePath: instancePath + "/acceleratorUtilization", schemaPath: "#/properties/acceleratorUtilization/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data["container.cpu.utilization"] !== void 0) {
            let data1 = data["container.cpu.utilization"];
            const _errs3 = errors;
            if (errors === _errs3) {
              if (!(typeof data1 == "number" && isFinite(data1))) {
                validate166.errors = [{ instancePath: instancePath + "/container.cpu.utilization", schemaPath: "#/properties/container.cpu.utilization/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data["container.memory.usage"] !== void 0) {
              let data2 = data["container.memory.usage"];
              const _errs5 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate166.errors = [{ instancePath: instancePath + "/container.memory.usage", schemaPath: "#/properties/container.memory.usage/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs5) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (data2 < 0 || isNaN(data2)) {
                    validate166.errors = [{ instancePath: instancePath + "/container.memory.usage", schemaPath: "#/properties/container.memory.usage/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.deploymentVersion !== void 0) {
                let data3 = data.deploymentVersion;
                const _errs7 = errors;
                if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                  validate166.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs7) {
                  if (typeof data3 == "number" && isFinite(data3)) {
                    if (data3 < 0 || isNaN(data3)) {
                      validate166.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.eventsPerSecond !== void 0) {
                  let data4 = data.eventsPerSecond;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (!(typeof data4 == "number" && isFinite(data4))) {
                      validate166.errors = [{ instancePath: instancePath + "/eventsPerSecond", schemaPath: "#/properties/eventsPerSecond/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.imageDigest !== void 0) {
                    const _errs11 = errors;
                    if (typeof data.imageDigest !== "string") {
                      validate166.errors = [{ instancePath: instancePath + "/imageDigest", schemaPath: "#/properties/imageDigest/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.imageVerified !== void 0) {
                      const _errs13 = errors;
                      if (typeof data.imageVerified !== "boolean") {
                        validate166.errors = [{ instancePath: instancePath + "/imageVerified", schemaPath: "#/properties/imageVerified/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                        return false;
                      }
                      var valid0 = _errs13 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.inferenceErrors !== void 0) {
                        let data7 = data.inferenceErrors;
                        const _errs15 = errors;
                        if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                          validate166.errors = [{ instancePath: instancePath + "/inferenceErrors", schemaPath: "#/properties/inferenceErrors/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                          return false;
                        }
                        if (errors === _errs15) {
                          if (typeof data7 == "number" && isFinite(data7)) {
                            if (data7 < 0 || isNaN(data7)) {
                              validate166.errors = [{ instancePath: instancePath + "/inferenceErrors", schemaPath: "#/properties/inferenceErrors/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                              return false;
                            }
                          }
                        }
                        var valid0 = _errs15 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.lastUpdate !== void 0) {
                          const _errs17 = errors;
                          if (!validate167(data.lastUpdate, { instancePath: instancePath + "/lastUpdate", parentData: data, parentDataProperty: "lastUpdate", rootData, dynamicAnchors })) {
                            vErrors = vErrors === null ? validate167.errors : vErrors.concat(validate167.errors);
                            errors = vErrors.length;
                          }
                          var valid0 = _errs17 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.modelLoadFailures !== void 0) {
                            let data9 = data.modelLoadFailures;
                            const _errs18 = errors;
                            if (!(typeof data9 == "number" && (!(data9 % 1) && !isNaN(data9)) && isFinite(data9))) {
                              validate166.errors = [{ instancePath: instancePath + "/modelLoadFailures", schemaPath: "#/properties/modelLoadFailures/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                              return false;
                            }
                            if (errors === _errs18) {
                              if (typeof data9 == "number" && isFinite(data9)) {
                                if (data9 < 0 || isNaN(data9)) {
                                  validate166.errors = [{ instancePath: instancePath + "/modelLoadFailures", schemaPath: "#/properties/modelLoadFailures/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                  return false;
                                }
                              }
                            }
                            var valid0 = _errs18 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.restarts !== void 0) {
                              let data10 = data.restarts;
                              const _errs20 = errors;
                              if (!(typeof data10 == "number" && (!(data10 % 1) && !isNaN(data10)) && isFinite(data10))) {
                                validate166.errors = [{ instancePath: instancePath + "/restarts", schemaPath: "#/properties/restarts/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                return false;
                              }
                              if (errors === _errs20) {
                                if (typeof data10 == "number" && isFinite(data10)) {
                                  if (data10 < 0 || isNaN(data10)) {
                                    validate166.errors = [{ instancePath: instancePath + "/restarts", schemaPath: "#/properties/restarts/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                    return false;
                                  }
                                }
                              }
                              var valid0 = _errs20 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data.state !== void 0) {
                                const _errs22 = errors;
                                if (!validate170(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                                  vErrors = vErrors === null ? validate170.errors : vErrors.concat(validate170.errors);
                                  errors = vErrors.length;
                                }
                                var valid0 = _errs22 === errors;
                              } else {
                                var valid0 = true;
                              }
                              if (valid0) {
                                if (data.workloadId !== void 0) {
                                  const _errs23 = errors;
                                  if (typeof data.workloadId !== "string") {
                                    validate166.errors = [{ instancePath: instancePath + "/workloadId", schemaPath: "#/properties/workloadId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                  var valid0 = _errs23 === errors;
                                } else {
                                  var valid0 = true;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate166.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate166.errors = vErrors;
  return errors === 0;
}
validate166.evaluated = { "props": { "acceleratorUtilization": true, "container.cpu.utilization": true, "container.memory.usage": true, "deploymentVersion": true, "eventsPerSecond": true, "imageDigest": true, "imageVerified": true, "inferenceErrors": true, "lastUpdate": true, "modelLoadFailures": true, "restarts": true, "state": true, "workloadId": true }, "dynamicProps": false, "dynamicItems": false };
function validate156(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate156.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.windowStart === void 0 && (missing0 = "windowStart") || data.windowEnd === void 0 && (missing0 = "windowEnd") || data.agent === void 0 && (missing0 = "agent") || data.device === void 0 && (missing0 = "device") || data.workloads === void 0 && (missing0 = "workloads")) {
        validate156.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.agent !== void 0) {
          const _errs1 = errors;
          if (!validate157(data.agent, { instancePath: instancePath + "/agent", parentData: data, parentDataProperty: "agent", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate157.errors : vErrors.concat(validate157.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.connectivity !== void 0) {
            const _errs2 = errors;
            if (!validate159(data.connectivity, { instancePath: instancePath + "/connectivity", parentData: data, parentDataProperty: "connectivity", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate159.errors : vErrors.concat(validate159.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.device !== void 0) {
              const _errs3 = errors;
              if (!validate161(data.device, { instancePath: instancePath + "/device", parentData: data, parentDataProperty: "device", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate161.errors : vErrors.concat(validate161.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.windowEnd !== void 0) {
                let data3 = data.windowEnd;
                const _errs4 = errors;
                if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                  validate156.errors = [{ instancePath: instancePath + "/windowEnd", schemaPath: "#/properties/windowEnd/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                var valid0 = _errs4 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.windowStart !== void 0) {
                  let data4 = data.windowStart;
                  const _errs6 = errors;
                  if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
                    validate156.errors = [{ instancePath: instancePath + "/windowStart", schemaPath: "#/properties/windowStart/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                    return false;
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.workloads !== void 0) {
                    let data5 = data.workloads;
                    const _errs8 = errors;
                    if (errors === _errs8) {
                      if (Array.isArray(data5)) {
                        var valid1 = true;
                        const len0 = data5.length;
                        for (let i0 = 0; i0 < len0; i0++) {
                          const _errs10 = errors;
                          if (!validate166(data5[i0], { instancePath: instancePath + "/workloads/" + i0, parentData: data5, parentDataProperty: i0, rootData, dynamicAnchors })) {
                            vErrors = vErrors === null ? validate166.errors : vErrors.concat(validate166.errors);
                            errors = vErrors.length;
                          }
                          var valid1 = _errs10 === errors;
                          if (!valid1) {
                            break;
                          }
                        }
                      } else {
                        validate156.errors = [{ instancePath: instancePath + "/workloads", schemaPath: "#/properties/workloads/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                        return false;
                      }
                    }
                    var valid0 = _errs8 === errors;
                  } else {
                    var valid0 = true;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate156.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate156.errors = vErrors;
  return errors === 0;
}
validate156.evaluated = { "props": { "agent": true, "connectivity": true, "device": true, "windowEnd": true, "windowStart": true, "workloads": true }, "dynamicProps": false, "dynamicItems": false };
function validate155(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate155.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.telemetry === void 0 && (missing0 = "telemetry")) {
        validate155.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.telemetry !== void 0) {
          if (!validate156(data.telemetry, { instancePath: instancePath + "/telemetry", parentData: data, parentDataProperty: "telemetry", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate156.errors : vErrors.concat(validate156.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate155.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate155.errors = vErrors;
  return errors === 0;
}
validate155.evaluated = { "props": { "telemetry": true }, "dynamicProps": false, "dynamicItems": false };
var schema76 = { "description": "Device to server, at most once every 30 seconds after a Hello response advertises supportsMonitoringSummaryPolicy. Refresh remains available if the initial policy lookup failed and monitoringSummaryPolicy was omitted. No summary needs to be sent to request a refresh.", "type": "object", "properties": { "getMonitoringSummaryPolicy": { "type": "boolean", "enum": [true], "description": "Always true; requests a refreshed policy for this session." } }, "required": ["getMonitoringSummaryPolicy"] };
function validate175(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate175.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.getMonitoringSummaryPolicy === void 0 && (missing0 = "getMonitoringSummaryPolicy")) {
        validate175.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.getMonitoringSummaryPolicy !== void 0) {
          let data0 = data.getMonitoringSummaryPolicy;
          if (typeof data0 !== "boolean") {
            validate175.errors = [{ instancePath: instancePath + "/getMonitoringSummaryPolicy", schemaPath: "#/properties/getMonitoringSummaryPolicy/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          if (!(data0 === true)) {
            validate175.errors = [{ instancePath: instancePath + "/getMonitoringSummaryPolicy", schemaPath: "#/properties/getMonitoringSummaryPolicy/enum", keyword: "enum", params: { allowedValues: schema76.properties.getMonitoringSummaryPolicy.enum }, message: "must be equal to one of the allowed values" }];
            return false;
          }
        }
      }
    } else {
      validate175.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate175.errors = vErrors;
  return errors === 0;
}
validate175.evaluated = { "props": { "getMonitoringSummaryPolicy": true }, "dynamicProps": false, "dynamicItems": false };
function validate53(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate53.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate54(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.hello = true;
  }
  const _errs2 = errors;
  if (!validate77(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.sample = true;
        props0.error = true;
      }
    }
    const _errs3 = errors;
    if (!validate79(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.sampleStarted = true;
        }
      }
      const _errs4 = errors;
      if (!validate81(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate81.errors : vErrors.concat(validate81.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs4 === errors;
      if (_valid0 && valid0) {
        valid0 = false;
        passing0 = [passing0, 3];
      } else {
        if (_valid0) {
          valid0 = true;
          passing0 = 3;
          if (props0 !== true) {
            props0 = props0 || {};
            props0.sampleReading = true;
            props0.progressPercentage = true;
          }
        }
        const _errs5 = errors;
        if (!validate83(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
          vErrors = vErrors === null ? validate83.errors : vErrors.concat(validate83.errors);
          errors = vErrors.length;
        }
        var _valid0 = _errs5 === errors;
        if (_valid0 && valid0) {
          valid0 = false;
          passing0 = [passing0, 4];
        } else {
          if (_valid0) {
            valid0 = true;
            passing0 = 4;
            if (props0 !== true) {
              props0 = props0 || {};
              props0.sampleUploading = true;
            }
          }
          const _errs6 = errors;
          if (!validate85(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate85.errors : vErrors.concat(validate85.errors);
            errors = vErrors.length;
          }
          var _valid0 = _errs6 === errors;
          if (_valid0 && valid0) {
            valid0 = false;
            passing0 = [passing0, 5];
          } else {
            if (_valid0) {
              valid0 = true;
              passing0 = 5;
              if (props0 !== true) {
                props0 = props0 || {};
                props0.sampleProcessing = true;
              }
            }
            const _errs7 = errors;
            if (!validate87(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate87.errors : vErrors.concat(validate87.errors);
              errors = vErrors.length;
            }
            var _valid0 = _errs7 === errors;
            if (_valid0 && valid0) {
              valid0 = false;
              passing0 = [passing0, 6];
            } else {
              if (_valid0) {
                valid0 = true;
                passing0 = 6;
                if (props0 !== true) {
                  props0 = props0 || {};
                  props0.sampleFinished = true;
                }
              }
              const _errs8 = errors;
              if (!validate89(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate89.errors : vErrors.concat(validate89.errors);
                errors = vErrors.length;
              }
              var _valid0 = _errs8 === errors;
              if (_valid0 && valid0) {
                valid0 = false;
                passing0 = [passing0, 7];
              } else {
                if (_valid0) {
                  valid0 = true;
                  passing0 = 7;
                  if (props0 !== true) {
                    props0 = props0 || {};
                    props0.snapshotStarted = true;
                  }
                }
                const _errs9 = errors;
                if (!validate91(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate91.errors : vErrors.concat(validate91.errors);
                  errors = vErrors.length;
                }
                var _valid0 = _errs9 === errors;
                if (_valid0 && valid0) {
                  valid0 = false;
                  passing0 = [passing0, 8];
                } else {
                  if (_valid0) {
                    valid0 = true;
                    passing0 = 8;
                    if (props0 !== true) {
                      props0 = props0 || {};
                      props0.snapshotStopped = true;
                    }
                  }
                  const _errs10 = errors;
                  if (!validate93(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate93.errors : vErrors.concat(validate93.errors);
                    errors = vErrors.length;
                  }
                  var _valid0 = _errs10 === errors;
                  if (_valid0 && valid0) {
                    valid0 = false;
                    passing0 = [passing0, 9];
                  } else {
                    if (_valid0) {
                      valid0 = true;
                      passing0 = 9;
                      if (props0 !== true) {
                        props0 = props0 || {};
                        props0.snapshotFailed = true;
                        props0.error = true;
                      }
                    }
                    const _errs11 = errors;
                    if (!validate95(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
                      errors = vErrors.length;
                    }
                    var _valid0 = _errs11 === errors;
                    if (_valid0 && valid0) {
                      valid0 = false;
                      passing0 = [passing0, 10];
                    } else {
                      if (_valid0) {
                        valid0 = true;
                        passing0 = 10;
                        if (props0 !== true) {
                          props0 = props0 || {};
                          props0.snapshotFrame = true;
                          props0.fileName = true;
                        }
                      }
                      const _errs12 = errors;
                      if (!validate97(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate97.errors : vErrors.concat(validate97.errors);
                        errors = vErrors.length;
                      }
                      var _valid0 = _errs12 === errors;
                      if (_valid0 && valid0) {
                        valid0 = false;
                        passing0 = [passing0, 11];
                      } else {
                        if (_valid0) {
                          valid0 = true;
                          passing0 = 11;
                          if (props0 !== true) {
                            props0 = props0 || {};
                            props0.inferenceStreamStarted = true;
                          }
                        }
                        const _errs13 = errors;
                        if (!validate99(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                          vErrors = vErrors === null ? validate99.errors : vErrors.concat(validate99.errors);
                          errors = vErrors.length;
                        }
                        var _valid0 = _errs13 === errors;
                        if (_valid0 && valid0) {
                          valid0 = false;
                          passing0 = [passing0, 12];
                        } else {
                          if (_valid0) {
                            valid0 = true;
                            passing0 = 12;
                            if (props0 !== true) {
                              props0 = props0 || {};
                              props0.inferenceStreamStopped = true;
                            }
                          }
                          const _errs14 = errors;
                          if (!validate101(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                            vErrors = vErrors === null ? validate101.errors : vErrors.concat(validate101.errors);
                            errors = vErrors.length;
                          }
                          var _valid0 = _errs14 === errors;
                          if (_valid0 && valid0) {
                            valid0 = false;
                            passing0 = [passing0, 13];
                          } else {
                            if (_valid0) {
                              valid0 = true;
                              passing0 = 13;
                              if (props0 !== true) {
                                props0 = props0 || {};
                                props0.inferenceStreamFailed = true;
                                props0.error = true;
                              }
                            }
                            const _errs15 = errors;
                            if (!validate103(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                              vErrors = vErrors === null ? validate103.errors : vErrors.concat(validate103.errors);
                              errors = vErrors.length;
                            }
                            var _valid0 = _errs15 === errors;
                            if (_valid0 && valid0) {
                              valid0 = false;
                              passing0 = [passing0, 14];
                            } else {
                              if (_valid0) {
                                valid0 = true;
                                passing0 = 14;
                                if (props0 !== true) {
                                  props0 = props0 || {};
                                  props0.inferenceStarted = true;
                                }
                              }
                              const _errs16 = errors;
                              if (!validate105(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                                vErrors = vErrors === null ? validate105.errors : vErrors.concat(validate105.errors);
                                errors = vErrors.length;
                              }
                              var _valid0 = _errs16 === errors;
                              if (_valid0 && valid0) {
                                valid0 = false;
                                passing0 = [passing0, 15];
                              } else {
                                if (_valid0) {
                                  valid0 = true;
                                  passing0 = 15;
                                  if (props0 !== true) {
                                    props0 = props0 || {};
                                    props0.inferenceSummary = true;
                                  }
                                }
                                const _errs17 = errors;
                                if (!validate120(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                                  vErrors = vErrors === null ? validate120.errors : vErrors.concat(validate120.errors);
                                  errors = vErrors.length;
                                }
                                var _valid0 = _errs17 === errors;
                                if (_valid0 && valid0) {
                                  valid0 = false;
                                  passing0 = [passing0, 16];
                                } else {
                                  if (_valid0) {
                                    valid0 = true;
                                    passing0 = 16;
                                    if (props0 !== true) {
                                      props0 = props0 || {};
                                      props0.impulseRecord = true;
                                      props0.timestamp = true;
                                      props0.index = true;
                                      props0.rawData = true;
                                    }
                                  }
                                  const _errs18 = errors;
                                  if (!validate141(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                                    vErrors = vErrors === null ? validate141.errors : vErrors.concat(validate141.errors);
                                    errors = vErrors.length;
                                  }
                                  var _valid0 = _errs18 === errors;
                                  if (_valid0 && valid0) {
                                    valid0 = false;
                                    passing0 = [passing0, 17];
                                  } else {
                                    if (_valid0) {
                                      valid0 = true;
                                      passing0 = 17;
                                      if (props0 !== true) {
                                        props0 = props0 || {};
                                        props0.error = true;
                                        props0.impulseRecordsResponse = true;
                                        props0.index = true;
                                        props0.rawData = true;
                                        props0.record = true;
                                        props0.timestamp = true;
                                      }
                                    }
                                    const _errs19 = errors;
                                    if (!validate145(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                                      vErrors = vErrors === null ? validate145.errors : vErrors.concat(validate145.errors);
                                      errors = vErrors.length;
                                    } else {
                                      var props1 = validate145.evaluated.props;
                                    }
                                    var _valid0 = _errs19 === errors;
                                    if (_valid0 && valid0) {
                                      valid0 = false;
                                      passing0 = [passing0, 18];
                                    } else {
                                      if (_valid0) {
                                        valid0 = true;
                                        passing0 = 18;
                                        if (props0 !== true && props1 !== void 0) {
                                          if (props1 === true) {
                                            props0 = true;
                                          } else {
                                            props0 = props0 || {};
                                            Object.assign(props0, props1);
                                          }
                                        }
                                      }
                                      const _errs20 = errors;
                                      if (!validate155(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                                        vErrors = vErrors === null ? validate155.errors : vErrors.concat(validate155.errors);
                                        errors = vErrors.length;
                                      }
                                      var _valid0 = _errs20 === errors;
                                      if (_valid0 && valid0) {
                                        valid0 = false;
                                        passing0 = [passing0, 19];
                                      } else {
                                        if (_valid0) {
                                          valid0 = true;
                                          passing0 = 19;
                                          if (props0 !== true) {
                                            props0 = props0 || {};
                                            props0.telemetry = true;
                                          }
                                        }
                                        const _errs21 = errors;
                                        if (!validate175(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                                          vErrors = vErrors === null ? validate175.errors : vErrors.concat(validate175.errors);
                                          errors = vErrors.length;
                                        }
                                        var _valid0 = _errs21 === errors;
                                        if (_valid0 && valid0) {
                                          valid0 = false;
                                          passing0 = [passing0, 20];
                                        } else {
                                          if (_valid0) {
                                            valid0 = true;
                                            passing0 = 20;
                                            if (props0 !== true) {
                                              props0 = props0 || {};
                                              props0.getMonitoringSummaryPolicy = true;
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate53.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate53.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate53.evaluated = { "dynamicProps": true, "dynamicItems": false };
var schema79 = { "title": "HelloAccepted", "description": "The session was accepted. Remote Management always sends the server's clock with it.", "type": "object", "properties": { "hello": { "description": "Always `true`.", "type": "boolean", "enum": [true] }, "serverTimestamp": { "description": "The server's clock when it accepted the session.", "type": "integer", "format": "int64" }, "capabilities": { "description": "New, optional. What the server supports beyond the existing protocol.", "$ref": "#/$defs/ServerCapabilities" }, "monitoringSummaryPolicy": { "$ref": "#/$defs/MonitoringSummaryPolicy", "description": "Initial policy for opted-in inference clients; omitted if the lookup failed." }, "supportsMonitoringSummaryPolicy": { "description": "True when policy refresh is supported, even if the initial policy lookup failed.", "type": "boolean" } }, "required": ["hello", "serverTimestamp"] };
function validate181(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate181.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.summaryRulesVersion !== void 0) {
        const _errs1 = errors;
        if (typeof data.summaryRulesVersion !== "boolean") {
          validate181.errors = [{ instancePath: instancePath + "/summaryRulesVersion", schemaPath: "#/properties/summaryRulesVersion/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
          return false;
        }
        var valid0 = _errs1 === errors;
      } else {
        var valid0 = true;
      }
      if (valid0) {
        if (data.telemetry !== void 0) {
          const _errs3 = errors;
          if (typeof data.telemetry !== "boolean") {
            validate181.errors = [{ instancePath: instancePath + "/telemetry", schemaPath: "#/properties/telemetry/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          var valid0 = _errs3 === errors;
        } else {
          var valid0 = true;
        }
      }
    } else {
      validate181.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate181.errors = vErrors;
  return errors === 0;
}
validate181.evaluated = { "props": { "summaryRulesVersion": true, "telemetry": true }, "dynamicProps": false, "dynamicItems": false };
function validate183(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate183.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.intervalMs === void 0 && (missing0 = "intervalMs") || data.minimumIntervalMs === void 0 && (missing0 = "minimumIntervalMs") || data.preparationWindowMs === void 0 && (missing0 = "preparationWindowMs") || data.requirementsMet === void 0 && (missing0 = "requirementsMet")) {
        validate183.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.intervalMs !== void 0) {
          let data0 = data.intervalMs;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate183.errors = [{ instancePath: instancePath + "/intervalMs", schemaPath: "#/properties/intervalMs/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 1 || isNaN(data0)) {
                validate183.errors = [{ instancePath: instancePath + "/intervalMs", schemaPath: "#/properties/intervalMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.minimumIntervalMs !== void 0) {
            let data1 = data.minimumIntervalMs;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate183.errors = [{ instancePath: instancePath + "/minimumIntervalMs", schemaPath: "#/properties/minimumIntervalMs/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs3) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 1 || isNaN(data1)) {
                  validate183.errors = [{ instancePath: instancePath + "/minimumIntervalMs", schemaPath: "#/properties/minimumIntervalMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.preparationWindowMs !== void 0) {
              let data2 = data.preparationWindowMs;
              const _errs5 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate183.errors = [{ instancePath: instancePath + "/preparationWindowMs", schemaPath: "#/properties/preparationWindowMs/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs5) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (data2 < 0 || isNaN(data2)) {
                    validate183.errors = [{ instancePath: instancePath + "/preparationWindowMs", schemaPath: "#/properties/preparationWindowMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.requirementsMet !== void 0) {
                const _errs7 = errors;
                if (typeof data.requirementsMet !== "boolean") {
                  validate183.errors = [{ instancePath: instancePath + "/requirementsMet", schemaPath: "#/properties/requirementsMet/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                  return false;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate183.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate183.errors = vErrors;
  return errors === 0;
}
validate183.evaluated = { "props": { "intervalMs": true, "minimumIntervalMs": true, "preparationWindowMs": true, "requirementsMet": true }, "dynamicProps": false, "dynamicItems": false };
function validate180(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate180.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.hello === void 0 && (missing0 = "hello") || data.serverTimestamp === void 0 && (missing0 = "serverTimestamp")) {
        validate180.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.hello !== void 0) {
          let data0 = data.hello;
          const _errs1 = errors;
          if (typeof data0 !== "boolean") {
            validate180.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          if (!(data0 === true)) {
            validate180.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/enum", keyword: "enum", params: { allowedValues: schema79.properties.hello.enum }, message: "must be equal to one of the allowed values" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.serverTimestamp !== void 0) {
            let data1 = data.serverTimestamp;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate180.errors = [{ instancePath: instancePath + "/serverTimestamp", schemaPath: "#/properties/serverTimestamp/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.capabilities !== void 0) {
              const _errs5 = errors;
              if (!validate181(data.capabilities, { instancePath: instancePath + "/capabilities", parentData: data, parentDataProperty: "capabilities", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate181.errors : vErrors.concat(validate181.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.monitoringSummaryPolicy !== void 0) {
                const _errs6 = errors;
                if (!validate183(data.monitoringSummaryPolicy, { instancePath: instancePath + "/monitoringSummaryPolicy", parentData: data, parentDataProperty: "monitoringSummaryPolicy", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate183.errors : vErrors.concat(validate183.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.supportsMonitoringSummaryPolicy !== void 0) {
                  const _errs7 = errors;
                  if (typeof data.supportsMonitoringSummaryPolicy !== "boolean") {
                    validate180.errors = [{ instancePath: instancePath + "/supportsMonitoringSummaryPolicy", schemaPath: "#/properties/supportsMonitoringSummaryPolicy/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                    return false;
                  }
                  var valid0 = _errs7 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate180.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate180.errors = vErrors;
  return errors === 0;
}
validate180.evaluated = { "props": { "hello": true, "serverTimestamp": true, "capabilities": true, "monitoringSummaryPolicy": true, "supportsMonitoringSummaryPolicy": true }, "dynamicProps": false, "dynamicItems": false };
var schema82 = { "title": "HelloRejected", "description": "The session was refused. Remote Management sends the reason and no timestamp.", "type": "object", "properties": { "hello": { "description": "Always `false`.", "type": "boolean", "enum": [false] }, "err": { "description": "Why the session was refused, for the device log and the local status.", "type": "string" }, "auth": { "description": "Whether the credential was valid, when the rejection was about it.", "type": "boolean" }, "code": { "description": "New, optional. A stable identifier for the rejection, so a device can act on it without parsing `err`. The list is open: a device ignores codes it does not know. `inferenceNotEnabled` means the project does not accept inference-mode sessions; the device can connect again in ingestion mode.", "type": "string" } }, "required": ["hello", "err"] };
function validate186(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate186.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.hello === void 0 && (missing0 = "hello") || data.err === void 0 && (missing0 = "err")) {
        validate186.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.hello !== void 0) {
          let data0 = data.hello;
          const _errs1 = errors;
          if (typeof data0 !== "boolean") {
            validate186.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          if (!(data0 === false)) {
            validate186.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/enum", keyword: "enum", params: { allowedValues: schema82.properties.hello.enum }, message: "must be equal to one of the allowed values" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.err !== void 0) {
            const _errs3 = errors;
            if (typeof data.err !== "string") {
              validate186.errors = [{ instancePath: instancePath + "/err", schemaPath: "#/properties/err/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.auth !== void 0) {
              const _errs5 = errors;
              if (typeof data.auth !== "boolean") {
                validate186.errors = [{ instancePath: instancePath + "/auth", schemaPath: "#/properties/auth/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.code !== void 0) {
                const _errs7 = errors;
                if (typeof data.code !== "string") {
                  validate186.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate186.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate186.errors = vErrors;
  return errors === 0;
}
validate186.evaluated = { "props": { "hello": true, "err": true, "auth": true, "code": true }, "dynamicProps": false, "dynamicItems": false };
function validate179(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate179.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate180(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate180.errors : vErrors.concat(validate180.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.hello = true;
    props0.serverTimestamp = true;
    props0.capabilities = true;
    props0.monitoringSummaryPolicy = true;
    props0.supportsMonitoringSummaryPolicy = true;
  }
  const _errs2 = errors;
  if (!validate186(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate186.errors : vErrors.concat(validate186.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.hello = true;
        props0.err = true;
        props0.auth = true;
        props0.code = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate179.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate179.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate179.evaluated = { "dynamicProps": true, "dynamicItems": false };
function validate190(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate190.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.label === void 0 && (missing0 = "label") || data.length === void 0 && (missing0 = "length") || data.path === void 0 && (missing0 = "path") || data.hmacKey === void 0 && (missing0 = "hmacKey") || data.interval === void 0 && (missing0 = "interval")) {
        validate190.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.label !== void 0) {
          const _errs1 = errors;
          if (typeof data.label !== "string") {
            validate190.errors = [{ instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.length !== void 0) {
            let data1 = data.length;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (!(typeof data1 == "number" && isFinite(data1))) {
                validate190.errors = [{ instancePath: instancePath + "/length", schemaPath: "#/properties/length/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.path !== void 0) {
              const _errs5 = errors;
              if (typeof data.path !== "string") {
                validate190.errors = [{ instancePath: instancePath + "/path", schemaPath: "#/properties/path/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.hmacKey !== void 0) {
                const _errs7 = errors;
                if (typeof data.hmacKey !== "string") {
                  validate190.errors = [{ instancePath: instancePath + "/hmacKey", schemaPath: "#/properties/hmacKey/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.interval !== void 0) {
                  let data4 = data.interval;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (!(typeof data4 == "number" && isFinite(data4))) {
                      validate190.errors = [{ instancePath: instancePath + "/interval", schemaPath: "#/properties/interval/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.sensor !== void 0) {
                    const _errs11 = errors;
                    if (typeof data.sensor !== "string") {
                      validate190.errors = [{ instancePath: instancePath + "/sensor", schemaPath: "#/properties/sensor/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.labelColor !== void 0) {
                      const _errs13 = errors;
                      if (typeof data.labelColor !== "string") {
                        validate190.errors = [{ instancePath: instancePath + "/labelColor", schemaPath: "#/properties/labelColor/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid0 = _errs13 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.collectedSampleCount !== void 0) {
                        let data7 = data.collectedSampleCount;
                        const _errs15 = errors;
                        if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                          validate190.errors = [{ instancePath: instancePath + "/collectedSampleCount", schemaPath: "#/properties/collectedSampleCount/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                          return false;
                        }
                        if (errors === _errs15) {
                          if (typeof data7 == "number" && isFinite(data7)) {
                            if (data7 < 0 || isNaN(data7)) {
                              validate190.errors = [{ instancePath: instancePath + "/collectedSampleCount", schemaPath: "#/properties/collectedSampleCount/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                              return false;
                            }
                          }
                        }
                        var valid0 = _errs15 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.targetSampleCount !== void 0) {
                          let data8 = data.targetSampleCount;
                          const _errs17 = errors;
                          if (!(typeof data8 == "number" && (!(data8 % 1) && !isNaN(data8)) && isFinite(data8))) {
                            validate190.errors = [{ instancePath: instancePath + "/targetSampleCount", schemaPath: "#/properties/targetSampleCount/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                            return false;
                          }
                          if (errors === _errs17) {
                            if (typeof data8 == "number" && isFinite(data8)) {
                              if (data8 < 0 || isNaN(data8)) {
                                validate190.errors = [{ instancePath: instancePath + "/targetSampleCount", schemaPath: "#/properties/targetSampleCount/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                return false;
                              }
                            }
                          }
                          var valid0 = _errs17 === errors;
                        } else {
                          var valid0 = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate190.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate190.errors = vErrors;
  return errors === 0;
}
validate190.evaluated = { "props": { "label": true, "length": true, "path": true, "hmacKey": true, "interval": true, "sensor": true, "labelColor": true, "collectedSampleCount": true, "targetSampleCount": true }, "dynamicProps": false, "dynamicItems": false };
function validate189(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate189.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.sample === void 0 && (missing0 = "sample")) {
        validate189.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.sample !== void 0) {
          if (!validate190(data.sample, { instancePath: instancePath + "/sample", parentData: data, parentDataProperty: "sample", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate190.errors : vErrors.concat(validate190.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate189.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate189.errors = vErrors;
  return errors === 0;
}
validate189.evaluated = { "props": { "sample": true }, "dynamicProps": false, "dynamicItems": false };
var schema85 = { "description": "Server to device. Requests a live stream of snapshots at the chosen\nresolution.", "type": "object", "properties": { "startSnapshot": { "description": "The start-snapshot request flag; retains the existing boolean type.", "type": "boolean" }, "resolution": { "description": "The requested snapshot resolution.", "type": "string", "enum": ["high", "low"] } }, "required": ["startSnapshot", "resolution"] };
function validate193(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate193.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.startSnapshot === void 0 && (missing0 = "startSnapshot") || data.resolution === void 0 && (missing0 = "resolution")) {
        validate193.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.startSnapshot !== void 0) {
          const _errs1 = errors;
          if (typeof data.startSnapshot !== "boolean") {
            validate193.errors = [{ instancePath: instancePath + "/startSnapshot", schemaPath: "#/properties/startSnapshot/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.resolution !== void 0) {
            let data1 = data.resolution;
            const _errs3 = errors;
            if (typeof data1 !== "string") {
              validate193.errors = [{ instancePath: instancePath + "/resolution", schemaPath: "#/properties/resolution/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if (!(data1 === "high" || data1 === "low")) {
              validate193.errors = [{ instancePath: instancePath + "/resolution", schemaPath: "#/properties/resolution/enum", keyword: "enum", params: { allowedValues: schema85.properties.resolution.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate193.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate193.errors = vErrors;
  return errors === 0;
}
validate193.evaluated = { "props": { "startSnapshot": true, "resolution": true }, "dynamicProps": false, "dynamicItems": false };
function validate195(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate195.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.stopSnapshot === void 0 && (missing0 = "stopSnapshot")) {
        validate195.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.stopSnapshot !== void 0) {
          if (typeof data.stopSnapshot !== "boolean") {
            validate195.errors = [{ instancePath: instancePath + "/stopSnapshot", schemaPath: "#/properties/stopSnapshot/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate195.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate195.errors = vErrors;
  return errors === 0;
}
validate195.evaluated = { "props": { "stopSnapshot": true }, "dynamicProps": false, "dynamicItems": false };
function validate197(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate197.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.startInferenceStream === void 0 && (missing0 = "startInferenceStream")) {
        validate197.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.startInferenceStream !== void 0) {
          if (typeof data.startInferenceStream !== "boolean") {
            validate197.errors = [{ instancePath: instancePath + "/startInferenceStream", schemaPath: "#/properties/startInferenceStream/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate197.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate197.errors = vErrors;
  return errors === 0;
}
validate197.evaluated = { "props": { "startInferenceStream": true }, "dynamicProps": false, "dynamicItems": false };
function validate199(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate199.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.stopInferenceStream === void 0 && (missing0 = "stopInferenceStream")) {
        validate199.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.stopInferenceStream !== void 0) {
          if (typeof data.stopInferenceStream !== "boolean") {
            validate199.errors = [{ instancePath: instancePath + "/stopInferenceStream", schemaPath: "#/properties/stopInferenceStream/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate199.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate199.errors = vErrors;
  return errors === 0;
}
validate199.evaluated = { "props": { "stopInferenceStream": true }, "dynamicProps": false, "dynamicItems": false };
function validate201(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate201.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.impulseRecordAck === void 0 && (missing0 = "impulseRecordAck") || data.index === void 0 && (missing0 = "index")) {
        validate201.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.impulseRecordAck !== void 0) {
          const _errs1 = errors;
          if (typeof data.impulseRecordAck !== "boolean") {
            validate201.errors = [{ instancePath: instancePath + "/impulseRecordAck", schemaPath: "#/properties/impulseRecordAck/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.index !== void 0) {
            let data1 = data.index;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate201.errors = [{ instancePath: instancePath + "/index", schemaPath: "#/properties/index/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs3) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 0 || isNaN(data1)) {
                  validate201.errors = [{ instancePath: instancePath + "/index", schemaPath: "#/properties/index/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.error !== void 0) {
              const _errs5 = errors;
              if (typeof data.error !== "string") {
                validate201.errors = [{ instancePath: instancePath + "/error", schemaPath: "#/properties/error/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate201.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate201.errors = vErrors;
  return errors === 0;
}
validate201.evaluated = { "props": { "impulseRecordAck": true, "index": true, "error": true }, "dynamicProps": false, "dynamicItems": false };
function validate205(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate205.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.first === void 0 && (missing0 = "first") || data.last === void 0 && (missing0 = "last")) {
        validate205.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.first !== void 0) {
          let data0 = data.first;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate205.errors = [{ instancePath: instancePath + "/first", schemaPath: "#/properties/first/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate205.errors = [{ instancePath: instancePath + "/first", schemaPath: "#/properties/first/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.last !== void 0) {
            let data1 = data.last;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate205.errors = [{ instancePath: instancePath + "/last", schemaPath: "#/properties/last/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs3) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 0 || isNaN(data1)) {
                  validate205.errors = [{ instancePath: instancePath + "/last", schemaPath: "#/properties/last/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate205.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate205.errors = vErrors;
  return errors === 0;
}
validate205.evaluated = { "props": { "first": true, "last": true }, "dynamicProps": false, "dynamicItems": false };
function validate204(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate204.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.index !== void 0) {
        let data0 = data.index;
        const _errs1 = errors;
        if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
          validate204.errors = [{ instancePath: instancePath + "/index", schemaPath: "#/properties/index/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
          return false;
        }
        if (errors === _errs1) {
          if (typeof data0 == "number" && isFinite(data0)) {
            if (data0 < 0 || isNaN(data0)) {
              validate204.errors = [{ instancePath: instancePath + "/index", schemaPath: "#/properties/index/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
              return false;
            }
          }
        }
        var valid0 = _errs1 === errors;
      } else {
        var valid0 = true;
      }
      if (valid0) {
        if (data.list !== void 0) {
          let data1 = data.list;
          const _errs3 = errors;
          if (errors === _errs3) {
            if (Array.isArray(data1)) {
              var valid1 = true;
              const len0 = data1.length;
              for (let i0 = 0; i0 < len0; i0++) {
                let data2 = data1[i0];
                const _errs5 = errors;
                if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                  validate204.errors = [{ instancePath: instancePath + "/list/" + i0, schemaPath: "#/properties/list/items/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs5) {
                  if (typeof data2 == "number" && isFinite(data2)) {
                    if (data2 < 0 || isNaN(data2)) {
                      validate204.errors = [{ instancePath: instancePath + "/list/" + i0, schemaPath: "#/properties/list/items/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid1 = _errs5 === errors;
                if (!valid1) {
                  break;
                }
              }
            } else {
              validate204.errors = [{ instancePath: instancePath + "/list", schemaPath: "#/properties/list/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
              return false;
            }
          }
          var valid0 = _errs3 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.range !== void 0) {
            const _errs7 = errors;
            if (!validate205(data.range, { instancePath: instancePath + "/range", parentData: data, parentDataProperty: "range", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate205.errors : vErrors.concat(validate205.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs7 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate204.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate204.errors = vErrors;
  return errors === 0;
}
validate204.evaluated = { "props": { "index": true, "list": true, "range": true }, "dynamicProps": false, "dynamicItems": false };
function validate203(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate203.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.impulseRecordRequest === void 0 && (missing0 = "impulseRecordRequest")) {
        validate203.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.impulseRecordRequest !== void 0) {
          if (!validate204(data.impulseRecordRequest, { instancePath: instancePath + "/impulseRecordRequest", parentData: data, parentDataProperty: "impulseRecordRequest", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate204.errors : vErrors.concat(validate204.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate203.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate203.errors = vErrors;
  return errors === 0;
}
validate203.evaluated = { "props": { "impulseRecordRequest": true }, "dynamicProps": false, "dynamicItems": false };
var schema95 = { "description": "The string `latest`.", "type": "string", "enum": ["latest"] };
function validate211(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate211.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate211.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  if (!(data === "latest")) {
    validate211.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema95.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate211.errors = vErrors;
  return errors === 0;
}
validate211.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate210(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate210.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!(typeof data == "number" && (!(data % 1) && !isNaN(data)) && isFinite(data))) {
    const err0 = { instancePath, schemaPath: "#/oneOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  if (errors === _errs1) {
    if (typeof data == "number" && isFinite(data)) {
      if (data < 0 || isNaN(data)) {
        const err1 = { instancePath, schemaPath: "#/oneOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs3 = errors;
  if (!validate211(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate211.errors : vErrors.concat(validate211.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs3 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
    }
  }
  if (!valid0) {
    const err2 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
    validate210.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate210.errors = vErrors;
  return errors === 0;
}
validate210.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate209(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate209.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.newModelAvailable === void 0 && (missing0 = "newModelAvailable") || data.deploymentVersion === void 0 && (missing0 = "deploymentVersion")) {
        validate209.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.deploymentVersion !== void 0) {
          const _errs1 = errors;
          if (!validate210(data.deploymentVersion, { instancePath: instancePath + "/deploymentVersion", parentData: data, parentDataProperty: "deploymentVersion", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate210.errors : vErrors.concat(validate210.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.newModelAvailable !== void 0) {
            const _errs2 = errors;
            if (typeof data.newModelAvailable !== "boolean") {
              validate209.errors = [{ instancePath: instancePath + "/newModelAvailable", schemaPath: "#/properties/newModelAvailable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate209.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate209.errors = vErrors;
  return errors === 0;
}
validate209.evaluated = { "props": { "deploymentVersion": true, "newModelAvailable": true }, "dynamicProps": false, "dynamicItems": false };
function validate216(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate216.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.deploymentVersion === void 0 && (missing0 = "deploymentVersion")) {
        validate216.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.deploymentVersion !== void 0) {
          let data0 = data.deploymentVersion;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate216.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate216.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
        }
      }
    } else {
      validate216.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate216.errors = vErrors;
  return errors === 0;
}
validate216.evaluated = { "props": { "deploymentVersion": true }, "dynamicProps": false, "dynamicItems": false };
function validate215(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate215.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.deployModel === void 0 && (missing0 = "deployModel")) {
        validate215.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.deployModel !== void 0) {
          if (!validate216(data.deployModel, { instancePath: instancePath + "/deployModel", parentData: data, parentDataProperty: "deployModel", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate216.errors : vErrors.concat(validate216.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate215.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate215.errors = vErrors;
  return errors === 0;
}
validate215.evaluated = { "props": { "deployModel": true }, "dynamicProps": false, "dynamicItems": false };
function validate219(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate219.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.rollbackModel === void 0 && (missing0 = "rollbackModel")) {
        validate219.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.rollbackModel !== void 0) {
          if (!validate216(data.rollbackModel, { instancePath: instancePath + "/rollbackModel", parentData: data, parentDataProperty: "rollbackModel", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate216.errors : vErrors.concat(validate216.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate219.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate219.errors = vErrors;
  return errors === 0;
}
validate219.evaluated = { "props": { "rollbackModel": true }, "dynamicProps": false, "dynamicItems": false };
function validate222(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate222.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.monitoringSummaryPolicyUpdate === void 0 && (missing0 = "monitoringSummaryPolicyUpdate")) {
        validate222.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.monitoringSummaryPolicyUpdate !== void 0) {
          if (!validate183(data.monitoringSummaryPolicyUpdate, { instancePath: instancePath + "/monitoringSummaryPolicyUpdate", parentData: data, parentDataProperty: "monitoringSummaryPolicyUpdate", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate183.errors : vErrors.concat(validate183.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate222.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate222.errors = vErrors;
  return errors === 0;
}
validate222.evaluated = { "props": { "monitoringSummaryPolicyUpdate": true }, "dynamicProps": false, "dynamicItems": false };
function validate178(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate178.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate179(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate179.errors : vErrors.concat(validate179.errors);
    errors = vErrors.length;
  } else {
    var props0 = validate179.evaluated.props;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs2 = errors;
  if (!validate189(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate189.errors : vErrors.concat(validate189.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.sample = true;
      }
    }
    const _errs3 = errors;
    if (!validate193(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate193.errors : vErrors.concat(validate193.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.startSnapshot = true;
          props0.resolution = true;
        }
      }
      const _errs4 = errors;
      if (!validate195(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate195.errors : vErrors.concat(validate195.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs4 === errors;
      if (_valid0 && valid0) {
        valid0 = false;
        passing0 = [passing0, 3];
      } else {
        if (_valid0) {
          valid0 = true;
          passing0 = 3;
          if (props0 !== true) {
            props0 = props0 || {};
            props0.stopSnapshot = true;
          }
        }
        const _errs5 = errors;
        if (!validate197(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
          vErrors = vErrors === null ? validate197.errors : vErrors.concat(validate197.errors);
          errors = vErrors.length;
        }
        var _valid0 = _errs5 === errors;
        if (_valid0 && valid0) {
          valid0 = false;
          passing0 = [passing0, 4];
        } else {
          if (_valid0) {
            valid0 = true;
            passing0 = 4;
            if (props0 !== true) {
              props0 = props0 || {};
              props0.startInferenceStream = true;
            }
          }
          const _errs6 = errors;
          if (!validate199(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate199.errors : vErrors.concat(validate199.errors);
            errors = vErrors.length;
          }
          var _valid0 = _errs6 === errors;
          if (_valid0 && valid0) {
            valid0 = false;
            passing0 = [passing0, 5];
          } else {
            if (_valid0) {
              valid0 = true;
              passing0 = 5;
              if (props0 !== true) {
                props0 = props0 || {};
                props0.stopInferenceStream = true;
              }
            }
            const _errs7 = errors;
            if (!validate201(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate201.errors : vErrors.concat(validate201.errors);
              errors = vErrors.length;
            }
            var _valid0 = _errs7 === errors;
            if (_valid0 && valid0) {
              valid0 = false;
              passing0 = [passing0, 6];
            } else {
              if (_valid0) {
                valid0 = true;
                passing0 = 6;
                if (props0 !== true) {
                  props0 = props0 || {};
                  props0.impulseRecordAck = true;
                  props0.index = true;
                  props0.error = true;
                }
              }
              const _errs8 = errors;
              if (!validate203(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate203.errors : vErrors.concat(validate203.errors);
                errors = vErrors.length;
              }
              var _valid0 = _errs8 === errors;
              if (_valid0 && valid0) {
                valid0 = false;
                passing0 = [passing0, 7];
              } else {
                if (_valid0) {
                  valid0 = true;
                  passing0 = 7;
                  if (props0 !== true) {
                    props0 = props0 || {};
                    props0.impulseRecordRequest = true;
                  }
                }
                const _errs9 = errors;
                if (!validate209(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate209.errors : vErrors.concat(validate209.errors);
                  errors = vErrors.length;
                }
                var _valid0 = _errs9 === errors;
                if (_valid0 && valid0) {
                  valid0 = false;
                  passing0 = [passing0, 8];
                } else {
                  if (_valid0) {
                    valid0 = true;
                    passing0 = 8;
                    if (props0 !== true) {
                      props0 = props0 || {};
                      props0.deploymentVersion = true;
                      props0.newModelAvailable = true;
                    }
                  }
                  const _errs10 = errors;
                  if (!validate215(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate215.errors : vErrors.concat(validate215.errors);
                    errors = vErrors.length;
                  }
                  var _valid0 = _errs10 === errors;
                  if (_valid0 && valid0) {
                    valid0 = false;
                    passing0 = [passing0, 9];
                  } else {
                    if (_valid0) {
                      valid0 = true;
                      passing0 = 9;
                      if (props0 !== true) {
                        props0 = props0 || {};
                        props0.deployModel = true;
                      }
                    }
                    const _errs11 = errors;
                    if (!validate219(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate219.errors : vErrors.concat(validate219.errors);
                      errors = vErrors.length;
                    }
                    var _valid0 = _errs11 === errors;
                    if (_valid0 && valid0) {
                      valid0 = false;
                      passing0 = [passing0, 10];
                    } else {
                      if (_valid0) {
                        valid0 = true;
                        passing0 = 10;
                        if (props0 !== true) {
                          props0 = props0 || {};
                          props0.rollbackModel = true;
                        }
                      }
                      const _errs12 = errors;
                      if (!validate222(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate222.errors : vErrors.concat(validate222.errors);
                        errors = vErrors.length;
                      }
                      var _valid0 = _errs12 === errors;
                      if (_valid0 && valid0) {
                        valid0 = false;
                        passing0 = [passing0, 11];
                      } else {
                        if (_valid0) {
                          valid0 = true;
                          passing0 = 11;
                          if (props0 !== true) {
                            props0 = props0 || {};
                            props0.monitoringSummaryPolicyUpdate = true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate178.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate178.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate178.evaluated = { "dynamicProps": true, "dynamicItems": false };
function validate52(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate52.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate53(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate53.errors : vErrors.concat(validate53.errors);
    errors = vErrors.length;
  } else {
    var props0 = validate53.evaluated.props;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs2 = errors;
  if (!validate178(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate178.errors : vErrors.concat(validate178.errors);
    errors = vErrors.length;
  } else {
    var props1 = validate178.evaluated.props;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true && props1 !== void 0) {
        if (props1 === true) {
          props0 = true;
        } else {
          props0 = props0 || {};
          Object.assign(props0, props1);
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate52.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate52.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate52.evaluated = { "dynamicProps": true, "dynamicItems": false };
exports.validateTelemetry = validate226;
function validate226(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate226.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.telemetry === void 0 && (missing0 = "telemetry")) {
        validate226.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.telemetry !== void 0) {
          if (!validate156(data.telemetry, { instancePath: instancePath + "/telemetry", parentData: data, parentDataProperty: "telemetry", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate156.errors : vErrors.concat(validate156.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate226.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate226.errors = vErrors;
  return errors === 0;
}
validate226.evaluated = { "props": { "telemetry": true }, "dynamicProps": false, "dynamicItems": false };
exports.validateNewModelUpdated = validate228;
function validate228(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate228.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate146(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate146.errors : vErrors.concat(validate146.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.bundleDigest = true;
    props0.imageDigest = true;
    props0.inferenceInfo = true;
    props0.modelUpdateSuccess = true;
    props0.operation = true;
  }
  const _errs2 = errors;
  if (!validate151(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate151.errors : vErrors.concat(validate151.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.deploymentVersion = true;
        props0.error = true;
        props0.modelUpdateSuccess = true;
        props0.operation = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate228.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate228.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate228.evaluated = { "dynamicProps": true, "dynamicItems": false };
exports.validateInferenceSummary = validate231;
function validate231(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate231.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.inferenceSummary === void 0 && (missing0 = "inferenceSummary")) {
        validate231.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.inferenceSummary !== void 0) {
          if (!validate106(data.inferenceSummary, { instancePath: instancePath + "/inferenceSummary", parentData: data, parentDataProperty: "inferenceSummary", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate106.errors : vErrors.concat(validate106.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate231.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate231.errors = vErrors;
  return errors === 0;
}
validate231.evaluated = { "props": { "inferenceSummary": true }, "dynamicProps": false, "dynamicItems": false };
exports.validateDeployModel = validate233;
function validate233(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate233.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.deployModel === void 0 && (missing0 = "deployModel")) {
        validate233.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.deployModel !== void 0) {
          if (!validate216(data.deployModel, { instancePath: instancePath + "/deployModel", parentData: data, parentDataProperty: "deployModel", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate216.errors : vErrors.concat(validate216.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate233.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate233.errors = vErrors;
  return errors === 0;
}
validate233.evaluated = { "props": { "deployModel": true }, "dynamicProps": false, "dynamicItems": false };
exports.validateRollbackModel = validate235;
function validate235(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate235.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.rollbackModel === void 0 && (missing0 = "rollbackModel")) {
        validate235.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.rollbackModel !== void 0) {
          if (!validate216(data.rollbackModel, { instancePath: instancePath + "/rollbackModel", parentData: data, parentDataProperty: "rollbackModel", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate216.errors : vErrors.concat(validate216.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate235.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate235.errors = vErrors;
  return errors === 0;
}
validate235.evaluated = { "props": { "rollbackModel": true }, "dynamicProps": false, "dynamicItems": false };
exports.validateLegacyRemoteManagementMessage = validate237;
var schema106 = { "description": "Legacy Hello V1 request. Remote Management normalizes it to V4 before handling the session.", "type": "object", "properties": { "hello": { "description": "The legacy handshake.", "type": "object", "properties": { "version": { "description": "Hello version 1.", "type": "integer", "enum": [1] }, "apiKey": { "description": "The project's API key.", "type": "string" }, "deviceId": { "description": "The device identifier.", "type": "string" }, "deviceType": { "description": "The device type.", "type": "string" }, "connection": { "description": "How the device connects.", "type": "string", "enum": ["ip", "daemon"] }, "sensors": { "description": "The sensors the device offers.", "type": "array", "items": { "type": "string" } } }, "required": ["version", "apiKey", "deviceId", "deviceType", "connection"] } }, "required": ["hello"] };
function validate238(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate238.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.hello === void 0 && (missing0 = "hello")) {
        validate238.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.hello !== void 0) {
          let data0 = data.hello;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
              let missing1;
              if (data0.version === void 0 && (missing1 = "version") || data0.apiKey === void 0 && (missing1 = "apiKey") || data0.deviceId === void 0 && (missing1 = "deviceId") || data0.deviceType === void 0 && (missing1 = "deviceType") || data0.connection === void 0 && (missing1 = "connection")) {
                validate238.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                return false;
              } else {
                if (data0.version !== void 0) {
                  let data1 = data0.version;
                  const _errs3 = errors;
                  if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
                    validate238.errors = [{ instancePath: instancePath + "/hello/version", schemaPath: "#/properties/hello/properties/version/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                    return false;
                  }
                  if (!(data1 === 1)) {
                    validate238.errors = [{ instancePath: instancePath + "/hello/version", schemaPath: "#/properties/hello/properties/version/enum", keyword: "enum", params: { allowedValues: schema106.properties.hello.properties.version.enum }, message: "must be equal to one of the allowed values" }];
                    return false;
                  }
                  var valid1 = _errs3 === errors;
                } else {
                  var valid1 = true;
                }
                if (valid1) {
                  if (data0.apiKey !== void 0) {
                    const _errs5 = errors;
                    if (typeof data0.apiKey !== "string") {
                      validate238.errors = [{ instancePath: instancePath + "/hello/apiKey", schemaPath: "#/properties/hello/properties/apiKey/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    var valid1 = _errs5 === errors;
                  } else {
                    var valid1 = true;
                  }
                  if (valid1) {
                    if (data0.deviceId !== void 0) {
                      const _errs7 = errors;
                      if (typeof data0.deviceId !== "string") {
                        validate238.errors = [{ instancePath: instancePath + "/hello/deviceId", schemaPath: "#/properties/hello/properties/deviceId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs7 === errors;
                    } else {
                      var valid1 = true;
                    }
                    if (valid1) {
                      if (data0.deviceType !== void 0) {
                        const _errs9 = errors;
                        if (typeof data0.deviceType !== "string") {
                          validate238.errors = [{ instancePath: instancePath + "/hello/deviceType", schemaPath: "#/properties/hello/properties/deviceType/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                        var valid1 = _errs9 === errors;
                      } else {
                        var valid1 = true;
                      }
                      if (valid1) {
                        if (data0.connection !== void 0) {
                          let data5 = data0.connection;
                          const _errs11 = errors;
                          if (typeof data5 !== "string") {
                            validate238.errors = [{ instancePath: instancePath + "/hello/connection", schemaPath: "#/properties/hello/properties/connection/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                          if (!(data5 === "ip" || data5 === "daemon")) {
                            validate238.errors = [{ instancePath: instancePath + "/hello/connection", schemaPath: "#/properties/hello/properties/connection/enum", keyword: "enum", params: { allowedValues: schema106.properties.hello.properties.connection.enum }, message: "must be equal to one of the allowed values" }];
                            return false;
                          }
                          var valid1 = _errs11 === errors;
                        } else {
                          var valid1 = true;
                        }
                        if (valid1) {
                          if (data0.sensors !== void 0) {
                            let data6 = data0.sensors;
                            const _errs13 = errors;
                            if (errors === _errs13) {
                              if (Array.isArray(data6)) {
                                var valid2 = true;
                                const len0 = data6.length;
                                for (let i0 = 0; i0 < len0; i0++) {
                                  const _errs15 = errors;
                                  if (typeof data6[i0] !== "string") {
                                    validate238.errors = [{ instancePath: instancePath + "/hello/sensors/" + i0, schemaPath: "#/properties/hello/properties/sensors/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                  var valid2 = _errs15 === errors;
                                  if (!valid2) {
                                    break;
                                  }
                                }
                              } else {
                                validate238.errors = [{ instancePath: instancePath + "/hello/sensors", schemaPath: "#/properties/hello/properties/sensors/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                return false;
                              }
                            }
                            var valid1 = _errs13 === errors;
                          } else {
                            var valid1 = true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              validate238.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
              return false;
            }
          }
        }
      }
    } else {
      validate238.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate238.errors = vErrors;
  return errors === 0;
}
validate238.evaluated = { "props": { "hello": true }, "dynamicProps": false, "dynamicItems": false };
var schema107 = { "description": "Legacy Hello V2 request. Remote Management normalizes it to V4 before handling the session.", "type": "object", "properties": { "hello": { "description": "The legacy handshake.", "type": "object", "properties": { "version": { "description": "Hello version 2.", "type": "integer", "enum": [2] }, "apiKey": { "description": "The project's API key.", "type": "string" }, "deviceId": { "description": "The device identifier.", "type": "string" }, "deviceType": { "description": "The device type.", "type": "string" }, "connection": { "description": "How the device connects.", "type": "string", "enum": ["ip", "daemon"] }, "sensors": { "description": "The sensors the device offers.", "type": "array", "items": { "$ref": "#/$defs/Sensor" } } }, "required": ["version", "apiKey", "deviceId", "deviceType", "connection", "sensors"] } }, "required": ["hello"] };
function validate241(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate241.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.name === void 0 && (missing0 = "name") || data.maxSampleLengthS === void 0 && (missing0 = "maxSampleLengthS") || data.frequencies === void 0 && (missing0 = "frequencies")) {
        validate241.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.name !== void 0) {
          const _errs1 = errors;
          if (typeof data.name !== "string") {
            validate241.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.maxSampleLengthS !== void 0) {
            let data1 = data.maxSampleLengthS;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && isFinite(data1))) {
              validate241.errors = [{ instancePath: instancePath + "/maxSampleLengthS", schemaPath: "#/properties/maxSampleLengthS/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.frequencies !== void 0) {
              let data2 = data.frequencies;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (Array.isArray(data2)) {
                  var valid1 = true;
                  const len0 = data2.length;
                  for (let i0 = 0; i0 < len0; i0++) {
                    let data3 = data2[i0];
                    const _errs7 = errors;
                    if (!(typeof data3 == "number" && isFinite(data3))) {
                      validate241.errors = [{ instancePath: instancePath + "/frequencies/" + i0, schemaPath: "#/properties/frequencies/items/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                    var valid1 = _errs7 === errors;
                    if (!valid1) {
                      break;
                    }
                  }
                } else {
                  validate241.errors = [{ instancePath: instancePath + "/frequencies", schemaPath: "#/properties/frequencies/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate241.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate241.errors = vErrors;
  return errors === 0;
}
validate241.evaluated = { "props": { "name": true, "maxSampleLengthS": true, "frequencies": true }, "dynamicProps": false, "dynamicItems": false };
function validate240(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate240.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.hello === void 0 && (missing0 = "hello")) {
        validate240.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.hello !== void 0) {
          let data0 = data.hello;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
              let missing1;
              if (data0.version === void 0 && (missing1 = "version") || data0.apiKey === void 0 && (missing1 = "apiKey") || data0.deviceId === void 0 && (missing1 = "deviceId") || data0.deviceType === void 0 && (missing1 = "deviceType") || data0.connection === void 0 && (missing1 = "connection") || data0.sensors === void 0 && (missing1 = "sensors")) {
                validate240.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                return false;
              } else {
                if (data0.version !== void 0) {
                  let data1 = data0.version;
                  const _errs3 = errors;
                  if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
                    validate240.errors = [{ instancePath: instancePath + "/hello/version", schemaPath: "#/properties/hello/properties/version/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                    return false;
                  }
                  if (!(data1 === 2)) {
                    validate240.errors = [{ instancePath: instancePath + "/hello/version", schemaPath: "#/properties/hello/properties/version/enum", keyword: "enum", params: { allowedValues: schema107.properties.hello.properties.version.enum }, message: "must be equal to one of the allowed values" }];
                    return false;
                  }
                  var valid1 = _errs3 === errors;
                } else {
                  var valid1 = true;
                }
                if (valid1) {
                  if (data0.apiKey !== void 0) {
                    const _errs5 = errors;
                    if (typeof data0.apiKey !== "string") {
                      validate240.errors = [{ instancePath: instancePath + "/hello/apiKey", schemaPath: "#/properties/hello/properties/apiKey/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    var valid1 = _errs5 === errors;
                  } else {
                    var valid1 = true;
                  }
                  if (valid1) {
                    if (data0.deviceId !== void 0) {
                      const _errs7 = errors;
                      if (typeof data0.deviceId !== "string") {
                        validate240.errors = [{ instancePath: instancePath + "/hello/deviceId", schemaPath: "#/properties/hello/properties/deviceId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs7 === errors;
                    } else {
                      var valid1 = true;
                    }
                    if (valid1) {
                      if (data0.deviceType !== void 0) {
                        const _errs9 = errors;
                        if (typeof data0.deviceType !== "string") {
                          validate240.errors = [{ instancePath: instancePath + "/hello/deviceType", schemaPath: "#/properties/hello/properties/deviceType/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                        var valid1 = _errs9 === errors;
                      } else {
                        var valid1 = true;
                      }
                      if (valid1) {
                        if (data0.connection !== void 0) {
                          let data5 = data0.connection;
                          const _errs11 = errors;
                          if (typeof data5 !== "string") {
                            validate240.errors = [{ instancePath: instancePath + "/hello/connection", schemaPath: "#/properties/hello/properties/connection/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                          if (!(data5 === "ip" || data5 === "daemon")) {
                            validate240.errors = [{ instancePath: instancePath + "/hello/connection", schemaPath: "#/properties/hello/properties/connection/enum", keyword: "enum", params: { allowedValues: schema107.properties.hello.properties.connection.enum }, message: "must be equal to one of the allowed values" }];
                            return false;
                          }
                          var valid1 = _errs11 === errors;
                        } else {
                          var valid1 = true;
                        }
                        if (valid1) {
                          if (data0.sensors !== void 0) {
                            let data6 = data0.sensors;
                            const _errs13 = errors;
                            if (errors === _errs13) {
                              if (Array.isArray(data6)) {
                                var valid2 = true;
                                const len0 = data6.length;
                                for (let i0 = 0; i0 < len0; i0++) {
                                  const _errs15 = errors;
                                  if (!validate241(data6[i0], { instancePath: instancePath + "/hello/sensors/" + i0, parentData: data6, parentDataProperty: i0, rootData, dynamicAnchors })) {
                                    vErrors = vErrors === null ? validate241.errors : vErrors.concat(validate241.errors);
                                    errors = vErrors.length;
                                  }
                                  var valid2 = _errs15 === errors;
                                  if (!valid2) {
                                    break;
                                  }
                                }
                              } else {
                                validate240.errors = [{ instancePath: instancePath + "/hello/sensors", schemaPath: "#/properties/hello/properties/sensors/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                return false;
                              }
                            }
                            var valid1 = _errs13 === errors;
                          } else {
                            var valid1 = true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              validate240.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
              return false;
            }
          }
        }
      }
    } else {
      validate240.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate240.errors = vErrors;
  return errors === 0;
}
validate240.evaluated = { "props": { "hello": true }, "dynamicProps": false, "dynamicItems": false };
var schema109 = { "description": "Legacy Hello V3 request. Remote Management normalizes it to V4 before handling the session.", "type": "object", "properties": { "hello": { "description": "The legacy handshake.", "type": "object", "properties": { "version": { "description": "Hello version 3.", "type": "integer", "enum": [3] }, "apiKey": { "description": "The project's API key.", "type": "string" }, "deviceId": { "description": "The device identifier.", "type": "string" }, "deviceType": { "description": "The device type.", "type": "string" }, "connection": { "description": "How the device connects.", "type": "string", "enum": ["ip", "daemon"] }, "sensors": { "description": "The sensors the device offers.", "type": "array", "items": { "$ref": "#/$defs/Sensor" } }, "supportsSnapshotStreaming": { "description": "Whether the device supports snapshot streaming.", "type": "boolean" } }, "required": ["version", "apiKey", "deviceId", "deviceType", "connection", "sensors", "supportsSnapshotStreaming"] } }, "required": ["hello"] };
function validate244(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate244.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.hello === void 0 && (missing0 = "hello")) {
        validate244.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.hello !== void 0) {
          let data0 = data.hello;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
              let missing1;
              if (data0.version === void 0 && (missing1 = "version") || data0.apiKey === void 0 && (missing1 = "apiKey") || data0.deviceId === void 0 && (missing1 = "deviceId") || data0.deviceType === void 0 && (missing1 = "deviceType") || data0.connection === void 0 && (missing1 = "connection") || data0.sensors === void 0 && (missing1 = "sensors") || data0.supportsSnapshotStreaming === void 0 && (missing1 = "supportsSnapshotStreaming")) {
                validate244.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                return false;
              } else {
                if (data0.version !== void 0) {
                  let data1 = data0.version;
                  const _errs3 = errors;
                  if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
                    validate244.errors = [{ instancePath: instancePath + "/hello/version", schemaPath: "#/properties/hello/properties/version/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                    return false;
                  }
                  if (!(data1 === 3)) {
                    validate244.errors = [{ instancePath: instancePath + "/hello/version", schemaPath: "#/properties/hello/properties/version/enum", keyword: "enum", params: { allowedValues: schema109.properties.hello.properties.version.enum }, message: "must be equal to one of the allowed values" }];
                    return false;
                  }
                  var valid1 = _errs3 === errors;
                } else {
                  var valid1 = true;
                }
                if (valid1) {
                  if (data0.apiKey !== void 0) {
                    const _errs5 = errors;
                    if (typeof data0.apiKey !== "string") {
                      validate244.errors = [{ instancePath: instancePath + "/hello/apiKey", schemaPath: "#/properties/hello/properties/apiKey/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    var valid1 = _errs5 === errors;
                  } else {
                    var valid1 = true;
                  }
                  if (valid1) {
                    if (data0.deviceId !== void 0) {
                      const _errs7 = errors;
                      if (typeof data0.deviceId !== "string") {
                        validate244.errors = [{ instancePath: instancePath + "/hello/deviceId", schemaPath: "#/properties/hello/properties/deviceId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs7 === errors;
                    } else {
                      var valid1 = true;
                    }
                    if (valid1) {
                      if (data0.deviceType !== void 0) {
                        const _errs9 = errors;
                        if (typeof data0.deviceType !== "string") {
                          validate244.errors = [{ instancePath: instancePath + "/hello/deviceType", schemaPath: "#/properties/hello/properties/deviceType/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                        var valid1 = _errs9 === errors;
                      } else {
                        var valid1 = true;
                      }
                      if (valid1) {
                        if (data0.connection !== void 0) {
                          let data5 = data0.connection;
                          const _errs11 = errors;
                          if (typeof data5 !== "string") {
                            validate244.errors = [{ instancePath: instancePath + "/hello/connection", schemaPath: "#/properties/hello/properties/connection/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                          if (!(data5 === "ip" || data5 === "daemon")) {
                            validate244.errors = [{ instancePath: instancePath + "/hello/connection", schemaPath: "#/properties/hello/properties/connection/enum", keyword: "enum", params: { allowedValues: schema109.properties.hello.properties.connection.enum }, message: "must be equal to one of the allowed values" }];
                            return false;
                          }
                          var valid1 = _errs11 === errors;
                        } else {
                          var valid1 = true;
                        }
                        if (valid1) {
                          if (data0.sensors !== void 0) {
                            let data6 = data0.sensors;
                            const _errs13 = errors;
                            if (errors === _errs13) {
                              if (Array.isArray(data6)) {
                                var valid2 = true;
                                const len0 = data6.length;
                                for (let i0 = 0; i0 < len0; i0++) {
                                  const _errs15 = errors;
                                  if (!validate241(data6[i0], { instancePath: instancePath + "/hello/sensors/" + i0, parentData: data6, parentDataProperty: i0, rootData, dynamicAnchors })) {
                                    vErrors = vErrors === null ? validate241.errors : vErrors.concat(validate241.errors);
                                    errors = vErrors.length;
                                  }
                                  var valid2 = _errs15 === errors;
                                  if (!valid2) {
                                    break;
                                  }
                                }
                              } else {
                                validate244.errors = [{ instancePath: instancePath + "/hello/sensors", schemaPath: "#/properties/hello/properties/sensors/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                return false;
                              }
                            }
                            var valid1 = _errs13 === errors;
                          } else {
                            var valid1 = true;
                          }
                          if (valid1) {
                            if (data0.supportsSnapshotStreaming !== void 0) {
                              const _errs16 = errors;
                              if (typeof data0.supportsSnapshotStreaming !== "boolean") {
                                validate244.errors = [{ instancePath: instancePath + "/hello/supportsSnapshotStreaming", schemaPath: "#/properties/hello/properties/supportsSnapshotStreaming/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                return false;
                              }
                              var valid1 = _errs16 === errors;
                            } else {
                              var valid1 = true;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              validate244.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
              return false;
            }
          }
        }
      }
    } else {
      validate244.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate244.errors = vErrors;
  return errors === 0;
}
validate244.evaluated = { "props": { "hello": true }, "dynamicProps": false, "dynamicItems": false };
function validate247(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate247.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.hello === void 0 && (missing0 = "hello") || data.serverTimestamp === void 0 && (missing0 = "serverTimestamp")) {
        validate247.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.hello !== void 0) {
          const _errs1 = errors;
          if (typeof data.hello !== "boolean") {
            validate247.errors = [{ instancePath: instancePath + "/hello", schemaPath: "#/properties/hello/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.err !== void 0) {
            const _errs3 = errors;
            if (typeof data.err !== "string") {
              validate247.errors = [{ instancePath: instancePath + "/err", schemaPath: "#/properties/err/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.auth !== void 0) {
              const _errs5 = errors;
              if (typeof data.auth !== "boolean") {
                validate247.errors = [{ instancePath: instancePath + "/auth", schemaPath: "#/properties/auth/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.serverTimestamp !== void 0) {
                let data3 = data.serverTimestamp;
                const _errs7 = errors;
                if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                  validate247.errors = [{ instancePath: instancePath + "/serverTimestamp", schemaPath: "#/properties/serverTimestamp/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate247.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate247.errors = vErrors;
  return errors === 0;
}
validate247.evaluated = { "props": { "hello": true, "err": true, "auth": true, "serverTimestamp": true }, "dynamicProps": false, "dynamicItems": false };
function validate237(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate237.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate238(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate238.errors : vErrors.concat(validate238.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.hello = true;
  }
  const _errs2 = errors;
  if (!validate240(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate240.errors : vErrors.concat(validate240.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.hello = true;
      }
    }
    const _errs3 = errors;
    if (!validate244(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate244.errors : vErrors.concat(validate244.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.hello = true;
        }
      }
      const _errs4 = errors;
      if (!validate247(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate247.errors : vErrors.concat(validate247.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs4 === errors;
      if (_valid0 && valid0) {
        valid0 = false;
        passing0 = [passing0, 3];
      } else {
        if (_valid0) {
          valid0 = true;
          passing0 = 3;
          if (props0 !== true) {
            props0 = props0 || {};
            props0.hello = true;
            props0.err = true;
            props0.auth = true;
            props0.serverTimestamp = true;
          }
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate237.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate237.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate237.evaluated = { "dynamicProps": true, "dynamicItems": false };
exports.validateWorkloadContractMessage = validate249;
var schema113 = { "title": "InferenceRunnerRegistration", "description": "The Linux runner in agent-managed mode. Its artifact is the container image it runs from. It registers with empty `models` at startup, then with the single model from its active inference bundle.", "allOf": [{ "$ref": "#/$defs/RegisterRequestCommon" }, { "type": "object", "properties": { "mode": { "description": "The runner's input mode: camera, microphone or HTTP input. Runners report it both before and after bundle activation. Optional for registrations created before mode reporting was introduced; absence means unspecified.", "type": "string", "enum": ["camera", "microphone", "http"] }, "artifact": { "description": "The container image the runner runs from; the bundle it serves is represented by `models`.", "$ref": "#/$defs/Artifact" }, "kind": { "description": "Always `inference_runner`.", "type": "string", "enum": ["inference_runner"] } }, "required": ["kind", "artifact"] }] };
var schema115 = { "description": "The major version of the workload contract, `1`.", "type": "integer", "enum": [1] };
function validate253(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate253.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (!(typeof data == "number" && (!(data % 1) && !isNaN(data)) && isFinite(data))) {
    validate253.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
    return false;
  }
  if (!(data === 1)) {
    validate253.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema115.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate253.errors = vErrors;
  return errors === 0;
}
validate253.evaluated = { "dynamicProps": false, "dynamicItems": false };
var schema117 = { "description": "What an impulse's learn block produces.", "type": "string", "enum": ["classification", "object_detection", "constrained_object_detection", "freeform"] };
function validate256(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate256.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate256.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  if (!(data === "classification" || data === "object_detection" || data === "constrained_object_detection" || data === "freeform")) {
    validate256.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema117.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate256.errors = vErrors;
  return errors === 0;
}
validate256.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate258(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate258.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.type === void 0 && (missing0 = "type")) {
        validate258.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "id" || key0 === "type")) {
            let data0 = data[key0];
            const _errs2 = errors;
            if (!(typeof data0 == "number" && isFinite(data0))) {
              validate258.errors = [{ instancePath: instancePath + "/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/additionalProperties/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
            var valid0 = _errs2 === errors;
            if (!valid0) {
              break;
            }
          }
        }
        if (_errs1 === errors) {
          if (data.id !== void 0) {
            let data1 = data.id;
            const _errs4 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate258.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs4) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 0 || isNaN(data1)) {
                  validate258.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid1 = _errs4 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.type !== void 0) {
              const _errs6 = errors;
              if (typeof data.type !== "string") {
                validate258.errors = [{ instancePath: instancePath + "/type", schemaPath: "#/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid1 = _errs6 === errors;
            } else {
              var valid1 = true;
            }
          }
        }
      }
    } else {
      validate258.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate258.errors = vErrors;
  return errors === 0;
}
validate258.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate255(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate255.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.projectId === void 0 && (missing0 = "projectId") || data.impulseId === void 0 && (missing0 = "impulseId") || data.deploymentVersion === void 0 && (missing0 = "deploymentVersion") || data.engine === void 0 && (missing0 = "engine") || data.modelType === void 0 && (missing0 = "modelType") || data.labels === void 0 && (missing0 = "labels")) {
        validate255.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.deploymentVersion !== void 0) {
          let data0 = data.deploymentVersion;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate255.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate255.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.engine !== void 0) {
            const _errs3 = errors;
            if (typeof data.engine !== "string") {
              validate255.errors = [{ instancePath: instancePath + "/engine", schemaPath: "#/properties/engine/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.id !== void 0) {
              const _errs5 = errors;
              if (typeof data.id !== "string") {
                validate255.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.impulseId !== void 0) {
                let data3 = data.impulseId;
                const _errs7 = errors;
                if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                  validate255.errors = [{ instancePath: instancePath + "/impulseId", schemaPath: "#/properties/impulseId/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs7) {
                  if (typeof data3 == "number" && isFinite(data3)) {
                    if (data3 < 0 || isNaN(data3)) {
                      validate255.errors = [{ instancePath: instancePath + "/impulseId", schemaPath: "#/properties/impulseId/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.labels !== void 0) {
                  let data4 = data.labels;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (Array.isArray(data4)) {
                      var valid1 = true;
                      const len0 = data4.length;
                      for (let i0 = 0; i0 < len0; i0++) {
                        const _errs11 = errors;
                        if (typeof data4[i0] !== "string") {
                          validate255.errors = [{ instancePath: instancePath + "/labels/" + i0, schemaPath: "#/properties/labels/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                        var valid1 = _errs11 === errors;
                        if (!valid1) {
                          break;
                        }
                      }
                    } else {
                      validate255.errors = [{ instancePath: instancePath + "/labels", schemaPath: "#/properties/labels/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                      return false;
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.modelType !== void 0) {
                    const _errs13 = errors;
                    if (!validate256(data.modelType, { instancePath: instancePath + "/modelType", parentData: data, parentDataProperty: "modelType", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate256.errors : vErrors.concat(validate256.errors);
                      errors = vErrors.length;
                    }
                    var valid0 = _errs13 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.projectId !== void 0) {
                      let data7 = data.projectId;
                      const _errs14 = errors;
                      if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                        validate255.errors = [{ instancePath: instancePath + "/projectId", schemaPath: "#/properties/projectId/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                        return false;
                      }
                      if (errors === _errs14) {
                        if (typeof data7 == "number" && isFinite(data7)) {
                          if (data7 < 0 || isNaN(data7)) {
                            validate255.errors = [{ instancePath: instancePath + "/projectId", schemaPath: "#/properties/projectId/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                            return false;
                          }
                        }
                      }
                      var valid0 = _errs14 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.projectName !== void 0) {
                        const _errs16 = errors;
                        if (typeof data.projectName !== "string") {
                          validate255.errors = [{ instancePath: instancePath + "/projectName", schemaPath: "#/properties/projectName/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                        var valid0 = _errs16 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.projectOwner !== void 0) {
                          const _errs18 = errors;
                          if (typeof data.projectOwner !== "string") {
                            validate255.errors = [{ instancePath: instancePath + "/projectOwner", schemaPath: "#/properties/projectOwner/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                          var valid0 = _errs18 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.thresholds !== void 0) {
                            let data10 = data.thresholds;
                            const _errs20 = errors;
                            if (errors === _errs20) {
                              if (Array.isArray(data10)) {
                                var valid2 = true;
                                const len1 = data10.length;
                                for (let i1 = 0; i1 < len1; i1++) {
                                  const _errs22 = errors;
                                  if (!validate258(data10[i1], { instancePath: instancePath + "/thresholds/" + i1, parentData: data10, parentDataProperty: i1, rootData, dynamicAnchors })) {
                                    vErrors = vErrors === null ? validate258.errors : vErrors.concat(validate258.errors);
                                    errors = vErrors.length;
                                  }
                                  var valid2 = _errs22 === errors;
                                  if (!valid2) {
                                    break;
                                  }
                                }
                              } else {
                                validate255.errors = [{ instancePath: instancePath + "/thresholds", schemaPath: "#/properties/thresholds/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                return false;
                              }
                            }
                            var valid0 = _errs20 === errors;
                          } else {
                            var valid0 = true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate255.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate255.errors = vErrors;
  return errors === 0;
}
validate255.evaluated = { "props": { "deploymentVersion": true, "engine": true, "id": true, "impulseId": true, "labels": true, "modelType": true, "projectId": true, "projectName": true, "projectOwner": true, "thresholds": true }, "dynamicProps": false, "dynamicItems": false };
function validate261(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate261.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.name === void 0 && (missing0 = "name") || data.maxSampleLengthS === void 0 && (missing0 = "maxSampleLengthS") || data.frequencies === void 0 && (missing0 = "frequencies")) {
        validate261.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.frequencies !== void 0) {
          let data0 = data.frequencies;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (Array.isArray(data0)) {
              var valid1 = true;
              const len0 = data0.length;
              for (let i0 = 0; i0 < len0; i0++) {
                let data1 = data0[i0];
                const _errs3 = errors;
                if (errors === _errs3) {
                  if (!(typeof data1 == "number" && isFinite(data1))) {
                    validate261.errors = [{ instancePath: instancePath + "/frequencies/" + i0, schemaPath: "#/properties/frequencies/items/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                    return false;
                  }
                }
                var valid1 = _errs3 === errors;
                if (!valid1) {
                  break;
                }
              }
            } else {
              validate261.errors = [{ instancePath: instancePath + "/frequencies", schemaPath: "#/properties/frequencies/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.maxSampleLengthS !== void 0) {
            let data2 = data.maxSampleLengthS;
            const _errs5 = errors;
            if (errors === _errs5) {
              if (!(typeof data2 == "number" && isFinite(data2))) {
                validate261.errors = [{ instancePath: instancePath + "/maxSampleLengthS", schemaPath: "#/properties/maxSampleLengthS/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                return false;
              }
            }
            var valid0 = _errs5 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.name !== void 0) {
              const _errs7 = errors;
              if (typeof data.name !== "string") {
                validate261.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs7 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate261.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate261.errors = vErrors;
  return errors === 0;
}
validate261.evaluated = { "props": { "frequencies": true, "maxSampleLengthS": true, "name": true }, "dynamicProps": false, "dynamicItems": false };
function validate252(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate252.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.version === void 0 && (missing0 = "version") || data.contractVersion === void 0 && (missing0 = "contractVersion") || data.models === void 0 && (missing0 = "models")) {
        validate252.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.capabilities !== void 0) {
          let data0 = data.capabilities;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (Array.isArray(data0)) {
              var valid1 = true;
              const len0 = data0.length;
              for (let i0 = 0; i0 < len0; i0++) {
                const _errs3 = errors;
                if (typeof data0[i0] !== "string") {
                  validate252.errors = [{ instancePath: instancePath + "/capabilities/" + i0, schemaPath: "#/properties/capabilities/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid1 = _errs3 === errors;
                if (!valid1) {
                  break;
                }
              }
            } else {
              validate252.errors = [{ instancePath: instancePath + "/capabilities", schemaPath: "#/properties/capabilities/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.contractVersion !== void 0) {
            const _errs5 = errors;
            if (!validate253(data.contractVersion, { instancePath: instancePath + "/contractVersion", parentData: data, parentDataProperty: "contractVersion", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate253.errors : vErrors.concat(validate253.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs5 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.models !== void 0) {
              let data3 = data.models;
              const _errs6 = errors;
              if (errors === _errs6) {
                if (Array.isArray(data3)) {
                  var valid2 = true;
                  const len1 = data3.length;
                  for (let i1 = 0; i1 < len1; i1++) {
                    const _errs8 = errors;
                    if (!validate255(data3[i1], { instancePath: instancePath + "/models/" + i1, parentData: data3, parentDataProperty: i1, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate255.errors : vErrors.concat(validate255.errors);
                      errors = vErrors.length;
                    }
                    var valid2 = _errs8 === errors;
                    if (!valid2) {
                      break;
                    }
                  }
                } else {
                  validate252.errors = [{ instancePath: instancePath + "/models", schemaPath: "#/properties/models/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs6 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.sensors !== void 0) {
                let data5 = data.sensors;
                const _errs9 = errors;
                if (errors === _errs9) {
                  if (Array.isArray(data5)) {
                    var valid3 = true;
                    const len2 = data5.length;
                    for (let i2 = 0; i2 < len2; i2++) {
                      const _errs11 = errors;
                      if (!validate261(data5[i2], { instancePath: instancePath + "/sensors/" + i2, parentData: data5, parentDataProperty: i2, rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate261.errors : vErrors.concat(validate261.errors);
                        errors = vErrors.length;
                      }
                      var valid3 = _errs11 === errors;
                      if (!valid3) {
                        break;
                      }
                    }
                  } else {
                    validate252.errors = [{ instancePath: instancePath + "/sensors", schemaPath: "#/properties/sensors/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                    return false;
                  }
                }
                var valid0 = _errs9 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.version !== void 0) {
                  const _errs12 = errors;
                  if (typeof data.version !== "string") {
                    validate252.errors = [{ instancePath: instancePath + "/version", schemaPath: "#/properties/version/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  var valid0 = _errs12 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate252.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate252.errors = vErrors;
  return errors === 0;
}
validate252.evaluated = { "props": { "capabilities": true, "contractVersion": true, "models": true, "sensors": true, "version": true }, "dynamicProps": false, "dynamicItems": false };
var schema121 = { "description": "The kind of artifact: the workload's image or the inference bundle it serves.", "oneOf": [{ "description": "The container image the workload runs from.", "type": "string", "enum": ["containerImage"] }, { "description": "The inference bundle the workload serves: a directory with manifest.json and the files it lists.", "type": "string", "enum": ["inferenceBundle"] }] };
function validate265(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate265.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (typeof data !== "string") {
    const err0 = { instancePath, schemaPath: "#/oneOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  if (!(data === "containerImage")) {
    const err1 = { instancePath, schemaPath: "#/oneOf/0/enum", keyword: "enum", params: { allowedValues: schema121.oneOf[0].enum }, message: "must be equal to one of the allowed values" };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs3 = errors;
  if (typeof data !== "string") {
    const err2 = { instancePath, schemaPath: "#/oneOf/1/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (!(data === "inferenceBundle")) {
    const err3 = { instancePath, schemaPath: "#/oneOf/1/enum", keyword: "enum", params: { allowedValues: schema121.oneOf[1].enum }, message: "must be equal to one of the allowed values" };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  var _valid0 = _errs3 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
    }
  }
  if (!valid0) {
    const err4 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
    validate265.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate265.errors = vErrors;
  return errors === 0;
}
validate265.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate264(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate264.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.kind === void 0 && (missing0 = "kind") || data.reference === void 0 && (missing0 = "reference")) {
        validate264.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.digest !== void 0) {
          const _errs1 = errors;
          if (typeof data.digest !== "string") {
            validate264.errors = [{ instancePath: instancePath + "/digest", schemaPath: "#/properties/digest/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.kind !== void 0) {
            const _errs3 = errors;
            if (!validate265(data.kind, { instancePath: instancePath + "/kind", parentData: data, parentDataProperty: "kind", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate265.errors : vErrors.concat(validate265.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.reference !== void 0) {
              const _errs4 = errors;
              if (typeof data.reference !== "string") {
                validate264.errors = [{ instancePath: instancePath + "/reference", schemaPath: "#/properties/reference/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate264.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate264.errors = vErrors;
  return errors === 0;
}
validate264.evaluated = { "props": { "digest": true, "kind": true, "reference": true }, "dynamicProps": false, "dynamicItems": false };
function validate251(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate251.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate252(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate252.errors : vErrors.concat(validate252.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.kind === void 0 && (missing0 = "kind") || data.artifact === void 0 && (missing0 = "artifact")) {
          validate251.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.mode !== void 0) {
            let data0 = data.mode;
            const _errs3 = errors;
            if (typeof data0 !== "string") {
              validate251.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/allOf/1/properties/mode/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if (!(data0 === "camera" || data0 === "microphone" || data0 === "http")) {
              validate251.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/allOf/1/properties/mode/enum", keyword: "enum", params: { allowedValues: schema113.allOf[1].properties.mode.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.artifact !== void 0) {
              const _errs5 = errors;
              if (!validate264(data.artifact, { instancePath: instancePath + "/artifact", parentData: data, parentDataProperty: "artifact", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate264.errors : vErrors.concat(validate264.errors);
                errors = vErrors.length;
              }
              var valid1 = _errs5 === errors;
            } else {
              var valid1 = true;
            }
            if (valid1) {
              if (data.kind !== void 0) {
                let data2 = data.kind;
                const _errs6 = errors;
                if (typeof data2 !== "string") {
                  validate251.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if (!(data2 === "inference_runner")) {
                  validate251.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/enum", keyword: "enum", params: { allowedValues: schema113.allOf[1].properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                  return false;
                }
                var valid1 = _errs6 === errors;
              } else {
                var valid1 = true;
              }
            }
          }
        }
      } else {
        validate251.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate251.errors = vErrors;
  return errors === 0;
}
validate251.evaluated = { "props": { "mode": true, "artifact": true, "kind": true, "capabilities": true, "contractVersion": true, "models": true, "sensors": true, "version": true }, "dynamicProps": false, "dynamicItems": false };
var schema122 = { "title": "WorkflowRuntimeRegistration", "description": "The workflow runtime serves an inference bundle of kind workflow. Its artifact identifies its image or inferenceBundle; `models` lists the models from the active manifest, and is empty before the first activation.", "allOf": [{ "$ref": "#/$defs/RegisterRequestCommon" }, { "type": "object", "properties": { "artifact": { "description": "The container image the runtime runs from or the inferenceBundle it serves; the active bundle's models are reported in `models`.", "$ref": "#/$defs/Artifact" }, "kind": { "description": "Always `workflow_runtime`.", "type": "string", "enum": ["workflow_runtime"] } }, "required": ["kind", "artifact"] }] };
function validate269(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate269.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate252(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate252.errors : vErrors.concat(validate252.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.kind === void 0 && (missing0 = "kind") || data.artifact === void 0 && (missing0 = "artifact")) {
          validate269.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.artifact !== void 0) {
            const _errs3 = errors;
            if (!validate264(data.artifact, { instancePath: instancePath + "/artifact", parentData: data, parentDataProperty: "artifact", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate264.errors : vErrors.concat(validate264.errors);
              errors = vErrors.length;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.kind !== void 0) {
              let data1 = data.kind;
              const _errs4 = errors;
              if (typeof data1 !== "string") {
                validate269.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              if (!(data1 === "workflow_runtime")) {
                validate269.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/enum", keyword: "enum", params: { allowedValues: schema122.allOf[1].properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid1 = _errs4 === errors;
            } else {
              var valid1 = true;
            }
          }
        }
      } else {
        validate269.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate269.errors = vErrors;
  return errors === 0;
}
validate269.evaluated = { "props": { "artifact": true, "kind": true, "capabilities": true, "contractVersion": true, "models": true, "sensors": true, "version": true }, "dynamicProps": false, "dynamicItems": false };
var schema123 = { "title": "ApplicationRegistration", "description": "A customer application on the SDK. The agent reports it by its\n`version` when it has no artifact.", "allOf": [{ "$ref": "#/$defs/RegisterRequestCommon" }, { "type": "object", "properties": { "artifact": { "description": "The artifact, when something deploys the application.", "$ref": "#/$defs/Artifact" }, "kind": { "description": "Always `application`.", "type": "string", "enum": ["application"] } }, "required": ["kind"] }] };
function validate273(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate273.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate252(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate252.errors : vErrors.concat(validate252.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.kind === void 0 && (missing0 = "kind")) {
          validate273.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.artifact !== void 0) {
            const _errs3 = errors;
            if (!validate264(data.artifact, { instancePath: instancePath + "/artifact", parentData: data, parentDataProperty: "artifact", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate264.errors : vErrors.concat(validate264.errors);
              errors = vErrors.length;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.kind !== void 0) {
              let data1 = data.kind;
              const _errs4 = errors;
              if (typeof data1 !== "string") {
                validate273.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              if (!(data1 === "application")) {
                validate273.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/enum", keyword: "enum", params: { allowedValues: schema123.allOf[1].properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid1 = _errs4 === errors;
            } else {
              var valid1 = true;
            }
          }
        }
      } else {
        validate273.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate273.errors = vErrors;
  return errors === 0;
}
validate273.evaluated = { "props": { "artifact": true, "kind": true, "capabilities": true, "contractVersion": true, "models": true, "sensors": true, "version": true }, "dynamicProps": false, "dynamicItems": false };
function validate250(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate250.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate251(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate251.errors : vErrors.concat(validate251.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.mode = true;
    props0.artifact = true;
    props0.kind = true;
    props0.capabilities = true;
    props0.contractVersion = true;
    props0.models = true;
    props0.sensors = true;
    props0.version = true;
  }
  const _errs2 = errors;
  if (!validate269(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate269.errors : vErrors.concat(validate269.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.artifact = true;
        props0.kind = true;
        props0.capabilities = true;
        props0.contractVersion = true;
        props0.models = true;
        props0.sensors = true;
        props0.version = true;
      }
    }
    const _errs3 = errors;
    if (!validate273(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate273.errors : vErrors.concat(validate273.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.artifact = true;
          props0.kind = true;
          props0.capabilities = true;
          props0.contractVersion = true;
          props0.models = true;
          props0.sensors = true;
          props0.version = true;
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate250.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate250.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate250.evaluated = { "dynamicProps": true, "dynamicItems": false };
var schema126 = { "title": "InputPolicyNone", "description": "Attach no input. `fraction` is forbidden in this mode.", "type": "object", "properties": { "mode": { "description": "Always `none`.", "type": "string", "enum": ["none"] }, "fraction": false }, "required": ["mode"] };
function validate280(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate280.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.mode === void 0 && (missing0 = "mode")) {
        validate280.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.mode !== void 0) {
          let data0 = data.mode;
          const _errs1 = errors;
          if (typeof data0 !== "string") {
            validate280.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/properties/mode/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          if (!(data0 === "none")) {
            validate280.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/properties/mode/enum", keyword: "enum", params: { allowedValues: schema126.properties.mode.enum }, message: "must be equal to one of the allowed values" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.fraction !== void 0) {
            var valid0 = false;
            validate280.errors = [{ instancePath: instancePath + "/fraction", schemaPath: "#/properties/fraction/false schema", keyword: "false schema", params: {}, message: "boolean schema is false" }];
            return false;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate280.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate280.errors = vErrors;
  return errors === 0;
}
validate280.evaluated = { "props": { "mode": true, "fraction": true }, "dynamicProps": false, "dynamicItems": false };
var schema127 = { "title": "InputPolicyFraction", "description": "Attach this fraction of inputs, 0 to 1.", "type": "object", "properties": { "fraction": { "description": "The fraction of inputs to attach, 0 to 1.", "type": "number", "format": "double", "maximum": 1, "minimum": 0 }, "mode": { "description": "Always `fraction`.", "type": "string", "enum": ["fraction"] }, "maxPerSecond": { "description": "At most this many inputs per second.", "type": "number", "format": "double" } }, "required": ["mode", "fraction"] };
function validate282(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate282.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.mode === void 0 && (missing0 = "mode") || data.fraction === void 0 && (missing0 = "fraction")) {
        validate282.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.fraction !== void 0) {
          let data0 = data.fraction;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 > 1 || isNaN(data0)) {
                validate282.errors = [{ instancePath: instancePath + "/fraction", schemaPath: "#/properties/fraction/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1 }, message: "must be <= 1" }];
                return false;
              } else {
                if (data0 < 0 || isNaN(data0)) {
                  validate282.errors = [{ instancePath: instancePath + "/fraction", schemaPath: "#/properties/fraction/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            } else {
              validate282.errors = [{ instancePath: instancePath + "/fraction", schemaPath: "#/properties/fraction/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.mode !== void 0) {
            let data1 = data.mode;
            const _errs3 = errors;
            if (typeof data1 !== "string") {
              validate282.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/properties/mode/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if (!(data1 === "fraction")) {
              validate282.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/properties/mode/enum", keyword: "enum", params: { allowedValues: schema127.properties.mode.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.maxPerSecond !== void 0) {
              let data2 = data.maxPerSecond;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (!(typeof data2 == "number" && isFinite(data2))) {
                  validate282.errors = [{ instancePath: instancePath + "/maxPerSecond", schemaPath: "#/properties/maxPerSecond/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate282.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate282.errors = vErrors;
  return errors === 0;
}
validate282.evaluated = { "props": { "fraction": true, "mode": true, "maxPerSecond": true }, "dynamicProps": false, "dynamicItems": false };
var schema128 = { "title": "InputPolicyAll", "description": "Attach every input. `fraction` is forbidden in this mode.", "type": "object", "properties": { "mode": { "description": "Always `all`.", "type": "string", "enum": ["all"] }, "fraction": false, "maxPerSecond": { "description": "At most this many inputs per second.", "type": "number", "format": "double" } }, "required": ["mode"] };
function validate284(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate284.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.mode === void 0 && (missing0 = "mode")) {
        validate284.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.mode !== void 0) {
          let data0 = data.mode;
          const _errs1 = errors;
          if (typeof data0 !== "string") {
            validate284.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/properties/mode/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          if (!(data0 === "all")) {
            validate284.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/properties/mode/enum", keyword: "enum", params: { allowedValues: schema128.properties.mode.enum }, message: "must be equal to one of the allowed values" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.fraction !== void 0) {
            var valid0 = false;
            validate284.errors = [{ instancePath: instancePath + "/fraction", schemaPath: "#/properties/fraction/false schema", keyword: "false schema", params: {}, message: "boolean schema is false" }];
            return false;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.maxPerSecond !== void 0) {
              let data2 = data.maxPerSecond;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (!(typeof data2 == "number" && isFinite(data2))) {
                  validate284.errors = [{ instancePath: instancePath + "/maxPerSecond", schemaPath: "#/properties/maxPerSecond/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                  return false;
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate284.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate284.errors = vErrors;
  return errors === 0;
}
validate284.evaluated = { "props": { "mode": true, "fraction": true, "maxPerSecond": true }, "dynamicProps": false, "dynamicItems": false };
function validate279(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate279.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate280(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate280.errors : vErrors.concat(validate280.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.mode = true;
    props0.fraction = true;
  }
  const _errs2 = errors;
  if (!validate282(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate282.errors : vErrors.concat(validate282.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.fraction = true;
        props0.mode = true;
        props0.maxPerSecond = true;
      }
    }
    const _errs3 = errors;
    if (!validate284(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate284.errors : vErrors.concat(validate284.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.mode = true;
          props0.fraction = true;
          props0.maxPerSecond = true;
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate279.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate279.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate279.evaluated = { "dynamicProps": true, "dynamicItems": false };
function validate278(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate278.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.workloadId === void 0 && (missing0 = "workloadId") || data.inputPolicy === void 0 && (missing0 = "inputPolicy") || data.inlineSizeLimitBytes === void 0 && (missing0 = "inlineSizeLimitBytes")) {
        validate278.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.commandStreamTimeoutS !== void 0) {
          let data0 = data.commandStreamTimeoutS;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate278.errors = [{ instancePath: instancePath + "/commandStreamTimeoutS", schemaPath: "#/properties/commandStreamTimeoutS/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate278.errors = [{ instancePath: instancePath + "/commandStreamTimeoutS", schemaPath: "#/properties/commandStreamTimeoutS/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.inlineSizeLimitBytes !== void 0) {
            let data1 = data.inlineSizeLimitBytes;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate278.errors = [{ instancePath: instancePath + "/inlineSizeLimitBytes", schemaPath: "#/properties/inlineSizeLimitBytes/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs3) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 0 || isNaN(data1)) {
                  validate278.errors = [{ instancePath: instancePath + "/inlineSizeLimitBytes", schemaPath: "#/properties/inlineSizeLimitBytes/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.inputPolicy !== void 0) {
              const _errs5 = errors;
              if (!validate279(data.inputPolicy, { instancePath: instancePath + "/inputPolicy", parentData: data, parentDataProperty: "inputPolicy", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate279.errors : vErrors.concat(validate279.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.spoolDirectory !== void 0) {
                const _errs6 = errors;
                if (typeof data.spoolDirectory !== "string") {
                  validate278.errors = [{ instancePath: instancePath + "/spoolDirectory", schemaPath: "#/properties/spoolDirectory/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.workloadId !== void 0) {
                  const _errs8 = errors;
                  if (typeof data.workloadId !== "string") {
                    validate278.errors = [{ instancePath: instancePath + "/workloadId", schemaPath: "#/properties/workloadId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate278.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate278.errors = vErrors;
  return errors === 0;
}
validate278.evaluated = { "props": { "commandStreamTimeoutS": true, "inlineSizeLimitBytes": true, "inputPolicy": true, "spoolDirectory": true, "workloadId": true }, "dynamicProps": false, "dynamicItems": false };
var schema134 = { "title": "InlineInput", "description": "In the message, base64 encoded. Up to the inline size limit.", "allOf": [{ "$ref": "#/$defs/InputCommon" }, { "type": "object", "properties": { "bufferBase64": { "description": "The bytes, base64 encoded.", "type": "string" }, "location": { "description": "Always `inline`.", "type": "string", "enum": ["inline"] } }, "required": ["location", "bufferBase64"] }] };
var schema136 = { "description": "The format of an input or a sample.", "oneOf": [{ "description": "A JPEG image.", "type": "string", "enum": ["jpg"] }, { "description": "A WAV file.", "type": "string", "enum": ["wav"] }, { "description": "The Data Acquisition Format, CBOR encoded, for other sensors.", "type": "string", "enum": ["cbor"] }, { "description": "The Data Acquisition Format, JSON encoded.", "type": "string", "enum": ["json"] }] };
function validate295(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate295.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (typeof data !== "string") {
    const err0 = { instancePath, schemaPath: "#/oneOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  if (!(data === "jpg")) {
    const err1 = { instancePath, schemaPath: "#/oneOf/0/enum", keyword: "enum", params: { allowedValues: schema136.oneOf[0].enum }, message: "must be equal to one of the allowed values" };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs3 = errors;
  if (typeof data !== "string") {
    const err2 = { instancePath, schemaPath: "#/oneOf/1/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (!(data === "wav")) {
    const err3 = { instancePath, schemaPath: "#/oneOf/1/enum", keyword: "enum", params: { allowedValues: schema136.oneOf[1].enum }, message: "must be equal to one of the allowed values" };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  var _valid0 = _errs3 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
    }
    const _errs5 = errors;
    if (typeof data !== "string") {
      const err4 = { instancePath, schemaPath: "#/oneOf/2/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (!(data === "cbor")) {
      const err5 = { instancePath, schemaPath: "#/oneOf/2/enum", keyword: "enum", params: { allowedValues: schema136.oneOf[2].enum }, message: "must be equal to one of the allowed values" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    var _valid0 = _errs5 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
      }
      const _errs7 = errors;
      if (typeof data !== "string") {
        const err6 = { instancePath, schemaPath: "#/oneOf/3/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (!(data === "json")) {
        const err7 = { instancePath, schemaPath: "#/oneOf/3/enum", keyword: "enum", params: { allowedValues: schema136.oneOf[3].enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid0 = _errs7 === errors;
      if (_valid0 && valid0) {
        valid0 = false;
        passing0 = [passing0, 3];
      } else {
        if (_valid0) {
          valid0 = true;
          passing0 = 3;
        }
      }
    }
  }
  if (!valid0) {
    const err8 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
    validate295.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate295.errors = vErrors;
  return errors === 0;
}
validate295.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate294(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate294.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.type === void 0 && (missing0 = "type")) {
        validate294.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.captureRef !== void 0) {
          const _errs1 = errors;
          if (typeof data.captureRef !== "string") {
            validate294.errors = [{ instancePath: instancePath + "/captureRef", schemaPath: "#/properties/captureRef/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.type !== void 0) {
            const _errs3 = errors;
            if (!validate295(data.type, { instancePath: instancePath + "/type", parentData: data, parentDataProperty: "type", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate295.errors : vErrors.concat(validate295.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate294.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate294.errors = vErrors;
  return errors === 0;
}
validate294.evaluated = { "props": { "captureRef": true, "type": true }, "dynamicProps": false, "dynamicItems": false };
function validate293(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate293.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate294(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate294.errors : vErrors.concat(validate294.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.location === void 0 && (missing0 = "location") || data.bufferBase64 === void 0 && (missing0 = "bufferBase64")) {
          validate293.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.bufferBase64 !== void 0) {
            const _errs3 = errors;
            if (typeof data.bufferBase64 !== "string") {
              validate293.errors = [{ instancePath: instancePath + "/bufferBase64", schemaPath: "#/allOf/1/properties/bufferBase64/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.location !== void 0) {
              let data1 = data.location;
              const _errs5 = errors;
              if (typeof data1 !== "string") {
                validate293.errors = [{ instancePath: instancePath + "/location", schemaPath: "#/allOf/1/properties/location/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              if (!(data1 === "inline")) {
                validate293.errors = [{ instancePath: instancePath + "/location", schemaPath: "#/allOf/1/properties/location/enum", keyword: "enum", params: { allowedValues: schema134.allOf[1].properties.location.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid1 = _errs5 === errors;
            } else {
              var valid1 = true;
            }
          }
        }
      } else {
        validate293.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate293.errors = vErrors;
  return errors === 0;
}
validate293.evaluated = { "props": { "bufferBase64": true, "location": true, "captureRef": true, "type": true }, "dynamicProps": false, "dynamicItems": false };
var schema137 = { "title": "SpoolInput", "description": "A file in the spool directory, which the agent copies if it keeps the\ninput and otherwise ignores.", "allOf": [{ "$ref": "#/$defs/InputCommon" }, { "type": "object", "properties": { "location": { "description": "Always `spool`.", "type": "string", "enum": ["spool"] }, "path": { "description": "The name of a file directly in the spool directory, without a directory\npart. The agent refuses other paths, symbolic links and files with other\nhard links.", "type": "string" }, "sizeBytes": { "description": "The file's size, so the agent can apply its budget before reading it.", "type": "integer", "format": "uint64", "minimum": 0 } }, "required": ["location", "path", "sizeBytes"] }] };
function validate299(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate299.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate294(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate294.errors : vErrors.concat(validate294.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.location === void 0 && (missing0 = "location") || data.path === void 0 && (missing0 = "path") || data.sizeBytes === void 0 && (missing0 = "sizeBytes")) {
          validate299.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.location !== void 0) {
            let data0 = data.location;
            const _errs3 = errors;
            if (typeof data0 !== "string") {
              validate299.errors = [{ instancePath: instancePath + "/location", schemaPath: "#/allOf/1/properties/location/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if (!(data0 === "spool")) {
              validate299.errors = [{ instancePath: instancePath + "/location", schemaPath: "#/allOf/1/properties/location/enum", keyword: "enum", params: { allowedValues: schema137.allOf[1].properties.location.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.path !== void 0) {
              const _errs5 = errors;
              if (typeof data.path !== "string") {
                validate299.errors = [{ instancePath: instancePath + "/path", schemaPath: "#/allOf/1/properties/path/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid1 = _errs5 === errors;
            } else {
              var valid1 = true;
            }
            if (valid1) {
              if (data.sizeBytes !== void 0) {
                let data2 = data.sizeBytes;
                const _errs7 = errors;
                if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                  validate299.errors = [{ instancePath: instancePath + "/sizeBytes", schemaPath: "#/allOf/1/properties/sizeBytes/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs7) {
                  if (typeof data2 == "number" && isFinite(data2)) {
                    if (data2 < 0 || isNaN(data2)) {
                      validate299.errors = [{ instancePath: instancePath + "/sizeBytes", schemaPath: "#/allOf/1/properties/sizeBytes/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid1 = _errs7 === errors;
              } else {
                var valid1 = true;
              }
            }
          }
        }
      } else {
        validate299.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate299.errors = vErrors;
  return errors === 0;
}
validate299.evaluated = { "props": { "location": true, "path": true, "sizeBytes": true, "captureRef": true, "type": true }, "dynamicProps": false, "dynamicItems": false };
function validate292(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate292.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate293(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate293.errors : vErrors.concat(validate293.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.bufferBase64 = true;
    props0.location = true;
    props0.captureRef = true;
    props0.type = true;
  }
  const _errs2 = errors;
  if (!validate299(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate299.errors : vErrors.concat(validate299.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.location = true;
        props0.path = true;
        props0.sizeBytes = true;
        props0.captureRef = true;
        props0.type = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate292.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate292.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate292.evaluated = { "dynamicProps": true, "dynamicItems": false };
function validate291(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate291.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.inferenceTimestamp === void 0 && (missing0 = "inferenceTimestamp")) {
        validate291.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.captureTimestamp !== void 0) {
          let data0 = data.captureTimestamp;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate291.errors = [{ instancePath: instancePath + "/captureTimestamp", schemaPath: "#/properties/captureTimestamp/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.id !== void 0) {
            const _errs3 = errors;
            if (typeof data.id !== "string") {
              validate291.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.inferenceTimestamp !== void 0) {
              let data2 = data.inferenceTimestamp;
              const _errs5 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate291.errors = [{ instancePath: instancePath + "/inferenceTimestamp", schemaPath: "#/properties/inferenceTimestamp/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.input !== void 0) {
                const _errs7 = errors;
                if (!validate292(data.input, { instancePath: instancePath + "/input", parentData: data, parentDataProperty: "input", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate292.errors : vErrors.concat(validate292.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate291.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate291.errors = vErrors;
  return errors === 0;
}
validate291.evaluated = { "props": { "captureTimestamp": true, "id": true, "inferenceTimestamp": true, "input": true }, "dynamicProps": false, "dynamicItems": false };
function validate304(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate304.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.reason === void 0 && (missing0 = "reason")) {
        validate304.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.modelId !== void 0) {
          const _errs1 = errors;
          if (typeof data.modelId !== "string") {
            validate304.errors = [{ instancePath: instancePath + "/modelId", schemaPath: "#/properties/modelId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.reason !== void 0) {
            const _errs3 = errors;
            if (typeof data.reason !== "string") {
              validate304.errors = [{ instancePath: instancePath + "/reason", schemaPath: "#/properties/reason/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate304.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate304.errors = vErrors;
  return errors === 0;
}
validate304.evaluated = { "props": { "modelId": true, "reason": true }, "dynamicProps": false, "dynamicItems": false };
function validate308(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate308.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.label === void 0 && (missing0 = "label") || data.value === void 0 && (missing0 = "value") || data.x === void 0 && (missing0 = "x") || data.y === void 0 && (missing0 = "y") || data.width === void 0 && (missing0 = "width") || data.height === void 0 && (missing0 = "height")) {
        validate308.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.height !== void 0) {
          let data0 = data.height;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (!(typeof data0 == "number" && isFinite(data0))) {
              validate308.errors = [{ instancePath: instancePath + "/height", schemaPath: "#/properties/height/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.label !== void 0) {
            const _errs3 = errors;
            if (typeof data.label !== "string") {
              validate308.errors = [{ instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.value !== void 0) {
              let data2 = data.value;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (!(typeof data2 == "number" && isFinite(data2))) {
                  validate308.errors = [{ instancePath: instancePath + "/value", schemaPath: "#/properties/value/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.width !== void 0) {
                let data3 = data.width;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (!(typeof data3 == "number" && isFinite(data3))) {
                    validate308.errors = [{ instancePath: instancePath + "/width", schemaPath: "#/properties/width/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                    return false;
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.x !== void 0) {
                  let data4 = data.x;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (!(typeof data4 == "number" && isFinite(data4))) {
                      validate308.errors = [{ instancePath: instancePath + "/x", schemaPath: "#/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.y !== void 0) {
                    let data5 = data.y;
                    const _errs11 = errors;
                    if (errors === _errs11) {
                      if (!(typeof data5 == "number" && isFinite(data5))) {
                        validate308.errors = [{ instancePath: instancePath + "/y", schemaPath: "#/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                        return false;
                      }
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate308.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate308.errors = vErrors;
  return errors === 0;
}
validate308.evaluated = { "props": { "height": true, "label": true, "value": true, "width": true, "x": true, "y": true }, "dynamicProps": false, "dynamicItems": false };
function validate310(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate310.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.object_id === void 0 && (missing0 = "object_id") || data.label === void 0 && (missing0 = "label") || data.value === void 0 && (missing0 = "value") || data.x === void 0 && (missing0 = "x") || data.y === void 0 && (missing0 = "y") || data.width === void 0 && (missing0 = "width") || data.height === void 0 && (missing0 = "height")) {
        validate310.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.height !== void 0) {
          let data0 = data.height;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (!(typeof data0 == "number" && isFinite(data0))) {
              validate310.errors = [{ instancePath: instancePath + "/height", schemaPath: "#/properties/height/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.label !== void 0) {
            const _errs3 = errors;
            if (typeof data.label !== "string") {
              validate310.errors = [{ instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.object_id !== void 0) {
              let data2 = data.object_id;
              const _errs5 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate310.errors = [{ instancePath: instancePath + "/object_id", schemaPath: "#/properties/object_id/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs5) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (data2 < 0 || isNaN(data2)) {
                    validate310.errors = [{ instancePath: instancePath + "/object_id", schemaPath: "#/properties/object_id/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.value !== void 0) {
                let data3 = data.value;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (!(typeof data3 == "number" && isFinite(data3))) {
                    validate310.errors = [{ instancePath: instancePath + "/value", schemaPath: "#/properties/value/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                    return false;
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.width !== void 0) {
                  let data4 = data.width;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (!(typeof data4 == "number" && isFinite(data4))) {
                      validate310.errors = [{ instancePath: instancePath + "/width", schemaPath: "#/properties/width/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.x !== void 0) {
                    let data5 = data.x;
                    const _errs11 = errors;
                    if (errors === _errs11) {
                      if (!(typeof data5 == "number" && isFinite(data5))) {
                        validate310.errors = [{ instancePath: instancePath + "/x", schemaPath: "#/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                        return false;
                      }
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.y !== void 0) {
                      let data6 = data.y;
                      const _errs13 = errors;
                      if (errors === _errs13) {
                        if (!(typeof data6 == "number" && isFinite(data6))) {
                          validate310.errors = [{ instancePath: instancePath + "/y", schemaPath: "#/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                          return false;
                        }
                      }
                      var valid0 = _errs13 === errors;
                    } else {
                      var valid0 = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate310.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate310.errors = vErrors;
  return errors === 0;
}
validate310.evaluated = { "props": { "height": true, "label": true, "object_id": true, "value": true, "width": true, "x": true, "y": true }, "dynamicProps": false, "dynamicItems": false };
var schema143 = { "description": "How the runner resized the input image before inference.", "type": "string", "enum": ["none", "fit-shortest", "fit-longest", "squash"] };
function validate312(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate312.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate312.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  if (!(data === "none" || data === "fit-shortest" || data === "fit-longest" || data === "squash")) {
    validate312.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema143.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate312.errors = vErrors;
  return errors === 0;
}
validate312.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate314(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate314.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.originalWidth === void 0 && (missing0 = "originalWidth") || data.originalHeight === void 0 && (missing0 = "originalHeight") || data.newWidth === void 0 && (missing0 = "newWidth") || data.newHeight === void 0 && (missing0 = "newHeight")) {
        validate314.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.newHeight !== void 0) {
          let data0 = data.newHeight;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate314.errors = [{ instancePath: instancePath + "/newHeight", schemaPath: "#/properties/newHeight/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate314.errors = [{ instancePath: instancePath + "/newHeight", schemaPath: "#/properties/newHeight/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.newWidth !== void 0) {
            let data1 = data.newWidth;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate314.errors = [{ instancePath: instancePath + "/newWidth", schemaPath: "#/properties/newWidth/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs3) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 0 || isNaN(data1)) {
                  validate314.errors = [{ instancePath: instancePath + "/newWidth", schemaPath: "#/properties/newWidth/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.originalHeight !== void 0) {
              let data2 = data.originalHeight;
              const _errs5 = errors;
              if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                validate314.errors = [{ instancePath: instancePath + "/originalHeight", schemaPath: "#/properties/originalHeight/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs5) {
                if (typeof data2 == "number" && isFinite(data2)) {
                  if (data2 < 0 || isNaN(data2)) {
                    validate314.errors = [{ instancePath: instancePath + "/originalHeight", schemaPath: "#/properties/originalHeight/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.originalWidth !== void 0) {
                let data3 = data.originalWidth;
                const _errs7 = errors;
                if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                  validate314.errors = [{ instancePath: instancePath + "/originalWidth", schemaPath: "#/properties/originalWidth/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs7) {
                  if (typeof data3 == "number" && isFinite(data3)) {
                    if (data3 < 0 || isNaN(data3)) {
                      validate314.errors = [{ instancePath: instancePath + "/originalWidth", schemaPath: "#/properties/originalWidth/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate314.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate314.errors = vErrors;
  return errors === 0;
}
validate314.evaluated = { "props": { "newHeight": true, "newWidth": true, "originalHeight": true, "originalWidth": true }, "dynamicProps": false, "dynamicItems": false };
function validate307(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate307.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.anomaly !== void 0) {
        let data0 = data.anomaly;
        const _errs1 = errors;
        if (errors === _errs1) {
          if (!(typeof data0 == "number" && isFinite(data0))) {
            validate307.errors = [{ instancePath: instancePath + "/anomaly", schemaPath: "#/properties/anomaly/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
            return false;
          }
        }
        var valid0 = _errs1 === errors;
      } else {
        var valid0 = true;
      }
      if (valid0) {
        if (data.bounding_boxes !== void 0) {
          let data1 = data.bounding_boxes;
          const _errs3 = errors;
          if (errors === _errs3) {
            if (Array.isArray(data1)) {
              var valid1 = true;
              const len0 = data1.length;
              for (let i0 = 0; i0 < len0; i0++) {
                const _errs5 = errors;
                if (!validate308(data1[i0], { instancePath: instancePath + "/bounding_boxes/" + i0, parentData: data1, parentDataProperty: i0, rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate308.errors : vErrors.concat(validate308.errors);
                  errors = vErrors.length;
                }
                var valid1 = _errs5 === errors;
                if (!valid1) {
                  break;
                }
              }
            } else {
              validate307.errors = [{ instancePath: instancePath + "/bounding_boxes", schemaPath: "#/properties/bounding_boxes/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
              return false;
            }
          }
          var valid0 = _errs3 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.classification !== void 0) {
            let data3 = data.classification;
            const _errs6 = errors;
            if (errors === _errs6) {
              if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
                for (const key0 in data3) {
                  let data4 = data3[key0];
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (!(typeof data4 == "number" && isFinite(data4))) {
                      validate307.errors = [{ instancePath: instancePath + "/classification/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/classification/additionalProperties/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                  }
                  var valid2 = _errs9 === errors;
                  if (!valid2) {
                    break;
                  }
                }
              } else {
                validate307.errors = [{ instancePath: instancePath + "/classification", schemaPath: "#/properties/classification/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                return false;
              }
            }
            var valid0 = _errs6 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.freeform !== void 0) {
              let data5 = data.freeform;
              const _errs11 = errors;
              if (errors === _errs11) {
                if (Array.isArray(data5)) {
                  var valid3 = true;
                  const len1 = data5.length;
                  for (let i1 = 0; i1 < len1; i1++) {
                    let data6 = data5[i1];
                    const _errs13 = errors;
                    if (errors === _errs13) {
                      if (Array.isArray(data6)) {
                        var valid4 = true;
                        const len2 = data6.length;
                        for (let i2 = 0; i2 < len2; i2++) {
                          let data7 = data6[i2];
                          const _errs15 = errors;
                          if (errors === _errs15) {
                            if (!(typeof data7 == "number" && isFinite(data7))) {
                              validate307.errors = [{ instancePath: instancePath + "/freeform/" + i1 + "/" + i2, schemaPath: "#/properties/freeform/items/items/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                              return false;
                            }
                          }
                          var valid4 = _errs15 === errors;
                          if (!valid4) {
                            break;
                          }
                        }
                      } else {
                        validate307.errors = [{ instancePath: instancePath + "/freeform/" + i1, schemaPath: "#/properties/freeform/items/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                        return false;
                      }
                    }
                    var valid3 = _errs13 === errors;
                    if (!valid3) {
                      break;
                    }
                  }
                } else {
                  validate307.errors = [{ instancePath: instancePath + "/freeform", schemaPath: "#/properties/freeform/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs11 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.object_tracking !== void 0) {
                let data8 = data.object_tracking;
                const _errs17 = errors;
                if (errors === _errs17) {
                  if (Array.isArray(data8)) {
                    var valid5 = true;
                    const len3 = data8.length;
                    for (let i3 = 0; i3 < len3; i3++) {
                      const _errs19 = errors;
                      if (!validate310(data8[i3], { instancePath: instancePath + "/object_tracking/" + i3, parentData: data8, parentDataProperty: i3, rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate310.errors : vErrors.concat(validate310.errors);
                        errors = vErrors.length;
                      }
                      var valid5 = _errs19 === errors;
                      if (!valid5) {
                        break;
                      }
                    }
                  } else {
                    validate307.errors = [{ instancePath: instancePath + "/object_tracking", schemaPath: "#/properties/object_tracking/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                    return false;
                  }
                }
                var valid0 = _errs17 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.resizeMode !== void 0) {
                  const _errs20 = errors;
                  if (!validate312(data.resizeMode, { instancePath: instancePath + "/resizeMode", parentData: data, parentDataProperty: "resizeMode", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate312.errors : vErrors.concat(validate312.errors);
                    errors = vErrors.length;
                  }
                  var valid0 = _errs20 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.resized !== void 0) {
                    const _errs21 = errors;
                    if (!validate314(data.resized, { instancePath: instancePath + "/resized", parentData: data, parentDataProperty: "resized", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate314.errors : vErrors.concat(validate314.errors);
                      errors = vErrors.length;
                    }
                    var valid0 = _errs21 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.visual_anomaly_grid !== void 0) {
                      let data12 = data.visual_anomaly_grid;
                      const _errs22 = errors;
                      if (errors === _errs22) {
                        if (Array.isArray(data12)) {
                          var valid6 = true;
                          const len4 = data12.length;
                          for (let i4 = 0; i4 < len4; i4++) {
                            const _errs24 = errors;
                            if (!validate308(data12[i4], { instancePath: instancePath + "/visual_anomaly_grid/" + i4, parentData: data12, parentDataProperty: i4, rootData, dynamicAnchors })) {
                              vErrors = vErrors === null ? validate308.errors : vErrors.concat(validate308.errors);
                              errors = vErrors.length;
                            }
                            var valid6 = _errs24 === errors;
                            if (!valid6) {
                              break;
                            }
                          }
                        } else {
                          validate307.errors = [{ instancePath: instancePath + "/visual_anomaly_grid", schemaPath: "#/properties/visual_anomaly_grid/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                          return false;
                        }
                      }
                      var valid0 = _errs22 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.visual_anomaly_max !== void 0) {
                        let data14 = data.visual_anomaly_max;
                        const _errs25 = errors;
                        if (errors === _errs25) {
                          if (!(typeof data14 == "number" && isFinite(data14))) {
                            validate307.errors = [{ instancePath: instancePath + "/visual_anomaly_max", schemaPath: "#/properties/visual_anomaly_max/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                            return false;
                          }
                        }
                        var valid0 = _errs25 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.visual_anomaly_mean !== void 0) {
                          let data15 = data.visual_anomaly_mean;
                          const _errs27 = errors;
                          if (errors === _errs27) {
                            if (!(typeof data15 == "number" && isFinite(data15))) {
                              validate307.errors = [{ instancePath: instancePath + "/visual_anomaly_mean", schemaPath: "#/properties/visual_anomaly_mean/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                              return false;
                            }
                          }
                          var valid0 = _errs27 === errors;
                        } else {
                          var valid0 = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate307.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate307.errors = vErrors;
  return errors === 0;
}
validate307.evaluated = { "props": { "anomaly": true, "bounding_boxes": true, "classification": true, "freeform": true, "object_tracking": true, "resizeMode": true, "resized": true, "visual_anomaly_grid": true, "visual_anomaly_max": true, "visual_anomaly_mean": true }, "dynamicProps": false, "dynamicItems": false };
function validate318(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate318.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.dsp === void 0 && (missing0 = "dsp") || data.classification === void 0 && (missing0 = "classification") || data.anomaly === void 0 && (missing0 = "anomaly")) {
        validate318.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.anomaly !== void 0) {
          let data0 = data.anomaly;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (!(typeof data0 == "number" && isFinite(data0))) {
              validate318.errors = [{ instancePath: instancePath + "/anomaly", schemaPath: "#/properties/anomaly/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.classification !== void 0) {
            let data1 = data.classification;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (!(typeof data1 == "number" && isFinite(data1))) {
                validate318.errors = [{ instancePath: instancePath + "/classification", schemaPath: "#/properties/classification/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.dsp !== void 0) {
              let data2 = data.dsp;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (!(typeof data2 == "number" && isFinite(data2))) {
                  validate318.errors = [{ instancePath: instancePath + "/dsp", schemaPath: "#/properties/dsp/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.postprocessing !== void 0) {
                let data3 = data.postprocessing;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (!(typeof data3 == "number" && isFinite(data3))) {
                    validate318.errors = [{ instancePath: instancePath + "/postprocessing", schemaPath: "#/properties/postprocessing/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                    return false;
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate318.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate318.errors = vErrors;
  return errors === 0;
}
validate318.evaluated = { "props": { "anomaly": true, "classification": true, "dsp": true, "postprocessing": true }, "dynamicProps": false, "dynamicItems": false };
function validate306(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate306.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.modelId === void 0 && (missing0 = "modelId") || data.result === void 0 && (missing0 = "result") || data.timing === void 0 && (missing0 = "timing")) {
        validate306.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.info !== void 0) {
          const _errs1 = errors;
          if (typeof data.info !== "string") {
            validate306.errors = [{ instancePath: instancePath + "/info", schemaPath: "#/properties/info/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.modelId !== void 0) {
            const _errs3 = errors;
            if (typeof data.modelId !== "string") {
              validate306.errors = [{ instancePath: instancePath + "/modelId", schemaPath: "#/properties/modelId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.result !== void 0) {
              const _errs5 = errors;
              if (!validate307(data.result, { instancePath: instancePath + "/result", parentData: data, parentDataProperty: "result", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate307.errors : vErrors.concat(validate307.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.timing !== void 0) {
                const _errs6 = errors;
                if (!validate318(data.timing, { instancePath: instancePath + "/timing", parentData: data, parentDataProperty: "timing", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate318.errors : vErrors.concat(validate318.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate306.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate306.errors = vErrors;
  return errors === 0;
}
validate306.evaluated = { "props": { "info": true, "modelId": true, "result": true, "timing": true }, "dynamicProps": false, "dynamicItems": false };
function validate290(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate290.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate291(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate291.errors : vErrors.concat(validate291.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.failure === void 0 && (missing0 = "failure")) {
          validate290.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.failure !== void 0) {
            const _errs3 = errors;
            if (!validate304(data.failure, { instancePath: instancePath + "/failure", parentData: data, parentDataProperty: "failure", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate304.errors : vErrors.concat(validate304.errors);
              errors = vErrors.length;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.results !== void 0) {
              let data1 = data.results;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (Array.isArray(data1)) {
                  var valid2 = true;
                  const len0 = data1.length;
                  for (let i0 = 0; i0 < len0; i0++) {
                    const _errs6 = errors;
                    if (!validate306(data1[i0], { instancePath: instancePath + "/results/" + i0, parentData: data1, parentDataProperty: i0, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate306.errors : vErrors.concat(validate306.errors);
                      errors = vErrors.length;
                    }
                    var valid2 = _errs6 === errors;
                    if (!valid2) {
                      break;
                    }
                  }
                } else {
                  validate290.errors = [{ instancePath: instancePath + "/results", schemaPath: "#/allOf/1/properties/results/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid1 = _errs4 === errors;
            } else {
              var valid1 = true;
            }
          }
        }
      } else {
        validate290.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate290.errors = vErrors;
  return errors === 0;
}
validate290.evaluated = { "props": { "failure": true, "results": true, "captureTimestamp": true, "id": true, "inferenceTimestamp": true, "input": true }, "dynamicProps": false, "dynamicItems": false };
function validate322(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate322.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate291(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate291.errors : vErrors.concat(validate291.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.results === void 0 && (missing0 = "results")) {
          validate322.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.results !== void 0) {
            let data0 = data.results;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (Array.isArray(data0)) {
                if (data0.length < 1) {
                  validate322.errors = [{ instancePath: instancePath + "/results", schemaPath: "#/allOf/1/properties/results/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                  return false;
                } else {
                  var valid2 = true;
                  const len0 = data0.length;
                  for (let i0 = 0; i0 < len0; i0++) {
                    const _errs5 = errors;
                    if (!validate306(data0[i0], { instancePath: instancePath + "/results/" + i0, parentData: data0, parentDataProperty: i0, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate306.errors : vErrors.concat(validate306.errors);
                      errors = vErrors.length;
                    }
                    var valid2 = _errs5 === errors;
                    if (!valid2) {
                      break;
                    }
                  }
                }
              } else {
                validate322.errors = [{ instancePath: instancePath + "/results", schemaPath: "#/allOf/1/properties/results/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                return false;
              }
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.failure !== void 0) {
              var valid1 = false;
              validate322.errors = [{ instancePath: instancePath + "/failure", schemaPath: "#/allOf/1/properties/failure/false schema", keyword: "false schema", params: {}, message: "boolean schema is false" }];
              return false;
            } else {
              var valid1 = true;
            }
          }
        }
      } else {
        validate322.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate322.errors = vErrors;
  return errors === 0;
}
validate322.evaluated = { "props": { "results": true, "failure": true, "captureTimestamp": true, "id": true, "inferenceTimestamp": true, "input": true }, "dynamicProps": false, "dynamicItems": false };
function validate289(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate289.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate290(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate290.errors : vErrors.concat(validate290.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.failure = true;
    props0.results = true;
    props0.captureTimestamp = true;
    props0.id = true;
    props0.inferenceTimestamp = true;
    props0.input = true;
  }
  const _errs2 = errors;
  if (!validate322(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate322.errors : vErrors.concat(validate322.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.results = true;
        props0.failure = true;
        props0.captureTimestamp = true;
        props0.id = true;
        props0.inferenceTimestamp = true;
        props0.input = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate289.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate289.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate289.evaluated = { "dynamicProps": true, "dynamicItems": false };
function validate288(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate288.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.events === void 0 && (missing0 = "events")) {
        validate288.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.events !== void 0) {
          let data0 = data.events;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (Array.isArray(data0)) {
              if (data0.length < 1) {
                validate288.errors = [{ instancePath: instancePath + "/events", schemaPath: "#/properties/events/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                return false;
              } else {
                var valid1 = true;
                const len0 = data0.length;
                for (let i0 = 0; i0 < len0; i0++) {
                  const _errs3 = errors;
                  if (!validate289(data0[i0], { instancePath: instancePath + "/events/" + i0, parentData: data0, parentDataProperty: i0, rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate289.errors : vErrors.concat(validate289.errors);
                    errors = vErrors.length;
                  }
                  var valid1 = _errs3 === errors;
                  if (!valid1) {
                    break;
                  }
                }
              }
            } else {
              validate288.errors = [{ instancePath: instancePath + "/events", schemaPath: "#/properties/events/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
              return false;
            }
          }
        }
      }
    } else {
      validate288.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate288.errors = vErrors;
  return errors === 0;
}
validate288.evaluated = { "props": { "events": true }, "dynamicProps": false, "dynamicItems": false };
function validate328(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate328.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.accepted === void 0 && (missing0 = "accepted") || data.dropped === void 0 && (missing0 = "dropped")) {
        validate328.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.accepted !== void 0) {
          let data0 = data.accepted;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate328.errors = [{ instancePath: instancePath + "/accepted", schemaPath: "#/properties/accepted/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate328.errors = [{ instancePath: instancePath + "/accepted", schemaPath: "#/properties/accepted/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.dropped !== void 0) {
            let data1 = data.dropped;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate328.errors = [{ instancePath: instancePath + "/dropped", schemaPath: "#/properties/dropped/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs3) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 0 || isNaN(data1)) {
                  validate328.errors = [{ instancePath: instancePath + "/dropped", schemaPath: "#/properties/dropped/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate328.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate328.errors = vErrors;
  return errors === 0;
}
validate328.evaluated = { "props": { "accepted": true, "dropped": true }, "dynamicProps": false, "dynamicItems": false };
var schema149 = { "title": "ActivateBundleCommand", "description": "Activate a staged inference bundle. Needs the `activateBundle` capability. The workload reads manifest.json from the bundle directory and registers again with the models it now serves.", "allOf": [{ "$ref": "#/$defs/CommandCommon" }, { "type": "object", "properties": { "bundle": { "description": "The staged inference bundle to activate; its manifest.json describes the models.", "$ref": "#/$defs/InferenceBundle" }, "type": { "description": "Always `activateBundle`.", "type": "string", "enum": ["activateBundle"] } }, "required": ["type", "bundle"] }] };
function validate332(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate332.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id")) {
        validate332.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.id !== void 0) {
          if (typeof data.id !== "string") {
            validate332.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
        }
      }
    } else {
      validate332.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate332.errors = vErrors;
  return errors === 0;
}
validate332.evaluated = { "props": { "id": true }, "dynamicProps": false, "dynamicItems": false };
var schema151 = { "description": "An inference bundle staged by the agent: a directory with manifest.json and all the files it lists. Every model and workflow is activated as a whole bundle. Model entries live in the manifest, not in this command payload.", "type": "object", "properties": { "deploymentVersion": { "description": "The bundle's deployment version, as Studio names it.", "type": "integer", "format": "uint32", "minimum": 0 }, "digest": { "description": "The bundle's digest, when the agent verified it.", "type": "string" }, "kind": { "description": "A single-model bundle for the runner or a workflow bundle for the workflow runtime.", "type": "string", "enum": ["model", "workflow"] }, "path": { "description": "The staged directory containing manifest.json, as the workload sees it.", "type": "string" } }, "required": ["path", "deploymentVersion", "kind"] };
function validate334(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate334.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.path === void 0 && (missing0 = "path") || data.deploymentVersion === void 0 && (missing0 = "deploymentVersion") || data.kind === void 0 && (missing0 = "kind")) {
        validate334.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.deploymentVersion !== void 0) {
          let data0 = data.deploymentVersion;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate334.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate334.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.digest !== void 0) {
            const _errs3 = errors;
            if (typeof data.digest !== "string") {
              validate334.errors = [{ instancePath: instancePath + "/digest", schemaPath: "#/properties/digest/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.kind !== void 0) {
              let data2 = data.kind;
              const _errs5 = errors;
              if (typeof data2 !== "string") {
                validate334.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              if (!(data2 === "model" || data2 === "workflow")) {
                validate334.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/enum", keyword: "enum", params: { allowedValues: schema151.properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.path !== void 0) {
                const _errs7 = errors;
                if (typeof data.path !== "string") {
                  validate334.errors = [{ instancePath: instancePath + "/path", schemaPath: "#/properties/path/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate334.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate334.errors = vErrors;
  return errors === 0;
}
validate334.evaluated = { "props": { "deploymentVersion": true, "digest": true, "kind": true, "path": true }, "dynamicProps": false, "dynamicItems": false };
function validate331(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate331.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate332(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate332.errors : vErrors.concat(validate332.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.type === void 0 && (missing0 = "type") || data.bundle === void 0 && (missing0 = "bundle")) {
          validate331.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.bundle !== void 0) {
            const _errs3 = errors;
            if (!validate334(data.bundle, { instancePath: instancePath + "/bundle", parentData: data, parentDataProperty: "bundle", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate334.errors : vErrors.concat(validate334.errors);
              errors = vErrors.length;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.type !== void 0) {
              let data1 = data.type;
              const _errs4 = errors;
              if (typeof data1 !== "string") {
                validate331.errors = [{ instancePath: instancePath + "/type", schemaPath: "#/allOf/1/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              if (!(data1 === "activateBundle")) {
                validate331.errors = [{ instancePath: instancePath + "/type", schemaPath: "#/allOf/1/properties/type/enum", keyword: "enum", params: { allowedValues: schema149.allOf[1].properties.type.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid1 = _errs4 === errors;
            } else {
              var valid1 = true;
            }
          }
        }
      } else {
        validate331.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate331.errors = vErrors;
  return errors === 0;
}
validate331.evaluated = { "props": { "bundle": true, "type": true, "id": true }, "dynamicProps": false, "dynamicItems": false };
var schema152 = { "title": "UpdateInputPolicyCommand", "description": "Replace the input policy from the registration.", "allOf": [{ "$ref": "#/$defs/CommandCommon" }, { "type": "object", "properties": { "inputPolicy": { "description": "The new input policy.", "$ref": "#/$defs/InputPolicy" }, "type": { "description": "Always `updateInputPolicy`.", "type": "string", "enum": ["updateInputPolicy"] } }, "required": ["type", "inputPolicy"] }] };
function validate337(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate337.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate332(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate332.errors : vErrors.concat(validate332.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.type === void 0 && (missing0 = "type") || data.inputPolicy === void 0 && (missing0 = "inputPolicy")) {
          validate337.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.inputPolicy !== void 0) {
            const _errs3 = errors;
            if (!validate279(data.inputPolicy, { instancePath: instancePath + "/inputPolicy", parentData: data, parentDataProperty: "inputPolicy", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate279.errors : vErrors.concat(validate279.errors);
              errors = vErrors.length;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.type !== void 0) {
              let data1 = data.type;
              const _errs4 = errors;
              if (typeof data1 !== "string") {
                validate337.errors = [{ instancePath: instancePath + "/type", schemaPath: "#/allOf/1/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              if (!(data1 === "updateInputPolicy")) {
                validate337.errors = [{ instancePath: instancePath + "/type", schemaPath: "#/allOf/1/properties/type/enum", keyword: "enum", params: { allowedValues: schema152.allOf[1].properties.type.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid1 = _errs4 === errors;
            } else {
              var valid1 = true;
            }
          }
        }
      } else {
        validate337.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate337.errors = vErrors;
  return errors === 0;
}
validate337.evaluated = { "props": { "inputPolicy": true, "type": true, "id": true }, "dynamicProps": false, "dynamicItems": false };
var schema153 = { "title": "CaptureCommand", "description": "Take one sample from a sensor. Needs the `capture` capability.", "allOf": [{ "$ref": "#/$defs/CommandCommon" }, { "type": "object", "properties": { "capture": { "description": "What to capture.", "$ref": "#/$defs/CaptureRequest" }, "type": { "description": "Always `capture`.", "type": "string", "enum": ["capture"] } }, "required": ["type", "capture"] }] };
function validate343(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate343.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.sensor === void 0 && (missing0 = "sensor")) {
        validate343.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.lengthMs !== void 0) {
          let data0 = data.lengthMs;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate343.errors = [{ instancePath: instancePath + "/lengthMs", schemaPath: "#/properties/lengthMs/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate343.errors = [{ instancePath: instancePath + "/lengthMs", schemaPath: "#/properties/lengthMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.sensor !== void 0) {
            const _errs3 = errors;
            if (typeof data.sensor !== "string") {
              validate343.errors = [{ instancePath: instancePath + "/sensor", schemaPath: "#/properties/sensor/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate343.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate343.errors = vErrors;
  return errors === 0;
}
validate343.evaluated = { "props": { "lengthMs": true, "sensor": true }, "dynamicProps": false, "dynamicItems": false };
function validate341(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate341.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate332(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate332.errors : vErrors.concat(validate332.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.type === void 0 && (missing0 = "type") || data.capture === void 0 && (missing0 = "capture")) {
          validate341.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.capture !== void 0) {
            const _errs3 = errors;
            if (!validate343(data.capture, { instancePath: instancePath + "/capture", parentData: data, parentDataProperty: "capture", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate343.errors : vErrors.concat(validate343.errors);
              errors = vErrors.length;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.type !== void 0) {
              let data1 = data.type;
              const _errs4 = errors;
              if (typeof data1 !== "string") {
                validate341.errors = [{ instancePath: instancePath + "/type", schemaPath: "#/allOf/1/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              if (!(data1 === "capture")) {
                validate341.errors = [{ instancePath: instancePath + "/type", schemaPath: "#/allOf/1/properties/type/enum", keyword: "enum", params: { allowedValues: schema153.allOf[1].properties.type.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid1 = _errs4 === errors;
            } else {
              var valid1 = true;
            }
          }
        }
      } else {
        validate341.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate341.errors = vErrors;
  return errors === 0;
}
validate341.evaluated = { "props": { "capture": true, "type": true, "id": true }, "dynamicProps": false, "dynamicItems": false };
function validate330(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate330.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate331(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate331.errors : vErrors.concat(validate331.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.bundle = true;
    props0.type = true;
    props0.id = true;
  }
  const _errs2 = errors;
  if (!validate337(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate337.errors : vErrors.concat(validate337.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.inputPolicy = true;
        props0.type = true;
        props0.id = true;
      }
    }
    const _errs3 = errors;
    if (!validate341(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate341.errors : vErrors.concat(validate341.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.capture = true;
          props0.type = true;
          props0.id = true;
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate330.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate330.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate330.evaluated = { "dynamicProps": true, "dynamicItems": false };
var schema156 = { "title": "CommandFailure", "description": "The command failed.", "type": "object", "properties": { "commandId": { "description": "The command's ID.", "type": "string" }, "reason": { "description": "Why the command failed.", "type": "string" }, "success": { "description": "Always `false`.", "type": "boolean", "enum": [false] }, "type": { "description": "The command's type.", "$ref": "#/$defs/CommandType" } }, "required": ["commandId", "type", "success", "reason"] };
var schema157 = { "description": "The type of a command, as the result names it.", "type": "string", "enum": ["activateBundle", "updateInputPolicy", "capture"] };
function validate349(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate349.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate349.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  if (!(data === "activateBundle" || data === "updateInputPolicy" || data === "capture")) {
    validate349.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema157.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate349.errors = vErrors;
  return errors === 0;
}
validate349.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate348(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate348.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.commandId === void 0 && (missing0 = "commandId") || data.type === void 0 && (missing0 = "type") || data.success === void 0 && (missing0 = "success") || data.reason === void 0 && (missing0 = "reason")) {
        validate348.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.commandId !== void 0) {
          const _errs1 = errors;
          if (typeof data.commandId !== "string") {
            validate348.errors = [{ instancePath: instancePath + "/commandId", schemaPath: "#/properties/commandId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.reason !== void 0) {
            const _errs3 = errors;
            if (typeof data.reason !== "string") {
              validate348.errors = [{ instancePath: instancePath + "/reason", schemaPath: "#/properties/reason/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.success !== void 0) {
              let data2 = data.success;
              const _errs5 = errors;
              if (typeof data2 !== "boolean") {
                validate348.errors = [{ instancePath: instancePath + "/success", schemaPath: "#/properties/success/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                return false;
              }
              if (!(data2 === false)) {
                validate348.errors = [{ instancePath: instancePath + "/success", schemaPath: "#/properties/success/enum", keyword: "enum", params: { allowedValues: schema156.properties.success.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.type !== void 0) {
                const _errs7 = errors;
                if (!validate349(data.type, { instancePath: instancePath + "/type", parentData: data, parentDataProperty: "type", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate349.errors : vErrors.concat(validate349.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate348.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate348.errors = vErrors;
  return errors === 0;
}
validate348.evaluated = { "props": { "commandId": true, "reason": true, "success": true, "type": true }, "dynamicProps": false, "dynamicItems": false };
var schema158 = { "title": "CaptureResult", "description": "A `capture` command succeeded, with its sample.", "type": "object", "properties": { "capture": { "description": "The sample.", "$ref": "#/$defs/CaptureSample" }, "commandId": { "description": "The command's ID.", "type": "string" }, "success": { "description": "Always `true`.", "type": "boolean", "enum": [true] }, "type": { "description": "Always `capture`.", "$ref": "#/$defs/CaptureResultType" } }, "required": ["commandId", "type", "success", "capture"] };
function validate355(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate355.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.capturedAt === void 0 && (missing0 = "capturedAt") || data.sensor === void 0 && (missing0 = "sensor")) {
        validate355.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.capturedAt !== void 0) {
          let data0 = data.capturedAt;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate355.errors = [{ instancePath: instancePath + "/capturedAt", schemaPath: "#/properties/capturedAt/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.durationMs !== void 0) {
            let data1 = data.durationMs;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate355.errors = [{ instancePath: instancePath + "/durationMs", schemaPath: "#/properties/durationMs/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs3) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 0 || isNaN(data1)) {
                  validate355.errors = [{ instancePath: instancePath + "/durationMs", schemaPath: "#/properties/durationMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.extra !== void 0) {
              let data2 = data.extra;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                  for (const key0 in data2) {
                    const _errs8 = errors;
                    if (typeof data2[key0] !== "string") {
                      validate355.errors = [{ instancePath: instancePath + "/extra/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/extra/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    var valid1 = _errs8 === errors;
                    if (!valid1) {
                      break;
                    }
                  }
                } else {
                  validate355.errors = [{ instancePath: instancePath + "/extra", schemaPath: "#/properties/extra/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.height !== void 0) {
                let data4 = data.height;
                const _errs10 = errors;
                if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
                  validate355.errors = [{ instancePath: instancePath + "/height", schemaPath: "#/properties/height/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs10) {
                  if (typeof data4 == "number" && isFinite(data4)) {
                    if (data4 < 0 || isNaN(data4)) {
                      validate355.errors = [{ instancePath: instancePath + "/height", schemaPath: "#/properties/height/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs10 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.sampleRateHz !== void 0) {
                  let data5 = data.sampleRateHz;
                  const _errs12 = errors;
                  if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5)) && isFinite(data5))) {
                    validate355.errors = [{ instancePath: instancePath + "/sampleRateHz", schemaPath: "#/properties/sampleRateHz/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                    return false;
                  }
                  if (errors === _errs12) {
                    if (typeof data5 == "number" && isFinite(data5)) {
                      if (data5 < 0 || isNaN(data5)) {
                        validate355.errors = [{ instancePath: instancePath + "/sampleRateHz", schemaPath: "#/properties/sampleRateHz/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                        return false;
                      }
                    }
                  }
                  var valid0 = _errs12 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.sensor !== void 0) {
                    const _errs14 = errors;
                    if (typeof data.sensor !== "string") {
                      validate355.errors = [{ instancePath: instancePath + "/sensor", schemaPath: "#/properties/sensor/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    var valid0 = _errs14 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.width !== void 0) {
                      let data7 = data.width;
                      const _errs16 = errors;
                      if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                        validate355.errors = [{ instancePath: instancePath + "/width", schemaPath: "#/properties/width/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                        return false;
                      }
                      if (errors === _errs16) {
                        if (typeof data7 == "number" && isFinite(data7)) {
                          if (data7 < 0 || isNaN(data7)) {
                            validate355.errors = [{ instancePath: instancePath + "/width", schemaPath: "#/properties/width/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                            return false;
                          }
                        }
                      }
                      var valid0 = _errs16 === errors;
                    } else {
                      var valid0 = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate355.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate355.errors = vErrors;
  return errors === 0;
}
validate355.evaluated = { "props": { "capturedAt": true, "durationMs": true, "extra": true, "height": true, "sampleRateHz": true, "sensor": true, "width": true }, "dynamicProps": false, "dynamicItems": false };
function validate353(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate353.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.input === void 0 && (missing0 = "input") || data.metadata === void 0 && (missing0 = "metadata")) {
        validate353.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.input !== void 0) {
          const _errs1 = errors;
          if (!validate292(data.input, { instancePath: instancePath + "/input", parentData: data, parentDataProperty: "input", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate292.errors : vErrors.concat(validate292.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.metadata !== void 0) {
            const _errs2 = errors;
            if (!validate355(data.metadata, { instancePath: instancePath + "/metadata", parentData: data, parentDataProperty: "metadata", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate355.errors : vErrors.concat(validate355.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate353.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate353.errors = vErrors;
  return errors === 0;
}
validate353.evaluated = { "props": { "input": true, "metadata": true }, "dynamicProps": false, "dynamicItems": false };
var schema161 = { "description": "The string `capture`.", "type": "string", "enum": ["capture"] };
function validate358(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate358.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate358.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  if (!(data === "capture")) {
    validate358.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema161.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate358.errors = vErrors;
  return errors === 0;
}
validate358.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate352(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate352.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.commandId === void 0 && (missing0 = "commandId") || data.type === void 0 && (missing0 = "type") || data.success === void 0 && (missing0 = "success") || data.capture === void 0 && (missing0 = "capture")) {
        validate352.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.capture !== void 0) {
          const _errs1 = errors;
          if (!validate353(data.capture, { instancePath: instancePath + "/capture", parentData: data, parentDataProperty: "capture", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate353.errors : vErrors.concat(validate353.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.commandId !== void 0) {
            const _errs2 = errors;
            if (typeof data.commandId !== "string") {
              validate352.errors = [{ instancePath: instancePath + "/commandId", schemaPath: "#/properties/commandId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.success !== void 0) {
              let data2 = data.success;
              const _errs4 = errors;
              if (typeof data2 !== "boolean") {
                validate352.errors = [{ instancePath: instancePath + "/success", schemaPath: "#/properties/success/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                return false;
              }
              if (!(data2 === true)) {
                validate352.errors = [{ instancePath: instancePath + "/success", schemaPath: "#/properties/success/enum", keyword: "enum", params: { allowedValues: schema158.properties.success.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.type !== void 0) {
                const _errs6 = errors;
                if (!validate358(data.type, { instancePath: instancePath + "/type", parentData: data, parentDataProperty: "type", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate358.errors : vErrors.concat(validate358.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate352.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate352.errors = vErrors;
  return errors === 0;
}
validate352.evaluated = { "props": { "capture": true, "commandId": true, "success": true, "type": true }, "dynamicProps": false, "dynamicItems": false };
var schema162 = { "title": "CommandSuccess", "description": "Any other command succeeded.", "type": "object", "properties": { "commandId": { "description": "The command's ID.", "type": "string" }, "success": { "description": "Always `true`.", "type": "boolean", "enum": [true] }, "type": { "description": "The command's type.", "$ref": "#/$defs/PlainCommandType" } }, "required": ["commandId", "type", "success"] };
var schema163 = { "description": "The type of a command whose success carries no payload.", "type": "string", "enum": ["activateBundle", "updateInputPolicy"] };
function validate362(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate362.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate362.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  if (!(data === "activateBundle" || data === "updateInputPolicy")) {
    validate362.errors = [{ instancePath, schemaPath: "#/enum", keyword: "enum", params: { allowedValues: schema163.enum }, message: "must be equal to one of the allowed values" }];
    return false;
  }
  validate362.errors = vErrors;
  return errors === 0;
}
validate362.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate361(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate361.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.commandId === void 0 && (missing0 = "commandId") || data.type === void 0 && (missing0 = "type") || data.success === void 0 && (missing0 = "success")) {
        validate361.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.commandId !== void 0) {
          const _errs1 = errors;
          if (typeof data.commandId !== "string") {
            validate361.errors = [{ instancePath: instancePath + "/commandId", schemaPath: "#/properties/commandId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.success !== void 0) {
            let data1 = data.success;
            const _errs3 = errors;
            if (typeof data1 !== "boolean") {
              validate361.errors = [{ instancePath: instancePath + "/success", schemaPath: "#/properties/success/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
              return false;
            }
            if (!(data1 === true)) {
              validate361.errors = [{ instancePath: instancePath + "/success", schemaPath: "#/properties/success/enum", keyword: "enum", params: { allowedValues: schema162.properties.success.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.type !== void 0) {
              const _errs5 = errors;
              if (!validate362(data.type, { instancePath: instancePath + "/type", parentData: data, parentDataProperty: "type", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate362.errors : vErrors.concat(validate362.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate361.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate361.errors = vErrors;
  return errors === 0;
}
validate361.evaluated = { "props": { "commandId": true, "success": true, "type": true }, "dynamicProps": false, "dynamicItems": false };
function validate347(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate347.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate348(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate348.errors : vErrors.concat(validate348.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.commandId = true;
    props0.reason = true;
    props0.success = true;
    props0.type = true;
  }
  const _errs2 = errors;
  if (!validate352(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate352.errors : vErrors.concat(validate352.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.capture = true;
        props0.commandId = true;
        props0.success = true;
        props0.type = true;
      }
    }
    const _errs3 = errors;
    if (!validate361(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate361.errors : vErrors.concat(validate361.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.commandId = true;
          props0.success = true;
          props0.type = true;
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate347.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate347.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate347.evaluated = { "dynamicProps": true, "dynamicItems": false };
var schema165 = { "description": "Why the agent refused a request.", "oneOf": [{ "description": "The body failed validation against this schema.", "type": "string", "enum": ["invalid_request"] }, { "description": "The workload has not registered on this socket.", "type": "string", "enum": ["not_registered"] }, { "description": "The workload exceeded its rate limit; the batch was dropped.", "type": "string", "enum": ["rate_limited"] }, { "description": "The command ID is not one the agent sent to this workload.", "type": "string", "enum": ["unknown_command"] }, { "description": "The contract version in the path is not served.", "type": "string", "enum": ["unsupported_version"] }, { "description": "The agent failed.", "type": "string", "enum": ["internal"] }] };
function validate367(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate367.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (typeof data !== "string") {
    const err0 = { instancePath, schemaPath: "#/oneOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  if (!(data === "invalid_request")) {
    const err1 = { instancePath, schemaPath: "#/oneOf/0/enum", keyword: "enum", params: { allowedValues: schema165.oneOf[0].enum }, message: "must be equal to one of the allowed values" };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs3 = errors;
  if (typeof data !== "string") {
    const err2 = { instancePath, schemaPath: "#/oneOf/1/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (!(data === "not_registered")) {
    const err3 = { instancePath, schemaPath: "#/oneOf/1/enum", keyword: "enum", params: { allowedValues: schema165.oneOf[1].enum }, message: "must be equal to one of the allowed values" };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  var _valid0 = _errs3 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
    }
    const _errs5 = errors;
    if (typeof data !== "string") {
      const err4 = { instancePath, schemaPath: "#/oneOf/2/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (!(data === "rate_limited")) {
      const err5 = { instancePath, schemaPath: "#/oneOf/2/enum", keyword: "enum", params: { allowedValues: schema165.oneOf[2].enum }, message: "must be equal to one of the allowed values" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    var _valid0 = _errs5 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
      }
      const _errs7 = errors;
      if (typeof data !== "string") {
        const err6 = { instancePath, schemaPath: "#/oneOf/3/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (!(data === "unknown_command")) {
        const err7 = { instancePath, schemaPath: "#/oneOf/3/enum", keyword: "enum", params: { allowedValues: schema165.oneOf[3].enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid0 = _errs7 === errors;
      if (_valid0 && valid0) {
        valid0 = false;
        passing0 = [passing0, 3];
      } else {
        if (_valid0) {
          valid0 = true;
          passing0 = 3;
        }
        const _errs9 = errors;
        if (typeof data !== "string") {
          const err8 = { instancePath, schemaPath: "#/oneOf/4/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (!(data === "unsupported_version")) {
          const err9 = { instancePath, schemaPath: "#/oneOf/4/enum", keyword: "enum", params: { allowedValues: schema165.oneOf[4].enum }, message: "must be equal to one of the allowed values" };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        var _valid0 = _errs9 === errors;
        if (_valid0 && valid0) {
          valid0 = false;
          passing0 = [passing0, 4];
        } else {
          if (_valid0) {
            valid0 = true;
            passing0 = 4;
          }
          const _errs11 = errors;
          if (typeof data !== "string") {
            const err10 = { instancePath, schemaPath: "#/oneOf/5/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
          if (!(data === "internal")) {
            const err11 = { instancePath, schemaPath: "#/oneOf/5/enum", keyword: "enum", params: { allowedValues: schema165.oneOf[5].enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
          var _valid0 = _errs11 === errors;
          if (_valid0 && valid0) {
            valid0 = false;
            passing0 = [passing0, 5];
          } else {
            if (_valid0) {
              valid0 = true;
              passing0 = 5;
            }
          }
        }
      }
    }
  }
  if (!valid0) {
    const err12 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
    validate367.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate367.errors = vErrors;
  return errors === 0;
}
validate367.evaluated = { "dynamicProps": false, "dynamicItems": false };
function validate366(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate366.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message")) {
        validate366.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.code !== void 0) {
          const _errs1 = errors;
          if (!validate367(data.code, { instancePath: instancePath + "/code", parentData: data, parentDataProperty: "code", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate367.errors : vErrors.concat(validate367.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.message !== void 0) {
            const _errs2 = errors;
            if (typeof data.message !== "string") {
              validate366.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate366.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate366.errors = vErrors;
  return errors === 0;
}
validate366.evaluated = { "props": { "code": true, "message": true }, "dynamicProps": false, "dynamicItems": false };
function validate249(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate249.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate250(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate250.errors : vErrors.concat(validate250.errors);
    errors = vErrors.length;
  } else {
    var props0 = validate250.evaluated.props;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs2 = errors;
  if (!validate278(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate278.errors : vErrors.concat(validate278.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.commandStreamTimeoutS = true;
        props0.inlineSizeLimitBytes = true;
        props0.inputPolicy = true;
        props0.spoolDirectory = true;
        props0.workloadId = true;
      }
    }
    const _errs3 = errors;
    if (!validate288(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate288.errors : vErrors.concat(validate288.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.events = true;
        }
      }
      const _errs4 = errors;
      if (!validate328(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate328.errors : vErrors.concat(validate328.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs4 === errors;
      if (_valid0 && valid0) {
        valid0 = false;
        passing0 = [passing0, 3];
      } else {
        if (_valid0) {
          valid0 = true;
          passing0 = 3;
          if (props0 !== true) {
            props0 = props0 || {};
            props0.accepted = true;
            props0.dropped = true;
          }
        }
        const _errs5 = errors;
        if (!validate330(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
          vErrors = vErrors === null ? validate330.errors : vErrors.concat(validate330.errors);
          errors = vErrors.length;
        } else {
          var props1 = validate330.evaluated.props;
        }
        var _valid0 = _errs5 === errors;
        if (_valid0 && valid0) {
          valid0 = false;
          passing0 = [passing0, 4];
        } else {
          if (_valid0) {
            valid0 = true;
            passing0 = 4;
            if (props0 !== true && props1 !== void 0) {
              if (props1 === true) {
                props0 = true;
              } else {
                props0 = props0 || {};
                Object.assign(props0, props1);
              }
            }
          }
          const _errs6 = errors;
          if (!validate347(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate347.errors : vErrors.concat(validate347.errors);
            errors = vErrors.length;
          } else {
            var props2 = validate347.evaluated.props;
          }
          var _valid0 = _errs6 === errors;
          if (_valid0 && valid0) {
            valid0 = false;
            passing0 = [passing0, 5];
          } else {
            if (_valid0) {
              valid0 = true;
              passing0 = 5;
              if (props0 !== true && props2 !== void 0) {
                if (props2 === true) {
                  props0 = true;
                } else {
                  props0 = props0 || {};
                  Object.assign(props0, props2);
                }
              }
            }
            const _errs7 = errors;
            if (!validate366(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate366.errors : vErrors.concat(validate366.errors);
              errors = vErrors.length;
            }
            var _valid0 = _errs7 === errors;
            if (_valid0 && valid0) {
              valid0 = false;
              passing0 = [passing0, 6];
            } else {
              if (_valid0) {
                valid0 = true;
                passing0 = 6;
                if (props0 !== true) {
                  props0 = props0 || {};
                  props0.code = true;
                  props0.message = true;
                }
              }
            }
          }
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate249.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate249.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate249.evaluated = { "dynamicProps": true, "dynamicItems": false };
exports.validateRegisterRequest = validate370;
function validate370(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate370.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate251(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate251.errors : vErrors.concat(validate251.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.mode = true;
    props0.artifact = true;
    props0.kind = true;
    props0.capabilities = true;
    props0.contractVersion = true;
    props0.models = true;
    props0.sensors = true;
    props0.version = true;
  }
  const _errs2 = errors;
  if (!validate269(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate269.errors : vErrors.concat(validate269.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.artifact = true;
        props0.kind = true;
        props0.capabilities = true;
        props0.contractVersion = true;
        props0.models = true;
        props0.sensors = true;
        props0.version = true;
      }
    }
    const _errs3 = errors;
    if (!validate273(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate273.errors : vErrors.concat(validate273.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.artifact = true;
          props0.kind = true;
          props0.capabilities = true;
          props0.contractVersion = true;
          props0.models = true;
          props0.sensors = true;
          props0.version = true;
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate370.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate370.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate370.evaluated = { "dynamicProps": true, "dynamicItems": false };
exports.validateRegisterResponse = validate374;
function validate374(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate374.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.workloadId === void 0 && (missing0 = "workloadId") || data.inputPolicy === void 0 && (missing0 = "inputPolicy") || data.inlineSizeLimitBytes === void 0 && (missing0 = "inlineSizeLimitBytes")) {
        validate374.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.commandStreamTimeoutS !== void 0) {
          let data0 = data.commandStreamTimeoutS;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate374.errors = [{ instancePath: instancePath + "/commandStreamTimeoutS", schemaPath: "#/properties/commandStreamTimeoutS/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate374.errors = [{ instancePath: instancePath + "/commandStreamTimeoutS", schemaPath: "#/properties/commandStreamTimeoutS/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.inlineSizeLimitBytes !== void 0) {
            let data1 = data.inlineSizeLimitBytes;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate374.errors = [{ instancePath: instancePath + "/inlineSizeLimitBytes", schemaPath: "#/properties/inlineSizeLimitBytes/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs3) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 0 || isNaN(data1)) {
                  validate374.errors = [{ instancePath: instancePath + "/inlineSizeLimitBytes", schemaPath: "#/properties/inlineSizeLimitBytes/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.inputPolicy !== void 0) {
              const _errs5 = errors;
              if (!validate279(data.inputPolicy, { instancePath: instancePath + "/inputPolicy", parentData: data, parentDataProperty: "inputPolicy", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate279.errors : vErrors.concat(validate279.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.spoolDirectory !== void 0) {
                const _errs6 = errors;
                if (typeof data.spoolDirectory !== "string") {
                  validate374.errors = [{ instancePath: instancePath + "/spoolDirectory", schemaPath: "#/properties/spoolDirectory/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.workloadId !== void 0) {
                  const _errs8 = errors;
                  if (typeof data.workloadId !== "string") {
                    validate374.errors = [{ instancePath: instancePath + "/workloadId", schemaPath: "#/properties/workloadId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate374.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate374.errors = vErrors;
  return errors === 0;
}
validate374.evaluated = { "props": { "commandStreamTimeoutS": true, "inlineSizeLimitBytes": true, "inputPolicy": true, "spoolDirectory": true, "workloadId": true }, "dynamicProps": false, "dynamicItems": false };
exports.validateEventBatch = validate376;
function validate376(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate376.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.events === void 0 && (missing0 = "events")) {
        validate376.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.events !== void 0) {
          let data0 = data.events;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (Array.isArray(data0)) {
              if (data0.length < 1) {
                validate376.errors = [{ instancePath: instancePath + "/events", schemaPath: "#/properties/events/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                return false;
              } else {
                var valid1 = true;
                const len0 = data0.length;
                for (let i0 = 0; i0 < len0; i0++) {
                  const _errs3 = errors;
                  if (!validate289(data0[i0], { instancePath: instancePath + "/events/" + i0, parentData: data0, parentDataProperty: i0, rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate289.errors : vErrors.concat(validate289.errors);
                    errors = vErrors.length;
                  }
                  var valid1 = _errs3 === errors;
                  if (!valid1) {
                    break;
                  }
                }
              }
            } else {
              validate376.errors = [{ instancePath: instancePath + "/events", schemaPath: "#/properties/events/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
              return false;
            }
          }
        }
      }
    } else {
      validate376.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate376.errors = vErrors;
  return errors === 0;
}
validate376.evaluated = { "props": { "events": true }, "dynamicProps": false, "dynamicItems": false };
exports.validateEventBatchResponse = validate378;
function validate378(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate378.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.accepted === void 0 && (missing0 = "accepted") || data.dropped === void 0 && (missing0 = "dropped")) {
        validate378.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.accepted !== void 0) {
          let data0 = data.accepted;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate378.errors = [{ instancePath: instancePath + "/accepted", schemaPath: "#/properties/accepted/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate378.errors = [{ instancePath: instancePath + "/accepted", schemaPath: "#/properties/accepted/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.dropped !== void 0) {
            let data1 = data.dropped;
            const _errs3 = errors;
            if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
              validate378.errors = [{ instancePath: instancePath + "/dropped", schemaPath: "#/properties/dropped/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs3) {
              if (typeof data1 == "number" && isFinite(data1)) {
                if (data1 < 0 || isNaN(data1)) {
                  validate378.errors = [{ instancePath: instancePath + "/dropped", schemaPath: "#/properties/dropped/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                }
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate378.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate378.errors = vErrors;
  return errors === 0;
}
validate378.evaluated = { "props": { "accepted": true, "dropped": true }, "dynamicProps": false, "dynamicItems": false };
exports.validateCommand = validate379;
function validate379(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate379.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate331(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate331.errors : vErrors.concat(validate331.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.bundle = true;
    props0.type = true;
    props0.id = true;
  }
  const _errs2 = errors;
  if (!validate337(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate337.errors : vErrors.concat(validate337.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.inputPolicy = true;
        props0.type = true;
        props0.id = true;
      }
    }
    const _errs3 = errors;
    if (!validate341(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate341.errors : vErrors.concat(validate341.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.capture = true;
          props0.type = true;
          props0.id = true;
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate379.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate379.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate379.evaluated = { "dynamicProps": true, "dynamicItems": false };
exports.validateCommandResult = validate383;
function validate383(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate383.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate348(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate348.errors : vErrors.concat(validate348.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.commandId = true;
    props0.reason = true;
    props0.success = true;
    props0.type = true;
  }
  const _errs2 = errors;
  if (!validate352(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate352.errors : vErrors.concat(validate352.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.capture = true;
        props0.commandId = true;
        props0.success = true;
        props0.type = true;
      }
    }
    const _errs3 = errors;
    if (!validate361(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate361.errors : vErrors.concat(validate361.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.commandId = true;
          props0.success = true;
          props0.type = true;
        }
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate383.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate383.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate383.evaluated = { "dynamicProps": true, "dynamicItems": false };
exports.validateInferenceBundleManifest = validate387;
var schema173 = { "title": "ModelBundleManifest", "description": "A model inference bundle: exactly one model, served by the inference runner. The `workflow` property is forbidden.", "allOf": [{ "$ref": "#/$defs/ManifestCommon" }, { "type": "object", "properties": { "kind": { "description": "Always `model`.", "type": "string", "enum": ["model"] }, "models": { "description": "Exactly one model for the inference runner.", "type": "array", "items": { "$ref": "#/$defs/BundleModel" }, "minItems": 1, "maxItems": 1 }, "runtime": { "description": "The inference runner and minimum version needed to serve this bundle.", "$ref": "#/$defs/InferenceRunnerRequirement" }, "workflow": false }, "required": ["kind", "runtime"] }] };
var schema174 = { "description": "Fields shared by model and workflow inference bundle manifests.", "type": "object", "properties": { "manifestVersion": { "description": "The major version of this manifest format. Readers must reject unsupported versions before activating the bundle. Independent of deploymentVersion and runtime.minVersion.", "type": "integer", "enum": [1] }, "models": { "description": "The models in the bundle, at least one. A model bundle narrows this to exactly one entry.", "type": "array", "items": { "$ref": "#/$defs/BundleModel" }, "minItems": 1 }, "target": { "description": "The Studio deployment target format, for example runner-linux-aarch64-qnn.", "type": "string", "minLength": 1 } }, "required": ["manifestVersion", "target", "models"] };
var schema175 = { "description": "One model in the inference bundle. Its bundle-local ID and Studio identity are also reported in workload registration.", "type": "object", "properties": { "deploymentVersion": { "description": "The Studio deployment version the model was built from.", "type": "integer", "format": "uint32", "minimum": 0 }, "engine": { "description": "The model's inference engine, for example tflite, tensorrt or qnn.", "type": "string", "minLength": 1 }, "id": { "description": "The bundle-local model ID, unique within the manifest and used by workflow references and registration.", "type": "string", "minLength": 1 }, "impulseId": { "description": "The impulse within the Studio project.", "type": "integer", "format": "uint32", "minimum": 0 }, "modelType": { "description": "What the model produces, using the same names as workload registration.", "type": "string", "enum": ["classification", "object_detection", "constrained_object_detection", "freeform"] }, "path": { "description": "The model file's path relative to the bundle directory.", "$ref": "#/$defs/BundleRelativePath" }, "projectId": { "description": "The Studio project the model was built in.", "type": "integer", "format": "uint32", "minimum": 0 }, "sha256": { "description": "The SHA-256 checksum of the model file, as 64 hexadecimal digits without a prefix.", "type": "string", "pattern": "^[0-9a-fA-F]{64}$" } }, "required": ["id", "path", "projectId", "impulseId", "deploymentVersion", "engine", "modelType", "sha256"] };
var pattern4 = new RegExp("^(?!.*(?:^|/)\\.{1,2}(?:/|$))[^/\\\\:\\u0000]+(?:/[^/\\\\:\\u0000]+)*$", "u");
function validate391(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate391.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (typeof data === "string") {
      if (!pattern4.test(data)) {
        validate391.errors = [{ instancePath, schemaPath: "#/pattern", keyword: "pattern", params: { pattern: "^(?!.*(?:^|/)\\.{1,2}(?:/|$))[^/\\\\:\\u0000]+(?:/[^/\\\\:\\u0000]+)*$" }, message: 'must match pattern "^(?!.*(?:^|/)\\.{1,2}(?:/|$))[^/\\\\:\\u0000]+(?:/[^/\\\\:\\u0000]+)*$"' }];
        return false;
      }
    } else {
      validate391.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
      return false;
    }
  }
  validate391.errors = vErrors;
  return errors === 0;
}
validate391.evaluated = { "dynamicProps": false, "dynamicItems": false };
var pattern5 = new RegExp("^[0-9a-fA-F]{64}$", "u");
function validate390(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate390.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.path === void 0 && (missing0 = "path") || data.projectId === void 0 && (missing0 = "projectId") || data.impulseId === void 0 && (missing0 = "impulseId") || data.deploymentVersion === void 0 && (missing0 = "deploymentVersion") || data.engine === void 0 && (missing0 = "engine") || data.modelType === void 0 && (missing0 = "modelType") || data.sha256 === void 0 && (missing0 = "sha256")) {
        validate390.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.deploymentVersion !== void 0) {
          let data0 = data.deploymentVersion;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate390.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (errors === _errs1) {
            if (typeof data0 == "number" && isFinite(data0)) {
              if (data0 < 0 || isNaN(data0)) {
                validate390.errors = [{ instancePath: instancePath + "/deploymentVersion", schemaPath: "#/properties/deploymentVersion/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                return false;
              }
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.engine !== void 0) {
            let data1 = data.engine;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (typeof data1 === "string") {
                if (func1(data1) < 1) {
                  validate390.errors = [{ instancePath: instancePath + "/engine", schemaPath: "#/properties/engine/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate390.errors = [{ instancePath: instancePath + "/engine", schemaPath: "#/properties/engine/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.id !== void 0) {
              let data2 = data.id;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (typeof data2 === "string") {
                  if (func1(data2) < 1) {
                    validate390.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate390.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.impulseId !== void 0) {
                let data3 = data.impulseId;
                const _errs7 = errors;
                if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                  validate390.errors = [{ instancePath: instancePath + "/impulseId", schemaPath: "#/properties/impulseId/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs7) {
                  if (typeof data3 == "number" && isFinite(data3)) {
                    if (data3 < 0 || isNaN(data3)) {
                      validate390.errors = [{ instancePath: instancePath + "/impulseId", schemaPath: "#/properties/impulseId/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.modelType !== void 0) {
                  let data4 = data.modelType;
                  const _errs9 = errors;
                  if (typeof data4 !== "string") {
                    validate390.errors = [{ instancePath: instancePath + "/modelType", schemaPath: "#/properties/modelType/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  if (!(data4 === "classification" || data4 === "object_detection" || data4 === "constrained_object_detection" || data4 === "freeform")) {
                    validate390.errors = [{ instancePath: instancePath + "/modelType", schemaPath: "#/properties/modelType/enum", keyword: "enum", params: { allowedValues: schema175.properties.modelType.enum }, message: "must be equal to one of the allowed values" }];
                    return false;
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.path !== void 0) {
                    const _errs11 = errors;
                    if (!validate391(data.path, { instancePath: instancePath + "/path", parentData: data, parentDataProperty: "path", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate391.errors : vErrors.concat(validate391.errors);
                      errors = vErrors.length;
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.projectId !== void 0) {
                      let data6 = data.projectId;
                      const _errs12 = errors;
                      if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
                        validate390.errors = [{ instancePath: instancePath + "/projectId", schemaPath: "#/properties/projectId/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                        return false;
                      }
                      if (errors === _errs12) {
                        if (typeof data6 == "number" && isFinite(data6)) {
                          if (data6 < 0 || isNaN(data6)) {
                            validate390.errors = [{ instancePath: instancePath + "/projectId", schemaPath: "#/properties/projectId/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                            return false;
                          }
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.sha256 !== void 0) {
                        let data7 = data.sha256;
                        const _errs14 = errors;
                        if (errors === _errs14) {
                          if (typeof data7 === "string") {
                            if (!pattern5.test(data7)) {
                              validate390.errors = [{ instancePath: instancePath + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[0-9a-fA-F]{64}$" }, message: 'must match pattern "^[0-9a-fA-F]{64}$"' }];
                              return false;
                            }
                          } else {
                            validate390.errors = [{ instancePath: instancePath + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                        var valid0 = _errs14 === errors;
                      } else {
                        var valid0 = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate390.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate390.errors = vErrors;
  return errors === 0;
}
validate390.evaluated = { "props": { "deploymentVersion": true, "engine": true, "id": true, "impulseId": true, "modelType": true, "path": true, "projectId": true, "sha256": true }, "dynamicProps": false, "dynamicItems": false };
function validate389(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate389.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.manifestVersion === void 0 && (missing0 = "manifestVersion") || data.target === void 0 && (missing0 = "target") || data.models === void 0 && (missing0 = "models")) {
        validate389.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.manifestVersion !== void 0) {
          let data0 = data.manifestVersion;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
            validate389.errors = [{ instancePath: instancePath + "/manifestVersion", schemaPath: "#/properties/manifestVersion/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
            return false;
          }
          if (!(data0 === 1)) {
            validate389.errors = [{ instancePath: instancePath + "/manifestVersion", schemaPath: "#/properties/manifestVersion/enum", keyword: "enum", params: { allowedValues: schema174.properties.manifestVersion.enum }, message: "must be equal to one of the allowed values" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.models !== void 0) {
            let data1 = data.models;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (Array.isArray(data1)) {
                if (data1.length < 1) {
                  validate389.errors = [{ instancePath: instancePath + "/models", schemaPath: "#/properties/models/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                  return false;
                } else {
                  var valid1 = true;
                  const len0 = data1.length;
                  for (let i0 = 0; i0 < len0; i0++) {
                    const _errs5 = errors;
                    if (!validate390(data1[i0], { instancePath: instancePath + "/models/" + i0, parentData: data1, parentDataProperty: i0, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate390.errors : vErrors.concat(validate390.errors);
                      errors = vErrors.length;
                    }
                    var valid1 = _errs5 === errors;
                    if (!valid1) {
                      break;
                    }
                  }
                }
              } else {
                validate389.errors = [{ instancePath: instancePath + "/models", schemaPath: "#/properties/models/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.target !== void 0) {
              let data3 = data.target;
              const _errs6 = errors;
              if (errors === _errs6) {
                if (typeof data3 === "string") {
                  if (func1(data3) < 1) {
                    validate389.errors = [{ instancePath: instancePath + "/target", schemaPath: "#/properties/target/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate389.errors = [{ instancePath: instancePath + "/target", schemaPath: "#/properties/target/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs6 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate389.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate389.errors = vErrors;
  return errors === 0;
}
validate389.evaluated = { "props": { "manifestVersion": true, "models": true, "target": true }, "dynamicProps": false, "dynamicItems": false };
var schema177 = { "title": "InferenceRunnerRequirement", "description": "The inference runner version a single-model bundle requires.", "allOf": [{ "$ref": "#/$defs/RuntimeRequirementCommon" }, { "type": "object", "properties": { "kind": { "description": "Always `inference_runner`.", "type": "string", "enum": ["inference_runner"] } }, "required": ["kind"] }] };
var pattern6 = new RegExp("^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)(?:-(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$", "u");
function validate397(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate397.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.minVersion === void 0 && (missing0 = "minVersion")) {
        validate397.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.minVersion !== void 0) {
          let data0 = data.minVersion;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (!pattern6.test(data0)) {
                validate397.errors = [{ instancePath: instancePath + "/minVersion", schemaPath: "#/properties/minVersion/pattern", keyword: "pattern", params: { pattern: "^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)(?:-(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$" }, message: 'must match pattern "^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)(?:-(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$"' }];
                return false;
              }
            } else {
              validate397.errors = [{ instancePath: instancePath + "/minVersion", schemaPath: "#/properties/minVersion/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
        }
      }
    } else {
      validate397.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate397.errors = vErrors;
  return errors === 0;
}
validate397.evaluated = { "props": { "minVersion": true }, "dynamicProps": false, "dynamicItems": false };
function validate396(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate396.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate397(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate397.errors : vErrors.concat(validate397.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.kind === void 0 && (missing0 = "kind")) {
          validate396.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.kind !== void 0) {
            let data0 = data.kind;
            if (typeof data0 !== "string") {
              validate396.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if (!(data0 === "inference_runner")) {
              validate396.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/enum", keyword: "enum", params: { allowedValues: schema177.allOf[1].properties.kind.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
          }
        }
      } else {
        validate396.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate396.errors = vErrors;
  return errors === 0;
}
validate396.evaluated = { "props": { "kind": true, "minVersion": true }, "dynamicProps": false, "dynamicItems": false };
function validate388(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate388.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate389(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate389.errors : vErrors.concat(validate389.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.kind === void 0 && (missing0 = "kind") || data.runtime === void 0 && (missing0 = "runtime")) {
          validate388.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.kind !== void 0) {
            let data0 = data.kind;
            const _errs3 = errors;
            if (typeof data0 !== "string") {
              validate388.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if (!(data0 === "model")) {
              validate388.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/enum", keyword: "enum", params: { allowedValues: schema173.allOf[1].properties.kind.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.models !== void 0) {
              let data1 = data.models;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (Array.isArray(data1)) {
                  if (data1.length > 1) {
                    validate388.errors = [{ instancePath: instancePath + "/models", schemaPath: "#/allOf/1/properties/models/maxItems", keyword: "maxItems", params: { limit: 1 }, message: "must NOT have more than 1 items" }];
                    return false;
                  } else {
                    if (data1.length < 1) {
                      validate388.errors = [{ instancePath: instancePath + "/models", schemaPath: "#/allOf/1/properties/models/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                      return false;
                    } else {
                      var valid2 = true;
                      const len0 = data1.length;
                      for (let i0 = 0; i0 < len0; i0++) {
                        const _errs7 = errors;
                        if (!validate390(data1[i0], { instancePath: instancePath + "/models/" + i0, parentData: data1, parentDataProperty: i0, rootData, dynamicAnchors })) {
                          vErrors = vErrors === null ? validate390.errors : vErrors.concat(validate390.errors);
                          errors = vErrors.length;
                        }
                        var valid2 = _errs7 === errors;
                        if (!valid2) {
                          break;
                        }
                      }
                    }
                  }
                } else {
                  validate388.errors = [{ instancePath: instancePath + "/models", schemaPath: "#/allOf/1/properties/models/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid1 = _errs5 === errors;
            } else {
              var valid1 = true;
            }
            if (valid1) {
              if (data.runtime !== void 0) {
                const _errs8 = errors;
                if (!validate396(data.runtime, { instancePath: instancePath + "/runtime", parentData: data, parentDataProperty: "runtime", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate396.errors : vErrors.concat(validate396.errors);
                  errors = vErrors.length;
                }
                var valid1 = _errs8 === errors;
              } else {
                var valid1 = true;
              }
              if (valid1) {
                if (data.workflow !== void 0) {
                  var valid1 = false;
                  validate388.errors = [{ instancePath: instancePath + "/workflow", schemaPath: "#/allOf/1/properties/workflow/false schema", keyword: "false schema", params: {}, message: "boolean schema is false" }];
                  return false;
                } else {
                  var valid1 = true;
                }
              }
            }
          }
        }
      } else {
        validate388.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate388.errors = vErrors;
  return errors === 0;
}
validate388.evaluated = { "props": { "kind": true, "models": true, "runtime": true, "workflow": true, "manifestVersion": true, "target": true }, "dynamicProps": false, "dynamicItems": false };
var schema179 = { "title": "WorkflowBundleManifest", "description": "A workflow inference bundle: one or more models and a workflow, served by the workflow runtime.", "allOf": [{ "$ref": "#/$defs/ManifestCommon" }, { "type": "object", "properties": { "kind": { "description": "Always `workflow`.", "type": "string", "enum": ["workflow"] }, "runtime": { "description": "The workflow runtime and minimum version needed to serve this bundle.", "$ref": "#/$defs/WorkflowRuntimeRequirement" }, "workflow": { "description": "The workflow definition that refers to the bundle-local model IDs.", "$ref": "#/$defs/WorkflowDefinition" } }, "required": ["kind", "runtime", "workflow"] }] };
var schema180 = { "title": "WorkflowRuntimeRequirement", "description": "The workflow runtime version a workflow bundle requires.", "allOf": [{ "$ref": "#/$defs/RuntimeRequirementCommon" }, { "type": "object", "properties": { "kind": { "description": "Always `workflow_runtime`.", "type": "string", "enum": ["workflow_runtime"] } }, "required": ["kind"] }] };
function validate403(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate403.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate397(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate397.errors : vErrors.concat(validate397.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.kind === void 0 && (missing0 = "kind")) {
          validate403.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.kind !== void 0) {
            let data0 = data.kind;
            if (typeof data0 !== "string") {
              validate403.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if (!(data0 === "workflow_runtime")) {
              validate403.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/enum", keyword: "enum", params: { allowedValues: schema180.allOf[1].properties.kind.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
          }
        }
      } else {
        validate403.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate403.errors = vErrors;
  return errors === 0;
}
validate403.evaluated = { "props": { "kind": true, "minVersion": true }, "dynamicProps": false, "dynamicItems": false };
function validate406(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate406.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.path === void 0 && (missing0 = "path")) {
        validate406.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.path !== void 0) {
          if (!validate391(data.path, { instancePath: instancePath + "/path", parentData: data, parentDataProperty: "path", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate391.errors : vErrors.concat(validate391.errors);
            errors = vErrors.length;
          }
        }
      }
    } else {
      validate406.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate406.errors = vErrors;
  return errors === 0;
}
validate406.evaluated = { "props": { "path": true }, "dynamicProps": false, "dynamicItems": false };
function validate401(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate401.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate389(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate389.errors : vErrors.concat(validate389.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (errors === _errs1) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.kind === void 0 && (missing0 = "kind") || data.runtime === void 0 && (missing0 = "runtime") || data.workflow === void 0 && (missing0 = "workflow")) {
          validate401.errors = [{ instancePath, schemaPath: "#/allOf/1/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
          return false;
        } else {
          if (data.kind !== void 0) {
            let data0 = data.kind;
            const _errs3 = errors;
            if (typeof data0 !== "string") {
              validate401.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if (!(data0 === "workflow")) {
              validate401.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/allOf/1/properties/kind/enum", keyword: "enum", params: { allowedValues: schema179.allOf[1].properties.kind.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
            var valid1 = _errs3 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.runtime !== void 0) {
              const _errs5 = errors;
              if (!validate403(data.runtime, { instancePath: instancePath + "/runtime", parentData: data, parentDataProperty: "runtime", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate403.errors : vErrors.concat(validate403.errors);
                errors = vErrors.length;
              }
              var valid1 = _errs5 === errors;
            } else {
              var valid1 = true;
            }
            if (valid1) {
              if (data.workflow !== void 0) {
                const _errs6 = errors;
                if (!validate406(data.workflow, { instancePath: instancePath + "/workflow", parentData: data, parentDataProperty: "workflow", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate406.errors : vErrors.concat(validate406.errors);
                  errors = vErrors.length;
                }
                var valid1 = _errs6 === errors;
              } else {
                var valid1 = true;
              }
            }
          }
        }
      } else {
        validate401.errors = [{ instancePath, schemaPath: "#/allOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
        return false;
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate401.errors = vErrors;
  return errors === 0;
}
validate401.evaluated = { "props": { "kind": true, "runtime": true, "workflow": true, "manifestVersion": true, "models": true, "target": true }, "dynamicProps": false, "dynamicItems": false };
function validate387(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate387.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate388(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate388.errors : vErrors.concat(validate388.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.kind = true;
    props0.models = true;
    props0.runtime = true;
    props0.workflow = true;
    props0.manifestVersion = true;
    props0.target = true;
  }
  const _errs2 = errors;
  if (!validate401(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate401.errors : vErrors.concat(validate401.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.kind = true;
        props0.runtime = true;
        props0.workflow = true;
        props0.manifestVersion = true;
        props0.models = true;
        props0.target = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate387.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate387.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate387.evaluated = { "dynamicProps": true, "dynamicItems": false };
