# Transformations in Computer Graphics

## What are Transformations?
```
Transformations are mathematical operations that modify the position, size, or orientation of objects in 2D or 3D space. They are fundamental to computer graphics and allow us to manipulate objects dynamically.
```
## Types of Transformations

### Translation

Translation moves an object from one position to another by adding values to its coordinates. In 2D, we add values to the x and y coordinates.

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