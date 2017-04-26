This plugin is based on http://ushiroad.com/mjpeg/

VideoBuilder enables you to save your canvas animation frames (image/jpeg) into a single avi file.

Instantiate the VideoBuilder with a config object.
```ecmascript 6
let videoBuilder = new VideoBuilder({
    width: 640,
    height: 360,
    fps: 30, // Optional
    name: 'download-filename' // Optional. The file extension '.avi' will be added automatically
});
```

Then capture frames from your canvas:

```ecmascript 6
let $canvas = window.document.querySelector('.canvas-selector');
let frames = []; // This will be used to store blob data from each frame of the canvas.

// Animation loop
  $canvas.toBlob(blob => frames.push(blob));
```

Generate the AVI, this will trigger a download in the browser:

```ecmascript 6
videoBuilder.generate(frames);
```

Alternatively, you can provide a callback to get the AVI blob:

```ecmascript 6
videoBuilder.generate(frames, (blob) => {
  // Do something else with the AVI blob
  
  // N.B. If you still want to download the AVI in the browser, then call
  videoBuilder.download(blob, 'download-filename', '.avi');
});
```
