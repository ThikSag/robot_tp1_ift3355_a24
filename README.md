# Construisez votre robot! - TP 1 - IFT3355 Infographie - Automne 2024
robot_tp1_ift3355_a24

## Introduction

Ce projet a initialement été réalisé dans le cadre du **_Travail pratique 1_** du 
cours **_IFT3355 – Infographie_** de l’**_Université de Montréal_** donné par Pierre 
Poulin à la session d’automne 2024. 

Merci à ma coéquipière [Grace](https://github.com/gracenl2) avec qui j’ai fait ce 
projet initialement. 

Cependant, j’ai apporté quelques modifications à ce projet récemment. Ainsi, le 
projet présenté dans ce répertoire est une version **améliorée** du projet que ma 
coéquipière et moi avons remis pour l’évaluation de ce travail dans le cours.

De plus, le projet ayant été réalisé dans le cadre d’un cours donné en français, 
la majorité du code du fichier [_A1.js_](A1.js) a été écrit en pensant au **français**. 
Ainsi, les commentaires et les noms des variables, des fonctions, des paramètres et 
des méthodes sont presque tous en **français**. Par contre, l’anglais étant 
prédominant en informatique, j’ai fait une **version anglaise** du fichier 
[_A1.js_](https://github.com/ThikSag/robot_tp1_ift3355_a24/blob/english_comments/A1.js). 
Celle-ci est disponible dans la branche 
[*english_comments*](https://github.com/ThikSag/robot_tp1_ift3355_a24/tree/english_comments) 
de ce répertoire.

## Explication sommaire du projet
Dans ce projet, il fallait compléter un robot, le faire marcher et le faire 
regarder un point indiqué par la souris. Il fallait aussi compléter des fonctions 
de transformation qui permettent au robot de bouger.

L’objectif principal de ce projet était de pratiquer les rotations, les 
translations et les changements d’échelle vus en cours, ainsi que de comprendre 
comment hiérarchiser ces transformations.

Ce projet utilise la libraire [_Three.js_](https://threejs.org) afin de créer 
la scène 3D et l’animer. Par contre, la création de la scène 3D, le rendu de 
l’environnement ainsi que les _event listeners_ et la mise à jour de la scène 
nous ont été fournis par notre professeur. Ainsi, pour le projet, nous avons 
uniquement appris à utiliser la librairie _Three.js_ 
pour la création de notre robot et la transformation de ses membres.

Une explication plus complète du projet est disponible dans la section 
[_Explication détaillée du projet_](https://github.com/ThikSag/robot_tp1_ift3355_a24#explication-d%C3%A9taill%C3%A9e-du-projet).

De plus, une section concernant les [améliorations possibles](https://github.com/ThikSag/robot_tp1_ift3355_a24#am%C3%A9lioration-possible-du-projet) 
du projet est incluse après les explications détaillées.

## Explications des différentes branches du répertoire
- La branche [_main_](https://github.com/ThikSag/robot_tp1_ift3355_a24/tree/main) 
contient une version **améliorée** du code que ma coéquipière et moi avons 
remis pour l’évaluation de ce travail scolaire.
<br><br>
- La branche [_original_files_](https://github.com/ThikSag/robot_tp1_ift3355_a24/tree/original_files) 
contient les fichiers **originaux** de la base de code qui nous a été remis
par notre professeur pour réaliser ce travail.
<br><br>
- La branche [_english_comments_](https://github.com/ThikSag/robot_tp1_ift3355_a24/tree/english_comments) 
contient une **version anglaise** du fichier [_A1.js_](https://github.com/ThikSag/robot_tp1_ift3355_a24/blob/english_comments/A1.js). 
Dans cette version améliorée du code, j’ai traduit tous les commentaires 
en **anglais**, ainsi que tous les noms des fonctions, des variables, des 
méthodes et des paramètres.

## Description des fichiers et dossiers du projet
- Le fichier [_A1.html_](A1.html) sert à lancer le projet.
  <br><br>
- Le dossier [_js_](js) contient les librairies _JavaScript_ requises pour 
exécuter le projet.
  <br><br>
- Le dossier [_images_](images) contient les textures utilisées dans le projet.
  <br><br>
- Le fichier [_A1.js_](A1.js) contient le code principal de ce projet. Il 
contient tout le code nécessaire pour le robot, ainsi que le code pour 
construire la scène et rendre l’environnement. C’est ce fichier que nous 
avions à compléter pour notre travail scolaire.

## Exécuter le projet
Malheureusement, le projet **ne peut pas** être lancé simplement en exécutant le 
fichier _A1.html_. Ceci est dû au fait que la plupart des navigateurs 
empêchent les pages d’accéder aux fichiers locaux de leur machine. 

Dans notre cours, nous utilisions l’[_IDE WebStorm_](https://www.jetbrains.com/webstorm/) 
pour contourner ce problème et lancer le projet. Voici une procédure pour 
lancer le projet avec l’_IDE WebStorm_. 

### Procédure pour lancer le projet avec l’[_IDE WebStorm_](https://www.jetbrains.com/webstorm/)
1. Ouvrir le projet avec l’_IDE WebStorm_ depuis le dossier contenant le fichier 
_A1.html_.
<br><br>
2. Dans l’_IDE WebStorm_, ouvrir le fichier _A1.html_.
<br><br>
3. Dans l’_IDE WebStorm_, cliquer sur le bouton  `▶️ Run 'A1.html'` pour exécuter le 
fichier _A1.html_. Il est aussi possible d’utiliser le raccourci clavier `Ctrl + F5`.
<br><br>
4. L’_IDE WebStorm_ ouvre une page du navigateur par défaut dans lequel se trouve 
le robot.

## Comment contrôler le robot?
- Les touches `Q` et `E` permettent de sélectionner toutes les parties du robot. La 
partie sélectionnée lors du lancement du projet est le **torse** du robot.
  - `E` ➡️ `prochain élément`
  - `Q` ➡️ `l’élément précédent`
<br><br>
- Les touches `W`, `A`, `S` et `D` permettent de bouger la partie sélectionnée du 
robot.
  - `W` ➡️ `haut/avant`
  - `S` ➡️ `bas/arrière`
  - `A` ➡️ `gauche`
  - `D` ➡️ `droite`
<br><br>
- La touche `F` permet au robot de `regarder le point` indiqué par la souris.

## Explication détaillée du projet
Tel que mentionné précédemment, ce projet a initialement été réalisé dans le cadre 
d’un travail pratique scolaire. Dans cette section, je vais donc décrire les 
[restrictions générales](https://github.com/ThikSag/robot_tp1_ift3355_a24#restrictions-g%C3%A9n%C3%A9rales-du-travail) 
quant à la réalisation du travail et les [tâches à accomplir](https://github.com/ThikSag/robot_tp1_ift3355_a24#les-t%C3%A2ches-%C3%A0-accomplir) 
pour compléter ce travail. J’apporterai ensuite quelques [précisions](https://github.com/ThikSag/robot_tp1_ift3355_a24#pr%C3%A9cisions-suppl%C3%A9mentaires-sur-certaines-parties-du-travail-et-certains-de-nos-choix) 
concernant certaines parties du travail et certains choix que ma coéquipière et moi 
avons faits lors de la réalisation du travail. 

Pour ce travail, une base de code nous a été fournie et il nous fallait la compléter. 
Il est possible de consulter la base de code telle qu’elle nous a été fournie dans la 
branche [_original_files_](https://github.com/ThikSag/robot_tp1_ift3355_a24/tree/original_files). 
Vous pouvez consulter la section [_Description des fichiers et dossiers du projet_](https://github.com/ThikSag/robot_tp1_ift3355_a24#description-des-fichiers-et-dossiers-du-projet) 
pour avoir une brève description des différents éléments fournis dans la base de code.

### Restrictions générales du travail
- Il était interdit de modifier les dossiers _images_ et _js_, ainsi que leurs fichiers. 
Il n’était pas non plus permis de modifier le fichier _A1.html_. Notre travail se 
limitait au fichier _A1.js_.
<br><br>
- Il était interdit d’utiliser les fonctions de transformation de la librairie _Three.js_. 
Il fallait utiliser les fonctions de transformation déclarée dans le fichier _A1.js_ après 
les avoir complétées. Par contre, il était permis de déclarer explicitement de nouvelles 
matrices avec la méthode `Matrix4().set`.
<br><br>
- Il fallait utiliser la méthode `object.setMatrix` pour déplacer les objets en changeant 
leurs repères, mais il était interdit d’utiliser les opérations sur les attributs de 
position, de rotation et d’échelle des objets.
<br><br>
- Il était interdit de créer une hiérarchie en utilisant l’attribut `parent`.

### Les tâches à accomplir
1. Compléter les fonctions de transformation déclarées dans le fichier _A1.js_.
<br><br>
2. Ajouter des bras, des avant-bras, des cuisses et des jambes de forme ellipsoïdale 
au robot. Ces ellipsoïdes devaient être créés à partir de sphères sur lesquelles des 
changements d’échelles non uniformes étaient appliqués.
<br><br>
3. Compléter le code pour que l’utilisateur puisse sélectionner et contrôler chacun 
des bras, des avant-bras, des cuisses et des jambes. L’utilisateur devait pouvoir 
appliquer une rotation sur deux axes à chaque bras et une rotation sur un axe à chaque 
avant-bras, cuisse et jambe. Il fallait respecter la hiérarchie du robot lors de 
l’application de chaque transformation. Par exemple, transformer le torse transforme 
tous les membres du robot, transformer un bras transforme l’avant-bras, transformer 
une cuisse transforme la jambe, etc.
<br><br>
4. Créer une animation cyclique des membres inférieurs (au moins) correspondant à une 
marche vers l’avant. Cette marche n’avait pas à être élégante, mais elle devait 
ressembler minimalement à une marche.
<br><br>
5. Trouver la jambe de support durant l’animation de marche créée et déplacer le robot 
à la verticale (en suivant l’axe Y) afin qu’il soit toujours en contact avec le sol. 
La jambe de support était considérée comme étant la jambe la plus basse.
<br><br>
6. Compléter la fonction `look_at(point)` qui prend en paramètre un point dans l’espace 
monde et qui applique une série de transformations au robot afin qu’il regarde dans la 
direction du point. Il fallait s’assurer de préserver l’anatomie du robot, c’est-à-dire 
qu’il ne pouvait pas regarder directement derrière lui sans se retourner.

### Précisions supplémentaires sur certaines parties du travail et certains de nos choix
Il n’était pas obligatoire dans le travail de mettre des angles de rotation maximaux 
aux différents membres du robot. Pour cette raison, dans notre projet, il est possible 
de tourner les bras et les avant-bras du robot sur 360 degrés. Cependant, nous avons 
mis des angles de rotation maximaux pour la tête, les cuisses et les jambes. 

L’angle 
maximal de rotation en X pour les cuisses est de 2.4 radians (~ 137 degrés) vers l’avant 
et vers l’arrière. L’angle maximal de rotation en X pour les jambes est de 1.5 radians 
(~ 86 degrés) vers l’avant et vers l’arrière. Pour la tête, l’angle maximal de rotation 
en X est de 1.57 radians (~ 90 degrés) vers le haut et vers le bas. Pour la tête, l’angle 
maximal de rotation en Y est de 1.57 radians (~ 90 degrés) vers la gauche et vers la 
droite. 

De plus, pour la rotation de la tête, nous avons considéré que le centre du coup 
du robot était le point de connexion de la tête avec le torse. Nous avons donc fait notre 
rotation de manière à ce que le centre du coup du robot reste collé sur le torse. Bref, 
le centre du bas de la tête est notre point de rotation de la tête.

Pour l’animation cyclique correspondant à une marche, je pense qu’une marche où seulement 
les cuisses bougent n’était pas tout à fait correcte. Il me semble que les cuisses ET les 
jambes devaient bouger durant l’animation. C’est pourquoi dans notre projet les cuisses et 
les jambes bougent durant l’animation cyclique de marche. 

Ensuite, il n’avait pas d’indication précise sur le déclenchement de l’animation cyclique 
de marche. Il y avait deux possibilités. La première était que l’animation complète soit 
déclenchée lorsqu’une certaine touche était appuyée. La deuxième était que l’animation se 
déroule lorsque le torse du robot était déplacé vers l’avant. Dans notre projet, nous avons 
opté pour la deuxième possibilité. Dès que le torse du robot se déplace, les cuisses et 
les jambes effectuent l’animation cyclique de marche.

De plus, il n’était pas nécessaire que l’animation cyclique de marche inclue une animation 
de marche vers l’arrière ou à reculons. Par contre, dans notre projet, l’animation de marche 
inclut automatiquement la marche à reculons puisque nous avons opté pour la deuxième 
possibilité mentionnée ci-dessus.

Dernière précision concernant l’animation de marche. Dès qu’un des membres inférieurs du 
robot est bougé, nous replaçons les cuisses et les jambes du robot dans leur position 
initiale avant de (re)commencer l’animation cyclique de marche. Ceci permet de s’assurer 
que le robot marche correctement.

Enfin, ceci n’a pas été explicitement demandé dans le travail, mais nous avons décidé 
d’ajouter des yeux à notre robot. Cet ajout est purement esthétique, il n’est donc pas 
possible de sélectionner les yeux pour les bouger indépendamment de la tête du robot. 
Les yeux du robot permettent à l’utilisateur de savoir visuellement quel côté du robot 
est l’avant et quel côté est l’arrière. Ceci est possible, car la rotation de la tête 
est limitée vers la gauche et la droite.

## Amélioration possible du projet
- Ajouter des restrictions de rotation maximale aux bras et aux avant-bras du robot.
<br><br>
- Ajouter un deuxième axe de rotation aux cuisses, afin que le robot puisse mieux 
reproduire les mouvements de la cuisse qu’un humain est capable de faire.
<br><br>
- Ajouter la sélection et le contrôle des yeux de la tête par l’utilisateur.
<br><br>
- Ajouter une animation cyclique des membres supérieurs du robot qui viendrait 
complémenter l’animation cyclique de marche des membres inférieurs.
<br><br>
- Corriger l’animation cyclique de marche des membres inférieurs du robot pour que 
le robot fasse de plus grands pas ou pour qu’il ait une marche plus réaliste.

**Merci encore à ma coéquipière [Grace](https://github.com/gracenl2) avec qui j’ai 
réalisé ce projet initialement.**

[Retour en haut ⤴️](https://github.com/ThikSag/robot_tp1_ift3355_a24?tab=readme-ov-file#construisez-votre-robot---travail-pratique-1---ift3355-infographie---automne-2024)

<!-- 
La touche `E` permet d’aller au `prochain élément` et la touche `Q` d’aller à `l’élément précédent`.
Les touches `W`, `S`, `A` et `D` permettent de bouger la partie sélectionnée du 
robot vers le `haut/avant`, le `bas/arrière`, la `gauche` et la `droite` respectivement.
-->