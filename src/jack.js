import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es';

// game difficulty
var game_difficulty = 0.88;

/**  
 * *----------------------------------------------------
 * !                        BullSh*t
 * *----------------------------------------------------
*/

// setup cannon world
var world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -10, 0)
});
world.broadphase = new CANNON.NaiveBroadphase();

// Create the main viewport
const mainViewport = new THREE.WebGLRenderer();
mainViewport.setSize(window.innerWidth , window.innerHeight);
document.getElementById("player-window").appendChild(mainViewport.domElement);

// Create the small viewport
const smallViewport = new THREE.WebGLRenderer();
smallViewport.setSize(200,150);
document.getElementById("map-window").appendChild(smallViewport.domElement);  

// set up object loader
const loader = new GLTFLoader();

// setup key w,a,s and d keys controls
// first we check weather the key is press down or not
var key = [0, 0, 0, 0]; // w,a,s,d
document.addEventListener('keydown', (event) => {
    if (event.key == 'w') {
        key[0] = 1;
    }
    if (event.key == 'a') {
        key[1] = 1;
    }
    if (event.key == 's') {
        key[2] = 1;
    }
    if (event.key == 'd') {
        key[3] = 1;
    }
    if (event.key == 'v'){
        current_view = 1 - current_view;
        console.log("v pressed",current_view);
    }
    if (event.key == 'p'){
        player_health = 10;
    }
});

// now we check weather the key is released or not
document.addEventListener('keyup', (event) => {
    if (event.key == 'w') {
        key[0] = 0;
    }
    if (event.key == 'a') {
        key[1] = 0;
    }
    if (event.key == 's') {
        key[2] = 0;
    }
    if (event.key == 'd') {
        key[3] = 0;
    }
});

/**
 * *----------------------------------------------------
 * !                    variables 
 * *----------------------------------------------------
 * -15.886256049944283, y: 0.16858611008100896, z: -0.15913919139683366}     -17.361612391200016, y: 0.16996734355697357, z: 0.06852630286289164}
 * -15.761376012129082, y: 0.16961688119932763, z: -2.222887618642911}          -17.18197403933237, y: 0.16907944785607956, z: -2.2639746867491533}
 * -17.12779630747794, y: 0.16723018580827567, z: -5.307011754689804}
 */

// constants
var pi = Math.PI;
var total_rival_car = 1;


// acceration of player car
var delta_rotation = 0.5; // in degrees
var delta_speed = 0.00050;

var MAX_speed = 0.08;
var friction_coef = 0.99;

var delta_y = 0.09;

// camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 * 1000);
var camera_offset_view2  = [0,0.17,-0.0000009];
var camera_offset_view3  = [0,0.3,-0.9];

var camera_look_at_offset = [0,0,1];

var current_view = 1;

// adding orbit controls to the player car
controls = new OrbitControls(camera, mainViewport.domElement);
controls.enableDamping = true;
controls.update();

var up_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 * 1000);

// orbit controls
var controls;

// var
var game_over = 0;
var animateID; 
var total_laps_completed = 0;
var lap_required = 2;
var completed_time = 0;
var StartanimateID; 

var distance_travelled_by_car = 0;

// cars

// add player car body
var player_car_model;

// for movement
var player_car_speed = 0;
var player_car_rotation = 0;

// for features
var player_health = 100;
var player_fuel = 100;
var player_fuel_consumption_rate = 0.06;
var player_car_start_point = new THREE.Vector3(-15.761376012129082, 0.16961688119932763 + 0.151 + 0.151, -2.222887618642911);

// actual body that does pyhsics
var player_car_body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0,1.5, 0),
    shape: new CANNON.Box(new CANNON.Vec3(0.21/2, 0.17, 0.5/2))
});
world.addBody(player_car_body);

//*----------------------------------------------------------------------
// add rival car body
var rival_car0_model;
var rival_car0_body;

// features
var rival_car0_collided = 0;
var rival_car0_collided_time = -1;
var rival_car0_path = [];
var rival_car0_start_point = new THREE.Vector3(-15.399843741615424, 0.16940459875709973 + 0.151, 1.7930831948354369);

// for movement
var rival_car0_rotation = 0;
var rival_car0_last_position = new THREE.Vector3(0,0,0);

// time for rival cars
let time_glob = 0;
let time0 = 0,factor0 = game_difficulty ;
let time1 = 0 ,factor1 = game_difficulty *  0.98;
let time2 = 0 ,factor2 = game_difficulty *  0.97;
let time3 = 0 ,factor3 = game_difficulty *  0.96;
let time4 = 0 ,factor4 = game_difficulty *  0.95;

// actual body that does pyhsics
var rival_car0_body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(1,1.5,1),
    shape: new CANNON.Box(new CANNON.Vec3(0.21/2, 0.17, 0.5/2))
});
world.addBody(rival_car0_body);
//*----------------------------------------------------------------------

//*----------------------------------------------------------------------
// add rival car body
var rival_car1_model;
var rival_car1_body;

// features
var rival_car1_collided = 0;
var rival_car1_collided_time = -1;
var rival_car1_path = [];
var rival_car1_start_point = new THREE.Vector3( -15.899843741615424, 0.16940459875709973 + 0.151, 1.7930831948354369);

// for movement
var rival_car1_rotation = 0;
var rival_car1_last_position = new THREE.Vector3(0,0,0);

// actual body that does pyhsics
var rival_car1_body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(1,1.5,1),
    shape: new CANNON.Box(new CANNON.Vec3(0.21/2, 0.17, 0.5/2))
});
world.addBody(rival_car1_body);
//*----------------------------------------------------------------------

//*----------------------------------------------------------------------
// add rival car body
var rival_car2_model;
var rival_car2_body;

// features
var rival_car2_collided = 0;
var rival_car2_collided_time = -1;
var rival_car2_path = [];
var rival_car2_start_point = new THREE.Vector3(-16.399843741615424, 0.16940459875709973 + 0.151, 1.7930831948354369);

// for movement
var rival_car2_rotation = 0;
var rival_car2_last_position = new THREE.Vector3(0,0,0);

// actual body that does pyhsics
var rival_car2_body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(1,1.5,1),
    shape: new CANNON.Box(new CANNON.Vec3(0.21/2, 0.17, 0.5/2))
});
world.addBody(rival_car2_body);
//*----------------------------------------------------------------------

//*----------------------------------------------------------------------
// add rival car body
var rival_car3_model;
var rival_car3_body;

// features
var rival_car3_collided = 0;
var rival_car3_collided_time = -1;
var rival_car3_path = [];
var rival_car3_start_point = new THREE.Vector3(-16.899843741615424, 0.16940459875709973 + 0.151, 1.7930831948354369);

// for movement
var rival_car3_rotation = 0;
var rival_car3_last_position = new THREE.Vector3(0,0,0);

// actual body that does pyhsics
var rival_car3_body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(1,1.5,1),
    shape: new CANNON.Box(new CANNON.Vec3(0.21/2, 0.17, 0.5/2))
});
world.addBody(rival_car3_body);
//*----------------------------------------------------------------------

//*----------------------------------------------------------------------
// add rival car body
var rival_car4_model;
var rival_car4_body;

// features
var rival_car4_collided = 0;
var rival_car4_collided_time = -1;
var rival_car4_path = [];
var rival_car4_start_point = new THREE.Vector3(-17.399843741615424, 0.16940459875709973 + 0.151, 1.7930831948354369);

// for movement
var rival_car4_rotation = 0;
var rival_car4_last_position = new THREE.Vector3(0,0,0);

// actual body that does pyhsics
var rival_car4_body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(1,1.5,1),
    shape: new CANNON.Box(new CANNON.Vec3(0.21/2, 0.17, 0.5/2))
});
world.addBody(rival_car4_body);
//*----------------------------------------------------------------------



// fuel tanks
var fuel_tank1;
var fuel_tank2;
var fuel_tank3;
var fuel_tank4;
var total_fuel_tanks  = 4;
var fuel_tanks_collected_time = [-1,-1,-1,-1];
var fuel_tanks_removed = [0,0,0,0];
var fuel_tank_location = [
    [-0.480979233602732,0.16990408237659313 + 0.151,36.52717883790115],
    [-0.480979233602732,0.16990408237659313 + 0.151,-36.52717883790115],
    [16.382450351685748, 0.16990411427945032 + 0.151, 2.8890390353377513],
    [-16.382450351685748, 0.16990411427945032 + 0.151, 2.8890390353377513],
];

// ground
var groundBody;
var groundMesh;

// path
var master_points = [
    // set(-16,0.5,-6.5);
    new THREE.Vector3(-17, 0.151, 3.5),
    new THREE.Vector3(-17, 0.151, 7.5),
    new THREE.Vector3(-17, 0.151, 12.5),
    new THREE.Vector3(-17, 0.151, 16),
    new THREE.Vector3(-17, 0.151, 20),
    new THREE.Vector3(-15.2, 0.151, 27.0),
    new THREE.Vector3(-12.8, 0.151, 30.5),
    new THREE.Vector3(-10.1, 0.151, 33),
    new THREE.Vector3(-6.6, 0.151, 34.5),
    new THREE.Vector3(0, 0.151, 36),
    new THREE.Vector3(6.6, 0.151, 34.5),
    new THREE.Vector3(10.1, 0.151, 33),
    new THREE.Vector3(12.8, 0.151, 30.5),
    new THREE.Vector3(15.2, 0.151, 27.0),
    new THREE.Vector3(17, 0.151, 20),
    new THREE.Vector3(17, 0.151, 10),
    new THREE.Vector3(17, 0.151, 0),
    new THREE.Vector3(17, 0.151, -10),
    new THREE.Vector3(17, 0.151, -20),
    new THREE.Vector3(15.2, 0.151, -27.0),
    new THREE.Vector3(12.8, 0.151, -30.5),
    new THREE.Vector3(10.1, 0.151, -33),
    new THREE.Vector3(6.6, 0.151, -34.5),
    new THREE.Vector3(0, 0.151, -36),
    new THREE.Vector3(-6.6, 0.151, -34.5),
    new THREE.Vector3(-10.1, 0.151, -33),
    new THREE.Vector3(-12.8, 0.151, -30.5),
    new THREE.Vector3(-15.2, 0.151, -27.0),
    new THREE.Vector3(-17, 0.151, -20),
    new THREE.Vector3(-17, 0.151, -15),
    new THREE.Vector3(-17, 0.151,-5),
];

// message


var scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5))

// let elThreejs = document.getElementById("threejs-element"); // for rending in div with same id not canvas

//setting up renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x00FFFF);

// define the time step and maximum number of substeps per frame
const fixedTimeStep = 1 / 60; // 60 fps
const maxSubSteps = 10; // maximum number of substeps per frame

/** 
 * *----------------------------------------------------
 *  !                   functions
 * *----------------------------------------------------
 */
async function animate() {
    animateID = requestAnimationFrame(animate);

    // console.log("player pos :", player_car_body.position);

    // print location of player car
    // console.log(player_car_body.position);

    // check for 
    checkForFuelTankCollision();
    checkForCarCollision();
    await checkLapCompleteion();

    //printing stuff
    printFuel();
    printHealth();
    printSpeed();
    printTime();
    printMileage();
    printNearbyFuelTanks();

    // print message
    printFuelCollected();

    // end game conditions
    if(player_health <= 0){
        console.log("game over");
        game_over = 1;
        printGameOver(0);
    }
    if(Math.abs(player_car_speed) * 1000 * 120/80 <= 1 && Math.abs(player_fuel) <= 1){
        game_over = 1;
        printGameOver(1);
    }

    if(total_laps_completed == lap_required + 1){
        game_over = 1;
        printGameWin();
    }


    // update
    if(player_car_model != null){
        // update the player car
        updatePlayerCar();

        // update the up-camera
        updateUpCamera();

        //update the controls
        updateControls();

        //update the main camera
        updateMainCamera();
    }
    if(rival_car0_model != null){
        // update the rival car
        updateRivalCar0();
    }
    if(rival_car1_model != null){
        // update the rival car
        updateRivalCar1();
    }
    if(rival_car2_model != null){
        // update the rival car
        updateRivalCar2();
    }
    if(rival_car3_model != null){
        // update the rival car
        updateRivalCar3();
    }
    if(rival_car4_model != null){
        // update the rival car
        updateRivalCar4();
    }
    // update the time
    updateTime();
    updateFuelTanksRotation();
    updateDistanceTravelled();

    // update the physics world
    world.step(fixedTimeStep, 0.016 , maxSubSteps);

    mainViewport.render(scene, camera);

    smallViewport.render(scene, up_camera);
}

async function init() {
    // add lights to scene
    addAmbientLight();

    // point light
    addPointLight();

    // genrate path for rival cars
    await getPathfromMasterPath0(rival_car0_start_point);
    // addPathLine_car(rival_car0_path);
    await getPathfromMasterPath1(rival_car1_start_point);
    // addPathLine_car(rival_car1_path);
    await getPathfromMasterPath2(rival_car2_start_point);
    // addPathLine_car(rival_car2_path);
    await getPathfromMasterPath3(rival_car3_start_point);
    // addPathLine_car(rival_car3_path);
    await getPathfromMasterPath4(rival_car4_start_point);
    // addPathLine_car(rival_car4_path);

    // loading objects
    await addAudience();
    await addPlayerCar();
    await addPlaneRoad();
    await addFuelTanks();
    await addStadium();
    
    await addRivalCar0();
    await addRivalCar1();
    await addRivalCar2();
    await addRivalCar3();
    await addRivalCar4();

    // positioning the player car at start line form var player_car_start_point
    player_car_body.position.set(player_car_start_point.x,player_car_start_point.y,player_car_start_point.z);

    // animate the scene
    animate();
}

// will calulate the angle between 0 to 360 degree
function randomAngleGenerator() {
    var angle = Math.random() * 360;
    return angle;
}

/**
 * *----------------------------------------------------
 * !                   UPDATING OBJECTS
 * *----------------------------------------------------
 */

async function getPathfromMasterPath0(start_point){
    rival_car0_path.push(start_point);
    for(var i=0;i<master_points.length;i++){
        var angle = randomAngleGenerator();
        var x = master_points[i].x + 1 * Math.cos(angle);
        var y = master_points[i].y;
        var z = master_points[i].z + 1 * Math.sin(angle);
        rival_car0_path.push(new THREE.Vector3(x,y,z));  
    }
    rival_car0_path.push(start_point);
}

async function getPathfromMasterPath1(start_point){
    rival_car1_path.push(start_point);
    for(var i=0;i<master_points.length;i++){
        var angle = randomAngleGenerator();
        var x = master_points[i].x + 1 * Math.cos(angle);
        var y = master_points[i].y;
        var z = master_points[i].z + 1 * Math.sin(angle);
        rival_car1_path.push(new THREE.Vector3(x,y,z));  
    }
    rival_car1_path.push(start_point);
}

async function getPathfromMasterPath2(start_point){
    rival_car2_path.push(start_point);
    for(var i=0;i<master_points.length;i++){
        var angle = randomAngleGenerator();
        var x = master_points[i].x + 1 * Math.cos(angle);
        var y = master_points[i].y;
        var z = master_points[i].z + 1 * Math.sin(angle);
        rival_car2_path.push(new THREE.Vector3(x,y,z));  
    }
    rival_car2_path.push(start_point);
}

async function getPathfromMasterPath3(start_point){
    rival_car3_path.push(start_point);
    for(var i=0;i<master_points.length;i++){
        var angle = randomAngleGenerator();
        var x = master_points[i].x + 1 * Math.cos(angle);
        var y = master_points[i].y;
        var z = master_points[i].z + 1 * Math.sin(angle);
        rival_car3_path.push(new THREE.Vector3(x,y,z));  
    }
    rival_car3_path.push(start_point);
}

async function getPathfromMasterPath4(start_point){
    rival_car4_path.push(start_point);
    for(var i=0;i<master_points.length;i++){
        var angle = randomAngleGenerator();
        var x = master_points[i].x + 1 * Math.cos(angle);
        var y = master_points[i].y;
        var z = master_points[i].z + 1 * Math.sin(angle);
        rival_car4_path.push(new THREE.Vector3(x,y,z));  
    }
    rival_car4_path.push(start_point);
}

function getCoordsFromPath(points,time){
    let start, end, i;
    for (i = 0; i < points.length - 1; i++) {
      if (time >= i / (points.length - 1) && time <= (i + 1) / (points.length - 1)) {
        start = points[i];
        end = points[i + 1];
        break;
      }
    }
    if (!start || !end) {
      return null;
    }
    let point = new THREE.Vector3().lerpVectors(start, end, (time - i / (points.length - 1)) * (points.length - 1));
    return point;
}

function updatePlayerCar(){
    // key press
    updateKeyPresses();

    // update the player car
    player_car_model.position.copy(player_car_body.position);

    // chaning the x and z axis based on speed and angle of speed
    player_car_body.position.z -= player_car_speed * Math.cos(player_car_rotation * pi / (180));
    player_car_body.position.x -= player_car_speed * Math.sin(player_car_rotation * pi / (180));

    // now changing the oriantation of the player_body with player_car_rotation
    player_car_model.rotation.y =  player_car_rotation * pi / 180;
    player_car_body.quaternion.copy(player_car_model.quaternion);

    if(current_view == 1){
        // if the a or d key is pressed then change the rotation of the car
        if(key[1] == 1){
            player_car_model.rotation.y += 0.1;
        }
        if(key[3] == 1){
            player_car_model.rotation.y -= 0.1;
        }
    }


}

function updateRivalCar0(){
    // console.log("rival_car0_path 0");
    let new_location =  getCoordsFromPath(rival_car0_path,time0);
    if(new_location == null){
        console.log("error");
    }
    rival_car0_body.position.set(new_location.x,0.151,new_location.z);

    // now find the angle made by the  new loaction - the old location to get angle of rotation of the car
    let angle = Math.atan2(new_location.z - rival_car0_last_position.z, new_location.x - rival_car0_last_position.x) * 180 / pi;
    rival_car0_rotation = 90 - angle ;
    
    // now update the last position
    rival_car0_last_position = new_location;
    // console.log("rival_car0_rotation",rival_car0_rotation);

    // update the rival car by copying the position of the body to the model
    rival_car0_model.position.copy(rival_car0_body.position);

    // chaning the x and z axis based on speed and angle of speed
    // rival_car0_body.position.z -= rival_car0_speed * Math.cos(rival_car0_rotation * pi / (180));
    // rival_car0_body.position.x -= rival_car0_speed * Math.sin(rival_car0_rotation * pi / (180));

    // now changing the oriantation of the player_body with player_car_rotation
    rival_car0_model.rotation.y =  rival_car0_rotation * pi / 180;
    rival_car0_body.quaternion.copy(rival_car0_model.quaternion);
}

function updateRivalCar1(){
    // console.log("rival_car1_path 1",rival_car1_model.position);
    let new_location =  getCoordsFromPath(rival_car1_path,time1);
    ;
    if(new_location == null){
        console.log("error");
    }
    rival_car1_body.position.set(new_location.x,0.151,new_location.z);

    // now find the angle made by the  new loaction - the old location to get angle of rotation of the car
    let angle = Math.atan2(new_location.z - rival_car1_last_position.z, new_location.x - rival_car1_last_position.x) * 180 / pi;
    rival_car1_rotation = 90 - angle ;

    // now update the last position
    rival_car1_last_position = new_location;
    // console.log("rival_car1_rotation",rival_car1_rotation);

    // update the rival car by copying the position of the body to the model
    rival_car1_model.position.copy(rival_car1_body.position);

    // chaning the x and z axis based on speed and angle of speed
    // rival_car1_body.position.z -= rival_car1_speed * Math.cos(rival_car1_rotation * pi / (180));
    // rival_car1_body.position.x -= rival_car1_speed * Math.sin(rival_car1_rotation * pi / (180));

    // now changing the oriantation of the player_body with player_car_rotation
    rival_car1_model.rotation.y =  rival_car1_rotation * pi / 180;
    rival_car1_body.quaternion.copy(rival_car1_model.quaternion);
}

function updateRivalCar2(){
    // console.log("rival_car2_path 1",rival_car2_model.position);
    let new_location =  getCoordsFromPath(rival_car2_path,time2);
    ;
    if(new_location == null){
        console.log("error");
        new_location = rival_car2_last_position;
    }
    // console.log("new_location",new_location);
    rival_car2_body.position.set(new_location.x,0.151,new_location.z);

    // now find the angle made by the  new loaction - the old location to get angle of rotation of the car
    let angle = Math.atan2(new_location.z - rival_car2_last_position.z, new_location.x - rival_car2_last_position.x) * 180 / pi;
    rival_car2_rotation = 90 - angle ;

    // now update the last position
    rival_car2_last_position = new_location;
    // console.log("rival_car2_rotation",rival_car2_rotation);

    // update the rival car by copying the position of the body to the model
    rival_car2_model.position.copy(rival_car2_body.position);

    // chaning the x and z axis based on speed and angle of speed
    // rival_car2_body.position.z -= rival_car2_speed * Math.cos(rival_car2_rotation * pi / (180));
    // rival_car2_body.position.x -= rival_car2_speed * Math.sin(rival_car2_rotation * pi / (180));

    // now changing the oriantation of the player_body with player_car_rotation
    rival_car2_model.rotation.y =  rival_car2_rotation * pi / 180;
    rival_car2_body.quaternion.copy(rival_car2_model.quaternion);
}

function updateRivalCar3(){
    // console.log("rival_car3_path 1",rival_car3_model.position);
    let new_location =  getCoordsFromPath(rival_car3_path,time3);
        if(new_location == null){
        console.log("error");
    }
    rival_car3_body.position.set(new_location.x,0.151,new_location.z);

    // now find the angle made by the  new loaction - the old location to get angle of rotation of the car
    let angle = Math.atan2(new_location.z - rival_car3_last_position.z, new_location.x - rival_car3_last_position.x) * 180 / pi;
    rival_car3_rotation = 90 - angle ;

    // now update the last position
    rival_car3_last_position = new_location;
    // console.log("rival_car3_rotation",rival_car3_rotation);

    // update the rival car by copying the position of the body to the model
    rival_car3_model.position.copy(rival_car3_body.position);

    // chaning the x and z axis based on speed and angle of speed
    // rival_car3_body.position.z -= rival_car3_speed * Math.cos(rival_car3_rotation * pi / (180));
    // rival_car3_body.position.x -= rival_car3_speed * Math.sin(rival_car3_rotation * pi / (180));

    // now changing the oriantation of the player_body with player_car_rotation
    rival_car3_model.rotation.y =  rival_car3_rotation * pi / 180;
    rival_car3_body.quaternion.copy(rival_car3_model.quaternion);
}

function updateRivalCar4(){
    // console.log("rival_car4_path 1",rival_car4_model.position);
    let new_location =  getCoordsFromPath(rival_car4_path,time4);
    ;
    if(new_location == null){
        console.log("error");
    }
    rival_car4_body.position.set(new_location.x,0.151,new_location.z);

    // now find the angle made by the  new loaction - the old location to get angle of rotation of the car
    let angle = Math.atan2(new_location.z - rival_car4_last_position.z, new_location.x - rival_car4_last_position.x) * 180 / pi;
    rival_car4_rotation = 90 - angle ;

    // now update the last position
    rival_car4_last_position = new_location;
    // console.log("rival_car4_rotation",rival_car4_rotation);

    // update the rival car by copying the position of the body to the model
    rival_car4_model.position.copy(rival_car4_body.position);

    // chaning the x and z axis based on speed and angle of speed
    // rival_car4_body.position.z -= rival_car4_speed * Math.cos(rival_car4_rotation * pi / (180));
    // rival_car4_body.position.x -= rival_car4_speed * Math.sin(rival_car4_rotation * pi / (180));

    // now changing the oriantation of the player_body with player_car_rotation
    rival_car4_model.rotation.y =  rival_car4_rotation * pi / 180;
    rival_car4_body.quaternion.copy(rival_car4_model.quaternion);
}

function updateUpCamera(){
    up_camera.position.set(player_car_model.position.x, player_car_model.position.y + 5, player_car_model.position.z - 0.001);
    up_camera.lookAt(player_car_model.position.x, player_car_model.position.y, player_car_model.position.z);
}

function updateControls(){
    controls.target.set(player_car_model.position.x, player_car_model.position.y, player_car_model.position.z);
}

function updateKeyPresses(){
    // w
    if (key[0] == 1) {
        // console.log("w");
        // will only accelerate if fuel is available
        if (player_fuel > 0) {
            player_fuel -= player_fuel_consumption_rate;
            
            if (player_car_speed >= -1 * MAX_speed) {
                player_car_speed -= delta_speed;
            }
        }
        else{
            key[0] = 0;
        }
        // consume fuel
    }
    // a
    if (key[1] == 1) {
        // console.log("a");
        player_car_rotation += delta_rotation;
    }
    // s
    if (key[2] == 1) {
        // console.log("s");
        if (player_fuel > 0) {
            player_fuel -= player_fuel_consumption_rate;
            
            if (player_car_speed <= 1 * MAX_speed) {
                player_car_speed += delta_speed;
            }
        }
        else{
            key[2] = 0;
        }
    }
    // d
    if (key[3] == 1) {
        // console.log("d");
        player_car_rotation -= delta_rotation;
    }

    // friction
    if (key[0] == 0 && key[2] == 0) {
        if (player_car_speed > 0) {
            player_car_speed = player_car_speed * friction_coef;
        }
        else {
            player_car_speed = player_car_speed * friction_coef;
        }
    }
}

function updateMainCamera(){
    // adding camera to the player car
    if(current_view == 1){
        player_car_rotation = -1 * player_car_rotation;
        var del_x = camera_offset_view3[0] * Math.cos(player_car_rotation * pi / (180)) - camera_offset_view3[2] * Math.sin(player_car_rotation * pi / (180));
        var del_z = camera_offset_view3[0] * Math.sin(player_car_rotation * pi / (180)) + camera_offset_view3[2] * Math.cos(player_car_rotation * pi / (180));

        camera.position.set(player_car_model.position.x + del_x, player_car_model.position.y + camera_offset_view3[1], player_car_model.position.z + del_z);
        camera.lookAt(player_car_model.position.x, player_car_model.position.y, player_car_model.position.z);  
        player_car_rotation = -1 * player_car_rotation;
        
        // want to perform rotation on then camera

    }
    else if(current_view == 0){
        player_car_rotation = -1 * player_car_rotation;

        var del_x = camera_offset_view2[0] * Math.cos(player_car_rotation * pi / (180)) - camera_offset_view2[2] * Math.sin(player_car_rotation * pi / (180));
        var del_z = -camera_offset_view2[0] * Math.sin(player_car_rotation * pi / (180)) - camera_offset_view2[2] * Math.cos(player_car_rotation * pi / (180));

        var look_at_z = camera_look_at_offset[2] * Math.cos(player_car_rotation * pi / (180)) ;
        var look_at_x = camera_look_at_offset[2] * Math.sin(-player_car_rotation * pi / (180)) ;

        camera.position.set(player_car_model.position.x + del_x, player_car_model.position.y + camera_offset_view2[1], player_car_model.position.z + del_z);
        camera.lookAt(player_car_model.position.x + look_at_x, player_car_model.position.y, player_car_model.position.z + look_at_z); 
    
        player_car_rotation = -1 * player_car_rotation;
    }
}

function updateTime(){
    time_glob += 0.1;
    time0 += 0.00047 * factor0;
    time1 += 0.00047 * factor1;
    time2 += 0.00047 * factor2;
    time3 += 0.00047 * factor3;
    time4 += 0.00047 * factor4;
    if (time0 > 1) {
        time0 = 0;
        console.log("note 1: ",time_glob); // 84.5
    }
    if(time1 > 1){
        time1 = 0;
        console.log("note 2: ",time_glob);
    }
    if(time2 > 1){
        time2 = 0;
        console.log("note 3: ",time_glob);
    }
    if(time3 > 1){
        time3 = 0;
        console.log("note 4: ",time_glob);
    }
    if(time4 > 1){
        time4 = 0;
        console.log("note 5: ",time_glob);
    }
}

function updateFuelTanksRotation(){
    if(fuel_tank4 ==null){
        return
    }
    fuel_tank1.rotation.y = time0 * 2 * pi * 20;
    fuel_tank2.rotation.y = time0 * 2 * pi * 20;
    fuel_tank3.rotation.y = time0 * 2 * pi * 20;
    fuel_tank4.rotation.y = time0 * 2 * pi * 20;
}

function updateDistanceTravelled(){
    distance_travelled_by_car += Math.abs(player_car_speed) * time0;
}

function checkForFuelTankCollision(){
    for (let i = 0; i < 4; i++) {
        if(fuel_tanks_removed[i] == 0){
            var d = disctance(player_car_body.position.x,player_car_body.position.y,player_car_body.position.z,fuel_tank_location[i][0],fuel_tank_location[i][1],fuel_tank_location[i][2])
            if( d <= 0.35){
                if( i == 0) {
                    console.log("tank 0 is collected !!!!!!!!!!!!");
                    fuel_tank1.position.set(fuel_tank1.position.x,-100 + fuel_tank1.position.y,fuel_tank1.position.z)
                    fuel_tanks_removed[i] = 1;
                    fuel_tanks_collected_time[i] = 300;
                    player_fuel = (player_fuel+30);
                    if(player_fuel > 100){
                        player_fuel = 100;
                    } 
                }
                if( i == 1) {
                    console.log("tank 1 is collected !!!!!!!!!!!!");
                    fuel_tank2.position.set(fuel_tank2.position.x,-100 + fuel_tank2.position.y,fuel_tank2.position.z)
                    fuel_tanks_removed[i] = 1;
                    fuel_tanks_collected_time[i] = 300;
                    player_fuel = (player_fuel+30);
                    if(player_fuel > 100){
                        player_fuel = 100;
                    } 
                }
                if( i == 2) {
                    console.log("tank 2 is collected !!!!!!!!!!!!");
                    fuel_tank3.position.set(fuel_tank3.position.x,-100 + fuel_tank3.position.y,fuel_tank3.position.z)
                    fuel_tanks_removed[i] = 1;
                    fuel_tanks_collected_time[i] = 300;
                    player_fuel = (player_fuel+30);
                    if(player_fuel > 100){
                        player_fuel = 100;
                    } 
                }
                if( i == 3) {
                    console.log("tank 3 is collected !!!!!!!!!!!!");
                    fuel_tank4.position.set(fuel_tank4.position.x,-100 + fuel_tank4.position.y,fuel_tank4.position.z)
                    fuel_tanks_removed[i] = 1;
                    fuel_tanks_collected_time[i] = 300;
                    player_fuel = (player_fuel+30);
                    if(player_fuel > 100){
                        player_fuel = 100;
                    } 
                }
            }
        }
        if(fuel_tanks_collected_time[i] >= 0){
            // console.log("fule has been consumed");
            fuel_tanks_collected_time[i]--;
        }
        else if(fuel_tanks_removed[i] == 1){
            console.log("fule being added is ",i);
            fuel_tanks_removed[i] = 0;
            fuel_tanks_collected_time[i] = -1;

            if( i == 0) {
                console.log("tank 0 is restored !!!!!!!!!!!!");
                fuel_tank1.position.set(fuel_tank1.position.x,100 + fuel_tank1.position.y,fuel_tank1.position.z);
            }
            if( i == 1) {
                console.log("tank 1 is restored !!!!!!!!!!!!");
                fuel_tank2.position.set(fuel_tank2.position.x,100 + fuel_tank2.position.y,fuel_tank2.position.z);
            }
            if( i == 2) {
                console.log("tank 2 is restored !!!!!!!!!!!!");
                fuel_tank3.position.set(fuel_tank3.position.x,100 + fuel_tank3.position.y,fuel_tank3.position.z);
            }
            if( i == 3) {
                console.log("tank 3 is restored !!!!!!!!!!!!");
                fuel_tank4.position.set(fuel_tank4.position.x,100 + fuel_tank4.position.y,fuel_tank4.position.z);
            }
        }
    }
}

function checkForCarCollision(){
    var d = disctance(player_car_body.position.x,player_car_body.position.y,player_car_body.position.z,rival_car0_body.position.x,rival_car0_body.position.y,rival_car0_body.position.z);
    if(rival_car0_collided == 0){
        if(d <= 0.7 * game_difficulty){
            // console.log("car collision");
            rival_car0_collided = 1;
            player_health -= 10;
        }
    }
    else if(rival_car0_collided == 1){
        printCarCollision();
        console.log("car collision cool down");
        if(d >= 0.7 * game_difficulty){
            cancelPrintCarCollision();
            // console.log("car awat from collision");
            rival_car0_collided = 0;
        }
    }

    var d = disctance(player_car_body.position.x,player_car_body.position.y,player_car_body.position.z,rival_car1_body.position.x,rival_car1_body.position.y,rival_car1_body.position.z);
    if(rival_car1_collided == 0){
        if(d <= 0.7 * game_difficulty){
            // console.log("car collision");
            rival_car1_collided = 1;
            player_health -= 10;
        }
    }
    else if(rival_car1_collided == 1){
        printCarCollision();
        console.log("car collision cool down");
        if(d >= 0.7 * game_difficulty){
            cancelPrintCarCollision();
            // console.log("car awat from collision");
            rival_car1_collided = 0;
        }
    }

    var d = disctance(player_car_body.position.x,player_car_body.position.y,player_car_body.position.z,rival_car2_body.position.x,rival_car2_body.position.y,rival_car2_body.position.z);
    if(rival_car2_collided == 0){
        if(d <= 0.7 * game_difficulty){
            // console.log("car collision");
            rival_car2_collided = 1;
            player_health -= 10;
        }
    }
    else if(rival_car2_collided == 1){
        printCarCollision();
        console.log("car collision cool down");
        if(d >= 0.7 * game_difficulty){
            cancelPrintCarCollision();
            // console.log("car awat from collision");
            rival_car2_collided = 0;
        }
    }

    var d = disctance(player_car_body.position.x,player_car_body.position.y,player_car_body.position.z,rival_car3_body.position.x,rival_car3_body.position.y,rival_car3_body.position.z);
    if(rival_car3_collided == 0){
        if(d <= 0.7 * game_difficulty){
            // console.log("car collision");
            rival_car3_collided = 1;
            player_health -= 10;
        }
    }
    else if(rival_car3_collided == 1){
        printCarCollision();
        console.log("car collision cool down");
        if(d >= 0.7 * game_difficulty){
            cancelPrintCarCollision();
            // console.log("car awat from collision");
            rival_car3_collided = 0;
        }
    }
    var d = disctance(player_car_body.position.x,player_car_body.position.y,player_car_body.position.z,rival_car4_body.position.x,rival_car4_body.position.y,rival_car4_body.position.z);
    if(rival_car4_collided == 0){
        if(d <= 0.7 * game_difficulty){
            // console.log("car collision");
            rival_car4_collided = 1;
            player_health -= 10;
        }
    }
    else if(rival_car4_collided == 1){
        printCarCollision();
        console.log("car collision cool down");
        if(d >= 0.7 * game_difficulty){
            cancelPrintCarCollision();
            // console.log("car awat from collision");
            rival_car4_collided = 0;
        }
    }
}

function checkLapCompleteion(){
    let checkpoints = [
        [-14.399843741615424, 0.16940459875709973, 1.7930831948354369],
        [-16.399843741615424, 0.16940459875709973, 1.7930831948354369],
        [-18.399843741615424, 0.16940459875709973, 1.7930831948354369],
        [-19.399843741615424, 0.16940459875709973, 1.7930831948354369]
    ];
    // console.log("lap completed: ",disctance(player_car_body.position.x,player_car_body.position.y,player_car_body.position.z,checkpoints[i][0],checkpoints[i][1],checkpoints[i][2]));
    for (let i = 0; i < 4; i++) {
        let d = disctance(player_car_body.position.x,player_car_body.position.y,player_car_body.position.z,checkpoints[i][0],checkpoints[i][1],checkpoints[i][2]); 
        if(d < 1){
            // check if disctance travlled by the car is greater than the lap distance
            if(distance_travelled_by_car > 90 * (total_laps_completed)){
                console.log("lap completed: ");
                total_laps_completed += 1;
                console.log("lap :",total_laps_completed);
                console.log("lap time: ",time_glob);
                completed_time = time_glob;
            }
        }
    }
}

function disctance(x1,y1,z1,x2,y2,z2){
    var d1 = x1 - x2;
    var d2 = y1 - y2;
    var d3 = z1 - z2;
    return Math.sqrt(d1*d1+d2*d2+d3*d3);
}

/**
 * *----------------------------------------------------
 * !                   ADDING OBJECTS
 * *----------------------------------------------------
 */

function addAmbientLight() {
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
}

function addPointLight() {
    var pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 50, 0);
    scene.add(pointLight);
}

async function addFuelTanks(){

    loader.load(
        "../assets/3Dmodels/fuel_tank/scene.gltf",
        (gltf) => {
            gltf.scene.scale.set(1/10, 1/10, 1/10);
            fuel_tank1 = gltf.scene;
            fuel_tank_location[0][0] += Math.cos(randomAngleGenerator())            
            fuel_tank_location[0][2] += Math.cos(randomAngleGenerator())
            gltf.scene.position.set(fuel_tank_location[0][0] ,fuel_tank_location[0][1],fuel_tank_location[0][2]);
            scene.add(gltf.scene);
        }
    );

    loader.load(
        "../assets/3Dmodels/fuel_tank/scene.gltf",
        (gltf) => {
            gltf.scene.scale.set(1/10, 1/10, 1/10);
            fuel_tank2 = gltf.scene;
            fuel_tank_location[1][0] += Math.cos(randomAngleGenerator())            
            fuel_tank_location[1][2] += Math.cos(randomAngleGenerator())
            gltf.scene.position.set(fuel_tank_location[1][0] ,fuel_tank_location[1][1],fuel_tank_location[1][2]);
            scene.add(gltf.scene);
        }
    );

    loader.load(
        "../assets/3Dmodels/fuel_tank/scene.gltf",
        (gltf) => {
            gltf.scene.scale.set(1/10, 1/10, 1/10);
            fuel_tank3 = gltf.scene;
            fuel_tank_location[2][0] += Math.cos(randomAngleGenerator())            
            fuel_tank_location[2][2] += Math.cos(randomAngleGenerator())
            gltf.scene.position.set(fuel_tank_location[2][0] ,fuel_tank_location[2][1],fuel_tank_location[2][2]);
            scene.add(gltf.scene);
        }
    );

    loader.load(
        "../assets/3Dmodels/fuel_tank/scene.gltf",
        (gltf) => {
            gltf.scene.scale.set(1/10, 1/10, 1/10);
            fuel_tank4 = gltf.scene;
            fuel_tank_location[3][0] += Math.cos(randomAngleGenerator())            
            fuel_tank_location[3][2] += Math.cos(randomAngleGenerator())
            gltf.scene.position.set(fuel_tank_location[3][0] ,fuel_tank_location[3][1],fuel_tank_location[3][2]);
            scene.add(gltf.scene);
        }
    );
}

async function addPlayerCar() {
    loader.load(
        "../assets/3Dmodels/pixel_toyota_corolla_e96/scene.gltf",
        (gltf) => {
            player_car_model = gltf.scene;
            player_car_model.scale.set(0.001, 0.001, 0.001);
            player_car_model.position.set(0, 1, 0);
            scene.add(player_car_model);
        },
        // Use the onProgress callback to show the loading progress
        (xhr) => {
            console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
        },// Use the onError callback to handle any errors during the loading process
        (error) => {
            console.error('An error occurred while loading the model:', error);
        });
}

async function addRivalCar0() {
    loader.load(
        "../assets/3Dmodels/pixel_toyota_corolla_e81/scene.gltf",
        (gltf) => {
            rival_car0_model = gltf.scene;
            gltf.scene.scale.set(0.001, 0.001, 0.001);

            scene.add(rival_car0_model);
            console.log("rival car 0 added");
        },
        // Use the onProgress callback to show the loading progress
        (xhr) => {
            console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
        },// Use the onError callback to handle any errors during the loading process
        (error) => {
            console.error('An error occurred while loading the model:', error);
    });
}

async function addRivalCar1() {
    loader.load(
        "../assets/3Dmodels/pixel_toyota_corolla_e80/scene.gltf",
        (gltf) => {
            rival_car1_model = gltf.scene;
            gltf.scene.scale.set(0.001, 0.001, 0.001);

            scene.add(rival_car1_model);
            console.log("rival car 1 added");
        },
        // Use the onProgress callback to show the loading progress
        (xhr) => {
            console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
        },// Use the onError callback to handle any errors during the loading process
        (error) => {
            console.error('An error occurred while loading the model:', error);
    });
}

async function addRivalCar2() {
    loader.load(
        "../assets/3Dmodels/pixel_toyota_corolla_e81/scene.gltf",
        (gltf) => {
            rival_car2_model = gltf.scene;
            gltf.scene.scale.set(0.001, 0.001, 0.001);

            scene.add(rival_car2_model);
            console.log("rival car 2 added");
        },
        // Use the onProgress callback to show the loading progress
        (xhr) => {
            console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
        },// Use the onError callback to handle any errors during the loading process
        (error) => {
            console.error('An error occurred while loading the model:', error);
    });
}

async function addRivalCar3() {
    loader.load(
        "../assets/3Dmodels/pixel_toyota_corolla_e81/scene.gltf",
        (gltf) => {
            rival_car3_model = gltf.scene;
            gltf.scene.scale.set(0.001, 0.001, 0.001);

            scene.add(rival_car3_model);
            console.log("rival car 4 added");
        },
        // Use the onProgress callback to show the loading progress
        (xhr) => {
            console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
        },// Use the onError callback to handle any errors during the loading process
        (error) => {
            console.error('An error occurred while loading the model:', error);
    });
}

async function addRivalCar4() {
    loader.load(
        "../assets/3Dmodels/pixel_toyota_corolla_e81/scene.gltf",
        (gltf) => {
            rival_car4_model = gltf.scene;
            gltf.scene.scale.set(0.001, 0.001, 0.001);

            scene.add(rival_car4_model);
            console.log("rival car 4 added");
        },
        // Use the onProgress callback to show the loading progress
        (xhr) => {
            console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
        },// Use the onError callback to handle any errors during the loading process
        (error) => {
            console.error('An error occurred while loading the model:', error);
    });
}

async function addPlaneRoad() {
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load("../assets/textures/road.png", function (texture) {
        var planeGeometry = new THREE.PlaneGeometry(100, 100, 32);
        var planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        groundMesh = new THREE.Mesh(planeGeometry, planeMaterial);

        groundMesh.rotateX(pi / 2);
        groundMesh.rotateZ(pi / 2);

        scene.add(groundMesh);

        // create ground for the plane
        groundBody = new CANNON.Body({
            shape: new CANNON.Plane(),
            mass: 0, // mass == 0 makes the body static
        });
        world.addBody(groundBody);

        groundBody.quaternion.setFromEuler(-pi / 2, 0, 0, 'XYZ');

    },
    // Use the onProgress callback to show the loading progress
    (xhr) => {
        console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    // Use the onError callback to handle any errors during the loading process
    (error) => {
        console.error('An error occurred while loading the model:', error);
    });
}

async function addStadium() {
    // Load the 3MF model using the GLTFLoader's load method
    loader.load(
        '../assets/3Dmodels/racetrack_color_blender1.glb',
        (gltf) => {
            // The gltf parameter is the loaded model
            gltf.scene.rotateX(-pi / 2);
            gltf.scene.scale.set(1.0 * 150 * 14.8 / 14, 1.0 * 150 * 14.8 / 14, 1.0 * 150 * 14.8 / 14);
            gltf.scene.position.set(0, -30.55, 0);
            gltf.scene.rotateZ(pi);

            // Add the loaded object to the scene
            scene.add(gltf.scene);

            // Perform any additional operations on the object
        },
        // Use the onProgress callback to show the loading progress
        (xhr) => {
            console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
        },
        // Use the onError callback to handle any errors during the loading process
        (error) => {
            console.error('An error occurred while loading the model:', error);
        }
    );
}

// box geometry at origin
async function addSkyBox(){
    // make a blue color box in threejs
    var geometry = new THREE.BoxGeometry( 40, 20, 40 );
    var material = new THREE.MeshBasicMaterial( {
        DoubleSide: true,
        color: 0x0000ff} );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(0,10,0);
    scene.add( cube );
}

async function addAudience() {
    // Load the 3MF model using the GLTFLoader's load method
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load("../assets/textures/mass.jpg", function (texture) {
        var planeGeometry = new THREE.PlaneGeometry(15, 3, 32);
        var planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        groundMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        
        // groundMesh.rotateZ(pi / 4);
        groundMesh.rotateY(pi / 2);
        groundMesh.rotateX(-pi / 4);

        groundMesh.position.set(-23,2,-9);

        scene.add(groundMesh);
    },
    // Use the onProgress callback to show the loading progress
    (xhr) => {
        console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    // Use the onError callback to handle any errors during the loading process
    (error) => {
        console.error('An error occurred while loading the model:', error);
    });
    
    // Load the 3MF model using the GLTFLoader's load method
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load("../assets/textures/mass.jpg", function (texture) {
        var planeGeometry = new THREE.PlaneGeometry(15, 3, 32);
        var planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        groundMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        
        // groundMesh.rotateZ(pi / 4);
        groundMesh.rotateY(pi / 2);
        groundMesh.rotateX(-pi / 4);

        groundMesh.position.set(-23,2,9);

        scene.add(groundMesh);
    },
    // Use the onProgress callback to show the loading progress
    (xhr) => {
        console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    // Use the onError callback to handle any errors during the loading process
    (error) => {
        console.error('An error occurred while loading the model:', error);
    });

        // Load the 3MF model using the GLTFLoader's load method
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load("../assets/textures/mass.jpg", function (texture) {
            var planeGeometry = new THREE.PlaneGeometry(15, 3, 32);
            var planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            groundMesh = new THREE.Mesh(planeGeometry, planeMaterial);
            
            // groundMesh.rotateZ(pi / 4);
            groundMesh.rotateY(pi / 2);
            groundMesh.rotateX(pi / 4);
    
            groundMesh.position.set(23,2,-9);
    
            scene.add(groundMesh);
        },
        // Use the onProgress callback to show the loading progress
        (xhr) => {
            console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
        },
        // Use the onError callback to handle any errors during the loading process
        (error) => {
            console.error('An error occurred while loading the model:', error);
        });

    // Load the 3MF model using the GLTFLoader's load method
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load("../assets/textures/mass.jpg", function (texture) {
        var planeGeometry = new THREE.PlaneGeometry(15, 3, 32);
        var planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        groundMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        
        // groundMesh.rotateZ(pi / 4);
        groundMesh.rotateY(pi / 2);
        groundMesh.rotateX(pi / 4);

        groundMesh.position.set(23,2,9);

        scene.add(groundMesh);
    },
    // Use the onProgress callback to show the loading progress
    (xhr) => {
        console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    // Use the onError callback to handle any errors during the loading process
    (error) => {
        console.error('An error occurred while loading the model:', error);
    });
        
}

async function addPathLine_car(array) {
    let points = [
    ];
    for (let i = 0; i < array.length; i++) {
        if(array[i].x == NaN || array[i].y == NaN || array[i].z == NaN){
            console.log("nan !!!!!!!!!!!!!!!!!!!!!!!",i,":",array[i]);
        }
        points.push(new THREE.Vector3(array[i].x, array[i].y + 1, array[i].z));
    }
    const material = new THREE.LineBasicMaterial({
        color: 0x00FFFF
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    let line = new THREE.Line(geometry, material);

    scene.add(line);
}

/**
 * *----------------------------------------
 * !                PRINT
 * *----------------------------------------
 */

function printSpeed(){
    // console.log("speed",player_car_speed);
    let speed = player_car_speed * 1000 * 120/80 - 1 ;
    // print absolute value of speed
    speed = Math.abs(speed);
    // covert to integer
    speed = Math.round(speed);
    document.getElementById("speed").innerHTML = "SPEED \t: " + speed;
}

function printFuel(){
    // console.log("fuel",player_fuel)
    // conver to int and print  
    let display_fuel = player_fuel;
    display_fuel = Math.round(display_fuel);
    document.getElementById("fuel").innerHTML = "FUEL  \t: " + display_fuel;
}

function printHealth(){
    // console.log("health",player_health);
    let display_health = player_health;
    display_health = Math.round(display_health/10);

    let str = "\t";
    let i = 0;

    for (i = 0; i < display_health; i++) {
        str += "&hearts;";
    }

    document.getElementById("health").innerHTML = str;
}

function printTime(){
    // console.log("time",time);
    let display_time = time_glob;
    display_time = Math.round(display_time);
    document.getElementById("time").innerHTML = "TIME  \t: " + display_time;
}

function printMileage(){
    let mileage = Math.round( distance_travelled_by_car / time0 );
    // console.log("mileage",mileage);
    document.getElementById("mileage").innerHTML = "MILEAGE  \t: " + mileage ;
}

function printNearbyFuelTanks(){
    let d = [10000,10000,10000,10000];

    for (let i = 0; i < total_fuel_tanks; i++) {
        if(fuel_tanks_removed[i] == 0){
            d[i] = disctance(player_car_body.position.x,player_car_body.position.y,player_car_body.position.z,fuel_tank_location[i][0],fuel_tank_location[i][1],fuel_tank_location[i][2])
        }        
    }

    let dmin = Math.round(Math.min(d[0],d[1],d[2],d[3]));
    // console.log("dmin : ",dmin);
    document.getElementById("fuel-tank-message").innerHTML = "NEAREST FUEL TANK : " + dmin;
}

function printFuelCollected(){
    // console.log("fuel_collected",fuel_collected);
    var any = 0;
    for (let i = 0; i <total_fuel_tanks; i++) {
        if(fuel_tanks_removed[i] == 1){
            document.getElementById("fuel-consumed-message").innerHTML = "FUEL COLLECTED ! ";
            document.getElementById("fuel-consumed-message").style.fontWeight = "bold";
            document.getElementById("fuel-consumed-message").style.color = "rgb(144, 238, 00)";
            any++;
        }
    }
    if(any == 0){
        document.getElementById("fuel-consumed-message").innerHTML = "";
    }
}

function printCarCollision(){
    document.getElementById("car-collision-message").style.color = "red";
    document.getElementById("car-collision-message").style.fontWeight = "bold";
    document.getElementById("car-collision-message").innerHTML = "CAR COLLISION ! ";
}

function cancelPrintCarCollision(){
    document.getElementById("car-collision-message").innerHTML = "";
}

function printGameOver(details){
    if (game_over == 1) {
        var game_over_message_print = ["You ran out of health!","You ran out of fuel!","leader board : "];
        const game_over_message = document.getElementById('game-over-message');
        game_over_message.innerText = 'Game Over! \n' + game_over_message_print[details];
        game_over_message.style.background = 'rgba(95, 0, 0, 0.74)';
        game_over_message.style.height = '100%';
        game_over_message.style.top = '0px';
        game_over_message.style.alignContent = 'center';
        cancelAnimationFrame(animateID);
        return;
    }
    else{
        document.getElementById("game-over-message").innerHTML = "";
    }
    renderer.setAnimationLoop(null);  
}

function printGameWin(){
    if (game_over == 1) {
        var car_names =[
            "Ferrari0",
            "Ferrari1",
            "Ferrari2",
            "Ferrari3",
            "Ferrari4",
        ]
        var standing = [
            241.79999999999055 * lap_required,
            246.79999999999026 * lap_required,
            249.29999999999012 * lap_required,
            251.89999999998997 * lap_required,
            254.59999999998982 * lap_required
        ];

        if(completed_time < standing[0]){
            var position = 0 + 1;
        }
        else if(completed_time < standing[1]){
            var position = 1 + 1;
        }
        else if(completed_time < standing[2]){
            var position = 2 + 1;
        }
        else if(completed_time < standing[3]){
            var position = 3 + 1;
        }
        else if(completed_time < standing[4]){
            var position = 4 + 1;
        }
        else{
            var position = 5 + 1;
        }
        let standing_message_be = " leader board : \n";

        if(position != 6){
            let x_s = 0; 
            for (let i = 0; i < 6; i++) {
                if(i == position - 1){
                    i++;
                    standing_message_be += (i) + " : " + "YOU - " + completed_time + " \n";
                    x_s = 1;
                }else{
                    standing_message_be += (i+1 -x_s) + " : " + car_names[i-x_s] + " - " + standing[i - x_s] + " \n";
                }
            } 
        }
        else{
            let x_s = 0; 
            for (let i = 0; i < 5; i++) {
                standing_message_be += (i+1) + " : " + car_names[i] + " - " + standing[x_s] + " \n";
                x_s ++;
            } 
            standing_message_be += "6 : YOU - " + completed_time + " \n";
        }


        const game_over_message = document.getElementById('game-over-message');
        game_over_message.innerText = 'Game Win! \n' + standing_message_be;
        game_over_message.style.background = 'rgba(95, 95, 95, 0.74)';
        game_over_message.style.height = '100%';
        game_over_message.style.top = '0px';
        game_over_message.style.alignContent = 'center';
        game_over_message.style.color = 'rgb(144, 238, 00)';
        game_over_message.style.fontSize = '30px';
        cancelAnimationFrame(animateID);
    }
    else{
        document.getElementById("game-over-message").innerHTML = "";
    }
    renderer.setAnimationLoop(null);  
}

/** 
 * *--------------------------------------------------------------------
 * !                              main
 * *--------------------------------------------------------------------
 * 
 */

gameStart();
init();
console.log("init done");

/**
 * *--------------------------------------------------------------------
 * !                              gameStart    
 * *--------------------------------------------------------------------
*/

function gameStart(){
    console.log("gameStart");
}