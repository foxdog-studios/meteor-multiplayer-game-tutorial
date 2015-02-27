// =============================================================================
// = Myself                                                                    =
// =============================================================================

MY_ID = amplify.store('playerId') || amplify.store('playerId', Random.id());


function createMyself() {

    Entities.upsert({

        _id: MY_ID

    }, {

        $set: {

            type: 'player',
            isMovable: true,
            x: 0,
            y: 0,
            xDirection: null,
            yDirection: null,
            speed: 200,
            angle: 0,

            isAnimatable: true,
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

    // Shoot
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        shootBullet(me);
    }

    Entities.update(MY_ID, {

        $set: {

            xDirection: xDirection,
            yDirection: yDirection
        }

    });
}

// =============================================================================
// = Bullet                                                                    =
// =============================================================================

function shootBullet(entity) {
    Entities.insert({

        type: 'bullet',
        x: entity.x,
        y: entity.y,
        xDirection: LEFT,
        yDirection: UP,
        speed: 400,
        angle: entity.angle,
        isMovable: true,
        isAnimatable: true,
        animation: 'idle'

    });
}


// =============================================================================
// = Game                                                                      =
// =============================================================================

var game;


Meteor.startup(function () {

    game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {

        preload: preload,

        create: create,

        update: update

    });

});


function preload() {

    game.load.image('background', cacheBust('background.png'));

    game.load.spritesheet('bullet', cacheBust('bullet.png'), 8, 8);
    game.load.spritesheet('player', cacheBust('player.png'), 16, 16);

}


var cursors;


function create() {

    game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background');

    game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    cursors = game.input.keyboard.createCursorKeys();

    startTrackingEntities();

}


// = Update ====================================================================

function update() {

    _.each(entities, updateEntity);

}


function updateEntity(entity) {

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

    var sprite = game.add.sprite(0, 0, newEntity.type);

    switch (newEntity.type) {
        case 'player':
            sprite.animations.add('idle', [2]);
            sprite.animations.add('walk', [0, 1]);
            break;
        case 'bullet':
            sprite.animations.add('idle', [0]);
            break;
    }

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


// =============================================================================
// = Utilities                                                                 =
// =============================================================================

function cacheBust(url) {

    return url + '?' + Date.now();

}


// vim: set tabstop=8 softtabstop=0 expandtab shiftwidth=4 smarttab:
