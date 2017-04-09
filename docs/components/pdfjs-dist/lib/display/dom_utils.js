/* Copyright 2017 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var sharedUtil = require('../shared/util.js');
var assert = sharedUtil.assert;
var removeNullCharacters = sharedUtil.removeNullCharacters;
var warn = sharedUtil.warn;
var deprecated = sharedUtil.deprecated;
var createValidAbsoluteUrl = sharedUtil.createValidAbsoluteUrl;
var stringToBytes = sharedUtil.stringToBytes;
var CMapCompressionType = sharedUtil.CMapCompressionType;
var DEFAULT_LINK_REL = 'noopener noreferrer nofollow';
function DOMCanvasFactory() {}
DOMCanvasFactory.prototype = {
  create: function DOMCanvasFactory_create(width, height) {
    assert(width > 0 && height > 0, 'invalid canvas size');
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    return {
      canvas: canvas,
      context: context
    };
  },
  reset: function DOMCanvasFactory_reset(canvasAndContextPair, width, height) {
    assert(canvasAndContextPair.canvas, 'canvas is not specified');
    assert(width > 0 && height > 0, 'invalid canvas size');
    canvasAndContextPair.canvas.width = width;
    canvasAndContextPair.canvas.height = height;
  },
  destroy: function DOMCanvasFactory_destroy(canvasAndContextPair) {
    assert(canvasAndContextPair.canvas, 'canvas is not specified');
    canvasAndContextPair.canvas.width = 0;
    canvasAndContextPair.canvas.height = 0;
    canvasAndContextPair.canvas = null;
    canvasAndContextPair.context = null;
  }
};
var DOMCMapReaderFactory = function DOMCMapReaderFactoryClosure() {
  function DOMCMapReaderFactory(params) {
    this.baseUrl = params.baseUrl || null;
    this.isCompressed = params.isCompressed || false;
  }
  DOMCMapReaderFactory.prototype = {
    fetch: function (params) {
      var name = params.name;
      if (!name) {
        return Promise.reject(new Error('CMap name must be specified.'));
      }
      return new Promise(function (resolve, reject) {
        var url = this.baseUrl + name + (this.isCompressed ? '.bcmap' : '');
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        if (this.isCompressed) {
          request.responseType = 'arraybuffer';
        }
        request.onreadystatechange = function () {
          if (request.readyState !== XMLHttpRequest.DONE) {
            return;
          }
          if (request.status === 200 || request.status === 0) {
            var data;
            if (this.isCompressed && request.response) {
              data = new Uint8Array(request.response);
            } else if (!this.isCompressed && request.responseText) {
              data = stringToBytes(request.responseText);
            }
            if (data) {
              resolve({
                cMapData: data,
                compressionType: this.isCompressed ? CMapCompressionType.BINARY : CMapCompressionType.NONE
              });
              return;
            }
          }
          reject(new Error('Unable to load ' + (this.isCompressed ? 'binary ' : '') + 'CMap at: ' + url));
        }.bind(this);
        request.send(null);
      }.bind(this));
    }
  };
  return DOMCMapReaderFactory;
}();
var CustomStyle = function CustomStyleClosure() {
  var prefixes = ['ms', 'Moz', 'Webkit', 'O'];
  var _cache = Object.create(null);
  function CustomStyle() {}
  CustomStyle.getProp = function get(propName, element) {
    if (arguments.length === 1 && typeof _cache[propName] === 'string') {
      return _cache[propName];
    }
    element = element || document.documentElement;
    var style = element.style,
        prefixed,
        uPropName;
    if (typeof style[propName] === 'string') {
      return _cache[propName] = propName;
    }
    uPropName = propName.charAt(0).toUpperCase() + propName.slice(1);
    for (var i = 0, l = prefixes.length; i < l; i++) {
      prefixed = prefixes[i] + uPropName;
      if (typeof style[prefixed] === 'string') {
        return _cache[propName] = prefixed;
      }
    }
    return _cache[propName] = 'undefined';
  };
  CustomStyle.setProp = function set(propName, element, str) {
    var prop = this.getProp(propName);
    if (prop !== 'undefined') {
      element.style[prop] = str;
    }
  };
  return CustomStyle;
}();
var RenderingCancelledException = function RenderingCancelledException() {
  function RenderingCancelledException(msg, type) {
    this.message = msg;
    this.type = type;
  }
  RenderingCancelledException.prototype = new Error();
  RenderingCancelledException.prototype.name = 'RenderingCancelledException';
  RenderingCancelledException.constructor = RenderingCancelledException;
  return RenderingCancelledException;
}();
var hasCanvasTypedArrays;
hasCanvasTypedArrays = function hasCanvasTypedArrays() {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  var ctx = canvas.getContext('2d');
  var imageData = ctx.createImageData(1, 1);
  return typeof imageData.data.buffer !== 'undefined';
};
var LinkTarget = {
  NONE: 0,
  SELF: 1,
  BLANK: 2,
  PARENT: 3,
  TOP: 4
};
var LinkTargetStringMap = ['', '_self', '_blank', '_parent', '_top'];
function addLinkAttributes(link, params) {
  var url = params && params.url;
  link.href = link.title = url ? removeNullCharacters(url) : '';
  if (url) {
    var target = params.target;
    if (typeof target === 'undefined') {
      target = getDefaultSetting('externalLinkTarget');
    }
    link.target = LinkTargetStringMap[target];
    var rel = params.rel;
    if (typeof rel === 'undefined') {
      rel = getDefaultSetting('externalLinkRel');
    }
    link.rel = rel;
  }
}
function getFilenameFromUrl(url) {
  var anchor = url.indexOf('#');
  var query = url.indexOf('?');
  var end = Math.min(anchor > 0 ? anchor : url.length, query > 0 ? query : url.length);
  return url.substring(url.lastIndexOf('/', end) + 1, end);
}
function getDefaultSetting(id) {
  var globalSettings = sharedUtil.globalScope.PDFJS;
  switch (id) {
    case 'pdfBug':
      return globalSettings ? globalSettings.pdfBug : false;
    case 'disableAutoFetch':
      return globalSettings ? globalSettings.disableAutoFetch : false;
    case 'disableStream':
      return globalSettings ? globalSettings.disableStream : false;
    case 'disableRange':
      return globalSettings ? globalSettings.disableRange : false;
    case 'disableFontFace':
      return globalSettings ? globalSettings.disableFontFace : false;
    case 'disableCreateObjectURL':
      return globalSettings ? globalSettings.disableCreateObjectURL : false;
    case 'disableWebGL':
      return globalSettings ? globalSettings.disableWebGL : true;
    case 'cMapUrl':
      return globalSettings ? globalSettings.cMapUrl : null;
    case 'cMapPacked':
      return globalSettings ? globalSettings.cMapPacked : false;
    case 'postMessageTransfers':
      return globalSettings ? globalSettings.postMessageTransfers : true;
    case 'workerPort':
      return globalSettings ? globalSettings.workerPort : null;
    case 'workerSrc':
      return globalSettings ? globalSettings.workerSrc : null;
    case 'disableWorker':
      return globalSettings ? globalSettings.disableWorker : false;
    case 'maxImageSize':
      return globalSettings ? globalSettings.maxImageSize : -1;
    case 'imageResourcesPath':
      return globalSettings ? globalSettings.imageResourcesPath : '';
    case 'isEvalSupported':
      return globalSettings ? globalSettings.isEvalSupported : true;
    case 'externalLinkTarget':
      if (!globalSettings) {
        return LinkTarget.NONE;
      }
      switch (globalSettings.externalLinkTarget) {
        case LinkTarget.NONE:
        case LinkTarget.SELF:
        case LinkTarget.BLANK:
        case LinkTarget.PARENT:
        case LinkTarget.TOP:
          return globalSettings.externalLinkTarget;
      }
      warn('PDFJS.externalLinkTarget is invalid: ' + globalSettings.externalLinkTarget);
      globalSettings.externalLinkTarget = LinkTarget.NONE;
      return LinkTarget.NONE;
    case 'externalLinkRel':
      return globalSettings ? globalSettings.externalLinkRel : DEFAULT_LINK_REL;
    case 'enableStats':
      return !!(globalSettings && globalSettings.enableStats);
    case 'pdfjsNext':
      return !!(globalSettings && globalSettings.pdfjsNext);
    default:
      throw new Error('Unknown default setting: ' + id);
  }
}
function isExternalLinkTargetSet() {
  var externalLinkTarget = getDefaultSetting('externalLinkTarget');
  switch (externalLinkTarget) {
    case LinkTarget.NONE:
      return false;
    case LinkTarget.SELF:
    case LinkTarget.BLANK:
    case LinkTarget.PARENT:
    case LinkTarget.TOP:
      return true;
  }
}
function isValidUrl(url, allowRelative) {
  deprecated('isValidUrl(), please use createValidAbsoluteUrl() instead.');
  var baseUrl = allowRelative ? 'http://example.com' : null;
  return createValidAbsoluteUrl(url, baseUrl) !== null;
}
exports.CustomStyle = CustomStyle;
exports.addLinkAttributes = addLinkAttributes;
exports.isExternalLinkTargetSet = isExternalLinkTargetSet;
exports.isValidUrl = isValidUrl;
exports.getFilenameFromUrl = getFilenameFromUrl;
exports.LinkTarget = LinkTarget;
exports.RenderingCancelledException = RenderingCancelledException;
exports.hasCanvasTypedArrays = hasCanvasTypedArrays;
exports.getDefaultSetting = getDefaultSetting;
exports.DEFAULT_LINK_REL = DEFAULT_LINK_REL;
exports.DOMCanvasFactory = DOMCanvasFactory;
exports.DOMCMapReaderFactory = DOMCMapReaderFactory;