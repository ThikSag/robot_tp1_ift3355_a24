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
function inverseMat(m){
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

class Robot {
  constructor() {
    // Geometry
    this.torsoHeight = 1.5;
    this.torsoRadius = 0.75;
    this.headRadius = 0.32;
    // Add parameters for parts

    // Additional parameters of the torso and the head for the look_at function
    this.torsoAngle = 0;
    this.headAngleX = 0;
    this.headAngleY = 0;
    this.pi = correctAngle(Math.PI);
    this.headAngleMax = this.pi/2;

    // Arms parameters
    this.brasHeight = 0.6;
    this.brasRadius = 0.15;
    this.brasGAngleZ =0;
    this.brasGAngleX =0;
    this.brasDAngleZ =0;
    this.brasDAngleX =0;

    // Forearms parameters
    this.avantBrasRadius = 0.12;
    this.avantBrasHeight = 0.4;
    this.avantBrasGAngle=0;
    this.avantBrasDAngle=0;

    // Thighs parameters
    this.cuisseHeight = 0.9;
    this.cuisseRadius = 0.3;
    this.cuisseAngleMax = 2.4;
    this.cuisseGAngle = 0;
    this.cuisseDAngle = 0;

    // Legs parameters
    this.jambeHeight = 0.7;
    this.jambeRadius = 0.2;
    this.jambeAngleMax = 1.5;
    this.jambeGAngle = 0;
    this.jambeDAngle = 0;

    // Eyes parameters
    this.yeuxRadius = 0.08;

    // Animation
    this.walkDirection = new THREE.Vector3( 0, 0, 1 );
    this.enAnimationMarche = true;
    this.premierPas = true;
    this.cuisseGMonte = false;
    this.cuisseDMonte = true;
    this.jambeGMonte = false;
    this.jambeDMonte = false;

    // Material
    this.material = new THREE.MeshNormalMaterial();

    // Initial pose
    this.initialize()
  }

  initialTorsoMatrix(){
    let initialTorsoMatrix = idMat4();
    const deltaY = this.torsoHeight / 2 + this.cuisseHeight + this.jambeHeight;
    initialTorsoMatrix = translateMat(initialTorsoMatrix, 0, deltaY, 0);

    return initialTorsoMatrix;
  }

  initialHeadMatrix(){
    let initialHeadMatrix = idMat4();
    initialHeadMatrix = translateMat(initialHeadMatrix, 0, this.torsoHeight/2 + this.headRadius/2, 0);

    return initialHeadMatrix;
  }

  initialCuisseMatrix(cote){
    let initialCuisseMatrix = idMat4();
    const decalageY = -this.torsoHeight / 2 - this.cuisseHeight / 2;
    const decalageX = this.torsoRadius / 2;

    if (cote === "g") {
      initialCuisseMatrix = translateMat(initialCuisseMatrix, -decalageX, decalageY, 0);

    } else if (cote === "d") {
      initialCuisseMatrix = translateMat(initialCuisseMatrix, decalageX, decalageY, 0);
    }

    return initialCuisseMatrix;
  }

  initialJambeMatrix(cote){
    let initialJambeMatrix = idMat4();
    const decalageY = -this.cuisseHeight / 2 - this.jambeHeight / 2;

    if (cote === "g") {
      initialJambeMatrix = translateMat(initialJambeMatrix, 0, decalageY, 0);

    } else if (cote === "d") {
      initialJambeMatrix = translateMat(initialJambeMatrix, 0, decalageY, 0);
    }

    return initialJambeMatrix;
  }

  initialBrasMatrix(cote){
    let initialBrasMatrix = idMat4();
    const decalageY = 3 / 4 * this.torsoHeight / 2;
    const decalageX = this.torsoRadius + this.brasHeight;

    if (cote === "g") {
      initialBrasMatrix = translateMat(initialBrasMatrix, -decalageX, decalageY, 0);

    } else if (cote === "d") {
      initialBrasMatrix = translateMat(initialBrasMatrix, decalageX, decalageY, 0);
    }

    return initialBrasMatrix;
  }

  initialAvantBrasMatrix(cote){
    let initialAvantBrasMatrix = idMat4();
    const decalageX = this.brasHeight + this.avantBrasHeight;

    if (cote === "g") {
      initialAvantBrasMatrix = translateMat(initialAvantBrasMatrix, -decalageX, 0, 0);

    } else if (cote === "d") {
      initialAvantBrasMatrix = translateMat(initialAvantBrasMatrix, decalageX, 0, 0);
    }

    return initialAvantBrasMatrix;
  }

  initialYeuxMatrix(cote) {
    let initYeuxMatrix = idMat4();
    const decalageXZ = this.headRadius / 2;

    if (cote === "g") {
      initYeuxMatrix = translateMat(initYeuxMatrix, -decalageXZ, 0, decalageXZ);

    } else if (cote === "d") {
      initYeuxMatrix = translateMat(initYeuxMatrix, decalageXZ, 0, decalageXZ);
    }

    return initYeuxMatrix;
  }

  initialize() {
    // Torso
    var torsoGeometry = new THREE.CubeGeometry(2*this.torsoRadius, this.torsoHeight, this.torsoRadius, 64);
    this.torso = new THREE.Mesh(torsoGeometry, this.material);

    // Head
    var headGeometry = new THREE.CubeGeometry(2*this.headRadius, this.headRadius, this.headRadius);
    this.head = new THREE.Mesh(headGeometry, this.material);

    // Add parts
    // Bras
    let brasGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.brasG = new THREE.Mesh(brasGeometry, this.material);
    this.brasD = new THREE.Mesh(brasGeometry, this.material);

    // Avant-bras
    let avantBrasGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.avantBrasG = new THREE.Mesh(avantBrasGeometry, this.material);
    this.avantBrasD = new THREE.Mesh(avantBrasGeometry, this.material);

    // Cuisses
    let cuisseGGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.cuisseG = new THREE.Mesh(cuisseGGeometry, this.material);
    let cuisseDGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.cuisseD = new THREE.Mesh(cuisseDGeometry, this. material);

    // Jambes
    let jambeGGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.jambeG = new THREE.Mesh(jambeGGeometry, this.material);
    let jambeDGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.jambeD = new THREE.Mesh(jambeDGeometry, this.material);

    // Yeux
    let oeilGGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.oeilG = new THREE.Mesh(oeilGGeometry, this.material);
    let oeilDGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.oeilD = new THREE.Mesh(oeilDGeometry, this.material);

    // Transformations
    // Torse transformation
    this.torsoInitialMatrix = this.initialTorsoMatrix();
    this.torsoMatrix = idMat4();
    this.torso.setMatrix(this.torsoInitialMatrix);

    // Head transformation
    this.headInitialMatrix = this.initialHeadMatrix();
    this.headMatrix = idMat4();
    let matrix = multMat(this.torsoInitialMatrix, this.headInitialMatrix);
    this.head.setMatrix(matrix);

    // Add transformations
    // Yeux tranformations
    this.yeuxRescaleMat = rescaleMat(idMat4(), this.yeuxRadius, this.yeuxRadius, this.yeuxRadius);

    this.oeilGInitMat = this.initialYeuxMatrix("g");
    let m = multMat(matrix, this.oeilGInitMat);
    m = multMat(m, this.yeuxRescaleMat);
    this.oeilG.setMatrix(m);

    this.oeilDInitMat = this.initialYeuxMatrix("d");
    m = multMat(matrix, this.oeilDInitMat);
    m = multMat(m, this.yeuxRescaleMat);
    this.oeilD.setMatrix(m);

    // Bras transformations
    this.brasRescaleMat = rescaleMat(idMat4(), this.brasHeight, this.brasRadius, this.brasRadius);
    this.brasRescaleMatInv = inverseMat(this.brasRescaleMat);

    // Bras gauche
    this.brasGMatrix = idMat4();
    this.brasGRotateMat= idMat4();
    this.brasGInitMat = this.initialBrasMatrix("g");
    let mg = multMat(this.brasGInitMat, this.brasRescaleMat);
    mg = multMat(this.torsoInitialMatrix, mg);
    this.brasG.setMatrix(mg);

    // Bras droit
    this.brasDMatrix = idMat4();
    this.brasDRotateMat= idMat4();
    this.brasDInitMat = this.initialBrasMatrix("d");
    let md = multMat(this.brasDInitMat, this.brasRescaleMat);
    md = multMat(this.torsoInitialMatrix, md);
    this.brasD.setMatrix(md);

    // Avant-Bras transformations
    this.avantBrasRescaleMat = rescaleMat(idMat4(), this.avantBrasHeight, this.avantBrasRadius, this.avantBrasRadius);

    // Avant-bras gauche
    this.avantBrasGMatrix = idMat4();
    this.avantBrasGRotateMat = idMat4();
    this.avantBrasGInitMat = this.initialAvantBrasMatrix("g");
    mg = multMat(mg, this.brasRescaleMatInv);
    mg = multMat(mg, this.avantBrasGInitMat);
    mg = multMat(mg, this.avantBrasRescaleMat);
    this.avantBrasG.setMatrix(mg);

    // Avant-bras droit
    this.avantBrasDMatrix = idMat4();
    this.avantBrasDRotateMat = idMat4();
    this.avantBrasDInitMat = this.initialAvantBrasMatrix("d");
    md = multMat(md, this.brasRescaleMatInv);
    md = multMat(md, this.avantBrasDInitMat);
    md = multMat(md, this.avantBrasRescaleMat);
    this.avantBrasD.setMatrix(md);

    // Cuisses transformations
    this.cuisseRescaleMat = rescaleMat(idMat4(), this.cuisseRadius, this.cuisseHeight/2, this.cuisseRadius);
    this.cuisseRescaleMatInv = inverseMat(this.cuisseRescaleMat);

    // Cuisse Gauche
    this.cuisseGInitMat = this.initialCuisseMatrix("g");
    this.cuisseGMatrix = idMat4();
    this.cuisseGRotatMat = idMat4();
    let matrixG = multMat(this.torsoInitialMatrix, this.cuisseGInitMat);
    matrixG = multMat(matrixG, this.cuisseRescaleMat);
    this.cuisseG.setMatrix(matrixG);
    
    // Cuisse Droite
    this.cuisseDInitMat = this.initialCuisseMatrix("d");
    this.cuisseDMatrix = idMat4();
    this.cuisseDRotatMat = idMat4();
    let matrixD = multMat(this.torsoInitialMatrix, this.cuisseDInitMat);
    matrixD = multMat(matrixD, this.cuisseRescaleMat);
    this.cuisseD.setMatrix(matrixD);

    // Jambes transformations
    this.jambeRescaleMat = rescaleMat(idMat4(), this.jambeRadius, this.jambeHeight/2, this.jambeRadius);

    // Jambe Gauche
    this.jambeGInitMat = this.initialJambeMatrix("g");
    this.jambeGMatrix = idMat4();
    this.jambeGRotatMat = idMat4();
    matrixG = multMat(matrixG, this.cuisseRescaleMatInv);
    matrixG = multMat(matrixG, this.jambeGInitMat);
    matrixG = multMat(matrixG, this.jambeRescaleMat);
    this.jambeG.setMatrix(matrixG);

    // Jambe droite
    this.jambeDInitMat = this.initialJambeMatrix("d");
    this.jambeDMatrix = idMat4();
    this.jambeDRotatMat = idMat4();
    matrixD = multMat(matrixD, this.cuisseRescaleMatInv);
    matrixD = multMat(matrixD, this.jambeDInitMat);
    matrixD = multMat(matrixD, this.jambeRescaleMat);
    this.jambeD.setMatrix(matrixD);

    // Add robot to scene
    scene.add(this.torso);
    scene.add(this.head);
    // Add parts
    scene.add(this.brasG);
    scene.add(this.brasD);
    scene.add(this.avantBrasD);
    scene.add(this.avantBrasG);
    scene.add(this.cuisseG);
    scene.add(this.cuisseD);
    scene.add(this.jambeG);
    scene.add(this.jambeD);
    scene.add(this.oeilG);
    scene.add(this.oeilD);
  }

  rotateTorso(angle){
    let torsoMatrix = this.torsoMatrix;

    this.torsoMatrix = idMat4();
    this.torsoMatrix = rotateMat(this.torsoMatrix, angle, "y");
    this.torsoMatrix = multMat(torsoMatrix, this.torsoMatrix);

    let matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
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

  moveTorso(speed){
    this.torsoMatrix = translateMat(this.torsoMatrix, speed * this.walkDirection.x, speed * this.walkDirection.y, speed * this.walkDirection.z);

    let matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
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
    if (!this.enAnimationMarche) {
      this.enAnimationMarche = true;
      this.premierPas = true;
      this.cuisseGAngle = 0;
      this.cuisseGMonte = false;
      this.cuisseDAngle = 0;
      this.cuisseDMonte = true;
      this.jambeGAngle = 0;
      this.jambeGMonte = false;
      this.jambeDAngle = 0;
      this.jambeDMonte = false;
    }

    // Animation cyclique correspondant à une marche
    if (this.premierPas) { // Le premier pas du robot est différent du restant de l'animation de marche
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

    let m = multMat(idMat4(), this.headInitialMatrix);
    m = translateMat(m, 0, -this.headRadius/2, 0);
    let im = inverseMat(m);

    // Mise à jour de la matrice de rotation de la tête
    this.headMatrix = idMat4();
    this.headMatrix = multMat(im, this.headMatrix);
    this.headMatrix = rotateMat(this.headMatrix, this.headAngleX, "x");
    this.headMatrix = rotateMat(this.headMatrix, this.headAngleY, "y");
    this.headMatrix = multMat(m, this.headMatrix);

    // Mise à jour de la tête et des yeux
    let matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    this.updateHead(matrix);
  }

  // Add methods for other parts
  rotateBrasGauche(angle, axis){
    if(axis === "y"){
      this.brasGAngleX += angle;
    }
    else if (axis === "z"){
      this.brasGAngleZ += angle;
    }

    // Mise à jour de la matrice de rotation du bras gauche
    this.brasGRotateMat = idMat4();
    this.brasGRotateMat = translateMat(this.brasGRotateMat, -this.brasHeight, 0, 0);
    this.brasGRotateMat = rotateMat(this.brasGRotateMat, this.brasGAngleX, "y");
    this.brasGRotateMat = rotateMat(this.brasGRotateMat, this.brasGAngleZ, "z");
    this.brasGRotateMat = translateMat(this.brasGRotateMat, this.brasHeight, 0, 0);

    // update du bras gauche et de l'avant-bras gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    matrix = this.updateBrasG(matrix);
    this.updateAvantBrasG(matrix);
  }

  rotateBrasDroit(angle, axis){
    if(axis === "y"){
      this.brasDAngleX += angle;
    }
    else if (axis === "z"){
      this.brasDAngleZ += angle;
    }

    // Mise à jour de la matrice de rotation du bras droit
    this.brasDRotateMat = idMat4();
    this.brasDRotateMat = translateMat(this.brasDRotateMat, this.brasHeight, 0, 0);
    this.brasDRotateMat = rotateMat(this.brasDRotateMat, this.brasDAngleX, "y");
    this.brasDRotateMat = rotateMat(this.brasDRotateMat, this.brasDAngleZ, "z");
    this.brasDRotateMat = translateMat(this.brasDRotateMat, -this.brasHeight, 0, 0);

    // update du bras droit et de l'avant-bras droit
    let matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    matrix = this.updateBrasD(matrix);
    this.updateAvantBrasD(matrix);
  }

  rotateAvantBrasGauche(angle){
    this.avantBrasGAngle += angle;

    // Mise à jour de la matrice de rotation de l'avant-bras gauche
    this.avantBrasGRotateMat = idMat4();
    this.avantBrasGRotateMat = translateMat(this.avantBrasGRotateMat, -this.avantBrasHeight, 0, 0);
    this.avantBrasGRotateMat = rotateMat(this.avantBrasGRotateMat, this.avantBrasGAngle,"z");
    this.avantBrasGRotateMat = translateMat(this.avantBrasGRotateMat, this.avantBrasHeight, 0, 0);

    // update de l'avant-bras gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    matrix = multMat(matrix, this.brasGMatrix);
    matrix = multMat(matrix, this.brasGInitMat);
    matrix = multMat(matrix, this.brasGRotateMat);
    matrix = multMat(matrix, this.avantBrasGMatrix);
    matrix = multMat(matrix, this.avantBrasGInitMat);
    matrix = multMat(matrix, this.avantBrasGRotateMat);
    matrix = multMat(matrix, this.avantBrasRescaleMat);
    this.avantBrasG.setMatrix(matrix);
  }

  rotateAvantBrasDroit(angle){
    this.avantBrasDAngle += angle;

    // Mise à jour de la matrice de rotation de l'avant-bras droit
    this.avantBrasDRotateMat = idMat4();
    this.avantBrasDRotateMat = translateMat(this.avantBrasDRotateMat, this.avantBrasHeight, 0, 0);
    this.avantBrasDRotateMat = rotateMat(this.avantBrasDRotateMat, this.avantBrasDAngle,"z");
    this.avantBrasDRotateMat = translateMat(this.avantBrasDRotateMat, -this.avantBrasHeight, 0, 0);

    // update de l'avant-bras gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    matrix = multMat(matrix, this.brasDMatrix);
    matrix = multMat(matrix, this.brasDInitMat);
    matrix = multMat(matrix, this.brasDRotateMat);
    matrix = multMat(matrix, this.avantBrasDMatrix);
    matrix = multMat(matrix, this.avantBrasDInitMat);
    matrix = multMat(matrix, this.avantBrasDRotateMat);
    matrix = multMat(matrix, this.avantBrasRescaleMat);
    this.avantBrasD.setMatrix(matrix);
  }

  rotateCuisseGauche(angle){
    this.cuisseGAngle += angle;
    this.cuisseGAngle = correctAngle(this.cuisseGAngle);

    // Angle radian de rotation maximum de la cuisse
    if (this.cuisseGAngle > this.cuisseAngleMax) {
      this.cuisseGAngle = this.cuisseAngleMax;
    } else if (this.cuisseGAngle < -this.cuisseAngleMax) {
      this.cuisseGAngle = -this.cuisseAngleMax;
    }

    // Mise à jour de la matrice de rotation de la cuisse gauche
    this.cuisseGRotatMat = idMat4();
    this.cuisseGRotatMat = translateMat(this.cuisseGRotatMat, 0, -this.cuisseHeight/2, 0);
    this.cuisseGRotatMat = rotateMat(this.cuisseGRotatMat, this.cuisseGAngle, "x");
    this.cuisseGRotatMat = translateMat(this.cuisseGRotatMat, 0, this.cuisseHeight/2, 0);

    // Mise à jour de la cuisse gauche et de la jambe gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    matrix = this.updateCuisseG(matrix);
    this.updateJambeG(matrix);
  }

  rotateCuisseDroite(angle){
    this.cuisseDAngle += angle;
    this.cuisseDAngle = correctAngle(this.cuisseDAngle);

    // Angle radian de rotation maximum de la cuisse
    if (this.cuisseDAngle > this.cuisseAngleMax) {
      this.cuisseDAngle = this.cuisseAngleMax;
    } else if (this.cuisseDAngle < -this.cuisseAngleMax) {
      this.cuisseDAngle = -this.cuisseAngleMax;
    }

    // Mise à jour de la matrice de rotation de la cuisse droite
    this.cuisseDRotatMat = idMat4();
    this.cuisseDRotatMat = translateMat(this.cuisseDRotatMat, 0, -this.cuisseHeight/2, 0);
    this.cuisseDRotatMat = rotateMat(this.cuisseDRotatMat, this.cuisseDAngle, "x");
    this.cuisseDRotatMat = translateMat(this.cuisseDRotatMat, 0, this.cuisseHeight/2, 0);

    // Mise à jour de la cuisse droite et de la jambe droite
    let matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    matrix = this.updateCuisseD(matrix);
    this.updateJambeD(matrix);
  }

  rotateJambeGauche(angle){
    this.jambeGAngle += angle;
    this.jambeGAngle = correctAngle(this.jambeGAngle);

    // Angle radian de rotation maximum de la jambe
    if (this.jambeGAngle > this.jambeAngleMax) {
      this.jambeGAngle = this.jambeAngleMax;
    } else if (this.jambeGAngle < -this.jambeAngleMax) {
      this.jambeGAngle = -this.jambeAngleMax;
    }

    // Mise à jour de la matrice de rotation de la jambe gauche
    this.jambeGRotatMat = idMat4();
    this.jambeGRotatMat = translateMat(this.jambeGRotatMat, 0, -this.jambeHeight/2, 0);
    this.jambeGRotatMat = rotateMat(this.jambeGRotatMat, this.jambeGAngle, "x");
    this.jambeGRotatMat = translateMat(this.jambeGRotatMat, 0, this.jambeHeight/2, 0);

    let matrix = multMat(this.jambeGMatrix, this.jambeGInitMat);
    matrix = multMat(matrix, this.jambeGRotatMat);
    matrix = multMat(matrix, this.jambeRescaleMat);
    matrix = multMat(this.cuisseGRotatMat, matrix);
    matrix = multMat(this.cuisseGInitMat, matrix);
    matrix = multMat(this.cuisseGMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    this.jambeG.setMatrix(matrix);
  }

  rotateJambeDroite(angle){
    this.jambeDAngle += angle;
    this.jambeDAngle = correctAngle(this.jambeDAngle);

    // Angle radian de rotation maximum de la jambe
    if (this.jambeDAngle > this.jambeAngleMax) {
      this.jambeDAngle = this.jambeAngleMax;
    } else if (this.jambeDAngle < -this.jambeAngleMax) {
      this.jambeDAngle = -this.jambeAngleMax;
    }

    // Mise à jour de la matrice de rotation de la jambe droite
    this.jambeDRotatMat = idMat4();
    this.jambeDRotatMat = translateMat(this.jambeDRotatMat, 0, -this.jambeHeight/2, 0);
    this.jambeDRotatMat = rotateMat(this.jambeDRotatMat, this.jambeDAngle, "x");
    this.jambeDRotatMat = translateMat(this.jambeDRotatMat, 0, this.jambeHeight/2, 0);

    let matrix = multMat(this.jambeDMatrix, this.jambeDInitMat);
    matrix = multMat(matrix, this.jambeDRotatMat);
    matrix = multMat(matrix, this.jambeRescaleMat);
    matrix = multMat(this.cuisseDRotatMat, matrix);
    matrix = multMat(this.cuisseDInitMat, matrix);
    matrix = multMat(this.cuisseDMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    this.jambeD.setMatrix(matrix);
  }

  // Methods for updating robot parts

  updateHead(matrix) {
    // Sert à faire la mise à jour de la tête et des yeux lorsqu'un membre qui précède la tête dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent la tête dans la
    //    hiérarchie des membres du robot.

    // Mise à jour de la tête
    let matrix2 = multMat(matrix, this.headMatrix);
    matrix2 = multMat(matrix2, this.headInitialMatrix);
    this.head.setMatrix(matrix2);

    // Mise à jour de l'oeil gauche
    let m = multMat(matrix2, this.oeilGInitMat);
    m = multMat(m, this.yeuxRescaleMat);
    this.oeilG.setMatrix(m);

    // Mise à jour de l'oeil droite
    m = multMat(matrix2, this.oeilDInitMat);
    m = multMat(m, this.yeuxRescaleMat);
    this.oeilD.setMatrix(m);
  }

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
    this.cuisseG.setMatrix(matrix2);

    // Retire le rescale de la cuisse gauche
    matrix2 = multMat(matrix2, this.cuisseRescaleMatInv);
    return matrix2;
  }

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
    this.cuisseD.setMatrix(matrix2);

    // Retire le rescale de la cuisse droite
    matrix2 = multMat(matrix2, this.cuisseRescaleMatInv);
    return matrix2;
  }

  updateJambeG(matrix) {
    // Sert à faire la mise à jour de la jambe gauche lorsqu'un membre qui la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent la jambe gauche dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.jambeGMatrix);
    matrix2 = multMat(matrix2, this.jambeGInitMat);
    matrix2 = multMat(matrix2, this.jambeGRotatMat);
    matrix2 = multMat(matrix2, this.jambeRescaleMat);
    this.jambeG.setMatrix(matrix2);
  }

  updateJambeD(matrix) {
    // Sert à faire la mise à jour de la jambe droite lorsqu'un membre qui la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent la jambe droite dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.jambeDMatrix);
    matrix2 = multMat(matrix2, this.jambeDInitMat);
    matrix2 = multMat(matrix2, this.jambeDRotatMat);
    matrix2 = multMat(matrix2, this.jambeRescaleMat);
    this.jambeD.setMatrix(matrix2);
  }

  updateBrasG(matrix) {
    // Sert à faire la mise à jour du bras gauche lorsqu'un membre qui précède la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent le bras gauche dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.brasGMatrix);
    matrix2 = multMat(matrix2, this.brasGInitMat);
    matrix2 = multMat(matrix2, this.brasGRotateMat);
    matrix2 = multMat(matrix2, this.brasRescaleMat);
    this.brasG.setMatrix(matrix2);

    // Retire le rescale du bras gauche
    matrix2 = multMat(matrix2, this.brasRescaleMatInv);
    return matrix2;
  }

  updateBrasD(matrix) {
    // Sert à faire la mise à jour du bras droit lorsqu'un membre qui précède la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent le bras droit dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.brasDMatrix);
    matrix2 = multMat(matrix2, this.brasDInitMat);
    matrix2 = multMat(matrix2, this.brasDRotateMat);
    matrix2 = multMat(matrix2, this.brasRescaleMat);
    this.brasD.setMatrix(matrix2);

    // Retire le rescale du bras droit
    matrix2 = multMat(matrix2, this.brasRescaleMatInv);
    return matrix2;
  }

  updateAvantBrasG(matrix) {
    // Sert à faire la mise à jour de l'avant-bras gauche lorsqu'un membre qui la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent l'avant-bras gauche dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.avantBrasGMatrix);
    matrix2 = multMat(matrix2, this.avantBrasGInitMat);
    matrix2 = multMat(matrix2, this.avantBrasGRotateMat);
    matrix2 = multMat(matrix2, this.avantBrasRescaleMat);
    this.avantBrasG.setMatrix(matrix2);
  }

  updateAvantBrasD(matrix) {
    // Sert à faire la mise à jour de l'avant-bras droit lorsqu'un membre qui la précède dans
    //    la hiérarchie du robot à été modifié.
    // matrix : la matrice de toutes les tranformation des membres qui précèdent l'avant-bras droit dans la
    //    hiérarchie des membres du robot.

    let matrix2 = multMat(matrix, this.avantBrasDMatrix);
    matrix2 = multMat(matrix2, this.avantBrasDInitMat);
    matrix2 = multMat(matrix2, this.avantBrasDRotateMat);
    matrix2 = multMat(matrix2, this.avantBrasRescaleMat);
    this.avantBrasD.setMatrix(matrix2);
  }

  // Methods for walking animation

  firstStep(speed) {
    if (this.cuisseDAngle <= -0.5) { // Dernière rotation du premier pas
      this.cuisseDAngle = -0.5;
      this.premierPas = false;
    }
    
    robot.rotateCuisseDroite(-speed);
    robot.rotateCuisseGauche(0.5 * speed);

    if (!this.jambeDMonte) {
      robot.rotateJambeDroite(speed);

      if (this.jambeDAngle >= 0.4) {
        this.jambeDAngle = 0.4;
        this.jambeDMonte = true;
      }

    } else { // jambe droite descend
      robot.rotateJambeDroite(-speed);
    }

    if (this.cuisseGAngle >= 0.1) {
      robot.rotateJambeGauche(speed);
    }
    // else : aucune rotation de la jambe gauche
  }

  marcheCuisseGauche(speed) {
    const avance = speed > 0;

    if (avance && this.cuisseGMonte && this.cuisseGAngle > -0.6) {
      robot.rotateCuisseGauche(-speed);

    } else if (avance && this.cuisseGMonte) { // cuisseGAngle <= -0.6
      this.cuisseGMonte = false;
      this.cuisseGAngle = -0.6;
      robot.rotateCuisseGauche(speed);

    } else if (avance && this.cuisseGAngle < 0.3) { // Descend
      robot.rotateCuisseGauche(speed);

    } else if (avance) { // Descend , cuisseGAngle >= 0.3
      this.cuisseGMonte = true;
      this.cuisseGAngle = 0.3;
      robot.rotateCuisseGauche(-speed);

    } else if (this.cuisseGMonte && this.cuisseGAngle > -0.6) { // Recule
      robot.rotateCuisseGauche(speed);

    } else if (this.cuisseGMonte) { // Recule , cuisseGAngle <= -0.6
      this.cuisseGMonte = false;
      this.cuisseGAngle = -0.6;
      robot.rotateCuisseGauche(-speed);

    } else if (this.cuisseGAngle < 0.3) { // Recule , Descend
      robot.rotateCuisseGauche(-speed);

    } else { // Recule , Descend , CuisseGAngle >= 0.3
      this.cuisseGMonte = true;
      this.cuisseGAngle = 0.3;
      robot.rotateCuisseGauche(speed);
    }
  }

  marcheCuisseDroite(speed) {
    const avance = speed > 0;

    if (avance && this.cuisseDMonte && this.cuisseDAngle > -0.6) {
      robot.rotateCuisseDroite(-speed);

    } else if (avance && this.cuisseDMonte) { // cuisseDAngle <= -0.6
      this.cuisseDMonte = false;
      this.cuisseDAngle = -0.6;
      robot.rotateCuisseDroite(speed);

    } else if (avance && this.cuisseDAngle < 0.3) { // Cuisse descend
      robot.rotateCuisseDroite(speed);

    } else if (avance) { // Descend , cuisseDAngle >= 0.3
      this.cuisseDMonte = true;
      this.cuisseDAngle = 0.3;
      robot.rotateCuisseDroite(-speed);

    } else if (this.cuisseDMonte && this.cuisseDAngle > -0.6) { // Recule
      robot.rotateCuisseDroite(speed);

    } else if (this.cuisseDMonte) { // Recule , cuisseDAngle <= -0.6
      this.cuisseDMonte = false;
      this.cuisseDAngle = -0.6;

      robot.rotateCuisseDroite(-speed);

    } else if (this.cuisseDAngle < 0.3) { // Recule , Descend
      robot.rotateCuisseDroite(-speed);

    } else { // Recule , Descend , CuisseDAngle >= 0.3
      this.cuisseDMonte = true;
      this.cuisseDAngle = 0.3;
      robot.rotateCuisseDroite(speed);
    }
  }

  marcheJambeGauche(speed){
    const avance = speed > 0;

    if (avance && this.jambeGMonte && this.jambeGAngle > 0.2) {
      robot.rotateJambeGauche(-speed);

    } else if (avance && this.jambeGMonte && this.jambeGAngle === 0.2) {

      if (this.cuisseGAngle === -0.4) {
        robot.rotateJambeGauche(speed);

      } else {
        robot.rotateJambeGauche(0);
      }

    } else if (avance && this.jambeGMonte && this.jambeGAngle > 0) {
      robot.rotateJambeGauche(-speed);

    } else if (avance && this.jambeGMonte) { // jambeGAngle <= 0
      this.jambeGMonte = false;
      this.jambeGAngle = 0;
      robot.rotateJambeGauche(0);

    } else if (avance && this.jambeGAngle === 0) { // Descend
      
      if (this.cuisseGAngle === 0) {
        robot.rotateJambeGauche(0.5 * speed);

      } else {
        robot.rotateJambeGauche(0);
      }

    } else if (avance && this.jambeGAngle < 0.5) { // Descend
      robot.rotateJambeGauche(1.5 * speed);

    } else if (avance && this.jambeGAngle < 0.8) { // Descend
      robot.rotateJambeGauche(speed);

    } else if (avance) { // Descend, jambeGAngle >= 0.8
      this.jambeGMonte = true;
      this.jambeGAngle = 0.8;
      robot.rotateJambeGauche(-speed);

    } else if (this.jambeGMonte && this.jambeGAngle > 0.2) { // Recule
      robot.rotateJambeGauche(speed);

    } else if (this.jambeGMonte && this.jambeGAngle === 0.2) { // Recule

      if (this.cuisseGAngle === -0.4) {
        robot.rotateJambeGauche(-speed);

      } else {
        robot.rotateJambeGauche(0);
      }

    } else if (this.jambeGMonte && this.jambeGAngle > 0) { // Recule
      robot.rotateJambeGauche(speed);

    } else if (this.jambeGMonte) { // Recule, jambeGAngle <= 0
      this.jambeGMonte = false;
      this.jambeGAngle = 0;
      robot.rotateJambeGauche(0);

    } else if (this.jambeGAngle === 0) { // Recule, descend

      if (this.cuisseGAngle === 0) {
        robot.rotateJambeGauche(0.5 * -speed);

      } else {
        robot.rotateJambeGauche(0);
      }

    } else if (this.jambeGAngle < 0.5) { // Recule, descend
      robot.rotateJambeGauche(1.5 * -speed);

    } else if (this.jambeGAngle < 0.8) { // Recule, descend
      robot.rotateJambeGauche(-speed);

    } else { // Recule, descend, jambeGAngle >= 0.8
      this.jambeGMonte = true;
      this.jambeGAngle = 0.8;
      robot.rotateJambeGauche(speed);
    }
  }

  marcheJambeDroite(speed){
    const avance = speed > 0;

    if (avance && this.jambeDMonte && this.jambeDAngle > 0.2) {
      robot.rotateJambeDroite(-speed);

    } else if (avance && this.jambeDMonte && this.jambeDAngle === 0.2) {

      if (this.cuisseDAngle === -0.4) {
        robot.rotateJambeDroite(speed);

      } else {
        robot.rotateJambeDroite(0);
      }

    } else if (avance && this.jambeDMonte && this.jambeDAngle > 0) {
      robot.rotateJambeDroite(-speed);

    } else if (avance && this.jambeDMonte) { // jambeDAngle <= 0
      this.jambeDMonte = false;
      this.jambeDAngle = 0;
      robot.rotateJambeDroite(0);

    } else if (avance && this.jambeDAngle === 0) { // Descend
      
      if (this.cuisseDAngle === 0) {
        robot.rotateJambeDroite(0.5 * speed);

      } else {
        robot.rotateJambeDroite(0);
      }

    } else if (avance && this.jambeDAngle < 0.5) { // Descend
      robot.rotateJambeDroite(1.5 * speed);

    } else if (avance && this.jambeDAngle < 0.8) { // Descend
      robot.rotateJambeDroite(speed);

    } else if (avance) { // Descend, jambeDAngle >= 0.8
      this.jambeDMonte = true;
      this.jambeDAngle = 0.8;
      robot.rotateJambeDroite(-speed);

    } else if (this.jambeDMonte && this.jambeDAngle > 0.2) { // Recule
      robot.rotateJambeDroite(speed);

    } else if (this.jambeDMonte && this.jambeDAngle === 0.2) { // Recule

      if (this.cuisseDAngle === -0.4) {
        robot.rotateJambeDroite(-speed);

      } else {
        robot.rotateJambeDroite(0);
      }

    } else if (this.jambeDMonte && this.jambeDAngle > 0) { // Recule
      robot.rotateJambeDroite(speed);

    } else if (this.jambeDMonte) { // Recule, jambeDAngle <= 0
      this.jambeDMonte = false;
      this.jambeDAngle = 0;
      robot.rotateJambeDroite(0);

    } else if (this.jambeDAngle === 0) { // Recule, descend

      if (this.cuisseDAngle === 0) {
        robot.rotateJambeDroite(0.5 * -speed);

      } else {
        robot.rotateJambeDroite(0);
      }

    } else if (this.jambeDAngle < 0.5) { // Recule, descend
      robot.rotateJambeDroite(1.5 * -speed);

    } else if (this.jambeDAngle < 0.8) { // Recule, descend
      robot.rotateJambeDroite(-speed);

    } else { // Recule, descend, jambeDAngle >= 0.8
      this.jambeDMonte = true;
      this.jambeDAngle = 0.8;
      robot.rotateJambeDroite(speed);
    }
  }

  standOnFloor() {
    // End Effector des jambes à leur création
    let endEffectorG = new THREE.Vector3(0, -1, 0);
    let endEffectorD = new THREE.Vector3(0, -1, 0);

    // Matrices complètes des tranformations des jambes
    // Jambe Gauche
    let matrixG = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    matrixG = multMat(matrixG, this.cuisseGMatrix);
    matrixG = multMat(matrixG, this.cuisseGInitMat);
    matrixG = multMat(matrixG, this.cuisseGRotatMat);
    matrixG = multMat(matrixG, this.jambeGMatrix);
    matrixG = multMat(matrixG, this.jambeGInitMat);
    matrixG = multMat(matrixG, this.jambeGRotatMat);
    matrixG = multMat(matrixG, this.jambeRescaleMat);

    // Jambe droite
    let matrixD = multMat(this.torsoMatrix, this.torsoInitialMatrix);
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

    let matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
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

  // Methods to look at mouse on floor

  look_at(point){
    // Compute and apply the correct rotation of the head and the torso for the robot to look at @point

    // Emplacement du centre du torse
    let centreTorse = new THREE.Vector3(0, 0, 0);
    let m = multMat(this.torsoMatrix, this.torsoInitialMatrix);
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
    m = multMat(m, this.headInitialMatrix);
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
        robot.enAnimationMarche = false;
        robot.rotateCuisseGauche(-0.1);
        break;
      case "Left Leg":
        robot.enAnimationMarche = false;
        robot.rotateJambeGauche(-0.1);
        break;
      case "Right Thigh":
        robot.enAnimationMarche = false;
        robot.rotateCuisseDroite(-0.1);
        break;
      case "Right Leg":
        robot.enAnimationMarche = false;
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
        robot.enAnimationMarche = false;
        robot.rotateCuisseGauche(0.1);
        break;
      case "Left Leg":
        robot.enAnimationMarche = false;
        robot.rotateJambeGauche(0.1);
        break;
      case "Right Thigh":
        robot.enAnimationMarche = false;
        robot.rotateCuisseDroite(0.1);
        break;
      case "Right Leg":
        robot.enAnimationMarche = false;
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
