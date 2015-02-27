getPlayerId = function () {
  var playerId = amplify.store('playerId');
  if (!playerId) {
    playerId = amplify.store('playerId', Random.id());
  }
  return playerId;
};



var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('background','debug-grid-1920x1920.png');
    game.load.spritesheet('player','player.png', 16, 16);

}

var players = [];
var playerSprites = {};
var cursors;
var PLAYER_SPEED = 4;

var mySprite;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.add.tileSprite(0, 0, 1920, 1920, 'background');

    game.world.setBounds(0, 0, 1920, 1920);

    cursors = game.input.keyboard.createCursorKeys();

}

function update() {
  var player = Players.findOne(getPlayerId());

  var xInc = 0;
  var yInc = 0;

  if (cursors.up.isDown)
  {
    yInc -= PLAYER_SPEED;
  }
  else if (cursors.down.isDown)
  {
    yInc += PLAYER_SPEED;
  }

  if (cursors.left.isDown)
  {
    xInc -= PLAYER_SPEED;
  }
  else if (cursors.right.isDown)
  {
    xInc += PLAYER_SPEED;
  }

  Players.update(player._id, { $inc: { x: xInc, y: yInc }});

  // TODO: Remove sprite when the player leaves.
  players.forEach(function (player)
  {
      var sprite = playerSprites[player._id];

      if (!sprite)
      {
          sprite = game.add.sprite(0, 0, 'player');

          playerSprites[player._id] = sprite;

          sprite.animations.add('idle', [1]);
          sprite.animations.add('walk');
          sprite.animations.play('walk', PLAYER_SPEED, true);
          sprite.anchor.setTo(0.5, 0.5);

          if (player._id == getPlayerId())
          {
              mySprite = sprite;
              game.camera.follow(sprite);
          }
      }

      sprite.x = player.x;

      sprite.y = player.y;
  });


  mySprite.rotation = game.physics.arcade.angleToPointer(mySprite);

  if (yInc != 0 || xInc != 0)
  {
    mySprite.angle =
      (Math.atan2(yInc, xInc) - Math.atan2(1, 0)) * 180 / Math.PI;

    mySprite.animations.play('walk', PLAYER_SPEED, true);
  }
  else
  {
    mySprite.animations.play('idle', 1, true);
  }
}


function render() {}

Meteor.startup(function () {
  Players.upsert(
    { _id: getPlayerId() },
    { $set: { name: 'John', x: 0, y: 0 } }
  );

  Tracker.autorun(function () {
    players = Players.find().fetch();
  });
});
