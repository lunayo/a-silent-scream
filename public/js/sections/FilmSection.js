function Transition ( sceneA, sceneB, renderer, width, height) {

    function getTransitionShader(texture, videoTexture, videoTexture2) {
        return new THREE.MeshShaderMaterial({

            uniforms: {
                tMixTexture: {
                    type: "t",
                    value: 0,
                    texture: texture
                },
                tDiffuse1: {
                    type: "t",
                    value: 1,
                    texture: videoTexture
                },
                tDiffuse2: {
                    type: "t",
                    value: 2,
                    texture: videoTexture2
                },
                mixRatio: {
                    type: "f",
                    value: 0.5
                },
                threshold: {
                    type: "f",
                    value: 0.1
                },
                useTexture: {
                    type: "i",
                    value: 1,
                }
            },
            vertexShader: [
    
                "varying vec2 vUv;",
    
                "void main() {",
    
                "vUv = vec2( uv.x, 1.0 - uv.y );",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    
                "}"
    
            ].join("\n"),
            fragmentShader: [
    
                "uniform float mixRatio;",
    
                "uniform sampler2D tDiffuse2;",
                "uniform sampler2D tDiffuse1;",
                "uniform sampler2D tMixTexture;",
                
                "uniform int useTexture;",
                "uniform float threshold;",
    
                "varying vec2 vUv;",
    
                "void main() {",
    
                "vec4 texel1 = texture2D( tDiffuse1, vUv );",
                "vec4 texel2 = texture2D( tDiffuse2, vUv );",
                "if (useTexture==1) {",
                    
                    "vec4 transitionTexel = texture2D( tMixTexture, vUv );",
                    "float r = mixRatio * (1.0 + threshold * 2.0) - threshold;",
                    "float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);",
                    "gl_FragColor = mix( texel1, texel2, mixf );",
                "} else {",
                    
                    "gl_FragColor = mix( texel2, texel1, mixRatio );",
                    
                "}",
            "}"
    
            ].join("\n")
    
        });
    }

	this.scene = new THREE.Scene();
	
	this.camera = new THREE.Camera( 68, width / height, 1, 1000 );
    this.camera.position.z = 200;

    this.texture = THREE.ImageUtils.loadTexture('files/textures/transition4.png');
    this.sceneA = sceneA;
    this.sceneB = sceneB;
				
	this.quadmaterial = getTransitionShader(this.texture, this.sceneA.renderTarget, this.sceneB.renderTarget);
	this.needChange = false;
    const quadgeometry = new THREE.Plane( 480, 270 );
	
	this.quad = new THREE.Mesh(quadgeometry, this.quadmaterial);
	this.scene.addChild(this.quad);
	
	this.render = function( transition ) {
		
		// Transition animation
        // const transitionSpeed = 2.0;
        // var t=(1+Math.sin(transitionSpeed*clock.getElapsedTime()/Math.PI))/2;
        // transition=THREE.Math.smoothstep(t,0.3,0.7);
		
		this.quadmaterial.uniforms.mixRatio.value = transition;

		// Prevent render both scenes when it's not necessary
		if (transition==0) {
			
			this.sceneB.render( false );
		
		} else if (transition==1) {
		
			this.sceneA.render( false );
			
		} else {
			// When 0<transition<1 render transition between two scenes
			this.sceneA.render( true );
			this.sceneB.render( true );
			renderer.render( this.scene, this.camera );

		}
	}
}

function VideoScene(source, renderer, width, height, muted, callback) {

    function getHeatEffect(videoTexture) {
        return new THREE.MeshShaderMaterial({
            uniforms: {
                "time": { type: "f", value:0 },
                "map": { type: "t", value:0, texture: videoTexture }
            },
            vertexShader: [
    
                "varying vec2 vUv;",
    
                "void main() {",
    
                "vUv = vec2( uv.x, uv.y );",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    
                "}"
    
            ].join("\n"),
            fragmentShader: [
                "uniform sampler2D map;",
				"varying vec2 vUv;",

				"void main() {",

					"vec4 color, tmp, add;",

					// "vec2 uv = vUv + vec2( sin( vUv.y * 100.0 ), sin( vUv.x * 100.0 )) * 0.0005;",
					"vec2 uv = vUv;",

					"color = texture2D( map, uv );",

					"float param1 = 0.0009;",
					"float param2 = 0.001;",

					"add = tmp = texture2D( map, uv + vec2( param1, param1 ));", 
					"if( tmp.r < color.r ) color = tmp;",

					"add += tmp = texture2D( map, uv + vec2( -param1, param1 ));",
					"if( tmp.r < color.r ) color = tmp;",

					"add += tmp = texture2D( map, uv + vec2( -param1, -param1 ));",
					"if( tmp.r < color.r ) color = tmp;",

					"add += tmp = texture2D( map, uv + vec2( param1, -param1 ));",
					"if( tmp.r < color.r ) color = tmp;",

					"add += tmp = texture2D( map, uv + vec2( param2, 0.0 ));",
					"if( tmp.r < color.r ) color = tmp;",

					"add += tmp = texture2D( map, uv + vec2( -param2, 0.0 ));",
					"if( tmp.r < color.r ) color = tmp;",

					"add += tmp = texture2D( map, uv + vec2( 0, param2 ));",
					"if( tmp.r < color.r ) color = tmp;",

					"add += tmp = texture2D( map, uv + vec2( 0, -param2 ));",
					"if( tmp.r < color.r ) color = tmp;",

                    "color = color * color + add * 0.5 / 8.0;",
                    "if ( color.r < 0.2)",
                    "color += vec4(0.2, 0.0, 0.0, 1.0);",
					"gl_FragColor = color;",

					// "gl_FragColor = texture2D( map, uv );",

				"}"
    
            ].join("\n")
    
        });
    }

    // CAMERA
    this.camera = new THREE.Camera( 90, width / height, 1, 1000 );
    this.camera.position.z = 200;
    // SCENE
    this.scene = new THREE.Scene();
    // VIDEO
    this.video = document.createElement('video');
    this.video.autobuffer = true;
    this.video.muted = muted;
    this.video.src = source;
    this.video.ontimeupdate = function() { 
        if(callback) {
            callback(this.video.currentTime); 
        }
    }.bind(this);

    const geometry = new THREE.Plane( 480, 270 );
    this.texture = new THREE.Texture( this.video );
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    // this.quadmaterial = getHeatEffect(this.texture);
    const mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: this.texture, depthTest: false } ) );
    // const mesh = new THREE.Mesh( geometry, this.quadmaterial );
    this.scene.addChild( mesh );

    this.renderTarget = new THREE.WebGLRenderTarget( width, height );
    this.renderTarget.minFilter = THREE.LinearFilter;
    this.renderTarget.magFilter = THREE.LinearFilter;

    this.render = function(rtt) {
        // renderer.setClearColor( 0xffffff, 1 );
        if (rtt)
			renderer.render( this.scene, this.camera, this.renderTarget, true );
		else
			renderer.render( this.scene, this.camera );
    }
}

var FilmSection = function (shared) {

    Section.call(this);

    var videoScene, videoScene2, renderer, domElement, interval, transition, cameraInput, cameraOutput;

    domElement = document.createElement( 'div' );
	domElement.style.display = 'none';

    cameraInput = document.createElement( 'video' );
	cameraInput.style.display = 'none';
    domElement.appendChild(cameraInput);

    cameraOutput = document.createElement( 'canvas' );
    cameraOutput.style.position = 'absolute';
    cameraOutput.style.opacity = '0';
    domElement.appendChild(cameraOutput);

    var mouseX = 0, mouseY = 0;
    var currentTransition = 0.0;
    var transitionRate = 0.03;
    
    function increaseTransition() {
        if(currentTransition < 1.0)
            currentTransition += transitionRate;
    }

    function decreaseTransition() {
        if(currentTransition > 0.0)
            currentTransition -= transitionRate;
    }

    function showCamera() {
        cameraOutput.classList.remove('camera-animation'); // reset animation
        void cameraOutput.offsetWidth; // trigger reflow
        cameraOutput.classList.add('camera-animation'); // start animation
        shared.emotion.start_camera();
    }

    function hideCamera() {
        cameraOutput.classList.remove('camera-animation'); // reset animation
        shared.emotion.stop_camera();
    }

    this.load = function () {
        // Emotion
        const cameraWidth = 640;
        const cameraHeight = 480;
        const colors = ['red', 'green', 'purple', 'yellow', 'blue', 'orange', 'black'];
        const canvasCtx = cameraOutput.getContext('2d');
        shared.emotion.init_camera(cameraInput, cameraWidth, cameraHeight, function(image, result) {
            width = cameraOutput.width;
            height = cameraOutput.height;
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, width, height);
            canvasCtx.drawImage(image, 0, 0, width, height);
            drawRectangle(
                canvasCtx, result.boundingBox,
                {color: colors[result.prediction], lineWidth: 1, fillColor: '#00000000'});
            canvasCtx.restore();

            if(result.prediction < 6) {
                increaseTransition();
            } else {
                decreaseTransition();
            }
        });


        shared.baseWidth = 1024;
        shared.baseHeight = 576;
        shared.viewportWidth = shared.baseWidth * ( window.innerWidth / shared.baseWidth );
	    shared.viewportHeight = shared.baseHeight * ( window.innerWidth / shared.baseWidth );

        // shared.signals.mousemoved.add( function () {

		// 	mouseX = ( shared.mouse.x / SCREEN_WIDTH ) * 200 - 100;
		// 	mouseY = ( shared.mouse.y / SCREEN_HEIGHT ) * 200 - 100;

		// } );

        // RENDERER
        renderer = new THREE.WebGLRenderer( { stencil: false } );
        renderer.domElement.style.position = 'absolute';
        renderer.setSize( shared.viewportWidth, shared.baseHeight );
        renderer.sortObjects = false;
        renderer.autoClear = false;
        shared.renderer = renderer;

        var isCameraShown = false;
        videoScene = new VideoScene('videos/calm-compressed.mp4', renderer, shared.viewportWidth, shared.viewportHeight, false, function(currentTime) {
            if(currentTime > 18 && !isCameraShown) {
                showCamera();
                isCameraShown = true;
            }
            if(currentTime > 64 && isCameraShown) {
                currentTransition = 0.0;
                hideCamera();
            }
        });
        videoScene2 = new VideoScene('videos/agitated-compressed.mp4', renderer, shared.viewportWidth, shared.viewportHeight, true, null);

        transition = new Transition(videoScene, videoScene2, renderer, shared.viewportWidth, shared.viewportHeight);
    }

    this.show = function () {
        domElement.style.display = 'block';
		domElement.appendChild( renderer.domElement );
        videoScene.video.play();
        videoScene2.video.play();

        interval = setInterval( function () {

			if ( videoScene.video.readyState === videoScene.video.HAVE_ENOUGH_DATA ) {

				videoScene.texture.needsUpdate = true;

			}
            if ( videoScene2.video.readyState === videoScene2.video.HAVE_ENOUGH_DATA ) {

				videoScene2.texture.needsUpdate = true;

			}

		}, 1000 / 30 );
    };

    this.resize = function (width, height) {
		shared.viewportWidth = shared.baseWidth * ( width / shared.baseWidth );
		shared.viewportHeight = shared.baseHeight * ( width / shared.baseWidth );

		renderer.setSize( shared.viewportWidth, shared.viewportHeight );

		renderer.domElement.style.left = '0px';
		renderer.domElement.style.top = ( ( height - shared.viewportHeight  ) / 2 ) + 'px';

        windowHeight = Math.min(120, shared.viewportHeight * 0.2);
        windowWidth = windowHeight / 0.75;
    
        aspect = 480/640;
        if (windowWidth > windowHeight) {
            height = windowHeight;
            width = height / aspect;
        } else {
            width = windowWidth;
            height = width * aspect;
        }
        cameraOutput.style.top = (window.innerHeight - shared.viewportHeight * 0.7) / 2 - windowHeight + 'px';
        cameraOutput.style.left = window.innerWidth - windowWidth + 'px';
        cameraOutput.width = width;
        cameraOutput.height = height;
    };

    this.hide = function () {
        domElement.style.display = 'none';

        videoScene.video.pause();
        videoScene2.video.pause();
        clearInterval( interval );

        shared.emotion.stop_camera();
    };

    this.update = function () {

        videoScene.camera.position.x = ( mouseX - videoScene.camera.position.x ) * 0.05;
		videoScene.camera.position.y = ( - mouseY - videoScene.camera.position.y ) * 0.05;
		videoScene.camera.target.position.x = videoScene.camera.position.x;
		videoScene.camera.target.position.y = videoScene.camera.position.y;

        transition.render(currentTransition);
    };

    this.getDomElement = function () {
        return domElement;
    };
  };
  
  FilmSection.prototype = new Section();
  FilmSection.prototype.constructor = FilmSection;
  