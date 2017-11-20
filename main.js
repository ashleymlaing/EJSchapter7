var plan =
[
  "###########################",
  "#      #    #      o     ##",
  "#                         #",
  "#          #####          #",
  "##         #   #    ##    #",
  "###           ##     #    #",
  "#           ###      #    #",
  "#   ####                  #",
  "#   ##       o            #",
  "# o  #        o      ###  #",
  "#    #                    #",
  "###########################"
];

var critterCount = 0;
var plantCount = 0;
var tigerCount = 0;

//setting coordinates
function Vector(x,y) {
  this.x = x;
  this.y = y;
}
//add the x and y, to return a new Vector with updated coordinates
//Takes two Vector objects and adds together
Vector.prototype.plus = function (other) {
  //TODO; a conditional to max x+x < 10 and y+y < 10
  return new Vector(this.x + other.x, this.y + other.y);
};

//constructor for Grid to start to build a grid to start to make the plan array come to life
function Grid(width, height){
  this.space = new Array(width * height);
  this.width = width;
  this.height = height;
}

//Checking to see of the coordinates is inside the grid that is created
Grid.prototype.isInside = function (vector) {
  return vector.x >= 0 && vector.x < this.width && vector.y >= 0 && vector.y < this.height;
};

//these next two methods finding the position in the array and setting or getting the value from that position in the space array

Grid.prototype.get = function (vector) {
  return this.space[vector.x + this.width * vector.y];
};

Grid.prototype.set = function(vector, value) {
  this.space[vector.x + this.width * vector.y] = value;
};

Grid.prototype.forEach = function (f,context) {
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var value =this.space[x + y * this.width];
      if (value != null) {
        f.call(context, value, new Vector(x,y));
      }
    }
  }
};

//when used with Vector.plus it will add to the coordinates of the this.x and this,y

//this will be the other in Vector.plus()
var directions = {
  "n": new Vector(0,-1),
  "ne": new Vector(1,-1),
  "e": new Vector(1,0),
  "se": new Vector(1,1),
  "s": new Vector(0,1),
  "sw": new Vector(-1,1),
  "w": new Vector(-1,0),
  "nw": new Vector(-1,-1)
};

//used with directions array it will move critters random directions

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

var directionNames = "n ne e se s sw w nw".split(" ");

//because it is used in legend, we needed the Wall constructor to define Wall
function Wall() {

}


function BouncingCritter() {
  this.direction = randomElement(directionNames);
};

//this will have the critter look to make sure the space is empty or go south

BouncingCritter.prototype.act = function(view){
  if(view.look(this.direction) != " "){
    this.direction = view.find(" ") || "s";
  }
  return {type: "move", direction: this.direction};
};

//this next function get the char to make the space or set the char as an element

function elementFromChar(legend, ch) {
  if (ch == " ") {
    return null;
  }
  //it is taking the legend and creating a new object from the legend and returning that new object
  var element = new legend[ch]();
  element.originChar = ch;
  if (element.originChar == "#") {
    element.chrisIsTheBest = true;
  }else {
    element.chrisIsTheBest = false;
    // if(element.originChar == "@"){
    //   tigerCount++;
    // }else if(element.originChar == "O"){
    //   critterCount++;
    // }else if(element.originChar = "*"){
    //   plantCount++;
    // }
  }
  return element;
}

//

function charFromElement(element) {
  if (element == null) {
    return " ";
  }else {
    return element.originChar;
  }
}

//my function to count the number of elements
// function population(grid){
//
// }
//

function View(world, vector) {
  this.world = world;
  this.vector = vector;
}

//detecting connection and if the critter is going into another object. returning # or char at the target
View.prototype.look = function(dir) {
  var target = this.vector.plus(directions[dir]);
  if (this.world.grid.isInside(target))
    return charFromElement(this.world.grid.get(target));
  else
    return "#";
};

View.prototype.findAll = function(ch) {
  var found = [];
  for (var dir in directions)
    if (this.look(dir) == ch)
      found.push(dir);
  return found;
};

View.prototype.find = function(ch) {
  var found = this.findAll(ch);
  if (found.length == 0) return null;
  return randomElement(found);
};

//

function World(map, legend) {
  var grid = new Grid(map[0].length, map.length);
  this.grid = grid;
  this.legend = legend;

// for each item in the plan array, line is the string and y is the index and stands for the y-axis
  map.forEach(function(line, y) {
    //loop through the string and puts a value of what is in the plan array and uses that char
    for (var x = 0; x < line.length; x++) {
      grid.set(new Vector(x,y),
        elementFromChar(legend, line[x]));
    }
  });
}

World.prototype.toString = function() {
  critterCount = 0;
  plantCount = 0;
  tigerCount = 0;
  var output = "";
  for (var y = 0; y < this.grid.height; y++) {
    for (var x = 0; x < this.grid.width; x++) {
      var element = this.grid.get(new Vector(x,y));
      output += charFromElement(element);
      if(charFromElement(element)=="O")
        critterCount++;
      if(charFromElement(element)=="@")
        tigerCount++;
      if(charFromElement(element)=="*")
        plantCount++;
    }
    output += "\n";
  }
  return output;
};

//

World.prototype.checkDestination = function(action, vector) {
  if (directions.hasOwnProperty(action.direction)) {
    var dest = vector.plus(directions[action.direction]);
    if (this.grid.isInside(dest)) {
      return dest;
    }
  }
};

//lets the critter act/move

World.prototype.letAct = function(critter, vector) {
  var action = critter.act(new View(this, vector));
  if(action && action.type == "move"){
    var dest = this.checkDestination(action,vector);
    if (dest && this.grid.get(dest) == null) {
      this.grid.set(vector,null);
      this.grid.set(dest,critter);
    }
  }
};

//checking to see if the critter has acted
World.prototype.turn = function () {
  var acted = [];
  this.grid.forEach(function(critter, vector) {
    if (critter.act && acted.indexOf(critter) == -1) {
      acted.push(critter);
      this.letAct(critter, vector);
    }
  },this);
};


//sets the legend into a world object and the plan array to create the world and how it looks
var world = new World(plan, {"#":Wall, "o":BouncingCritter});

//

function dirPlus(dir, n) {
  var index = directionNames.indexOf(dir);
  return directionNames[(index + n + 8) % 8];
}

function WallFollower() {
  this.dir = "s";
}

WallFollower.prototype.act = function(view) {
  var start = this.dir;
  if (view.look(dirPlus(this.dir, -3)) != " ")
    start = this.dir = dirPlus(this.dir, -2);
  while (view.look(this.dir) != " ") {
    this.dir = dirPlus(this.dir, 1);
    if (this.dir == start) break;
  }
  return {type: "move", direction: this.dir};
};

function LifelikeWorld(map, legend) {
  World.call(this, map, legend);
}
LifelikeWorld.prototype = Object.create(World.prototype);

var actionTypes = Object.create(null);

LifelikeWorld.prototype.letAct = function(critter, vector) {
  var action = critter.act(new View(this, vector));
  var handled = action &&
    action.type in actionTypes &&
    actionTypes[action.type].call(this, critter,
                                  vector, action);
  if (!handled) {
    critter.energy -= 0.2;
    if (critter.energy <= 0)
      this.grid.set(vector, null);
  }
};

actionTypes.grow = function(critter) {
  critter.energy += 0.5;
  return true;
};

actionTypes.move = function(critter, vector, action) {
  var dest = this.checkDestination(action, vector);
  if (dest == null ||
      critter.energy <= 1 ||
      this.grid.get(dest) != null)
    return false;
  critter.energy -= 1;
  this.grid.set(vector, null);
  this.grid.set(dest, critter);
  return true;
};

actionTypes.eat = function(critter, vector, action) {
  var dest = this.checkDestination(action, vector);
  var atDest = dest != null && this.grid.get(dest);
  if (!atDest || atDest.energy == null)
    return false;
  critter.energy += atDest.energy;
  this.grid.set(dest, null);
  return true;
};

actionTypes.reproduce = function(critter, vector, action) {
  var baby = elementFromChar(this.legend,critter.originChar);
  var dest = this.checkDestination(action, vector);
  if (dest == null ||
      critter.energy <= 2 * baby.energy ||
      this.grid.get(dest) != null)
    return false;
  critter.energy -= 2 * baby.energy;
  this.grid.set(dest, baby);
  return true;
};

function Plant() {
  this.energy = 3 + Math.random() * 4;
}

Plant.prototype.act = function(view) {
  if (this.energy > 15) {
    var space = view.find(" ");
    if (space)
      return {type: "reproduce", direction: space};
  }
  if (this.energy < 20)
    return {type: "grow"};
};

function PlantEater() {
  this.energy = 20;
}

//rearranged for the smartPlantEater

PlantEater.prototype.act = function(view) {
  var plant = view.find("*");
  var space = view.find(" ");
  if (plant && space)
    return {type: "eat", direction: plant};
  if (this.energy > 100 && space)
    return {type: "reproduce", direction: space};
  if (space)
    return {type: "move", direction: space};
};

// function population(view){
//   tigerCount=0;
//   critterCount=0;
//   plantCount=0;
//   var plant = view.find("*");
//   var plantEater = view.find("O");
//   var tiger = view.find("@");
//   if(plant)
//     plantCount++;
//   if(plantEater)
//     critterCount++;
//   if(tiger)
//     tigerCount++;
// }

function Tiger() {
  this.energy = 60;
}

Tiger.prototype.act = function(view){
  var food = view.find("O");
  var space = view.find(" ");
  var plant = view.find("*")
  if (food && space)
    return {type: "eat", direction: food};
  if (this.energy > 80 && space)
    return {type: "reproduce", direction: space};
  if (space || plant)
    return {type: "move", direction: space};
};

var valley = new LifelikeWorld(
  ["############################",
   "#####                 ######",
   "##   ***                **##",
   "#   *##**         **  O  *##",
   "#    ***     O    ##**    *#",
   "#       O         ##***    #",
   "#                 ##**     #",
   "#   O       #*             #",
   "#*          #**       O    #",
   "#***        ##**    O    **#",
   "##****     ###***       *###",
   "############################"],
  {"#": Wall,
   "O": PlantEater,
   "*": Plant}
);

var animalKingdom = new LifelikeWorld(
  ["####################################################",
  "#                 ####         ****              ###",
  "#   *  @  ##                 ########       OO    ##",
  "#   *    ##        O O                 ****       *#",
  "#       ##*                        ##########     *#",
  "#      ##***  *         ****                     **#",
  "#* **  #  *  ***      #########                  **#",
  "#* **  #      *               #   *              **#",
  "#     ##              #   O   #  ***          ######",
  "#*            @       #       #   *        O  #    #",
  "#*                    #  ######                 ** #",
  "###          ****          ***                  ** #",
  "#       O                        @         O       #",
  "#   *     ##  ##  ##  ##               ###      *  #",
  "#   **         #              *       #####  O     #",
  "##  **  O   O  #  #    ***  ***        ###      ** #",
  "###               #   *****                    ****#",
  "####################################################"],
  {"#": Wall,
   "@": Tiger,
   "O": PlantEater, // from previous exercise
   "*": Plant}
);

// animateWorld(new World(
//   ["############",
//    "#     #    #",
//    "#   ~    ~ #",
//    "#  ##      #",
//    "#  ##  o####",
//    "#          #",
//    "############"],
//   {"#": Wall,
//    "~": WallFollower,
//    "o": BouncingCritter}
// ));


//this makes the turn function happen 4/5 times
// for (var i = 0; i < 5; i++) {
//   world.turn();
//   console.log(world.toString());
// }
var interval = null;
var turns = 0;
// $('.start').on('click',function(){
//   interval = setInterval(function(){
//     animalKingdom.turn();
//     $('.gameSpace').html("<pre>"+animalKingdom+"</pre>");
//   },400);
// });
//
// $('.stop').on('click',function(){
//   clearInterval(interval);
// });
document.getElementsByClassName('start')[0].onclick = function(){
  alert("start");
  interval = setInterval(function(){
    animalKingdom.turn();
    turns++;
    document.getElementById('gameSpace').innerHTML= "<pre>" + animalKingdom + "</pre>" + "<p>Turns:  <span>" + turns + "</span></p>"  + "<p>Plants:  <span>" + plantCount + "</span></p>"+ "<p>Tigers:  <span>" + tigerCount + "</span></p>"+ "<p>PlantEaters:  <span>" + critterCount + "</span></p>";
  },400);
}

document.getElementsByClassName('stop')[0].onclick = function(){
  alert("stop");
  clearInterval(interval);
}
