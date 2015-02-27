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

    var oldEntities = Entities.find().fetch();

    var entities = [];

    oldEntities.forEach(function (oldVersion) {
        entities.push({
            oldVersion: oldVersion,
            newVersion: updateEntity(delta, oldVersion, oldEntities)
        });
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


function updateEntity(delta, oldEntity, oldEntities) {

    var newEntity = _.clone(oldEntity);

    if (oldEntity.isMovable)
    {
        updateMovable(delta, newEntity, oldEntity);
    }

    if (oldEntity.isAnimatable)
    {
        updateAnimatable(delta, newEntity, oldEntity);
    }

    if (oldEntity.isAi)
    {
        updateAi(delta, newEntity, oldEntity, oldEntities);
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


function updateAi(delta, newEntity, oldEntity, oldEntities) {

    if (newEntity.type !== 'monster') {
        return;
    }

    oldEntities.forEach(function(entity) {
        if (entity.type === 'player')
        {
            var dX = entity.x - newEntity.x;
            var dY = entity.y - newEntity.y;
            var distance = Math.sqrt(dX * dX + dY * dY);
            if (distance === 0) {
                return;
            }
            var normalisedDx = dX / distance;
            var normalisedDy = dY / distance;
            var temp = Math.atan2(normalisedDy, normalisedDx);
            newEntity.angle = (temp - Math.atan2(1, 0)) * 180 / Math.PI;
            newEntity.x += dX / distance * 2;
            newEntity.y += dY / distance * 2;
            return;
        }
    });

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

            if (distance < TILE_SIZE_PX)
            {
                handleCollision(e1, e2);
            }
        }
    }

}


function handleCollision(entity1, entity2) {

    var shiftX;
    var shiftY;
    diffX = entity2.newVersion.x - entity1.newVersion.x;
    if (diffX < 0) {
        shiftX = -1;
    }
    else if (diffX > 0)
    {
        shiftX = 1;
    }
    else
    {
        shiftX = Math.random() < 0.5 ? 1 : -1;
    }

    diffY = entity2.newVersion.y - entity1.newVersion.y;
    if (diffY < 0) {
        shiftY = -1;
    }
    else if (diffY > 0)
    {
        shiftY = 1;
    }
    else
    {
        shiftY = Math.random() < 0.5 ? 1 : -1;
    }
    entity2.newVersion.x += shiftX * TILE_SIZE_PX / 4;
    entity2.newVersion.y -= shiftY * TILE_SIZE_PX / 4;

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


Meteor.methods({

    reset: function () {

        Entities.remove({});

    }

});


// vim: set tabstop=8 softtabstop=0 expandtab shiftwidth=4 smarttab:
