var b2d = {
    b2Vec2: Box2D.Common.Math.b2Vec2,
    b2BodyDef: Box2D.Dynamics.b2BodyDef,
    b2Body: Box2D.Dynamics.b2Body,
    b2FixtureDef: Box2D.Dynamics.b2FixtureDef,
    b2Fixture: Box2D.Dynamics.b2Fixture,
    b2World: Box2D.Dynamics.b2World,
    b2MassData: Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape: Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw: Box2D.Dynamics.b2DebugDraw,
    b2Listener: Box2D.Dynamics.b2ContactListener,
};

var canvas, context, stage, world, w, h;
var objectsToDestroy = new Array();
var DEBUG = "debug" in urlParams;

// Constants
var SCALE = 32;
var GRAVITY = 100;
var DROP_INTERVAL_MS = 1000;

var _action;

function init() {
    stage = new createjs.Stage("canvas");
    context = document.getElementById('canvas').getContext('2d');

    w = stage.canvas.width;
    h = stage.canvas.height;

    stage.addEventListener('stagemousedown', mouseDown);

    setupPhysics();

    createjs.Ticker.addEventListener("tick", handleTick);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.useRAF = true;
}

function mouseDown(event) {
    createSnowboarder(event.stageX, event.stageY);
}


function actionSelect(action){
	_action = "_"+action;
}
function p2m(x) {
    return x / SCALE;
}

function createTerrain(world, fixDef) {

    var bodyDef = new b2d.b2BodyDef();
    bodyDef.type = b2d.b2Body.b2_staticBody;
    bodyDef.userData = 'polygon'

    // place the first point, "pointA" in the upper left hand corner.
    var pointA = new b2d.b2Vec2(0.0 / SCALE, 0.0 / SCALE);

    // point to the second point, "pointB" about a third from the left and the bottom
    var pointB = new b2d.b2Vec2((w / 3) / SCALE, h / SCALE * 2);

    var pointC = new b2d.b2Vec2(700 / SCALE, 150 / SCALE);
    var pointD = new b2d.b2Vec2(800 / SCALE, 0.0 / SCALE);

    var x1 = pointA.x;
    var y1 = pointA.y
    var x2, y2;
    var i;

    bodyDef.position.Set(x1, y1);

    // create 100 points

    var curve = world.CreateBody(bodyDef);
    for (i = 0; i < 1.01; i += 0.01) {

        var ax = Math.pow((1 - i), 3) * pointA.x;
        var ay = Math.pow((1 - i), 3) * pointA.y;
        var bx = 3 * i * Math.pow((1 - i), 2) * pointB.x;
        var by = 3 * i * Math.pow((1 - i), 2) * pointB.y;
        var cx = 3 * Math.pow(i, 2) * (1 - i) * pointC.x;
        var cy = 3 * Math.pow(i, 2) * (1 - i) * pointC.y;
        var dx = Math.pow(i, 3) * pointD.x;
        var dy = Math.pow(i, 3) * pointD.y;

        x2 = ax + bx + cx + dx;
        y2 = ay + by + cy + dy;

        var edgeShape = new b2d.b2PolygonShape();
        edgeShape.SetAsEdge(new b2d.b2Vec2(x1, y1), new b2d.b2Vec2(x2, y2));
        curve.CreateFixture2(edgeShape);

        x1 = x2;
        y1 = y2;
    }
}

function createSnowboarder() {
    removeSnowboarders();
    var snowboarder = new Snowboarder(0, 0);
    stage.addChild(snowboarder.view);
    objectsToDestroy.push(snowboarder);
}

function removeSnowboarders() {
    while (objectsToDestroy.length) {
        var snowboarder = objectsToDestroy.pop();
        world.DestroyBody(snowboarder.view.body);
        stage.removeChild(snowboarder.view.label);
        stage.removeChild(snowboarder.view);
    }
}

function setupPhysics() {
    world = new b2d.b2World(new b2d.b2Vec2(0, GRAVITY), true); //gravity, allow sleep

    var fixDef = new b2d.b2FixtureDef;
    fixDef.density = 0.0;
    fixDef.friction = 0.0;
    fixDef.restitution = 0.0;

    createTerrain(world, fixDef);

    //setup debug draw
    var debugDraw = new b2d.b2DebugDraw();
    debugDraw.SetSprite(stage.canvas.getContext("2d"));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2d.b2DebugDraw.e_shapeBit | b2d.b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);
};


function draw() {
    context.clearRect(0, 0, w, h);
    var body = world.GetBodyList();
    while (body) {
        if (body.GetType() == 0) {
            var fixture = body.GetFixtureList();
            while (fixture) {
                context.beginPath();
                var vs = fixture.GetShape().GetVertices();
                for (var i = 0; i < vs.length; i++) {
                    var x = vs[i].x * SCALE
                    var y = vs[i].y * SCALE
                    if (i == 0) {
                        context.moveTo(x, y)
                    } else {
                        context.lineTo(x, y);
                    }
                }
                context.stroke();
                fixture = fixture.GetNext();
            }
        }
        body = body.GetNext();
    }
}

function handleTick() {
    world.Step(1 / 60, 10, 10); //frame-rate,velocity iterations,position iterations
    if (DEBUG) { world.DrawDebugData(); } else{ draw(); }
    world.ClearForces();
    stage.autoClear = false;
    stage.update();
}