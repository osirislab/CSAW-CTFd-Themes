import {
    Renderer,
    Camera,
    Transform,
    Program,
    Mesh,
    RenderTarget,
    Triangle,
    Vec3,
} from "ogl";
import { autoResize } from "./canvas";
import * as THREE from "three"; 

import render_frag from "./rendertexture.frag";
import rect_vert from "./rect.vert";
import { Logo, initLogo } from "./logo-entity";

const renderer = new Renderer({
    antialias: false,
    alpha: true,
    dpr: window.devicePixelRatio,
    autoClear: true,
});
(renderer as any).outputEncoding = THREE.sRGBEncoding;;

const gl = renderer.gl;
const element = document.getElementById("3D");

element?.appendChild(gl.canvas);
gl.clearColor(0.0, 0.0, 0.0, 0.0);

const camera = new Camera(gl, { fov: 35 });
camera.position = [0, 1, 3];
camera.lookAt([0, 0, 0]);

const pixelWidth = 196;
const scale = 0.3;

const target = new RenderTarget(gl, {
    depthTexture: true,
    width: pixelWidth * 2,
    height: pixelWidth,
    magFilter: gl.NEAREST,
    premultiplyAlpha: true,
    format: gl.RGBA,
    internalFormat: gl.RGBA
});
autoResize(element!, renderer, (width: number, height: number) => {
    const aspect = width / height;
    camera.perspective({ aspect });
    scene.scale = new Vec3(scale * aspect);
    target.setSize(pixelWidth, pixelWidth / aspect);
});

const renderGeometry = new Triangle(gl);
const renderProgram = new Program(gl, {
    vertex: rect_vert,
    fragment: render_frag,
    uniforms: {
        t_color: { value: target.texture },
        t_depth: { value: target.depthTexture },
        u_resolution: { value: [target.width, target.height] }
    },
    transparent: true,
});

const renderMesh = new Mesh(gl, { geometry: renderGeometry, program: renderProgram });

const scene = new Transform();
let logo: Logo;

initLogo(gl, scene).then(l => {
    logo = l;
    requestAnimationFrame(update);
});


//TODO: Delta t?
function update(time: number) {
    requestAnimationFrame(update);

    logo.update(gl, time);

    // Set background for first render to target
    gl.clearColor(0, 0, 0, 0);

    // Add target property to render call
    renderer.render({ scene, camera, target });

    // Change to final background
    gl.clearColor(0, 0, 0, 0);

    renderer.render({ scene: renderMesh });
}
