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
    2, //Number of elements per attribute
    gl.FLOAT, //Type of elements
    gl.false,
    5 * Float32Array.BYTES_PER_ELEMENT,// Size of an individual vertex
    0//Offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation, //Attribute location
    3, //Number of elements per attribute
    gl.FLOAT, //Type of elements
    gl.false,
    5 * Float32Array.BYTES_PER_ELEMENT,// Size of an individual vertex
    2 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  //Main render loop
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3)

};
