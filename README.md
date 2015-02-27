Meteor Multiply Game Tutorial
=============================

Setup
-----

1. Download Meteor

2. Install Atom from https://atom.io

3. Install the `atom-terminal` package

4. Download the source code from http://bit.ly/1JU0voF

5. Extract the ZIP archive into your Documents folder


Entity traits
-------------

### Movable

    entity.isMovable = true

    // Required
    entity.x: Number
    entity.y: Number
    entity.xDirection: {LEFT, RIGHT, null}
    entity.yDirection: {UP, DOWN, null}
    entity.speed: Number

    // Set by server
    entity.x: Number
    entity.y: Number
    entity.xVelocity: Number
    entity.yVelocity: Number
    entity.angle: Number

