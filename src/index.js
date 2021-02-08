import {VertexAttributes} from "./twodeejs/vertex_attributes";
import {VertexArray} from "./twodeejs/vertex_array";
import {ShaderProgram} from "./twodeejs/shader-program";
import {Matrix4} from "./twodeejs/matrix";
import {Trackball} from "./twodeejs/trackball";

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shader;
let vertexArray;
let eyeToClip;
let trackball;

function render() {
  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.enable(gl.DEPTH_TEST);

  shader.bind();
  vertexArray.bind();
  shader.setUniformMatrix4("eyeToClip", eyeToClip);
  shader.setUniformMatrix4("rotation", trackball.rotation);
  vertexArray.drawIndexed(gl.TRIANGLES);
  vertexArray.unbind();
  shader.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const aspect = canvas.width / canvas.height;
  const size = 2;
  if (aspect >= 1) {
    eyeToClip = Matrix4.ortho(-size * aspect, size * aspect, -size, size, -10, 10);
  } else {
    eyeToClip = Matrix4.ortho(-size, size, -size / aspect, size / aspect, -10, 10);
  }
  trackball.setViewport(canvas.width, canvas.height);
  render();
}

function makeBox() {
  const positions = [
    // Front
    -1, -1, 1,
     1, -1, 1,
    -1,  1, 1,
     1,  1, 1,

     // Top
    -1,  1, 1,
     1,  1, 1,
    -1,  1, -1,
     1,  1, -1,

     // Back
     1, -1, -1,
    -1, -1, -1,
     1,  1, -1,
    -1,  1, -1,

    // Bottom
    -1, -1, -1,
     1, -1, -1,
    -1, -1,  1,
     1, -1,  1,

    // Right
     1,  1, -1,
     1, -1, -1,
     1,  1,  1,
     1, -1,  1,

     //Left
     -1,  1, -1,
     -1, -1, -1,
     -1,  1,  1,
     -1, -1,  1,

  ];

  const normals = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,


    
  ];

  const faces = [
    0, 1, 2,
    1, 3, 2,

    4, 5, 6,
    5, 7, 6,

    8, 9, 10,
    9, 11, 10,

    12, 13, 14,
    13, 15, 14,

    16, 17, 18,
    17, 19, 18,
    
    20, 21, 22,
    21, 23, 22,
  ];

  const attributes = new VertexAttributes();
  attributes.addAttribute("position", 24, 3, positions);
  attributes.addAttribute("normal", 24, 3, normals);
  attributes.addIndices(faces);

  vertexArray = new VertexArray(shader, attributes);
}

async function initialize() {
  trackball = new Trackball();

  const vertexSource = `
uniform mat4 eyeToClip;
uniform mat4 rotation;
in vec3 position;
in vec3 normal;

out vec3 fnormal;

void main() {
  gl_Position = eyeToClip * rotation * vec4(position, 1.0);
  fnormal = (rotation * vec4(normal, 0.0)).xyz;
}
  `;

  const fragmentSource = `
in vec3 fnormal;
out vec4 fragmentColor;

const vec3 light_direction = normalize(vec3(1.0, 1.0, 1.0));

void main() {
  vec3 normal = normalize(fnormal);
  float litness = max(0.0, dot(normal, light_direction));
  fragmentColor = vec4(0.0, 1.0, 0.6, 1.0);
  fragmentColor = vec4(vec3(litness), 1.0);
}
  `;
  shader = new ShaderProgram(vertexSource, fragmentSource);

  makeBox();
  window.addEventListener('resize', onSizeChanged);
  onSizeChanged();

  window.addEventListener('mousedown', event => {
    trackball.start(event.clientX, canvas.height - event.clientY);
  });

  window.addEventListener('mousemove', event => {
    if (event.buttons !== 0) {
      trackball.drag(event.clientX, canvas.height - event.clientY);
      render();
    }
  });
}

initialize();