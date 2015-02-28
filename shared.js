// Directions
STATIONARY = 0;
DOWN = 1;
LEFT = -1;
RIGHT = 1;
UP = -1;


WORLD_WIDTH = 1920;
WORLD_HEIGHT = 1280;

SCALE = 2;
TILE_SIZE_PX = 16 * SCALE;

MAX_NUMBER_OF_MONSTERS = 3;
MAX_NUMBER_OF_BULLETS = 3;


Entities = new Mongo.Collection('entities', null);

