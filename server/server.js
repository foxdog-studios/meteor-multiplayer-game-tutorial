var lastUpdated;

Meteor.startup(function () {

    lastUpdated = Date.now() / 1000;

    var framesPerSecond = 15;

    var millisecondsPerFrame = 1000 / framesPerSecond;

    Meteor.setInterval(update, millisecondsPerFrame);

});


function update() {

    // = Update timestamps =================================================

    var now = Date.now() / 1000;

    var delta = now - lastUpdated;

    lastUpdated = now;


    // = Update Entities ===================================================

    var entities = Entities.find().map(function (oldVersion) {

        return {

            oldVersion: oldVersion,
            newVersion: updateEntity(delta, oldVersion)

        };

    });

    detectAndHandleCollisions(entities);

    entities.forEach(function (entity) {

        var diff = difference(entity.newVersion, entity.oldVersion);

        if (diff)
        {
            Entities.update(entity.newVersion._id, { $set: diff });
        }

    });

}


function updateEntity(delta, oldEntity) {

    var newEntity = _.clone(oldEntity);

    if (oldEntity.isMovable)
    {
        updateMovable(delta, newEntity, oldEntity);
    }

    if (oldEntity.isAnimatable)
    {
        updateAnimatable(delta, newEntity, oldEntity);
    }

    return newEntity;

}


function updateMovable(delta, newEntity, oldEntity) {

    var xUnitVelocity = oldEntity.xDirection;
    var yUnitVelocity = oldEntity.yDirection;

    var xyMagnitude = Math.sqrt(
        (xUnitVelocity * xUnitVelocity) + (yUnitVelocity * yUnitVelocity)
    );

    var xNormalizedVelocity = 0;
    var yNormalizedVelocity = 0;

    if (xyMagnitude > 0)
    {
        xNormalizedVelocity = xUnitVelocity / xyMagnitude;
        yNormalizedVelocity = yUnitVelocity / xyMagnitude;
    }

    var speed = oldEntity.speed * delta;
    var xVelocity = speed * xNormalizedVelocity;
    var yVelocity = speed * yNormalizedVelocity;

    var x = newEntity.x + xVelocity;
    var y = newEntity.y + yVelocity;
    newEntity.x = clamp(0, x, WORLD_WIDTH);
    newEntity.y = clamp(0, y, WORLD_HEIGHT);

    if (xVelocity !== 0 || yVelocity !== 0)
    {
        var temp = Math.atan2(yUnitVelocity, xUnitVelocity);
        var angleInRadians  = temp - Math.atan2(1, 0);
        newEntity.angle = angleInRadians * 180 / Math.PI;
    }

}


function updateAnimatable(delta, newEntity, oldEntity) {

    newEntity.animation = isMoving(newEntity) ? 'walk' : 'idle';

}


// =============================================================================
// = Collision detection                                                       =
// =============================================================================


function detectAndHandleCollisions(entities) {

    for (var i = 1; i < entities.length; i++) {

        var e1 = entities[i];

        for (var j = 0; j < i; j++) {

            var e2 = entities[j];

            if (e1.newVersion._id === e2.newVersion._id)
            {
                return;
            }

            var dx = e2.newVersion.x - e1.newVersion.x;
            var dy = e2.newVersion.y - e1.newVersion.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100)
            {
                handleCollision(e1, e2);
            }
        }
    }

}


function handleCollision(entity1, entity2) {

    entity2.newVersion.x -= 100;

}


// =============================================================================
// = Utilities                                                                 =
// =============================================================================

function clamp(min, value, max) {

    if (value < min)
    {
        return min;
    }
    else if (value > max)
    {
        return max;
    }
    else
    {
        return value;
    }

}


function difference(newObject, oldObject) {

    var foundDifference = false;
    var difference = {};

    _.each(newObject, function (value, name) {

        if (value != oldObject[name])
        {
            foundDifference = true;
            difference[name] = value;
        }

    });

    if (foundDifference)
    {
        return difference;
    }

}


function isMoving(entity) {

    return entity.xVelocity != 0 || entity.yVelocity != 0;

}


Meteor.methods({

    reset: function () {

        Entities.remove({});

    }

});


// vim: set tabstop=8 softtabstop=0 expandtab shiftwidth=4 smarttab:
