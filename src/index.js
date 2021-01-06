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

  shader.bind();
  vertexArray.bind();
  vertexArray.drawSequence(gl.TRIANGLES);
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
  ];

  const attributes = new VertexAttributes();
  attributes.addAttribute("position", 3, 3, positions);

  vertexArray = new VertexArray(shader, attributes);
}

async function initialize() {


  const vertexSource = `#version 300 es

in vec3 position;

void main() {
  gl_Position = vec4(position, 1.0);
}
  `;

  const fragmentSource = `#version 300 es
precision mediump float;

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