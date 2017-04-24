(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _AVIBuilder = __webpack_require__(1);

var _AVIBuilder2 = _interopRequireDefault(_AVIBuilder);

var _BlobBuilder = __webpack_require__(2);

var _BlobBuilder2 = _interopRequireDefault(_BlobBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VideoBuilder = function () {
  function VideoBuilder() {
    var videoOpts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, VideoBuilder);

    var _videoOpts$fps = videoOpts.fps,
        fps = _videoOpts$fps === undefined ? 30 : _videoOpts$fps,
        _videoOpts$width = videoOpts.width,
        width = _videoOpts$width === undefined ? 0 : _videoOpts$width,
        _videoOpts$height = videoOpts.height,
        height = _videoOpts$height === undefined ? 0 : _videoOpts$height;


    var encodingOpts = {
      RateBase: undefined, // @fixme
      AVIF_HASINDEX: undefined };

    this.movieDesc = {
      fps: fps,
      w: width,
      h: height,
      videoStreamSize: 0,
      maxJPEGSize: 0
    };

    this.frameList = [];
    this.frameIndices = [];
    this.indexChunk = {};

    this.builder = new _AVIBuilder2.default(encodingOpts);
  }

  _createClass(VideoBuilder, [{
    key: 'generate',
    value: function generate(data, next) {
      var frameDu = Math.floor(this.builder.settings.RateBase / this.movieDesc.fps);

      console.debug('Generating AVI');

      this.avi = this.builder.createAVIStructure();
      this.headerLIST = this.builder.createHeaderLIST();
      this.moviLIST = this.builder.createMoviLIST();

      this.prepareData(data).addFrames().createStreamHeader(frameDu).createAVIHeader(frameDu).createAVIContainer().build(next);
    }
  }, {
    key: 'build',
    value: function build(next) {
      var blobBuilder = new _BlobBuilder2.default();

      this.builder.appendStructure(blobBuilder, this.avi);
      var blob = blobBuilder.getBlob('video/avi');

      return next(blob);
    }
  }, {
    key: 'prepareData',
    value: function prepareData(data) {
      var _this = this;

      this.frameList = data.map(function (frame) {
        /*const base64 = new Base64();
         const blobBuilder = new BlobBuilder();
         const dataStart = frame.indexOf(',') + 1;
          let arrayBuffer, Uint8ArrayBuffer, blob;
          let bytes = base64.decode(frame.substring(dataStart));
          if (bytes.length % 2) { // padding
         bytes.push(0)
         }
          arrayBuffer = new ArrayBuffer(bytes.length);
         Uint8ArrayBuffer = new Uint8Array(arrayBuffer);
          for (let i = 0; i < bytes.length; i++) {
         Uint8ArrayBuffer[i] = bytes[i];
         }
          blobBuilder.append(arrayBuffer);
         blob = blobBuilder.getBlob('image/jpeg');*/

        _this.movieDesc.videoStreamSize += frame.size;

        if (_this.movieDesc.maxJPEGSize < frame.size) {
          _this.movieDesc.maxJPEGSize = frame.size;
        }

        return frame;
      });

      return this;
    }
  }, {
    key: 'addFrames',
    value: function addFrames() {
      this.moviLIST.aStreams = []; // @fixme: could this move to the constructor?

      var IndexEntryOrder = ['chId', 'dwFlags', 'dwOffset', 'dwLength']; // @fixme: Is this a setting/constant?

      var streamSize = 0;
      var frameCount = this.frameList.length;
      var frOffset = 4; // 'movi' +0

      for (var i = 0; i < frameCount; i++) {
        var frsize = this.addVideoStreamData(this.moviLIST.aStreams, this.frameList[i]);
        this.frameIndices.push({
          chId: '00dc',
          dwFlags: this.builder.settings.AVIIF_KEYFRAME,
          dwOffset: frOffset,
          dwLength: frsize - 8,
          _order: IndexEntryOrder
        });

        frOffset += frsize;
        streamSize += frsize;
      }

      this.moviLIST.dwSize = streamSize + 4; // + 'movi'

      return this;
    }
  }, {
    key: 'addVideoStreamData',
    value: function addVideoStreamData(list, frameBuffer) {
      var stream = this.builder.createMoviStream();

      stream.dwSize = frameBuffer.size;
      stream.handler = function (bb) {
        return bb.append(frameBuffer);
      };
      list.push(stream);

      return stream.dwSize + 8;
    }
  }, {
    key: 'createStreamHeader',
    value: function createStreamHeader(frameDu) {
      var strh = this.builder.createStreamHeader();
      strh.wRight = this.movieDesc.w;
      strh.wBottom = this.movieDesc.h;
      strh.dwLength = this.frameList.length;
      strh.dwScale = frameDu;

      var bi = this.builder.createBitmapHeader();
      bi.dwWidth = this.movieDesc.w;
      bi.dwHeight = this.movieDesc.h;
      bi.dwSizeImage = 3 * bi.dwWidth * bi.dwHeight;

      var strf = this.builder.createStreamFormat();
      strf.dwSize = bi.dwSize;
      strf.sContent = bi;

      this.streamHeaderLIST = this.builder.createStreamHeaderLIST();
      this.streamHeaderLIST.dwSize = 4 + (strh.dwSize + 8) + (strf.dwSize + 8);
      this.streamHeaderLIST.aList = [strh, strf];

      return this;
    }
  }, {
    key: 'createAVIHeader',
    value: function createAVIHeader(frameDu) {
      var avih = this.builder.createAVIMainHeader();
      avih.dwMicroSecPerFrame = frameDu;
      avih.dwMaxBytesPerSec = this.movieDesc.maxJPEGSize * this.movieDesc.fps;
      avih.dwTotalFrames = this.frameList.length;
      avih.dwWidth = this.movieDesc.w;
      avih.dwHeight = this.movieDesc.h;
      avih.dwSuggestedBufferSize = 0;

      var hdrlSize = 4;
      hdrlSize += avih.dwSize + 8;
      hdrlSize += this.streamHeaderLIST.dwSize + 8;
      this.headerLIST.dwSize = hdrlSize;
      this.headerLIST.aData = [avih, this.streamHeaderLIST];

      this.indexChunk = {
        chFourCC: 'idx1',
        dwSize: this.frameIndices.length * 16,
        aData: this.frameIndices,
        _order: ['chFourCC', 'dwSize', 'aData']
      };

      return this;
    }
  }, {
    key: 'createAVIContainer',
    value: function createAVIContainer() {
      var aviSize = 0;
      aviSize += 8 + this.headerLIST.dwSize;
      aviSize += 8 + this.moviLIST.dwSize;
      aviSize += 8 + this.indexChunk.dwSize;

      this.avi.dwSize = aviSize + 4;
      this.avi.aData = [this.headerLIST, this.moviLIST, this.indexChunk];

      return this;
    }
  }]);

  return VideoBuilder;
}();

exports.default = VideoBuilder;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AVIBuilder = function () {
  function AVIBuilder(opts) {
    _classCallCheck(this, AVIBuilder);

    // @fixme: provide sensible defaults
    var _ref = opts || {},
        _ref$RateBase = _ref.RateBase,
        RateBase = _ref$RateBase === undefined ? 1000000 : _ref$RateBase,
        _ref$AVIF_HASINDEX = _ref.AVIF_HASINDEX,
        AVIF_HASINDEX = _ref$AVIF_HASINDEX === undefined ? 0x00000010 : _ref$AVIF_HASINDEX,
        _ref$AVIIF_KEYFRAME = _ref.AVIIF_KEYFRAME,
        AVIIF_KEYFRAME = _ref$AVIIF_KEYFRAME === undefined ? 0x00000010 : _ref$AVIIF_KEYFRAME;

    this.settings = { RateBase: RateBase, AVIF_HASINDEX: AVIF_HASINDEX, AVIIF_KEYFRAME: AVIIF_KEYFRAME };
  }

  _createClass(AVIBuilder, [{
    key: 'createAVIStructure',
    value: function createAVIStructure() {
      return {
        chRIFF: 'RIFF',
        chFourCC: 'AVI ',
        dwSize: 0,
        aData: null,
        _order: ['chRIFF', 'dwSize', 'chFourCC', 'aData']
      };
    }
  }, {
    key: 'createAVIMainHeader',
    value: function createAVIMainHeader() {
      return {
        chFourCC: 'avih',
        dwSize: 56,
        // -----
        dwMicroSecPerFrame: 66666,
        dwMaxBytesPerSec: 1000,
        dwPaddingGranularity: 0,
        dwFlags: this.settings.AVIF_HASINDEX,
        // +16

        dwTotalFrames: 1,
        dwInitialFrames: 0,
        dwStreams: 1,
        dwSuggestedBufferSize: 0,
        // +32

        dwWidth: 10,
        dwHeight: 20,
        dwReserved1: 0,
        dwReserved2: 0,
        dwReserved3: 0,
        dwReserved4: 0,
        // +56

        _order: ['chFourCC', 'dwSize', 'dwMicroSecPerFrame', 'dwMaxBytesPerSec', 'dwPaddingGranularity', 'dwFlags', 'dwTotalFrames', 'dwInitialFrames', 'dwStreams', 'dwSuggestedBufferSize', 'dwWidth', 'dwHeight', 'dwReserved1', 'dwReserved2', 'dwReserved3', 'dwReserved4']
      };
    }
  }, {
    key: 'createHeaderLIST',
    value: function createHeaderLIST() {
      return {
        chLIST: 'LIST',
        dwSize: 0,
        chFourCC: 'hdrl',
        aData: null,
        _order: ['chLIST', 'dwSize', 'chFourCC', 'aData']
      };
    }
  }, {
    key: 'createMoviLIST',
    value: function createMoviLIST() {
      return {
        chLIST: 'LIST',
        dwSize: 0,
        chFourCC: 'movi',
        aStreams: null,
        _order: ['chLIST', 'dwSize', 'chFourCC', 'aStreams']
      };
    }
  }, {
    key: 'createMoviStream',
    value: function createMoviStream() {
      return {
        chType: '00dc',
        dwSize: 0,
        handler: null,
        _order: ['chType', 'dwSize', 'handler']
      };
    }
  }, {
    key: 'createStreamHeaderLIST',
    value: function createStreamHeaderLIST() {
      return {
        chLIST: 'LIST',
        dwSize: 0,
        chFourCC: 'strl',
        aList: null,
        _order: ['chLIST', 'dwSize', 'chFourCC', 'aList']
      };
    }
  }, {
    key: 'createStreamFormat',
    value: function createStreamFormat() {
      return {
        chFourCC: 'strf',
        dwSize: 0,
        sContent: null,
        _order: ['chFourCC', 'dwSize', 'sContent']
      };
    }
  }, {
    key: 'createStreamHeader',
    value: function createStreamHeader() {
      return {
        chFourCC: 'strh',
        dwSize: 56,
        chTypeFourCC: 'vids',
        chHandlerFourCC: 'mjpg',
        // +16

        dwFlags: 0,
        wPriority: 0,
        wLanguage: 0,
        dwInitialFrames: 0,
        dwScale: 66666,

        // +32
        dwRate: this.settings.RateBase,
        dwStart: 0,
        dwLength: 0,
        dwSuggestedBufferSize: 0,
        // +48

        dwQuality: 10000,
        dwSampleSize: 0,
        wLeft: 0,
        wTop: 0,
        wRight: 0,
        wBottom: 0,
        // +64

        _order: ['chFourCC', 'dwSize', 'chTypeFourCC', 'chHandlerFourCC', 'dwFlags', 'wPriority', 'wLanguage', 'dwInitialFrames', 'dwScale', 'dwRate', 'dwStart', 'dwLength', 'dwSuggestedBufferSize', 'dwQuality', 'dwSampleSize', 'wLeft', 'wTop', 'wRight', 'wBottom']
      };
    }
  }, {
    key: 'createBitmapHeader',
    value: function createBitmapHeader() {
      return {
        dwSize: 40,
        dwWidth: 10,
        dwHeight: 20,
        wPlanes: 1,
        wBitcount: 24,
        chCompression: 'MJPG',
        dwSizeImage: 600,
        dwXPelsPerMeter: 0,
        dwYPelsPerMeter: 0,
        dwClrUsed: 0,
        dwClrImportant: 0,
        _order: ['dwSize', 'dwWidth', 'dwHeight', 'wPlanes', 'wBitcount', 'chCompression', 'dwSizeImage', 'dwXPelsPerMeter', 'dwYPelsPerMeter', 'dwClrUsed', 'dwClrImportant']
      };
    }
  }, {
    key: 'createMJPEG',
    value: function createMJPEG() {
      return {
        W_SOI: 0xffd8,
        aSegments: null,
        W_EOI: 0xffd9,
        _order: ['dwSOI', 'aSegments', 'dwEOI']
      };
    }
  }, {
    key: 'appendStructure',
    value: function appendStructure(bb, s) {
      if (!s._order) {
        throw 'Structured data must have \'_order\'';
      }

      var od = s._order;
      var len = od.length;

      for (var i = 0; i < len; i++) {
        var fieldName = od[i];
        var val = s[fieldName];
        var char = fieldName.charAt(0);

        switch (char) {
          case 'b':
            // BYTE
            var _abtempBYTE = new ArrayBuffer(1);
            var _u8tempBYTE = new Uint8Array(_abtempBYTE);
            _u8tempBYTE[0] = val;
            bb.append(_abtempBYTE);
            break;
          case 'c':
            // chars
            bb.append(val);
            break;
          case 'd':
            // DWORD
            var abtempDWORD = new ArrayBuffer(4);
            var u8tempDWORD = new Uint8Array(abtempDWORD);
            u8tempDWORD[0] = val & 0xff;
            u8tempDWORD[1] = val >> 8 & 0xff;
            u8tempDWORD[2] = val >> 16 & 0xff;
            u8tempDWORD[3] = val >> 24 & 0xff;
            bb.append(abtempDWORD);
            break;
          case 'w': // WORD
          case 'W':
            // WORD(BE)
            var abtempWORD = new ArrayBuffer(2);
            var u8tempWORD = new Uint8Array(abtempWORD);
            if (char === 'w') {
              u8tempWORD[0] = val & 0xff;
              u8tempWORD[1] = val >> 8 & 0xff;
            } else {
              u8tempWORD[0] = val >> 8 & 0xff;
              u8tempWORD[1] = val & 0xff;
            }
            bb.append(abtempWORD);
            break;
          case 'a':
            // Array of structured data
            var dlen = val.length;
            for (var j = 0; j < dlen; j++) {
              this.appendStructure(bb, val[j]);
            }
            break;
          case 'r':
            // Raw(ArrayBuffer)
            bb.append(val);
            break;
          case 's':
            // Structured data
            this.appendStructure(bb, val);
            break;
          case 'h':
            // Handler function
            val(bb);
            break;
          default:
            throw new TypeError('Unknown data type: ' + fieldName);
            break;
        }
      }
    }
  }]);

  return AVIBuilder;
}();

exports.default = AVIBuilder;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BlobBuilder = function () {
  function BlobBuilder() {
    _classCallCheck(this, BlobBuilder);

    this.parts = [];
  }

  _createClass(BlobBuilder, [{
    key: 'append',
    value: function append(part) {
      this.parts.push(part);
      this.blob = undefined; // Invalidate the blob
    }
  }, {
    key: 'getBlob',
    value: function getBlob(type) {
      if (!this.blob) {
        this.blob = new Blob(this.parts, { type: type });
      }

      return this.blob;
    }
  }]);

  return BlobBuilder;
}();

exports.default = BlobBuilder;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
});
//# sourceMappingURL=main.js.map