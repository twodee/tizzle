const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

function render() {
  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

async function initialize() {
  window.addEventListener('resize', onSizeChanged);
  onSizeChanged();
}

initialize();