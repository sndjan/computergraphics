Almost everything in computer graphics is based on vectors. 

### What is a vector?
A vector is a description of a direction and magnitude (length) in space. A 3d vector could look like this:

$\overline{v}=\begin{pmatrix}4\cr5\cr6\cr\end{pmatrix}$

The same vector can also be written as a **linear combination of basis vectors**:

> 💡 To transform a 3d vector into a 2d vector you can just remove on component: $\overline{v}=\begin{pmatrix}4\cr5\cr6\cr\end{pmatrix}$ => $\overline{w}=\begin{pmatrix}4\cr5\cr\end{pmatrix}$

$\overline{v} = 4 \cdot \begin{pmatrix}1\cr0\cr0\cr\end{pmatrix} + 5 \cdot \begin{pmatrix}0\cr1\cr0\cr\end{pmatrix} + 6 \cdot \begin{pmatrix}0\cr0\cr1\cr\end{pmatrix}$

If you have a common standard basis you can shorten this:

$\overline{v} = 4 \cdot \overline{e_1} + 5 \cdot \overline{e_2} + 6 \cdot \overline{e_3}$

where $\overline{e_1} = \begin{pmatrix}1\cr0\cr0\cr\end{pmatrix}$, $\overline{e_2} = \begin{pmatrix}0\cr1\cr0\cr\end{pmatrix}$, and $\overline{e_3} = \begin{pmatrix}0\cr0\cr1\cr\end{pmatrix}$ are the standard basis vectors.

> 💡 A vector can be expressed with any bases. This obviously changes the numerical components of this vector. But the vector itself (as in: description of direction and magnitude in space) is still the same.

You need vectors for basically everything in computer graphics. The following are some of the most important vectors. I explain them, because these will be important later on:

### Terms
- Global Coordinate System: The coordinate system of the "World" (e.g. a game world)
- Local Coordinate System: The coordinate system of a single object in a global coordinate system (e.g a player in this world)
> 💡 If you describe a vector in a local coordinate system, you do so with respect to that system’s basis vectors.
- Pivots: The origin of a coordinate system
- Vertix: A specific coordinate in either the local or global coordinate system
- Normals: The direction of a triangle face

There are a lot more: Colors, Textures, Light, Reflection, Forces, Vector fields (fluids, voxels)

### Coordinate Systems

There are a lot of different coordinate systems. They are split into two main categories. Left-handed systems (negative) and Right-handed systems (positive) and these can further be splitted into three systems each: y-up (Y points upwards), z-up and x-up

When working with anything related to computer graphics, make sure to use the appropriate systems. Here is an example of different tools using different systems:

- y-up, left-handed: DirectX, Unity3D
- z-up, left-handed: Unreal
- z-up, right-handed: Blender, Source Engine
- y-up, right-handed: OpenGL, Maya

### Basic Operations

There are a few operations needed: 

<details>
<summary>Vector Operations</summary>

**Vector Addition**: $\overline{a} + \overline{b} = \begin{pmatrix}a_x + b_x\cr a_y + b_y\cr a_z + b_z\cr\end{pmatrix}$
Combines two vectors component-wise.  
Example: $\begin{pmatrix}1\cr2\cr3\cr\end{pmatrix} + \begin{pmatrix}4\cr5\cr6\cr\end{pmatrix} = \begin{pmatrix}5\cr7\cr9\cr\end{pmatrix}$

**Vector Subtraction**: $\overline{a} - \overline{b} = \begin{pmatrix}a_x - b_x\cr a_y - b_y\cr a_z - b_z\cr\end{pmatrix}$
Subtracts components of one vector from another.  
Example: $\begin{pmatrix}5\cr7\cr9\cr\end{pmatrix} - \begin{pmatrix}1\cr2\cr3\cr\end{pmatrix} = \begin{pmatrix}4\cr5\cr6\cr\end{pmatrix}$

**Scalar Multiplication**: $k \cdot \overline{v} = \begin{pmatrix}k \cdot v_x\cr k \cdot v_y\cr k \cdot v_z\cr\end{pmatrix}$
Scales a vector by a constant.  
Example: $2 \cdot \begin{pmatrix}1\cr2\cr3\cr\end{pmatrix} = \begin{pmatrix}2\cr4\cr6\cr\end{pmatrix}$

**Scalar Division**: $\frac{\overline{v}}{k} = \begin{pmatrix}v_x/k\cr v_y/k\cr v_z/k\cr\end{pmatrix}$
Divides each component by a scalar.  
Example: $\frac{1}{2} \cdot \begin{pmatrix}4\cr6\cr8\cr\end{pmatrix} = \begin{pmatrix}2\cr3\cr4\cr\end{pmatrix}$

**Vector Magnitude**: $|\overline{v}| = \sqrt{v_x^2 + v_y^2 + v_z^2}$
Length of a vector.  
Example: $|\begin{pmatrix}3\cr4\cr0\cr\end{pmatrix}| = \sqrt{9 + 16 + 0} = 5$

**Dot Product**: $\overline{a} \cdot \overline{b} = a_x b_x + a_y b_y + a_z b_z$
Projects one vector onto another. Think of it like casting a shadow - if you shine light perpendicular to vector B, vector A would cast a shadow onto B. That shadow is the projection.    
Example: $\begin{pmatrix}1\cr2\cr3\cr\end{pmatrix} \cdot \begin{pmatrix}4\cr5\cr6\cr\end{pmatrix} = 4 + 10 + 18 = 32$

**Angle Between Vectors**: $\cos(\theta) = \frac{\overline{a} \cdot \overline{b}}{|\overline{a}| |\overline{b}|}$
Calculates angle between two vectors.  
Example: For $\overline{a} = \begin{pmatrix}1\cr0\cr0\cr\end{pmatrix}$ and $\overline{b} = \begin{pmatrix}1\cr1\cr0\cr\end{pmatrix}$: $\cos(\theta) = \frac{1}{\sqrt{2}} = 0.707$, so $\theta = 45°$

**Cross Product**: $\overline{a} \times \overline{b} = \begin{pmatrix}a_y b_z - a_z b_y\cr a_z b_x - a_x b_z\cr a_x b_y - a_y b_x\cr\end{pmatrix}$
Creates perpendicular vector to both inputs.  
Example: $\begin{pmatrix}1\cr0\cr0\cr\end{pmatrix} \times \begin{pmatrix}0\cr1\cr0\cr\end{pmatrix} = \begin{pmatrix}0\cr0\cr1\cr\end{pmatrix}$

> 💡 Applying the cross product twice on a vector creates a set of three orthogonal vectors for a local coordinate system

**Unit Vector/Normalization**: $\hat{v} = \frac{\overline{v}}{|\overline{v}|}$
Creates vector with length 1 in same direction.  
Example: $\hat{v} = \frac{\begin{pmatrix}3\cr4\cr0\cr\end{pmatrix}}{5} = \begin{pmatrix}0.6\cr0.8\cr0\cr\end{pmatrix}$

</details>

The normalization is done by using division and the square root. This works but is terribly slow. So the programmers of the game Quake III decided to come up with a better solution (these are the actual comments):

```c
float Q_rsqrt( float number )
{
    long i;
    float x2, y;
    const float threehalfs = 1.5F;

    x2 = number * 0.5F;
    y  = number;
    i  = * ( long * ) &y;                       // evil floating point bit level hacking
    i  = 0x5f3759df - ( i >> 1 );               // what the fuck? 
    y  = * ( float * ) &i;
    y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration
//  y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed

    return y;
}
```

This looks complicated as shit and unfortunately I am not smart enough to explain this in my own terms. Luckily there are people who do this really well: <a href="https://www.youtube.com/watch?v=p8u_k2LIZyo" target="_blank">Video explaining the fast inverse square root algorithm</a>
