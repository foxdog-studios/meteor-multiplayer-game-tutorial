var lastUpdated;


Meteor.startup(function () {
    Entities.remove({});


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

    detectAndHandleCollisions(_.pluck(entities, 'newVersion'));

    entities.forEach(function (entity) {

        var diff = difference(entity.newVersion, entity.oldVersion);

        if (diff)
        {
            //console.log(diff);
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

    return entity.xDirection != 0 || entity.yDirection != 0;

}


// vim: set tabstop=8 softtabstop=0 expandtab shiftwidth=4 smarttab:
