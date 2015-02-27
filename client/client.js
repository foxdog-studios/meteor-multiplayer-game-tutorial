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

            y: 0,

            angle: 0,

            animation: 'idle'

        }

    });

}


function updateMyself(me) {

    var speed = 4;
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

    magnitudeOfMovement = Math.sqrt(
            (xInc * xInc)
        +
            (yInc * yInc)
    );

    if (magnitudeOfMovement > 0)
    {
        xInc /= magnitudeOfMovement;
        yInc /= magnitudeOfMovement;
    }

    var update = {};

    if (mySprite)
    {
        var $set = {};
        if (yInc != 0 || xInc != 0)
        {
            angleInRadians = (Math.atan2(yInc, xInc) - Math.atan2(1, 0));
            playerAngleDegrees = angleInRadians * 180 / Math.PI;
            $set.angle = playerAngleDegrees
            animation = 'walk';
        }
        else
        {
            animation = 'idle';
        }
        $set.animation = animation;
    }

    update.$inc = {

        x: xInc * speed,

        y: yInc * speed

    }

    update.$set = $set;

    Players.update(me._id, update);

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

    sprite.angle = player.angle;

    sprite.animations.play(player.animation, 4, true);

}


// =============================================================================
// = Players                                                                   =
// =============================================================================

var players = [];
var playerSprites = {};


Meteor.startup(function () {

    Tracker.autorun(function () {

        players = Players.find().fetch();

    });

});


// vim: set tabstop=8 softtabstop=0 expandtab shiftwidth=4 smarttab:
