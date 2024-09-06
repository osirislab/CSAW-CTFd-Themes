#version 300 es
precision highp float;

uniform sampler2D tMap;
uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

const float width = 0.001;
const float strength = 0.5;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  float amount = 0.0;

  amount = (1.0 + sin(uTime * 6.0)) * 0.5;
  amount *= 1.0 + sin(uTime * 16.0) * 0.5;
  amount *= 1.0 + sin(uTime * 19.0) * 0.5;
  amount *= 1.0 + sin(uTime * 27.0) * 0.5;
  // amount = pow(amount, 3.0);

  amount *= width;
  
  vec4 orig = texture(tMap, uv);

  vec4 col;
  col.r = texture(tMap, vec2(uv.x + amount, uv.y)).r;
  col.g = orig.g;
  col.b = texture(tMap, vec2(uv.x - amount, uv.y)).b;
  col.a = orig.a;

  outColor = mix(col, orig, 1.0 - strength);
}