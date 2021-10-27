import './App.css';
import React,{Component} from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { FaceDetection } from '@mediapipe/face_detection';
import drawingUtils from '@mediapipe/drawing_utils';
import * as tf from '@tensorflow/tfjs';

export default class App extends Component {
  constructor(){
    super();
   }
  
  render(){
    return (
      <div class="main-container">
        <video className="input_video"></video>
        <div className="canvas-container">
          <canvas className="output_canvas"></canvas>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <div className="message">
            Loading
          </div>
        </div>
      </div>
    );
  }

  async componentDidMount(){
    const videoElement = document.getElementsByClassName('input_video')[0];
    const canvasElement = document.getElementsByClassName('output_canvas')[0];
    const canvasCtx = canvasElement.getContext('2d');
    const colors = ['red', 'green', 'purple', 'yellow', 'blue', 'orange', 'black'];
    const classes = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'];
    const model = await tf.loadGraphModel('https://sarajida.simplydecode.com/model/model.json');

    const spinner = document.querySelector('.loading');
    spinner.ontransitionend = () => {
      spinner.style.display = 'none';
    };


    function preprocess_input(tensors) {
      const resize = tensors.resizeBilinear([197, 197])
      const p = tf.tensor3d([[[93.5940, 104.7624, 129.1863]]]);
      return resize.sub(p);
    }
  
    function detectEmotion(image) {
      const imageData = tf.browser.fromPixels(image);
      const preprocess = preprocess_input(imageData);
      const input = preprocess.reshape([1, 197, 197, 3]);
      const predictions = model.predict(input);
      const data = predictions.softmax().reshape([7]);
      return data.argMax().dataSync()[0];
    }

    function onResults(results) {
      // Hide the spinner.
      document.body.classList.add('loaded');

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(
          results.image, 0, 0, canvasElement.width, canvasElement.height);
      if (results.detections.length > 0) {
        const boundingBox = results.detections[0].boundingBox
        const x = (boundingBox.xCenter - (boundingBox.width / 2)) * results.image.width;
        const y = (boundingBox.yCenter - (boundingBox.height / 2)) * results.image.height;
        const width = boundingBox.width * results.image.width;
        const height = boundingBox.height * results.image.height;
        
        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = width;
        croppedCanvas.height = height;
        
        var cCtx = croppedCanvas.getContext("2d");
        cCtx.drawImage(results.image, x, y, width, height, 0, 0, croppedCanvas.width, croppedCanvas.height);
        const image = cCtx.getImageData(0, 0, croppedCanvas.height, croppedCanvas.width);
        const prediction = detectEmotion(image);

        drawingUtils.drawRectangle(
          canvasCtx, boundingBox,
          {color: colors[prediction], lineWidth: 4, fillColor: '#00000000'});
        const aspect = canvasElement.width / results.image.width;
        console.log(aspect);

        canvasCtx.font = '25px serif';
        canvasCtx.fillStyle = colors[prediction];
        const textPadding = 10;
        canvasCtx.fillText(classes[prediction], x * aspect + textPadding,
           (y + width) * aspect - textPadding, width * aspect);
      }
      canvasCtx.restore();
    }

    const faceDetection = new FaceDetection({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.3/${file}`;
    }});
    faceDetection.setOptions({
      modelSelection: 0,
      minDetectionConfidence: 0.5
    });
    faceDetection.onResults(onResults);

    const cameraWidth = 640;
    const cameraHeight = 480;
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        const aspect = cameraHeight / cameraWidth;
        let width, height;
        if (window.innerWidth > window.innerHeight) {
          height = window.innerHeight;
          width = height / aspect;
        } else {
          width = window.innerWidth;
          height = width * aspect;
        }
        canvasElement.width = width;
        canvasElement.height = height;
        await faceDetection.send({image: videoElement});
      }
    }, {
      width: cameraWidth,
      height: cameraHeight
    });
    camera.start();
  }
}