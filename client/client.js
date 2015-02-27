// =============================================================================
// = Myself                                                                    =
// =============================================================================

MY_ID = amplify.store('playerId') || amplify.store('playerId', Random.id());


function createMyself() {

    Entities.upsert({

        _id: MY_ID

    }, {

        $set: {

            x: 0,

            y: 0,

            xDirection: null,

            yDirection: null,

            angle: 0,

            animation: 'idle'

        }

    });

}


function updateMyself(me) {

    var xDirection = null;
    var yDirection = null;

    // Left or right
    if (cursors.left.isDown)
    {
        xDirection = LEFT;
    }
    else if (cursors.right.isDown)
    {
        xDirection = RIGHT;
    }

    // Up or down
    if (cursors.up.isDown)
    {
        yDirection = UP;
    }
    else if (cursors.down.isDown)
    {
        yDirection = DOWN;
    }

    Entities.update(MY_ID, {

        $set: {

            xDirection: xDirection,
            yDirection: yDirection
        }

    });
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

    game.add.tileSprite(0, 0, 1920, 1920, 'background');

    game.world.setBounds(0, 0, 1920, 1920);

    cursors = game.input.keyboard.createCursorKeys();

    startTrackingEntities();
}




// = Update ====================================================================

function update() {

    _.each(entities, updateEntities);

}


function updateEntities(entity) {

    if (entity._id == MY_ID)
    {
        updateMyself(entity);
    }

    entity.sprite.x = entity.x;
    entity.sprite.y = entity.y;
    entity.sprite.angle = entity.angle;

    var frameRate = 4;
    var loop = true;
    entity.sprite.animations.play(entity.animation, frameRate, loop);

}


// =============================================================================
// = Tracking                                                                  =
// =============================================================================

var entities = {};


function startTrackingEntities() {

    Tracker.autorun(ensureIExist);

    Entities.find().observe({

        added: onEntityAdded,

        changed: onEntityChanged,

        removed: onEntityRemoved

    });

}


function ensureIExist() {
    var me = Entities.findOne(MY_ID, {

        fields: {

            _id: 1

        }

    });

    if (!me)
    {
        createMyself();
    }

}


function onEntityAdded(newEntity) {

    var sprite = game.add.sprite(0, 0, 'player');

    sprite.animations.add('idle', [1]);
    sprite.animations.add('walk');
    sprite.anchor.setTo(0.5, 0.5);

    newEntity.sprite = sprite;

    if (newEntity._id == MY_ID)
    {
        game.camera.follow(newEntity.sprite);
    }

    entities[newEntity._id] = newEntity;

}


function onEntityChanged(newEntity, oldEntity) {

    newEntity.sprite = entities[oldEntity._id].sprite;

    entities[newEntity._id] = newEntity;

}


function onEntityRemoved(oldEntity) {

    oldEntity = entities[oldEntity._id];

    if (oldEntity._id == MY_ID)
    {
        game.camera.unfollow();
    }

    oldEntity.sprite.destroy(true /* destroyChildren */);

    delete entities[oldEntity._id];

}


// vim: set tabstop=8 softtabstop=0 expandtab shiftwidth=4 smarttab:
