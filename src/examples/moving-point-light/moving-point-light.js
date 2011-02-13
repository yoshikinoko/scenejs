/*
 A teapot with an orbiting point light source that you can rotate with the mouse.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
SceneJS.createNode({
    type: "scene",
    id:"theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: -35 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 55.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [

                        /*---------------------------------------------------------------------------------
                         * Our animated light source is rotated using a Quaternion node which
                         * receives rotation updates through configs injected into the scene when
                         * it is rendered
                         * -------------------------------------------------------------------------------*/

                        {
                            type: "quaternion",
                            id: "myQuaternion",

                            nodes: [
                                {
                                    type: "translate",
                                    x: 10,
                                    z: -10,

                                    nodes: [
                                        {
                                            type: "light",

                                            mode: "point",

                                            /* Our light source's colour
                                             */
                                            color: { r: 1.0, g: 1.0, b: 0.0 },

                                            /* Our light will contribute to both the quantities of
                                             * specular and diffuse light that will hit our teapot.
                                             */
                                            diffuse: true,
                                            specular: true,

                                            /* The point light's position
                                             */
                                            pos: { x: 0, y: 0, z: 0},

                                            /* Since our light has a position, it therefore has
                                             * a distance over which its intensity can attenuate.
                                             * Consult any OpenGL book for how to use these factors,
                                             * or just tweak them right here to see what happens!
                                             */
                                            constantAttenuation: 1.0,
                                            quadraticAttenuation: 0.0,
                                            linearAttenuation: 0.0
                                        },

                                        /*----------------------------------------------------------
                                         * A sphere that marks the light's direction - not the focus
                                         * of this example
                                         * -------------------------------------------------------*/
                                        {

                                            type: "material",
                                            baseColor:      { r: .6, g: .6, b: 0.6 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            emit: 0.5,
                                            specular:       0.9,
                                            shine:          6.0,
                                            nodes: [
                                                {
                                                    type: "scale",
                                                    x:0.5,
                                                    y: 0.5,
                                                    z: 0.5,
                                                    nodes: [
                                                        {
                                                            type: "sphere"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },

                        /*--------------------------------------------------------------------------
                         * Teapot, rotated and scaled into position within model-space, coloured
                         * with some material properties
                         * ------------------------------------------------------------------------*/

                        {
                            type: "rotate",
                            angle: -20,
                            x : 1.0,
                            nodes: [

                                {
                                    type: "rotate",
                                    angle: 30.0,
                                    y : 1.0,

                                    nodes: [

                                        {
                                            type: "scale",
                                            x: 2,
                                            y: 2,
                                            z: 2,

                                            nodes: [
                                                {
                                                    type: "material",
                                                    baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
                                                    emit:           0.0,
                                                    specular:       0.9,
                                                    shine:          6.0,

                                                    nodes: [
                                                        {
                                                            type: "teapot"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});

/*----------------------------------------------------------------------
 * Enable scene graph compilation (disabled by default in V0.8).
 *
 * This feature is alpha status and may break some scene graphs.
 *
 * It can speed your scene graph up by an order of magnitude - we'll
 * do it here just to show how it's done.
 *
 * http://scenejs.wikispaces.com/V0.8+Branch
 *---------------------------------------------------------------------*/

SceneJS.setDebugConfigs({
    compilation : {
        enabled : true
    }
});

/*---------------------------------------------------------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff
 *--------------------------------------------------------------------------------------------------------------------*/

var rotx = 0;
var roty = 0;
var lastX;
var lastY;
var dragging = false;

SceneJS.withNode("theScene").render();

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        roty = (event.clientX - lastX);
        rotx = (event.clientY - lastY) * -1;

        if (Math.abs(roty) > Math.abs(rotx)) {

            SceneJS.withNode("myQuaternion").add({
                rotation:{
                    y: 1,
                    angle: roty
                }
            });
            SceneJS.withNode("theScene").render();

        } else {

            SceneJS.withNode("myQuaternion").add({
                rotation:{
                    x: 1,
                    angle: rotx
                }
            });
            SceneJS.withNode("theScene").render();
        }
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

SceneJS.bind("error", function(e) {
    alert(e.exception.message);
});





