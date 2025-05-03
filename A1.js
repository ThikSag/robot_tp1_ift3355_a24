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
      // In that case, the identity matrix is used.
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
      // In that case, the identity matrix is used.
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
    this.torsoAngle = 0;  // Current angle of the torso rotation

    // Head parameters
    this.headRadius = 0.32;  // Height and depth of the head, 2x Radius = Width of the head
    this.headAngleMax = this.pi/2;  // Maximum angle of the head rotation
    this.headAngleX = 0;  // Current angle of the head rotation on the X axis
    this.headAngleY = 0;  // Current angle of the head rotation on the Y axis

    // Eyes parameters
    this.eyesRadius = 0.08;

    // Arms parameters
    this.ArmsHeight = 0.6;
    this.ArmsRadius = 0.15;
    this.ArmLAngleZ = 0;  // Current angle of the left arm rotation on the Z axis
    this.ArmLAngleY = 0;  // Current angle of the left arm rotation on the Y axis
    this.ArmRAngleZ = 0;  // Current angle of the right arm rotation on the Z axis
    this.ArmRAngleY = 0;  // Current angle of the right arm rotation on the Y axis

    // Forearms parameters
    this.forearmsHeight = 0.4;
    this.forearmsRadius = 0.12;
    this.forearmLAngle = 0;  // Current angle of the left forearm rotation
    this.forearmRAngle = 0;  // Current angle of the right forearm rotation

    // Thighs parameters
    this.thighsHeight = 0.9;
    this.thighsRadius = 0.3;
    this.thighsAngleMax = 2.4;  // Maximum angle of the thighs rotation
    this.thighLAngle = 0;  // Current angle of the left thigh rotation
    this.thighRAngle = 0;  // Current angle of the right thigh rotation

    // Legs parameters
    this.legsHeight = 0.7;
    this.legsRadius = 0.2;
    this.legsAngleMax = 1.5;  // Maximum angle of the legs rotation
    this.legLAngle = 0;  // Current angle of the left leg rotation
    this.legRAngle = 0;  // Current angle of the right leg rotation

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
   *
   */
  initialize() {
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
    this.torsoMatrix = idMat4();
    this.torso.setMatrix(this.torsoInitMatrix);

    // Head transformation
    this.headInitMatrix = this.initialHeadMatrix();
    this.headMatrix = idMat4();
    let matrix = multMat(this.torsoInitMatrix, this.headInitMatrix);
    this.head.setMatrix(matrix);

    // Eyes tranformations
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
    let mg = multMat(this.armLInitMat, this.armsRescaleMat);
    mg = multMat(this.torsoInitMatrix, mg);
    this.armL.setMatrix(mg);

    // Arm right
    this.brasDMatrix = idMat4();
    this.brasDRotateMat= idMat4();
    this.brasDInitMat = this.initialArmMatrix("r");
    let md = multMat(this.brasDInitMat, this.armsRescaleMat);
    md = multMat(this.torsoInitMatrix, md);
    this.armR.setMatrix(md);

    // Forearms transformations
    this.avantBrasRescaleMat = rescaleMat(idMat4(), this.forearmsHeight, this.forearmsRadius, this.forearmsRadius);

    // Forearm left
    this.avantBrasGMatrix = idMat4();
    this.avantBrasGRotateMat = idMat4();
    this.avantBrasGInitMat = this.initialForearmMatrix("l");
    mg = multMat(mg, this.armsRescaleMatInv);
    mg = multMat(mg, this.avantBrasGInitMat);
    mg = multMat(mg, this.avantBrasRescaleMat);
    this.forearmL.setMatrix(mg);

    // Forearm right
    this.avantBrasDMatrix = idMat4();
    this.avantBrasDRotateMat = idMat4();
    this.avantBrasDInitMat = this.initialForearmMatrix("r");
    md = multMat(md, this.armsRescaleMatInv);
    md = multMat(md, this.avantBrasDInitMat);
    md = multMat(md, this.avantBrasRescaleMat);
    this.forearmR.setMatrix(md);

    // Thighs transformations
    this.cuisseRescaleMat = rescaleMat(idMat4(), this.thighsRadius, this.thighsHeight/2, this.thighsRadius);
    this.cuisseRescaleMatInv = invertMat(this.cuisseRescaleMat);

    // Thigh left
    this.cuisseGInitMat = this.initialThighMatrix("l");
    this.cuisseGMatrix = idMat4();
    this.cuisseGRotatMat = idMat4();
    let matrixG = multMat(this.torsoInitMatrix, this.cuisseGInitMat);
    matrixG = multMat(matrixG, this.cuisseRescaleMat);
    this.thighL.setMatrix(matrixG);
    
    // Thigh right
    this.cuisseDInitMat = this.initialThighMatrix("r");
    this.cuisseDMatrix = idMat4();
    this.cuisseDRotatMat = idMat4();
    let matrixD = multMat(this.torsoInitMatrix, this.cuisseDInitMat);
    matrixD = multMat(matrixD, this.cuisseRescaleMat);
    this.thighR.setMatrix(matrixD);

    // Legs transformations
    this.jambeRescaleMat = rescaleMat(idMat4(), this.legsRadius, this.legsHeight/2, this.legsRadius);

    // Leg left
    this.jambeGInitMat = this.initialLegMatrix();
    this.jambeGMatrix = idMat4();
    this.jambeGRotatMat = idMat4();
    matrixG = multMat(matrixG, this.cuisseRescaleMatInv);
    matrixG = multMat(matrixG, this.jambeGInitMat);
    matrixG = multMat(matrixG, this.jambeRescaleMat);
    this.legL.setMatrix(matrixG);

    // Leg right
    this.jambeDInitMat = this.initialLegMatrix();
    this.jambeDMatrix = idMat4();
    this.jambeDRotatMat = idMat4();
    matrixD = multMat(matrixD, this.cuisseRescaleMatInv);
    matrixD = multMat(matrixD, this.jambeDInitMat);
    matrixD = multMat(matrixD, this.jambeRescaleMat);
    this.legR.setMatrix(matrixD);

    // Add robot to scene
    scene.add(this.torso);
    scene.add(this.head);
    scene.add(this.eyeL);
    scene.add(this.eyeR);
    scene.add(this.armL);
    scene.add(this.armR);
    scene.add(this.forearmR);
    scene.add(this.forearmL);
    scene.add(this.thighL);
    scene.add(this.thighR);
    scene.add(this.legL);
    scene.add(this.legR);
  }

  // Methods for moving/rotating the robot parts

  /**
   *
   * @param angle
   */
  rotateTorso(angle){
    let torsoMatrix = this.torsoMatrix;

    this.torsoMatrix = idMat4();
    this.torsoMatrix = rotateMat(this.torsoMatrix, angle, "y");
    this.torsoMatrix = multMat(torsoMatrix, this.torsoMatrix);

    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.torso.setMatrix(matrix);

    this.walkDirection = rotateVec3(this.walkDirection, angle, "y");

    // Mise à jours de tous les autres membres du robot
    this.updateHead(matrix);

    let matrixG = this.updateCuisseG(matrix);
    let matrixD = this.updateCuisseD(matrix);

    this.updateJambeG(matrixG);
    this.updateJambeD(matrixD);

    matrixG = this.updateBrasG(matrix);
    matrixD = this.updateBrasD(matrix);

    this.updateAvantBrasG(matrixG);
    this.updateAvantBrasD(matrixD);
    
    // Mise à jours de l'angle radian actuel du torse pour la fonction look_at.
    // On garde l'angle radian entre -3.14 et 3.14 pour simplifier les calculs futurs de look_at.
    this.torsoAngle += angle;

    const a = correctAngle(this.torsoAngle);
    if (a > this.pi) {
      this.torsoAngle = this.torsoAngle - (2 * this.pi);

    } else if (a < -this.pi) {
      this.torsoAngle = this.torsoAngle + (2 * this.pi);
    }
  }

  /**
   *
   * @param speed
   */
  moveTorso(speed){
    this.torsoMatrix = translateMat(this.torsoMatrix, speed * this.walkDirection.x, speed * this.walkDirection.y, speed * this.walkDirection.z);

    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.torso.setMatrix(matrix);

    // Mise à jour de la tête et des yeux
    this.updateHead(matrix);

    // Mise à jour des Bras et des Avant-Bras
    let matrixG = this.updateBrasG(matrix);
    let matrixD = this.updateBrasD(matrix);

    this.updateAvantBrasG(matrixG);
    this.updateAvantBrasD(matrixD);

    // Transformation pour l'animation d'une marche cyclique

    // Si le robot n'était pas en animation de marche, la position des cuisses et jambes est remise à zéro pour que
    // le robot puisse marcher correctement, c'est-à-dire sans avoir des cuisses et/ou jambes dans des positions
    // anormales pour marcher.
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

    // Animation cyclique correspondant à une marche
    if (this.firstStepAnim) { // Le premier pas du robot est différent du restant de l'animation de marche
      this.firstStep(speed);

    } else {
      this.marcheCuisseGauche(speed);
      this.marcheCuisseDroite(speed);
      this.marcheJambeGauche(speed);
      this.marcheJambeDroite(speed);
    }

    // Jambe de support et déplacement en Y pour que le robot marche sur le sol.
    this.standOnFloor();
  }

  /**
   *
   * @param angle
   * @param axis
   */
  rotateHead(angle, axis){
    // // Mise à jours de l'angle radian actuel de la tête selon l'axe
    if (axis === "x") {
      this.headAngleX += angle;
      this.headAngleX = correctAngle(this.headAngleX);

      // Angle radian de rotation maximum de la tête en X
      if (this.headAngleX > this.headAngleMax) {
        this.headAngleX = this.headAngleMax;
      } else if (this.headAngleX < -this.headAngleMax) {
        this.headAngleX = -this.headAngleMax;
      }

    } else if (axis === "y") {
      this.headAngleY += angle;
      this.headAngleY = correctAngle(this.headAngleY);

      // Angle radian de rotation maximum de la tête en Y
      if (this.headAngleY > this.headAngleMax) {
        this.headAngleY = this.headAngleMax;
      } else if (this.headAngleY < -this.headAngleMax) {
        this.headAngleY = -this.headAngleMax;
      }
    }

    let m = multMat(idMat4(), this.headInitMatrix);
    m = translateMat(m, 0, -this.headRadius/2, 0);
    let im = invertMat(m);

    // Mise à jour de la matrice de rotation de la tête
    this.headMatrix = idMat4();
    this.headMatrix = multMat(im, this.headMatrix);
    this.headMatrix = rotateMat(this.headMatrix, this.headAngleX, "x");
    this.headMatrix = rotateMat(this.headMatrix, this.headAngleY, "y");
    this.headMatrix = multMat(m, this.headMatrix);

    // Mise à jour de la tête et des yeux
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.updateHead(matrix);
  }

  /**
   *
   * @param angle
   * @param axis
   */
  rotateBrasGauche(angle, axis){
    if(axis === "y"){
      this.ArmLAngleY += angle;
    }
    else if (axis === "z"){
      this.ArmLAngleZ += angle;
    }

    // Mise à jour de la matrice de rotation du bras gauche
    this.armLRotateMat = idMat4();
    this.armLRotateMat = translateMat(this.armLRotateMat, -this.ArmsHeight, 0, 0);
    this.armLRotateMat = rotateMat(this.armLRotateMat, this.ArmLAngleY, "y");
    this.armLRotateMat = rotateMat(this.armLRotateMat, this.ArmLAngleZ, "z");
    this.armLRotateMat = translateMat(this.armLRotateMat, this.ArmsHeight, 0, 0);

    // update du bras gauche et de l'avant-bras gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateBrasG(matrix);
    this.updateAvantBrasG(matrix);
  }

  /**
   *
   * @param angle
   * @param axis
   */
  rotateBrasDroit(angle, axis){
    if(axis === "y"){
      this.ArmRAngleY += angle;
    }
    else if (axis === "z"){
      this.ArmRAngleZ += angle;
    }

    // Mise à jour de la matrice de rotation du bras droit
    this.brasDRotateMat = idMat4();
    this.brasDRotateMat = translateMat(this.brasDRotateMat, this.ArmsHeight, 0, 0);
    this.brasDRotateMat = rotateMat(this.brasDRotateMat, this.ArmRAngleY, "y");
    this.brasDRotateMat = rotateMat(this.brasDRotateMat, this.ArmRAngleZ, "z");
    this.brasDRotateMat = translateMat(this.brasDRotateMat, -this.ArmsHeight, 0, 0);

    // update du bras droit et de l'avant-bras droit
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateBrasD(matrix);
    this.updateAvantBrasD(matrix);
  }

  /**
   *
   * @param angle
   */
  rotateAvantBrasGauche(angle){
    this.forearmLAngle += angle;

    // Mise à jour de la matrice de rotation de l'avant-bras gauche
    this.avantBrasGRotateMat = idMat4();
    this.avantBrasGRotateMat = translateMat(this.avantBrasGRotateMat, -this.forearmsHeight, 0, 0);
    this.avantBrasGRotateMat = rotateMat(this.avantBrasGRotateMat, this.forearmLAngle,"z");
    this.avantBrasGRotateMat = translateMat(this.avantBrasGRotateMat, this.forearmsHeight, 0, 0);

    // update de l'avant-bras gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = multMat(matrix, this.armLMatrix);
    matrix = multMat(matrix, this.armLInitMat);
    matrix = multMat(matrix, this.armLRotateMat);
    matrix = multMat(matrix, this.avantBrasGMatrix);
    matrix = multMat(matrix, this.avantBrasGInitMat);
    matrix = multMat(matrix, this.avantBrasGRotateMat);
    matrix = multMat(matrix, this.avantBrasRescaleMat);
    this.forearmL.setMatrix(matrix);
  }

  /**
   *
   * @param angle
   */
  rotateAvantBrasDroit(angle){
    this.forearmRAngle += angle;

    // Mise à jour de la matrice de rotation de l'avant-bras droit
    this.avantBrasDRotateMat = idMat4();
    this.avantBrasDRotateMat = translateMat(this.avantBrasDRotateMat, this.forearmsHeight, 0, 0);
    this.avantBrasDRotateMat = rotateMat(this.avantBrasDRotateMat, this.forearmRAngle,"z");
    this.avantBrasDRotateMat = translateMat(this.avantBrasDRotateMat, -this.forearmsHeight, 0, 0);

    // update de l'avant-bras gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = multMat(matrix, this.brasDMatrix);
    matrix = multMat(matrix, this.brasDInitMat);
    matrix = multMat(matrix, this.brasDRotateMat);
    matrix = multMat(matrix, this.avantBrasDMatrix);
    matrix = multMat(matrix, this.avantBrasDInitMat);
    matrix = multMat(matrix, this.avantBrasDRotateMat);
    matrix = multMat(matrix, this.avantBrasRescaleMat);
    this.forearmR.setMatrix(matrix);
  }

  /**
   *
   * @param angle
   */
  rotateCuisseGauche(angle){
    this.thighLAngle += angle;
    this.thighLAngle = correctAngle(this.thighLAngle);

    // Angle radian de rotation maximum de la cuisse
    if (this.thighLAngle > this.thighsAngleMax) {
      this.thighLAngle = this.thighsAngleMax;
    } else if (this.thighLAngle < -this.thighsAngleMax) {
      this.thighLAngle = -this.thighsAngleMax;
    }

    // Mise à jour de la matrice de rotation de la cuisse gauche
    this.cuisseGRotatMat = idMat4();
    this.cuisseGRotatMat = translateMat(this.cuisseGRotatMat, 0, -this.thighsHeight/2, 0);
    this.cuisseGRotatMat = rotateMat(this.cuisseGRotatMat, this.thighLAngle, "x");
    this.cuisseGRotatMat = translateMat(this.cuisseGRotatMat, 0, this.thighsHeight/2, 0);

    // Mise à jour de la cuisse gauche et de la jambe gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateCuisseG(matrix);
    this.updateJambeG(matrix);
  }

  /**
   *
   * @param angle
   */
  rotateCuisseDroite(angle){
    this.thighRAngle += angle;
    this.thighRAngle = correctAngle(this.thighRAngle);

    // Angle radian de rotation maximum de la cuisse
    if (this.thighRAngle > this.thighsAngleMax) {
      this.thighRAngle = this.thighsAngleMax;
    } else if (this.thighRAngle < -this.thighsAngleMax) {
      this.thighRAngle = -this.thighsAngleMax;
    }

    // Mise à jour de la matrice de rotation de la cuisse droite
    this.cuisseDRotatMat = idMat4();
    this.cuisseDRotatMat = translateMat(this.cuisseDRotatMat, 0, -this.thighsHeight/2, 0);
    this.cuisseDRotatMat = rotateMat(this.cuisseDRotatMat, this.thighRAngle, "x");
    this.cuisseDRotatMat = translateMat(this.cuisseDRotatMat, 0, this.thighsHeight/2, 0);

    // Mise à jour de la cuisse droite et de la jambe droite
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateCuisseD(matrix);
    this.updateJambeD(matrix);
  }

  /**
   *
   * @param angle
   */
  rotateJambeGauche(angle){
    this.legLAngle += angle;
    this.legLAngle = correctAngle(this.legLAngle);

    // Angle radian de rotation maximum de la jambe
    if (this.legLAngle > this.legsAngleMax) {
      this.legLAngle = this.legsAngleMax;
    } else if (this.legLAngle < -this.legsAngleMax) {
      this.legLAngle = -this.legsAngleMax;
    }

    // Mise à jour de la matrice de rotation de la jambe gauche
    this.jambeGRotatMat = idMat4();
    this.jambeGRotatMat = translateMat(this.jambeGRotatMat, 0, -this.legsHeight/2, 0);
    this.jambeGRotatMat = rotateMat(this.jambeGRotatMat, this.legLAngle, "x");
    this.jambeGRotatMat = translateMat(this.jambeGRotatMat, 0, this.legsHeight/2, 0);

    let matrix = multMat(this.jambeGMatrix, this.jambeGInitMat);
    matrix = multMat(matrix, this.jambeGRotatMat);
    matrix = multMat(matrix, this.jambeRescaleMat);
    matrix = multMat(this.cuisseGRotatMat, matrix);
    matrix = multMat(this.cuisseGInitMat, matrix);
    matrix = multMat(this.cuisseGMatrix, matrix);
    matrix = multMat(this.torsoInitMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    this.legL.setMatrix(matrix);
  }

  /**
   *
   * @param angle
   */
  rotateJambeDroite(angle){
    this.legRAngle += angle;
    this.legRAngle = correctAngle(this.legRAngle);

    // Angle radian de rotation maximum de la jambe
    if (this.legRAngle > this.legsAngleMax) {
      this.legRAngle = this.legsAngleMax;
    } else if (this.legRAngle < -this.legsAngleMax) {
      this.legRAngle = -this.legsAngleMax;
    }

    // Mise à jour de la matrice de rotation de la jambe droite
    this.jambeDRotatMat = idMat4();
    this.jambeDRotatMat = translateMat(this.jambeDRotatMat, 0, -this.legsHeight/2, 0);
    this.jambeDRotatMat = rotateMat(this.jambeDRotatMat, this.legRAngle, "x");
    this.jambeDRotatMat = translateMat(this.jambeDRotatMat, 0, this.legsHeight/2, 0);

    let matrix = multMat(this.jambeDMatrix, this.jambeDInitMat);
    matrix = multMat(matrix, this.jambeDRotatMat);
    matrix = multMat(matrix, this.jambeRescaleMat);
    matrix = multMat(this.cuisseDRotatMat, matrix);
    matrix = multMat(this.cuisseDInitMat, matrix);
    matrix = multMat(this.cuisseDMatrix, matrix);
    matrix = multMat(this.torsoInitMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    this.legR.setMatrix(matrix);
  }

  // Methods for updating the robot parts

  /**
   *
   * @param matrix
   */
  updateHead(matrix) {
    // Sert à faire la mise à jour de la tête et des yeux lorsqu'un membre qui précède la tête dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent la tête dans la
    //    hiérarchie des membres du robot.

    // Mise à jour de la tête
    let matrix2 = multMat(matrix, this.headMatrix);
    matrix2 = multMat(matrix2, this.headInitMatrix);
    this.head.setMatrix(matrix2);

    // Mise à jour de l'oeil gauche
    let m = multMat(matrix2, this.eyeLInitMat);
    m = multMat(m, this.EyesRescaleMat);
    this.eyeL.setMatrix(m);

    // Mise à jour de l'oeil droite
    m = multMat(matrix2, this.eyeRInitMat);
    m = multMat(m, this.EyesRescaleMat);
    this.eyeR.setMatrix(m);
  }

  /**
   *
   * @param matrix
   * @returns {THREE.Matrix4}
   */
  updateCuisseG(matrix) {
    // Sert à faire la mise à jour de la cuisse gauche lorsqu'un membre qui la précède dans
    //    la hiérarchie du robot à été modifié.
    // Return : la matrice de tous les tranformation des membres du robot jusqu'à la cuisse gauche incluse (excepté le rescale de la cuisse).
    // matrix : la matrice de toutes les tranformation des membres qui précèdent la cuisse gauche dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.cuisseGMatrix);
    matrix2 = multMat(matrix2, this.cuisseGInitMat);
    matrix2 = multMat(matrix2, this.cuisseGRotatMat);
    matrix2 = multMat(matrix2, this.cuisseRescaleMat);
    this.thighL.setMatrix(matrix2);

    // Retire le rescale de la cuisse gauche
    matrix2 = multMat(matrix2, this.cuisseRescaleMatInv);
    return matrix2;
  }

  /**
   *
   * @param matrix
   * @returns {THREE.Matrix4}
   */
  updateCuisseD(matrix) {
    // Sert à faire la mise à jour de la cuisse droite lorsqu'un membre qui la précède dans
    //    la hiérarchie du robot à été modifié.
    // Return : la matrice de tous les tranformation des membres du robot jusqu'à la cuisse droite incluse (excepté le rescale de la cuisse).
    // matrix : la matrice de toutes les tranformation des membres qui précèdent la cuisse droite dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.cuisseDMatrix);
    matrix2 = multMat(matrix2, this.cuisseDInitMat);
    matrix2 = multMat(matrix2, this.cuisseDRotatMat);
    matrix2 = multMat(matrix2, this.cuisseRescaleMat);
    this.thighR.setMatrix(matrix2);

    // Retire le rescale de la cuisse droite
    matrix2 = multMat(matrix2, this.cuisseRescaleMatInv);
    return matrix2;
  }

  /**
   *
   * @param matrix
   */
  updateJambeG(matrix) {
    // Sert à faire la mise à jour de la jambe gauche lorsqu'un membre qui la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent la jambe gauche dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.jambeGMatrix);
    matrix2 = multMat(matrix2, this.jambeGInitMat);
    matrix2 = multMat(matrix2, this.jambeGRotatMat);
    matrix2 = multMat(matrix2, this.jambeRescaleMat);
    this.legL.setMatrix(matrix2);
  }

  /**
   *
   * @param matrix
   */
  updateJambeD(matrix) {
    // Sert à faire la mise à jour de la jambe droite lorsqu'un membre qui la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent la jambe droite dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.jambeDMatrix);
    matrix2 = multMat(matrix2, this.jambeDInitMat);
    matrix2 = multMat(matrix2, this.jambeDRotatMat);
    matrix2 = multMat(matrix2, this.jambeRescaleMat);
    this.legR.setMatrix(matrix2);
  }

  /**
   *
   * @param matrix
   * @returns {THREE.Matrix4}
   */
  updateBrasG(matrix) {
    // Sert à faire la mise à jour du bras gauche lorsqu'un membre qui précède la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent le bras gauche dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.armLMatrix);
    matrix2 = multMat(matrix2, this.armLInitMat);
    matrix2 = multMat(matrix2, this.armLRotateMat);
    matrix2 = multMat(matrix2, this.armsRescaleMat);
    this.armL.setMatrix(matrix2);

    // Retire le rescale du bras gauche
    matrix2 = multMat(matrix2, this.armsRescaleMatInv);
    return matrix2;
  }

  /**
   *
   * @param matrix
   * @returns {THREE.Matrix4}
   */
  updateBrasD(matrix) {
    // Sert à faire la mise à jour du bras droit lorsqu'un membre qui précède la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent le bras droit dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.brasDMatrix);
    matrix2 = multMat(matrix2, this.brasDInitMat);
    matrix2 = multMat(matrix2, this.brasDRotateMat);
    matrix2 = multMat(matrix2, this.armsRescaleMat);
    this.armR.setMatrix(matrix2);

    // Retire le rescale du bras droit
    matrix2 = multMat(matrix2, this.armsRescaleMatInv);
    return matrix2;
  }

  /**
   *
   * @param matrix
   */
  updateAvantBrasG(matrix) {
    // Sert à faire la mise à jour de l'avant-bras gauche lorsqu'un membre qui la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent l'avant-bras gauche dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.avantBrasGMatrix);
    matrix2 = multMat(matrix2, this.avantBrasGInitMat);
    matrix2 = multMat(matrix2, this.avantBrasGRotateMat);
    matrix2 = multMat(matrix2, this.avantBrasRescaleMat);
    this.forearmL.setMatrix(matrix2);
  }

  /**
   *
   * @param matrix
   */
  updateAvantBrasD(matrix) {
    // Sert à faire la mise à jour de l'avant-bras droit lorsqu'un membre qui la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent l'avant-bras droit dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.avantBrasDMatrix);
    matrix2 = multMat(matrix2, this.avantBrasDInitMat);
    matrix2 = multMat(matrix2, this.avantBrasDRotateMat);
    matrix2 = multMat(matrix2, this.avantBrasRescaleMat);
    this.forearmR.setMatrix(matrix2);
  }

  // Methods for the walking animation of the robot

  /**
   *
   * @param speed
   */
  firstStep(speed) {
    if (this.thighRAngle <= -0.5) { // Dernière rotation du premier pas
      this.thighRAngle = -0.5;
      this.firstStepAnim = false;
    }
    
    robot.rotateCuisseDroite(-speed);
    robot.rotateCuisseGauche(0.5 * speed);

    if (!this.legRGoUp) {
      robot.rotateJambeDroite(speed);

      if (this.legRAngle >= 0.4) {
        this.legRAngle = 0.4;
        this.legRGoUp = true;
      }

    } else { // jambe droite descend
      robot.rotateJambeDroite(-speed);
    }

    if (this.thighLAngle >= 0.1) {
      robot.rotateJambeGauche(speed);
    }
    // else : aucune rotation de la jambe gauche
  }

  /**
   *
   * @param speed
   */
  marcheCuisseGauche(speed) {
    const avance = speed > 0;

    if (avance && this.thighLGoUp && this.thighLAngle > -0.6) {
      robot.rotateCuisseGauche(-speed);

    } else if (avance && this.thighLGoUp) { // thighLAngle <= -0.6
      this.thighLGoUp = false;
      this.thighLAngle = -0.6;
      robot.rotateCuisseGauche(speed);

    } else if (avance && this.thighLAngle < 0.3) { // Descend
      robot.rotateCuisseGauche(speed);

    } else if (avance) { // Descend , thighLAngle >= 0.3
      this.thighLGoUp = true;
      this.thighLAngle = 0.3;
      robot.rotateCuisseGauche(-speed);

    } else if (this.thighLGoUp && this.thighLAngle > -0.6) { // Recule
      robot.rotateCuisseGauche(speed);

    } else if (this.thighLGoUp) { // Recule , thighLAngle <= -0.6
      this.thighLGoUp = false;
      this.thighLAngle = -0.6;
      robot.rotateCuisseGauche(-speed);

    } else if (this.thighLAngle < 0.3) { // Recule , Descend
      robot.rotateCuisseGauche(-speed);

    } else { // Recule , Descend , thighLAngle >= 0.3
      this.thighLGoUp = true;
      this.thighLAngle = 0.3;
      robot.rotateCuisseGauche(speed);
    }
  }

  /**
   *
   * @param speed
   */
  marcheCuisseDroite(speed) {
    const avance = speed > 0;

    if (avance && this.thighRGoUp && this.thighRAngle > -0.6) {
      robot.rotateCuisseDroite(-speed);

    } else if (avance && this.thighRGoUp) { // thighRAngle <= -0.6
      this.thighRGoUp = false;
      this.thighRAngle = -0.6;
      robot.rotateCuisseDroite(speed);

    } else if (avance && this.thighRAngle < 0.3) { // Cuisse descend
      robot.rotateCuisseDroite(speed);

    } else if (avance) { // Descend , thighRAngle >= 0.3
      this.thighRGoUp = true;
      this.thighRAngle = 0.3;
      robot.rotateCuisseDroite(-speed);

    } else if (this.thighRGoUp && this.thighRAngle > -0.6) { // Recule
      robot.rotateCuisseDroite(speed);

    } else if (this.thighRGoUp) { // Recule , thighRAngle <= -0.6
      this.thighRGoUp = false;
      this.thighRAngle = -0.6;

      robot.rotateCuisseDroite(-speed);

    } else if (this.thighRAngle < 0.3) { // Recule , Descend
      robot.rotateCuisseDroite(-speed);

    } else { // Recule , Descend , thighRAngle >= 0.3
      this.thighRGoUp = true;
      this.thighRAngle = 0.3;
      robot.rotateCuisseDroite(speed);
    }
  }

  /**
   *
   * @param speed
   */
  marcheJambeGauche(speed){
    const avance = speed > 0;

    if (avance && this.legLGoUp && this.legLAngle > 0.2) {
      robot.rotateJambeGauche(-speed);

    } else if (avance && this.legLGoUp && this.legLAngle === 0.2) {

      if (this.thighLAngle === -0.4) {
        robot.rotateJambeGauche(speed);

      } else {
        robot.rotateJambeGauche(0);
      }

    } else if (avance && this.legLGoUp && this.legLAngle > 0) {
      robot.rotateJambeGauche(-speed);

    } else if (avance && this.legLGoUp) { // legLAngle <= 0
      this.legLGoUp = false;
      this.legLAngle = 0;
      robot.rotateJambeGauche(0);

    } else if (avance && this.legLAngle === 0) { // Descend
      
      if (this.thighLAngle === 0) {
        robot.rotateJambeGauche(0.5 * speed);

      } else {
        robot.rotateJambeGauche(0);
      }

    } else if (avance && this.legLAngle < 0.5) { // Descend
      robot.rotateJambeGauche(1.5 * speed);

    } else if (avance && this.legLAngle < 0.8) { // Descend
      robot.rotateJambeGauche(speed);

    } else if (avance) { // Descend, legLAngle >= 0.8
      this.legLGoUp = true;
      this.legLAngle = 0.8;
      robot.rotateJambeGauche(-speed);

    } else if (this.legLGoUp && this.legLAngle > 0.2) { // Recule
      robot.rotateJambeGauche(speed);

    } else if (this.legLGoUp && this.legLAngle === 0.2) { // Recule

      if (this.thighLAngle === -0.4) {
        robot.rotateJambeGauche(-speed);

      } else {
        robot.rotateJambeGauche(0);
      }

    } else if (this.legLGoUp && this.legLAngle > 0) { // Recule
      robot.rotateJambeGauche(speed);

    } else if (this.legLGoUp) { // Recule, legLAngle <= 0
      this.legLGoUp = false;
      this.legLAngle = 0;
      robot.rotateJambeGauche(0);

    } else if (this.legLAngle === 0) { // Recule, descend

      if (this.thighLAngle === 0) {
        robot.rotateJambeGauche(0.5 * -speed);

      } else {
        robot.rotateJambeGauche(0);
      }

    } else if (this.legLAngle < 0.5) { // Recule, descend
      robot.rotateJambeGauche(1.5 * -speed);

    } else if (this.legLAngle < 0.8) { // Recule, descend
      robot.rotateJambeGauche(-speed);

    } else { // Recule, descend, legLAngle >= 0.8
      this.legLGoUp = true;
      this.legLAngle = 0.8;
      robot.rotateJambeGauche(speed);
    }
  }

  /**
   *
   * @param speed
   */
  marcheJambeDroite(speed){
    const avance = speed > 0;

    if (avance && this.legRGoUp && this.legRAngle > 0.2) {
      robot.rotateJambeDroite(-speed);

    } else if (avance && this.legRGoUp && this.legRAngle === 0.2) {

      if (this.thighRAngle === -0.4) {
        robot.rotateJambeDroite(speed);

      } else {
        robot.rotateJambeDroite(0);
      }

    } else if (avance && this.legRGoUp && this.legRAngle > 0) {
      robot.rotateJambeDroite(-speed);

    } else if (avance && this.legRGoUp) { // legRAngle <= 0
      this.legRGoUp = false;
      this.legRAngle = 0;
      robot.rotateJambeDroite(0);

    } else if (avance && this.legRAngle === 0) { // Descend
      
      if (this.thighRAngle === 0) {
        robot.rotateJambeDroite(0.5 * speed);

      } else {
        robot.rotateJambeDroite(0);
      }

    } else if (avance && this.legRAngle < 0.5) { // Descend
      robot.rotateJambeDroite(1.5 * speed);

    } else if (avance && this.legRAngle < 0.8) { // Descend
      robot.rotateJambeDroite(speed);

    } else if (avance) { // Descend, legRAngle >= 0.8
      this.legRGoUp = true;
      this.legRAngle = 0.8;
      robot.rotateJambeDroite(-speed);

    } else if (this.legRGoUp && this.legRAngle > 0.2) { // Recule
      robot.rotateJambeDroite(speed);

    } else if (this.legRGoUp && this.legRAngle === 0.2) { // Recule

      if (this.thighRAngle === -0.4) {
        robot.rotateJambeDroite(-speed);

      } else {
        robot.rotateJambeDroite(0);
      }

    } else if (this.legRGoUp && this.legRAngle > 0) { // Recule
      robot.rotateJambeDroite(speed);

    } else if (this.legRGoUp) { // Recule, legRAngle <= 0
      this.legRGoUp = false;
      this.legRAngle = 0;
      robot.rotateJambeDroite(0);

    } else if (this.legRAngle === 0) { // Recule, descend

      if (this.thighRAngle === 0) {
        robot.rotateJambeDroite(0.5 * -speed);

      } else {
        robot.rotateJambeDroite(0);
      }

    } else if (this.legRAngle < 0.5) { // Recule, descend
      robot.rotateJambeDroite(1.5 * -speed);

    } else if (this.legRAngle < 0.8) { // Recule, descend
      robot.rotateJambeDroite(-speed);

    } else { // Recule, descend, legRAngle >= 0.8
      this.legRGoUp = true;
      this.legRAngle = 0.8;
      robot.rotateJambeDroite(speed);
    }
  }

  /**
   *
   */
  standOnFloor() {
    // End Effector des jambes à leur création
    let endEffectorG = new THREE.Vector3(0, -1, 0);
    let endEffectorD = new THREE.Vector3(0, -1, 0);

    // Matrices complètes des tranformations des jambes
    // Jambe Gauche
    let matrixG = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrixG = multMat(matrixG, this.cuisseGMatrix);
    matrixG = multMat(matrixG, this.cuisseGInitMat);
    matrixG = multMat(matrixG, this.cuisseGRotatMat);
    matrixG = multMat(matrixG, this.jambeGMatrix);
    matrixG = multMat(matrixG, this.jambeGInitMat);
    matrixG = multMat(matrixG, this.jambeGRotatMat);
    matrixG = multMat(matrixG, this.jambeRescaleMat);

    // Jambe droite
    let matrixD = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrixD = multMat(matrixD, this.cuisseDMatrix);
    matrixD = multMat(matrixD, this.cuisseDInitMat);
    matrixD = multMat(matrixD, this.cuisseDRotatMat);
    matrixD = multMat(matrixD, this.jambeDMatrix);
    matrixD = multMat(matrixD, this.jambeDInitMat);
    matrixD = multMat(matrixD, this.jambeDRotatMat);
    matrixD = multMat(matrixD, this.jambeRescaleMat);

    // Application des tranformations aux end effector des jambes
    endEffectorG.applyMatrix4(matrixG);
    endEffectorD.applyMatrix4(matrixD);

    // Trouver la jambe de support (la jambe avec le end effector le plus bas)
    // et le déplacement en Y à faire pour que le robot soit toujours en contact avec le sol.

    let deltaY;

    if (endEffectorG.y <= endEffectorD.y) {
      // Le end effector de la jambe gauche est plus bas que celui de la jambe droite (ou égale),
      // donc c'est la jambe de support!

      deltaY = - endEffectorG.y;

    } else { 
      // Le end effector de la jambe droite est plus bas que celui de la jambe gauche,
      // donc c'est la jambe de support!

      deltaY = - endEffectorD.y;
    }

    // Déplacement du robot pour qu'il soit en contact avec le sol.
    this.torsoMatrix = translateMat(this.torsoMatrix, 0, deltaY, 0);

    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.torso.setMatrix(matrix);

    // Mise à jour de tous les autres membres du robot
    this.updateHead(matrix);

    let mG = this.updateCuisseG(matrix);
    let mD = this.updateCuisseD(matrix);

    this.updateJambeG(mG);
    this.updateJambeD(mD);

    mG = this.updateBrasG(matrix);
    mD = this.updateBrasD(matrix);

    this.updateAvantBrasG(mG);
    this.updateAvantBrasD(mD);
  }

  // Methods for looking at the mouse on the floor

  /**
   *
   * @param point
   */
  look_at(point){
    // Compute and apply the correct rotation of the head and the torso for the robot to look at @point

    // Emplacement du centre du torse
    let centreTorse = new THREE.Vector3(0, 0, 0);
    let m = multMat(this.torsoMatrix, this.torsoInitMatrix);
    centreTorse.applyMatrix4(m);

    // Distance entre le point à regarder au sol et le centre du torse
    let distX = point.x - centreTorse.x;
    let distY = point.y - centreTorse.y;
    let distZ = point.z - centreTorse.z;

    // Calcul de l'angle en y (thetaY) que le torse doit avoir pour regarder dans la direction du point sur le sol.
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

    // Calcul de la différence d'angle (deltaAngleY) entre thetaY et l'angle du torse (this.torsoAngle)
    // et rotation du torse de deltaAngleY pour l'aligner avec le point à regarder.

    if (this.torsoAngle !== thetaY) {
      let deltaAngleY = -this.torsoAngle + thetaY;
      let p = 2 * this.pi;

      if (deltaAngleY !== p && deltaAngleY !== -p) {

        // trouver l'angle le plus petit pour faire la rotation
        if (deltaAngleY > this.pi) {
          deltaAngleY = deltaAngleY - p;
          
        } else if (deltaAngleY < -this.pi) {
          deltaAngleY = deltaAngleY + p;
        }

        this.rotateTorso(deltaAngleY);
      }

    } // else aucune rotation car l'angle de torse et thetaY sont identique

    // Tourner la tête en y pour qu'elle regarde dans la même direction que le torse et donc
    // vers le point à regarder.

    this.rotateHead(-this.headAngleY, "y");

    // Emplacement du centre de la tête
    let centreTete = new THREE.Vector3(0,0,0);
    m = multMat(m, this.headMatrix);
    m = multMat(m, this.headInitMatrix);
    centreTete.applyMatrix4(m);

    // Distance entre le point à regarder au sol et le centre de la tête
    distX = point.x - centreTete.x;
    distY = point.y - centreTete.y;
    distZ = point.z - centreTete.z;

    // Calcul de l'angle en x (thetaX) que la tête doit avoir pour regarder le point sur le sol.
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

    // Calcul de la différence d'angle (deltaAngleX) entre thetaX et l'angle de la tête (this.headAngleX)
    // et rotation de la tete de deltaAngleX pour qu'elle regarde le point au sol.
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
  // Add parts names
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
      // Add more cases
      case "Left Arm":
        robot.rotateBrasGauche(-0.1, "y");
        break;
      case "Left Forearm":
        robot.rotateAvantBrasGauche(-0.1);
        break;
      case "Right Arm":
        robot.rotateBrasDroit(-0.1,"y");
        break;
      case "Right Forearm":
        robot.rotateAvantBrasDroit(-0.1);
        break;
      case "Left Thigh":
        robot.inWalkAnimation = false;
        robot.rotateCuisseGauche(-0.1);
        break;
      case "Left Leg":
        robot.inWalkAnimation = false;
        robot.rotateJambeGauche(-0.1);
        break;
      case "Right Thigh":
        robot.inWalkAnimation = false;
        robot.rotateCuisseDroite(-0.1);
        break;
      case "Right Leg":
        robot.inWalkAnimation = false;
        robot.rotateJambeDroite(-0.1);
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
      // Add more cases
      case "Left Arm":
        robot.rotateBrasGauche(0.1, "y");
        break;
      case "Left Forearm":
        robot.rotateAvantBrasGauche(0.1);
        break;
      case "Right Arm":
        robot.rotateBrasDroit(0.1,"y");
        break;
      case "Right Forearm":
        robot.rotateAvantBrasDroit(0.1);
        break;
      case "Left Thigh":
        robot.inWalkAnimation = false;
        robot.rotateCuisseGauche(0.1);
        break;
      case "Left Leg":
        robot.inWalkAnimation = false;
        robot.rotateJambeGauche(0.1);
        break;
      case "Right Thigh":
        robot.inWalkAnimation = false;
        robot.rotateCuisseDroite(0.1);
        break;
      case "Right Leg":
        robot.inWalkAnimation = false;
        robot.rotateJambeDroite(0.1);
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
      // Add more cases
      case "Left Arm":
        robot.rotateBrasGauche(-0.1, "z");
        break;
      case "Left Forearm":
        break;
      case "Right Arm":
        robot.rotateBrasDroit(-0.1, "z");
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
      // Add more cases
      case "Left Arm":
        robot.rotateBrasGauche(0.1, "z");
        break;
      case "Left Forearm":
        break;
      case "Right Arm":
        robot.rotateBrasDroit(0.1, "z");
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
