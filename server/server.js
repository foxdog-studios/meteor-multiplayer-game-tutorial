var lastUpdated;


Meteor.startup(function () {

    lastUpdated = Date.now() / 1000;

    var framesPerSecond = 15;

    var millisecondsPerFrame = 1000 / framesPerSecond;

    Meteor.setInterval(update, millisecondsPerFrame);

});


function update() {

    var now = Date.now() / 1000;

    var delta = now - lastUpdated;

    Entities.find().forEach(function (entity) {

        updateEntity(delta, entity)

    });

    lastUpdated = now;

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

    Entities.update(oldEntity._id, newEntity);

}


function updateMovable(delta, newEntity, oldEntity) {

    var xUnitVelocity = xDirectionToUnitVelocity(oldEntity.xDirection);
    var yUnitVelocity = yDirectionToUnitVelocity(oldEntity.yDirection);

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
    newEntity.xVelocity = speed * xNormalizedVelocity;
    newEntity.yVelocity = speed * yNormalizedVelocity;

    var x = newEntity.x + newEntity.xVelocity;
    var y = newEntity.y + newEntity.yVelocity;
    newEntity.x = clamp(0, x, WORLD_WIDTH);
    newEntity.y = clamp(0, y, WORLD_HEIGHT);

    if (isMoving(newEntity))
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


function isMoving(entity) {

    return entity.xVelocity != 0 || entity.yVelocity != 0;

}


function xDirectionToUnitVelocity(xDirection) {

    switch (xDirection)
    {
        case LEFT:
            return -1;

        case RIGHT:
            return 1;

        case null:
            return 0;

        default:
            throw new Error('invalid xDirection: ' + xDirection);
    }

}


function yDirectionToUnitVelocity(yDirection) {

    switch (yDirection)
    {
        case UP:
            return -1;

        case DOWN:
            return 1;

        case null:
            return 0;

        default:
            throw new Error('invalid yDirection: ' + yDirection);
    }

}

// vim: set tabstop=8 softtabstop=0 expandtab shiftwidth=4 smarttab:
