// https://github.com/matt-way/gifuct-js
import {parseGIF, decompressFrames} from 'gifuct-js';

import {VertexAttributes} from "./twodeejs/vertex-attributes";
import {VertexArray} from "./twodeejs/vertex-array";
import {ShaderProgram} from "./twodeejs/shader-program";
import {Matrix4} from "./twodeejs/matrix";
import {Vector2} from "./twodeejs/vector";
import {Trackball} from "./twodeejs/trackball";

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shader;
let vertexArray;
let clipFromEye;
let trackball;
let dimensions;
let centerer;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);

  shader.bind();
  vertexArray.bind();
  shader.setUniformMatrix4("clipFromEye", clipFromEye);
  shader.setUniformMatrix4("worldFromModel", trackball.rotation.multiplyMatrix(centerer));
  vertexArray.drawIndexed(gl.TRIANGLES);
  vertexArray.unbind();
  shader.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const aspect = canvas.width / canvas.height;
  const size = Math.max(...dimensions) * 0.5;
  if (aspect >= 1) {
    clipFromEye = Matrix4.ortho(-size * aspect, size * aspect, -size, size, -100, 100);
  } else {
    clipFromEye = Matrix4.ortho(-size, size, -size / aspect, size / aspect, -100, 100);
  }
  trackball.setViewport(canvas.width, canvas.height);
  render();
}

function makeBox(x, y, z, rgb, mesh, index) {
  const b = mesh.positions.length / 3;

  const vi = index * 24 * 3;
  console.log("vi:", vi);

  mesh.positions[vi +  0 * 3 + 0] = -0.5 + x; mesh.positions[vi +  0 * 3 + 1] = -0.5 + y; mesh.positions[vi +  0 * 3 + 2] =  0.5 + z, // Front
  mesh.positions[vi +  1 * 3 + 0] =  0.5 + x; mesh.positions[vi +  1 * 3 + 1] = -0.5 + y; mesh.positions[vi +  1 * 3 + 2] =  0.5 + z,
  mesh.positions[vi +  2 * 3 + 0] = -0.5 + x; mesh.positions[vi +  2 * 3 + 1] =  0.5 + y; mesh.positions[vi +  2 * 3 + 2] =  0.5 + z,
  mesh.positions[vi +  3 * 3 + 0] =  0.5 + x; mesh.positions[vi +  3 * 3 + 1] =  0.5 + y; mesh.positions[vi +  3 * 3 + 2] =  0.5 + z,
  mesh.positions[vi +  4 * 3 + 0] = -0.5 + x; mesh.positions[vi +  4 * 3 + 1] =  0.5 + y; mesh.positions[vi +  4 * 3 + 2] =  0.5 + z, // Top
  mesh.positions[vi +  5 * 3 + 0] =  0.5 + x; mesh.positions[vi +  5 * 3 + 1] =  0.5 + y; mesh.positions[vi +  5 * 3 + 2] =  0.5 + z,
  mesh.positions[vi +  6 * 3 + 0] = -0.5 + x; mesh.positions[vi +  6 * 3 + 1] =  0.5 + y; mesh.positions[vi +  6 * 3 + 2] = -0.5 + z,
  mesh.positions[vi +  7 * 3 + 0] =  0.5 + x; mesh.positions[vi +  7 * 3 + 1] =  0.5 + y; mesh.positions[vi +  7 * 3 + 2] = -0.5 + z,
  mesh.positions[vi +  8 * 3 + 0] =  0.5 + x; mesh.positions[vi +  8 * 3 + 1] = -0.5 + y; mesh.positions[vi +  8 * 3 + 2] = -0.5 + z, // Back
  mesh.positions[vi +  9 * 3 + 0] = -0.5 + x; mesh.positions[vi +  9 * 3 + 1] = -0.5 + y; mesh.positions[vi +  9 * 3 + 2] = -0.5 + z,
  mesh.positions[vi + 10 * 3 + 0] =  0.5 + x; mesh.positions[vi + 10 * 3 + 1] =  0.5 + y; mesh.positions[vi + 10 * 3 + 2] = -0.5 + z,
  mesh.positions[vi + 11 * 3 + 0] = -0.5 + x; mesh.positions[vi + 11 * 3 + 1] =  0.5 + y; mesh.positions[vi + 11 * 3 + 2] = -0.5 + z,
  mesh.positions[vi + 12 * 3 + 0] = -0.5 + x; mesh.positions[vi + 12 * 3 + 1] = -0.5 + y; mesh.positions[vi + 12 * 3 + 2] = -0.5 + z, // Bottom
  mesh.positions[vi + 13 * 3 + 0] =  0.5 + x; mesh.positions[vi + 13 * 3 + 1] = -0.5 + y; mesh.positions[vi + 13 * 3 + 2] = -0.5 + z,
  mesh.positions[vi + 14 * 3 + 0] = -0.5 + x; mesh.positions[vi + 14 * 3 + 1] = -0.5 + y; mesh.positions[vi + 14 * 3 + 2] =  0.5 + z,
  mesh.positions[vi + 15 * 3 + 0] =  0.5 + x; mesh.positions[vi + 15 * 3 + 1] = -0.5 + y; mesh.positions[vi + 15 * 3 + 2] =  0.5 + z,
  mesh.positions[vi + 16 * 3 + 0] =  0.5 + x; mesh.positions[vi + 16 * 3 + 1] =  0.5 + y; mesh.positions[vi + 16 * 3 + 2] = -0.5 + z, // Right
  mesh.positions[vi + 17 * 3 + 0] =  0.5 + x; mesh.positions[vi + 17 * 3 + 1] = -0.5 + y; mesh.positions[vi + 17 * 3 + 2] = -0.5 + z,
  mesh.positions[vi + 18 * 3 + 0] =  0.5 + x; mesh.positions[vi + 18 * 3 + 1] =  0.5 + y; mesh.positions[vi + 18 * 3 + 2] =  0.5 + z,
  mesh.positions[vi + 19 * 3 + 0] =  0.5 + x; mesh.positions[vi + 19 * 3 + 1] = -0.5 + y; mesh.positions[vi + 19 * 3 + 2] =  0.5 + z,
  mesh.positions[vi + 20 * 3 + 0] = -0.5 + x; mesh.positions[vi + 20 * 3 + 1] =  0.5 + y; mesh.positions[vi + 20 * 3 + 2] = -0.5 + z, // Left
  mesh.positions[vi + 21 * 3 + 0] = -0.5 + x; mesh.positions[vi + 21 * 3 + 1] = -0.5 + y; mesh.positions[vi + 21 * 3 + 2] = -0.5 + z,
  mesh.positions[vi + 22 * 3 + 0] = -0.5 + x; mesh.positions[vi + 22 * 3 + 1] =  0.5 + y; mesh.positions[vi + 22 * 3 + 2] =  0.5 + z,
  mesh.positions[vi + 23 * 3 + 0] = -0.5 + x; mesh.positions[vi + 23 * 3 + 1] = -0.5 + y; mesh.positions[vi + 23 * 3 + 2] =  0.5 + z,

  // mesh.positions.push(
    // -0.5 + x, -0.5 + y,  0.5 + z, // Front
     // 0.5 + x, -0.5 + y,  0.5 + z,
    // -0.5 + x,  0.5 + y,  0.5 + z,
     // 0.5 + x,  0.5 + y,  0.5 + z,
    // -0.5 + x,  0.5 + y,  0.5 + z, // Top
     // 0.5 + x,  0.5 + y,  0.5 + z,
    // -0.5 + x,  0.5 + y, -0.5 + z,
     // 0.5 + x,  0.5 + y, -0.5 + z,
     // 0.5 + x, -0.5 + y, -0.5 + z, // Back
    // -0.5 + x, -0.5 + y, -0.5 + z,
     // 0.5 + x,  0.5 + y, -0.5 + z,
    // -0.5 + x,  0.5 + y, -0.5 + z,
    // -0.5 + x, -0.5 + y, -0.5 + z, // Bottom
     // 0.5 + x, -0.5 + y, -0.5 + z,
    // -0.5 + x, -0.5 + y,  0.5 + z,
     // 0.5 + x, -0.5 + y,  0.5 + z,
     // 0.5 + x,  0.5 + y, -0.5 + z, // Right
     // 0.5 + x, -0.5 + y, -0.5 + z,
     // 0.5 + x,  0.5 + y,  0.5 + z,
     // 0.5 + x, -0.5 + y,  0.5 + z,
    // -0.5 + x,  0.5 + y, -0.5 + z, // Left
    // -0.5 + x, -0.5 + y, -0.5 + z,
    // -0.5 + x,  0.5 + y,  0.5 + z,
    // -0.5 + x, -0.5 + y,  0.5 + z,
  // );

  mesh.normals.push(
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
  );

  for (let i = 0; i < 24; i = i + 1) {
    mesh.colors.push(...rgb);
  }

  mesh.faces.push(
    b +  0, b +  1, b +  2,
    b +  1, b +  3, b +  2,
    b +  4, b +  5, b +  6,
    b +  5, b +  7, b +  6,
    b +  8, b +  9, b + 10,
    b +  9, b + 11, b + 10,
    b + 12, b + 13, b + 14,
    b + 13, b + 15, b + 14,
    b + 16, b + 17, b + 18,
    b + 17, b + 19, b + 18,
    b + 20, b + 21, b + 22,
    b + 21, b + 23, b + 22,
  );
}

function makeBoxes(centers) {
  // const centers = [
  //   [0, 0, 0, [1, .5, .7]],
  //   [1, 1, 1, [.7, 1, .5]],
  //   [-1, -1, -1, [0.188, 0.835, 0.784]]
  // ];

  const nvoxels = dimensions[0] * dimensions[1] * dimensions[2];
  console.log("nvoxels:", nvoxels);

  let mesh = {
    positions: new Array(nvoxels * 3 * 24),
    normals: [],
    colors: [],
    faces: [],
  };

  for (let [i, center] of centers.entries()) {
    console.log("i:", i);
    const box = makeBox(center[0], center[1], center[2], center[3], mesh, i);
    // const offset = positions.length / 3;

    // console.log("a:", a);
    // positions = positions.concat(box.positions);
    // normals = normals.concat(box.normals);
    // colors = colors.concat(box.colors);
    // faces = faces.concat(box.faces.map(i => i + offset));

    // positions.push(...box.positions);
    // normals.push(...box.normals);
    // colors.push(...box.colors);
    // faces.push(...box.faces.map(i => i + offset));
  }

  const attributes = new VertexAttributes();
  attributes.addAttribute("position", 72, 3, mesh.positions);
  attributes.addAttribute("normal", 72, 3, mesh.normals);
  attributes.addAttribute("color", 72, 3, mesh.colors);

  attributes.addIndices(mesh.faces);

  vertexArray = new VertexArray(shader, attributes);
}

async function initialize() {
  trackball = new Trackball();

  const vertexSource = `
uniform mat4 clipFromEye;
uniform mat4 worldFromModel;
in vec3 position;
in vec3 normal;
in vec3 color;

out vec3 fnormal;
out vec3 albedo;

void main() {
  gl_Position = clipFromEye * worldFromModel * vec4(position, 1.0);
  fnormal = (worldFromModel * vec4(normal, 0.0)).xyz;
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
  // await loadGif('sword.gif');

  window.addEventListener('resize', onSizeChanged);
  onSizeChanged();

  window.addEventListener('mousedown', event => {
    trackball.start(new Vector2(event.clientX, canvas.height - event.clientY));
  });

  window.addEventListener('mousemove', event => {
    if (event.buttons !== 0) {
      trackball.drag(new Vector2(event.clientX, canvas.height - event.clientY), 4);
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

  centerer = Matrix4.translate(
    dimensions[0] * -0.5,
    dimensions[1] * -0.5,
    dimensions[2] * -0.5,
  );

  console.log(centers.length);
  console.log(dimensions);
  makeBoxes(centers);
}

initialize();
