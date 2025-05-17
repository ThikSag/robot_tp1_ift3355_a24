# Construisez votre robot! - Travail pratique 1 - IFT3355 Infographie - Automne 2024
robot_tp1_ift3355_a24

## Introduction

Ce projet a initialement été réalisé dans le cadre du Travail pratique 1 du cours IFT3355 – Infographie de l’Université de Montréal donné par Pierre Poulin à la session d’automne 2024. 

Merci à ma coéquipière Grace (@gracenl2) avec qui j’ai fait ce projet initialement. 

Cependant, j’ai apporté quelques modifications à ce projet récemment. Ainsi, le projet présenté dans ce répertoire est une version améliorée du projet que ma coéquipière et moi avons remis pour l’évaluation de ce travail dans le cours.

De plus, le projet ayant été réalisé dans le cadre d’un cours donné en français, la majorité du code du fichier A1.js a été écrit en pensant au français. Ainsi, les commentaires et les noms des variables, des fonctions, des paramètres et des méthodes sont presque tous en français. Par contre, l’anglais étant prédominant en informatique, j’ai fait une version anglaise du fichier A1.js. Celle-ci est disponible dans la branche "english_comments" de ce répertoire.

## Explication sommaire du projet
Dans ce projet, il fallait compléter un robot, le faire marcher et le faire regarder un point indiqué par la souris. Il fallait aussi compléter des fonctions de transformation qui permettent au robot de bouger.

L’objectif principal de ce projet était de pratiquer les rotations, les translations et les changements d’échelle vus en cours, ainsi que de comprendre comment hiérarchiser ces transformations.

Ce projet utilise la libraire Three.js afin de créer la scène 3D et l’animer. Par contre, la création de la scène 3D, le rendu de l’environnement ainsi que les « event listeners » et la mise à jour de la scène nous ont été fournis par notre professeur. Ainsi, pour le projet, nous avons uniquement appris à utiliser la librairie Three.js pour la création de notre robot et la transformation de ses membres.

Une explication plus complète du projet est disponible dans la section « Explication détaillée du projet ».

De plus, une section concernant les « améliorations possibles » du projet est incluse après les explications détaillées.

## Explications des différentes branches du répertoire
- La branche "main" contient une version améliorée du code que ma coéquipière et moi avons remis pour l’évaluation de ce travail scolaire. 
- La branche "original_files" contient les fichiers originaux de la base de code qui nous a été remis par notre professeur pour réaliser ce travail.
- La branche "english_comments" contient une version anglaise du fichier "A1.js". Dans cette version améliorée du code, j’ai traduit tous les commentaires en anglais, ainsi que tous les noms des fonctions, des variables, des méthodes et des paramètres.

## Description des fichiers et dossiers du projet
- Le fichier A1.html sert à lancer le projet. 
- Le dossier js contient les librairies JavaScript requises pour exécuter le projet. 
- Le dossier images contient les textures utilisées dans le projet. 
- Le fichier A1.js contient le code principal de ce projet. Il contient tout le code nécessaire pour le robot, ainsi que le code pour construire la scène et rendre l’environnement. C’est ce fichier que nous avions à compléter pour notre travail scolaire.

## Exécuter le projet
Malheureusement, le projet ne peut pas être lancé simplement en exécutant le fichier "A1.html". Ceci est dû au fait que la plupart des navigateurs empêchent les pages d’accéder aux fichiers locaux de leur machine. 

Dans notre cours, nous utilisions l’IDE WebStorm pour contourner ce problème et lancer le projet. Ci-dessous se trouve la procédure pour lancer le projet avec l’IDE WebStorm. 

### Procédure pour lancer le projet avec l’IDE WebStorm
1. Ouvrir le projet avec l’IDE WebStorm depuis le dossier contenant le fichier "A1.html".
2. Dans l’IDE WebStorm, ouvrir le fichier "A1.html".
3. Dans l’IDE WebStorm, cliquer sur le bouton " Run 'A1.html' " pour exécuter le fichier "A1.html". Il est aussi possible d’utiliser le raccourci clavier "Ctrl + F5".
4. L’IDE WebStorm ouvre une page du navigateur par défaut dans lequel se trouve le robot.

## Comment contrôler le robot?
- Les touches "Q" et "E" permettent de sélectionner toutes les parties du robot. La touche "E" permet d’aller au prochain élément et la touche "Q" d’aller à l’élément précédent. La partie sélectionnée lors du lancement du projet est la tête du robot.
- Les touches "W", "S", "A" et "D" permettent de bouger la partie sélectionnée du robot vers le "haut/avant", le "bas/arrière", la "gauche" et la "droite" respectivement.
- La touche "F" permet au robot de regarder le point indiqué par la souris.

## Explication détaillée du projet
Tel que mentionné précédemment, ce projet a initialement été réalisé dans le cadre d’un travail pratique scolaire. Dans cette section, je vais donc décrire les restrictions générales quant à la réalisation du travail et les tâches à accomplir pour compléter ce travail. J’apporterai ensuite quelques précisions concernant certaines parties du travail et certains choix que ma coéquipière et moi avons faits lors de la réalisation du travail. 

Pour ce travail, une base de code nous a été fournie et il nous fallait la compléter. Il est possible de consulter la base de code telle qu’elle nous a été fournie dans la branche "original_files". Vous pouvez consulter la section « Description des fichiers et dossiers du projet » pour avoir une brève description des différents éléments fournis dans la base de code.

### Restrictions générales du travail
- Il était interdit de modifier les dossiers images et js, ainsi que leurs fichiers. Il n’était pas non plus permis de modifier le fichier A1.html. Notre travail se limitait au fichier A1.js.
<br><br>
- Il était interdit d’utiliser les fonctions de transformation de la librairie Three.js. Il fallait utiliser les fonctions de transformation déclarée dans le fichier A1.js après les avoir complétées. Par contre, il était permis de déclarer explicitement de nouvelles matrices avec la méthode Matrix4().set.
<br><br>
- Il fallait utiliser la méthode object.setMatrix pour déplacer les objets en changeant leurs repères, mais il était interdit d’utiliser les opérations sur les attributs de position, de rotation et d’échelle des objets.
<br><br>
- Il était interdit de créer une hiérarchie en utilisant l’attribut parent.

### Les tâches à accomplir
1. Compléter les fonctions de transformation déclarées dans le fichier A1.js.
<br><br>
2. Ajouter des bras, des avant-bras, des cuisses et des jambes de forme ellipsoïdale au robot. Ces ellipsoïdes devaient être créés à partir de sphères sur lesquelles des changements d’échelles non uniformes étaient appliqués.
<br><br>
3. Compléter le code pour que l’utilisateur puisse sélectionner et contrôler chacun des bras, des avant-bras, des cuisses et des jambes. L’utilisateur devait pouvoir appliquer une rotation sur deux axes à chaque bras et une rotation sur un axe à chaque avant-bras, cuisse et jambe. Il fallait respecter la hiérarchie du robot lors de l’application de chaque transformation. Par exemple, transformer le torse transforme tous les membres du robot, transformer un bras transforme l’avant-bras, transformer une cuisse transforme la jambe, etc.
<br><br>
4. Créer une animation cyclique des membres inférieurs (au moins) correspondant à une marche vers l’avant. Cette marche n’avait pas à être élégante, mais elle devait ressembler minimalement à une marche.
<br><br>
5. Trouver la jambe de support durant l’animation de marche créée et déplacer le robot à la verticale (en suivant l’axe Y) afin qu’il soit toujours en contact avec le sol. La jambe de support était considérée comme étant la jambe la plus basse.
<br><br>
6. Compléter la fonction look_at(point) qui prend en paramètre un point dans l’espace monde et qui applique une série de transformations au robot afin qu’il regarde dans la direction du point. Il fallait s’assurer de préserver l’anatomie du robot, c’est-à-dire qu’il ne pouvait pas regarder directement derrière lui sans se retourner.

### Précisions supplémentaires sur certaines parties du travail et certains de nos choix
Il n’était pas obligatoire dans le travail de mettre des angles de rotation maximaux aux différents membres du robot. Pour cette raison, dans notre projet, il est possible de tourner les bras et les avant-bras du robot sur 360 degrés. Cependant, nous avons mis des angles de rotation maximaux pour la tête, les cuisses et les jambes. L’angle maximal de rotation en X pour les cuisses est de 2.4 radians (~ 137 degrés) vers l’avant et vers l’arrière. L’angle maximal de rotation en X pour les jambes est de 1.5 radians (~ 86 degrés) vers l’avant et vers l’arrière. Pour la tête, l’angle maximal de rotation en X est de 1.57 radians (~ 90 degrés) vers le haut et vers le bas. Pour la tête, l’angle maximal de rotation en Y est de 1.57 radians (~ 90 degrés) vers la gauche et vers la droite. De plus, pour la rotation de la tête, nous avons considéré que le centre du coup du robot était le point de connexion de la tête avec le torse. Nous avons donc fait notre rotation de manière à ce que le centre du coup du robot reste collé sur le torse. Bref, le centre du bas de la tête est notre point de rotation de la tête.

Pour l’animation cyclique correspondant à une marche, je pense qu’une marche où seulement les cuisses bougent n’était pas tout à fait correcte. Il me semble que les cuisses ET les jambes devaient bouger durant l’animation. C’est pourquoi dans notre projet les cuisses et les jambes bougent durant l’animation cyclique de marche. 

Ensuite, il n’avait pas d’indication précise sur le déclenchement de l’animation cyclique de marche. Il y avait deux possibilités. La première était que l’animation complète soit déclenchée lorsqu’une certaine touche était appuyée. La deuxième était que l’animation se déroule lorsque le torse du robot était déplacé vers l’avant. Dans notre projet, nous avons opté pour la deuxième possibilité. Dès que le torse du robot se déplace, les cuisses et les jambes effectuent l’animation cyclique de marche.

De plus, il n’était pas nécessaire que l’animation cyclique de marche inclue une animation de marche vers l’arrière ou à reculons. Par contre, dans notre projet, l’animation de marche inclut automatiquement la marche à reculons puisque nous avons opté pour la deuxième possibilité mentionnée ci-dessus.

Dernière précision concernant l’animation de marche. Dès qu’un des membres inférieurs du robot est bougé, nous replaçons les cuisses et les jambes du robot dans leur position initiale avant de (re)commencer l’animation cyclique de marche. Ceci permet de s’assurer que le robot marche correctement.

Enfin, ceci n’a pas été explicitement demandé dans le travail, mais nous avons décidé d’ajouter des yeux à notre robot. Cet ajout est purement esthétique, il n’est donc pas possible de sélectionner les yeux pour les bouger indépendamment de la tête du robot. Les yeux du robot permettent à l’utilisateur de savoir visuellement quel côté du robot est l’avant et quel côté est l’arrière. Ceci est possible, car la rotation de la tête est limitée vers la gauche et la droite. 

## Amélioration possible du projet
- Ajouter des restrictions de rotation maximale aux bras et aux avant-bras du robot.
- Ajouter un deuxième axe de rotation aux cuisses, afin que le robot puisse mieux reproduire les mouvements de la cuisse qu’un humain est capable de faire.
- Ajouter la sélection et le contrôle des yeux de la tête par l’utilisateur.
- Ajouter une animation cyclique des membres supérieurs du robot qui viendrait complémenter l’animation cyclique de marche des membres inférieurs.
- Corriger l’animation cyclique de marche des membres inférieurs du robot pour que le robot fasse de plus grands pas ou pour qu’il ait une marche plus réaliste.

Merci encore à ma coéquipière Grace (@gracenl2) avec qui j’ai réalisé ce projet initialement.

<!--
## Introduction
Ce projet a initialement été réalisé dans le cadre du _Travail pratique 1_ du cours _IFT3355 – 
Infographie_ de l’_Université de Montréal_ donné par _Pierre Poulin_ à la session d’automne 2024.

Merci à ma coéquipière Grace (@gracenl2) avec qui j’ai fait ce projet initialement.

Cependant, j’ai apporté quelques modifications à ce projet récemment. Ainsi, le projet présenté 
dans ce répertoire est une version améliorée du projet que ma coéquipière et moi avons remis pour 
l’évaluation de ce travail dans le cours.

## Brève explication du projet

Dans ce projet, il fallait compléter un robot, le faire marcher et le faire regarder un point
indiqué par la souris. Il fallait aussi compléter les fonctions de transformation qui permettent
au robot de bouger.

L’objectif principal de ce travail était de pratiquer les rotations, les translations et les 
changements d’échelle vus en cours, ainsi que de comprendre comment hiérarchiser ces transformations.

## Procédure pour lancer le projet :
1. Il faut ouvrir le projet avec l'IDE WebStorm depuis le dossier contenant le fichier "A1.html".
2. Dans l'IDE WebStorm, il faut ouvrir le fichier "A1.html".
3. Dans l'IDE WebStorm, il faut cliquer sur le bouton " Run 'A1.html' " pour exécuté le fichier 
4. "A1.html". Il est aussi possible d'utiliser le racourcis clavier "Ctrl + F5".
4. L'IDE Webstorm ouvre une page du navigateur par default dans lequel se trouve le robot.

## Comment contrôler le robot :
- Toutes les parties du robot peuvent être sélectionnées en appuyant sur la touche "E" pour aller au 
- prochain élément et en appuyant sur la touche "Q" pour aller à l'élément précédent.
- Les touches "W", "S", "A" et "D" permettent de bouger les parties du robot vers le "haut/avant", le 
- "bas/arrière", la "gauche" et la "droite" respectivement.
- La touche "F" permet au robot de regarder le point indiqué par la souris.
-->

<!--⚠️ Je travaille présentement sur le fichier "A1.js" pour traduire tout ce qui est en français en 
anglais. La version anglaise du fichier "A1.js" se trouve dans la branche "english_comments" de ce 
répertoire.⚠️

⚠️ I'm currently working on translating the 'A1.js' file from French to English. The English version 
of the 'A1.js' file can be found in the 'english_comments' branch of this repository.⚠️
-->