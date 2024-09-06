import { OGLRenderingContext, Transform } from "ogl";

type SetupFnType<T> = (gl: OGLRenderingContext, ...rest: any) => T;
type UpdateFnType<T> = (gl: OGLRenderingContext, obj: T, deltaT: number, ...rest: any) => void;

export abstract class Entity<T extends Transform> {
    transform: T;

    constructor(transform: T, parent: Transform) {
        this.transform = transform;
        this.transform.setParent(parent);
    }

   abstract update(gl: OGLRenderingContext, deltaT: number): void;
   abstract update(gl: OGLRenderingContext, time: number): void;
}
