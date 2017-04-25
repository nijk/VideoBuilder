'use strict';

import VideoBuilder from '../main.js';

import './demo.scss';

class Demo {
  constructor (win = window, { width = 320, height = 240, fps, quality = 0.9 }) {
    this.window = win;
    this.width = width;
    this.height = height;
    this.quality = quality;
    this.downloadName = 'video-builder-demo';
    this.demo = this.window.document.querySelector('.demo');
    this.canvas = this.window.document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.videoBuilder = new VideoBuilder(this.window, { width, height, fps, name: this.downloadName });
    this.animation = null;
    this.frames = [];
    this.isPlaying = false;
    this.isPaused = false;
    this.isRecording = false;
    this.currentDot = 0;

    this.controls = this.window.document.querySelector('.controls');
    this.allBtns = this.controls.querySelectorAll('button');
    this.playBtn = this.controls.querySelector('.play');
    this.pauseBtn = this.controls.querySelector('.pause');
    this.resetBtn = this.controls.querySelector('.reset');
    this.recordBtn = this.controls.querySelector('.record');

    this.playBtn.addEventListener('click', () => !this.isPlaying || this.isPaused ? this.startAnimation() : null);
    this.pauseBtn.addEventListener('click', () => this.isPlaying && !this.isRecording ? this.pauseAnimation() : null);
    this.resetBtn.addEventListener('click', () => !this.isRecording ? this.stopAnimation().cleanCanvas() : null);
    this.recordBtn.addEventListener('click', () => !this.isRecording ? this.startRecording() : null);
  }

  calculateGrid (opts) {
    const { width, height, cell } = opts;
    const cols = Math.floor((width + cell.marginX) / (cell.x + cell.marginX));
    const rows = Math.floor((height + cell.marginY) / (cell.y + cell.marginY));

    return { width, height, cell, cols, rows };
  }

  drawDot (i, grid) {
    const { cols, cell } = grid;
    const colsModulo = i % cols;

    let col, row;

     if(i <= cols) {
       col = i;
       row = 1;
     } else if (colsModulo === 0) {
       col = cols;
       row = i / cols;
     } else {
       col = colsModulo;
       row = Math.ceil(i / cols);
     }

    let centerX = (col * cell.x) + ((col - 1) * cell.marginX);
    let centerY = (row * cell.y) + ((row - 1) * cell.marginY);

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, (grid.cell.x / 2), 0, 2 * Math.PI, false);
    this.ctx.fillStyle = `rgb(255, 255, 150)`;
    this.ctx.fill();
  }

  startAnimation (captureFrame, done) {
    const grid = this.calculateGrid({
      width: this.canvas.width,
      height: this.canvas.height,
      cell: {
        x: 10,
        y: 10,
        marginX: 10,
        marginY: 10,
      }
    });
    const dots = grid.cols * grid.rows;

    if (!this.isRecording) {
      this.isPlaying = true;
      this.isPaused = false;

      this.setButtonState();
    }

    this.animation = setInterval(() => {
      this.currentDot += 1;

      if (this.currentDot > dots) {
        this.stopAnimation();

        if (done) {
          done();
        }
      } else {
        this.drawDot(this.currentDot, grid);

        if (captureFrame) {
          captureFrame();
        }
      }
    }, 1000 / 60);

    return this;
  }
  
  pauseAnimation () {
    clearInterval(this.animation);
    this.animation = null;
    this.isPlaying = false;
    this.isPaused = true;

    this.setButtonState();

    return this;
  }

  stopAnimation () {
    clearInterval(this.animation);
    this.animation = null;
    this.isPlaying = false;
    this.isPaused = false;

    this.setButtonState();

    return this;
  }
  
  startRecording () {
    if (this.isPlaying || this.isPaused) {
      clearInterval(this.animation);
    }

    this.demo.classList.add('demo--recording');
    this.isPlaying = false;
    this.isPaused = false;
    this.isRecording = true;

    this.setButtonState();

    this.startAnimation(
      () => {
        this.canvas.toBlob(blob => {
          this.frames.push(blob);
        }, 'image/jpeg', this.quality);
      },
      () => this.videoBuilder.generate(this.frames, this.captureRecording.bind(this))
    );
  }

  captureRecording (blob) {
    this.videoBuilder.download(blob, this.downloadName, '.avi');
    this.videoBuilder.reset();
    this.stopRecording();
  }

  stopRecording () {
    this.isRecording = false;
    this.demo.classList.remove('demo--recording');
    this.cleanCanvas();
  }

  setButtonState (reset) {
    if (reset) {
      this.playBtn.removeAttribute('disabled');
      this.pauseBtn.setAttribute('disabled', 'disabled');
      this.resetBtn.setAttribute('disabled', 'disabled');
      this.recordBtn.removeAttribute('disabled');
    }
    else if (this.isPlaying) {
      this.playBtn.setAttribute('disabled', 'disabled');
      this.pauseBtn.removeAttribute('disabled');
      this.resetBtn.removeAttribute('disabled');
    }
    else if (this.isPaused) {
      this.playBtn.removeAttribute('disabled');
      this.pauseBtn.setAttribute('disabled', 'disabled');
      this.resetBtn.removeAttribute('disabled');
    }
    else if (this.isRecording) {
      this.allBtns.forEach(elem => !elem.hasAttribute('disabled') ? elem.setAttribute('disabled', 'disabled') : null);
    }
  }

  cleanCanvas () {
    if (this.animation) {
      this.stopAnimation();
    }
    
    if (this.isRecording) {
      this.stopRecording();
    }

    this.currentDot = 0;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.setButtonState(true);

    return this;
  }
}

// Start animation
const demo = new Demo(window, { width: 480, height: 320, fps: 60, quality: 0.8 });
demo.cleanCanvas();
