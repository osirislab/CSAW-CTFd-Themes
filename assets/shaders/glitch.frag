#version 300 es
precision highp float;

uniform sampler2D tMap;
uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

// Based on https://www.shadertoy.com/view/XtyXzW

float time;

float _round(float n) { return floor(n + .5); }

vec2 _round(vec2 n) { return floor(n + .5); }

// --------------------------------------------------------
// Glitch core
// --------------------------------------------------------

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

const float glitchScale = .5;

vec2 glitchCoord(vec2 p, vec2 gridSize) {
  vec2 coord = floor(p / gridSize) * gridSize;
  coord += (gridSize / 2.);
  return coord;
}

struct GlitchSeed {
  vec2 seed;
  float prob;
};

float fBox2d(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

GlitchSeed glitchSeed(vec2 p, float speed) {
  float seedTime = floor(time * speed);
  vec2 seed =
      vec2(1. + mod(seedTime / 100., 100.), 1. + mod(seedTime, 100.)) / 100.;
  seed += p;

  float prob = texture(tMap, p).b;

  return GlitchSeed(seed, prob);
}

float shouldApply(GlitchSeed seed) {
  return round(
      mix(mix(rand(seed.seed), 1., seed.prob - .5), 0., (1. - seed.prob) * .5));
}

// --------------------------------------------------------
// Glitch effects
// --------------------------------------------------------

// Swap

vec4 swapCoords(vec2 seed, vec2 groupSize, vec2 subGrid, vec2 blockSize) {
  vec2 rand2 = vec2(rand(seed), rand(seed + .1));
  vec2 range = subGrid - (blockSize - 1.);
  vec2 coord = floor(rand2 * range) / subGrid;
  vec2 bottomLeft = coord * groupSize;
  vec2 realBlockSize = (groupSize / subGrid) * blockSize;
  vec2 topRight = bottomLeft + realBlockSize;
  topRight -= groupSize / 2.;
  bottomLeft -= groupSize / 2.;
  return vec4(bottomLeft, topRight);
}

float isInBlock(vec2 pos, vec4 block) {
  vec2 a = sign(pos - block.xy);
  vec2 b = sign(block.zw - pos);
  return min(sign(a.x + a.y + b.x + b.y - 3.), 0.);
}

vec2 moveDiff(vec2 pos, vec4 swapA, vec4 swapB) {
  vec2 diff = swapB.xy - swapA.xy;
  return diff * isInBlock(pos, swapA);
}

void swapBlocks(inout vec2 xy, vec2 groupSize, vec2 subGrid, vec2 blockSize,
                vec2 seed, float apply) {

  vec2 groupOffset = glitchCoord(xy, groupSize);
  vec2 pos = xy - groupOffset;

  vec2 seedA = seed * groupOffset;
  vec2 seedB = seed * (groupOffset + .1);

  vec4 swapA = swapCoords(seedA, groupSize, subGrid, blockSize);
  vec4 swapB = swapCoords(seedB, groupSize, subGrid, blockSize);

  vec2 newPos = pos;
  newPos += moveDiff(pos, swapA, swapB) * apply;
  newPos += moveDiff(pos, swapB, swapA) * apply;
  pos = newPos;

  xy = pos + groupOffset;
}

// Static

void staticNoise(inout vec2 p, vec2 groupSize, float grainSize,
                 float contrast) {
  GlitchSeed seedA = glitchSeed(glitchCoord(p, groupSize), 5.);
  seedA.prob *= .5;
  if (shouldApply(seedA) == 1.) {
    GlitchSeed seedB = glitchSeed(glitchCoord(p, vec2(grainSize)), 5.);
    vec2 offset = vec2(rand(seedB.seed), rand(seedB.seed + .1));
    offset = round(offset * 2. - 1.);
    offset *= contrast;
    p += offset;
  }
}

// --------------------------------------------------------
// Glitch compositions
// --------------------------------------------------------

void glitchSwap(inout vec2 p) {

  vec2 pp = p;

  float scale = glitchScale;
  float speed = 5.;

  vec2 groupSize;
  vec2 subGrid;
  vec2 blockSize;
  GlitchSeed seed;
  float apply;

  groupSize = vec2(.8) * scale;
  subGrid = vec2(2);
  blockSize = vec2(1);

  seed = glitchSeed(glitchCoord(p, groupSize), speed);
  apply = shouldApply(seed);
  swapBlocks(p, groupSize, subGrid, blockSize, seed.seed, apply);

  groupSize = vec2(.8) * scale;
  subGrid = vec2(3);
  blockSize = vec2(1);

  seed = glitchSeed(glitchCoord(p, groupSize), speed);
  apply = shouldApply(seed);
  swapBlocks(p, groupSize, subGrid, blockSize, seed.seed, apply);

  groupSize = vec2(.2) * scale;
  subGrid = vec2(6);
  blockSize = vec2(1);

  seed = glitchSeed(glitchCoord(p, groupSize), speed);
  float apply2 = shouldApply(seed);
  swapBlocks(p, groupSize, subGrid, blockSize, (seed.seed + 1.),
             apply * apply2);
  swapBlocks(p, groupSize, subGrid, blockSize, (seed.seed + 2.),
             apply * apply2);
  swapBlocks(p, groupSize, subGrid, blockSize, (seed.seed + 3.),
             apply * apply2);
  swapBlocks(p, groupSize, subGrid, blockSize, (seed.seed + 4.),
             apply * apply2);
  swapBlocks(p, groupSize, subGrid, blockSize, (seed.seed + 5.),
             apply * apply2);

  groupSize = vec2(1.2, .2) * scale;
  subGrid = vec2(9, 2);
  blockSize = vec2(3, 1);

  seed = glitchSeed(glitchCoord(p, groupSize), speed);
  apply = shouldApply(seed);
  swapBlocks(p, groupSize, subGrid, blockSize, seed.seed, apply);
}

void glitchStatic(inout vec2 p) {

  // Static
  //staticNoise(p, vec2(.25, .25 / 2.) * glitchScale, .005, 5.);

  // 8-bit
  staticNoise(p, vec2(.5, .25 / 2.) * glitchScale, .2 * glitchScale, 2.);
}

float glitchTime(vec2 p, float inTime) {
  const float speed = 5.0;
  vec2 groupSize = vec2(0.5 * glitchScale);

  GlitchSeed seed = glitchSeed(glitchCoord(p, groupSize), speed);
  // seed.prob *= .5;
  if (shouldApply(seed) == 1.) {
    float frozenTime = floor(inTime * speed) / speed;
    inTime = frozenTime;
  }
  return inTime;
}

float glitchColor(vec2 p) {
  vec2 groupSize = vec2(.75, .125) * glitchScale;
  vec2 subGrid = vec2(0, 6);
  float speed = 5.;
  GlitchSeed seed = glitchSeed(glitchCoord(p, groupSize), speed);
  seed.prob *= .3;
  if (shouldApply(seed) == 1.) {
    vec2 co = mod(p, groupSize) / groupSize;
    co *= subGrid;
    float a = max(co.x, co.y);
    // color.rgb *= vec3(
    //   min(floor(mod(a - 0., 3.)), 1.),
    //     min(floor(mod(a - 1., 3.)), 1.),
    //     min(floor(mod(a - 2., 3.)), 1.)
    //);

    return min(floor(mod(a, 2.)), 1.) * 10.;

    // return vec4(vec3(min(floor(mod(a, 2.)), 1.) * 10.), 1.0);
  }
  return 1.0;
}

vec4 glitchEffect(float intime, vec2 p) {
  time = fract(intime);

  // vec2 p = fragCoord.xy / resolution.xy;

  // const float range = 0.05;
  // float height = fragCoord.y / resolution.y;
  // float band = step(height - range, time) * step(time, height + range);

  // float prob = glitchSeed(p, 10.).prob;
  // return = vec4(vec3(band), 1.0);

  float mul = 1.0;
  vec4 color;

  // if (band == 1.0) {
  if (fract(time) < 0.4) {
    glitchSwap(p);
    time = glitchTime(p, time);
    glitchStatic(p);
    mul = glitchColor(p);
  }

  color = texture(tMap, p);
  color.rgb *= mul;

  // color = mix(a, vec3(1.0, 0.0, 0.0), pos.y * time);

  return color;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 glitched = glitchEffect(uTime, uv);
  // vec4 glitched = vec4(1.0);

  // Chromatic Abberation Effect
  float amount = 0.0;

  amount = (1.0 + sin(uTime * 6.0)) * 0.5;
  amount *= 1.0 + sin(uTime * 16.0) * 0.5;
  amount *= 1.0 + sin(uTime * 19.0) * 0.5;
  amount *= 1.0 + sin(uTime * 27.0) * 0.5;
  // amount = pow(amount, 3.0);

  amount *= 0.001;

  vec3 col;
  col.r = texture(tMap, vec2(uv.x + amount, uv.y)).r;
  col.g = texture(tMap, uv).g;
  col.b = texture(tMap, vec2(uv.x - amount, uv.y)).b;

  col *= (1.0 - amount * 0.5);

  outColor = glitched * vec4(col, 1.0);
}
