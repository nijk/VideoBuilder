'use strict';

export default class BlobBuilder {
  constructor () {
    this.parts = [];
  }

  append (part) {
    this.parts.push(part);
    this.blob = undefined; // Invalidate the blob
  }

  getBlob (type) {
    if (!this.blob) {
      this.blob = new Blob(this.parts, { type: type });
    }

    return this.blob;
  }
}
