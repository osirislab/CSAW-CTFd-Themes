import { OGLRenderingContext } from "ogl";

export class MouseTracker {

    // Initialize variable to store scaled mouse coordinates.
    mouse = {
        x: 0,
        y: 0
    }

    // Element that references the entire page
    page: HTMLElement;
    canvas: HTMLCanvasElement;

    offset: {
        x: number,
        y: number
    }

    constructor(gl: OGLRenderingContext) {

        // Get a reference to the HTML element we want to track mouse movement on.
        this.page = document.documentElement;
        this.canvas = gl.canvas;

        // Get the position of the canvas
        const rect = this.canvas.getBoundingClientRect();
        // Find the midpoint of the canvas then the offset from the centre of the page
        this.offset = {
            x: (rect.right - rect.width / 2) - this.page.clientWidth / 2,
            y: (rect.bottom - rect.height / 2) - this.page.clientHeight / 2,
        }

        // Add a mousemove event listener to the element.
        // Arrow function used to lexically bind 'this', see https://stackoverflow.com/a/32894019
        this.page.addEventListener('mousemove', (e) => {
            this.setMouse(e.clientX, e.clientY)
        }, false);

        this.page.addEventListener("touchmove", (e) => {
            const lastTouch = e.touches[e.touches.length - 1];
            this.setMouse(lastTouch.clientX, lastTouch.clientY)
        }, false);
    }

    private setMouse(x, y) {
        // Calculate the scaled coordinates between -1 and 1.
        this.mouse.x = ((x - this.offset.x) / this.page.clientWidth) * 2 - 1;
        this.mouse.y = ((y - this.offset.y) / this.page.clientHeight) * -2 + 1; // Invert the Y-axis for -1 at the bottom.
    }

    getRotation(): {x: number, y: number} {
        // Yes, this is correct, because x and y here refer to the angle axes
        const x = Math.asin(-1 * this.mouse.y);
        const y = Math.asin(this.mouse.x);
        return {x, y};
    }
}
