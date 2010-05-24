/**
 * @class Scene node that provides quaternion-based rotation transformation.

 * <p>This node provides a convenient way to define a 3D rotation that can be rotated continually on any axis without
 * gimbal lock or significant numeric instability.</p>
 * <p><b>Example 1</b></p><p>Below is a Quaternion created from an "axis-angle" representation. It defines a rotation
 * for the nodes in its subgraph. Since these are used for rotation in SceneJS, we'll think of a quaternion in the same
 * terms as the parameters of a {@link SceneJS.Rotate} node. This example's  <em>x, y, z</em> and <em>angle</em>
 * parameters define the base rotation that this quaternion starts off at, in this case none, then the optional
 * <em>rotations</em> array defines a sequence of rotations to apply on top of that. Finally, we apply one more rotation
 * to the Quaternion node instance through its {@link #rotate} method. </p>
 * </p><pre><code>
 * var q = new SceneJS.Quaternion({
 *
 *         // "Base" rotation
 *
 *         x : 0.0, y : 0.0, z : 0.0, angle : 0.0,      // No rotation
 *
 *         // Sequence of rotations to apply on top of the base rotation
 *
 *         rotations: [
 *                 { x : 0, y : 0, z : 1, angle : 45 }, // Rotate 45 degrees about Z the axis
 *                 { x : 1, y : 0, z : 0, angle : 20 }, // Rotate 20 degrees about X the axis
 *                 { x : 0, y : 1, z : 0, angle : 90 }, // Rotate 90 degrees about Y the axis
 *              ]
 *          },
 *
 *          // .. Child nodes ...
 *     });
 *
 * // rotate one more time, 15 degrees about the Z axis
 *
 * q.rotate({ x : 0, y : 0, z : 1, angle : 15 });
 * </pre></code>
 * <p>Quaternions are designed to be animated. Typically, we would dynamically provide rotation updates to them at
 * render time, either from an interpolator node or human interaction.</p>
 * <p><b>Example 2</b></p><p>Below is a Quaternion that is dynamically configured with a callback that applies
 * rotation updates that are injected into the scene each time it is rendered. Note that the callback does not define
 * the base rotation - if it did, then the Quaternion would reset before each new rotation is applied, rather than
 * accumulate the rotations as intended. Note that the rotations could well ge generated by mouse drags to simulate
 * a trackball.</p>
 * <pre><code>
 *  var exampleScene = new SceneJS.Scene(
 *
 *      // ... sibling nodes
 *
 *      new SceneJS.Quaternion(
 *            function(data) {
 *                      return {
 *                         rotations: data.get("rotations");
 *                      };
 *           },
 *
 *           // ... chld nodes ...
 *      )
 *
 *      //... sibling nodes
 * );
 *
 * exampleScene.render({ rotations: [ { x : 0, y : 0, z : 1, angle : 45 } ] });
 * exampleScene.render({ rotations: [ { x : 1, y : 0, z : 0, angle : 20 } ] });
 * exampleScene.render({ rotations: [ { x : 0, y : 1, z : 0, angle : 90 } ] });
 * </code></pre>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Quaternion
 * @param {Object} [cfg] Static configuration object
 * @param {float} [cfg.x=0.0] Base rotation vector X axis
 * @param {float} [cfg.y=0.0] Base rotation vector Y axis
 * @param {float} [cfg.z=0.0] Base rotation vector Z axis
 * @param {float} [cfg.angle=0.0] Base rotation angle in degrees
 * @param {[{x:float, y:float, z:float, angle:float}]} [cfg.rotations=[]] Sequence of rotations to apply on top of the base rotation
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function that can return the same signature as the static config
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Quaternion = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "quaternion";
    this._mat = null;
    this._xform = null;
    this._q = SceneJS_math_identityQuaternion();
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Quaternion, SceneJS.Node);

/** Sets the base rotation. Resets the quaternion when you supply no arguments.
 *
 * @param {Object} [q={ x: 0, y: 0, z: 0, angle: 0 }] Rotation vector and angle in degrees
 * @param {float} [q.x=0.0] Rotation vector X axis
 * @param {float} [q.y=0.0] Rotation vector Y axis
 * @param {float} [q.z=0.0] Rotation vector Z axis
 * @param {float} [q.w=0.0]  
 * @param {float} [q.angle=0.0] Rotation angle in degrees
 * @returns {SceneJS.Quaternion} this
 */
SceneJS.Quaternion.prototype.setRotation = function(q) {
    q = q || {};
    if (q.w != undefined && q.w != null) {

    } else {
        this._q = SceneJS_math_angleAxisQuaternion(q.x || 0, q.y || 0, q.z || 0, q.angle);
    }
    this._memoLevel = 0;
    return this;
};

/** Applies a rotation to the quaternion
 *
 * @param {Object} [q={ x: 0, y: 0, z: 0, angle: 0 }] Rotation vector and angle in degrees
 * @param {float} [q.x=0.0] Rotation vector X axis
 * @param {float} [q.y=0.0] Rotation vector Y axis
 * @param {float} [q.z=0.0] Rotation vector Z axis
 * @param {float} [q.angle=0.0] Rotation angle in degrees
 * @returns {SceneJS.Quaternion} this
 */
SceneJS.Quaternion.prototype.rotate = function(q) {
    this._q = SceneJS_math_mulQuaternions(SceneJS_math_angleAxisQuaternion(q.x || 0, q.y || 0, q.z || 0, q.angle || 0), this._q);
    this._memoLevel = 0;
    return this;
};

SceneJS.Quaternion.prototype._init = function(params) {
    if (params.q) {
        this.setRotation(params.q);
    }
    if (params.rotations) {
        for (var i = 0; i < params.rotations.length; i++) {
            this.rotate(params.rotations[i]);
        }
    }
};

SceneJS.Quaternion.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        this._mat = SceneJS_math_newMat4FromQuaternion(this._q);
    }
    var superXform = SceneJS_modelViewTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var instancing = SceneJS_instancingModule.instancing();
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams && !instancing
        };
        if (this._memoLevel == 1 && superXform.fixed && !instancing) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelViewTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelViewTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.quaternion = function() {
    var n = new SceneJS.Quaternion();
    SceneJS.Quaternion.prototype.constructor.apply(n, arguments);
    return n;
};