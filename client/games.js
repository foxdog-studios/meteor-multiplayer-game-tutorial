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
    game.load.image('player','phaser-dude.png');

}

var player;
var players = [];
var playerSprites = {};
var cursors;

function create() {

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
    yInc -= 1;
  }
  else if (cursors.down.isDown)
  {
    yInc += 1;
  }

  if (cursors.left.isDown)
  {
    xInc -= 1;
  }
  else if (cursors.right.isDown)
  {
    xInc += 1;
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

          if (player._id == getPlayerId())
          {
              game.camera.follow(sprite);
          }
      }

      sprite.x = player.x;

      sprite.y = player.y;
  });
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
