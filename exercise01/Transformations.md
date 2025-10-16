# Exercise 01: Transformations

This tutorial will guide you through the process of creating a simple, interactive 3D wireframe renderer in a web browser using JavaScript and an HTML canvas. We will start with the basics of drawing a line and progressively build up to a complete 3D scene with camera controls.

## Step 1: Setting Up the HTML and Canvas

First, we need a basic HTML structure to hold our canvas, which will be our drawing surface.

1.  Create a new HTML file.
2.  Add the standard HTML boilerplate (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`).
3.  Inside the `<body>`, add a `<h2>` title and a `<canvas>` element. Give the canvas an `id`, `width`, and `height`.
4.  Add a `<style>` block in the `<head>` to set up the page layout.
5.  Finally, create an empty `<script>` tag at the end of the `<body>`. This is where all our rendering logic will go.

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Computergraphics - Exercise 01</title>
        <style>
            body {
                font-family: sans-serif;
                text-align: center;
                background-color: aliceblue;
            }

            canvas {
                background: #fff;
                display: block;
                margin: 30px auto;
            }
        </style>
    </head>

    <body>
        <h2>Exercise 01 - Transformations</h2>
        <canvas id="canvas" width="1280" height="720"></canvas>
        <script>
            // We need the canvas object - and yes, it is 2D :)
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
 
            // All our JavaScript will go here...
        </script>
    </body>
</html>
```

***

## Step 2: Drawing a Simple Line (The Naive Way)

Let's start by drawing a single line. We'll create a simple function that calculates points along a line using the `y = mx + b` formula. This method has flaws (it doesn't handle vertical lines or steep slopes well and relies on floating-point math), but it's a good starting point.

1.  Inside the `<script>` tag, add the `drawLine` function.
2.  Add a call to the function to draw a line on the canvas.

```javascript
            // ***
            // *** Naive Line (just for demonstration purposes)
            // ***
            function drawLine(x0, y0, x1, y1, ctx) {
                let x, m, y;
                m = (y1 - y0) / (x1 - x0)
                for (x = x0; x <= x1; ++x) {
                    y = m * (x - x0) + y0 
                    ctx.fillRect(x, y, 1, 1);
                }
            }
            
            // Set a drawing color and draw a test line
            ctx.fillStyle = "#111";
            drawLine(100, 200, 150, 450, ctx);
```

At this point, you should see a single, slightly jagged line on your canvas.

## Step 3: A Better Line with Bresenham's Algorithm

The Bresenham algorithm is a highly efficient method for drawing lines that uses only integer arithmetic, making it much faster and more accurate for raster graphics.

1.  Add the `drawLineBresenham` function to your script.
2.  Comment out or remove the call to `drawLine` and replace it with a call to `drawLineBresenham` to see the improved result.

```javascript
            // ***
            // *** Bresenham-/Midpoint Algorithm
            // ***
            function drawLineBresenham(x0, y0, x1, y1, ctx) {
                let dx =  Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
                let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
                let err = dx + dy;
                while (true) {
                    ctx.fillRect(x0, y0, 1, 1); // Draw pixel
                    if (x0 === x1 && y0 === y1) break;
                    let e2 = 2 * err;
                    if (e2 >= dy) { err += dy; x0 += sx; }
                    if (e2 <= dx) { err += dx; y0 += sy; }
                }
            }

            // Clear the canvas before drawing the new line
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#111";
            // drawLine(100, 200, 150, 450, ctx); // Example of drawing a line
            drawLineBresenham(100, 200, 150, 450, ctx);
```

## Step 4: Vectors and Matrices

Now we enter a longer section where we will build the mathematical tools for 3D graphics. **You will not see any changes on the canvas during this step**, but this code is the essential foundation for everything that follows.

As detailed in the lecture slides, vectors are used to represent positions and directions, while matrices are used to perform transformations like translation, rotation, and scaling.

1.  **Create the `Vec3` Class**: This class will handle 3D vectors and their common operations.

    ```javascript
    // ***
    // *** Vector class for 3D points with basic vector functions (JavaScript does not support operator overloading) 
    // ***
    class Vec3 {
        // Constructor: Creates a new 3D vector with components x, y, z
        constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
        // Converts the vector to an array with homogeneous coordinates in the form [x, y, z, w]
        toArray(w = 1) { return [this.x, this.y, this.z, w]; }
        // Creates a Vec3 from an array [x, y, z, w]
        static fromArray(arr) { let w = arr[3] !== 0 ? arr[3] : 1; return new Vec3(arr[0] / w, arr[1] / w, arr[2] / w); }
        // Adds another vector to this one (this + v)
        add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
        // Subtracts another vector from this one (this - v)
        subtract(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
        // Multiplies the vector by a scalar (this * s)
        multiply(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }
        // The cross product yields a vector orthogonal to both input vectors
        cross(v) { return new Vec3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x); }
        // The dot product yields a value that represents the angle and length of both vectors
        dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
        // Returns the length (magnitude) of the vector
        length() { return Math.hypot(this.x, this.y, this.z); }
        // Returns the normalized vector (same direction, but length 1)
        normalize() { const len = this.length(); if (len === 0) return new Vec3(0, 0, 0); return this.multiply(1 / len); }
    }
    ```

2.  **Create the `Mat4` Class**: This class will manage our 4x4 transformation matrices. We use 4x4 matrices to work with homogeneous coordinates, which allow us to perform all transformations (including translation) with a single matrix multiplication (see slides 26-28). Note that this implementation uses a **column-major** layout, which is common for graphics APIs like OpenGL.

    ```javascript
    // ***
    // *** 4x4 matrix class for transformations (column-major) 
    // ***
    class Mat4 {
        // Constructor: Creates a matrix from an array (16 values) or as an identity matrix
        constructor(values) {
            this.m = values || Mat4.identity();
        }
        // Returns the identity matrix (no transformation)
        static identity() {
            return [
                1, 0, 0, 0, // column 0 (x)
                0, 1, 0, 0, // column 1 (y)
                0, 0, 1, 0, // column 2 (z)
                0, 0, 0, 1  // column 3 (w)
            ]; 
        }
        // Returns a translation matrix for the vector (x, y, z)
        static translation(tx, ty, tz) {
            return new Mat4([
                1, 0, 0, 0,  
                0, 1, 0, 0,  
                0, 0, 1, 0,  
                tx,ty,tz,1   
            ]);
        }
        // Returns a scaling matrix for the vector (x, y, z)
        static scaling(sx, sy, sz) {
            return new Mat4([
                sx, 0, 0, 0,
                0, sy, 0, 0,
                0, 0, sz, 0,
                0, 0, 0, 1  
            ]);
        }
        // Rotation matrix around the Y axis
        static rotationY(angleRad) {
            const c = Math.cos(angleRad), s = Math.sin(angleRad);
            return new Mat4([
                c, 0, -s, 0,
                0, 1, 0, 0, 
                s, 0, c, 0, 
                0, 0, 0, 1  
            ]);
        }
        // Rotation matrix around the X axis
        static rotationX(angleRad) {
            const c = Math.cos(angleRad), s = Math.sin(angleRad);
            return new Mat4([
                1, 0, 0, 0, 
                0, c, s, 0, 
                0, -s, c, 0,
                0, 0, 0, 1  
            ]);
        }
        // Rotation matrix around the Z axis
        static rotationZ(angleRad) {
            const c = Math.cos(angleRad), s = Math.sin(angleRad);
            return new Mat4([
                c, s, 0, 0, 
                -s, c, 0, 0,
                0, 0, 1, 0, 
                0, 0, 0, 1  
            ]);
        }
        // Multiplies this matrix with a vector
        multiplyVec4(vec) {
            const m = this.m, [x, y, z, w] = vec;
            return [
                m[0]*x + m[4]*y + m[8]*z  + m[12]*w,
                m[1]*x + m[5]*y + m[9]*z  + m[13]*w,
                m[2]*x + m[6]*y + m[10]*z + m[14]*w,
                m[3]*x + m[7]*y + m[11]*z + m[15]*w 
            ];
        }
        // Multiplies this matrix with another 4x4 matrix
        multiplyMat4(other) {
            let a = this.m, b = other.m, res = new Array(16).fill(0);
            for (let col = 0; col < 4; ++col) {
                for (let row = 0; row < 4; ++row) {
                    let sum = 0;
                    for (let k = 0; k < 4; ++k) {
                        sum += a[row + k*4] * b[k + col*4];
                    }
                    res[row + col*4] = sum;
                }
            }
            return new Mat4(res);
        }
        // Creates a perspective projection matrix for 3D rendering
        static perspectiveProjection(fovyDeg, aspect, near, far) {
            const fovy = (fovyDeg / 180) * Math.PI;
            const f = 1 / Math.tan(fovy / 2);
            const nf = 1 / (near - far);
            return new Mat4([
                f / aspect, 0, 0, 0,           
                0, f, 0, 0,                    
                0, 0, (far + near) * nf, -1,   
                0, 0, (2 * far * near) * nf, 0 
            ]);
        }
        // Creates a LookAt-View matrix: positions and orients the camera in space
        static lookAt(eye, target, up) {
            const z = eye.subtract(target).normalize();
            const x = up.cross(z).normalize();
            const y = z.cross(x);
            return new Mat4([
                x.x, y.x, z.x, 0,                          
                x.y, y.y, z.y, 0,                          
                x.z, y.z, z.z, 0,                          
                -x.dot(eye), -y.dot(eye), -z.dot(eye), 1   
            ]);
        }
    }
    ```

## Step 5: Defining a 3D Cube

With our math tools ready, we can define a 3D object. We'll create a simple wireframe cube.

1.  **Create a `scene` array** to hold all the objects we want to render.
2.  **Write the `createCubeObject` function**. This function generates the data for a cube, including its vertices (corners) and edges (lines connecting the corners).
3.  **Add cubes to the scene**. Call the function to create a large black cube at the origin and a smaller, translated and rotated red cube. The `modelMatrix` is used to give each object its own unique position, rotation, and scale within the 3D world.

```javascript
            // ***
            // *** Let's make a scene
            // ***
            const scene = [];

            // Creates a cube object with arbitrary center, edge length, color, and model matrix
            function createCubeObject(size = 100, center = new Vec3(0, 0, 0), color = "#111", modelMatrix = new Mat4(Mat4.identity())) {
                const h = size / 2;
                const vertices = [
                    center.add(new Vec3(-h, -h, -h)),
                    center.add(new Vec3(h, -h, -h)),
                    center.add(new Vec3(h, h, -h)),
                    center.add(new Vec3(-h, h, -h)),
                    center.add(new Vec3(-h, -h, h)),
                    center.add(new Vec3(h, -h, h)),
                    center.add(new Vec3(h, h, h)),
                    center.add(new Vec3(-h, h, h)),
                ];
                const edges = [
                    [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6],
                    [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
                ];
                return {
                    vertices: vertices,
                    edges: edges,
                    color: color,
                    modelMatrix: modelMatrix
                };
            }
            // Large black cube (at the origin)
            scene.push(createCubeObject(100, new Vec3(0, 0, 0), "#111", Mat4.rotationY(0)));
            // Small red cube (translated and rotated)
            scene.push(createCubeObject(40, new Vec3(0, 0, 0), "#c00", Mat4.translation(150, 60, 0).multiplyMat4(Mat4.rotationX(30)))); 
```

Again, you won't see anything on the canvas yet. We still need to write the code that interprets this scene data and draws it.

## Step 6: Rendering the Scene

This is where everything comes together. The `render` function will perform the full 3D to 2D transformation pipeline for every object. This process is a simplified version of the graphics pipeline discussed in the lecture. Before creating the function, we'll set up some initial camera variables.

1.  **Define initial camera parameters**.
2.  **Create the `render` function**. It will:
    *   Clear the canvas.
    *   Define the camera's view (`viewMat`) and projection (`projectionMat`).
    *   Loop through each object in the scene.
    *   For each object, create a combined Model-View-Projection (MVP) matrix. This matrix transforms a vertex from its local object space all the way to the final screen space.
    *   Transform each vertex of the object using the MVP matrix. This involves a perspective division to convert from 4D homogeneous coordinates to 2D screen coordinates.
    *   Draw the object's edges by connecting the transformed vertices with `drawLineBresenham`.
3.  **Call `render()`** once at the end of the script to draw the initial frame.

```javascript
            // ***
            // *** Camera parameters (orbit model, with initial angle)
            // *** 
            let cameraTarget = new Vec3(0, 0, 0);
            let cameraRadius = 400;
            let cameraAzimuth = 0;
            let cameraElevation = 0;
            let cameraUp = new Vec3(0, 1, 0);
            let cameraPosition = new Vec3(0, 0, 400);

            // ***
            // *** A very simple wireframe render function using Bresenham
            // ***
            function render() {
                // 1. Clear the drawing area (canvas) so that each frame is completely redrawn
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 3. Create the projection and view matrices:
                // The projection matrix is defined by the field of view, aspect ratio, near and far plane
                const projectionMat = Mat4.perspectiveProjection(45, canvas.width / canvas.height, 1, 1000);
                // The view matrix is in this case the look-at matrix of the camera
                const viewMat = Mat4.lookAt(cameraPosition, cameraTarget, cameraUp);

                // 4. For each object in the scene (e.g., each cube):
                for (const obj of scene) {
                    // 4.1 Create the combined MVP matrix (Model-View-Projection)
                    // Order: Projection * View * Model (matrix multiplication)
                    const mvpMat = projectionMat.multiplyMat4(viewMat).multiplyMat4(obj.modelMatrix);

                    // 4.2 Transform all vertices of the object from 3D to 2D
                    const transformed = obj.vertices.map((v) => {
                        // (a) Represent the vector as a homogeneous 4D vector [x, y, z, 1]
                        let vec4 = v.toArray();
                        // (b) Transform with the MVP matrix: from object to screen coordinates (clipping space)
                        let result = mvpMat.multiplyVec4(vec4);
                        // (c) Perspective division: divide by w to get normalized device coordinates (NDC) [-1, 1]
                        let w = result[3] !== 0 ? result[3] : 1; // Never divide by 0 :)
                        let ndc = [result[0] / w, result[1] / w];
                        // (d) We are now in the canonical volume and convert from NDC to canvas pixel coordinates
                        let x2d = ((ndc[0] + 1) / 2) * canvas.width;        // NDC x ∈ [-1, 1] is mapped to [0, width]
                        let y2d = ((1 - ndc[1]) / 2) * canvas.height;       // NDC y ∈ [-1, 1] is mapped to [0, height] (Note: Canvas y is positive downward)
                        // (e) Return the pixel coordinates of this point
                        return [Math.round(x2d), Math.round(y2d)];
                    });

                    // 4.3 Set the drawing color for this object
                    ctx.fillStyle = obj.color;

                    // 4.4 Draw each edge of the object as a line (edges connect two transformed vertices)
                    for (const [start, end] of obj.edges) {
                        const [x0, y0] = transformed[start]; // Start point of the edge
                        const [x1, y1] = transformed[end];   // End point of the edge
                        drawLineBresenham(x0, y0, x1, y1, ctx); // Draw the line using the Bresenham algorithm
                    }
                }
            }

            // Remove the old test calls to drawLine and drawLineBresenham
            // and replace them with a single call to render().
            render();
```

After adding this code, **you will finally see your 3D scene!** Two wireframe cubes should appear on the canvas.

## Step 7: Adding Interactive Camera Controls

To make the scene interactive, we'll add mouse controls to orbit the camera around the scene and zoom in and out.

1.  **Create `updateCameraOrbit` Function**: This function calculates the camera's 3D position in space based on the current orbit variables (`cameraAzimuth`, `cameraElevation`, `cameraRadius`).
2.  **Add Mouse Event Listeners**: Attach `mousedown`, `mouseup`, `mousemove`, `mouseleave`, and `wheel` event listeners to the canvas.
    *   The `mousemove` event will update the azimuth and elevation angles when the mouse is dragged.
    *   The `wheel` event will adjust the camera's distance (radius) to zoom.
    *   After each input, we call `updateCameraOrbit()` and then `render()` to redraw the scene from the new camera perspective.
3.  **Perform initial render**: At the end of the script, call `updateCameraOrbit()` and `render()` to ensure the scene is drawn correctly when the page loads.

```javascript
            // The function to move camera position around in an orbit
            function updateCameraOrbit() {
                let x = cameraTarget.x + cameraRadius * Math.cos(cameraElevation) * Math.sin(cameraAzimuth);
                let y = cameraTarget.y + cameraRadius * Math.sin(cameraElevation);
                let z = cameraTarget.z + cameraRadius * Math.cos(cameraElevation) * Math.cos(cameraAzimuth);
                cameraPosition = new Vec3(x, y, z);
            }
            
            // Mouse control variables
            let isDragging = false;
            let lastX = 0,
                lastY = 0;

            // Mouse button pressed
            canvas.addEventListener("mousedown", function (e) {
                isDragging = true;
                lastX = e.clientX;
                lastY = e.clientY;
            });

            // Mouse button released
            canvas.addEventListener("mouseup", function (e) {
                isDragging = false;
            });

            // If the mouse leaves the canvas, end the drag
            canvas.addEventListener("mouseleave", function (e) {
                isDragging = false;
            });

            // Mouse moves on the canvas
            canvas.addEventListener("mousemove", function (e) {
                if (!isDragging) return;
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                // Horizontal: Azimuth (Y axis)
                cameraAzimuth += -dx * 0.01; // Adjust factor if necessary
                // Vertical: Elevation (X axis)
                cameraElevation += dy * 0.01;
                // Limit elevation (do not go over the poles)
                const maxElev = Math.PI / 2 - 0.01; 
                if (cameraElevation > maxElev) cameraElevation = maxElev;
                if (cameraElevation < -maxElev) cameraElevation = -maxElev; 
                lastX = e.clientX;
                lastY = e.clientY;
                // Update view and render
                updateCameraOrbit();
                render();
            });

            // Mouse wheel for zooming
            canvas.addEventListener("wheel", function (e) {
                e.preventDefault(); // Prevent page from scrolling
                cameraRadius += e.deltaY * 0.5; // Adjust speed if needed
                cameraRadius = Math.max(100, Math.min(1000, cameraRadius));
                // Update view and render
                updateCameraOrbit();
                render();
            });
            
            // Update view and render
            updateCameraOrbit();
            render();
```

With this final piece, your project is complete. You can now click and drag to rotate the view, and use the mouse wheel to zoom.
