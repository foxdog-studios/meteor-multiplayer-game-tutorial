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

            y: 0

        }

    });

}


function updateMyself(me) {

    var speed = 4;
    var xInc = 0;
    var yInc = 0;

    // Up or down
    if (cursors.up.isDown)
    {
        yInc -= 1;
    }
    else if (cursors.down.isDown)
    {
        yInc += 1;
    }

    // Left or right
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

    Entities.update(me._id, {

        $inc: {

            x: xInc * speed,

            y: yInc * speed

        }

    });

    if (yInc != 0 || xInc != 0)
    {
        angleInRadians = (Math.atan2(yInc, xInc) - Math.atan2(1, 0));
        me.sprite.angle = angleInRadians * 180 / Math.PI;
        me.sprite.animations.play('walk', speed, true);
    }
    else
    {
        me.sprite.animations.play('idle', 1, true);
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
    sprite.animations.play('idle', 1 /* frameRate */, true /* loop */);

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
