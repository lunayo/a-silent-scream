var EmotionRecognition = function () {
  this.init = async function () {
    this.model = await tf.loadGraphModel('http://localhost:3000/model/model.json');
    this.faceDetection = new FaceDetection({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.3/${file}`;
    }});
    this.faceDetection.setOptions({
      modelSelection: 0,
      minDetectionConfidence: 0.5
    });
  }

  this.init_camera = function(videoElement, cameraWidth, cameraHeight, callback) {
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.faceDetection.send({image: videoElement});
      }
    }, {
      width: cameraWidth,
      height: cameraHeight
    });
    this.faceDetection.onResults(function(results) {
      var result = {}
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
        const prediction = this.detect_emotion(image);
        result = {
          "prediction": prediction,
          "boundingBox": boundingBox
        }
      }

      callback(results.image, result);
    }.bind(this));
  }

  this.start_camera = function() {
    this.camera.start();
  }

  this.stop_camera = function() {
    this.camera.stop();
  }
 
  this.preprocess_input = function (tensors) {
    const resize = tensors.resizeBilinear([197, 197])
    const p = tf.tensor3d([[[93.5940, 104.7624, 129.1863]]]);
    return resize.sub(p);
  }

  this.detect_emotion = function (image) {
    const imageData = tf.browser.fromPixels(image);
    const preprocess = this.preprocess_input(imageData);
    const input = preprocess.reshape([1, 197, 197, 3]);
    const predictions = this.model.predict(input);
    const data = predictions.softmax().reshape([7]);
    return data.argMax().dataSync()[0];
  }
}

var LauncherSection = function (shared) {

  Section.call(this);

  var domElement,
      clouds, title, buttonEnter, buttonStart,
      buttonEnterImg, uiContainer, ffTitle,
      loading, textContainer;

  var delta, time, oldTime = start_time = new Date().getTime();

  var fade;
  var at, alpha = 1;

  domElement = document.createElement('div');
  domElement.style.background = '-moz-linear-gradient(top, #04142e 0%, #1d508f 35%, #5299d1 50%, #1d508f 100%)';
  domElement.style.background = '-webkit-linear-gradient(top, #04142e 0%, #1d508f 35%, #5299d1 50%, #1d508f 100%)';
  domElement.style.background = 'linear-gradient(top, #04142e 0%, #1d508f 35%, #5299d1 50%, #1d508f 100%)';
  domElement.style.textAlign = 'center';

  var isLoading = false;
  var loadedOnce = false;

  function setupTextContainer() {
    textContainer = document.createElement('div');
    textContainer.setAttribute("id", "text-container");
    textContainer.style.position = 'absolute';

    title = document.createElement('p');
    title.setAttribute("class", "fade-in-text");
    title.style.fontSize = "2em";
    title.style.marginTop = "0";
    titleSpan = document.createElement('span');
    titleSpan.textContent = "NEEDS";
    titleSpan.style.fontSize = "1.3em";
    titleSpan2 = document.createElement('span');
    titleSpan2.textContent = "REACTION";
    titleSpan2.style.fontSize = "1.3em";
    title.appendChild(document.createTextNode("This story "));
    title.appendChild(titleSpan);
    title.appendChild(document.createTextNode(" your "));
    title.appendChild(titleSpan2);
    textContainer.appendChild(title);

    text = document.createElement('p');
    text.setAttribute("class", "fade-in-text");
    text.style.animationDelay = "1.5s";
    textSpan = document.createElement('span');
    textSpan.textContent = "MINUTES";
    textSpan.style.fontSize = "1.3em";
    textSpan2 = document.createElement('span');
    textSpan2.textContent = "EXPERIENCE";
    textSpan2.style.fontSize = "1.3em";

    text.appendChild(document.createTextNode("Over the next few "));
    text.appendChild(textSpan);
    text.appendChild(document.createTextNode(" , you will "));
    text.appendChild(textSpan2);

    text2 = document.createElement('span');
    text2.setAttribute("class", "fade-in-text");
    text2.style.fontSize = "1.3em";
    text2.style.animationDelay = "3s";
    text2.textContent = "the loss of biodiversity events";
    text.appendChild(text2);

    textContainer.appendChild(text);

    text4 = document.createElement('p');
    text4.setAttribute("class", "fade-in-text");
    text4.style.animationDelay = "5s";
    text4Span = document.createElement('span');
    text4Span.textContent = "REACTION";
    text4Span.style.fontSize = "1.3em";
    text4.appendChild(document.createTextNode("You will learn how your "));
    text4.appendChild(text4Span);
    
    text42 = document.createElement('span');
    text42.setAttribute("class", "fade-in-text");
    text42.style.animationDelay = "7s";
    text42.style.fontSize = "1em";
    text4Span2 = document.createElement('span');
    text4Span2.textContent = "OUTCOME";
    text4Span2.style.fontSize = "1.3em";
    text42.appendChild(document.createTextNode("can positively influences the "));
    text42.appendChild(text4Span2);
    text42.appendChild(document.createTextNode(" of the story."));
    text4.appendChild(text42);
    textContainer.appendChild(text4);

    text5 = document.createElement('p');
    text5.setAttribute("class", "fade-in-text");
    text5.style.animationDelay = "9s";
    text5.style.fontSize = "1.8em";
    text5Span = document.createElement('span');
    text5Span.textContent = "REACTION";
    text5Span.style.fontSize = "1.3em";
    text5Span2 = document.createElement('span');
    text5Span2.textContent = "CAMERA";
    text5Span2.style.fontSize = "1.3em";
    text5.appendChild(document.createTextNode("Your "));
    text5.appendChild(text5Span);
    text5.appendChild(document.createTextNode(" will be captured by the "));
    text5.appendChild(text5Span2);
    text5.appendChild(document.createTextNode(","));

    text6 = document.createElement('span');
    text6.setAttribute("class", "fade-in-text");
    text6.style.fontSize = "1em";
    text6Span = document.createElement('span');
    text6Span.textContent = "ON";
    text6Span.style.fontSize = "1.3em";
    text6.appendChild(document.createTextNode("hence, it will work best when it is turned "));
    text6.appendChild(text6Span);
    text6.appendChild(document.createTextNode("."));
    text5.appendChild(text6);
    
    textContainer.appendChild(text5);

    return textContainer;
  }

  function startTextAnimation() {
    const elements = document.getElementsByClassName('fade-in-text');
    elements.forEach(element => {
      element.classList.remove('text-animation'); // reset animation
      void element.offsetWidth; // trigger reflow
      element.classList.add('text-animation'); // start animation
    });
  }

  // localStorage stuff

  this.load = function () {

    // Clouds

    clouds = new Clouds(shared);
    clouds.getDomElement().style.position = 'absolute';
    clouds.getDomElement().style.left = "0px";
    clouds.getDomElement().style.top = "0px";
    clouds.getDomElement().style.width = window.innerWidth + "px";
    clouds.getDomElement().style.height = window.innerHeight + "px";
    domElement.appendChild(clouds.getDomElement());

    // Fade

    fade = document.createElement('div');
    fade.style.background = "rgba(255,255,255,1)";
    fade.style.width = "100%";
    fade.style.height = "100%";
    fade.style.position = "absolute";
    fade.style.zIndex = 1000;
    domElement.appendChild(fade);

    // UI

    uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.setAttribute("id", "ui-container");
    uiContainer.style.marginTop = "30px";

    textContainer = setupTextContainer(uiContainer);
    textContainer.style.top = 0;
    textContainer.style.width = '500px';
    uiContainer.appendChild(textContainer);
    
    // title = document.createElement('div');
    // title.style.position = 'absolute';
    // title.innerHTML = '<img src="/files/logo_heart.png" style="display:block; margin-top:-30px;" />';
    // uiContainer.appendChild(title);

    buttonEnter = createRolloverButton("10px 0 0 85px", "/files/enter_idle.png", "/files/enter_rollover.png");
    buttonEnter.style.width = 180 + 'px';
    buttonEnter.addEventListener('click', function () {

      startTextAnimation();
      // loading.getDomElement().style.display = 'block';
      buttonEnter.style.display = 'none';
      buttonStart.top = textContainer.offsetHeight + 'px';
      buttonStart.style.animationDelay = "10s";
      buttonStart.classList.add('text-animation'); 

      // isLoading = true;

      shared.signals.load.dispatch();

      // loading
      shared.emotion = new EmotionRecognition();
      // shared.signals.loadItemAdded.dispatch();
      shared.emotion.init();

    }, false);
    uiContainer.appendChild(buttonEnter);

    buttonStart = createRolloverButton("30px 0 0 85px", "/files/start_idle.png", "/files/start_rollover.png");
    buttonStart.style.opacity = '0';
    buttonStart.addEventListener('click', function () {
      shared.signals.showfilm.dispatch();
    }, false);
    uiContainer.appendChild(buttonStart);

    // loading = new LoadingBar(function () {
    //   loading.getDomElement().style.display = 'none';
    //   buttonStart.style.display = 'block';
    //   shared.loadedContent = true;
    //   isLoading = false;
    // });

    // loading.getDomElement().style.position = 'absolute';
    // loading.getDomElement().style.display = 'none';

    // uiContainer.appendChild(loading.getDomElement());

    // shared.signals.loadItemAdded.add(loading.addItem);
    // shared.signals.loadItemCompleted.add(loading.completeItem);

    if (!HandleErrors.isWebGLAndBeta) {

      domElement.appendChild(uiContainer);

    } else {

      ffTitle = document.createElement('div');
      ffTitle.style.paddingTop = "60px";
      ffTitle.style.marginLeft = "-2px";	// Ugly
      // ffTitle.innerHTML = "<img src = '/files/footer/header-trans.png' alt = 'ROME' />";
      domElement.appendChild(ffTitle);

    }

    if (localStorage.getItem("RomeSeen") == "true") {

      // Append a CSS file
      if (!loadedOnce) {
        var css = [
          ".seen-before {",
          "	opacity: .35;",
          "	cursor: pointer;",
          " padding: 15px 15px;",
          "}",
          ".seen-before:hover {",
          "	opacity: 1.0;",
          "}"
        ].join('\n');

        var rule = document.createTextNode(css);
        var head = document.getElementsByTagName('head')[0];
        var style = document.createElement('style');

        if (style.stylesheet) {
          style.styleSheet.cssText = rule.nodeValue;
        } else {
          style.appendChild(rule);
        }
        head.appendChild(style);
        loadedOnce = true;
      }

    } else {

      localStorage.setItem("RomeSeen", true);

    }


    // Implemented Footer.js
    // footer = document.createElement('div');
    // footer.style.position = 'absolute';
    // footer.style.left = '0';
    // footer.style.bottom = '0';
    // footer.style.width = "100%";
    // footNav = new Footer(footer);
    // domElement.appendChild(footer);

    function createRolloverButton(margin, imgIdle, imgRoll) {

      var button = document.createElement('div');
      button.style.position = 'absolute';
      button.style.cursor = 'pointer';
      button.style.margin = margin;

      var buttonImg = document.createElement('img');
      buttonImg.src = imgIdle;

      button.appendChild(buttonImg);

      button.addEventListener('mouseout', function () {

        buttonImg.src = imgIdle;

      }, false);

      button.addEventListener('mouseover', function () {

        buttonImg.src = imgRoll;

      }, false);

      return button;

    }

  }

  this.show = function () {

    clouds.show();
    domElement.style.display = 'block';
    if (!shared.loadedContent) buttonStart.style.opacity = '0';

  };

  this.resize = function (width, height) {

    clouds.resize(width, height);

    if (title) {

      title.style.top = '60px';
      title.style.left = ( window.innerWidth - 358 ) / 2 + 'px';

    }

    if (textContainer) {
      textContainer.style.left = ( window.innerWidth - 500 ) / 2 + 'px';
    }

    if (buttonEnter) {

      buttonEnter.style.top = '210px';
      buttonEnter.style.left = buttonStart.style.left = ( window.innerWidth - 358 ) / 2 + 'px';
      buttonStart.style.top = textContainer.offsetHeight - 20 + 'px';
    }

    // if (loading) {

    //   loading.getDomElement().style.top = '215px';
    //   loading.getDomElement().style.left = ( window.innerWidth - 300 ) / 2 + 'px';

    // }

    domElement.style.width = width + 'px';
    domElement.style.height = height + 'px';

  };

  this.hide = function () {

    clouds.hide();
    domElement.style.display = 'none';

  };

  this.update = function () {

    time = new Date().getTime();
    delta = time - oldTime;
    oldTime = time;

    if (! isLoading) {

      clouds.update();

    }

    if (alpha > 0) {

      alpha -= 0.0004 * delta;

      at = TWEEN.Easing.Exponential.EaseOut(alpha);

      fade.style.background = "rgba(255,255,255," + at + ")";

    } else {

      fade.style.display = "none";
      fade.style.zIndex = 0;

    }

  };

  LauncherSection.showUI = function() {

        if(ffTitle) {
            ffTitle.style.display = "none";
        }
    domElement.appendChild(uiContainer);

  };

  this.getDomElement = function () {

    return domElement;

  };

};

LauncherSection.prototype = new Section();
LauncherSection.prototype.constructor = LauncherSection;
