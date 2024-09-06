#version 300 es
// #extension GL_ARB_shading_language_include : require
// #include "./glitch.frag"

precision highp float;

in vec3 v_position;
in vec3 v_normal;
in vec2 v_uv;
in vec3 v_vertPos;
flat in vec3 v_vertStart;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;

out vec4 outColor;

struct Options {
  bool transparent;
  bool insideColor;
  // In screen space pixels (roughly), with x = horizontal edges and y =
  // vertical letter face edges
  vec2 thickness;
};

const Options options = Options(false, true, vec2(3.0, 5.0));

const float dashSize = 5.0;
const float gapSize = 5.0;

// vec3 stroke = uColor;
const vec3 fill = vec3(0.5, 0.5, 0.5);

float aastep(float threshold, float dist) {
  float afwidth = fwidth(dist);
  return smoothstep(threshold - afwidth, threshold + afwidth, dist);
}

vec4 getStyledWireframe(vec2 uv) {

  vec2 distVec = 1.0 - 2.0 * abs(uv - 0.5);

  // we can modify the distance field to create interesting effects & masking
  // float noiseOff = 0.0;
  // if (noiseA)
  //   noiseOff += noise(vec4(vPosition.xyz * 1.0, time * 0.35)) * 0.15;
  // if (noiseB)
  //   noiseOff += noise(vec4(vPosition.xyz * 80.0, time * 0.5)) * 0.12;
  // d += noiseOff;

  // for dashed rendering, we can use this to get the 0 .. 1 value of the line
  // length
  // float positionAlong = max(barycentric.x, barycentric.y);
  // if (barycentric.y < barycentric.x && barycentric.y < barycentric.z) {
  //   positionAlong = 1.0 - positionAlong;
  // }

  // the thickness of the stroke
  vec2 computedThickness = options.thickness.yx;

  // if we want to shrink the thickness toward the center of the line segment
  // if (squeeze) {
  //   computedThickness *=
  //       mix(squeezeMin, squeezeMax, (1.0 - sin(positionAlong * PI)));
  // }

  // here we offset the stroke position depending on whether it
  // should overlap or not
  // float offset = 1.0 / dashRepeats * dashLength / 2.0;
  // if (!dashOverlap) {
  //   offset += 1.0 / dashRepeats / 2.0;
  // }

  // offset += uTime * 0.22;

  // create the repeating dash pattern
  // float pattern = fract((positionAlong + offset) * dashRepeats);
  // computedThickness *= 1.0 - aastep(dashLength, pattern);
  // compute the anti-aliased stroke edge
  // float edge = 1.0 - aastep(computedThickness, d);

  // return vec4(edges, 0.0, 1.0);

  // vec2 gr = vec2(dFdx(v_uv), dFdy(v_uv));
  // vec2 gr = abs(dFdy(v_uv));
  vec3 len = abs(v_vertStart - v_position);
  float dist = max(max(len.g, len.b), len.r);

  // return vec4(v_normal, 1.0);
  // return vec4(vec3(step(0.5, fract(dist * 10.0))), 1.0);

  // This is cool
  // vec2 test = step(vec2(fract(uTime)), fract((v_uv / 3.0) * vec2(2.0)));

  // vec2 test = step(vec2(fract(uTime)), fract((v_uv / 3.0) * vec2(2.0)));
  // vec2 test = step(vec2(0.5), fract(( + uTime / 3.0) * vec2(2.0)));

  // float checker = mod(dot(vec2(1.0), test), 2.0);

  // return vec4(vec3(checker), 1.0);

  const float dashRepeats = 1.0;
  const float dashLength = 0.25;
  // here we offset the stroke position depending on whether it
  // should overlap or not
  float offset = 1.0 / dashRepeats * dashLength / 2.0;
  // if (!dashOverlap) {
  //   offset += 1.0 / dashRepeats / 2.0;
  // }

  offset += uTime * 0.12;

  // create the repeating dash pattern
  vec2 pattern = fract((v_position.yz + offset) * dashRepeats *
                       vec2(1.0, v_position.x - 3.0));
  // float pattern = fract((dot(v_normal, v_position) + offset) * dashRepeats);
  // return vec4(vec3(v_normal.x), 1.0);
  computedThickness *= step(0.5, pattern);

  vec2 deriv = fwidth(distVec);
  vec2 aaStep = smoothstep(vec2(0.0), computedThickness * deriv, distVec);
  float edge = 1.0 - min(aaStep.x, aaStep.y);
  vec2 edges = 1.0 - aaStep;

  // return vec4(vec3(aaStep.y), 1.0);

  // now compute the final color of the mesh
  vec4 outColor = vec4(0.0);
  if (options.transparent) {
    // outColor = vec4(uColor, edge);

    outColor = mix(vec4(0.1, 0.1, 0.1, 0.0), vec4(uColor, 1.0), edge);

    if (options.insideColor && !gl_FrontFacing) {
      outColor.rgb = fill;
    }
  } else {
    outColor = vec4(mix(vec3(0.0), uColor, edge), 1.0);
  }

  return outColor;
}

void main() {
  // vec4 test = getStyledWireframe(v_uv);
  // vec4 g = glitchEffect(uTime, gl_FragCoord.xy, uResolution);

  // outColor = mix(test, g, g.a);

  outColor = getStyledWireframe(v_uv);
}
