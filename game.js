var game;
var pill;
var ball;
var player;
var sounds = new Array();
sounds[0] = new Audio('jump.mp3');


$(document).ready(function () {

    $("#divMenuBig").fadeIn("slow");
    $("#btnIniciar").click(function () {
        game = new Game();
        game.start();

        $("#divMenuBig").fadeOut("fast");
        $("#divModal").fadeOut("fast");

        document.body.addEventListener("keydown", function (e) {
            game.keys[e.keyCode] = true;
            e.preventDefault();
            return false;
        });
        document.body.addEventListener("keyup", function (e) {
            game.keys[e.keyCode] = false;
            e.preventDefault();
            return false;
        });
    });


});

var TO_RADIANS = Math.PI / 180; 
function drawRotatedImage(image, x, y, angle) {
    // save the current co-ordinate system 
    // before we screw with it
    game.ctx.save();

    // move to the middle of where we want to draw our image
    game.ctx.translate(x, y);

    // rotate around that point, converting our 
    // angle from degrees to radians 
    game.ctx.rotate(angle * TO_RADIANS);

    // draw it up and to the left by half the width
    // and height of the image 
    game.ctx.drawImage(image, -(image.width / 2), -(image.height / 2));

    // and restore the co-ords to how they were when we began
    game.ctx.restore();
}


function canvas_OnClick(e) {
    var clickAcceleration = 10;

    if (e.offsetX < (player.pos.x))
        player.velocity.x -= clickAcceleration + ((player.pos.x - e.offsetX) / 10);
    else if (e.offsetX > (player.pos.x + player.img.width))
        player.velocity.x += clickAcceleration + ((e.offsetX - player.pos.x) / 10);

    if (e.offsetY < (player.pos.y))
        player.velocity.y -= clickAcceleration + ((player.pos.y - e.offsetY) / 8);
    else if (e.offsetY > (player.pos.y + player.img.height))
        player.velocity.y += clickAcceleration + ((e.offsetY - player.pos.y) / 8);
	
	sounds[0].play();
}


/* Game Class --------------------------------------------------------------------------------------------- */

function Game() {
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.score = 0;
    this.startTime = Date.now();
    this.lblscore = document.getElementById("lblscore");
    this.lbltimer = document.getElementById("lbltimer");
    this.pSetTimeout;

    this.keys = [];
    this.componentList = [];
}

Game.prototype.start = function () {
    //pill = new Pill();
    //this.addComponent(pill);

    player = new Player();
    this.addComponent(player);

    ball = new Ball();
    this.addComponent(ball);

    //this.addComponent(new MagicEffect(pill.pos));

    this.canvas.addEventListener("click", canvas_OnClick, false);
    //this.addComponent(new MagicEffect(player.pos));
    this.update();
}


Game.prototype.addComponent = function (c) {
    this.componentList[this.componentList.length] = c;
}

Game.prototype.update = function (c) {
    for (i = 0; i < game.componentList.length; i++) {
        if (game.componentList[i].update && game.componentList[i].alive)
            game.componentList[i].update();
    }

    this.draw();

    for (i = 0; i < game.componentList.length; i++) {
        if (game.componentList[i].draw && game.componentList[i].alive)
            game.componentList[i].draw();
    }

    game.pSetTimeout = window.setTimeout("game.update()", 16); //~60 ciclos per sec
}

Game.prototype.EndGame = function () {
    window.clearTimeout(pSetTimeout);
}


Game.prototype.ElapsedTime = function () {
    return Math.ceil((Date.now() - this.startTime)/1000);
}

Game.prototype.TimeLeft = function () {
    return 30 - this.ElapsedTime();
}

Game.prototype.draw = function (c) {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.ctx.beginPath();
    game.ctx.stroke();
}


/* Player Class ------------------------------------------------------------------------------------ */

function Player() {
    this.pos = new Object();
    this.pos.x = new Number(50);
    this.pos.y = new Number(420);

    this.frames = [];
    this.frames[0] = new Image;
    this.frames[0].src = "player_00.png";

    this.frames[1] = new Image;
    this.frames[1].src = "player_01.png";

    this.frames[2] = new Image;
    this.frames[2].src = "player_02.png";
    this.currentFrame = 0;
    this.frameTimer = Date.now();

    this.img = this.frames[0];

    this.velocity = new Object();
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.friction = 0.90;
    this.velocity.maxspeed = 10;
    this.velocity.acceleration = 0.25;

    this.alive = true
}


Player.prototype.update = function () {

    if (game.keys[40] && this.velocity.y < this.velocity.maxspeed)
        this.velocity.y = this.velocity.y + this.velocity.acceleration;

    if (game.keys[39] && this.velocity.x < this.velocity.maxspeed)
        this.velocity.x = this.velocity.x + this.velocity.acceleration;

    if (game.keys[37] && this.velocity.x > -this.velocity.maxspeed)
        this.velocity.x = this.velocity.x - this.velocity.acceleration;


    if (game.keys[38] && this.pos.y >= 420) {
        this.velocity.y = this.velocity.y - this.velocity.acceleration*100;
        sounds[0].play();
    }

    if (this.pos.y < 420)
        this.velocity.y = this.velocity.y + this.velocity.acceleration*5;

    // apply friction
    this.velocity.y *= this.velocity.friction - 0.05;
    this.pos.y += this.velocity.y;

    this.velocity.x *= this.velocity.friction;
    this.pos.x += this.velocity.x;

    // apply moviment
    if (this.pos.y < 0)
        this.pos.y = 0;
    else if (this.pos.y > 420) //game.canvas.height - this.img.height)
        this.pos.y = 420; //game.canvas.height - this.img.height;

    if (this.pos.x < 0)
        this.pos.x = 0;
    else if (this.pos.x > game.canvas.width - this.img.width)
        this.pos.x = game.canvas.width - this.img.width;

    //Apply frames
    if (Date.now() - this.frameTimer > 70) {
        this.frameTimer = Date.now();
        if (this.velocity.y > 1 || this.velocity.x > 1 ||
            this.velocity.y < -1 || this.velocity.x < -1) {
            this.currentFrame++;

            if (this.currentFrame > 2)
                this.currentFrame = 0;

            this.img = this.frames[this.currentFrame];
        }
        else {
            this.img = this.frames[0];
        }
    }
}

Player.prototype.draw = function () {
    game.ctx.drawImage(this.img, this.pos.x, this.pos.y);
}


/* Pill Class ------------------------------------------------------------------------------------ */

function Pill() {
    this.pos = new Object();
    this.pos.x = new Number(0);
    this.pos.y = new Number(0);

    this.img = new Image
    this.img.src = "player/pill2.png";
    this.angle = 0;

    this.alive = true;
    this.respawn();
}

Pill.prototype.respawn = function () {
    this.angle = 0;
    this.pos.x = new Number(Math.random() * (game.canvas.width - this.img.width));
    this.pos.y = new Number(Math.random() * (game.canvas.height - this.img.height));

    if (this.pos.x < this.img.width + 10)
        this.pos.x = this.img.width + 10;

    if (this.pos.y < this.img.height + 10)
        this.pos.y = this.img.height + 10;
}

Pill.prototype.update = function () {
    this.angle++;
    if (this.angle > 360)
        this.angle = 0;
}

Pill.prototype.draw = function () {
    //game.ctx.drawImage(pill.img, pill.pos.x, pill.pos.y);
    drawRotatedImage(this.img, this.pos.x, this.pos.y, this.angle);
}


/* Ball Class --------------------------------------------------------------------------------------------- */

function Ball() {
    this.pos = new Object();
    this.pos.x = new Number(0);
    this.pos.y = new Number(0);
    this.angle = 0;

    this.img = new Image
    this.img.src = "bola.png";
    this.alive = true;

    this.velocity = new Object();
    this.velocity.x = 5;
    this.velocity.y = -5;
    this.velocity.friction = 0.98;
    this.velocity.maxspeed = 10;
    this.velocity.acceleration = 2;

    this.respawn();
}

Ball.prototype.respawn = function () {
    this.velocity.x =new Number(Math.random() * 15);
    this.velocity.y = -5;
    this.pos.x = new Number(Math.random() * (game.canvas.width - this.img.width));
    this.pos.y = 150; //new Number(Math.random() * (game.canvas.height - this.img.height));
}

Ball.prototype.update = function () {
    if (

    //check colision x
                ((player.pos.x) > this.pos.x && (player.pos.x) < (this.pos.x + this.img.width) ||
                 (player.pos.x + player.img.width) > this.pos.x && (player.pos.x + player.img.width) < (this.pos.x + this.img.width)
                )

                 &&

    //check colision y
                ((player.pos.y) > this.pos.y && (player.pos.y) < (this.pos.y + this.img.height) ||
                 (player.pos.y + player.img.height) > this.pos.y && (player.pos.y + player.img.height) < (this.pos.y + this.img.height)
                )

    ) {
        this.velocity.x += player.velocity.x * 2;
        this.velocity.y += player.velocity.y * 2 + 10;
    }

    if (this.pos.y < 580)
        this.velocity.y = this.velocity.y + this.velocity.acceleration*0.1;

    // apply some friction to y velocity.
    this.velocity.y *= this.velocity.friction;
    this.pos.y += this.velocity.y;

    // apply some friction to x velocity.
    this.velocity.x *= 0.99;//this.velocity.friction;
    this.pos.x += this.velocity.x;

    // apply moviment
    if (this.pos.y < 0) {
        this.pos.y = 0;
        this.velocity.y = this.velocity.y * -1;
    }
    else if (this.pos.y > game.canvas.height - this.img.height) {
        this.pos.y = game.canvas.height - this.img.height;
        this.velocity.y = this.velocity.y * -1;
    }

    if (this.pos.x < 0) {
        this.pos.x = 0;
        this.velocity.x = this.velocity.x * -1;
    }
    else if (this.pos.x > game.canvas.width - this.img.width) {
        this.pos.x = game.canvas.width - this.img.width;
        this.velocity.x = this.velocity.x * -1;
    }

    if (this.velocity.x > 0.1 || this.velocity.x < -0.1 || this.velocity.y > 0.1 || this.velocity.y < -0.1) {
        var ang = Math.ceil( Math.abs(this.velocity.x) + Math.abs(this.velocity.y));
        this.angle += Math.abs(this.velocity.x) + Math.abs(this.velocity.y);
    }
}

Ball.prototype.draw = function () {
    //game.ctx.drawImage(ball.img, ball.pos.x, ball.pos.y);
    drawRotatedImage(this.img, this.pos.x, this.pos.y, this.angle);
}


/* Magic Effect Class ------------------------------------------------------------------------------------ */

function MagicEffect(position) { 
    this.pos = new Object();
    this.pos.x = position.x;
    this.pos.y = position.y;

    this.frames = [];

    this.frames[0] = new Image;
    this.frames[0].src = "player/me_06.png";

    this.frames[1] = new Image;
    this.frames[1].src = "player/me_05.png";

    this.frames[2] = new Image;
    this.frames[2].src = "player/me_04.png";

    this.frames[3] = new Image;
    this.frames[3].src = "player/me_03.png";

    this.frames[4] = new Image;
    this.frames[4].src = "player/me_02.png";

    this.frames[5] = new Image;
    this.frames[5].src = "player/me_01.png";

    this.frames[6] = new Image;
    this.frames[6].src = "player/me_00.png";

    this.frames[7] = new Image;
    this.frames[7].src = "player/me_01.png";

    this.frames[8] = new Image;
    this.frames[8].src = "player/me_02.png";

    this.frames[9] = new Image;
    this.frames[9].src = "player/me_03.png";

    this.frames[10] = new Image;
    this.frames[10].src = "player/me_04.png";

    this.frames[11] = new Image;
    this.frames[11].src = "player/me_05.png";

    this.frames[12] = new Image;
    this.frames[12].src = "player/me_06.png";

    this.currentFrame = 0;
    this.angle = 0;
    this.frameTimer = Date.now();

    this.img = this.frames[this.currentFrame];
    this.alive = true;
}

MagicEffect.prototype.update = function () {
    if (Date.now() - this.frameTimer > 30 && this.currentFrame < this.frames.length) {
        this.frameTimer = Date.now();
        this.currentFrame++;

        this.img = this.frames[this.currentFrame];
    }
}

MagicEffect.prototype.draw = function () {
    if (typeof this.img != "undefined")
        game.ctx.drawImage(this.img, this.pos.x, this.pos.y);
}
