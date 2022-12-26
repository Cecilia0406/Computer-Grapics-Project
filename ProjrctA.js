// CS351 Project A: Into the Star Wars by Yuqi Ma

// Vertex shader program----------------------------------
var VSHADER_SOURCE = 
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE = 
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';


//------------For WebGL-----------------------------------------------
var gl;          
var g_canvas = document.getElementById('webgl');     
                 
                  
// ----------For tetrahedron & its matrix---------------------------------
var g_vertsMax = 0;                 
                                    
var g_modelMatrix = new Matrix4(); 
                                    
var g_modelMatLoc;                  

//------------For Animation---------------------------------------------
var g_isRun = true;                 
var g_lastMS = Date.now();    			
                                    
var g_angle01 = 0.0;                  
var g_angle01Rate = 45.0;           

var g_angle02 = 0.0;
var g_angle02Rate = 20.0;

var g_angleLink1 = 0.0;
var g_angleLink1Rate = 10.0;

var g_angleLink2 = 0.0;
var g_angleLink2Rate = 15.0;

var g_angleLink3 = 0.0;
var g_angleLink3Rate = 20.0;

var g_angleHead = 0.0;
var g_angleHeadRate = 5.0;


//------------For mouse click-and-drag: -------------------------------
var g_isDrag=false;		
var g_isDoubleClick=false;  
var g_xMclik=0.0;			
var g_yMclik=0.0;   
var g_xMdragTot=0.0;	
var g_yMdragTot=0.0;

var g_xDblMdragTot=0.0; 
var g_yDblMdragTot=0.0;

var g_translatePyrX  = 0.0;
var g_translatePyrY  = 0.0;
var g_translatePyrRate = 0.3;

var g_translateSwimX = 0.0;
var g_translateSwimRate = 0.005;

function main() { 
  gl = getWebGLContext(g_canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Initialize a Vertex Buffer in the graphics system to hold our vertices
  g_maxVerts = initVertexBuffer(gl);  
  if (g_maxVerts < 0) {
    console.log('Failed to set the vertex information');
    return;
	}
	
	//--------------- Event Handlers --------------------
	window.addEventListener("keydown", myKeyDown, false);
	window.addEventListener("keyup", myKeyUp, false);
	window.addEventListener("mousedown", myMouseDown); 
	window.addEventListener("mousemove", myMouseMove); 
	window.addEventListener("mouseup", myMouseUp);	
	window.addEventListener("click", myMouseClick);				
	window.addEventListener("dblclick", myMouseDblClick); 
	
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.depthFunc(gl.LESS);
  gl.enable(gl.DEPTH_TEST); 	  
	
  g_modelMatLoc = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!g_modelMatLoc) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  //----------------- 
  var tick = function() {
		var now = Date.now();
		
		animate();  // Update the rotation angle
		animateSwim();
		
		g_last = now;

		drawAll();  
		drawTie_Spaceship(); 
		drawStar();
		drawSwim();

		
    requestAnimationFrame(tick, g_canvas);   
    									
  };
  tick();							// start (and continue) animation: draw current image
	
}

function initVertexBuffer() {
//==============================================================================

	
	const s60 = Math.sqrt(3.0)/2.0;      
	const c60 = 0.5;										 

	const s30 = 0.5;										
	const c30 = Math.sqrt(3.0)/2.0;			


  const colorShapes = new Float32Array([

		 //! ------------------------ Star ------------------------
		 // 0.0, 0.0, 0.0, 1.0,	    1.0, 0.0, 0.0, // Node 0 Red
		 // 0.25, 0.0, -0.5, 1.0,   0.0, 1.0, 0.0, // Node 1 Green
		 // 1.0,  0.0, 0.0, 1.0, 	0.0, 0.0, 1.0, // Node 2 Blue
		 // 0.75, 0.0, -0.5, 1.0,	0.0, 1.0, 1.0, // Node 3 Cyan
		 // 1.0, 0.0, -1.0, 1.0,	1.0, 0.0, 1.0, // Node 4 Magenta
		 // 0.0, 0.0, -1.0, 1.0,	1.0, 1.0, 0.0, // Node 5 Yellow
		 // 0.5, 1.0, -0.5, 1.0,	1.0, 1.0, 1.0, // Node 6 White

		 		 
		 //* Bottom Face
		 0.0, 0.0, 0.0, 1.0,	1.0, 0.0, 0.0, // Node 0 Red
		 0.25, 0.0, -0.5, 1.0,  0.0, 1.0, 0.0, // Node 1 Green
		 1.0,  0.0, 0.0, 1.0, 	0.0, 0.0, 1.0, // Node 2 Blue
		 0.25, 0.0, -0.5, 1.0,  0.0, 1.0, 0.0, // Node 1 Green
		 1.0,  0.0, 0.0, 1.0, 	0.0, 0.0, 1.0, // Node 2 Blue
		 0.75, 0.0, -0.5, 1.0,	0.0, 1.0, 1.0, // Node 3 Cyan
		 0.75, 0.0, -0.5, 1.0,	0.0, 1.0, 1.0, // Node 3 Cyan
		 1.0, 0.0, -1.0, 1.0,	1.0, 0.0, 1.0, // Node 4 Magenta
		 0.0, 0.0, -1.0, 1.0,	1.0, 1.0, 0.0, // Node 5 Yellow
		 0.25, 0.0, -0.5, 1.0,  0.0, 1.0, 0.0, // Node 1 Green
		 0.75, 0.0, -0.5, 1.0,	0.0, 1.0, 1.0, // Node 3 Cyan
		 0.0, 0.0, -1.0, 1.0,	1.0, 1.0, 0.0, // Node 5 Yellow
		 //* Front Face
		 0.0, 0.0, 0.0, 1.0,	1.0, 0.0, 0.0, // Node 0 Red
		 1.0,  0.0, 0.0, 1.0, 	0.0, 0.0, 1.0, // Node 2 Blue
		 0.5, 1.0, -0.5, 1.0,	1.0, 1.0, 1.0, // Node 6 White
		 //* Right Face
		 1.0,  0.0, 0.0, 1.0, 	0.0, 0.0, 1.0, // Node 2 Blue
		 0.75, 0.0, -0.5, 1.0,	0.0, 1.0, 1.0, // Node 3 Cyan
		 0.5, 1.0, -0.5, 1.0,	1.0, 1.0, 1.0, // Node 6 White
		 0.75, 0.0, -0.5, 1.0,	0.0, 1.0, 1.0, // Node 3 Cyan
		 0.5, 1.0, -0.5, 1.0,	1.0, 1.0, 1.0, // Node 6 White
		 1.0, 0.0, -1.0, 1.0,	1.0, 0.0, 1.0, // Node 4 Magenta
		 //* Back Face
		 0.5, 1.0, -0.5, 1.0,	1.0, 1.0, 1.0, // Node 6 White
		 0.0, 0.0, -1.0, 1.0,	1.0, 1.0, 0.0, // Node 5 Yellow
		 1.0, 0.0, -1.0, 1.0,	1.0, 0.0, 1.0, // Node 4 Magenta
		 //* Left Face
		 0.5, 1.0, -0.5, 1.0,	1.0, 1.0, 1.0, // Node 6 White
		 0.0, 0.0, -1.0, 1.0,	1.0, 1.0, 0.0, // Node 5 Yellow
		 0.25, 0.0, -0.5, 1.0,  0.0, 1.0, 0.0, // Node 1 Green
		 0.5, 1.0, -0.5, 1.0,	1.0, 1.0, 1.0, // Node 6 White
		 0.25, 0.0, -0.5, 1.0,  0.0, 1.0, 0.0, // Node 1 Green
		 0.0, 0.0, 0.0, 1.0,	1.0, 0.0, 0.0, // Node 0 Red
		
		 //! ------------------------ 3D Tie_Spaceship -----------------------

			/*
			Nodes:
			  * 
			1.0, 0.0, 1.0, 1.0,		0.4, 0.0, 0.8,  // Node 0 Purple
			0.5, -1.0, 1.0, 1.0,	0.0, 1.0, 0.0,  // Node 1 Green
			-0.5, -1.0, 1.0, 1.0, 	0.0, 1.0, 1.0,  // Node 2 Cyan
			-1.0, 0.0, 1.0, 1.0, 	0.0, 0.0, 1.0,  // Node 3 Blue
			-0.5, 1.0, 1.0, 1.0,	0.4, 0.8, 0.0,  // Node 4
			0.5, 1.0, 1.0, 1.0,		0.0, 1.0, 1.0,  // Node 5 Cyan
			1.0, 0.0, -1.0, 1.0, 	0.0, 0.0, 1.0,  // Nodo 6 Blue
			0.5, -1.0, -1.0, 1.0,	0.4, 0.8, 0.0,  // Node 7  
			-0.5, -1.0, -1.0, 1.0,	0.0, 1.0, 0.0,  // Node 8 Green
			-1.0, 0.0, -1.0, 1.0,	0.4, 0.0, 0.8,  // Node 9 Purple
			-0.5, 1.0, -1.0, 1.0,	0.0, 1.0, 1.0,  // Node 10 Cyan
			0.5, 1.0, -1.0, 1.0,	0.0, 0.0, 1.0,  // Nodo 11 Blue
			0.0, 0.25, 0.0, 1.0,	0.4, 0.8, 0.0,  // Node 12
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			-0.3, -0.25, 0.0, 1.0,	0.4, 0.0, 0.8,  // Node 14 Purple 

			*/
			//* Front Face
			1.0, 0.0, 1.0, 1.0,		0.4, 0.0, 0.8,  // Node 0 Purple
			0.5, -1.0, 1.0, 1.0,	0.0, 1.0, 0.0,  // Node 1 Green
			-0.5, -1.0, 1.0, 1.0, 	0.0, 1.0, 1.0,  // Node 2 Cyan
			1.0, 0.0, 1.0, 1.0,		0.4, 0.0, 0.8,  // Node 0 Purple
			0.5, 1.0, 1.0, 1.0,		0.0, 1.0, 1.0,  // Node 5 Cyan
			-0.5, -1.0, 1.0, 1.0, 	0.0, 1.0, 1.0,  // Node 2 Cyan
			-0.5, -1.0, 1.0, 1.0, 	0.0, 1.0, 1.0,  // Node 2 Cyan
			-1.0, 0.0, 1.0, 1.0, 	0.0, 0.0, 1.0,  // Node 3 Blue
			0.5, 1.0, 1.0, 1.0,		0.0, 1.0, 1.0,  // Node 5 Cyan
			-1.0, 0.0, 1.0, 1.0, 	0.0, 0.0, 1.0,  // Node 3 Blue
			-0.5, 1.0, 1.0, 1.0,	0.4, 0.8, 0.0,  // Node 4
			0.5, 1.0, 1.0, 1.0,		0.0, 1.0, 1.0,  // Node 5 Cyan

			//* Back Face
			1.0, 0.0, -1.0, 1.0, 	0.0, 0.0, 1.0,  // Nodo 6 Blue
			0.5, -1.0, -1.0, 1.0,	0.4, 0.8, 0.0,  // Node 7  
			-0.5, -1.0, -1.0, 1.0,	0.0, 1.0, 0.0,  // Node 8 Green
			-0.5, -1.0, -1.0, 1.0,	0.0, 1.0, 0.0,  // Node 8 Green
			0.5, 1.0, -1.0, 1.0,	0.0, 0.0, 1.0,  // Nodo 11 Blue			
			1.0, 0.0, -1.0, 1.0, 	0.0, 0.0, 1.0,  // Nodo 6 Blue
			-0.5, -1.0, -1.0, 1.0,	0.0, 1.0, 0.0,  // Node 8 Green
			-1.0, 0.0, -1.0, 1.0,	0.4, 0.0, 0.8,  // Node 9 Purple
			0.5, 1.0, -1.0, 1.0,	0.0, 0.0, 1.0,  // Nodo 11 Blue			
			-1.0, 0.0, -1.0, 1.0,	0.4, 0.0, 0.8,  // Node 9 Purple
			-0.5, 1.0, -1.0, 1.0,	0.0, 1.0, 1.0,  // Node 10 Cyan
			0.5, 1.0, -1.0, 1.0,	0.0, 0.0, 1.0,  // Nodo 11 Blue
			
			 //* Sides
			1.0, 0.0, 1.0, 1.0,		0.4, 0.0, 0.8,  // Node 0 Purple
			0.5, -1.0, 1.0, 1.0,	0.0, 1.0, 0.0,  // Node 1 Green
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			0.5, -1.0, 1.0, 1.0,	0.0, 1.0, 0.0,  // Node 1 Green
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			-0.5, -1.0, 1.0, 1.0, 	0.0, 1.0, 1.0,  // Node 2 Cyan
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			-0.5, -1.0, 1.0, 1.0, 	0.0, 1.0, 1.0,  // Node 2 Cyan
			-0.3, -0.25, 0.0, 1.0,	0.4, 0.0, 0.8,  // Node 14 Purple 
			-0.5, -1.0, 1.0, 1.0, 	0.0, 1.0, 1.0,  // Node 2 Cyan
			-0.3, -0.25, 0.0, 1.0,	0.4, 0.0, 0.8,  // Node 14 Purple 
			-1.0, 0.0, 1.0, 1.0, 	0.0, 0.0, 1.0,  // Node 3 Blue
			-0.3, -0.25, 0.0, 1.0,	0.4, 0.0, 0.8,  // Node 14 Purple 
			-1.0, 0.0, 1.0, 1.0, 	0.0, 0.0, 1.0,  // Node 3 Blue
			0.0, 0.25, 0.0, 1.0,	0.4, 0.8, 0.0,  // Node 12
			-1.0, 0.0, 1.0, 1.0, 	0.0, 0.0, 1.0,  // Node 3 Blue
			0.0, 0.25, 0.0, 1.0,	0.4, 0.8, 0.0,  // Node 12
			-0.5, 1.0, 1.0, 1.0,	0.4, 0.8, 0.0,  // Node 4
			0.0, 0.25, 0.0, 1.0,	0.4, 0.8, 0.0,  // Node 12
			-0.5, 1.0, 1.0, 1.0,	0.4, 0.8, 0.0,  // Node 4
			0.5, 1.0, 1.0, 1.0,		0.0, 1.0, 1.0,  // Node 5 Cyan
			0.0, 0.25, 0.0, 1.0,	0.4, 0.8, 0.0,  // Node 12
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			0.5, 1.0, 1.0, 1.0,		0.0, 1.0, 1.0,  // Node 5 Cyan
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			0.5, 1.0, 1.0, 1.0,		0.0, 1.0, 1.0,  // Node 5 Cyan
			1.0, 0.0, 1.0, 1.0,		0.4, 0.0, 0.8,  // Node 0 Purple			
			//*----------------------------------------
			1.0, 0.0, -1.0, 1.0, 	0.0, 0.0, 1.0,  // Nodo 6 Blue
			0.5, -1.0, -1.0, 1.0,	0.4, 0.8, 0.0,  // Node 7  			 
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			0.5, -1.0, -1.0, 1.0,	0.4, 0.8, 0.0,  // Node 7  			 
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			-0.5, -1.0, -1.0, 1.0,	0.0, 1.0, 0.0,  // Node 8 Green
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			-0.5, -1.0, -1.0, 1.0,	0.0, 1.0, 0.0,  // Node 8 Green
			-0.3, -0.25, 0.0, 1.0,	0.4, 0.0, 0.8,  // Node 14 Purple
			-0.5, -1.0, -1.0, 1.0,	0.0, 1.0, 0.0,  // Node 8 Green
			-0.3, -0.25, 0.0, 1.0,	0.4, 0.0, 0.8,  // Node 14 Purple		
			-1.0, 0.0, -1.0, 1.0,	0.4, 0.0, 0.8,  // Node 9 Purple
			-0.3, -0.25, 0.0, 1.0,	0.4, 0.0, 0.8,  // Node 14 Purple		
			-1.0, 0.0, -1.0, 1.0,	0.4, 0.0, 0.8,  // Node 9 Purple			
			-0.5, 1.0, -1.0, 1.0,	0.0, 1.0, 1.0,  // Node 10 Cyan			
			-0.3, -0.25, 0.0, 1.0,	0.4, 0.0, 0.8,  // Node 14 Purple		
			0.0, 0.25, 0.0, 1.0,	0.4, 0.8, 0.0,  // Node 12
			-0.5, 1.0, -1.0, 1.0,	0.0, 1.0, 1.0,  // Node 10 Cyan						
			0.0, 0.25, 0.0, 1.0,	0.4, 0.8, 0.0,  // Node 12
			-0.5, 1.0, -1.0, 1.0,	0.0, 1.0, 1.0,  // Node 10 Cyan					
			0.5, 1.0, -1.0, 1.0,	0.0, 0.0, 1.0,  // Nodo 11 Blue						
			0.0, 0.25, 0.0, 1.0,	0.4, 0.8, 0.0,  // Node 12
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			0.5, 1.0, -1.0, 1.0,	0.0, 0.0, 1.0,  // Nodo 11 Blue	
			0.3, -0.25, 0.0, 1.0,	1.0, 0.0, 0.0,  // Node 13 Red
			0.5, 1.0, -1.0, 1.0,	0.0, 0.0, 1.0,  // Nodo 11 Blue	
			1.0, 0.0, -1.0, 1.0, 	0.0, 0.0, 1.0,  // Nodo 6 Blue						
			
		//! --------------------- 3D Concave Hexagon ----------------------

    	/*
			Nodes:
			* Front Facing Triangle
			-0.1,  0.1,  0.5,  1.0,    1.0,  0.0,  0.0,  // Node 0 RED
			 0.0, -0.1,  0.5,  1.0,    1.0,  1.0,  1.0,  // Node 1 WHITE
			 0.1,  0.1,  0.5,  1.0,    0.0,  0.0,  1.0,  // Node 2 BLUE
			* Back Facing Triangle
			-0.1,  0.1,  0.0,  1.0,    1.0,  0.0,  0.0,  // Node 3 RED
			 0.0, -0.1,  0.0,  1.0,    1.0,  1.0,  1.0,  // Node 4 WHITE
			 0.1,  0.1,  0.0,  1.0,    0.0,  0.0,  1.0,  // Node 5 BLUE
			* Points of Star
			 0.0,  1.0,  0.25, 1.0,    1.0,  0.0,  0.0,  // Node 6 RED
			-c30, -s30,  0.25, 1.0,    1.0,  1.0,  1.0,  // Node 7 WHITE
			 c30, -s30,  0.25, 1.0,    0.0,  0.0,  1.0,  // Node 8 BLUE 
		*/
		// * Front
			-0.1,  0.1,  0.5,  1.0,    1.0,  0.0,  0.0,  // Node 0 RED
			0.0, -0.1,  0.5,  1.0,    1.0,  1.0,  1.0,  // Node 1 WHITE
			0.1,  0.1,  0.5,  1.0,    0.0,  0.0,  1.0,  // Node 2 BLUE
	   // * Back
		   -0.1,  0.1,  0.0,  1.0,    1.0,  0.0,  0.0,  // Node 3 RED
			0.0, -0.1,  0.0,  1.0,    1.0,  1.0,  1.0,  // Node 4 WHITE
			0.1,  0.1,  0.0,  1.0,    0.0,  0.0,  1.0,  // Node 5 BLUE
	   // ! ------------------- Top Point -------------------------
	   // * Front Top Point Face
		   -0.1,  0.1,  0.5,  1.0,    1.0,  0.0,  0.0,  // Node 0 RED
			0.1,  0.1,  0.5,  1.0,    0.0,  0.0,  1.0,  // Node 2 BLUE
			0.0,  1.0,  0.25, 1.0,    1.0,  0.0,  0.0,  // Node 6 RED
	   // * Left Top Point Face
		   -0.1,  0.1,  0.5,  1.0,    1.0,  0.0,  0.0,  // Node 0 RED
		   -0.1,  0.1,  0.0,  1.0,    1.0,  0.0,  0.0,  // Node 3 RED
			0.0,  1.0,  0.25, 1.0,    1.0,  0.0,  0.0,  // Node 6 RED
	   // * Back Top Point Face
		   -0.1,  0.1,  0.0,  1.0,    1.0,  0.0,  0.0,  // Node 3 RED
			0.1,  0.1,  0.0,  1.0,    0.0,  0.0,  1.0,  // Node 5 BLUE
			0.0,  1.0,  0.25, 1.0,    1.0,  0.0,  0.0,  // Node 6 RED
	   // * Right Top Point Face
			0.1,  0.1,  0.5,  1.0,    0.0,  0.0,  1.0,  // Node 2 BLUE
			0.1,  0.1,  0.0,  1.0,    0.0,  0.0,  1.0,  // Node 5 BLUE
			0.0,  1.0,  0.25, 1.0,    1.0,  0.0,  0.0,  // Node 6 RED
	   // ! ------------------- Left Point -------------------------
	   // * Front Left Point Face
		   -0.1,  0.1,  0.5,  1.0,    1.0,  0.0,  0.0,  // Node 0 RED
			0.0, -0.1,  0.5,  1.0,    1.0,  1.0,  1.0,  // Node 1 WHITE
		   -c30, -s30,  0.25, 1.0,    1.0,  1.0,  1.0,  // Node 7 WHITE
	   // * Left Left Point Face
		   -0.1,  0.1,  0.5,  1.0,    1.0,  0.0,  0.0,  // Node 0 RED
		   -0.1,  0.1,  0.0,  1.0,    1.0,  0.0,  0.0,  // Node 3 RED
		   -c30, -s30,  0.25, 1.0,    1.0,  1.0,  1.0,  // Node 7 WHITE
	   // * Back Left Point Face
		   -0.1,  0.1,  0.0,  1.0,    1.0,  0.0,  0.0,  // Node 3 RED
			0.0, -0.1,  0.0,  1.0,    1.0,  1.0,  1.0,  // Node 4 WHITE
		   -c30, -s30,  0.25, 1.0,    1.0,  1.0,  1.0,  // Node 7 WHITE
	   // * Right Left Point Face
			0.0, -0.1,  0.5,  1.0,    1.0,  1.0,  1.0,  // Node 1 WHITE
			0.0, -0.1,  0.0,  1.0,    1.0,  1.0,  1.0,  // Node 4 WHITE
		   -c30, -s30,  0.25, 1.0,    1.0,  1.0,  1.0,  // Node 7 WHITE
	   // ! -------------------- Right Point ------------------------
	   // * Front Right Point Face 
		   0.0, -0.1,  0.5,  1.0,    1.0,  1.0,  1.0,  // Node 1 WHITE
		   0.1,  0.1,  0.5,  1.0,    0.0,  0.0,  1.0,  // Node 2 BLUE
		   c30, -s30,  0.25, 1.0,    0.0,  0.0,  1.0,  // Node 8 BLUE
	   // * Left Right Point Face
		   0.0, -0.1,  0.5,  1.0,    1.0,  1.0,  1.0,  // Node 1 WHITE
		   0.0, -0.1,  0.0,  1.0,    1.0,  1.0,  1.0,  // Node 4 WHITE
		   c30, -s30,  0.25, 1.0,    0.0,  0.0,  1.0,  // Node 8 BLUE
	   // * Back Right Point Face
		   0.0, -0.1,  0.0,  1.0,    1.0,  1.0,  1.0,  // Node 4 WHITE
		   0.1,  0.1,  0.0,  1.0,    0.0,  0.0,  1.0,  // Node 5 BLUE
		   c30, -s30,  0.25, 1.0,    0.0,  0.0,  1.0,  // Node 8 BLUE
	   // * Right Right Point Face
		   0.1,  0.1,  0.5,  1.0,    0.0,  0.0,  1.0,  // Node 2 BLUE
		   0.1,  0.1,  0.0,  1.0,    0.0,  0.0,  1.0,  // Node 5 BLUE
		   c30, -s30,  0.25, 1.0,    0.0,  0.0,  1.0,  // Node 8 BLUE 
			
			]);
	g_vertsMax = colorShapes.length / 7;		
																				
  							
  // Create a buffer object
  var shapeBufferHandle = gl.createBuffer();  
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  
  gl.vertexAttribPointer(
  		a_Position, 	
  		4, 						
  		gl.FLOAT, 		
  		false, 				
  		FSIZE * 7, 		
  									
  		0);						
  									
  gl.enableVertexAttribArray(a_Position);  
  									
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
 
  gl.vertexAttribPointer(
  	a_Color, 				
  	3, 							
  	gl.FLOAT, 			
  	false, 					
  	FSIZE * 7, 			
							
  	FSIZE * 4);			
  									
  									
  gl.enableVertexAttribArray(a_Color);  					
  gl.bindBuffer(gl.ARRAY_BUFFER, null);


}

function drawStar() {

		g_modelMatrix.setTranslate(0.0, -0.7, 0); 
		g_modelMatrix.scale(0.5, 0.5, 0.5);

		
		g_modelMatrix.translate(g_translatePyrX, g_translatePyrY, 0.0); 
		
		g_modelMatrix.rotate(g_angle01, 1, 0, 1);
		g_modelMatrix.rotate(g_angle02, 0, 1, 0);

		g_modelMatrix.translate(-0.5, 0.0, 0.5);
	pushMatrix(g_modelMatrix);

		gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements); 
		gl.drawArrays(gl.TRIANGLES, 0 /* Start index */, 30 /* Num vertices to draw */);

	g_modelMatrix = popMatrix();

		g_modelMatrix.translate(0.5, 1.05, -0.6);
		g_modelMatrix.scale(0.3, 0.3, 0.3);
		g_modelMatrix.rotate(g_angle01, 1, 0, 0);
		gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLES, 108 /* Start index */, 42 /* Num vertices to draw */); // draw Concave Hex
}

function drawTie_Spaceship() {
	g_modelMatrix.setTranslate(-0.5, 0.5, 0);
	g_modelMatrix.scale(0.2, 0.2, 0.2);
	g_modelMatrix.rotate(30.0, 0.0, 1.0, 0.0);

	g_modelMatrix.translate(g_xDblMdragTot * 8, g_yDblMdragTot * 8, 0);

	var dist = Math.sqrt(g_xMdragTot*g_xMdragTot + g_yMdragTot*g_yMdragTot);
	g_modelMatrix.rotate(dist*120.0, -g_yMdragTot+0.0001, g_xMdragTot+0.0001, 0.0);

	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements); // Send matrix to GPU
	gl.drawArrays(gl.TRIANGLES, 30 /* Start index */, 78 /* Num vertices to draw */); // Draw 3D Tie_Spaceship
}

function drawSwim() {

	g_modelMatrix.setTranslate(g_translateSwimX+0.5, 0.4, 0.0);
	g_modelMatrix.scale(0.1, 0.1, 0.1);
	g_modelMatrix.rotate(140.0, 0.0, 0.0, 1.0);
	g_modelMatrix.rotate(g_angleLink1, 0.0, 0.0, 1.0);
	g_modelMatrix.translate(0.0, -1.0, 0.0);
	pushMatrix(g_modelMatrix);
	g_modelMatrix.rotate(g_angle01, 0.0, 0.5, 0.0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	
	// * First link
	gl.drawArrays(gl.TRIANGLES, 108 /* Start index */, 42 /* Num vertices to draw */); // Draw a Concave Hexagon
	
	g_modelMatrix.rotate(g_angleLink2, 0.0, 0.0, 1.0);
	g_modelMatrix.translate(0.0, -1.0, 0.0);
	pushMatrix(g_modelMatrix);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	// * Second link
	gl.drawArrays(gl.TRIANGLES, 108, 42);

	g_modelMatrix = popMatrix();
	pushMatrix(g_modelMatrix);

	g_modelMatrix.rotate(g_angleLink3, 0.0, 0.0, 1.0);
	g_modelMatrix.translate(0.0, -1.0, 0.0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	pushMatrix(g_modelMatrix);
	// * Third Link
	gl.drawArrays(gl.TRIANGLES, 108, 42);

	g_modelMatrix = popMatrix();

	g_modelMatrix.translate(0.0, -0.3, 0.0);
	g_modelMatrix.scale(0.5, 0.5, 0.5);
	g_modelMatrix.rotate(30.0, 0.0, 0.0, 1.0);
	g_modelMatrix.rotate(g_angleHead, 0.0, 0.0, 1.0);
	g_modelMatrix.translate(-0.2, -0.2, 0.0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	// * Head
	gl.drawArrays(gl.TRIANGLES, 30, 78); // Draw 3D Tie_Spaceship
}

function drawAll() {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	clrColr = new Float32Array(4);
	clrColr = gl.getParameter(gl.COLOR_CLEAR_VALUE);
	// console.log("clear value:", clrColr);

}


// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate() {
  var now = Date.now();
  var elapsed = now - g_last;

	var g_angle01min = -60.0;
	var g_angle01max =  60.0;
  if(g_angle01 >  g_angle01max && g_angle01Rate > 0) g_angle01Rate = -g_angle01Rate;
	if(g_angle01 <  g_angle01min && g_angle01Rate < 0) g_angle01Rate = -g_angle01Rate;
	
	g_angle01 = (g_angle01 + (g_angle01Rate * elapsed) / 1000.0) % 360;
	g_angle02 = (g_angle02 + (g_angle02Rate * elapsed) / 1000.0) % 360;
}

function animateSwim() {
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;

	var angleLink1min = -60.0;
	var angleLink1max =  60.0;

	var angleLink2min = -50.0;
	var angleLink2max =  50.0;

	var angleLink3min = -40.0;
	var angleLink3max =  40.0; 

	var angleHeadmin = -10.0;
	var angleHeadmax =  10.0;

	var translateXmax = 0.0;
	var translateXmin = -0.5;

	if(g_translateSwimX > translateXmax && g_translateSwimRate > 0) g_translateSwimRate = -g_translateSwimRate;
	if(g_translateSwimX < translateXmin && g_translateSwimRate < 0) g_translateSwimRate = -g_translateSwimRate;

	if(g_angleLink1 >  angleLink1max && g_angleLink1Rate > 0) g_angleLink1Rate = -g_angleLink1Rate;
	if(g_angleLink1 <  angleLink1min && g_angleLink1Rate < 0) g_angleLink1Rate = -g_angleLink1Rate;

	if(g_angleLink2 >  angleLink2max && g_angleLink2Rate > 0) g_angleLink2Rate = -g_angleLink2Rate;
	if(g_angleLink2 <  angleLink2min && g_angleLink2Rate < 0) g_angleLink2Rate = -g_angleLink2Rate;

	if(g_angleLink3 >  angleLink3max && g_angleLink3Rate > 0) g_angleLink3Rate = -g_angleLink3Rate;
	if(g_angleLink3 <  angleLink3min && g_angleLink3Rate < 0) g_angleLink3Rate = -g_angleLink3Rate;
	
	if(g_angleLink3 >  angleHeadmax && g_angleHeadRate > 0) g_angleHeadRate = -g_angleHeadRate;
	if(g_angleLink3 <  angleHeadmin && g_angleHeadRate < 0) g_angleHeadRate = -g_angleHeadRate;
	
	g_translateSwimX += g_translateSwimRate;
	g_angleLink1 = (g_angleLink1 + (g_angleLink1Rate * elapsed) / 1000.0)  % 360;
	g_angleLink2 = (g_angleLink2 + (g_angleLink2Rate * elapsed) / 1000.0)  % 360;
	g_angleLink3 = (g_angleLink3 + (g_angleLink3Rate * elapsed) / 1000.0)  % 360;	
	g_angleHead  = (g_angleHead  + (g_angleHeadRate  * elapsed) / 1000.0)  % 360;
}


//==================HTML Button Callbacks======================

function angleSubmit() {
	var UsrTxt = document.getElementById('usrAngle').value;	
// Display what we read from the edit-box: use it to fill up
// the HTML 'div' element with id='editBoxOut':
  console.log('angleSubmit: UsrTxt:', UsrTxt); // print in console, and
  g_angle01 = parseFloat(UsrTxt);     // convert string to float number 
};

function clearDrag() {
	g_xMdragTot = 0.0;
	g_yMdragTot = 0.0;
}

function spinUp() {
	g_angle02Rate += 25; 
	g_angleLink1Rate += 5;
	g_angle02Rate += 10;
	g_angleLink3Rate += 15;
}

function spinDown() {
// Called when user presses the 'Spin <<' button
 g_angle02Rate -= 25; 
 g_angleLink1Rate -= 5;
 g_angle02Rate -= 10;
 g_angleLink3Rate -= 15;
}

function runStop() {
  if(g_angle01Rate*g_angle01Rate > 1) {  
		g_angle01RateTmp = g_angle01Rate;  
		g_angle02RateTmp = g_angle02Rate;
		g_angleHeadRateTmp = g_angleHeadRate;
		g_angleLink1RateTmp = g_angleLink1Rate;
		g_angleLink2RateTmp = g_angleLink2Rate;
		g_angleLink3RateTmp = g_angleLink3Rate;
		g_translateSwimRateTmp = g_translateSwimRate;

		g_angle01Rate = 0;       
		g_angle02Rate = 0;
		g_angleHeadRate = 0;
		g_angleLink1Rate = 0;
		g_angleLink2Rate = 0;
		g_angleLink3Rate = 0;
		g_translateSwimRate = 0;
  }
  else {    
		g_angle01Rate = g_angle01RateTmp;  
		g_angle02Rate = g_angle02RateTmp;
		g_angleHeadRate = g_angleHeadRateTmp;
		g_angleLink1Rate = g_angleLink1RateTmp;
		g_angleLink2Rate = g_angleLink2RateTmp;
		g_angleLink3Rate = g_angleLink3RateTmp;
		g_translateSwimRate = g_translateSwimRateTmp;
  }
}

//===================Mouse and Keyboard event-handling Callbacks

function myMouseDown(ev) {
	if(g_isDoubleClick) return;
	
		var rect = ev.target.getBoundingClientRect();	
		var xp = ev.clientX - rect.left;									
		var yp = g_canvas.height - (ev.clientY - rect.top);	
		var x = (xp - g_canvas.width/2)  / 		
								 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
		var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
								 (g_canvas.height/2);
		g_isDrag = true;											// set our mouse-dragging flag
		g_xMclik = x;													// record where mouse-dragging began
		g_yMclik = y;
	console.log("myMouseClick() on button: ", ev.button); 
};


function myMouseMove(ev) {
	if(!g_isDrag && !g_isDoubleClick) return;				

  var rect = ev.target.getBoundingClientRect();	
  var xp = ev.clientX - rect.left;									
	var yp = g_canvas.height - (ev.clientY - rect.top);	
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);

	if(g_isDoubleClick) {
		g_xDblMdragTot += (x - g_xMclik);
		g_yDblMdragTot += (y - g_yMclik);
	} else {
		g_xMdragTot += (x - g_xMclik);					// Accumulate change-in-mouse-position,&
		g_yMdragTot += (y - g_yMclik);
	}
	// Report new mouse position & how far we moved on webpage

	g_xMclik = x;													// Make next drag-measurement from here.
	g_yMclik = y;
};

function myMouseUp(ev) {
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
	
	g_isDrag = false;				
	g_isDoubleClick = false;							// CLEAR our mouse-dragging flag, and
	

	if(g_isDoubleClick) {
		g_xDblMdragTot += (x - g_xMclik);
		g_yDblMdragTot += (y - g_yMclik);
	} else {
		g_xMdragTot += (x - g_xMclik);
		g_yMdragTot += (y - g_yMclik);
	}
	// Report new mouse position:
	console.log('myMouseUp: g_xMdragTot,g_yMdragTot =',g_xMdragTot,',\t',g_yMdragTot);
};

function myMouseClick(ev) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  
	
}	

function myMouseDblClick(ev) {
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
	//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	
	g_isDoubleClick = true;	
	g_isDrag = false;										// set our mouse-dragging flag
	g_xMclik = x;													// record where mouse-dragging began
	g_yMclik = y;
	// report on webpage
	console.log("myMouse-DOUBLE-Click() on button: ", ev.button); 
}	

function myKeyDown(kev) {
  console.log(  "--kev.code:",    kev.code,   "\t\t--kev.key:",     kev.key, 
              "\n--kev.ctrlKey:", kev.ctrlKey,  "\t--kev.shiftKey:",kev.shiftKey,
              "\n--kev.altKey:",  kev.altKey,   "\t--kev.metaKey:", kev.metaKey);

	switch(kev.code) {
		case "KeyP":
			console.log("Pause/unPause!\n");                // print on console,
			if(g_isRun==true) {
			  g_isRun = false;    // STOP animation
			  }
			else {
			  g_isRun = true;     // RESTART animation
			  tick();
			  }
			break;
		//------------------WASD navigation-----------------
		case "KeyA":
			g_translatePyrX -= g_translatePyrRate;
			break;
    case "KeyD":
			g_translatePyrX += g_translatePyrRate;
			break;
		case "KeyS":
			g_translatePyrY -= g_translatePyrRate;
			break;
		case "KeyW":
			g_translatePyrY += g_translatePyrRate;
			break;
	}
}

function myKeyUp(kev) {
	console.log('myKeyUp()--keyCode='+kev.keyCode+' released.');
}
