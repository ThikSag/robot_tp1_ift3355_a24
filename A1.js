// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix = a;
  this.matrix.decompose(this.position, this.quaternion, this.scale);
};

const start = Date.now();

// SETUP RENDERER AND SCENE
let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff); // white background colour
document.body.appendChild(renderer.domElement);

// SETUP CAMERA
let camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(10,5,10);
camera.lookAt(scene.position);
scene.add(camera);

// SETUP ORBIT CONTROL OF THE CAMERA
let controls = new THREE.OrbitControls(camera);
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
let floorTexture = new THREE.ImageUtils.loadTexture('images/tile.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;
floorTexture.repeat.set(4, 4);

let floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
let floorGeometry = new THREE.PlaneBufferGeometry(15, 15);
let floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
floor.position.y = 0.0;
scene.add(floor);

// TRANSFORMATIONS

/**
 * Multiplie m1 x m2.
 * @param m1 : THREE.Matrix4
 * @param m2 : THREE.Matrix4
 * @returns {THREE.Matrix4} La matrice résultante en tant que nouvelle matrice.
 */
function multMat(m1, m2){
  return new THREE.Matrix4().multiplyMatrices(m1, m2);
}

/**
 * Inverse la matrice 'm'. Si le déterminant de la matrice 'm' est 0, alors 'm' ne peut
 * pas être inversée et c'est une matrice de zéro qui est retournée.
 * @param m : THREE.Matrix4 La matrice à inverser.
 * @returns {THREE.Matrix4} La matrice résultante en tant que nouvelle matrice.
 */
function invertMat(m){
  return new THREE.Matrix4().getInverse(m, true);
}

/**
 * Crée une matrice identité.
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
 * Applique une translation [x, y, z] à 'matrix'.
 * @param matrix : THREE.Matrix4 La matrice à translater.
 * @param x : float La translation à appliquer en X.
 * @param y : float La translation à appliquer en Y.
 * @param z : float La translation à appliquer en Z.
 * @returns {THREE.Matrix4} La matrice résultante en tant que nouvelle matrice.
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
 * Applique une rotation de 'angle' à 'matrix' selon l'axe indiqué ('axis').
 * @param matrix : THREE.Matrix4 La matrice à tourner/pivoter.
 * @param angle : float L'angle de rotation en radian.
 * @param axis : string L'axe 'x', 'y' ou 'z' selon lequel la rotation est effectuée.
 *                      Si ce n'est pas une de ces 3 options, alors aucune rotation
 *                      n'est effectuée.
 * @returns {THREE.Matrix4} La matrice résultante en tant que nouvelle matrice.
 */
function rotateMat(matrix, angle, axis){
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let m = new THREE.Matrix4();

  // Fixer la matrice de rotation selon l'axe ('axis') choisi.
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
      // Si 'axis' ne correspond à aucun axe en 3D, alors aucune rotation n'est faite.
      // On utilise la matrice identité dans ce cas-ci.
      m = idMat4();
      break;
  }

  return multMat(m, matrix);
}

/**
 * Applique une rotation de 'angle' au vecteur 'v' selon l'axe indiqué ('axis').
 * @param v : THREE.Vector3 Le vecteur à tourner/pivoter.
 * @param angle : float L'angle de rotation en radian.
 * @param axis : string L'axe 'x', 'y' ou 'z' selon lequel la rotation est effectuée.
 *                      Si ce n'est pas une de ces 3 options, alors aucune rotation
 *                      n'est effectuée.
 * @returns {THREE.Vector3} Le vecteur résultant en tant que nouveau vecteur.
 */
function rotateVec3(v, angle, axis){
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let m = new THREE.Matrix4();

  // Fixer la matrice de rotation selon l'axe ('axis') choisi.
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
      // Si 'axis' ne correspond à aucun axe en 3D, alors aucune rotation n'est faite.
      // On utilise la matrice identité dans ce cas-ci.
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
 * Applique une mise à l'échelle ("scaling") [x, y, z] à 'matrix'.
 * @param matrix : THREE.Matrix4 La matrice à mettre à l'échelle (scale).
 * @param x : float La mise à l'échelle à appliquer en X.
 * @param y : float La mise à l'échelle à appliquer en Y.
 * @param z : float La mise à l'échelle à appliquer en Z.
 * @returns {THREE.Matrix4} La matrice résultante en tant que nouvelle matrice.
 */
function rescaleMat(matrix, x, y, z){
  const m = new THREE.Matrix4().set(x, 0, 0, 0,
                                    0, y, 0, 0,
                                    0, 0, z, 0,
                                    0, 0, 0, 1);

  return multMat(m, matrix);
}

/**
 * Corrige un angle pour l'avoir arrondi à 2 chiffres après la virgule.
 * @param angle : number
 * @returns {number}
 */
function correctAngle(angle) {
  return Math.round(angle * 100) / 100 ;
}

/**
 * Cette classe représente le robot que nous allons créer et animer dans le monde 3D.
 */
class Robot {
  constructor() {
    this.pi = correctAngle(Math.PI);  // Valeur de pi que nous allons utiliser

    // Paramètres du torse
    this.torsoHeight = 1.5;
    this.torsoRadius = 0.75;  // Profondeur du torse, 2x Radius = largeur du torse
    this.torsoAngle = 0;  // Angle radian actuel de la rotation du torse

    // Paramètres de la tête
    this.headRadius = 0.32;  // Hauteur et profondeur de la tête, 2x Radius = largeur de la tête
    this.headAngleMax = this.pi/2;  // Angle radian maximum de rotation de la tête
    this.headAngleX = 0;  // Angle radian actuel de la rotation de la tête en X
    this.headAngleY = 0;  // Angle radian actuel de la rotation de la tête en Y

    // Paramètres des yeux
    this.yeuxRadius = 0.08;

    // Paramètres des bras
    this.brasHeight = 0.6;
    this.brasRadius = 0.15;
    this.brasGAngleZ = 0;  // Angle radian actuel de la rotation du bras gauche en Z
    this.brasGAngleY = 0;  // Angle radian actuel de la rotation du bras gauche en Y
    this.brasDAngleZ = 0;  // Angle radian actuel de la rotation du bras droit en Z
    this.brasDAngleY = 0;  // Angle radian actuel de la rotation du bras droit en Y

    // Paramètres des avant-bras
    this.avantBrasHeight = 0.4;
    this.avantBrasRadius = 0.12;
    this.avantBrasGAngle = 0;  // Angle radian actuel de la rotation de l'avant-bras gauche
    this.avantBrasDAngle = 0;  // Angle radian actuel de la rotation de l'avant-bras droit

    // Paramètres des cuisses
    this.cuissesHeight = 0.9;
    this.cuissesRadius = 0.3;
    this.cuissesAngleMax = 2.4;  // Angle radian maximum de rotation des cuisses
    this.cuisseGAngle = 0;  // Angle radian actuel de la rotation de la cuisse gauche
    this.cuisseDAngle = 0;  // Angle radian actuel de la rotation de la cuisse droite

    // Paramètres des jambes
    this.jambesHeight = 0.7;
    this.jambesRadius = 0.2;
    this.jambesAngleMax = 1.5;  // Angle radian maximum de rotation des jambes
    this.jambeGAngle = 0;  // Angle radian actuel de la rotation de la jambe gauche
    this.jambeDAngle = 0;  // Angle radian actuel de la rotation de la jambe droite

    // Paramètres de l'animation cyclique de marche
    this.walkDirection = new THREE.Vector3( 0, 0, 1 );  // Direction de marche actuelle
    this.enAnimationMarche = true;  // Indique si le robot est dans l'animation de marche
    this.premierPas = true;  // Indique si c'est le premier pas de l'animation de marche
    this.cuisseGMonte = false;  // Indique si la cuisse gauche est en train de monter dans l'animation de marche
    this.cuisseDMonte = true;  // Indique si la cuisse droite est en train de monter dans l'animation de marche
    this.jambeGMonte = false;  // Indique si la jambe gauche est en train de monter dans l'animation de marche
    this.jambeDMonte = false;  // Indique si la jambe droite est en train de monter dans l'animation de marche

    // Matériel
    this.material = new THREE.MeshNormalMaterial();

    // Pose initiale
    this.initialize()
  }

  // Méthodes pour l'initialisation du robot

  /**
   * Crée la matrice de transformation initiale du torse du robot. Cette matrice déplace
   * le torse à sa position initial à partir de l'origine du monde.
   * @returns {THREE.Matrix4}
   */
  initialTorsoMatrix(){
    const deltaY = this.torsoHeight/2 + this.cuissesHeight + this.jambesHeight;

    let initTorsoMatrix = idMat4();
    initTorsoMatrix = translateMat(initTorsoMatrix, 0, deltaY, 0);

    return initTorsoMatrix;
  }

  /**
   * Crée la matrice de transformation initiale de la tête du robot. Cette matrice
   * déplace la tête à sa position initiale à partir de la position initiale du torse.
   * @returns {THREE.Matrix4}
   */
  initialHeadMatrix(){
    const deltaY = this.torsoHeight/2 + this.headRadius/2;

    let initHeadMatrix = idMat4();
    initHeadMatrix = translateMat(initHeadMatrix, 0, deltaY, 0);

    return initHeadMatrix;
  }

  /**
   * Crée la matrice de transformation initiale pour une cuisse du robot selon le côté
   * choisi. Cette matrice déplace une cuisse à sa position initiale (selon le côté) à
   * partir de la position initiale du torse.
   * @param cote : string Le côté, 'g' pour gauche ou 'd' pour droit, de la cuisse pour
   *                      laquelle la matrice est créée. Si ce n'est pas une de ces 2
   *                      options, alors c'est une matrice identité qui est retournée.
   * @returns {THREE.Matrix4}
   */
  initialCuisseMatrix(cote){
    const deltaY = -this.torsoHeight/2 - this.cuissesHeight/2;
    const deltaX = this.torsoRadius/2;

    let initCuisseMatrix = idMat4();
    if (cote === "g") {
      initCuisseMatrix = translateMat(initCuisseMatrix, -deltaX, deltaY, 0);

    } else if (cote === "d") {
      initCuisseMatrix = translateMat(initCuisseMatrix, deltaX, deltaY, 0);
    }

    return initCuisseMatrix;
  }

  /**
   * Crée la matrice de transformation initiale pour une jambe du robot. Cette matrice
   * déplace une jambe à sa position initiale à partir de la position initiale d'une
   * cuisse.
   * @returns {THREE.Matrix4}
   */
  initialJambeMatrix(){
    const deltaY = -this.cuissesHeight/2 - this.jambesHeight/2;

    let initJambeMatrix = idMat4();
    initJambeMatrix = translateMat(initJambeMatrix, 0, deltaY, 0);

    return initJambeMatrix;
  }

  /**
   * Crée la matrice de transformation initiale pour un bras du robot selon le côté
   * choisi. Cette matrice déplace un bras à sa position initiale (selon le côté) à
   * partir de la position initiale du torse.
   * @param cote : string Le côté, 'g' pour gauche ou 'd' pour droit, du bras pour
   *                      lequel la matrice est créée. Si ce n'est pas une de ces 2
   *                      options, alors c'est une matrice identité qui est retournée.
   * @returns {THREE.Matrix4}
   */
  initialBrasMatrix(cote){
    const deltaY = 3/4 * this.torsoHeight/2;
    const deltaX = this.torsoRadius + this.brasHeight;

    let initBrasMatrix = idMat4();
    if (cote === "g") {
      initBrasMatrix = translateMat(initBrasMatrix, -deltaX, deltaY, 0);

    } else if (cote === "d") {
      initBrasMatrix = translateMat(initBrasMatrix, deltaX, deltaY, 0);
    }

    return initBrasMatrix;
  }

  /**
   * Crée la matrice de transformation initiale pour un avant-bras du robot selon le
   * côté choisi. Cette matrice déplace un avant-bras à sa position initiale (selon
   * le côté) à partir de la position initiale du bras du même côté.
   * @param cote : string Le côté, 'g' pour gauche ou 'd' pour droit, de l'avant-bras
   *                      pour lequel la matrice est créée. Si ce n'est pas une de ces
   *                      2 options, alors c'est une matrice identité qui est retournée.
   * @returns {THREE.Matrix4}
   */
  initialAvantBrasMatrix(cote){
    const deltaX = this.brasHeight + this.avantBrasHeight;

    let initAvantBrasMatrix = idMat4();
    if (cote === "g") {
      initAvantBrasMatrix = translateMat(initAvantBrasMatrix, -deltaX, 0, 0);

    } else if (cote === "d") {
      initAvantBrasMatrix = translateMat(initAvantBrasMatrix, deltaX, 0, 0);
    }

    return initAvantBrasMatrix;
  }

  /**
   * Crée la matrice de transformation initiale pour un oeil du robot delon le côté
   * choisi. Cette matrice déplace un oeil à sa position initiale (selon le côté) à
   * partir de la position initiale de la tête.
   * @param cote : string Le côté, 'g' pour gauche ou 'd' pour droit, de l'oeil pour
   *                      lequel la matrice est créée. Si ce n'est pas une de ces 2
   *                      options, alors c'est une matrice identité qui est retournée.
   * @returns {THREE.Matrix4}
   */
  initialYeuxMatrix(cote) {
    const deltaXZ = this.headRadius/2;

    let initYeuxMatrix = idMat4();
    if (cote === "g") {
      initYeuxMatrix = translateMat(initYeuxMatrix, -deltaXZ, 0, deltaXZ);

    } else if (cote === "d") {
      initYeuxMatrix = translateMat(initYeuxMatrix, deltaXZ, 0, deltaXZ);
    }

    let rescaleYeuxMatrix = rescaleMat(idMat4(), this.yeuxRadius, this.yeuxRadius, this.yeuxRadius);
    initYeuxMatrix = multMat(initYeuxMatrix, rescaleYeuxMatrix);

    return initYeuxMatrix;
  }

  /**
   * Initialisation du robot. Cette méthode initialise tous les membres du robot, crée
   * toutes les matrices nécessaire à la transformation de ces membres et ajoute le robot
   * au monde, à la scène.
   */
  initialize() {
    // Geometries
    // Torse
    let torsoGeometry = new THREE.CubeGeometry(2*this.torsoRadius, this.torsoHeight, this.torsoRadius, 64);
    this.torso = new THREE.Mesh(torsoGeometry, this.material);

    // Tête
    let headGeometry = new THREE.CubeGeometry(2*this.headRadius, this.headRadius, this.headRadius);
    this.head = new THREE.Mesh(headGeometry, this.material);

    // Yeux
    let oeilGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.oeilG = new THREE.Mesh(oeilGeometry, this.material);
    this.oeilD = new THREE.Mesh(oeilGeometry, this.material);

    // Bras
    let brasGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.brasG = new THREE.Mesh(brasGeometry, this.material);
    this.brasD = new THREE.Mesh(brasGeometry, this.material);

    // Avant-bras
    let avantBrasGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.avantBrasG = new THREE.Mesh(avantBrasGeometry, this.material);
    this.avantBrasD = new THREE.Mesh(avantBrasGeometry, this.material);

    // Cuisses
    let cuissesGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.cuisseG = new THREE.Mesh(cuissesGeometry, this.material);
    this.cuisseD = new THREE.Mesh(cuissesGeometry, this.material);

    // Jambes
    let jambesGeometry = new THREE.SphereGeometry(1, 32, 16);
    this.jambeG = new THREE.Mesh(jambesGeometry, this.material);
    this.jambeD = new THREE.Mesh(jambesGeometry, this.material);

    // Transformations
    // Torse transformation
    this.torsoInitMatrix = this.initialTorsoMatrix();
    this.torsoMatrix = idMat4();  // La combinaison de toutes les transformations
                                  // appliquées au torse après l'initialisation du robot.
    this.torso.setMatrix(this.torsoInitMatrix);

    // Tête transformation
    this.headInitMatrix = this.initialHeadMatrix();
    this.headMatrix = idMat4();  // La combinaison de toutes les transformations
                                 // appliquées à la tête après l'initialisation du robot.
    let matrix = multMat(this.torsoInitMatrix, this.headInitMatrix);
    this.head.setMatrix(matrix);

    // Yeux tranformations
    // Oeil gauche
    this.oeilGInitMat = this.initialYeuxMatrix("g");
    let m = multMat(matrix, this.oeilGInitMat);
    this.oeilG.setMatrix(m);

    // Oeil droit
    this.oeilDInitMat = this.initialYeuxMatrix("d");
    m = multMat(matrix, this.oeilDInitMat);
    this.oeilD.setMatrix(m);

    // Bras transformations
    this.brasRescaleMat = rescaleMat(idMat4(), this.brasHeight, this.brasRadius, this.brasRadius);
    this.brasRescaleMatInv = invertMat(this.brasRescaleMat);

    // Bras gauche
    this.brasGInitMat = this.initialBrasMatrix("g");
    this.brasGRotateMat = idMat4(); // La combinaison de toutes les rotations appliquées
                                    // au bras gauche après l'initialisation du robot.
    let mg = multMat(this.brasGInitMat, this.brasRescaleMat);
    mg = multMat(this.torsoInitMatrix, mg);
    this.brasG.setMatrix(mg);

    // Bras droit
    this.brasDInitMat = this.initialBrasMatrix("d");
    this.brasDRotateMat = idMat4(); // La combinaison de toutes les rotations appliquées
                                   // au bras droit après l'initialisation du robot.
    let md = multMat(this.brasDInitMat, this.brasRescaleMat);
    md = multMat(this.torsoInitMatrix, md);
    this.brasD.setMatrix(md);

    // Avant-Bras transformations
    this.avantBrasRescaleMat = rescaleMat(idMat4(), this.avantBrasHeight, this.avantBrasRadius, this.avantBrasRadius);

    // Avant-bras gauche
    this.avantBrasGInitMat = this.initialAvantBrasMatrix("g");
    this.avantBrasGRotateMat = idMat4(); // La combinaison de toutes les rotations
                                         // appliquées à l'avant-bras gauche après
                                         // l'initialisation du robot.
    mg = multMat(mg, this.brasRescaleMatInv);
    mg = multMat(mg, this.avantBrasGInitMat);
    mg = multMat(mg, this.avantBrasRescaleMat);
    this.avantBrasG.setMatrix(mg);

    // Avant-bras droit
    this.avantBrasDInitMat = this.initialAvantBrasMatrix("d");
    this.avantBrasDRotateMat = idMat4(); // La combinaison de toutes les rotations
                                         // appliquées à l'avant-bras droit après
                                         // l'initialisation du robot.
    md = multMat(md, this.brasRescaleMatInv);
    md = multMat(md, this.avantBrasDInitMat);
    md = multMat(md, this.avantBrasRescaleMat);
    this.avantBrasD.setMatrix(md);

    // Cuisses transformations
    this.cuissesRescaleMat = rescaleMat(idMat4(), this.cuissesRadius, this.cuissesHeight/2, this.cuissesRadius);
    this.cuissesRescaleMatInv = invertMat(this.cuissesRescaleMat);

    // Cuisse gauche
    this.cuisseGInitMat = this.initialCuisseMatrix("g");
    this.cuisseGRotatMat = idMat4(); // La combinaison de toutes les rotations
                                     // appliquées à la cuisse gauche après
                                     // l'initialisation du robot.
    let matrixG = multMat(this.torsoInitMatrix, this.cuisseGInitMat);
    matrixG = multMat(matrixG, this.cuissesRescaleMat);
    this.cuisseG.setMatrix(matrixG);
    
    // Cuisse droite
    this.cuisseDInitMat = this.initialCuisseMatrix("d");
    this.cuisseDRotatMat = idMat4(); // La combinaison de toutes les rotations
                                     // appliquées à la cuisse droite après
                                     // l'initialisation du robot.
    let matrixD = multMat(this.torsoInitMatrix, this.cuisseDInitMat);
    matrixD = multMat(matrixD, this.cuissesRescaleMat);
    this.cuisseD.setMatrix(matrixD);

    // Jambes transformations
    this.jambesRescaleMat = rescaleMat(idMat4(), this.jambesRadius, this.jambesHeight/2, this.jambesRadius);

    // Jambe gauche
    this.jambeGInitMat = this.initialJambeMatrix();
    this.jambeGRotatMat = idMat4(); // La combinaison de toutes les rotations appliquées
                                    // à la jambe gauche après l'initialisation du robot.
    matrixG = multMat(matrixG, this.cuissesRescaleMatInv);
    matrixG = multMat(matrixG, this.jambeGInitMat);
    matrixG = multMat(matrixG, this.jambesRescaleMat);
    this.jambeG.setMatrix(matrixG);

    // Jambe droite
    this.jambeDInitMat = this.initialJambeMatrix();
    this.jambeDRotatMat = idMat4(); // La combinaison de toutes les rotations appliquées
                                    // à la jambe droite après l'initialisation du robot.
    matrixD = multMat(matrixD, this.cuissesRescaleMatInv);
    matrixD = multMat(matrixD, this.jambeDInitMat);
    matrixD = multMat(matrixD, this.jambesRescaleMat);
    this.jambeD.setMatrix(matrixD);

    // Ajout du robot à la scène
    scene.add(this.torso);
    scene.add(this.head);
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

  // Méthodes pour bouger/tourner les membres du robot

  /**
   * Applique une rotation de 'angle' au torse et met à jour tous les membres du
   * robot qui en dépendent.
   * @param angle : float L'angle de rotation en radian.
   */
  rotateTorso(angle){
    // Mise à jour de la matrice de transformation du torse.
    let torsoMat = idMat4();
    torsoMat = rotateMat(torsoMat, angle, "y");
    this.torsoMatrix = multMat(this.torsoMatrix, torsoMat);

    // Mise à jour du torse
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.torso.setMatrix(matrix);

    // Mise à jour de la direction de marche actuelle
    this.walkDirection = rotateVec3(this.walkDirection, angle, "y");

    // Mise à jour de tous les autres membres du robot
    this.updateHead(matrix);

    let matrixG = this.updateCuisseGauche(matrix);
    let matrixD = this.updateCuisseDroite(matrix);

    this.updateJambeGauche(matrixG);
    this.updateJambeDroite(matrixD);

    matrixG = this.updateBrasGauche(matrix);
    matrixD = this.updateBrasDroite(matrix);

    this.updateAvantBrasGauche(matrixG);
    this.updateAvantBrasDroite(matrixD);

    // Mise à jour de l'angle radian actuel du torse pour la fonction look_at. On garde
    // l'angle radian entre -3.14 et 3.14 pour simplifier les calculs futurs de look_at.
    this.torsoAngle += angle;

    const a = correctAngle(this.torsoAngle);
    if (a > this.pi) {
      this.torsoAngle = this.torsoAngle - (2 * this.pi);

    } else if (a < -this.pi) {
      this.torsoAngle = this.torsoAngle + (2 * this.pi);
    }
  }

  /**
   * Déplace de torse du robot de 'speed' et met à jour tous les membres du robot
   * qui en dépendent. Déplacer le torse fait marcher le robot, donc cette méthode
   * est en charge de l'animation cyclique de marche et de la jambe de support.
   * @param speed : float : La vitesse à laquelle le robot se déplace.
   */
  moveTorso(speed){
    // Mise à jour de la matrice de transformation du torse.
    this.torsoMatrix = translateMat(this.torsoMatrix, speed * this.walkDirection.x,
                                 speed * this.walkDirection.y, speed * this.walkDirection.z);

    // Mise à jour du torse
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.torso.setMatrix(matrix);

    // Mise à jour de la tête et des yeux
    this.updateHead(matrix);

    // Mise à jour des bras et des avant-Bras
    let matrixG = this.updateBrasGauche(matrix);
    let matrixD = this.updateBrasDroite(matrix);

    this.updateAvantBrasGauche(matrixG);
    this.updateAvantBrasDroite(matrixD);

    // Mise à jour pour l'animation cyclique d'une marche

    // Si le robot n'était pas en animation de marche, la position des cuisses et jambes
    // est réinitialisé pour que le robot puisse marcher correctement, c'est-à-dire sans
    // avoir des cuisses et/ou jambes dans des positions anormales pour marcher.
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
    if (this.premierPas) {
      // Le premier pas du robot est différent du restant de l'animation de marche.
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
   * Applique une rotation de 'angle' à la tête selon l'axe indiqué ('axis') et met à
   * jour tous les membres du robot qui en dépendent.
   * @param angle : float L'angle de rotation en radian.
   * @param axis : string L'axe 'x' ou 'y' selon lequel la rotation est effectuée. Si
   *                      ce n'est pas une de ces 2 options, alors aucune rotation
   *                      n'est effectuée.
   */
  rotateHead(angle, axis){
    // Mise à jour de l'angle de rotation de la tête
    if (axis === "x") {
      this.headAngleX += angle;
      this.headAngleX = correctAngle(this.headAngleX);

      // Rotation maximum de la tête
      if (this.headAngleX > this.headAngleMax) {
        this.headAngleX = this.headAngleMax;

      } else if (this.headAngleX < -this.headAngleMax) {
        this.headAngleX = -this.headAngleMax;
      }

    } else if (axis === "y") {
      this.headAngleY += angle;
      this.headAngleY = correctAngle(this.headAngleY);

      // Rotation maximum de la tête
      if (this.headAngleY > this.headAngleMax) {
        this.headAngleY = this.headAngleMax;

      } else if (this.headAngleY < -this.headAngleMax) {
        this.headAngleY = -this.headAngleMax;
      }
    }

    // Matrices nécessaires pour déplacer le end effector de la tête et faire la rotation
    let m = multMat(idMat4(), this.headInitMatrix);
    m = translateMat(m, 0, -this.headRadius/2, 0);
    let im = invertMat(m);

    // Mise à jour de la matrice de transformations de la tête
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
   * Applique une rotation de 'angle' au bras gauche selon l'axe indiqué ('axis') et
   * met à jour tous les membres du robot qui en dépendent.
   * @param angle : float L'angle de rotation en radian.
   * @param axis : string L'axe 'y' ou 'z' selon lequel la rotation est effectuée. Si
   *                      ce n'est pas une de ces 2 options, alors aucune rotation
   *                      n'est effectuée.
   */
  rotateBrasGauche(angle, axis){
    // Mise à jour de l'angle de rotation du bras gauche
    if(axis === "y"){
      this.brasGAngleY += angle;

    } else if (axis === "z"){
      this.brasGAngleZ += angle;
    }

    // Recalculer la matrice de rotation du bras gauche
    this.brasGRotateMat = idMat4();
    this.brasGRotateMat = translateMat(this.brasGRotateMat, -this.brasHeight, 0, 0);
    this.brasGRotateMat = rotateMat(this.brasGRotateMat, this.brasGAngleY, "y");
    this.brasGRotateMat = rotateMat(this.brasGRotateMat, this.brasGAngleZ, "z");
    this.brasGRotateMat = translateMat(this.brasGRotateMat, this.brasHeight, 0, 0);

    // Mise à jour du bras gauche et de l'avant-bras gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateBrasGauche(matrix);
    this.updateAvantBrasGauche(matrix);
  }

  /**
   * Applique une rotation de 'angle' au bras droit selon l'axe indiqué ('axis') et
   * met à jour tous les membres du robot qui en dépendent.
   * @param angle : float L'angle de rotation en radian.
   * @param axis : string L'axe 'y' ou 'z' selon lequel la rotation est effectuée. Si
   *                      ce n'est pas une de ces 2 options, alors aucune rotation
   *                      n'est effectuée.
   */
  rotateBrasDroit(angle, axis){
    // Mise à jour de l'angle de rotation du bras droit
    if(axis === "y"){
      this.brasDAngleY += angle;

    } else if (axis === "z"){
      this.brasDAngleZ += angle;
    }

    // Recalculer la matrice de rotation du bras droit
    this.brasDRotateMat = idMat4();
    this.brasDRotateMat = translateMat(this.brasDRotateMat, this.brasHeight, 0, 0);
    this.brasDRotateMat = rotateMat(this.brasDRotateMat, this.brasDAngleY, "y");
    this.brasDRotateMat = rotateMat(this.brasDRotateMat, this.brasDAngleZ, "z");
    this.brasDRotateMat = translateMat(this.brasDRotateMat, -this.brasHeight, 0, 0);

    // Mise à jour du bras droit et de l'avant-bras droit
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateBrasDroite(matrix);
    this.updateAvantBrasDroite(matrix);
  }

  /**
   * Applique une rotation de 'angle' à l'avant-bras gauche.
   * @param angle : float L'angle de rotation en radian.
   */
  rotateAvantBrasGauche(angle){
    // Mise à jour de l'angle de rotation de l'avant-bras gauche
    this.avantBrasGAngle += angle;

    // Recalculer la matrice de rotation de l'avant-bras gauche
    this.avantBrasGRotateMat = idMat4();
    this.avantBrasGRotateMat = translateMat(this.avantBrasGRotateMat, -this.avantBrasHeight, 0, 0);
    this.avantBrasGRotateMat = rotateMat(this.avantBrasGRotateMat, this.avantBrasGAngle,"z");
    this.avantBrasGRotateMat = translateMat(this.avantBrasGRotateMat, this.avantBrasHeight, 0, 0);

    // Mise à jour de l'avant-bras gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = multMat(matrix, this.brasGInitMat);
    matrix = multMat(matrix, this.brasGRotateMat);
    matrix = multMat(matrix, this.avantBrasGInitMat);
    matrix = multMat(matrix, this.avantBrasGRotateMat);
    matrix = multMat(matrix, this.avantBrasRescaleMat);
    this.avantBrasG.setMatrix(matrix);
  }

  /**
   * Applique une rotation de 'angle' à l'avant-bras droit.
   * @param angle : float L'angle de rotation en radian.
   */
  rotateAvantBrasDroit(angle){
    // Mise à jour de l'angle de rotation de l'avant-bras droit
    this.avantBrasDAngle += angle;

    // Recalculer la matrice de rotation de l'avant-bras droit
    this.avantBrasDRotateMat = idMat4();
    this.avantBrasDRotateMat = translateMat(this.avantBrasDRotateMat, this.avantBrasHeight, 0, 0);
    this.avantBrasDRotateMat = rotateMat(this.avantBrasDRotateMat, this.avantBrasDAngle,"z");
    this.avantBrasDRotateMat = translateMat(this.avantBrasDRotateMat, -this.avantBrasHeight, 0, 0);

    // Mise à jour de l'avant-bras droit
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = multMat(matrix, this.brasDInitMat);
    matrix = multMat(matrix, this.brasDRotateMat);
    matrix = multMat(matrix, this.avantBrasDInitMat);
    matrix = multMat(matrix, this.avantBrasDRotateMat);
    matrix = multMat(matrix, this.avantBrasRescaleMat);
    this.avantBrasD.setMatrix(matrix);
  }

  /**
   * Applique une rotation de 'angle' à la cuisse gauche et met à jour tous les
   * membres du robot qui en dépendent.
   * @param angle : float L'angle de rotation en radian.
   */
  rotateCuisseGauche(angle){
    //Mise à jour de l'angle de rotation de la cuisse gauche
    this.cuisseGAngle += angle;
    this.cuisseGAngle = correctAngle(this.cuisseGAngle);

    // Rotation maximum de la cuisse
    if (this.cuisseGAngle > this.cuissesAngleMax) {
      this.cuisseGAngle = this.cuissesAngleMax;

    } else if (this.cuisseGAngle < -this.cuissesAngleMax) {
      this.cuisseGAngle = -this.cuissesAngleMax;
    }

    // Recalculer la matrice de rotation de la cuisse gauche
    this.cuisseGRotatMat = idMat4();
    this.cuisseGRotatMat = translateMat(this.cuisseGRotatMat, 0, -this.cuissesHeight/2, 0);
    this.cuisseGRotatMat = rotateMat(this.cuisseGRotatMat, this.cuisseGAngle, "x");
    this.cuisseGRotatMat = translateMat(this.cuisseGRotatMat, 0, this.cuissesHeight/2, 0);

    // Mise à jour de la cuisse gauche et de la jambe gauche
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateCuisseGauche(matrix);
    this.updateJambeGauche(matrix);
  }

  /**
   * Applique une rotation de 'angle' à la cuisse droite et met à jour tous les
   * membres du robot qui en dépendent.
   * @param angle : float L'angle de rotation en radian.
   */
  rotateCuisseDroite(angle){
    // Mise à jour de l'angle de rotation de la cuisse droite
    this.cuisseDAngle += angle;
    this.cuisseDAngle = correctAngle(this.cuisseDAngle);

    // Rotation maximum de la cuisse
    if (this.cuisseDAngle > this.cuissesAngleMax) {
      this.cuisseDAngle = this.cuissesAngleMax;

    } else if (this.cuisseDAngle < -this.cuissesAngleMax) {
      this.cuisseDAngle = -this.cuissesAngleMax;
    }

    // Recalculer la matrice de rotation de la cuisse droite
    this.cuisseDRotatMat = idMat4();
    this.cuisseDRotatMat = translateMat(this.cuisseDRotatMat, 0, -this.cuissesHeight/2, 0);
    this.cuisseDRotatMat = rotateMat(this.cuisseDRotatMat, this.cuisseDAngle, "x");
    this.cuisseDRotatMat = translateMat(this.cuisseDRotatMat, 0, this.cuissesHeight/2, 0);

    // Mise à jour de la cuisse droite et de la jambe droite
    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrix = this.updateCuisseDroite(matrix);
    this.updateJambeDroite(matrix);
  }

  /**
   * Applique une rotation de 'angle' à la jambe gauche.
   * @param angle  : float L'angle de rotation en radian.
   */
  rotateJambeGauche(angle){
    // Mise à jour de l'angle de rotation de la jambe gauche
    this.jambeGAngle += angle;
    this.jambeGAngle = correctAngle(this.jambeGAngle);

    // Rotation maximum de la jambe
    if (this.jambeGAngle > this.jambesAngleMax) {
      this.jambeGAngle = this.jambesAngleMax;

    } else if (this.jambeGAngle < -this.jambesAngleMax) {
      this.jambeGAngle = -this.jambesAngleMax;
    }

    // Recalculer la matride de rotation de la jambe gauche
    this.jambeGRotatMat = idMat4();
    this.jambeGRotatMat = translateMat(this.jambeGRotatMat, 0, -this.jambesHeight/2, 0);
    this.jambeGRotatMat = rotateMat(this.jambeGRotatMat, this.jambeGAngle, "x");
    this.jambeGRotatMat = translateMat(this.jambeGRotatMat, 0, this.jambesHeight/2, 0);

    // Mise à jour de la jambe gauche
    let matrix = multMat(this.jambeGInitMat, this.jambeGRotatMat);
    matrix = multMat(matrix, this.jambesRescaleMat);
    matrix = multMat(this.cuisseGRotatMat, matrix);
    matrix = multMat(this.cuisseGInitMat, matrix);
    matrix = multMat(this.torsoInitMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    this.jambeG.setMatrix(matrix);
  }

  /**
   * Applique une rotation de 'angle' à la jambe droite.
   * @param angle : float L'angle de rotation en radian.
   */
  rotateJambeDroite(angle){
    // Mise à jour de l'angle de rotation de la jambe droite
    this.jambeDAngle += angle;
    this.jambeDAngle = correctAngle(this.jambeDAngle);

    // Rotation maximum de la jambe
    if (this.jambeDAngle > this.jambesAngleMax) {
      this.jambeDAngle = this.jambesAngleMax;

    } else if (this.jambeDAngle < -this.jambesAngleMax) {
      this.jambeDAngle = -this.jambesAngleMax;
    }

    // Recalculer la matrice de rotation de la jambe droite
    this.jambeDRotatMat = idMat4();
    this.jambeDRotatMat = translateMat(this.jambeDRotatMat, 0, -this.jambesHeight/2, 0);
    this.jambeDRotatMat = rotateMat(this.jambeDRotatMat, this.jambeDAngle, "x");
    this.jambeDRotatMat = translateMat(this.jambeDRotatMat, 0, this.jambesHeight/2, 0);

    // Mise à jour de la jambe droite
    let matrix = multMat(this.jambeDInitMat, this.jambeDRotatMat);
    matrix = multMat(matrix, this.jambesRescaleMat);
    matrix = multMat(this.cuisseDRotatMat, matrix);
    matrix = multMat(this.cuisseDInitMat, matrix);
    matrix = multMat(this.torsoInitMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    this.jambeD.setMatrix(matrix);
  }

  // Méthodes pour mettre à jour les membres du robot

  /**
   * Sert à faire la mise à jour de la tête et des yeux lorsqu'un membre qui précède la
   * tête dans la hiérarchie du robot a été modifié.
   * @param matrix : THREE.Matrix4 La matrice de toutes les transformations des membres
   *                               qui précèdent la tête dans la hiérarchie.
   */
  updateHead(matrix) {
    // Mise à jour de la tête
    let matrix2 = multMat(matrix, this.headMatrix);
    matrix2 = multMat(matrix2, this.headInitMatrix);
    this.head.setMatrix(matrix2);

    // Mise à jour de l'oeil gauche
    let m = multMat(matrix2, this.oeilGInitMat);
    this.oeilG.setMatrix(m);

    // Mise à jour de l'oeil droite
    m = multMat(matrix2, this.oeilDInitMat);
    this.oeilD.setMatrix(m);
  }

  /**
   * Sert à faire la mise à jour de la cuisse gauche lorsqu'un membre qui la précède
   * dans la hiérarchie du robot a été modifié.
   * @param matrix : THREE.Matrix4 La matrice de toutes les transformations des membres
   *                               qui précèdent la cuisse gauche dans la hiérarchie.
   * @returns {THREE.Matrix4} La matrice de toutes les transformations des membres dans
   *                          la hiérarchie jusqu'à la cuisse gauche incluse (excepté
   *                          pour le scaling de la cuisse).
   */
  updateCuisseGauche(matrix) {
    let matrix2 = multMat(matrix, this.cuisseGInitMat);
    matrix2 = multMat(matrix2, this.cuisseGRotatMat);
    matrix2 = multMat(matrix2, this.cuissesRescaleMat);
    this.cuisseG.setMatrix(matrix2);

    // Retire le rescale de la cuisse gauche de la matrice à retourner.
    matrix2 = multMat(matrix2, this.cuissesRescaleMatInv);
    return matrix2;
  }

  /**
   * Sert à faire la mise à jour de la cuisse droite lorsqu'un membre qui la précède
   * dans la hiérarchie du robot a été modifié.
   * @param matrix : THREE.Matrix4 La matrice de toutes les transformation des membres
   *                               qui précèdent la cuisse droite dans la hiérarchie.
   * @returns {THREE.Matrix4} La matrice de toutes les transformations des membres dans
   *                          la hiérarchie jusqu'à la cuisse droite incluse (excepté
   *                          pour le scaling de la cuisse).
   */
  updateCuisseDroite(matrix) {
    let matrix2 = multMat(matrix, this.cuisseDInitMat);
    matrix2 = multMat(matrix2, this.cuisseDRotatMat);
    matrix2 = multMat(matrix2, this.cuissesRescaleMat);
    this.cuisseD.setMatrix(matrix2);

    // Retire le rescale de la cuisse droite de la matrice à retourner.
    matrix2 = multMat(matrix2, this.cuissesRescaleMatInv);
    return matrix2;
  }

  /**
   * Sert à faire la mise à jour de la jambe gauche lorsqu'un membre qui la précède
   * dans la hiérarchie du robot a été modifié.
   * @param matrix : THREE.Matrix4 La matrice de toutes les transformations des membres
   *                               qui précèdent la jambe gauche dans la hiérarchie.
   */
  updateJambeGauche(matrix) {
    let matrix2 = multMat(matrix, this.jambeGInitMat);
    matrix2 = multMat(matrix2, this.jambeGRotatMat);
    matrix2 = multMat(matrix2, this.jambesRescaleMat);
    this.jambeG.setMatrix(matrix2);
  }

  /**
   * Sert à faire la mise à jour de la jambe droite lorsqu'un membre qui la précède
   * dans la hiérarchie du robot a été modifié.
   * @param matrix : THREE.Matrix4 La matrice de toutes les transformations des membres
   *                               qui précèdent la jambe droite dans la hiérarchie.
   */
  updateJambeDroite(matrix) {
    let matrix2 = multMat(matrix, this.jambeDInitMat);
    matrix2 = multMat(matrix2, this.jambeDRotatMat);
    matrix2 = multMat(matrix2, this.jambesRescaleMat);
    this.jambeD.setMatrix(matrix2);
  }

  /**
   * Sert à faire la mise à jour du bras gauche lorsqu'un membre qui le précède dans la
   * hiérarchie du robot a été modifié.
   * @param matrix : THREE.Matrix4 La matrice de toutes les transformations des membres
   *                               qui précèdent le bras gauche dans la hiérarchie.
   * @returns {THREE.Matrix4} La matrice de toutes les transformations des membres dans
   *                          la hiérarchie jusqu'au bras gauche inclus (excepté pour
   *                          le scaling du bras).
   */
  updateBrasGauche(matrix) {
    let matrix2 = multMat(matrix, this.brasGInitMat);
    matrix2 = multMat(matrix2, this.brasGRotateMat);
    matrix2 = multMat(matrix2, this.brasRescaleMat);
    this.brasG.setMatrix(matrix2);

    // Retire le rescale du bras gauche de la matrice à retourner.
    matrix2 = multMat(matrix2, this.brasRescaleMatInv);
    return matrix2;
  }

  /**
   * Sert à faire la mise à jour du bras droit lorsqu'un membre qui le précède dans la
   * hiérarchie du robot a été modifié.
   * @param matrix : THREE.Matrix4 La matrice de toutes les transformations des membres
   *                               qui précèdent le bras droit dans la hiérarchie.
   * @returns {THREE.Matrix4} La matrice de toutes les transformations des membres dans
   *                          la hiérarchie jusqu'au bras droit inclus (excepté pour le
   *                          scaling du bras).
   */
  updateBrasDroite(matrix) {
    let matrix2 = multMat(matrix, this.brasDInitMat);
    matrix2 = multMat(matrix2, this.brasDRotateMat);
    matrix2 = multMat(matrix2, this.brasRescaleMat);
    this.brasD.setMatrix(matrix2);

    // Retire le rescale du bras droit de la matrice à retourner.
    matrix2 = multMat(matrix2, this.brasRescaleMatInv);
    return matrix2;
  }

  /**
   * Sert à faire la mise à jour de l'avant-bras gauche lorsqu'un membre qui le précède
   * dans la hiérarchie du robot a été modifié.
   * @param matrix : THREE.Matrix4 La matrice de toutes les transformations des membres
   *                               qui précèdent l'avant-bras gauche dans la hiérarchie.
   */
  updateAvantBrasGauche(matrix) {
    let matrix2 = multMat(matrix, this.avantBrasGInitMat);
    matrix2 = multMat(matrix2, this.avantBrasGRotateMat);
    matrix2 = multMat(matrix2, this.avantBrasRescaleMat);
    this.avantBrasG.setMatrix(matrix2);
  }

  /**
   * Sert à faire la mise à jour de l'avant-bras droit lorsqu'un membre qui le précède
   * dans la hiérarchie du robot a été modifié.
   * @param matrix : THREE.Matrix4 La matrice de toutes les transformations des membres
   *                               qui précèdent l'avant-bras droit dans la hiérarchie.
   */
  updateAvantBrasDroite(matrix) {
    let matrix2 = multMat(matrix, this.avantBrasDInitMat);
    matrix2 = multMat(matrix2, this.avantBrasDRotateMat);
    matrix2 = multMat(matrix2, this.avantBrasRescaleMat);
    this.avantBrasD.setMatrix(matrix2);
  }

  // Méthodes pour l'animation de marche du robot

  /**
   * Cette méthode gère les mouvements des cuisses et de jambes pour le premier pas
   * de l'animation cyclique de marche.
   * @param speed : float La vitesse de marche du robot.
   */
  firstStep(speed) {
    if (this.cuisseDAngle <= -0.5) { // Dernière rotation du premier pas
      this.cuisseDAngle = -0.5;
      this.premierPas = false;
    }
    
    robot.rotateCuisseDroite(-speed);
    robot.rotateCuisseGauche(0.5 * speed);

    if (!this.jambeDMonte) { // Jambe droite descend
      robot.rotateJambeDroite(speed);

      if (this.jambeDAngle >= 0.4) { // Angle maximum de la jambe droite qui descend
        this.jambeDAngle = 0.4;
        this.jambeDMonte = true;
      }

    } else { // Jambe droite monte
      robot.rotateJambeDroite(-speed);
    }

    if (this.cuisseGAngle >= 0.1) { // Jambe gauche descend
      robot.rotateJambeGauche(speed);
    }
    // else : aucune rotation de la jambe gauche
  }

  /**
   * Cette méthode gère le mouvement de la cuisse gauche pour l'animation cyclique
   * de marche.
   * @param speed : float La vitesse de marche du robot.
   */
  marcheCuisseGauche(speed) {
    const avance = speed > 0; // Indique si le robot marche vers l'avant.

    // La rotation à appliquer à la cuisse gauche est toujours l'opposé de la
    // vitesse ('speed').

    if (avance && this.cuisseGMonte && this.cuisseGAngle > -0.6) {
      robot.rotateCuisseGauche(-speed);

    } else if (avance && this.cuisseGMonte) { // cuisseGAngle <= -0.6
      this.cuisseGMonte = false;
      this.cuisseGAngle = -0.6;
      robot.rotateCuisseGauche(speed);

    } else if (avance && this.cuisseGAngle < 0.3) { // Descend
      robot.rotateCuisseGauche(speed);

    } else if (avance) { // Descend, cuisseGAngle >= 0.3
      this.cuisseGMonte = true;
      this.cuisseGAngle = 0.3;
      robot.rotateCuisseGauche(-speed);

    } else if (this.cuisseGMonte && this.cuisseGAngle > -0.6) { // Recule
      robot.rotateCuisseGauche(speed);

    } else if (this.cuisseGMonte) { // Recule, cuisseGAngle <= -0.6
      this.cuisseGMonte = false;
      this.cuisseGAngle = -0.6;
      robot.rotateCuisseGauche(-speed);

    } else if (this.cuisseGAngle < 0.3) { // Recule, descend
      robot.rotateCuisseGauche(-speed);

    } else { // Recule, descend, cuisseGAngle >= 0.3
      this.cuisseGMonte = true;
      this.cuisseGAngle = 0.3;
      robot.rotateCuisseGauche(speed);
    }
  }

  /**
   * Cette méthode gère le mouvement de la cuisse droite pour l'animation cyclique
   * de marche.
   * @param speed : float La vitesse de marche du robot.
   */
  marcheCuisseDroite(speed) {
    const avance = speed > 0; // Indique si le robot marche vers l'avant.

    // La rotation à appliquer à la cuisse droite est toujours l'opposé de la
    // vitesse ('speed').

    if (avance && this.cuisseDMonte && this.cuisseDAngle > -0.6) {
      robot.rotateCuisseDroite(-speed);

    } else if (avance && this.cuisseDMonte) { // cuisseDAngle <= -0.6
      this.cuisseDMonte = false;
      this.cuisseDAngle = -0.6;
      robot.rotateCuisseDroite(speed);

    } else if (avance && this.cuisseDAngle < 0.3) { // Descend
      robot.rotateCuisseDroite(speed);

    } else if (avance) { // Descend, cuisseDAngle >= 0.3
      this.cuisseDMonte = true;
      this.cuisseDAngle = 0.3;
      robot.rotateCuisseDroite(-speed);

    } else if (this.cuisseDMonte && this.cuisseDAngle > -0.6) { // Recule
      robot.rotateCuisseDroite(speed);

    } else if (this.cuisseDMonte) { // Recule, cuisseDAngle <= -0.6
      this.cuisseDMonte = false;
      this.cuisseDAngle = -0.6;
      robot.rotateCuisseDroite(-speed);

    } else if (this.cuisseDAngle < 0.3) { // Recule, descend
      robot.rotateCuisseDroite(-speed);

    } else { // Recule, descend, cuisseDAngle >= 0.3
      this.cuisseDMonte = true;
      this.cuisseDAngle = 0.3;
      robot.rotateCuisseDroite(speed);
    }
  }

  /**
   * Cette méthode gère le mouvement de la jambe gauche pour l'animation cyclique
   * de marche.
   * @param speed : float La vitesse de marche du robot.
   */
  marcheJambeGauche(speed){
    const avance = speed > 0; // Indique si le robot marche vers l'avant.

    // La rotation à appliquer à la jambe gauche est toujours l'opposé de la
    // vitesse ('speed').

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

  /**
   * Cette méthode gère le mouvement de la jambe droite pour l'animation cyclique
   * de marche.
   * @param speed : float La vitesse de marche du robot.
   */
  marcheJambeDroite(speed){
    const avance = speed > 0; // Indique si le robot marche vers l'avant.

    // La rotation à appliquer à la jambe droite est toujours l'opposé de la
    // vitesse ('speed').

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

    } else if (this.jambeDAngle < 0.5) { // ecule, descend
      robot.rotateJambeDroite(1.5 * -speed);

    } else if (this.jambeDAngle < 0.8) { // Recule, descend
      robot.rotateJambeDroite(-speed);

    } else { // Recule, descend, jambeDAngle >= 0.8
      this.jambeDMonte = true;
      this.jambeDAngle = 0.8;
      robot.rotateJambeDroite(speed);
    }
  }

  /**
   * Cette méthode trouve la jambe de support et déplace le robot de la hauteur
   * appropriée pour qu'il se tienne debout sur le plancher plutôt que de voler
   * au-dessus (ou de passer au travers).
   */
  standOnFloor() {
    // End Effectors des jambes à leur création
    let endEffectorG = new THREE.Vector3(0, -1, 0);
    let endEffectorD = new THREE.Vector3(0, -1, 0);

    // Matrices complètes des transformations des jambes
    // Jambe gauche
    let matrixG = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrixG = multMat(matrixG, this.cuisseGInitMat);
    matrixG = multMat(matrixG, this.cuisseGRotatMat);
    matrixG = multMat(matrixG, this.jambeGInitMat);
    matrixG = multMat(matrixG, this.jambeGRotatMat);
    matrixG = multMat(matrixG, this.jambesRescaleMat);

    // Jambe droite
    let matrixD = multMat(this.torsoMatrix, this.torsoInitMatrix);
    matrixD = multMat(matrixD, this.cuisseDInitMat);
    matrixD = multMat(matrixD, this.cuisseDRotatMat);
    matrixD = multMat(matrixD, this.jambeDInitMat);
    matrixD = multMat(matrixD, this.jambeDRotatMat);
    matrixD = multMat(matrixD, this.jambesRescaleMat);

    // Application des transformations aux end effectors des jambes
    endEffectorG.applyMatrix4(matrixG);
    endEffectorD.applyMatrix4(matrixD);

    // Trouver la jambe de support (la jambe avec le end effector le plus bas) et le
    // déplacement en Y à faire pour que le robot soit debout sur le plancher.
    let deltaY;

    if (endEffectorG.y <= endEffectorD.y) {
      // Le end effector de la jambe gauche est plus bas que celui de la jambe droite
      // (ou égal), donc la jambe gauche est la jambe de support.
      deltaY = - endEffectorG.y;

    } else {
      // Le end effector de la jambe droite est plus bas que celui de la jambe gauche,
      // donc la jambe droite est la jambe de support.
      deltaY = - endEffectorD.y;
    }

    // Déplacement du torse pour que le robot soit debout sur le plancher.
    this.torsoMatrix = translateMat(this.torsoMatrix, 0, deltaY, 0);

    let matrix = multMat(this.torsoMatrix, this.torsoInitMatrix);
    this.torso.setMatrix(matrix);

    // Mise à jour de tous les autres membres du robot
    this.updateHead(matrix);

    let mG = this.updateCuisseGauche(matrix);
    let mD = this.updateCuisseDroite(matrix);

    this.updateJambeGauche(mG);
    this.updateJambeDroite(mD);

    mG = this.updateBrasGauche(matrix);
    mD = this.updateBrasDroite(matrix);

    this.updateAvantBrasGauche(mG);
    this.updateAvantBrasDroite(mD);
  }

  // Méthodes pour regarder un point dans le monde 3D

  /**
   * Calcule et applique la bonne rotation à la tête et au torse pour que le robot
   * regarde le 'point'.
   * @param point : THREE.Vector3 Le point à regarder.
   */
  look_at(point){
    // Emplacement du centre du torse
    let centreTorse = new THREE.Vector3(0, 0, 0);
    let m = multMat(this.torsoMatrix, this.torsoInitMatrix);
    centreTorse.applyMatrix4(m);

    // Distance entre le point à regarder et le centre du torse
    let distX = point.x - centreTorse.x;
    let distZ = point.z - centreTorse.z;

    // Calcul de l'angle en Y (thetaY) que le torse doit avoir pour regarder dans
    // la direction du point.
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

    // Calcul de la différence d'angle (deltaAngleY) entre thetaY et l'angle du torse
    // (this.torsoAngle) et rotation du torse de deltaAngleY pour l'aligner avec le
    // point à regarder.

    if (this.torsoAngle !== thetaY) {
      let deltaAngleY = -this.torsoAngle + thetaY;
      let p = 2 * this.pi;

      if (deltaAngleY !== p && deltaAngleY !== -p) {

        // Trouver l'angle le plus petit pour faire la rotation.
        if (deltaAngleY > this.pi) {
          deltaAngleY = deltaAngleY - p;
          
        } else if (deltaAngleY < -this.pi) {
          deltaAngleY = deltaAngleY + p;
        }

        this.rotateTorso(deltaAngleY);
      }
    }
    // else : aucune rotation, car l'angle du torse et thetaY sont identique.

    // Tourner la tête en Y pour qu'elle regarde dans la même direction que le torse
    // et vers le point à regarder.
    this.rotateHead(-this.headAngleY, "y");

    // Emplacement du centre de la tête
    let centreTete = new THREE.Vector3(0,0,0);
    m = multMat(m, this.headMatrix);
    m = multMat(m, this.headInitMatrix);
    centreTete.applyMatrix4(m);

    // Distance entre le point à regarder et le centre de la tête
    distX = point.x - centreTete.x;
    let distY = point.y - centreTete.y;
    distZ = point.z - centreTete.z;

    // Calcul de l'angle en X (thetaX) que la tête doit avoir pour regarder le point.
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

    // Calcul de la différence d'angle (deltaAngleX) entre thetaX et l'angle de la
    // tête (this.headAngleX) et rotation de la tete de deltaAngleX pour qu'elle
    // regarde le point.
    let deltaAngleX = -this.headAngleX - thetaX;
    this.rotateHead(deltaAngleX, "x");
  }
}

let robot = new Robot();

// LISTEN TO KEYBOARD
let keyboard = new THREEx.KeyboardState();

let selectedRobotComponent = 0;
let components = [
  "Torse",
  "Tête",
  "Bras Gauche",
  "Avant-Bras Gauche",
  "Bras Droit",
  "Avant-Bras Droit",
  "Cuisse Gauche",
  "Jambe Gauche",
  "Cuisse Droite",
  "Jambe Droite"
];
let numberComponents = components.length;

//MOUSE EVENTS
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let sphere = null;

document.addEventListener('mousemove', onMouseMove, false);

let isRightButtonDown = false;

function checkKeyboard() {
  // Prochain élément
  if (keyboard.pressed("e")){
    selectedRobotComponent = selectedRobotComponent + 1;

    if (selectedRobotComponent<0){
      selectedRobotComponent = numberComponents - 1;
    }

    if (selectedRobotComponent >= numberComponents){
      selectedRobotComponent = 0;
    }

    window.alert(components[selectedRobotComponent] + " sélectionné(e)");
  }

  // Élément précédent
  if (keyboard.pressed("q")){
    selectedRobotComponent = selectedRobotComponent - 1;

    if (selectedRobotComponent < 0){
      selectedRobotComponent = numberComponents - 1;
    }

    if (selectedRobotComponent >= numberComponents){
      selectedRobotComponent = 0;
    }

    window.alert(components[selectedRobotComponent] + " sélectionné(e)");
  }

  // Haut
  if (keyboard.pressed("w")){
    switch (components[selectedRobotComponent]){
      case "Torse":
        robot.moveTorso(0.1);
        break;
      case "Tête":
        robot.rotateHead(-0.1, "x");
        break;
      case "Bras Gauche":
        robot.rotateBrasGauche(-0.1, "y");
        break;
      case "Avant-Bras Gauche":
        robot.rotateAvantBrasGauche(-0.1);
        break;
      case "Bras Droit":
        robot.rotateBrasDroit(-0.1,"y");
        break;
      case "Avant-Bras Droit":
        robot.rotateAvantBrasDroit(-0.1);
        break;
      case "Cuisse Gauche":
        robot.enAnimationMarche = false;
        robot.rotateCuisseGauche(-0.1);
        break;
      case "Jambe Gauche":
        robot.enAnimationMarche = false;
        robot.rotateJambeGauche(-0.1);
        break;
      case "Cuisse Droite":
        robot.enAnimationMarche = false;
        robot.rotateCuisseDroite(-0.1);
        break;
      case "Jambe Droite":
        robot.enAnimationMarche = false;
        robot.rotateJambeDroite(-0.1);
        break;
    }
  }

  // Bas
  if (keyboard.pressed("s")){
    switch (components[selectedRobotComponent]){
      case "Torse":
        robot.moveTorso(-0.1);
        break;
      case "Tête":
        robot.rotateHead(0.1, "x");
        break;
      case "Bras Gauche":
        robot.rotateBrasGauche(0.1, "y");
        break;
      case "Avant-Bras Gauche":
        robot.rotateAvantBrasGauche(0.1);
        break;
      case "Bras Droit":
        robot.rotateBrasDroit(0.1,"y");
        break;
      case "Avant-Bras Droit":
        robot.rotateAvantBrasDroit(0.1);
        break;
      case "Cuisse Gauche":
        robot.enAnimationMarche = false;
        robot.rotateCuisseGauche(0.1);
        break;
      case "Jambe Gauche":
        robot.enAnimationMarche = false;
        robot.rotateJambeGauche(0.1);
        break;
      case "Cuisse Droite":
        robot.enAnimationMarche = false;
        robot.rotateCuisseDroite(0.1);
        break;
      case "Jambe Droite":
        robot.enAnimationMarche = false;
        robot.rotateJambeDroite(0.1);
        break;
    }
  }

  // Gauche
  if (keyboard.pressed("a")){
    switch (components[selectedRobotComponent]){
      case "Torse":
        robot.rotateTorso(0.1);
        break;
      case "Tête":
        robot.rotateHead(0.1, "y");
        break;
      case "Bras Gauche":
        robot.rotateBrasGauche(-0.1, "z");
        break;
      case "Avant-Bras Gauche":
        break;
      case "Bras Droit":
        robot.rotateBrasDroit(-0.1, "z");
        break;
      case "Avant-Bras Droit":
        break;
      case "Cuisse Gauche":
        break;
      case "Jambe Gauche":
        break;
      case "Cuisse Droite":
        break;
      case "Jambe Droite":
        break;
    }
  }

  // Droite
  if (keyboard.pressed("d")){
    switch (components[selectedRobotComponent]){
      case "Torse":
        robot.rotateTorso(-0.1);
        break;
      case "Tête":
        robot.rotateHead(-0.1, "y");
        break;
      case "Bras Gauche":
        robot.rotateBrasGauche(0.1, "z");
        break;
      case "Avant-Bras Gauche":
        break;
      case "Bras Droit":
        robot.rotateBrasDroit(0.1, "z");
        break;
      case "Avant-Bras Droit":
        break;
      case "Cuisse Gauche":
        break;
      case "Jambe Gauche":
        break;
      case "Cuisse Droite":
        break;
      case "Jambe Droite":
        break;
    }
  }

  if (keyboard.pressed("f")) {
    isRightButtonDown = true;

    let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);

    vector.unproject(camera);

    let dir = vector.sub(camera.position).normalize();

    raycaster.ray.origin.copy(camera.position);
    raycaster.ray.direction.copy(dir);

    let intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      if (!sphere) {
        let geometry = new THREE.SphereGeometry(0.1, 32, 32);
        let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
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
  let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);

  vector.unproject(camera);

  let dir = vector.sub(camera.position).normalize();

  raycaster.ray.origin.copy(camera.position);
  raycaster.ray.direction.copy(dir);

  let intersects = raycaster.intersectObjects(scene.children.filter(obj => obj !== sphere), true);

  if (intersects.length > 0) {
    let intersect = intersects[0]
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
