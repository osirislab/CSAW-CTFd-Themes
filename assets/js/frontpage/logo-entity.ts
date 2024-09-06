import { GLTFLoader, OGLRenderingContext, Program, Transform } from "ogl";
import { Entity } from "./entity";
import { MouseTracker } from "./mouse";

import BlinnPhongVert from "./blinn-phong.vert";
import BlinnPhongFrag from "./blinn-phong.frag";

type GLTF = Awaited<ReturnType<typeof GLTFLoader.load>>;

export async function initLogo(gl: OGLRenderingContext, parent: Transform): Promise<Logo> {
    const modelPath = "/themes/csaw23-theme/static/img/csaw-logo.glb";
    // const modelPath = "assets/img/csaw-logo.glb";
    const gltf = await GLTFLoader.load(gl, modelPath);
    return new Logo(gl, gltf, parent);
}


export class Logo extends Entity<Transform> {
    tracker: MouseTracker;

    constructor(gl: OGLRenderingContext, gltf: GLTF, parent: Transform) {
        const centre = gltf.scene[0];
        centre.position.set(0, 0, 0);

        const solid = (colour: number[]) =>
            new Program(gl, {
                vertex: BlinnPhongVert,
                fragment: BlinnPhongFrag,
                uniforms: {
                    u_colour: { value: colour },
                },
                transparent: true,
                cullFace: false,
            });

        const purpleProgram = solid([0.341, 0.024, 0.549, 1]);
        const tealProgram = solid([0, 0.6078, 0.5412, 1]);

        for (let i = 0; i < centre.children.length; i++) {
            const letter = centre.children[i];

            letter.children[0].program = (i % 2 == 0) ? purpleProgram : tealProgram;
        }

        super(centre, parent);
        this.tracker = new MouseTracker(gl);
    }

    update(gl: OGLRenderingContext, time: number): void {
        for (const letter of this.transform.children) {
            letter.position.y = Math.sin(time / 500 + letter.position.x * 2) * 0.1;
        }

        // For some reason this doesn't work when setting the Euler object directly
        const rot = this.tracker.getRotation();
        this.transform.rotation.x = rot.x;
        this.transform.rotation.y = rot.y;
    }

}
