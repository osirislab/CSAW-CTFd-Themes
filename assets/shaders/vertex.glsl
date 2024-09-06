#version 300 es

in vec3 position;
// in vec3 normal;
// in vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// out vec3 v_normal;
out vec3 v_position;
// out vec2 v_uv;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  // v_normal = normalize(normal);
  v_position = position;
  // v_uv = uv;
}
