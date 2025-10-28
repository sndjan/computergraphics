// ***
// *** Vector class for 3D points with basic vector functions (JavaScript does not support operator overloading)
// ***
class Vec3 {
  // Constructor: Creates a new 3D vector with components x, y, z
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  // Converts the vector to an array with homogeneous coordinates in the form [x, y, z, w]
  toArray(w = 1) {
    return [this.x, this.y, this.z, w];
  }
  // Creates a Vec3 from an array [x, y, z, w]
  static fromArray(arr) {
    let w = arr[3] !== 0 ? arr[3] : 1;
    return new Vec3(arr[0] / w, arr[1] / w, arr[2] / w);
  }
  // Adds another vector to this one (this + v)
  add(v) {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }
  // Subtracts another vector from this one (this - v)
  subtract(v) {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }
  // Multiplies the vector by a scalar (this * s)
  multiply(s) {
    return new Vec3(this.x * s, this.y * s, this.z * s);
  }
  // The cross product yields a vector orthogonal to both input vectors
  cross(v) {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }
  // The dot product yields a value that represents the angle and length of both vectors
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  // Returns the length (magnitude) of the vector
  length() {
    return Math.hypot(this.x, this.y, this.z);
  }
  // Returns the normalized vector (same direction, but length 1)
  normalize() {
    const len = this.length();
    if (len === 0) return new Vec3(0, 0, 0);
    return this.multiply(1 / len);
  }
}

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
      1,
      0,
      0,
      0, // column 0 (x)
      0,
      1,
      0,
      0, // column 1 (y)
      0,
      0,
      1,
      0, // column 2 (z)
      0,
      0,
      0,
      1, // column 3 (w)
    ];
  }
  // Returns a translation matrix for the vector (x, y, z)
  static translation(tx, ty, tz) {
    return new Mat4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1]);
  }
  // Returns a scaling matrix for the vector (x, y, z)
  static scaling(sx, sy, sz) {
    return new Mat4([sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1]);
  }
  // Rotation matrix around the Y axis
  static rotationY(angleRad) {
    const c = Math.cos(angleRad),
      s = Math.sin(angleRad);
    return new Mat4([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  }
  // Rotation matrix around the X axis
  static rotationX(angleRad) {
    const c = Math.cos(angleRad),
      s = Math.sin(angleRad);
    return new Mat4([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
  }
  // Rotation matrix around the Z axis
  static rotationZ(angleRad) {
    const c = Math.cos(angleRad),
      s = Math.sin(angleRad);
    return new Mat4([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }
  // Multiplies this matrix with a vector
  multiplyVec4(vec) {
    const m = this.m,
      [x, y, z, w] = vec;
    return [
      m[0] * x + m[4] * y + m[8] * z + m[12] * w,
      m[1] * x + m[5] * y + m[9] * z + m[13] * w,
      m[2] * x + m[6] * y + m[10] * z + m[14] * w,
      m[3] * x + m[7] * y + m[11] * z + m[15] * w,
    ];
  }
  // Multiplies this matrix with another 4x4 matrix
  multiplyMat4(other) {
    let a = this.m,
      b = other.m,
      res = new Array(16).fill(0);
    for (let col = 0; col < 4; ++col) {
      for (let row = 0; row < 4; ++row) {
        let sum = 0;
        for (let k = 0; k < 4; ++k) {
          sum += a[row + k * 4] * b[k + col * 4];
        }
        res[row + col * 4] = sum;
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
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) * nf,
      -1,
      0,
      0,
      2 * far * near * nf,
      0,
    ]);
  }
  // Creates a LookAt-View matrix: positions and orients the camera in space
  static lookAt(eye, target, up) {
    const z = eye.subtract(target).normalize();
    const x = up.cross(z).normalize();
    const y = z.cross(x);
    return new Mat4([
      x.x,
      y.x,
      z.x,
      0,
      x.y,
      y.y,
      z.y,
      0,
      x.z,
      y.z,
      z.z,
      0,
      -x.dot(eye),
      -y.dot(eye),
      -z.dot(eye),
      1,
    ]);
  }
}

// ***
// *** Let's make a scene
// ***
const scene = [];

// Creates a cube object with arbitrary center, edge length, color, and model matrix
function createCubeObject(
  size = 100,
  center = new Vec3(0, 0, 0),
  color = "#111",
  modelMatrix = new Mat4(Mat4.identity())
) {
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
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  // Indices of the cube faces <-- new
  const faces = [
    [0, 1, 2, 3], // Back
    [4, 5, 6, 7], // Front
    [0, 1, 5, 4], // Bottom
    [2, 3, 7, 6], // Top
    [1, 2, 6, 5], // Right
    [0, 3, 7, 4], // Left
  ];
  return {
    vertices: vertices,
    edges: edges,
    faces: faces, // <--- new !
    color: color,
    modelMatrix: modelMatrix,
  };
}
// Large black cube (at the origin)
scene.push(createCubeObject(100, new Vec3(0, 0, 0), "#111", Mat4.rotationY(0)));
// Small red cube (translated)
scene.push(
  createCubeObject(
    40,
    new Vec3(0, 0, 0),
    "#c00",
    Mat4.translation(150, 60, 0).multiplyMat4(Mat4.rotationX(30))
  )
);

// We need the canvas object - and yes, it is 2D :)
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ***
// *** Bresenham-/Midpoint Algorithm
// ***
function drawLineBresenham(x0, y0, x1, y1, ctx) {
  let dx = Math.abs(x1 - x0),
    sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0),
    sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    ctx.fillRect(x0, y0, 1, 1); // Pixel zeichnen
    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

// Fills a convex polygon, given as an array of [x, y] points, using the scanline algorithm
function fillPolygonScanline(polygon, ctx) {
  // 1. Find the minimum and maximum Y values of the polygon (top and bottom of the bounding box)
  let minY = Math.min(...polygon.map((p) => p[1]));
  let maxY = Math.max(...polygon.map((p) => p[1]));

  // 2. Loop through each horizontal scanline between minY and maxY
  for (let y = minY; y <= maxY; y += 1) {
    let intersections = [];
    // 3. For each edge of the polygon, check if the scanline at 'y' intersects this edge
    for (let i = 0; i < polygon.length; i++) {
      // Get the current edge from point 'a' to point 'b'
      let a = polygon[i],
        b = polygon[(i + 1) % polygon.length];
      // Check if the scanline crosses the edge (one vertex is above and one is below or exactly at y)
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        // Calculate the X coordinate where the scanline intersects the edge using linear interpolation
        let x = a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]);
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
      // drawLineBresenham(xStart, y, xEnd, y, ctx); // Optional: draw the line using Bresenham for better edge quality
    }
  }
}

// ***
// *** Naive Line (just for demonstration purposes)
// ***
function drawLine(x0, y0, x1, y1, ctx) {
  let x, m, y;
  m = (y1 - y0) / (x1 - x0);
  for (x = x0; x <= x1; ++x) {
    y = m * (x - x0) + y0;
    ctx.fillRect(x, y, 1, 1);
  }
}
// ***
// *** A very simple wireframe render function using Bresenham
// ***
function render() {
  // 1. Clear the drawing area (canvas) so that each frame is completely redrawn
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Set a default fill color for lines/objects
  ctx.fillStyle = "#111";

  //drawLineBresenham(100, 200, 150, 450, ctx); // Example of drawing a line
  drawLine(100, 200, 150, 450, ctx); // Example of drawing a line

  // 3. Create the projection and view matrices:
  // The projection matrix is defined by the field of view, aspect ratio, near and far plane
  const projectionMat = Mat4.perspectiveProjection(
    45,
    canvas.width / canvas.height,
    1,
    1000
  );
  // The view matrix is in this case the look-at matrix of the camera
  const viewMat = Mat4.lookAt(cameraPosition, cameraTarget, cameraUp);

  // 4. For each object in the scene (e.g., each cube):
  for (const obj of scene) {
    // 4.1 Create the combined MVP matrix (Model-View-Projection)

    // Order: Projection * View * Model (matrix multiplication)
    const mvpMat = projectionMat
      .multiplyMat4(viewMat)
      .multiplyMat4(obj.modelMatrix);

    // 4.2 Transform all vertices of the object from 3D to 2D: --> Later this will be done on the GPU (in the shader)!
    const transformed = obj.vertices.map((v) => {
      // (a) Represent the vector as a homogeneous 4D vector [x, y, z, 1]
      let vec4 = v.toArray();

      // (b) Transform with the MVP matrix: from object to screen coordinates (clipping space)
      let result = mvpMat.multiplyVec4(vec4);

      // (c) Perspective division: divide by w to get normalized device coordinates (NDC) [-1, 1]
      let w = result[3] !== 0 ? result[3] : 1; // Never divide by 0 :)
      let ndc = [result[0] / w, result[1] / w];

      // (d) We are now in the canonical volume and convert from NDC to canvas pixel coordinates
      let x2d = ((ndc[0] + 1) / 2) * canvas.width; // NDC x ∈ [-1, 1] is mapped to [0, width]
      let y2d = ((1 - ndc[1]) / 2) * canvas.height; // NDC y ∈ [-1, 1] is mapped to [0, height] (Note: Canvas y is positive downward)

      // (e) Return the pixel coordinates of this point
      return [Math.round(x2d), Math.round(y2d)];
    });

    // 4.3 Set the drawing color for this object
    ctx.fillStyle = obj.color;

    // 4.4 Draw each edge of the object as a line (edges connect two transformed vertices)
    for (const [start, end] of obj.edges) {
      const [x0, y0] = transformed[start]; // Start point of the edge
      const [x1, y1] = transformed[end]; // End point of the edge
      drawLineBresenham(x0, y0, x1, y1, ctx); // Draw the line using the Bresenham algorithm
    }

    // 4.5 (optional): Fill faces if there
    if (obj.faces) {
      ctx.save();
      ctx.globalAlpha = 0.4; // transparency, that we can see some lines
      for (const face of obj.faces) {
        // Array with [x, y] coordinates of the faces
        const polygon = face.map((i) => transformed[i]);
        fillPolygonScanline(polygon, ctx);
      }
      ctx.restore();
    }
  }
}

// ***
// *** Camera parameters (orbit model, with initial angle)
// ***
let cameraTarget = new Vec3(0, 0, 0);
let cameraRadius = 400;
let cameraAzimuth = 0;
let cameraElevation = 0;
let cameraUp = new Vec3(0, 1, 0);
let cameraPosition = new Vec3(0, 0, 400);

// The function to move camera position around in an orbit
function updateCameraOrbit() {
  let x =
    cameraTarget.x +
    cameraRadius * Math.cos(cameraElevation) * Math.sin(cameraAzimuth);
  let y = cameraTarget.y + cameraRadius * Math.sin(cameraElevation);
  let z =
    cameraTarget.z +
    cameraRadius * Math.cos(cameraElevation) * Math.cos(cameraAzimuth);
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
