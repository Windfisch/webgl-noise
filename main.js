/* This file is part of WebGL-Noise by Florian Jung

To the extent possible under law, the person who associated CC0 with
WebGL-Noise has waived all copyright and related or neighboring rights
to WebGL-Noise, **except where noted otherwise**.

You should have received a copy of the CC0 legalcode along with this
work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
*/

// initialisation: get context and extensions

const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl");
if (!gl)
{
	alert("no webgl :(");
}

const ext_vao = gl.getExtension("OES_vertex_array_object");
if (!ext_vao)
{
	alert("no OES_vertex_array_object extension :(");
}

function getShader(gl, id, prepend) {
	var shaderScript = document.getElementById(id);

	if (!shaderScript) {
		return null;
	}

	var theSource = "";
	var currentChild = shaderScript.firstChild;

	while(currentChild) {
		if (currentChild.nodeType == 3) {
			theSource += currentChild.textContent;
		}

		currentChild = currentChild.nextSibling;
	}

	var shader;

	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;  // Unbekannter Shadertyp
	}

	if (prepend !== undefined)
		theSource = prepend + theSource;
	
	gl.shaderSource(shader, theSource);

	// Kompiliere das Shaderprogramm

	gl.compileShader(shader);

	// Überprüfe, ob die Kompilierung erfolgreich war

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("Es ist ein Fehler beim Kompilieren der Shader aufgetaucht: " + gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}
function initShader(shader, vsname, fsname, attrs, uniforms)
{
	console.log("initializing "+fsname+"/"+vsname);
	var fragmentShader = getShader(gl, fsname);
	var vertexShader = getShader(gl, vsname);

	shader.program = gl.createProgram();
	gl.attachShader(shader.program, vertexShader);
	gl.attachShader(shader.program, fragmentShader);
	gl.linkProgram(shader.program);

	gl.useProgram(shader.program);

	for (var i=0; i<attrs.length; i++)
	{
		var handle = gl.getAttribLocation(shader.program, attrs[i]);
		if (handle>=0)
			shader.attrs[attrs[i]] = handle;
		else
			console.log("could not find attribute '"+attrs[i]+"'");
	}

	for (var i=0; i<uniforms.length; i++)
	{
		var handle = gl.getUniformLocation(shader.program, uniforms[i]);
		if (handle != null)
			shader.uniforms[uniforms[i]]=handle;
		else
			console.log("could not find uniform '"+uniforms[i]+"' (is: "+handle+")");
	}

	gl.useProgram(null);
}

function init_vbo(data)
{
	vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return vbo;
}




// initialize shaders etc

var shaders = {
	test: {program: null, attrs: {}, uniforms: {}}
};

var screen_quad = [  1,  1,
                -1, -1,
                 1, -1,
            
                -1, -1,
                 1,  1,
                -1,  1 ];


initShader(shaders.test, "vs", "fs",
	["point"],
	["time"]);

var screen_quad_vbo = init_vbo(screen_quad);



var test_vao = ext_vao.createVertexArrayOES();
ext_vao.bindVertexArrayOES(test_vao);
gl.bindBuffer(gl.ARRAY_BUFFER, screen_quad_vbo);
gl.enableVertexAttribArray(shaders.test.attrs['point']);
gl.vertexAttribPointer(shaders.test.attrs['point'], 2, gl.FLOAT, false, 0,0);
ext_vao.bindVertexArrayOES(null);




function resize()
{
	canvas.height = canvas.clientHeight;
	canvas.width = canvas.clientWidth;;
}
window.addEventListener("resize", resize, false);
resize();


// launch the actual demo

function render(time) {
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	
	gl.useProgram(shaders.test.program);
	gl.uniform1f(shaders.test.uniforms['time'], time);
	ext_vao.bindVertexArrayOES(test_vao);

	gl.clearColor(1,0,1,1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.drawArrays(gl.TRIANGLES, 0, 6);

	ext_vao.bindVertexArrayOES(null);
	gl.useProgram(null);

	requestAnimationFrame(render);
}

requestAnimationFrame(render);
