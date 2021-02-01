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
    eyeToClip = Matrix4.ortho(-size * aspect, size * aspect, -size, size, 10, -10);
  } else {
    eyeToClip = Matrix4.ortho(-size, size, -size / aspect, size / aspect, 10, -10);
  }
  trackball.setViewport(canvas.width, canvas.height);
  render();
}

function makeBox() {
  const positions = [
    -1, -1, 1,
    1, -1, 1,
    -1, 1, 1,
    1, 1, 1,
    -1, -1, -1,
    1, -1, -1,
    -1, 1, -1,
    1, 1, -1,
  ];

  const faces = [
    0, 1, 2,
    1, 3, 2,
    4, 7, 5,
    4, 6, 7,
    1, 5, 3,
    3, 5, 7,
    0, 6, 4,
    2, 6, 0,
    2, 3, 7,
    2, 7, 6,
    0, 7, 1,
    0, 6, 7,
  ];

  const attributes = new VertexAttributes();
  attributes.addAttribute("position", 8, 3, positions);
  attributes.addIndices(faces);

  vertexArray = new VertexArray(shader, attributes);
}

async function initialize() {
  trackball = new Trackball();

  const vertexSource = `
uniform mat4 eyeToClip;
uniform mat4 rotation;
in vec3 position;

void main() {
  gl_Position = eyeToClip * rotation * vec4(position, 1.0);
}
  `;

  const fragmentSource = `
out vec4 fragmentColor;

void main() {
  fragmentColor = vec4(0.0, 1.0, 0.6, 1.0);
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