'use strict'

export default class AVIBuilder {
  constructor (opts) {
    // @fixme: provide sensible defaults
    const {
      RateBase = 1000000,
      AVIF_HASINDEX = 0x00000010,
      AVIIF_KEYFRAME = 0x00000010,
    } = opts || {}

    this.settings = { RateBase, AVIF_HASINDEX, AVIIF_KEYFRAME };
  }

  createAVIStructure () {
    return {
      chRIFF: 'RIFF',
      chFourCC: 'AVI ',
      dwSize: 0,
      aData: null,
      _order: ['chRIFF', 'dwSize', 'chFourCC', 'aData'],
    }
  }

  createAVIMainHeader () {
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

      _order: [
        'chFourCC', 'dwSize',
        'dwMicroSecPerFrame', 'dwMaxBytesPerSec', 'dwPaddingGranularity', 'dwFlags',
        'dwTotalFrames', 'dwInitialFrames', 'dwStreams', 'dwSuggestedBufferSize',
        'dwWidth', 'dwHeight', 'dwReserved1', 'dwReserved2', 'dwReserved3', 'dwReserved4'
      ],
    }
  }

  createHeaderLIST () {
    return {
      chLIST: 'LIST',
      dwSize: 0,
      chFourCC: 'hdrl',
      aData: null,
      _order: ['chLIST', 'dwSize', 'chFourCC', 'aData'],
    }
  }

  createMoviLIST () {
    return {
      chLIST: 'LIST',
      dwSize: 0,
      chFourCC: 'movi',
      aStreams: null,
      _order: ['chLIST', 'dwSize', 'chFourCC', 'aStreams'],
    }
  }

  createMoviStream () {
    return {
      chType: '00dc',
      dwSize: 0,
      handler: null,
      _order: ['chType', 'dwSize', 'handler'],
    }
  }

  createStreamHeaderLIST () {
    return {
      chLIST: 'LIST',
      dwSize: 0,
      chFourCC: 'strl',
      aList: null,
      _order: ['chLIST', 'dwSize', 'chFourCC', 'aList'],
    }
  }

  createStreamFormat () {
    return {
      chFourCC: 'strf',
      dwSize: 0,
      sContent: null,
      _order: ['chFourCC', 'dwSize', 'sContent'],
    }
  }

  createStreamHeader () {
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

      _order: [
        'chFourCC', 'dwSize', 'chTypeFourCC', 'chHandlerFourCC',
        'dwFlags', 'wPriority', 'wLanguage', 'dwInitialFrames', 'dwScale',
        'dwRate', 'dwStart', 'dwLength', 'dwSuggestedBufferSize',
        'dwQuality', 'dwSampleSize', 'wLeft', 'wTop', 'wRight', 'wBottom'
      ],
    }
  }

  createBitmapHeader () {
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
      _order: [
        'dwSize', 'dwWidth', 'dwHeight', 'wPlanes', 'wBitcount', 'chCompression',
        'dwSizeImage', 'dwXPelsPerMeter', 'dwYPelsPerMeter', 'dwClrUsed', 'dwClrImportant'
      ]
    }
  }

  createMJPEG () {
    return {
      W_SOI: 0xffd8,
      aSegments: null,
      W_EOI: 0xffd9,
      _order: ['dwSOI', 'aSegments', 'dwEOI'],
    }
  }

  appendStructure (bb, s) {
    if (!s._order) {
      throw 'Structured data must have \'_order\''
    }

    let od = s._order
    let len = od.length

    for (let i = 0; i < len; i++) {
      let fieldName = od[i]
      let val = s[fieldName]
      let char = fieldName.charAt(0)

      switch (char) {
        case 'b': // BYTE
          let _abtempBYTE = new ArrayBuffer(1)
          let _u8tempBYTE = new Uint8Array(_abtempBYTE)
          _u8tempBYTE[0] = val
          bb.append(_abtempBYTE)
          break
        case 'c': // chars
          bb.append(val)
          break
        case 'd': // DWORD
          let abtempDWORD = new ArrayBuffer(4)
          let u8tempDWORD = new Uint8Array(abtempDWORD)
          u8tempDWORD[0] = val & 0xff
          u8tempDWORD[1] = (val >> 8) & 0xff
          u8tempDWORD[2] = (val >> 16) & 0xff
          u8tempDWORD[3] = (val >> 24) & 0xff
          bb.append(abtempDWORD)
          break
        case 'w': // WORD
        case 'W': // WORD(BE)
          let abtempWORD = new ArrayBuffer(2)
          let u8tempWORD = new Uint8Array(abtempWORD)
          if (char === 'w') {
            u8tempWORD[0] = val & 0xff
            u8tempWORD[1] = (val >> 8) & 0xff
          } else {
            u8tempWORD[0] = (val >> 8) & 0xff
            u8tempWORD[1] = val & 0xff
          }
          bb.append(abtempWORD)
          break
        case 'a': // Array of structured data
          let dlen = val.length
          for (let j = 0; j < dlen; j++) {
            this.appendStructure(bb, val[j])
          }
          break
        case 'r': // Raw(ArrayBuffer)
          bb.append(val)
          break
        case 's': // Structured data
          this.appendStructure(bb, val)
          break
        case 'h': // Handler function
          val(bb)
          break
        default:
          throw new TypeError(`Unknown data type: ${fieldName}`)
          break
      }
    }
  }
}
