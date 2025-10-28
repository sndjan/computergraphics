# Exercise 03: Scanline Polygon Filling

In this exercise, we will extend our 3D renderer to fill the faces of our cubes, transforming them from wireframe objects into solid-looking shapes. We will implement the classic scanline algorithm to fill convex polygons.

## Step 1: Updating the 3D Object Definition

Our current `createCubeObject` function only defines vertices and the edges connecting them. To fill the faces, we first need to define what a "face" is in our data structure. A face is simply a list of vertices that form a closed polygon.

1.  Open the `03 - Scanline - begin.html` file.
2.  Locate the `createCubeObject` function.
3.  Modify the function to include a new array called `faces`. Each element in this array will be another array containing the indices of the vertices that make up one face of the cube.
4.  Add the new `faces` array to the object that the function returns.

Replace your existing `createCubeObject` function with the following updated version:

```javascript
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
                // Indices of the cube faces <-- new
                const faces = [
                    [0,1,2,3], // Back
                    [4,5,6,7], // Front
                    [0,1,5,4], // Bottom
                    [2,3,7,6], // Top
                    [1,2,6,5], // Right
                    [0,3,7,4], // Left
                ];
                return {
                    vertices: vertices,
                    edges: edges,
                    faces: faces,      // <--- new !
                    color: color,
                    modelMatrix: modelMatrix
                };
            }
```

## Step 2: Implementing the Scanline Fill Algorithm

Now for the core of this exercise: the scanline algorithm. This algorithm fills a polygon by iterating through it row by row (or "scanline" by "scanline"). For each row, it determines which horizontal segments are inside the polygon and fills them in.

1.  Find a good place in your script to add a new function, for example, after the `drawLineBresenham` function.
2.  Add the `fillPolygonScanline` function. This function takes an array of 2D points (the vertices of a polygon) and the canvas context as input. It works as follows:
    *   It finds the top and bottom y-coordinates of the polygon.
    *   It loops through every horizontal scanline from top to bottom.
    *   For each scanline, it calculates where the line intersects with the polygon's edges.
    *   It sorts these intersection points by their x-coordinate.
    *   Finally, it draws horizontal lines between pairs of intersection points (from the 1st to the 2nd, 3rd to the 4th, and so on).

Add the following function to your script:

```javascript
            // Fills a convex polygon, given as an array of [x, y] points, using the scanline algorithm
            function fillPolygonScanline(polygon, ctx) {
                // 1. Find the minimum and maximum Y values of the polygon (top and bottom of the bounding box)
                let minY = Math.min(...polygon.map(p => p[1]));
                let maxY = Math.max(...polygon.map(p => p[1]));

                // 2. Loop through each horizontal scanline between minY and maxY
                for (let y = minY; y <= maxY; y++) {
                    let intersections = [];
                    // 3. For each edge of the polygon, check if the scanline at 'y' intersects this edge
                    for (let i = 0; i < polygon.length; i++) {
                        // Get the current edge from point 'a' to point 'b'
                        let a = polygon[i], b = polygon[(i + 1) % polygon.length];
                        // Check if the scanline crosses the edge (one vertex is above and one is below or exactly at y)
                        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
                            // Calculate the X coordinate where the scanline intersects the edge using linear interpolation
                            let x = a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]);
                            intersections.push(x); // Save this intersection point
                        }
                    }
                    // 4. Sort the intersection points from left to right
                    intersections.sort((a, b) => a - b);
                    // 5. Fill pixels between pairs of intersection points
                    for (let k = 0; k < intersections.length; k += 2) {
                        // For each pair, draw a horizontal line (scanline) between xStart and xEnd
                        let xStart = Math.round(intersections[k]);
                        let xEnd = Math.round(intersections[k + 1]);
                        ctx.fillRect(xStart, y, xEnd - xStart + 1, 1); // Draw a horizontal line at scanline y
                    }
                }
            }
```

## Step 3: Integrating Filling into the Render Loop

With the data structures and algorithm in place, the final step is to call our new function from the main `render` loop. We will render the filled faces first, and then draw the wireframe on top.

1.  Locate the `render` function.
2.  Find the section `4.4` where the edges are drawn.
3.  Add a new section `4.5` after the edge-drawing loop. This new code will:
    *   Check if the object has a `faces` property.
    *   Set a semi-transparent fill style so we can still see the wireframe and through the object.
    *   Loop through each face, collect the already-transformed 2D vertex coordinates for that face, and pass them to `fillPolygonScanline`.

```javascript
                    // 4.5 (optional): Fill faces if there
                    if (obj.faces) {
                        ctx.save();
                        ctx.globalAlpha = 0.4; // transparency, that we can see some lines
                        for (const face of obj.faces) {
                            // Array with [x, y] coordinates of the faces
                            const polygon = face.map(i => transformed[i]);
                            fillPolygonScanline(polygon, ctx);
                        }
                        ctx.restore();
                    }
```

After completing these steps, save the file and open it in your browser. You should now see two solid, semi-transparent cubes instead of just wireframes.
