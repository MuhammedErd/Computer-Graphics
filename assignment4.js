"use strict";

var canvas;
var gl;
var T =  vec4(0,0,0,0); //translation
var S =  vec4(1,1,1,1); //scaling
var R =  vec4(0,0,0,0); //rotation
var CP = vec3(0,0,5); //camera position(eye)
var CT = vec3(0,0,0); //camera target(at)
var UP = vec3(0,1,0); //up
var FOVY = 45;

var bufferName, bufferSurname,bufferSquare;
var nameVertices, surnameVertices, squareVertices;
var vPosition;

var transformationMatrix, transformationMatrixLoc;
var viewMatrix, viewMatrixLoc;
var projectionMatrix, projectionMatrixLoc;
var u_colorLocation;
var C = new Float32Array([1.0, 0.0, 0.0, 1.0]);


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Make the letters
    nameVertices = [
        vec3(  -0.5,  -0.2, 0 ),
        vec3(  -0.4,  -0.2, 0 ),
        vec3(  -0.5, 0.2, 0 ),
		vec3(  -0.4, 0.1, 0 ),
		vec3(  -0.3, 0.15, 0 ),	
		vec3(  -0.3, 0.0, 0 ),
		vec3(  -0.3, 0.15, 0 ),	
		vec3(  -0.2, 0.1, 0 ),
		vec3(  -0.1, 0.2, 0 ),
		vec3(  -0.2, -0.2, 0 ),
		vec3(  -0.1, -0.2, 0 ),	
    ];

    surnameVertices = [
        vec3(  0,  0.1, -0.4 ),
        vec3(  0,  0.2, -0.4 ),
        vec3(  0,  0.1, -0.2 ),
        vec3(  0,  0.2, -0.1 ),
		vec3(  0,  0.0, -0.3 ),
		vec3(  0, -0.2, -0.1 ),
		vec3(  0, -0.1, -0.1 ),
		vec3(  0, -0.2, -0.4 ),
		vec3(  0, -0.1, -0.4 ),
    ];
    squareVertices = [
        vec3(   2,  -2,  2 ),
        vec3(  -2,  -2,  2 ),
        vec3(   2,  -2, -2 ),
        vec3(  -2,  -2, -2 ),
    ];

    // Load the data into the GPU
    bufferName = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferName );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(nameVertices), gl.STATIC_DRAW );

    // Load the data into the GPU
    bufferSurname = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSurname );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(surnameVertices), gl.STATIC_DRAW );
    // Load the data into the GPU
    bufferSquare = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSquare );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(squareVertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    transformationMatrixLoc = gl.getUniformLocation( program, "transformationMatrix" );
	viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix");
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix");
    u_colorLocation=gl.getUniformLocation(program,"u_Color");

    document.getElementById("FOVY").oninput = function(event) {
        FOVY = event.target.value;//
    };
    document.getElementById("cam_posX").oninput = function(event) {
        CP[0] = event.target.value;//
    };
    document.getElementById("cam_posY").oninput = function(event) {
        CP[1] = event.target.value;//
    };
    document.getElementById("cam_posZ").oninput = function(event) {
        CP[2] = event.target.value;//
    };
    document.getElementById("cam_tarX").oninput = function(event) {
        CT[0] = event.target.value;//
    };
    document.getElementById("cam_tarY").oninput = function(event) {
        CT[1] = event.target.value;//
    };
    document.getElementById("cam_tarZ").oninput = function(event) {
        CT[2] = event.target.value;//
    };
    document.getElementById("inp_objX").oninput = function(event) {
        T[0] = event.target.value;//
    };
    document.getElementById("inp_objY").oninput = function(event) {
        T[1] = event.target.value;
    };
    document.getElementById("inp_objZ").oninput = function(event) {
        T[2] = event.target.value;//
    };
    document.getElementById("inp_obj_scaleX").oninput = function(event) {
        S[0]=event.target.value;
    };
    document.getElementById("inp_obj_scaleY").oninput = function(event) {
        S[1]=event.target.value;
    };
    document.getElementById("inp_obj_scaleZ").oninput = function(event) {
        S[2]=event.target.value;
    };
    document.getElementById("inp_rotationX").oninput = function(event) {
        R[0]=event.target.value;
    };
    document.getElementById("inp_rotationY").oninput = function(event) {
        R[1]=event.target.value;
    };
    document.getElementById("inp_rotationZ").oninput = function(event) {
        R[2]=event.target.value;
    };
    document.getElementById("redSlider").oninput = function(event) {
        C[0]=event.target.value;
    };
    document.getElementById("greenSlider").oninput = function(event) {
        C[1]=event.target.value;
    };
    document.getElementById("blueSlider").oninput = function(event) {
        C[2]=event.target.value;
    };

    render();

};


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
	
    transformationMatrix=mat4();
	viewMatrix=mat4();
    projectionMatrix=mat4();
    transformationMatrix=mult(transformationMatrix, translate(T[0], T[1], T[2], T[3]));
    transformationMatrix=mult(transformationMatrix, rotateX(R[0]));
    transformationMatrix=mult(transformationMatrix, rotateY(R[1]));
    transformationMatrix=mult(transformationMatrix, rotateZ(R[2]));
    transformationMatrix=mult(transformationMatrix, scalem(S[0],S[1],S[2],S[3]));
    viewMatrix=lookAt(CP,CT,UP);
	projectionMatrix=perspective(FOVY,1,1,20);
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
    gl.uniformMatrix4fv( viewMatrixLoc, false, flatten(viewMatrix) );
	gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	gl.uniform4f(u_colorLocation,C[0],C[1],C[2],1);

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferName );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 11 );
	
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSurname );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 9 );
	
	transformationMatrix=mat4();
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.uniform4fv(u_colorLocation, vec4(0.0, 0.3, 0.5, 0.8));
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSquare );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    window.requestAnimFrame(render);
}
