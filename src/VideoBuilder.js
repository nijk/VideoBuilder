'use strict';
import AVIBuilder from './AVIBuilder';
import BlobBuilder from './BlobBuilder';

export default class VideoBuilder {
  constructor (videoOpts = {}, win = window) {
    const {
      fps = 30,
      width = 0,
      height = 0,
      name = 'download',
    } = videoOpts;

    this.window = win;
    this.movieName = name;
    this.fps = fps;
    this.width = width;
    this.height = height;

    this.reset();
  }

  reset () {
    this.avi = null;
    this.headerLIST = null;
    this.moviLIST = null;
    this.frameList = [];
    this.frameIndices = [];
    this.indexChunk = {};

    this.movieDesc = {
      fps: this.fps,
      w: this.width,
      h: this.height,
      videoStreamSize: 0,
      maxJPEGSize: 0
    };

    this.builder = new AVIBuilder();
  }

  generate (data, next) {
    const frameDu = Math.floor(this.builder.settings.RateBase / this.movieDesc.fps);

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

    return next ? next(blob) : this.download(blob, this.movieName, '.avi');
  }

  download (blob, name = 'unnamed', ext = '') {
    ext = !ext.indexOf('.') ? ext.substr(1) : ext;
    const fileExt = ext ? `.${ext}` : '';
    const filename = `${name}${fileExt}`;

    if (this.window.navigator.msSaveOrOpenBlob) {
      this.window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      let downloadLink = this.window.document.createElement("a");
      downloadLink.href = this.window.URL.createObjectURL(blob);
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }

  prepareData (data = []) {
    this.frameList = data.map(frame => {
      this.movieDesc.videoStreamSize += frame.size;

      if (this.movieDesc.maxJPEGSize < frame.size) {
        this.movieDesc.maxJPEGSize = frame.size;
      }

      return frame;
    });

    return this;
  }

  addFrames () {
    this.moviLIST.aStreams = [];

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
