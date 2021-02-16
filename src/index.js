// https://github.com/matt-way/gifuct-js
import {parseGIF, decompressFrames} from 'gifuct-js';

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
let dimensions;
let shift;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);

  shader.bind();
  vertexArray.bind();
  shader.setUniformMatrix4("eyeToClip", eyeToClip);
  shader.setUniformMatrix4("modelToWorld", shift);
  shader.setUniformMatrix4("rotation", trackball.rotation);
  vertexArray.drawIndexed(gl.TRIANGLES);
  vertexArray.unbind();
  shader.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const aspect = canvas.width / canvas.height;
  const size = 16;
  if (aspect >= 1) {
    eyeToClip = Matrix4.ortho(-size * aspect, size * aspect, -size, size, -100, 100);
  } else {
    eyeToClip = Matrix4.ortho(-size, size, -size / aspect, size / aspect, -100, 100);
  }
  trackball.setViewport(canvas.width, canvas.height);
  render();
}

function makeBox(x, y, z, rgb) {
  const positions = [
    -0.5 + x, -0.5 + y,  0.5 + z, // Front
     0.5 + x, -0.5 + y,  0.5 + z,
    -0.5 + x,  0.5 + y,  0.5 + z,
     0.5 + x,  0.5 + y,  0.5 + z,
    -0.5 + x,  0.5 + y,  0.5 + z, // Top
     0.5 + x,  0.5 + y,  0.5 + z,
    -0.5 + x,  0.5 + y, -0.5 + z,
     0.5 + x,  0.5 + y, -0.5 + z,
     0.5 + x, -0.5 + y, -0.5 + z, // Back
    -0.5 + x, -0.5 + y, -0.5 + z,
     0.5 + x,  0.5 + y, -0.5 + z,
    -0.5 + x,  0.5 + y, -0.5 + z,
    -0.5 + x, -0.5 + y, -0.5 + z, // Bottom
     0.5 + x, -0.5 + y, -0.5 + z,
    -0.5 + x, -0.5 + y,  0.5 + z,
     0.5 + x, -0.5 + y,  0.5 + z,
     0.5 + x,  0.5 + y, -0.5 + z, // Right
     0.5 + x, -0.5 + y, -0.5 + z,
     0.5 + x,  0.5 + y,  0.5 + z,
     0.5 + x, -0.5 + y,  0.5 + z,
    -0.5 + x,  0.5 + y, -0.5 + z, // Left
    -0.5 + x, -0.5 + y, -0.5 + z,
    -0.5 + x,  0.5 + y,  0.5 + z,
    -0.5 + x, -0.5 + y,  0.5 + z,
  ];

  const normals = [
     0,  0,  1,
     0,  0,  1,
     0,  0,  1,
     0,  0,  1,
     0,  1,  0,
     0,  1,  0,
     0,  1,  0,
     0,  1,  0,
     0,  0, -1,
     0,  0, -1,
     0,  0, -1,
     0,  0, -1,
     0, -1,  0,
     0, -1,  0,
     0, -1,  0,
     0, -1,  0,
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,
    -1,  0,  0,
    -1,  0,  0,
    -1,  0,  0,
    -1,  0,  0,
  ];

  const colors = [];
  for (let i = 0; i < 24; i = i + 1) {
    colors.push(...rgb);
  }

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

  return {positions, normals, colors, faces};
}

function makeBoxes(centers) {
  // const centers = [
  //   [0, 0, 0, [1, .5, .7]],
  //   [1, 1, 1, [.7, 1, .5]],
  //   [-1, -1, -1, [0.188, 0.835, 0.784]]
  // ];

  let positions = [];
  let normals = [];
  let colors = [];
  let faces = [];

  for (let center of centers) {
    const box = makeBox(center[0], center[1], center[2], center[3]);
    const offset = positions.length / 3;
    positions.push(...box.positions);
    normals.push(...box.normals);
    colors.push(...box.colors);
    faces.push(...box.faces.map(i => i + offset));
  }

  const attributes = new VertexAttributes();
  attributes.addAttribute("position", 72, 3, positions);
  attributes.addAttribute("normal", 72, 3, normals);
  attributes.addAttribute("color", 72, 3, colors);

  attributes.addIndices(faces);

  vertexArray = new VertexArray(shader, attributes);
}

async function initialize() {
  trackball = new Trackball();

  const vertexSource = `
uniform mat4 eyeToClip;
uniform mat4 modelToWorld;
uniform mat4 rotation;
in vec3 position;
in vec3 normal;
in vec3 color;

out vec3 fnormal;
out vec3 albedo;

void main() {
  gl_Position = eyeToClip * rotation * modelToWorld * vec4(position, 1.0);
  fnormal = (rotation * vec4(normal, 0.0)).xyz;
  albedo = color;
}
  `;

  const fragmentSource = `
in vec3 fnormal;
in vec3 albedo;
out vec4 fragmentColor;

const vec3 light_direction = normalize(vec3(1.0, 1.0, 1.0));

void main() {
  vec3 normal = normalize(fnormal);
  float litness = max(0.0, dot(normal, light_direction));
  fragmentColor = vec4(0.0, 1.0, 0.6, 1.0);
  fragmentColor = vec4(albedo * litness, 1.0);
}
  `;
  shader = new ShaderProgram(vertexSource, fragmentSource);

  await loadGif('face.gif');

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

async function loadGif(url) {
  const frames = await fetch(url)
    .then(resp => resp.arrayBuffer())
    .then(buff => parseGIF(buff))
    .then(gif => decompressFrames(gif, true));

  dimensions = [frames[0].dims.width, frames[0].dims.height, frames.length];

  let centers = [];
  for (let t = 0; t < frames.length; t++) {
    const frame = frames[t];
    for (let r = 0; r < frame.dims.height; r++) {
      for (let c = 0; c < frame.dims.width; c++) {
        const i = r * frame.dims.width + c;
        if (frame.pixels[i] !== frame.transparentIndex) {
          const rgb = frame.colorTable[frame.pixels[i]];
          centers.push([c, dimensions[1] - 1 - r, t, [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]]);
        }
      }
    }
  }

  shift = Matrix4.translate(
    dimensions[0] * -0.5,
    dimensions[1] * -0.5,
    dimensions[2] * -0.5,
  );
  console.log(shift.toString());
  makeBoxes(centers);
}

initialize();
