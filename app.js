
//TODO: Find a way to write these shaders in a way that is more readable while still staying parsable.
//TODO: Also make that 2d position into a 2d vector. Just set z to 0.0
var vertexShaderText =
//Simpler way for now just to set up a shader using an array
[
'precision mediump float;', // This says we want to use medium precision on floating point variables, compromise between speed and quality
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
' fragColor = vertColor;',
' gl_Position = mProj * mView * mWorld * vec4(vertPosition, 0.0, 1.0);',
 //gl_position is a 4D variable(vertPosition defines x and y, 0.0 is z, 1.0 idk
 //multiplying matrices together to get position..  order matters ..mWorld * vec4(vertPosition, 0.0, 1.0) rotates cube then multiplied by mView(where the camera is located) multiplied by mProj to get the nice points from before
 //NOTE: One possible explanation for the seemingly arbitrary 4th dimension of gl_Position vector could simply be an addition with the sole purpose of being able to multiply the 4x4 matrix by the position vector. Keep in mind that you can not multiply a 4x4 matrix by a 3d vector. That being said, why are the matrices 4x4 to begin with?
'}'
].join("\n");

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
' gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join("\n");

var InitDemo = function () {
  console.log("This is working");

  var canvas = document.getElementById('game-surface');
  var gl = canvas.getContext('webgl');

  if (!gl) {
    gl = canvas.getContext('experimental-webgl');
  }

  if (!gl) {
    alert('Your browser does not support webGL');
  }
// //Make canvas responsive
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
//   gl.viewport(0, 0, window.innerWidth, window.innerHeight);

  gl.clearColor(0.75, 0.85, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  //Next step is to compile vertexShader from top code and same for fragmentShader
  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(vertexShader);
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('ERROR COMPILING vertex shader', gl.getShaderInfoLog(vertexShader));
    return;
  }

  gl.compileShader(fragmentShader);
  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('ERROR COMPILING fragment shader', gl.getShaderInfoLog(vertexShader));
    return;
  }

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('ERROR LINKING PROGRAM', gl.getProgramInfoLog(program));
    return;
  }
  gl.validateProgram(program);
  if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('ERROR VALIDATING PROGRAM', gl.getProgramInfoLog(program));
    return;
  }

  //Create Buffer
  var triangleVerticies =
  [//X    Y    Z           R    G    B
    0.0, 0.5, 0.0,       1.0, 1.0, 0.0,
    -0.5, -0.5, 0.0,     0.5, 0.0, 1.0,
    0.5, -0.5, 0.0,      0.1, 1.0, 0.9
  ];

  var triangVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticies), gl.STATIC_DRAW);
  //STATIC_DRAW is sending the memory from the cpu to gpu once

  var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
  gl.vertexAttribPointer(
    positionAttribLocation, //Attribute location
    3, //Number of elements per attribute
    gl.FLOAT, //Type of elements
    gl.false,
    6 * Float32Array.BYTES_PER_ELEMENT,// Size of an individual vertex
    0//Offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation, //Attribute location
    3, //Number of elements per attribute
    gl.FLOAT, //Type of elements
    gl.false,
    6 * Float32Array.BYTES_PER_ELEMENT,// Size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  //After going through and doing everything with the attributes time to get our uniforms
  //Tell Open GL which state we are in
  gl.useProgram(program)

  var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
  var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0]);//make a camera, lookAt takes 3 parameters 3d vector for positon of viewer -5 in this instance is 5 units away try -2 and see what happens, where they're looking at, and up
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width/ canvas.height, 0.1, 1000.0);

//Now time to send these matrices to the shader
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
  //Main render loop

  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  var angle = 0;
  var loop = function () {
      angle = performance.now() / 1000 / 6 * 2 * Math.PI;
      //One full rotation every 6 seconds
      //for the rotate function below the first parameter is the output, the second is the original matrix, the third is the angle, fouth is the axis which we will be rotating
      mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]);
      //rotate the worldMatrix about the identityMatrix on angle around the y axis in this case
      gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

      gl.clearColor(0.75, 0.85, 0.8, 1.0);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};
