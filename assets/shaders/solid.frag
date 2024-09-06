#version 300 es
precision highp float;

in vec3 v_position;
// in vec3 v_normal;
// in vec2 v_uv;

uniform vec4 uColor;

out vec4 outColor;

void main() { outColor = uColor; }
