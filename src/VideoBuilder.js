'use strict';
import AVIBuilder from './AVIBuilder';
import BlobBuilder from './BlobBuilder';

export default class VideoBuilder {
  constructor (videoOpts = {}) {
    const {
      fps = 30,
      width = 0,
      height = 0,
    } = videoOpts;

    const encodingOpts = {
      RateBase: undefined, // @fixme
      AVIF_HASINDEX: undefined, // @fixme
    };

    this.movieDesc = {
      fps,
      w: width,
      h: height,
      videoStreamSize: 0,
      maxJPEGSize: 0
    };

    this.frameList = [];
    this.frameIndices = [];
    this.indexChunk = {};

    this.builder = new AVIBuilder(encodingOpts);
  }

  generate (data, next) {
    const frameDu = Math.floor(this.builder.settings.RateBase / this.movieDesc.fps);

    console.debug('Generating AVI');

    this.avi = this.builder.createAVIStructure();
    this.headerLIST = this.builder.createHeaderLIST();
    this.moviLIST = this.builder.createMoviLIST();

    this.prepareData(data)
      .addFrames()
      .createStreamHeader(frameDu)
      .createAVIHeader(frameDu)
      .createAVIContainer()
      .build(next);
  }

  build (next) {
    const blobBuilder = new BlobBuilder();

    this.builder.appendStructure(blobBuilder, this.avi);
    const blob = blobBuilder.getBlob('video/avi');

    return next(blob);
  }

  prepareData (data) {
    this.frameList = data.map((frame) => {
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

      this.movieDesc.videoStreamSize += frame.size;

      if (this.movieDesc.maxJPEGSize < frame.size) {
        this.movieDesc.maxJPEGSize = frame.size;
      }

      return frame;
    });

    return this;
  }

  addFrames () {
    this.moviLIST.aStreams = []; // @fixme: could this move to the constructor?

    const IndexEntryOrder = ['chId', 'dwFlags', 'dwOffset', 'dwLength']; // @fixme: Is this a setting/constant?

    let streamSize = 0;
    let frameCount = this.frameList.length;
    let frOffset = 4; // 'movi' +0

    for (let i = 0; i < frameCount; i++) {
      let frsize = this.addVideoStreamData(this.moviLIST.aStreams, this.frameList[i]);
      this.frameIndices.push({
        chId: '00dc',
        dwFlags: this.builder.settings.AVIIF_KEYFRAME,
        dwOffset: frOffset,
        dwLength: frsize - 8,
        _order: IndexEntryOrder,
      });

      frOffset += frsize;
      streamSize += frsize;
    }

    this.moviLIST.dwSize = streamSize + 4; // + 'movi'

    return this;
  }

  addVideoStreamData (list, frameBuffer) {
    let stream = this.builder.createMoviStream();

    stream.dwSize = frameBuffer.size;
    stream.handler = (bb) => bb.append(frameBuffer);
    list.push(stream);

    return stream.dwSize + 8;
  }

  createStreamHeader (frameDu) {
    let strh = this.builder.createStreamHeader();
    strh.wRight = this.movieDesc.w;
    strh.wBottom = this.movieDesc.h;
    strh.dwLength = this.frameList.length;
    strh.dwScale = frameDu;

    let bi = this.builder.createBitmapHeader();
    bi.dwWidth = this.movieDesc.w;
    bi.dwHeight = this.movieDesc.h;
    bi.dwSizeImage = 3 * bi.dwWidth * bi.dwHeight;

    let strf = this.builder.createStreamFormat();
    strf.dwSize = bi.dwSize;
    strf.sContent = bi;

    this.streamHeaderLIST = this.builder.createStreamHeaderLIST();
    this.streamHeaderLIST.dwSize = 4 + (strh.dwSize + 8) + (strf.dwSize + 8);
    this.streamHeaderLIST.aList = [strh, strf];

    return this;
  }

  createAVIHeader (frameDu) {
    let avih = this.builder.createAVIMainHeader();
    avih.dwMicroSecPerFrame = frameDu;
    avih.dwMaxBytesPerSec = this.movieDesc.maxJPEGSize * this.movieDesc.fps;
    avih.dwTotalFrames = this.frameList.length;
    avih.dwWidth = this.movieDesc.w;
    avih.dwHeight = this.movieDesc.h;
    avih.dwSuggestedBufferSize = 0;

    let hdrlSize = 4;
    hdrlSize += avih.dwSize + 8;
    hdrlSize += this.streamHeaderLIST.dwSize + 8;
    this.headerLIST.dwSize = hdrlSize;
    this.headerLIST.aData = [avih, this.streamHeaderLIST];

    this.indexChunk = {
      chFourCC: 'idx1',
      dwSize: this.frameIndices.length * 16,
      aData: this.frameIndices,
      _order: ['chFourCC', 'dwSize', 'aData']
    }

    return this;
  }

  createAVIContainer () {
    let aviSize = 0;
    aviSize += 8 + this.headerLIST.dwSize;
    aviSize += 8 + this.moviLIST.dwSize;
    aviSize += 8 + this.indexChunk.dwSize;

    this.avi.dwSize = aviSize + 4;
    this.avi.aData = [this.headerLIST, this.moviLIST, this.indexChunk];

    return this;
  }
}
