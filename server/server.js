var lastUpdated;


Meteor.startup(function () {

    lastUpdated = Date.now() / 1000;

    var framesPerSecond = 30;

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


function updateEntity(delta, entity) {

    var xUnitVelocity = xDirectionToUnitVelocity(entity.xDirection);
    var yUnitVelocity = yDirectionToUnitVelocity(entity.yDirection);

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

    var pixelsPerSecond = 200;
    var speed = pixelsPerSecond * delta
    var xVelocity = speed * xNormalizedVelocity;
    var yVelocity = speed * yNormalizedVelocity;

    var x = entity.x + xVelocity;
    var y = entity.y + yVelocity;

    if (x < 0)
    {
        x = 0;
    }
    else if (x > WORLD_WIDTH)
    {
        x = WORLD_WIDTH;
    }

    if (y < 0)
    {
        y = 0;
    }
    else if (y > WORLD_HEIGHT)
    {
        y = WORLD_HEIGHT;
    }

    var isMoving = xVelocity !== 0 || yVelocity !== 0;

    var angle = entity.angle;

    if (isMoving)
    {
        var angleInRadians = Math.atan2(yUnitVelocity, xUnitVelocity) -
                Math.atan2(1, 0);

        angle = angleInRadians * 180 / Math.PI;
    }

    var animation;

    if (isMoving)
    {
        animation = 'walk';
    }
    else
    {

        animation = 'idle';
    }

    Entities.update(entity._id, {

        $set: {

            x: x,
            y: y,
            angle: angle,
            animation: animation,

        }
    });

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
