function Snowboarder(x, y) {
    var snowboarderSpriteSheetData = {
        images: ["images/snowboarder.png"],
        frames: {
            width: 151,
            height: 145,
            count: 140,
        },
        animations: {
            snowboarder_left: [0, 9],
            snowboarder_right: [10, 19],
            snowboarder_left_trick1: [20, 34, "snowboarder_left", 2],
            snowboarder_right_trick1: [35, 49, "snowboarder_right", 2],
            snowboarder_left_trick2: [50, 69, "snowboarder_left", 2],
            snowboarder_right_trick2: [70, 97, "snowboarder_right", 2],
            snowboarder_left_crash: [98, 119, false],
            snowboarder_right_crash: [121, 139, false]
        }
    };

    var snowboarderSpriteSheet = new createjs.SpriteSheet(snowboarderSpriteSheetData);
    var sprite = new createjs.Sprite(snowboarderSpriteSheet);
    this.view = sprite;
    this.view.gotoAndPlay("snowboarder_right");
    this.view.regX = this.view.regY = 0;
    this.view.label = new createjs.Text("", "12px Arial", "grey");
    stage.addChild(this.view.label);
    var radius = 17.5;
    this.view.okToDestory = false;

    var bodyDef = new b2d.b2BodyDef;
    var fixDef = new b2d.b2FixtureDef;
    var userData = sprite.userData;

    fixDef.density = 0.0;
    fixDef.friction = 0.0;
    fixDef.restitution = 0.0;

    var x = Math.floor((x * w) + 21);
    var y = 10;

    bodyDef.type = b2d.b2Body.b2_dynamicBody;
    bodyDef.position.x = p2m(x);
    bodyDef.position.y = p2m(y);

    fixDef.shape = new b2d.b2CircleShape(p2m(radius));

    bodyDef.userData = userData;
    this.view.body = world.CreateBody(bodyDef)
    this.view.body.CreateFixture(fixDef);

    var snowboarder = {
        fixDef: fixDef,
        bodyDef: bodyDef,
        body: this.view.body,
        sprite: sprite,
        spriteSheet: snowboarderSpriteSheet
    };
    this.view.body.userData = sprite.userData = snowboarder;

    var action;
    var i = 0;
    var frame_count = 9;
    var left = _.range(0, 9);
    var right = _.range(10, 19);
    var left_ollie = _.range(20, 34);
    var right_ollie = _.range(35, 49);
    var left_front_360 = _.range(50, 69);
    var right_front_360 = _.range(70, 97);
    var left_crash = _.range(98, 119);
    var right_crash = _.range(121, 139);


    this.view.tick = function (e) {

        this.x = this.body.GetPosition().x * SCALE - 70;
        this.y = this.body.GetPosition().y * SCALE - 120;

        var userData = this.body.userData;
        var sprite = userData.sprite;

        var direction;

        var velocity = Math.round(this.body.GetLinearVelocity().x * 100) / 100;
        (velocity < 0) ? direction = "left" : direction = "right"
        if (_action) {
            action = direction + _action
        } else {
            action = direction;
        }

        switch (action) {
            case "left":
                frame_count = 9;
                sprite.gotoAndPlay(left[i]);
                break;
            case "right":
                frame_count = 9;
                sprite.gotoAndPlay(right[i]);
                break;
            case "left_ollie":
                frame_count = 14;
                sprite.gotoAndPlay(left_ollie[i]);
                break;
            case "right_ollie":
                frame_count = 14;
                sprite.gotoAndPlay(right_ollie[i]);
                break;
            case "left_front_360":
                frame_count = 19;
                sprite.gotoAndPlay(left_front_360[i]);
                break;
            case "right_front_360":
                frame_count = 19;
                sprite.gotoAndPlay(right_front_360[i]);
                break;
            case "left_crash":
                frame_count = 18;
                sprite.gotoAndPlay(left_crash[i]);
                break;
            case "right_crash":
                frame_count = 18;
                sprite.gotoAndPlay(right_crash[i]);
                break;
            default:
                sprite.gotoAndPlay(left[i]);
        }
        i++;
        if (i >= frame_count) {
            i = 0;
            _action = null;
        }
        //this.rotation = 25.5;
        this.label.text = action.replace(/[\_]/g, ' ');
        this.label.x = this.x + 20;
        this.label.y = this.y;
    }

    createjs.Ticker.setFPS(10);
    createjs.Ticker.on("tick", this.view.tick, this.view);
}