import {
    Post,
    Renderer,
    Camera,
    Transform,
    Program,
    GLTFLoader,
    Vec2,
    Vec4,
    Euler,
    RendererSortable,
    Vec3,
} from "ogl";

import { autoResize } from "./canvas"

import solid_frag from "../../shaders/solid.frag";
import vertex from "../../shaders/vertex.glsl";
import outline_frag from "../../shaders/outline.frag";
import outlineVert from "../../shaders/outline.vert";
import glitchEffect from "../../shaders/glitch.frag";
import postVert from "../../shaders/post.vert";
import { MouseTracker } from "./mouse";

function degrees(...angles: number[]): number[] {
    return angles.map(r => (r * Math.PI) / 180);
}

const renderer = new Renderer({
    antialias: true,
    alpha: true,
    dpr: window.devicePixelRatio,
    autoClear: true,
});

const gl = renderer.gl;
const el = document.getElementById("3D");
el?.appendChild(gl.canvas);
gl.clearColor(1.0, 1.0, 1.0, 0.0);
// gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);

const post = new Post(gl);

const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new Vec2(gl.canvas.width, gl.canvas.height) },
};

const camera = new Camera(gl);
camera.position.set(0, 0, 2.5);

const tracker = new MouseTracker();

const scale = 0.5;

autoResize(el!, renderer, (width: number, height: number) => {
    const aspect = width / height;
    // camera.perspective({ aspect });

    camera.orthographic({
        zoom: 1.2 * aspect / 2,
        left: -1 * aspect,
        right: 1 * aspect,
        bottom: -1,
        top: 1,
        near: 0.01,
        far: 1000,
    });

    post.resize();
    uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);

    // scene.scale = new Vec3(scale * aspect);
});


// TODO: do this 'properly'
// function resize() {
// renderer.setSize(el?.clientWidth!, el?.clientHeight!);
// post.resize();
// uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);
// const aspect = gl.canvas.width / gl.canvas.height;
// camera.perspective({
// aspect: gl.canvas.width / gl.canvas.height,
// });
// camera.orthographic({
// zoom: 1.2 * aspect / 2,
// left: -1 * aspect,
// right: 1 * aspect,
// bottom: -1,
// top: 1,
// near: 0.01,
// far: 1000,
// });
// }

// window.addEventListener("resize", resize, false);
// resize();

const scene = new Transform();

const solid = (color: Vec4) =>
    new Program(gl, {
        vertex: vertex,
        fragment: solid_frag,
        uniforms: {
            uColor: { value: color },
        },
        transparent: true,
        cullFace: false,
    });

const outlineProgram = (color: Vec3) =>
    new Program(gl, {
        vertex: outlineVert,
        fragment: outline_frag,
        uniforms: {
            uTime: uniforms.uTime,
            uResolution: uniforms.uResolution,
            uColor: { value: color },
        },
        transparent: true,
        cullFace: false,
    });

const faceTransparency = 0.7;
const purpleColor = new Vec4(87.0 / 255.0, 6.0 / 255.0, 140.0 / 255.0, faceTransparency);
const tealColor = new Vec4(0.0 / 255.0, 155.0 / 255.0, 138.0 / 255.0, faceTransparency);

let sides: any;
let faces: any;

async function loadInitial() {
    const modelPath = "/themes/CSAW-CTFd-Themes/static/img/test3.glb";
    // const modelPath = "/themes/CSAW-CTFd-Themes/static/img/osiris-logo-csaw-theme.glb";
    // const modelPath = "/themes/CSAW-CTFd-Themes/static/img/csaw2.glb";
    // const modelPath = "assets/img/csaw2.glb";
    const gltf = await GLTFLoader.load(gl, modelPath);
    // console.log(gltf);

    sides = gltf.scene.find((s: any) => s.name === "Sides");
    faces = gltf.scene.find((s: any) => s.name === "Faces");

    // TODO: abstract these two functions into one common function
    const setFacesProgram = (searchString: string, color: Vec4) => {
        const meshes: Transform[] = faces.children.find((s: { name: string; }) => s.name === searchString).children.reduce((acc: any[], cur) => acc.concat(cur.children), []);

        meshes.forEach(
            m => (m.children[0] as RendererSortable).program = solid(color)
        );
    }

    setFacesProgram("Top", purpleColor);
    setFacesProgram("Bottom", tealColor);

    const setSidesProgram = (searchString: string, color: Vec4) => {
        const meshes: Transform[] = sides.children.find((s: { name: string; }) => s.name === searchString).children;

        meshes.forEach(
            m => (m.children[0] as RendererSortable).program = outlineProgram(new Vec3(color.x, color.y, color.z))
        );
    }

    setSidesProgram("SidesTop", purpleColor);
    setSidesProgram("SidesBottom", tealColor);

    sides.setParent(scene);
    faces.setParent(scene);

    requestAnimationFrame(update);
}

loadInitial();

// const controls = new Orbit(camera);
// const grid = new GridHelper(gl, { size: 10, divisions: 10 });
// grid.position.y = -0.001; // shift down a little to avoid z-fighting with axes helper
// grid.setParent(scene);

// const axes = new AxesHelper(gl, { size: 6, symmetric: true });
// axes.setParent(scene);

// camera.position.set(-1.5, 0.35, 2.5);
// camera.rotation.set(new Euler(...degrees(-10, -30, 0)));

// scene.rotation.set(new Euler(...degrees(8.5, 22.3, 3)));
// scene.position.set(0, -0.1, -0.3);

// ["x", "y", "z"].forEach(id =>
//   document.getElementById(id)?.addEventListener("input", setRot)
// );

// function setRot(ev: Event): void {
//   scene.rotation[ev.target.id] = degrees(ev.target.value)[0];
//   console.log(radians(...scene.rotation.toArray()));
// }

const pass = post.addPass({
    vertex: postVert,
    fragment: glitchEffect,
    uniforms: uniforms,
    enabled: true,
});

// console.log(pass);

function update(time: number) {
    requestAnimationFrame(update);
    uniforms.uTime.value = time * 0.001;

    // scene.rotation.y -= 0.002;
    // For some reason this doesn't work when setting the Euler object directly
    const rot = tracker.getRotation();
    scene.rotation.x = rot.x;
    scene.rotation.y = rot.y;
    // mesh.rotation.x += 0.03;
    // console.log(camera.position);
    // console.log(camera.rotation.x + " " + camera.rotation.y + " " + camera.rotation.z);
    // controls.update();
    post.render({ scene, camera, sort: false });
}