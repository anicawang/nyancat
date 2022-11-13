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
            box_2: new Cube(),
            pixel: new Cube(),
        }
        /*this.shapes.box_2.arrays.texture_coord.forEach(
            (v, i, l) => {
                v[0] = v[0] * 2
                v[1] = v[1] * 2
            }
        )*/
        console.log(this.shapes.box_2.arrays.texture_coord)

        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
            }),
            texture_2: new Material(new Texture_Scroll_X(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/rainbow.png", "NEAREST")
            }),
            pixel: new Material(new Textured_Phong(), {
                color: hex_color("#ff0000"),
            })
        }

        this.box2_transform = Mat4.translation(-4.25,0,0).times(Mat4.scale(3.75,.6,1));

        this.rotate = false

        /* Starfield instantiation */
        // screen is roughly 6 x 3.5
        this.stars = [];
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                'x': 12 * (Math.random() - 0.5),
                'y': 7 * (Math.random() - 0.5),
                'z': -5 * (Math.random()),
                'dx': -0.1 * (Math.random() + 0.3),
                'dy': 0,
                'dz': 0,
                'scale': 0.1,
                'color': '#ffff99',
            });
        }

        /* Nyan Cat Properties */
        this.cat = {
            'x': 0, 'y': 0, 'dx': 0, 'dy': 0, 'ddy': 0,
        }
    }



    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button('Up', ['Control', 'w'], () => { this.cat.dy += 0.025 });
        this.key_triggered_button('Left', ['Control', 'a'], () => { this.cat.dx -= 0.025 });
        this.key_triggered_button('Down', ['Control', 's'], () => { this.cat.dy -= 0.025 });
        this.key_triggered_button('Right', ['Control', 'd'], () => { this.cat.dx += 0.025 });
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

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
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

        this.cat.dx = Math.min(this.cat.dx, 0.075);
        this.cat.dy = Math.min(this.cat.dy, 0.075);

        this.cat.dy /= 1.01;
        this.cat.dx /= 1.01;

        let pixel_transform = model_transform
            .times(Mat4.translation(-1 + this.cat.x, 0.6 + this.cat.y, 1))
            .times(Mat4.scale(0.05, 0.05, 0.05))
        for (let i = 0; i < cat_pixels.length; i++) {
            for (let j = 0; j < cat_pixels[i].length; j++) {
                pixel_transform = pixel_transform.times(Mat4.translation(2, 0, 0));
                if (cat_pixels[i][j] != '       ') {
                    this.shapes.pixel.draw(context, program_state, pixel_transform, this.materials.pixel.override({color: hex_color(cat_pixels[i][j])}));
                }
            }
            pixel_transform = pixel_transform.times(Mat4.translation(-32, -2, 0));
        }

        /* Nyan Cat Model End */

        /* Starfield */
        for (let i = 0; i < this.stars.length; i++) {
            const {x, y, z, dx, dy, dz, scale, color} = this.stars[i];
            const star_transform = model_transform
                .times(Mat4.translation(x, y, z))
                .times(Mat4.scale(scale, 0.2 * scale, 0.2 * scale));
            this.shapes.pixel.draw(context, program_state, star_transform, this.materials.pixel.override({color: hex_color(color)}));
            this.stars[i].x += (x + dx >= -6) ? dx : dx + 12;
            this.stars[i].y += dy;
            this.stars[i].z += dz;
        }
        /* Starfield End */

        let box2_angle = (2. / 3.) * Math.PI * dt;
        this.box2_transform = this.rotate ? this.box2_transform.times(Mat4.rotation(0, 0, 1, 0)) : this.box2_transform;

        // Cube 1
        // this.shapes.box_2.draw(context, program_state, this.box2_transform, this.materials.texture_2);
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
                //float dx = mod((2.0 * animation_time), 1.0);
                float dy = mod((1.75 * animation_time), 1.0);
                float u = abs(mod(f_tex_coord.x, 1.0) - 0.5);
                float v = abs(mod(f_tex_coord.y - dy, 1.0) - 0.5);
                

                vec2 translated_tex_coord = vec2(f_tex_coord.x, f_tex_coord.y + dy);

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

// 15 rpm = (30 * pi) / 60s) = (pi / 4)
class Texture_Rotate extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #7.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            void main(){
                // Sample the texture image in the correct place:
                float pi = 3.14159;
                float angle = mod(pi * animation_time / 2.0, 2.0 * pi);

                float u = f_tex_coord.x - 0.5;
                float v = f_tex_coord.y - 0.5;
                
                float s = sin(angle);
                float c = cos(angle);

                mat2 m = mat2(
                    c, -s,
                    s, c
                );
                
                vec4 tex_color;
                vec2 new_coord = m * vec2(u, v);
                vec2 translated_tex_coord = vec2(new_coord.x + 0.5, new_coord.y + 0.5);

                u = abs(new_coord.x);
                v = abs(new_coord.y);

                if ( 
                    (u > 0.25 && u < 0.35 && v < 0.35) ||
                    (v > 0.25 && v < 0.35 && u < 0.35)
                ) {
                    tex_color = vec4(0, 0, 0, 1.0);
                } else {                
                    // Sample the texture image in the correct place:
                    tex_color = texture2D( texture, translated_tex_coord);
                }

                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}