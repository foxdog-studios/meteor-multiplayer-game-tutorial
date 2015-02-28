// =============================================================================
// = Myself                                                                    =
// =============================================================================

MY_ID = amplify.store('playerId') || amplify.store('playerId', Random.id());


myLastShootTime = Date.now();


function createMyself() {

    Entities.upsert({

        _id: MY_ID

    }, {

        $set: {

            type: 'player',
            isMovable: true,
            x: 128,
            y: 128,
            xDirection: 0,
            yDirection: 0,
            speed: 200,
            angle: 0,
            health: 100,

            isAnimatable: true,
            animation: 'idle'
        }

    });

}


function updateMyself(me) {

    var xDirection = 0;
    var yDirection = 0;

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
        now = Date.now()
        if (now - myLastShootTime > 100)
        {
            shootBullet(me);
            myLastShootTime = now;
        }
    }

    // Reset
    if (game.input.keyboard.isDown(Phaser.Keyboard.R))
    {
        Meteor.call('reset');
    }

    // Create a monster
    if (game.input.keyboard.isDown(Phaser.Keyboard.M))
    {
        createMonster(me);
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
    var offsetAngle = entity.angle + 90;
    var vectorX = Math.cos(offsetAngle * Math.PI / 180);
    var vectorY = Math.sin(offsetAngle * Math.PI / 180);
    Entities.insert({

        type: 'bullet',
        x: entity.x + vectorX * TILE_SIZE_PX,
        y: entity.y + vectorY * TILE_SIZE_PX,
        xDirection: vectorX,
        yDirection: vectorY,
        speed: 800,
        health: 1,
        angle: entity.angle,
        isMovable: true,
        isAnimatable: true,
        animation: 'idle'

    });
}

// =============================================================================
// = Monster                                                                   =
// =============================================================================

function createMonster(entity) {
    Entities.insert({

        type: 'monster',
        x: entity.x,
        y: entity.y,
        xDirection: 0,
        yDirection: 0,
        speed: 100,
        health: 1,
        angle: entity.angle,
        isMovable: true,
        animation: 'walk',
        isAi: true

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
    game.load.spritesheet('monster', cacheBust('monster.png'), 16, 16);

}


var cursors;


function create() {

    game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background');

    game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Don't pause the game when the window loses focus.
    game.stage.disableVisibilityChange = true;

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

    sprite.scale.set(SCALE, SCALE);
    sprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

    switch (newEntity.type) {
        case 'player':
            sprite.animations.add('idle', [2]);
            sprite.animations.add('walk', [0, 1]);
            break;
        case 'bullet':
            sprite.animations.add('idle', [0]);
            break;
        case 'monster':
            sprite.animations.add('idle', [0]);
            sprite.animations.add('walk', [1, 2]);
            sprite.animations.add('dead', [3, 4]);
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

    switch (oldEntity.type) {
        case 'bullet':
            oldEntity.sprite.destroy(true /* destroyChildren */);
            break;
        case 'monster':
            oldEntity.sprite.animations.play('dead', 1);
            break;
        case 'player':
            oldEntity.sprite.destroy(true /* destroyChildren */);
            break;
    }


    delete entities[oldEntity._id];

}


// =============================================================================
// = Utilities                                                                 =
// =============================================================================

function cacheBust(url) {

    return url + '?' + Date.now();

}


// vim: set tabstop=8 softtabstop=0 expandtab shiftwidth=4 smarttab:
