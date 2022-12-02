import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

export class NyanCat extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        this.shapes = {
            box_1: new Cube(),
            rainbow: new Cube(),
            pixel: new Cube(),
            cat_face: new Shape_From_File("assets/cat_body.obj"),
            cat_body: new Shape_From_File("assets/cat_body.obj"),
            cat_ear: new Shape_From_File("assets/cat_ear.obj"),
            cat_ear2: new Shape_From_File("assets/cat_ear.obj"),
            cat_leg1: new Shape_From_File("assets/cat_leg.obj"),
            cat_leg2: new Shape_From_File("assets/cat_leg.obj"),
            cat_leg3: new Shape_From_File("assets/cat_leg.obj"),
            cat_leg4: new Shape_From_File("assets/cat_leg.obj"),
            asteroid: new ( defs.Subdivision_Sphere.prototype.make_flat_shaded_version() )(2),
        }
        /*this.shapes.rainbow.arrays.texture_coord.forEach(
            (v, i, l) => {
                v[0] = v[0] * 2
                v[1] = v[1] * 2
            }
        )*/
        console.log(this.shapes.rainbow.arrays.texture_coord)

        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials = {


            asteroid: new Material(new defs.Phong_Shader(),
                {diffusivity: 1, color: hex_color("#808080")}),
            texture_2: new Material(new Texture_Scroll_X(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/rainbow.png", "NEAREST")
            }),
            pixel: new Material(new Textured_Phong(), {
                color: hex_color("#ff0000"),
            }),
            cat_face: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/cat_face.png", "LINEAR_MIPMAP_LINEAR")
            }),
            cat_body: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/cat_body.png", "LINEAR_MIPMAP_LINEAR")
            }),
            cat_ear: new Material(new Textured_Phong(), {
                color: hex_color("#CCCCCC"),
            }),

        }

        /* Starfield instantiation */
        // screen is roughly 6 x 3.5
        this.stars = [];
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                'x': 12 * (Math.random() - 0.5),
                'y': 7 * (Math.random() - 0.5),
                'z': -5 * (Math.random()),
                'dx': -0.075 * (Math.random() + 0.3),
                'dy': 0,
                'dz': 0,
                'scale': 0.3 * (Math.random()),
                'color': '#ffff97',
            });
        }


        /* Asteroids */
        this.asteroids = [];
        for (let i = 0; i < 4; i++) {
            this.asteroids.push({
                'x': 12 * (Math.random() - 0.5),
                'y': 7 * (Math.random() - 0.5),
                'z': -5 * (Math.random()),
                'dx': -0.02 * (Math.random() + 2),
                'dy': 0,
                'dz': 0,
                'scale': 0.25,
                'color': '#ffff99',
            });
        }

            

        /* Nyan Cat Properties */
        this.cat = {
            'x': 0, 'y': 0, 'dx': 0, 'dy': 0, 'ddy': 0,
        }

        this.bows = []
        let rain_x = 0;
        for (let i = 0; i < 50; i++) {
            this.bows.push({
                'x': -.9 - rain_x,
                'y': 0,
                'dx': -.02,
                'dy': 0
            })
            rain_x += .5;
        }

        this.new_bows = []
        rain_x = 0;
        for (let i = 0; i < 200; i++) {
            this.new_bows.push({
                'x': -.2 - rain_x,
                'y': 0,
                'dx': -.02,
                'dy': 0
            })
            rain_x += .1;
        }

        this.cat.position_queue = Array(100).fill(0);

        this.rainbowX = 0;
        this.rainbowY = 0;
        this.rainbowDX = 0;
        this.rainbowDY = 0;

        this.rainbow_toggle = true;
        this.music_toggle = false;
    }



    make_control_panel() {

        // sound file
        
        var audio = document.createElement('audio');
        audio.src = "assets/cat_audio.mp3";
        
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.

        this.key_triggered_button('Up', ["i"], () => { this.cat.dy += 0.025, this.rainbowDY += .025 });
        this.key_triggered_button('Left', ["j"], () => { this.cat.dx -= 0.025, this.rainbowDX -= .025 });
        this.key_triggered_button('Down', ["k"], () => { this.cat.dy -= 0.025, this.rainbowDY -= .025 });
        
        // play and pause sound
        this.key_triggered_button('Right', ["l"], () => { this.cat.dx += 0.025, this.rainbowDX += .025 });
        this.key_triggered_button('Up', ["i"], () => { this.cat.dy += 0.025 });
        this.key_triggered_button('Left', ["j"], () => { this.cat.dx -= 0.025 });
        this.key_triggered_button('Down', ["k"], () => { this.cat.dy -= 0.025 });
        this.key_triggered_button('Right', ["l"], () => { this.cat.dx += 0.025 });

        this.key_triggered_button('Toggle Music', ["m"], () => {
            this.music_toggle = !this.music_toggle;
            if (this.music_toggle) {
                audio.play();
            } else {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        this.key_triggered_button('Toggle Rainbow Effect', ['u'], () => { this.rainbow_toggle = !this.rainbow_toggle; });
        this.new_line();
    }



    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, 0, -8));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 150, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        // TODO:  Draw the required boxes. Also update their stored matrices.
        // this.shapes.axis.draw(context, program_state, model_transform, this.materials.phong.override({color: hex_color("#ffff00")}));
        
        // rotation - 20rpm = 20* 2 * pi deg/min
        // 40pi / 60sec = 2pi/3 per sec
        
        // TODO: Make some of my code less ugly lmao
        /* Nyan Cat Model Start */
        const colors = {
            'blac': '#624F56',
            'brow': '#FFEF82',
            'grey': '#616160',
            'whit': '#FDFDFD',
            'pink': '#FF8BBF',
            'purp': '#AA50FD',
            'empt': '       ',
        }
        const { blac, whit, pink, grey, empt } = colors;
        const cat_pixels = [
            ['       ', '       ', '#624F56', '#624F56', '       ', '       ', '       ', '       ', '       ', '       ', '       ', '       ', '#624F56', '#624F56', '       ', '       '],
            ['       ', '#624F56', '#616160', '#616160', '#624F56', '       ', '       ', '       ', '       ', '       ', '       ', '#624F56', '#616160', '#616160', '#624F56', '       '],
            ['       ', '#624F56', '#616160', '#616160', '#616160', '#624F56', '       ', '       ', '       ', '       ', '#624F56', '#616160', '#616160', '#616160', '#624F56', '       '],
            ['       ', '#624F56', '#616160', '#616160', '#616160', '#616160', '#624F56', '#624F56', '#624F56', '#624F56', '#616160', '#616160', '#616160', '#616160', '#624F56', '       '],
            ['       ', '#624F56', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#624F56', '       '],
            ['#624F56', '#616160', '#616160', '#616160', '#FDFDFD', '#624F56', '#616160', '#616160', '#616160', '#616160', '#616160', '#FDFDFD', '#624F56', '#616160', '#616160', '#624F56'],
            ['#624F56', '#616160', '#616160', '#616160', '#624F56', '#624F56', '#616160', '#616160', '#616160', '#624F56', '#616160', '#624F56', '#624F56', '#616160', '#616160', '#624F56'],
            ['#624F56', '#616160', '#FF8BBF', '#FF8BBF', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#FF8BBF', '#FF8BBF', '#624F56'],
            ['#624F56', '#616160', '#FF8BBF', '#FF8BBF', '#616160', '#624F56', '#616160', '#616160', '#624F56', '#616160', '#616160', '#624F56', '#616160', '#FF8BBF', '#FF8BBF', '#624F56'],
            ['       ', '#624F56', '#616160', '#616160', '#616160', '#624F56', '#624F56', '#624F56', '#624F56', '#624F56', '#624F56', '#624F56', '#616160', '#616160', '#624F56', '       '],
            ['       ', '       ', '#624F56', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#616160', '#624F56', '       ', '       '],
            ['       ', '       ', '       ', '#624F56', '#624F56', '#624F56', '#624F56', '#624F56', '#624F56', '#624F56', '#624F56', '#624F56', '#624F56', '       ', '       ', '       '],
        ];

        // this.cat.dy = this.cat.ddy * 1;
        this.cat.y += this.cat.dy;
        this.cat.x += this.cat.dx;

        // Bound x and y within frame
        const BOUNCE_MULTIPLIER = 0.5;
        if (Math.abs(this.cat.x) > 5) {
            this.cat.x = Math.sign(this.cat.x) * 5;
            this.cat.dx = -this.cat.dx * BOUNCE_MULTIPLIER;
        }
        if (Math.abs(this.cat.y) > 2.5) {
            this.cat.y = Math.sign(this.cat.y) * 2.5;
            this.cat.dy = -this.cat.dy * BOUNCE_MULTIPLIER;
        }
        // this.cat.y = Math.max(-2.5, this.cat.y);

        this.cat.dx = Math.min(this.cat.dx, 0.075);
        this.cat.dy = Math.min(this.cat.dy, 0.075);

        this.cat.dy /= 1.01;
        this.cat.dx /= 1.01;

        this.cat.position_queue.push(this.cat.y);
        this.cat.position_queue.shift();
        



        let pixel_transform = model_transform
            .times(Mat4.translation(this.cat.x, this.cat.y, 1));
            
            // .times(Mat4.translation(this.cat_x, this.cat_y, 0))
            // .times(Mat4.translation(-1, 0.6, 1))
        const cat_body_transform = pixel_transform
            .times(Mat4.rotation(Math.PI/2, 0, 1, 0));
        
        this.shapes.cat_body.draw(context, program_state, cat_body_transform, this.materials.cat_body);
        
        const cat_face_transform = pixel_transform
            .times(Mat4.translation(1, -0.2, 0))
            .times(Mat4.rotation(Math.PI, 0, 1, 0))
            .times(Mat4.scale(0.5, 0.6, 0.6))
        this.shapes.cat_face.draw(context, program_state, cat_face_transform, this.materials.cat_face);
        
        const cat_ear1_transform = pixel_transform
            .times(Mat4.translation(1, 0.2, 0.2))
            .times(Mat4.scale(0.1, 0.1, 0.1))
        this.shapes.cat_ear.draw(context, program_state, cat_ear1_transform, this.materials.cat_ear);
        
        const cat_ear2_transform = pixel_transform
            .times(Mat4.translation(1, 0.2, -0.2))
            .times(Mat4.scale(0.1, 0.1, 0.1))

        this.shapes.cat_ear2.draw(context, program_state, cat_ear2_transform, this.materials.cat_ear);

        
        const cat_leg1_transform = pixel_transform
            .times(Mat4.translation(0.5, -0.7, 0.1))
            .times(Mat4.scale(0.2, 0.2, 0.2));
        this.shapes.cat_leg1.draw(context, program_state, cat_leg1_transform, this.materials.cat_ear);
        
        const cat_leg2_transform = pixel_transform
            .times(Mat4.translation(0.5, -0.7, -0.1))
            .times(Mat4.scale(0.2, 0.2, 0.2));
        this.shapes.cat_leg2.draw(context, program_state, cat_leg2_transform, this.materials.cat_ear);

        const cat_leg3_transform = pixel_transform
            .times(Mat4.translation(-0.5, -0.7, 0.1))
            .times(Mat4.scale(0.2, 0.2, 0.2));
        this.shapes.cat_leg3.draw(context, program_state, cat_leg3_transform, this.materials.cat_ear);
        
        const cat_leg4_transform = pixel_transform
            .times(Mat4.translation(-0.5, -0.7, -0.1))
            .times(Mat4.scale(0.2, 0.2, 0.2));
        this.shapes.cat_leg4.draw(context, program_state, cat_leg4_transform, this.materials.cat_ear);
        
        // for (let i = 0; i < cat_pixels.length; i++) {
        //     for (let j = 0; j < cat_pixels[i].length; j++) {
        //         pixel_transform = pixel_transform.times(Mat4.translation(2, 0, 0));
        //         if (cat_pixels[i][j] != '       ') {
        //             this.shapes.pixel.draw(context, program_state, pixel_transform, this.materials.pixel.override({color: hex_color(cat_pixels[i][j])}));
        //         }
        //     }
        //     pixel_transform = pixel_transform.times(Mat4.translation(-32, -2, 0));
        // }

        /* Nyan Cat Model End */

        /* Starfield */
        for (let i = 0; i < this.stars.length; i++) {
            const {x, y, z, dx, dy, dz, scale, color} = this.stars[i];
            const star_transform = model_transform
                .times(Mat4.translation(x, y, z))
                .times(Mat4.scale(scale, 0.1 * scale, 0.1 * scale));
            this.shapes.pixel.draw(context, program_state, star_transform, this.materials.pixel.override({color: hex_color(color)}));
            this.stars[i].x += (x + dx >= -6) ? dx : dx + 12;
            this.stars[i].y += dy;
            this.stars[i].z += dz;
        }
        /* Starfield End */

        

        /* Asteroids */


        for (let i = 0; i < this.asteroids.length; i++) {
            const {x, y, z, dx, dy, dz, scale, color} = this.asteroids[i];
            const asteroid_transform = model_transform
                .times(Mat4.translation(x, y, z))
                .times(Mat4.scale(scale, scale, scale));
            this.shapes.asteroid.draw(context, program_state, asteroid_transform, this.materials.asteroid);

            this.asteroids[i].x += dx;
            this.asteroids[i].y += dy;
            this.asteroids[i].z += dz;
            if (this.asteroids[i].x < -6) {
                this.asteroids.splice(i, 1);
                i--;
                this.asteroids.push({
                    'x': 9,
                    'y': 7 * (Math.random() - 0.5),
                    'z': -5 * (Math.random()),
                    'dx': -0.02 * (Math.random() + 2),
                    'dy': 0,
                    'dz': 0,
                    'scale': 0.25,
                    'color': '#ffff99',
                });
            }
        }

        /* Asteroids End */

        // Rainbow
        if (this.rainbow_toggle) {
            for (let i = 0; i < this.bows.length; i++) {
                let{x, y, dx, dy} = this.bows[i];
                if (i % 2 == 0) {
                    this.bows[i].y = .025;
                }
                else {
                    this.bows[i].y = -.025;
                }
                if (Math.floor(t) % 2 == 0) {
                    this.bows[i].y  *= -1;
                }
            }
    
            // this.bows.sort((a,b) => b.x - a.x);
            for (let i = 0; i < this.bows.length; i++) {
                let{x, y, dx, dy} = this.bows[i];
                const trail = this.cat.y; // this.cat.position_queue[49 - i];
                const rainbow_transform = Mat4.translation(x + this.cat.x, y + trail, 0.5).times(Mat4.scale(.25, .6, .1));
                this.shapes.rainbow.draw(context, program_state, rainbow_transform, this.materials.texture_2);
                this.bows[i].x += (x + dx >= -20) ? dx : dx + 20;
            }
        } else {
            this.new_bows.sort((a,b) => b.x - a.x);
            for (let i = 0; i < this.new_bows.length; i++) {
                let{x, y, dx, dy} = this.new_bows[i];
                const trail = this.cat.position_queue[99 - i];
                const rainbow_transform = Mat4.translation(x + this.cat.x, y + trail, 0.5).times(Mat4.scale(.25, .6, .1));
                this.shapes.rainbow.draw(context, program_state, rainbow_transform, this.materials.texture_2);
                this.new_bows[i].x += (x + dx >= -20) ? dx : dx + 20;
            }
        }


        /*let rain_x = 0;
        let rain_y = 0;
        let rain_dy = 0;
        for (let i = 0; i < 20; i++) {
            if (i % 2 == 0) {
                rain_y = .025;
                rain_dy = -.01;
            }
            else {
                rain_y = -.025;
                rain_dy = .01;
            }

            if (Math.floor(t) % 2 == 0) {
                rain_y *= -1;
            }

            const rainbow_transform = Mat4.translation(-.9 - rain_x, rain_y, 0).times(Mat4.scale(.25, .6, .3));
            this.shapes.rainbow.draw(context, program_state, rainbow_transform, this.materials.texture_2);
            rain_x += .5;
        }*/


        /*this.rainbowY += this.rainbowDY;
        this.rainbowX += this.rainbowDX;

        this.rainbowDX = Math.min(this.rainbowDX, 0.075);
        this.rainbowDY = Math.min(this.rainbowDY, 0.075);

        this.rainbowDY /= 1.01;
        this.rainbowDX /= 1.01;


        this.rainbow_transform = model_transform.times(Mat4.translation(-10.5 + this.rainbowX, 0 + this.rainbowY,0)
            .times(Mat4.scale(10,.6,.3))); */


        //this.shapes.rainbow.draw(context, program_state, this.rainbow_transform, this.materials.texture_2);
    }
}

class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                float dx = mod((2.0 * animation_time), 1.0);
                float dy = mod((1.75 * animation_time), 1.0);
                float u = abs(mod(f_tex_coord.x - dx, 1.0) - 0.5);
                float v = abs(mod(f_tex_coord.y - dy, 1.0) - 0.5);
                

                vec2 translated_tex_coord = vec2(f_tex_coord.x + dx, f_tex_coord.y);

                vec4 tex_color;

                tex_color = texture2D( texture, translated_tex_coord);

                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}


export class Shape_From_File extends Shape {                                   // **Shape_From_File** is a versatile standalone Shape that imports
                                                                               // all its arrays' data from an .obj 3D model file.
    constructor(filename) {
        super("position", "normal", "texture_coord");
        // Begin downloading the mesh. Once that completes, return
        // control to our parse_into_mesh function.
        this.load_file(filename);
    }

    load_file(filename) {                             // Request the external file and wait for it to load.
        // Failure mode:  Loads an empty shape.
        return fetch(filename)
            .then(response => {
                if (response.ok) return Promise.resolve(response.text())
                else return Promise.reject(response.status)
            })
            .then(obj_file_contents => this.parse_into_mesh(obj_file_contents))
            .catch(error => {
                this.copy_onto_graphics_card(this.gl);
            })
    }

    parse_into_mesh(data) {                           // Adapted from the "webgl-obj-loader.js" library found online:
        var verts = [], vertNormals = [], textures = [], unpacked = {};

        unpacked.verts = [];
        unpacked.norms = [];
        unpacked.textures = [];
        unpacked.hashindices = {};
        unpacked.indices = [];
        unpacked.index = 0;

        var lines = data.split('\n');

        var VERTEX_RE = /^v\s/;
        var NORMAL_RE = /^vn\s/;
        var TEXTURE_RE = /^vt\s/;
        var FACE_RE = /^f\s/;
        var WHITESPACE_RE = /\s+/;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var elements = line.split(WHITESPACE_RE);
            elements.shift();

            if (VERTEX_RE.test(line)) verts.push.apply(verts, elements);
            else if (NORMAL_RE.test(line)) vertNormals.push.apply(vertNormals, elements);
            else if (TEXTURE_RE.test(line)) textures.push.apply(textures, elements);
            else if (FACE_RE.test(line)) {
                var quad = false;
                for (var j = 0, eleLen = elements.length; j < eleLen; j++) {
                    if (j === 3 && !quad) {
                        j = 2;
                        quad = true;
                    }
                    if (elements[j] in unpacked.hashindices)
                        unpacked.indices.push(unpacked.hashindices[elements[j]]);
                    else {
                        var vertex = elements[j].split('/');

                        unpacked.verts.push(+verts[(vertex[0] - 1) * 3 + 0]);
                        unpacked.verts.push(+verts[(vertex[0] - 1) * 3 + 1]);
                        unpacked.verts.push(+verts[(vertex[0] - 1) * 3 + 2]);

                        if (textures.length) {
                            unpacked.textures.push(+textures[((vertex[1] - 1) || vertex[0]) * 2 + 0]);
                            unpacked.textures.push(+textures[((vertex[1] - 1) || vertex[0]) * 2 + 1]);
                        }

                        unpacked.norms.push(+vertNormals[((vertex[2] - 1) || vertex[0]) * 3 + 0]);
                        unpacked.norms.push(+vertNormals[((vertex[2] - 1) || vertex[0]) * 3 + 1]);
                        unpacked.norms.push(+vertNormals[((vertex[2] - 1) || vertex[0]) * 3 + 2]);

                        unpacked.hashindices[elements[j]] = unpacked.index;
                        unpacked.indices.push(unpacked.index);
                        unpacked.index += 1;
                    }
                    if (j === 3 && quad) unpacked.indices.push(unpacked.hashindices[elements[0]]);
                }
            }
        }
        {
            const {verts, norms, textures} = unpacked;
            for (var j = 0; j < verts.length / 3; j++) {
                this.arrays.position.push(vec3(verts[3 * j], verts[3 * j + 1], verts[3 * j + 2]));
                this.arrays.normal.push(vec3(norms[3 * j], norms[3 * j + 1], norms[3 * j + 2]));
                this.arrays.texture_coord.push(vec(textures[2 * j], textures[2 * j + 1]));
            }
            this.indices = unpacked.indices;
        }
        this.normalize_positions(false);
        this.ready = true;
    }

    draw(context, program_state, model_transform, material) {               // draw(): Same as always for shapes, but cancel all
        // attempts to draw the shape before it loads:
        if (this.ready)
            super.draw(context, program_state, model_transform, material);
    }
}