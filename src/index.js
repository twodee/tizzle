import {VertexAttributes} from "./twodeejs/vertex_attributes";
import {VertexArray} from "./twodeejs/vertex_array";
import {ShaderProgram} from "./twodeejs/shader";

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shader;
let vertexArray;

function render() {
  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);

  shader.bind();
  vertexArray.bind();
  vertexArray.drawIndexed(gl.TRIANGLES);
  vertexArray.unbind();
  shader.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

function makeBox() {
  const positions = [
    -1, -1, 1,
    1, -1, 1,
    -1, 1, 1,
    1, 1, 1,
  ];

  const faces = [
    0, 1, 2,
    1, 3, 2,
  ];

  const attributes = new VertexAttributes();
  attributes.addAttribute("position", 4, 3, positions);
  attributes.addIndices(faces);

  vertexArray = new VertexArray(shader, attributes);
}

async function initialize() {


  const vertexSource = `
in vec3 position;

void main() {
  gl_Position = vec4(position, 1.0);
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
}

initialize();