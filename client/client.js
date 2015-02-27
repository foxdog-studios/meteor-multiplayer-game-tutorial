// =============================================================================
// = Myself                                                                    =
// =============================================================================

MY_ID = amplify.store('playerId') || amplify.store('playerId', Random.id());


var mySprite;


function createMyself() {

    Players.upsert({

        _id: MY_ID

    }, {

        $set: {

            x: 0,

            y: 0

        }

    });

}


function updateMyself(me) {

    var speed = 4;
    var xInc = 0;
    var yInc = 0;

    if (cursors.up.isDown)
    {
        yInc -= speed;
    }
    else if (cursors.down.isDown)
    {
        yInc += speed;
    }

    if (cursors.left.isDown)
    {
        xInc -= speed;
    }
    else if (cursors.right.isDown)
    {
        xInc += speed;
    }

    Players.update(me._id, {

        $inc: {

            x: xInc,

            y: yInc

        }

    });

    if (mySprite)
    {
        mySprite.rotation = game.physics.arcade.angleToPointer(mySprite);
        if (yInc != 0 || xInc != 0)
        {
          mySprite.animations.play('walk', speed, true);
        }
        else
        {
          mySprite.animations.play('idle', 1, true);
        }
    }
}


// =============================================================================
// = Game                                                                      =
// =============================================================================

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {

    preload: preload,

    create: create,

    update: update

});


function preload() {

    game.load.image('background','debug-grid-1920x1920.png');
    game.load.spritesheet('player','player.png', 16, 16);

}


var cursors;


function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    createMyself();

    game.add.tileSprite(0, 0, 1920, 1920, 'background');

    game.world.setBounds(0, 0, 1920, 1920);

    cursors = game.input.keyboard.createCursorKeys();

}


// = Update ====================================================================

function update() {

    var me = Players.findOne(MY_ID);

    if (me)
    {
        updateMyself(me);
    }

    players.forEach(updatePlayer);

}


function updatePlayer(player) {

    var sprite = playerSprites[player._id];

    if (!sprite)
    {
        sprite = game.add.sprite(0, 0, 'player');

        playerSprites[player._id] = sprite;

        sprite.animations.add('idle', [1]);
        sprite.animations.add('walk');
        sprite.animations.play('idle', 1, true);

        sprite.anchor.setTo(0.5, 0.5);

        if (player._id == MY_ID)
        {
            mySprite = sprite;
            game.camera.follow(sprite);
        }
    }

    updatePlayerSprite(player, sprite);

}


function updatePlayerSprite(player, sprite) {

    sprite.x = player.x;

    sprite.y = player.y;

}


// =============================================================================
// = Players                                                                   =
// =============================================================================

var players = [];
var playerSprites = {};


Meteor.startup(function () {

    Tracker.autorun(fetchPlayers);

});


function fetchPlayers() {

    players = Players.find().fetch();

}


// vim: set tabstop=8 softtabstop=0 expandtab shiftwidth=4 smarttab:
