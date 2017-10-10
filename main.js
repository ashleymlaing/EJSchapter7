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

function Vector(x,y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.plus = function (other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

var grid = ["top left","top middle", "top right", "bottom left", "bottom middle", "bottom right"];
console.log(grid[2 + (1 * 3)]);

function Grid(width, height){
  this.space = new Array(width * height);
  this.width = width;
  this.height = height;
}

Grid.prototype.isInside = function (vector) {
  return vector.x >= 0 && vector.x < this.width && vector.y >= 0 && vector.y < this.height;
};
