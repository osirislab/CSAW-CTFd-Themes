const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export class MouseTracker {

    // Initialize variable to store scaled mouse coordinates.
    mouse = {
        x: 0,
        y: 0
    }

    // Element that references the entire page
    page: HTMLElement;

    constructor() {

        // Get a reference to the HTML element we want to track mouse movement on.
        this.page = document.documentElement;

        // Add a mousemove event listener to the element.
        // Arrow function used to lexically bind 'this', see https://stackoverflow.com/a/32894019
        this.page.addEventListener("mousemove", (e) => {
            this.setMouse(e.clientX, e.clientY)
        }, false);

        this.page.addEventListener("touchmove", (e) => {
            const lastTouch = e.touches[e.touches.length - 1];
            this.setMouse(lastTouch.clientX, lastTouch.clientY)
        }, false);
    }

    private setMouse(x: number, y: number) {
        // Calculate the scaled coordinates between -1 and 1.
        this.mouse.x = clamp((x / this.page.clientWidth) * 2 - 1, -1, 1);
        this.mouse.y = clamp((y / this.page.clientHeight) * -2 + 1, -1, 1); // Invert the Y-axis for -1 at the bottom.
    }

    getRotation(): { x: number, y: number } {
        // Yes, this is correct, because x and y here refer to the angle axes
        const x = Math.asin(-1 * this.mouse.y);
        const y = Math.asin(this.mouse.x);
        return { x, y };
    }
}