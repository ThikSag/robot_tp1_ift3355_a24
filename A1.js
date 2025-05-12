// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix = a;
  this.matrix.decompose(this.position, this.quaternion, this.scale);
};

var start = Date.now();

// SETUP RENDERER AND SCENE
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff); // white background colour
document.body.appendChild(renderer.domElement);

// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(10,5,10);
camera.lookAt(scene.position);
scene.add(camera);

// SETUP ORBIT CONTROL OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();

// FLOOR WITH CHECKERBOARD
var floorTexture = new THREE.ImageUtils.loadTexture('images/tile.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;
floorTexture.repeat.set(4, 4);

var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floorGeometry = new THREE.PlaneBufferGeometry(15, 15);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
floor.position.y = 0.0;
scene.add(floor);

// TRANSFORMATIONS

/**
 * Multiplies m1 x m2.
 * @param m1 : THREE.Matrix4
 * @param m2 : THREE.Matrix4
 * @returns {THREE.Matrix4} The resulting matrix as a new matrix.
 */
function multMat(m1, m2){
  return new THREE.Matrix4().multiplyMatrices(m1, m2);
}

/**
 * Inverts matrix 'm'. If the determinant of matrix 'm' is 0, matrix 'm' can't be
 * inverted and a zero matrix is returned instead.
 * @param m : THREE.Matrix4 The matrix to be inverted.
 * @returns {THREE.Matrix4} The resulting matrix as a new matrix.
 */
function invertMat(m){
  return new THREE.Matrix4().getInverse(m, true);
}

/**
 * Creates an identity matrix.
 * @returns {THREE.Matrix4}
 */
function idMat4() {
  let m = new THREE.Matrix4();

  m.set(1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);

  return m;
}

/**
 * Applies a translation [x, y, z] to 'matrix'.
 * @param matrix : THREE.Matrix4 The matrix to be translated.
 * @param x : float The translation to be applied on the X axis.
 * @param y : float The translation to be applied on the Y axis.
 * @param z : float The translation to be applied on the Z axis.
 * @returns {THREE.Matrix4} The resulting matrix as a new matrix.
 */
function translateMat(matrix, x, y, z) {
  let m = new THREE.Matrix4();

  m.set(1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1);

  return multMat(m, matrix);
}

/**
 * Applies a rotation to 'matrix' by 'angle' with respect to 'axis'.
 * @param matrix : THREE.Matrix4 The matrix to be rotated.
 * @param angle : float The angle of the rotation in radian.
 * @param axis : string The axis 'x', 'y' or 'z' on which the rotation is made. If it's not
 *                      one of these 3 options, then no rotation is made.
 * @returns {THREE.Matrix4} The resulting matrix as a new matrix.
 */
function rotateMat(matrix, angle, axis){
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let m = new THREE.Matrix4();

  // Set the rotation matrix based on the chosen axis.
  switch (axis) {
    case "x":
      m.set(1, 0,   0,    0,
            0, cos, -sin, 0,
            0, sin, cos,  0,
            0, 0,   0,    1);
      break;

    case "y":
      m.set(cos,  0, sin, 0,
            0,    1, 0,   0,
            -sin, 0, cos, 0,
            0,    0, 0,   1);
      break;

    case "z":
      m.set(cos, -sin, 0, 0,
            sin, cos,  0, 0,
            0,   0,    1, 0,
            0,   0,    0, 1);
      break;

    default:
      // If 'axis' isn't a valid 3D axis, then no rotation is made.
      // In this case, the identity matrix is used.
      m = idMat4();
      break;
  }

  return multMat(m, matrix);
}

/**
 * Applies a rotation to vector 'v' by 'angle' with respect to 'axis'.
 * @param v : THREE.Vector3
 * @param angle : float The angle of the rotation in radian.
 * @param axis : string The axis 'x', 'y' or 'z' on which the rotation is made. If it's not
 *                      one of these 3 options, then no rotation is made.
 * @returns {THREE.Vector3} The resulting vector as a new vector.
 */
function rotateVec3(v, angle, axis){
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let m = new THREE.Matrix4();

  // Set the rotation matrix based on the chosen axis.
  switch (axis) {
    case "x":
      m.set(1, 0,   0,    0,
            0, cos, -sin, 0,
            0, sin, cos,  0,
            0, 0,   0,    1);
      break;

    case "y":
      m.set(cos,  0, sin, 0,
            0,    1, 0,   0,
            -sin, 0, cos, 0,
            0,    0, 0,   1);
      break;

    case "z":
      m.set(cos, -sin, 0, 0,
            sin, cos,  0, 0,
            0,   0,    1, 0,
            0,   0,    0, 1);
      break;

    default:
      // If 'axis' isn't a valid 3D axis, then no rotation is made.
      // In this case, the identity matrix is used.
      m = idMat4();
      break;
  }

  let rv = new THREE.Vector3();
  rv.x = v.x;
  rv.y = v.y;
  rv.z = v.z;
  rv.applyMatrix4(m);
  return rv;
}

/**
 * Applies a scaling [x, y, z] to 'matrix'.
 * @param matrix : THREE.Matrix4 The matrix to be scaled.
 * @param x : float The scaling to be applied on the X axis.
 * @param y : float The scaling to be applied on the Y axis.
 * @param z : float The scaling to be applied on the Z axis.
 * @returns {THREE.Matrix4} The resulting matrix as a new matrix.
 */
function rescaleMat(matrix, x, y, z){
  const m = new THREE.Matrix4().set(x, 0, 0, 0,
                                    0, y, 0, 0,
                                    0, 0, z, 0,
                                    0, 0, 0, 1);

  return multMat(m, matrix);
}

/**
 * Corrects an angle by rounding it to the second decimal.
 * @param angle : number
 * @returns {number}
 */
function correctAngle(angle) {
  return Math.round(angle * 100) / 100 ;
}

/**
 * This class represents the robot that we will create and animate in the 3D world.
 */
class Robot {
  constructor() {
    this.pi = correctAngle(Math.PI);  // Value of pi that we will be using

    // Torso parameters
    this.torsoHeight = 1.5;
    this.torsoRadius = 0.75;  // Depth of the torso, 2x Radius = Width of the torso
    this.torsoAngle = 0;  // Current radian angle of the torso rotation

    // Head parameters
    this.headRadius = 0.32;  // Height and depth of the head, 2x Radius = Width of the head
    this.headAngleMax = this.pi/2;  // Maximum radian angle of the head rotation
    this.headAngleX = 0;  // Current radian angle of the head rotation on the X axis
    this.headAngleY = 0;  // Current radian angle of the head rotation on the Y axis

    // Eyes parameters
    this.eyesRadius = 0.08;

    // Arms parameters
    this.ArmsHeight = 0.6;
    this.ArmsRadius = 0.15;
    this.ArmLAngleZ = 0;  // Current radian angle of the left arm rotation on the Z axis
    this.ArmLAngleY = 0;  // Current radian angle of the left arm rotation on the Y axis
    this.ArmRAngleZ = 0;  // Current radian angle of the right arm rotation on the Z axis
    this.ArmRAngleY = 0;  // Current radian angle of the right arm rotation on the Y axis

    // Forearms parameters
    this.forearmsHeight = 0.4;
    this.forearmsRadius = 0.12;
    this.forearmLAngle = 0;  // Current radian angle of the left forearm rotation
    this.forearmRAngle = 0;  // Current radian angle of the right forearm rotation

    // Thighs parameters
    this.thighsHeight = 0.9;
    this.thighsRadius = 0.3;
    this.thighsAngleMax = 2.4;  // Maximum radian angle of the thighs rotation
    this.thighLAngle = 0;  // Current radian angle of the left thigh rotation
    this.thighRAngle = 0;  // Current radian angle of the right thigh rotation

    // Legs parameters
    this.legsHeight = 0.7;
    this.legsRadius = 0.2;
    this.legsAngleMax = 1.5;  // Maximum radian angle of the legs rotation
    this.legLAngle = 0;  // Current radian angle of the left leg rotation
    this.legRAngle = 0;  // Current radian angle of the right leg rotation

    // Walking animation parameters
    this.walkDirection = new THREE.Vector3( 0, 0, 1 );  // Current walking direction
    this.inWalkAnimation = true;  // Indicates if the robot is in the walking animation
    this.firstStepAnim = true;  // Indicates if it's the first step of the walking animation
    this.thighLGoUp = false;  // Indicates if the left thigh is going up in the walking animation
    this.thighRGoUp = true;  // Indicates if the right thigh is going up in the walking animation
    this.legLGoUp = false;  // Indicates if the left leg is going up in the walking animation
    this.legRGoUp = false;  // Indicates if the right leg is going up in the walking animation

    // Material
    this.material = new THREE.MeshNormalMaterial();

    // Initial pose
    this.initialize()
  }

  // Methods for initializing the robot

  /**
   * Creates the initial transformation matrix for the torso of the robot. This matrix
   * moves the torso to its initial position from the origin of the world.
   * @returns {THREE.Matrix4}
   */
  initialTorsoMatrix(){
    const deltaY = this.torsoHeight/2 + this.thighsHeight + this.legsHeight;

    let initTorsoMatrix = idMat4();
    initTorsoMatrix = translateMat(initTorsoMatrix, 0, deltaY, 0);

    return initTorsoMatrix;
  }

  /**
   * Creates the initial transformation matrix for the head of the robot. This matrix
   * moves the head to its initial position from the initial position of the torso.
   * @returns {THREE.Matrix4}
   */
  initialHeadMatrix(){
    const deltaY = this.torsoHeight/2 + this.headRadius/2;

    let initHeadMatrix = idMat4();
    initHeadMatrix = translateMat(initHeadMatrix, 0, deltaY, 0);

    return initHeadMatrix;
  }

  /**
   * Creates the initial transformation matrix for a thigh of the robot based on the
   * chosen 'side'. This matrix moves a thigh to its initial position (based on the
   * 'side') from the initial position of the torso.
   * @param side : string The side, 'l' for left or 'r' for right, of the thigh for
   *                      which the matrix is created. If it's not one of these 2
   *                      options, then the identity matrix is returned.
   * @returns {THREE.Matrix4}
   */
  initialThighMatrix(side){
    const deltaY = -this.torsoHeight/2 - this.thighsHeight/2;
    const deltaX = this.torsoRadius/2;

    let initThighMatrix = idMat4();
    if (side === "l") {
      initThighMatrix = translateMat(initThighMatrix, -deltaX, deltaY, 0);

    } else if (side === "r") {
      initThighMatrix = translateMat(initThighMatrix, deltaX, deltaY, 0);
    }

    return initThighMatrix;
  }

  /**
   * Creates the initial transformation matrix for a leg of the robot. This matrix
   * moves a leg to its initial position from the initial position of a thigh.
   * @returns {THREE.Matrix4}
   */
  initialLegMatrix(){
    const deltaY = -this.thighsHeight/2 - this.legsHeight/2;

    let initLegMatrix = idMat4();
    initLegMatrix = translateMat(initLegMatrix, 0, deltaY, 0);

    return initLegMatrix;
  }

  /**
   * Creates the initial transformation matrix for an arm of the robot based on the
   * chosen 'side'. This matrix moves an arm to its initial position (based on the
   * 'side') from the initial position of the torso.
   * @param side : string The side, 'l' for left or 'r' for right, of the arm for
   *                      which the matrix is created. If it's not one of these 2
   *                      options, then the identity matrix is returned.
   * @returns {THREE.Matrix4}
   */
  initialArmMatrix(side){
    const deltaY = 3/4 * this.torsoHeight/2;
    const deltaX = this.torsoRadius + this.ArmsHeight;

    let initArmMatrix = idMat4();
    if (side === "l") {
      initArmMatrix = translateMat(initArmMatrix, -deltaX, deltaY, 0);

    } else if (side === "r") {
      initArmMatrix = translateMat(initArmMatrix, deltaX, deltaY, 0);
    }

    return initArmMatrix;
  }

  /**
   * Creates the initial transformation matrix for a forearm of the robot based on
   * the chosen 'side'. This matrix moves a forearm to its initial position (based
   * on the 'side') from the initial position of the arm of the same 'side'.
   * @param side : string The side, 'l' for left or 'r' for right, of the forearm
   *                      for which the matrix is created. If it's not one of these
   *                      2 options, then the identity matrix is returned.
   * @returns {THREE.Matrix4}
   */
  initialForearmMatrix(side){
    const deltaX = this.ArmsHeight + this.forearmsHeight;

    let initForearmMatrix = idMat4();
    if (side === "l") {
      initForearmMatrix = translateMat(initForearmMatrix, -deltaX, 0, 0);

    } else if (side === "r") {
      initForearmMatrix = translateMat(initForearmMatrix, deltaX, 0, 0);
    }

    return initForearmMatrix;
  }

  /**
   * Creates the initial transformation matrix for an eye of the robot based on the
   * chosen 'side'. This matrix moves an eye to its initial position (based on the
   * 'side') from the initial position of the head.
   * @param side : string The side, 'l' for left or 'r' for right, of the eye for
   *                      which the matrix is created. If it's not one of these 2
   *                      options, then the identity matrix is returned.
   * @returns {THREE.Matrix4}
   */
  initialEyeMatrix(side) {
    const deltaXZ = this.headRadius/2;

    let initEyeMatrix = idMat4();
    if (side === "l") {
      initEyeMatrix = translateMat(initEyeMatrix, -deltaXZ, 0, deltaXZ);

    } else if (side === "r") {
      initEyeMatrix = translateMat(initEyeMatrix, deltaXZ, 0, deltaXZ);
    }

    return initEyeMatrix;
  }

  /**
   * Initialisation of the robot. This method initializes all the robot parts, all the
   * necessary matrices to transform these parts and adds the robot to the world/scene.
   */
  initialize() {
    // TODO : Rework the matrices in this methods to remove unnecessary ones and to move others to their affiliated init matrix method. Also add comments to clarify some matrices.
    // Geometry
    // Torso
    var torsoGeometry = new THREE.CubeGeometry(2*this.torsoRadius, this.torsoHeight, this.torsoRadius, 64);
    this.torso = new THREE.Mesh(torsoGeometry, this.material);

    // Head
    var headGeometry = new THREE.CubeGeometry(2*this.headRadius, this.headRadius, this.headRadius);
    this.head = new THREE.Mesh(headGeometry, this.material);

    // Eyes
    let eyeLGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.eyeL = new THREE.Mesh(eyeLGeometry, this.material);
    let eyeRGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.eyeR = new THREE.Mesh(eyeRGeometry, this.material);

    // Arms
    let ArmsGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.armL = new THREE.Mesh(ArmsGeometry, this.material);
    this.armR = new THREE.Mesh(ArmsGeometry, this.material);

    // Forearms
    let ForearmsGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.forearmL = new THREE.Mesh(ForearmsGeometry, this.material);
    this.forearmR = new THREE.Mesh(ForearmsGeometry, this.material);

    // Thighs
    let thighLGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.thighL = new THREE.Mesh(thighLGeometry, this.material);
    let thighRGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.thighR = new THREE.Mesh(thighRGeometry, this. material);

    // Legs
    let legLGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.legL = new THREE.Mesh(legLGeometry, this.material);
    let legRGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.legR = new THREE.Mesh(legRGeometry, this.material);

    // Transformations
    // Torso transformation
    this.torsoInitMatrix = this.initialTorsoMatrix();
    this.torsoMatrix = idMat4();  // The combination of all the transformations applied
                                  // to the torso after the initialisation.
    this.torso.setMatrix(this.torsoInitMatrix);

    // Head transformation
    this.headInitMatrix = this.initialHeadMatrix();
    this.headMatrix = idMat4();  // The combination of all the transformations applied
                                 // to the head after the initialisation.
    let matrix = multMat(this.torsoInitMatrix, this.headInitMatrix);
    this.head.setMatrix(matrix);

    // Eyes transformations
    this.EyesRescaleMat = rescaleMat(idMat4(), this.eyesRadius, this.eyesRadius, this.eyesRadius);

    // Eye left
    this.eyeLInitMat = this.initialEyeMatrix("l");
    let m = multMat(matrix, this.eyeLInitMat);
    m = multMat(m, this.EyesRescaleMat);
    this.eyeL.setMatrix(m);

    // Eye right
    this.eyeRInitMat = this.initialEyeMatrix("r");
    m = multMat(matrix, this.eyeRInitMat);
    m = multMat(m, this.EyesRescaleMat);
    this.eyeR.setMatrix(m);

    // Arms transformations
    this.armsRescaleMat = rescaleMat(idMat4(), this.ArmsHeight, this.ArmsRadius, this.ArmsRadius);
    this.armsRescaleMatInv = invertMat(this.armsRescaleMat);

    // Arm left
    this.armLMatrix = idMat4();
    this.armLRotateMat= idMat4();
    this.armLInitMat = this.initialArmMatrix("l");
    let ml = multMat(this.armLInitMat, this.armsRescaleMat);
    ml = multMat(this.torsoInitMatrix, ml);
    this.armL.setMatrix(ml);

    // Arm right
    this.armRMatrix = idMat4();
    this.armRRotateMat= idMat4();
    this.armRInitMat = this.initialArmMatrix("r");
    let mr = multMat(this.armRInitMat, this.armsRescaleMat);
    mr = multMat(this.torsoInitMatrix, mr);
    this.armR.setMatrix(mr);

    // Forearms transformations
    this.forearmsRescaleMat = rescaleMat(idMat4(), this.forearmsHeight, this.forearmsRadius, this.forearmsRadius);

    // Forearm left
    this.forearmLMatrix = idMat4();
    this.forearmLRotateMat = idMat4();
    this.forearmLInitMat = this.initialForearmMatrix("l");
    ml = multMat(ml, this.armsRescaleMatInv);
    ml = multMat(ml, this.forearmLInitMat);
    ml = multMat(ml, this.forearmsRescaleMat);
    this.forearmL.setMatrix(ml);

    // Forearm right
    this.forearmRMatrix = idMat4();
    this.forearmRRotateMat = idMat4();
    this.forearmRInitMat = this.initialForearmMatrix("r");
    mr = multMat(mr, this.armsRescaleMatInv);
    mr = multMat(mr, this.forearmRInitMat);
    mr = multMat(mr, this.forearmsRescaleMat);
    this.forearmR.setMatrix(mr);

    // Thighs transformations
    this.thighsRescaleMat = rescaleMat(idMat4(), this.thighsRadius, this.thighsHeight/2, this.thighsRadius);
    this.thighsRescaleMatInv = invertMat(this.thighsRescaleMat);

    // Thigh left
    this.thighLInitMat = this.initialThighMatrix("l");
    this.thighLMatrix = idMat4();
    this.thighLRotatMat = idMat4();
    let matrixL = multMat(this.torsoInitMatrix, this.thighLInitMat);
    matrixL = multMat(matrixL, this.thighsRescaleMat);
    this.thighL.setMatrix(matrixL);
    
    // Thigh right
    this.thighRInitMat = this.initialThighMatrix("r");
    this.thighRMatrix = idMat4();
    this.thighRRotatMat = idMat4();
    let matrixR = multMat(this.torsoInitMatrix, this.thighRInitMat);
    matrixR = multMat(matrixR, this.thighsRescaleMat);
    this.thighR.setMatrix(matrixR);

    // Legs transformations
    this.legsRescaleMat = rescaleMat(idMat4(), this.legsRadius, this.legsHeight/2, this.legsRadius);

    // Leg left
    this.legLInitMat = this.initialLegMatrix();
    this.legLMatrix = idMat4();
    this.legLRotatMat = idMat4();
    matrixL = multMat(matrixL, this.thighsRescaleMatInv);
    matrixL = multMat(matrixL, this.legLInitMat);
    matrixL = multMat(matrixL, this.legsRescaleMat);
    this.legL.setMatrix(matrixL);

    // Leg right
    this.legRInitMat = this.initialLegMatrix();
    this.legRMatrix = idMat4();
    this.legRRotatMat = idMat4();
    matrixR = multMat(matrixR, this.thighsRescaleMatInv);
    matrixR = multMat(matrixR, this.legRInitMat);
    matrixR = multMat(matrixR, this.legsRescaleMat);
    this.legR.setMatrix(matrixR);

    // Add robot to scene
    scene.add(this.torso);
    scene.add(this.head);
    scene.add(this.eyeL);
    scene.add(this.eyeR);
    scene.add(this.armL);
    scene.add(this.armR);
    scene.add(this.forearmL);
    scene.add(this.forearmR);
    scene.add(this.thighL);
    scene.add(this.thighR);
    scene.add(this.legL);
    scene.add(this.legR);
  }

  // Methods for moving/rotating the robot parts

  /**
   * Rotates the torso of the robot by 'angle' and updates all the other robot parts
   * that depend on it.
   * @param angle : float The angle of the rotation in radian.
   */
  rotateTorso(angle){
    // Update the transformation matrix of the torso
    let torsoMat = idMat4();
    torsoMat = rotateMat(torsoMat, angle, "y");
    this.torsoMatrix = multMat(this.torsoMatrix, torsoMat);

    // Update the torso
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.torso.setMatrix(matrix);

    // Update the current walking direction
    this.walkDirection = rotateVec3(this.walkDirection, angle, "y");

    // Update all the other robot parts
    this.updateHead(matrix);

    let matrixL = this.updateThighLeft(matrix);
    let matrixR = this.updateThighRight(matrix);

    this.updateLegLeft(matrixL);
    this.updateLegRight(matrixR);

    matrixL = this.updateArmLeft(matrix);
    matrixR = this.updateArmRight(matrix);

    this.updateForearmLeft(matrixL);
    this.updateForearmRight(matrixR);

    // Update the current radian angle of the torso rotation for the look_at method.
    // We keep it between -3.14 and 3.14 (this.pi) to simplify the look_at method.
    this.torsoAngle += angle;

    const a = correctAngle(this.torsoAngle);
    if (a > this.pi) {
      this.torsoAngle = this.torsoAngle - (2 * this.pi);

    } else if (a < -this.pi) {
      this.torsoAngle = this.torsoAngle + (2 * this.pi);
    }
  }

  /**
   * Moves the torso of the robot by 'speed' and updates all the other robot parts
   * that depend on it. Moving the torso makes the robot walk, so this method is in
   * charge of the cyclic walking animation and the support leg.
   * @param speed : float : The speed at which to robot is moving.
   */
  moveTorso(speed){
    // Update the transformation matrix of the torso
    this.torsoMatrix = translateMat(this.torsoMatrix, speed * this.walkDirection.x,
                                 speed * this.walkDirection.y, speed * this.walkDirection.z);

    // Update the torso
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.torso.setMatrix(matrix);

    // Update the head and the eyes
    this.updateHead(matrix);

    // Update the arms and the forearms
    let matrixL = this.updateArmLeft(matrix);
    let matrixR = this.updateArmRight(matrix);

    this.updateForearmLeft(matrixL);
    this.updateForearmRight(matrixR);

    // Update for the cyclic walking animation

    // If the robot was not in the walking animation, the position of the thighs and
    // legs are resetted so the robot can walk normally.
    if (!this.inWalkAnimation) {
      this.inWalkAnimation = true;
      this.firstStepAnim = true;
      this.thighLAngle = 0;
      this.thighLGoUp = false;
      this.thighRAngle = 0;
      this.thighRGoUp = true;
      this.legLAngle = 0;
      this.legLGoUp = false;
      this.legRAngle = 0;
      this.legRGoUp = false;
    }

    // Cyclic walking animation
    if (this.firstStepAnim) {
      // The first step of the robot is different from the other steps of the
      // walking animation.
      this.firstStep(speed);

    } else {
      this.walkThighLeft(speed);
      this.walkThighRight(speed);
      this.walkLegLeft(speed);
      this.walkLegRight(speed);
    }

    // Support leg and shift on the Y axis so that the robot is walking on the floor.
    this.standOnFloor();
  }

  /**
   * Rotates the head of the robot by 'angle' with respect to 'axis' and updates all
   * the other robot parts that depend on it.
   * @param angle : float The angle of the rotation in radian.
   * @param axis : string The axis 'x' or 'y' on which the rotation is made. If it's
   *                      not one of these 2 options, then no rotation is made.
   */
  rotateHead(angle, axis){
    // Update the angle of the head rotation
    if (axis === "x") {
      this.headAngleX += angle;
      this.headAngleX = correctAngle(this.headAngleX);

      // Maximum head rotation
      if (this.headAngleX > this.headAngleMax) {
        this.headAngleX = this.headAngleMax;

      } else if (this.headAngleX < -this.headAngleMax) {
        this.headAngleX = -this.headAngleMax;
      }

    } else if (axis === "y") {
      this.headAngleY += angle;
      this.headAngleY = correctAngle(this.headAngleY);

      // Maximum head rotation
      if (this.headAngleY > this.headAngleMax) {
        this.headAngleY = this.headAngleMax;

      } else if (this.headAngleY < -this.headAngleMax) {
        this.headAngleY = -this.headAngleMax;
      }
    }

    // Matrices needed to move the end effector of the head to make the rotation
    let m = multMat(idMat4(), this.headInitMatrix);
    m = translateMat(m, 0, -this.headRadius/2, 0);
    let im = invertMat(m);

    // Make the new rotation matrix of the head
    this.headMatrix = idMat4();
    this.headMatrix = multMat(im, this.headMatrix);
    this.headMatrix = rotateMat(this.headMatrix, this.headAngleX, "x");
    this.headMatrix = rotateMat(this.headMatrix, this.headAngleY, "y");
    this.headMatrix = multMat(m, this.headMatrix);

    // Update the head and the eyes
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.updateHead(matrix);
  }

  /**
   * Rotates the left arm of the robot by 'angle' with respect to 'axis' and updates
   * all the other robot parts that depend on it.
   * @param angle : float The angle of the rotation in radian.
   * @param axis : string The axis 'y' or 'z' on which the rotation is made. If it's
   *                      not one of these 2 options, then no rotation is made.
   */
  rotateArmLeft(angle, axis){
    // Update the angle of the left arm rotation
    if(axis === "y"){
      this.ArmLAngleY += angle;

    } else if (axis === "z"){
      this.ArmLAngleZ += angle;
    }

    // Make the new rotation matrix of the left arm
    this.armLRotateMat = idMat4();
    this.armLRotateMat = translateMat(this.armLRotateMat, -this.ArmsHeight, 0, 0);
    this.armLRotateMat = rotateMat(this.armLRotateMat, this.ArmLAngleY, "y");
    this.armLRotateMat = rotateMat(this.armLRotateMat, this.ArmLAngleZ, "z");
    this.armLRotateMat = translateMat(this.armLRotateMat, this.ArmsHeight, 0, 0);

    // Update the left arm and the left forearm
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateArmLeft(matrix);
    this.updateForearmLeft(matrix);
  }

  /**
   * Rotates the right arm of the robot by 'angle' with respect to 'axis' and updates
   * all the other robot parts that depend on it.
   * @param angle : float The angle of the rotation in radian.
   * @param axis : string The axis 'y' or 'z' on which the rotation is made. If it's
   *                      not one of these 2 options, then no rotation is made.
   */
  rotateArmRight(angle, axis){
    // Update the angle of the right arm rotation
    if(axis === "y"){
      this.ArmRAngleY += angle;

    } else if (axis === "z"){
      this.ArmRAngleZ += angle;
    }

    // Make the new rotation matrix of the right arm
    this.armRRotateMat = idMat4();
    this.armRRotateMat = translateMat(this.armRRotateMat, this.ArmsHeight, 0, 0);
    this.armRRotateMat = rotateMat(this.armRRotateMat, this.ArmRAngleY, "y");
    this.armRRotateMat = rotateMat(this.armRRotateMat, this.ArmRAngleZ, "z");
    this.armRRotateMat = translateMat(this.armRRotateMat, -this.ArmsHeight, 0, 0);

    // Update the right arm and the right forearm
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateArmRight(matrix);
    this.updateForearmRight(matrix);
  }

  /**
   * Rotates the left forearm of the robot by 'angle'.
   * @param angle : float The angle of the rotation in radian.
   */
  rotateForearmLeft(angle){
    // Update the angle of the left forearm rotation
    this.forearmLAngle += angle;

    // Make the new rotation matrix of the left forearm
    this.forearmLRotateMat = idMat4();
    this.forearmLRotateMat = translateMat(this.forearmLRotateMat, -this.forearmsHeight, 0, 0);
    this.forearmLRotateMat = rotateMat(this.forearmLRotateMat, this.forearmLAngle,"z");
    this.forearmLRotateMat = translateMat(this.forearmLRotateMat, this.forearmsHeight, 0, 0);

    // Update the left forearm
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = multMat(matrix, this.armLMatrix);
    matrix = multMat(matrix, this.armLInitMat);
    matrix = multMat(matrix, this.armLRotateMat);
    matrix = multMat(matrix, this.forearmLMatrix);
    matrix = multMat(matrix, this.forearmLInitMat);
    matrix = multMat(matrix, this.forearmLRotateMat);
    matrix = multMat(matrix, this.forearmsRescaleMat);
    this.forearmL.setMatrix(matrix);
  }

  /**
   * Rotates the right forearm of the robot by 'angle'.
   * @param angle : float The angle of the rotation in radian.
   */
  rotateForearmRight(angle){
    // Update the angle of the right forearm rotation
    this.forearmRAngle += angle;

    // Make the new rotation matrix of the right forearm
    this.forearmRRotateMat = idMat4();
    this.forearmRRotateMat = translateMat(this.forearmRRotateMat, this.forearmsHeight, 0, 0);
    this.forearmRRotateMat = rotateMat(this.forearmRRotateMat, this.forearmRAngle,"z");
    this.forearmRRotateMat = translateMat(this.forearmRRotateMat, -this.forearmsHeight, 0, 0);

    // Update the right forearm
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = multMat(matrix, this.armRMatrix);
    matrix = multMat(matrix, this.armRInitMat);
    matrix = multMat(matrix, this.armRRotateMat);
    matrix = multMat(matrix, this.forearmRMatrix);
    matrix = multMat(matrix, this.forearmRInitMat);
    matrix = multMat(matrix, this.forearmRRotateMat);
    matrix = multMat(matrix, this.forearmsRescaleMat);
    this.forearmR.setMatrix(matrix);
  }

  /**
   * Rotates the left thigh of the robot by 'angle' and updates all the other robot
   * parts that depend on it.
   * @param angle : float The angle of the rotation in radian.
   */
  rotateThighLeft(angle){
    // Update the angle of the left thigh rotation
    this.thighLAngle += angle;
    this.thighLAngle = correctAngle(this.thighLAngle);

    // Maximum thigh rotation
    if (this.thighLAngle > this.thighsAngleMax) {
      this.thighLAngle = this.thighsAngleMax;

    } else if (this.thighLAngle < -this.thighsAngleMax) {
      this.thighLAngle = -this.thighsAngleMax;
    }

    // Make the new rotation matrix of the left thigh
    this.thighLRotatMat = idMat4();
    this.thighLRotatMat = translateMat(this.thighLRotatMat, 0, -this.thighsHeight/2, 0);
    this.thighLRotatMat = rotateMat(this.thighLRotatMat, this.thighLAngle, "x");
    this.thighLRotatMat = translateMat(this.thighLRotatMat, 0, this.thighsHeight/2, 0);

    // Update the left thigh and the left leg
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateThighLeft(matrix);
    this.updateLegLeft(matrix);
  }

  /**
   * Rotates the right thigh of the robot by 'angle' and updates all the other robot
   * parts that depend on it.
   * @param angle : float The angle of the rotation in radian.
   */
  rotateThighRight(angle){
    // Update the angle of the right thigh rotation
    this.thighRAngle += angle;
    this.thighRAngle = correctAngle(this.thighRAngle);

    // Maximum thigh rotation
    if (this.thighRAngle > this.thighsAngleMax) {
      this.thighRAngle = this.thighsAngleMax;

    } else if (this.thighRAngle < -this.thighsAngleMax) {
      this.thighRAngle = -this.thighsAngleMax;
    }

    // Make the new rotation matrix of the right thigh
    this.thighRRotatMat = idMat4();
    this.thighRRotatMat = translateMat(this.thighRRotatMat, 0, -this.thighsHeight/2, 0);
    this.thighRRotatMat = rotateMat(this.thighRRotatMat, this.thighRAngle, "x");
    this.thighRRotatMat = translateMat(this.thighRRotatMat, 0, this.thighsHeight/2, 0);

    // Update the right thigh and the right leg
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateThighRight(matrix);
    this.updateLegRight(matrix);
  }

  /**
   * Rotates the left leg of the robot by 'angle'.
   * @param angle  : float The angle of the rotation in radian.
   */
  rotateLegLeft(angle){
    // Update the angle of the left leg rotation
    this.legLAngle += angle;
    this.legLAngle = correctAngle(this.legLAngle);

    // Maximum leg rotation
    if (this.legLAngle > this.legsAngleMax) {
      this.legLAngle = this.legsAngleMax;

    } else if (this.legLAngle < -this.legsAngleMax) {
      this.legLAngle = -this.legsAngleMax;
    }

    // Make the new rotation matrix of the left leg
    this.legLRotatMat = idMat4();
    this.legLRotatMat = translateMat(this.legLRotatMat, 0, -this.legsHeight/2, 0);
    this.legLRotatMat = rotateMat(this.legLRotatMat, this.legLAngle, "x");
    this.legLRotatMat = translateMat(this.legLRotatMat, 0, this.legsHeight/2, 0);

    // Update the left leg
    let matrix = multMat(this.legLMatrix, this.legLInitMat);
    matrix = multMat(matrix, this.legLRotatMat);
    matrix = multMat(matrix, this.legsRescaleMat);
    matrix = multMat(this.thighLRotatMat, matrix);
    matrix = multMat(this.thighLInitMat, matrix);
    matrix = multMat(this.thighLMatrix, matrix);
    matrix = multMat(this.torsoInitMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    this.legL.setMatrix(matrix);
  }

  /**
   * Rotates the right leg of the robot by 'angle'.
   * @param angle : float The angle of the rotation in radian.
   */
  rotateLegRight(angle){
    // Update the angle of the right leg rotation
    this.legRAngle += angle;
    this.legRAngle = correctAngle(this.legRAngle);

    // Maximum leg rotation
    if (this.legRAngle > this.legsAngleMax) {
      this.legRAngle = this.legsAngleMax;

    } else if (this.legRAngle < -this.legsAngleMax) {
      this.legRAngle = -this.legsAngleMax;
    }

    // Make the new rotation matrix of the right leg
    this.legRRotatMat = idMat4();
    this.legRRotatMat = translateMat(this.legRRotatMat, 0, -this.legsHeight/2, 0);
    this.legRRotatMat = rotateMat(this.legRRotatMat, this.legRAngle, "x");
    this.legRRotatMat = translateMat(this.legRRotatMat, 0, this.legsHeight/2, 0);

    // Update the right leg
    let matrix = multMat(this.legRMatrix, this.legRInitMat);
    matrix = multMat(matrix, this.legRRotatMat);
    matrix = multMat(matrix, this.legsRescaleMat);
    matrix = multMat(this.thighRRotatMat, matrix);
    matrix = multMat(this.thighRInitMat, matrix);
    matrix = multMat(this.thighRMatrix, matrix);
    matrix = multMat(this.torsoInitMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    this.legR.setMatrix(matrix);
  }

  // Methods for updating the robot parts

  /**
   * Updates the head and the eyes when a part that precedes the head in the
   * hierarchy of the robot has been modified.
   * @param matrix : THREE.Matrix4 The matrix of all the transformations of the
   *                               parts that precedes the head in the hierarchy.
   */
  updateHead(matrix) {
    // Update of the head
    let matrix2 = multMat(matrix, this.headMatrix);
    matrix2 = multMat(matrix2, this.headInitMatrix);
    this.head.setMatrix(matrix2);

    // Update of the left eye
    let m = multMat(matrix2, this.eyeLInitMat);
    m = multMat(m, this.EyesRescaleMat);
    this.eyeL.setMatrix(m);

    // Update of the right eye
    m = multMat(matrix2, this.eyeRInitMat);
    m = multMat(m, this.EyesRescaleMat);
    this.eyeR.setMatrix(m);
  }

  /**
   * Updates the left thigh when a part that precedes it in the hierarchy of the
   * robot has been modified.
   * @param matrix : THREE.Matrix4 The matrix of all the transformations of the parts
   *                               that precedes the left thigh in the hierarchy.
   * @returns {THREE.Matrix4} The matrix of all the transformation of the parts in
   *                          the hierarchy up to and including the left thigh (except
   *                          for the scaling of the thigh).
   */
  updateThighLeft(matrix) {
    let matrix2 = multMat(matrix, this.thighLMatrix);
    matrix2 = multMat(matrix2, this.thighLInitMat);
    matrix2 = multMat(matrix2, this.thighLRotatMat);
    matrix2 = multMat(matrix2, this.thighsRescaleMat);
    this.thighL.setMatrix(matrix2);

    // Undo the scaling of the left thigh for the return matrix
    matrix2 = multMat(matrix2, this.thighsRescaleMatInv);
    return matrix2;
  }

  /**
   * Updates the right thigh when a part that precedes it in the hierarchy of the
   * robot has been modified.
   * @param matrix : THREE.Matrix4 The matrix of all the transformations of the
   *                               parts that precedes the right thigh in the
   *                               hierarchy.
   * @returns {THREE.Matrix4} The matrix of all the transformation of the parts in
   *                          the hierarchy up to and including the right thigh
   *                          (except for the scaling of the thigh).
   */
  updateThighRight(matrix) {
    let matrix2 = multMat(matrix, this.thighRMatrix);
    matrix2 = multMat(matrix2, this.thighRInitMat);
    matrix2 = multMat(matrix2, this.thighRRotatMat);
    matrix2 = multMat(matrix2, this.thighsRescaleMat);
    this.thighR.setMatrix(matrix2);

    // Undo the scaling of the right thigh for the return matrix
    matrix2 = multMat(matrix2, this.thighsRescaleMatInv);
    return matrix2;
  }

  /**
   * Updates the left leg when a part that precedes it in the hierarchy of the robot
   * has been modified.
   * @param matrix : THREE.Matrix4 The matrix of all the transformations of the parts
   *                               that precedes the left leg in the hierarchy.
   */
  updateLegLeft(matrix) {
    let matrix2 = multMat(matrix, this.legLMatrix);
    matrix2 = multMat(matrix2, this.legLInitMat);
    matrix2 = multMat(matrix2, this.legLRotatMat);
    matrix2 = multMat(matrix2, this.legsRescaleMat);
    this.legL.setMatrix(matrix2);
  }

  /**
   * Updates the right leg when a part that precedes it in the hierarchy of the robot
   * has been modified.
   * @param matrix : THREE.Matrix4 The matrix of all the transformations of the
   *                               parts that precedes the right leg in the hierarchy.
   */
  updateLegRight(matrix) {
    let matrix2 = multMat(matrix, this.legRMatrix);
    matrix2 = multMat(matrix2, this.legRInitMat);
    matrix2 = multMat(matrix2, this.legRRotatMat);
    matrix2 = multMat(matrix2, this.legsRescaleMat);
    this.legR.setMatrix(matrix2);
  }

  /**
   * Updates the left arm when a part that precedes it in the hierarchy of the robot
   * has been modified.
   * @param matrix : THREE.Matrix4 The matrix of all the transformations of the parts
   *                               that precedes the left arm in the hierarchy.
   * @returns {THREE.Matrix4} The matrix of all the transformation of the parts in
   *                          the hierarchy up to and including the left arm (except
   *                          for the scaling of the arm).
   */
  updateArmLeft(matrix) {
    let matrix2 = multMat(matrix, this.armLMatrix);
    matrix2 = multMat(matrix2, this.armLInitMat);
    matrix2 = multMat(matrix2, this.armLRotateMat);
    matrix2 = multMat(matrix2, this.armsRescaleMat);
    this.armL.setMatrix(matrix2);

    // Undo the scaling of the left arm for the return matrix
    matrix2 = multMat(matrix2, this.armsRescaleMatInv);
    return matrix2;
  }

  /**
   * Updates the right arm when a part thet precedes it in the hierarchy of the
   * robot has been modified.
   * @param matrix : THREE.Matrix4 The matrix of all the transformations of the
   *                               parts that precedes the right arm in the
   *                               hierarchy.
   * @returns {THREE.Matrix4} The matrix of all the transformation of the parts in
   *                          the hierarchy up to and including the right arm (except
   *                          for the scaling of the arm).
   */
  updateArmRight(matrix) {
    let matrix2 = multMat(matrix, this.armRMatrix);
    matrix2 = multMat(matrix2, this.armRInitMat);
    matrix2 = multMat(matrix2, this.armRRotateMat);
    matrix2 = multMat(matrix2, this.armsRescaleMat);
    this.armR.setMatrix(matrix2);

    // Undo the scaling of the right arm for the return matrix
    matrix2 = multMat(matrix2, this.armsRescaleMatInv);
    return matrix2;
  }

  /**
   * Updates the left forearm when a part that precedes it in the hierarchy of
   * the robot has been modified.
   * @param matrix : THREE.Matrix4 The matrix of all the transformations of the
   *                               parts that precedes the left forearm in the
   *                               hierarchy.
   */
  updateForearmLeft(matrix) {
    let matrix2 = multMat(matrix, this.forearmLMatrix);
    matrix2 = multMat(matrix2, this.forearmLInitMat);
    matrix2 = multMat(matrix2, this.forearmLRotateMat);
    matrix2 = multMat(matrix2, this.forearmsRescaleMat);
    this.forearmL.setMatrix(matrix2);
  }

  /**
   * Updates the right forearm when a part that precedes it in the hierarchy of
   * the robot has been modified.
   * @param matrix : THREE.Matrix4 The matrix of all the transformations of the
   *                               parts that precedes the right forearm in the
   *                               hierarchy.
   */
  updateForearmRight(matrix) {
    let matrix2 = multMat(matrix, this.forearmRMatrix);
    matrix2 = multMat(matrix2, this.forearmRInitMat);
    matrix2 = multMat(matrix2, this.forearmRRotateMat);
    matrix2 = multMat(matrix2, this.forearmsRescaleMat);
    this.forearmR.setMatrix(matrix2);
  }

  // Methods for the walking animation of the robot

  /**
   * This method handles the movement of the thighs and legs for the first step of
   * the cyclic walking animation.
   * @param speed : float The walking speed of the robot.
   */
  firstStep(speed) {
    if (this.thighRAngle <= -0.5) { // Last rotation of the first step
      this.thighRAngle = -0.5;
      this.firstStepAnim = false;
    }
    
    robot.rotateThighRight(-speed);
    robot.rotateThighLeft(0.5 * speed);

    if (!this.legRGoUp) { // Right leg goes down
      robot.rotateLegRight(speed);

      if (this.legRAngle >= 0.4) { // Maximum angle for the right leg going down
        this.legRAngle = 0.4;
        this.legRGoUp = true;
      }

    } else { // Right leg goes up
      robot.rotateLegRight(-speed);
    }

    if (this.thighLAngle >= 0.1) { // Left leg goes down
      robot.rotateLegLeft(speed);
    }
    // else : no rotation of the left leg
  }

  /**
   * This method handles the movement of the left thigh for the cyclic walking animation.
   * @param speed : float The walking speed of the robot.
   */
  walkThighLeft(speed) {
    const forward = speed > 0; // Indicates if the robot is walking forward

    // The rotation to apply to the left thigh is always the opposite of the speed.

    if (forward && this.thighLGoUp && this.thighLAngle > -0.6) {
      robot.rotateThighLeft(-speed);

    } else if (forward && this.thighLGoUp) { // thighLAngle <= -0.6
      this.thighLGoUp = false;
      this.thighLAngle = -0.6;
      robot.rotateThighLeft(speed);

    } else if (forward && this.thighLAngle < 0.3) { // go down
      robot.rotateThighLeft(speed);

    } else if (forward) { // go down , thighLAngle >= 0.3
      this.thighLGoUp = true;
      this.thighLAngle = 0.3;
      robot.rotateThighLeft(-speed);

    } else if (this.thighLGoUp && this.thighLAngle > -0.6) { // backward
      robot.rotateThighLeft(speed);

    } else if (this.thighLGoUp) { // backward , thighLAngle <= -0.6
      this.thighLGoUp = false;
      this.thighLAngle = -0.6;
      robot.rotateThighLeft(-speed);

    } else if (this.thighLAngle < 0.3) { // backward , go down
      robot.rotateThighLeft(-speed);

    } else { // backward , go down , thighLAngle >= 0.3
      this.thighLGoUp = true;
      this.thighLAngle = 0.3;
      robot.rotateThighLeft(speed);
    }
  }

  /**
   * This method handles the movement of the right thigh for the cyclic walking animation.
   * @param speed : float The walking speed of the robot.
   */
  walkThighRight(speed) {
    const forward = speed > 0; // Indicates if the robot is walking forward

    // The rotation to apply to the right thigh is always the opposite of the speed.

    if (forward && this.thighRGoUp && this.thighRAngle > -0.6) {
      robot.rotateThighRight(-speed);

    } else if (forward && this.thighRGoUp) { // thighRAngle <= -0.6
      this.thighRGoUp = false;
      this.thighRAngle = -0.6;
      robot.rotateThighRight(speed);

    } else if (forward && this.thighRAngle < 0.3) { // go down
      robot.rotateThighRight(speed);

    } else if (forward) { // go down , thighRAngle >= 0.3
      this.thighRGoUp = true;
      this.thighRAngle = 0.3;
      robot.rotateThighRight(-speed);

    } else if (this.thighRGoUp && this.thighRAngle > -0.6) { // backward
      robot.rotateThighRight(speed);

    } else if (this.thighRGoUp) { // backward , thighRAngle <= -0.6
      this.thighRGoUp = false;
      this.thighRAngle = -0.6;
      robot.rotateThighRight(-speed);

    } else if (this.thighRAngle < 0.3) { // backward , go down
      robot.rotateThighRight(-speed);

    } else { // backward , go down , thighRAngle >= 0.3
      this.thighRGoUp = true;
      this.thighRAngle = 0.3;
      robot.rotateThighRight(speed);
    }
  }

  /**
   * This method handles the movement of the left leg for the cyclic walking animation.
   * @param speed : float The walking speed of the robot.
   */
  walkLegLeft(speed){
    const forward = speed > 0; // Indicates if the robot is walking forward

    // The rotation to apply to the left leg is always the opposite of the speed.

    if (forward && this.legLGoUp && this.legLAngle > 0.2) {
      robot.rotateLegLeft(-speed);

    } else if (forward && this.legLGoUp && this.legLAngle === 0.2) {

      if (this.thighLAngle === -0.4) {
        robot.rotateLegLeft(speed);

      } else {
        robot.rotateLegLeft(0);
      }

    } else if (forward && this.legLGoUp && this.legLAngle > 0) {
      robot.rotateLegLeft(-speed);

    } else if (forward && this.legLGoUp) { // legLAngle <= 0
      this.legLGoUp = false;
      this.legLAngle = 0;
      robot.rotateLegLeft(0);

    } else if (forward && this.legLAngle === 0) { // go down
      
      if (this.thighLAngle === 0) {
        robot.rotateLegLeft(0.5 * speed);

      } else {
        robot.rotateLegLeft(0);
      }

    } else if (forward && this.legLAngle < 0.5) { // go down
      robot.rotateLegLeft(1.5 * speed);

    } else if (forward && this.legLAngle < 0.8) { // go down
      robot.rotateLegLeft(speed);

    } else if (forward) { // go down, legLAngle >= 0.8
      this.legLGoUp = true;
      this.legLAngle = 0.8;
      robot.rotateLegLeft(-speed);

    } else if (this.legLGoUp && this.legLAngle > 0.2) { // backward
      robot.rotateLegLeft(speed);

    } else if (this.legLGoUp && this.legLAngle === 0.2) { // backward

      if (this.thighLAngle === -0.4) {
        robot.rotateLegLeft(-speed);

      } else {
        robot.rotateLegLeft(0);
      }

    } else if (this.legLGoUp && this.legLAngle > 0) { // backward
      robot.rotateLegLeft(speed);

    } else if (this.legLGoUp) { // backward, legLAngle <= 0
      this.legLGoUp = false;
      this.legLAngle = 0;
      robot.rotateLegLeft(0);

    } else if (this.legLAngle === 0) { // backward, go down

      if (this.thighLAngle === 0) {
        robot.rotateLegLeft(0.5 * -speed);

      } else {
        robot.rotateLegLeft(0);
      }

    } else if (this.legLAngle < 0.5) { // backward, go down
      robot.rotateLegLeft(1.5 * -speed);

    } else if (this.legLAngle < 0.8) { // backward, go down
      robot.rotateLegLeft(-speed);

    } else { // backward, go down, legLAngle >= 0.8
      this.legLGoUp = true;
      this.legLAngle = 0.8;
      robot.rotateLegLeft(speed);
    }
  }

  /**
   * This method handles the movement of the right leg for the cyclic walking animation.
   * @param speed : float The walking speed of the robot.
   */
  walkLegRight(speed){
    const forward = speed > 0; // Indicates if the robot is walking forward

    // The rotation to apply to the right leg is always the opposite of the speed.

    if (forward && this.legRGoUp && this.legRAngle > 0.2) {
      robot.rotateLegRight(-speed);

    } else if (forward && this.legRGoUp && this.legRAngle === 0.2) {

      if (this.thighRAngle === -0.4) {
        robot.rotateLegRight(speed);

      } else {
        robot.rotateLegRight(0);
      }

    } else if (forward && this.legRGoUp && this.legRAngle > 0) {
      robot.rotateLegRight(-speed);

    } else if (forward && this.legRGoUp) { // legRAngle <= 0
      this.legRGoUp = false;
      this.legRAngle = 0;
      robot.rotateLegRight(0);

    } else if (forward && this.legRAngle === 0) { // go down
      
      if (this.thighRAngle === 0) {
        robot.rotateLegRight(0.5 * speed);

      } else {
        robot.rotateLegRight(0);
      }

    } else if (forward && this.legRAngle < 0.5) { // go down
      robot.rotateLegRight(1.5 * speed);

    } else if (forward && this.legRAngle < 0.8) { // go down
      robot.rotateLegRight(speed);

    } else if (forward) { // go down, legRAngle >= 0.8
      this.legRGoUp = true;
      this.legRAngle = 0.8;
      robot.rotateLegRight(-speed);

    } else if (this.legRGoUp && this.legRAngle > 0.2) { // backward
      robot.rotateLegRight(speed);

    } else if (this.legRGoUp && this.legRAngle === 0.2) { // backward

      if (this.thighRAngle === -0.4) {
        robot.rotateLegRight(-speed);

      } else {
        robot.rotateLegRight(0);
      }

    } else if (this.legRGoUp && this.legRAngle > 0) { // backward
      robot.rotateLegRight(speed);

    } else if (this.legRGoUp) { // backward, legRAngle <= 0
      this.legRGoUp = false;
      this.legRAngle = 0;
      robot.rotateLegRight(0);

    } else if (this.legRAngle === 0) { // backward, go down

      if (this.thighRAngle === 0) {
        robot.rotateLegRight(0.5 * -speed);

      } else {
        robot.rotateLegRight(0);
      }

    } else if (this.legRAngle < 0.5) { // backward, go down
      robot.rotateLegRight(1.5 * -speed);

    } else if (this.legRAngle < 0.8) { // backward, go down
      robot.rotateLegRight(-speed);

    } else { // backward, go down, legRAngle >= 0.8
      this.legRGoUp = true;
      this.legRAngle = 0.8;
      robot.rotateLegRight(speed);
    }
  }

  /**
   * This method finds the support leg and shifts the robot appropriately so that he is
   * standing on the floor rather than hovering above it (or pass through it).
   */
  standOnFloor() {
    // End Effector of the legs on their creation
    let endEffectorL = new THREE.Vector3(0, -1, 0);
    let endEffectorR = new THREE.Vector3(0, -1, 0);

    // Complete transformation matrices of the legs
    // Leg left
    let matrixL = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrixL = multMat(matrixL, this.thighLMatrix);
    matrixL = multMat(matrixL, this.thighLInitMat);
    matrixL = multMat(matrixL, this.thighLRotatMat);
    matrixL = multMat(matrixL, this.legLMatrix);
    matrixL = multMat(matrixL, this.legLInitMat);
    matrixL = multMat(matrixL, this.legLRotatMat);
    matrixL = multMat(matrixL, this.legsRescaleMat);

    // Leg right
    let matrixR = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrixR = multMat(matrixR, this.thighRMatrix);
    matrixR = multMat(matrixR, this.thighRInitMat);
    matrixR = multMat(matrixR, this.thighRRotatMat);
    matrixR = multMat(matrixR, this.legRMatrix);
    matrixR = multMat(matrixR, this.legRInitMat);
    matrixR = multMat(matrixR, this.legRRotatMat);
    matrixR = multMat(matrixR, this.legsRescaleMat);

    // Apply the transformations to the end effectors of the legs
    endEffectorL.applyMatrix4(matrixL);
    endEffectorR.applyMatrix4(matrixR);

    // Find the support leg (the leg with the lowest end effector) and the shift to
    // make on the Y axis so the robot is constantly standing on the floor.
    let deltaY;

    if (endEffectorL.y <= endEffectorR.y) {
      // The end effector of the left leg is lower than the one of the right leg (or
      // equal to it), so the left leg is the support leg.
      deltaY = - endEffectorL.y;

    } else {
      // The end effector of the right leg is lower than the one of the left leg, so
      // the right leg is the support leg.
      deltaY = - endEffectorR.y;
    }

    // Apply the shift to the torso so that the robot is standing on the floor.
    this.torsoMatrix = translateMat(this.torsoMatrix, 0, deltaY, 0);

    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.torso.setMatrix(matrix);

    // Update all the other robot parts
    this.updateHead(matrix);

    let mL = this.updateThighLeft(matrix);
    let mR = this.updateThighRight(matrix);

    this.updateLegLeft(mL);
    this.updateLegRight(mR);

    mL = this.updateArmLeft(matrix);
    mR = this.updateArmRight(matrix);

    this.updateForearmLeft(mL);
    this.updateForearmRight(mR);
  }

  // Methods for looking at a point/dot in the 3D world

  /**
   * Compute and apply the correct rotation of the head and the torso for the robot to look at 'point'.
   * @param point : THREE.Vector3 The point to look at.
   */
  look_at(point){
    // Position of the center of the torso
    let centerTorso = new THREE.Vector3(0, 0, 0);
    let m = multMat(this.torsoMatrix, this.torsoInitMatrix);
    centerTorso.applyMatrix4(m);

    // Distance between the point to look at and the center of the torso
    let distX = point.x - centerTorso.x;
    let distZ = point.z - centerTorso.z;

    // Find the angle on the Y axis (thetaY) that the torso must have to look in the direction of the point.
    let thetaY;

    if (distX === 0 && distZ >= 0) {
      thetaY = 0;

    } else if (distX === 0 && distZ < 0) {
      thetaY = this.pi;

    } else if (distX > 0 && distZ === 0) {
      thetaY = this.pi/2; 
      
    } else if (distX < 0 && distZ === 0) {
      thetaY = -this.pi/2;

    } else {
      thetaY = Math.atan(distX/distZ);

      if (distX > 0 && distZ < 0) {
        thetaY += this.pi;
        
      } else if (distX < 0 && distZ < 0) {
        thetaY -= this.pi;
      }
    }

    // Find the angle difference (deltaAngleY) between thetaY and the angle of the
    // torso (this.torsoAngle) and rotate the torso by deltaAngleY to align it with
    // the point to look at.

    if (this.torsoAngle !== thetaY) {
      let deltaAngleY = -this.torsoAngle + thetaY;
      let p = 2 * this.pi;

      if (deltaAngleY !== p && deltaAngleY !== -p) {

        // Find the smallest angle for the rotation
        if (deltaAngleY > this.pi) {
          deltaAngleY = deltaAngleY - p;
          
        } else if (deltaAngleY < -this.pi) {
          deltaAngleY = deltaAngleY + p;
        }

        this.rotateTorso(deltaAngleY);
      }
    }
    // else : no rotation, because the torso's angle and thetaY are the same

    // Rotate the head on the Y axis so that it's looking in the same direction as the
    // torso and towards the point to look at.
    this.rotateHead(-this.headAngleY, "y");

    // Position of the center of the head
    let centerHead = new THREE.Vector3(0,0,0);
    m = multMat(m, this.headMatrix);
    m = multMat(m, this.headInitMatrix);
    centerHead.applyMatrix4(m);

    // Distance between the point to look at and the center of the head
    distX = point.x - centerHead.x;
    let distY = point.y - centerHead.y;
    distZ = point.z - centerHead.z;

    // Find the angle on the X axis (thetaX) that the head must have to look at the point.
    let thetaX;

    if (distY === 0) {
      thetaX = 0;

    } else if (distX === 0 && distZ === 0) {

      if (distY >= 0) {
        thetaX = this.pi/2;

      } else {
        thetaX = -this.pi/2;
      }

    } else {
      let hypo = Math.sqrt(distX*distX + distY*distY + distZ*distZ);
      thetaX = Math.asin(distY/hypo);
    }

    // Find the angle difference (deltaAngleX) between thetaX and the angle of the
    // head (this.headAngleX) and rotate the head by deltaAngleX so it's looking
    // at the point.

    let deltaAngleX = -this.headAngleX - thetaX;
    this.rotateHead(deltaAngleX, "x");
  }
}

var robot = new Robot();

// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();

var selectedRobotComponent = 0;
var components = [
  "Torso",
  "Head",
  "Left Arm",
  "Left Forearm",
  "Right Arm",
  "Right Forearm",
  "Left Thigh",
  "Left Leg",
  "Right Thigh",
  "Right Leg",
];
var numberComponents = components.length;

//MOUSE EVENTS
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var sphere = null;

document.addEventListener('mousemove', onMouseMove, false);

var isRightButtonDown = false;

function checkKeyboard() {
  // Next element
  if (keyboard.pressed("e")){
    selectedRobotComponent = selectedRobotComponent + 1;

    if (selectedRobotComponent<0){
      selectedRobotComponent = numberComponents - 1;
    }

    if (selectedRobotComponent >= numberComponents){
      selectedRobotComponent = 0;
    }

    window.alert(components[selectedRobotComponent] + " selected");
  }

  // Previous element
  if (keyboard.pressed("q")){
    selectedRobotComponent = selectedRobotComponent - 1;

    if (selectedRobotComponent < 0){
      selectedRobotComponent = numberComponents - 1;
    }

    if (selectedRobotComponent >= numberComponents){
      selectedRobotComponent = 0;
    }

    window.alert(components[selectedRobotComponent] + " selected");
  }

  // UP
  if (keyboard.pressed("w")){
    switch (components[selectedRobotComponent]){
      case "Torso":
        robot.moveTorso(0.1);
        break;
      case "Head":
        robot.rotateHead(-0.1, "x");
        break;
      case "Left Arm":
        robot.rotateArmLeft(-0.1, "y");
        break;
      case "Left Forearm":
        robot.rotateForearmLeft(-0.1);
        break;
      case "Right Arm":
        robot.rotateArmRight(-0.1,"y");
        break;
      case "Right Forearm":
        robot.rotateForearmRight(-0.1);
        break;
      case "Left Thigh":
        robot.inWalkAnimation = false;
        robot.rotateThighLeft(-0.1);
        break;
      case "Left Leg":
        robot.inWalkAnimation = false;
        robot.rotateLegLeft(-0.1);
        break;
      case "Right Thigh":
        robot.inWalkAnimation = false;
        robot.rotateThighRight(-0.1);
        break;
      case "Right Leg":
        robot.inWalkAnimation = false;
        robot.rotateLegRight(-0.1);
        break;
    }
  }

  // DOWN
  if (keyboard.pressed("s")){
    switch (components[selectedRobotComponent]){
      case "Torso":
        robot.moveTorso(-0.1);
        break;
      case "Head":
        robot.rotateHead(0.1, "x");
        break;
      case "Left Arm":
        robot.rotateArmLeft(0.1, "y");
        break;
      case "Left Forearm":
        robot.rotateForearmLeft(0.1);
        break;
      case "Right Arm":
        robot.rotateArmRight(0.1,"y");
        break;
      case "Right Forearm":
        robot.rotateForearmRight(0.1);
        break;
      case "Left Thigh":
        robot.inWalkAnimation = false;
        robot.rotateThighLeft(0.1);
        break;
      case "Left Leg":
        robot.inWalkAnimation = false;
        robot.rotateLegLeft(0.1);
        break;
      case "Right Thigh":
        robot.inWalkAnimation = false;
        robot.rotateThighRight(0.1);
        break;
      case "Right Leg":
        robot.inWalkAnimation = false;
        robot.rotateLegRight(0.1);
        break;
    }
  }

  // LEFT
  if (keyboard.pressed("a")){
    switch (components[selectedRobotComponent]){
      case "Torso":
        robot.rotateTorso(0.1);
        break;
      case "Head":
        robot.rotateHead(0.1, "y");
        break;
      case "Left Arm":
        robot.rotateArmLeft(-0.1, "z");
        break;
      case "Left Forearm":
        break;
      case "Right Arm":
        robot.rotateArmRight(-0.1, "z");
        break;
      case "Right Forearm":
        break;
      case "Left Thigh":
        break;
      case "Left Leg":
        break;
      case "Right Thigh":
        break;
      case "Right Leg":
        break;
    }
  }

  // RIGHT
  if (keyboard.pressed("d")){
    switch (components[selectedRobotComponent]){
      case "Torso":
        robot.rotateTorso(-0.1);
        break;
      case "Head":
        robot.rotateHead(-0.1, "y");
        break;
      case "Left Arm":
        robot.rotateArmLeft(0.1, "z");
        break;
      case "Left Forearm":
        break;
      case "Right Arm":
        robot.rotateArmRight(0.1, "z");
        break;
      case "Right Forearm":
        break;
      case "Left Thigh":
        break;
      case "Left Leg":
        break;
      case "Right Thigh":
        break;
      case "Right Leg":
        break;
    }
  }

  if (keyboard.pressed("f")) {
    isRightButtonDown = true;

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);

    vector.unproject(camera);

    var dir = vector.sub(camera.position).normalize();

    raycaster.ray.origin.copy(camera.position);
    raycaster.ray.direction.copy(dir);

    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      if (!sphere) {
        var geometry = new THREE.SphereGeometry(0.1, 32, 32);
        var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
      }
    }

    updateLookAtPosition();
  }
  else{
    isRightButtonDown = false;

    if (sphere) {
      scene.remove(sphere);
      sphere.geometry.dispose();
      sphere.material.dispose();
      sphere = null;
    }
  }
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  if (isRightButtonDown) {
    updateLookAtPosition();
  }
}

function updateLookAtPosition() {
  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);

  vector.unproject(camera);

  var dir = vector.sub(camera.position).normalize();

  raycaster.ray.origin.copy(camera.position);
  raycaster.ray.direction.copy(dir);

  var intersects = raycaster.intersectObjects(scene.children.filter(obj => obj !== sphere), true);

  if (intersects.length > 0) {
    var intersect = intersects[0]
    sphere.position.copy(intersect.point);
    robot.look_at(intersect.point);
  }
}

// SETUP UPDATE CALL-BACK
function update() {
  checkKeyboard();
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

update();
