/*GLOBALS*/
var start;
RESOLUTION = 1;
resize();
/*FONTS*/
fontDefine("Russo One");
/*CAMERA*/
var Camera = new CAMERA(Math.PI / 4, 0.1, 200);
/*ENGINE*/
var Engine = new GL_ENGINE(gl, "vertex-shader", "fragment-shader", [0, 0, 0, 1]);
/*PLAYER OBJECT*/
var player = (function() {
	player = {
		pos: {
			x: 0,
			y: 2,
			z: 0
		},
		prev: {
			x: 0,
			y: 0,
			z: 0
		},
		dir: {
			x: 0,
			y: 0,
			z: 1
		},
		looking: {
			x: 0,
			y: 0,
			z: 1
		},
		size: {
			x: 0.8,
			y: 2.0,
			z: 0.8
		},
		oFov: Math.PI / 3,
		fov: Math.PI / 3,
		yaw: 0,
		pitch: 0,
		oSpeed: 0.075,
		speed: 0.075,
		health: 100,
		score: 0
	};
	player.move = function() {
		//Jump
		//
		if(keys.SPACE && !this.dir.y) {
			this.dir.y = 0.2;
		}
		//Looking direction
		//
		this.looking = {
			x: 0,
			y: 0,
			z: 1
		};
		this.looking = Matrix.xVector(this.looking, Matrix.rotateX(-this.pitch).value);
		this.looking = Matrix.xVector(this.looking, Matrix.rotateY(-this.yaw).value);
		//Previous position
		//
		this.prev.x = this.pos.x;
		this.prev.y = this.pos.y;
		this.prev.z = this.pos.z;
		//Player movement via keys
		//
		if(keys.W || keys.UP) {
			this.pos.x += this.dir.x * this.speed;
			this.pos.z += this.dir.z * this.speed;
		}
		if(keys.S || keys.DOWN) {
			this.pos.x -= this.dir.x * this.speed;
			this.pos.z -= this.dir.z * this.speed;
		}
		if(keys.A || keys.LEFT) {
			this.pos.x += this.dir.z * this.speed;
			this.pos.z += -this.dir.x * this.speed;
		}
		if(keys.D || keys.RIGHT) {
			this.pos.x -= this.dir.z * this.speed;
			this.pos.z -= -this.dir.x * this.speed;
		}
		this.pos.y += this.dir.y;
		//Changes looking position based on mouse
		//
		this.yaw -= mouse.dx / 500;
		this.pitch -= mouse.dy / 500;
		if(this.pitch > Math.PI / 2 - 0.01) {
			this.pitch = Math.PI / 2 - 0.01;
		}
		if(this.pitch < -Math.PI / 2 + 0.01) {
			this.pitch = -Math.PI / 2 + 0.01;
		}
		//Changes direction based on where it's looking
		//
		this.dir.x = Math.sin(this.yaw);
		this.dir.z = Math.cos(this.yaw);
	};
	player.grav = function() {
		this.dir.y -= 0.01;
	};
	player.shoot = function() {
		//Allows shooting by mouse clicking
		//
		if(mouse.pressed) {
			if(mouse.button === "left") {
				CUBOID(Engine, this.pos.x + this.looking.x, this.pos.y + this.looking.y, this.pos.z + this.looking.z, 0.5, 0.1, 0.1, "bullet", TEXTURES.BULLET, 1, this.looking.x * 0.75, this.looking.y * 0.75, this.looking.z * 0.75);
			}
		}
		if(mouse.rightIsPressed) {
			this.fov -= (this.fov - this.oFov / 2) / 3;
			this.speed -= (this.speed - this.oSpeed / 2) / 3;
		} else {
			this.fov -= (this.fov - this.oFov) / 3;
			this.speed -= (this.speed - this.oSpeed) / 3;
		}
	};
	return player;
})();
/*TEXTURES*/
var palettes = [
	//Bullet
	//
	palette(color(255)),
	//Walls and floors
	//
	palette(color(25, 0, 50), color(155, 20, 155), color(55, 20, 155), color(185, 155, 225)),
	//Enemy
	//
	palette(color(255, 50, 50), color(100, 25, 25)),
	//Particle
	//
	palette(color(255, 50, 150), color(100, 25, 75)),
	//Box
	//
	palette(color(255, 255, 50), color(0), color(200, 200, 180))
];
var maps = [
	//Monochrome map
	//
	map("0"),
	//Floor map
	//
	map("3,1,1,1,1,1,1,2,1,2,2,2,2,2,2,3", 
	    "2,0,3,0,3,0,3,2,1,0,3,0,3,0,3,1", 
	    "2,3,0,3,0,3,0,2,1,3,0,3,0,3,0,1", 
	    "2,0,3,0,3,0,3,2,1,0,3,0,3,0,3,1", 
	    "2,3,0,3,0,3,0,2,1,3,0,3,0,3,0,1", 
	    "2,0,3,0,3,0,3,2,1,0,3,0,3,0,3,1", 
	    "2,3,0,3,0,3,0,2,1,3,0,3,0,3,0,1", 
	    "1,1,1,1,1,1,1,3,3,2,2,2,2,2,2,2", 
	    "2,2,2,2,2,2,2,3,3,1,1,1,1,1,1,1", 
	    "2,0,3,0,3,0,3,2,1,0,3,0,3,0,3,1", 
	    "2,3,0,3,0,3,0,2,1,3,0,3,0,3,0,1", 
	    "2,0,3,0,3,0,3,2,1,0,3,0,3,0,3,1", 
	    "2,3,0,3,0,3,0,2,1,3,0,3,0,3,0,1", 
	    "2,0,3,0,3,0,3,2,1,0,3,0,3,0,3,1", 
	    "2,3,0,3,0,3,0,2,1,3,0,3,0,3,0,1", 
	    "3,2,2,2,2,2,2,2,1,1,1,1,1,1,1,3"),
	//Enemy map
	//
	map("0,1", 
	"1,0"),
	//Box map
	//
	map("0,1,1,1,1,1,1,0", 
	    "1,2,2,2,2,2,2,1", 
	    "1,2,2,2,2,2,2,1", 
	    "1,2,2,2,2,2,2,1", 
	    "1,2,2,2,2,2,2,1", 
	    "1,2,2,2,2,2,2,1", 
	    "1,2,2,2,2,2,2,1", 
	    "0,1,1,1,1,1,1,0")
];
texture("BULLET", maps[0], palettes[0]);
texture("GROUND", maps[1], palettes[1]);
texture("ENEMY", maps[2], palettes[2]);
texture("PARTICLE", maps[2], palettes[3]);
texture("BOX", maps[3], palettes[4]);
/*GAME OBJECT FUNCTIONS*/
var enemies = {};

function Block() {
	if(player.pos.x > this.x - this.xl / 2 - player.size.x / 2 && player.pos.x < this.x + this.xl / 2 + player.size.x / 2 && player.pos.y > this.y - this.yl / 2 - player.size.y / 2 && player.pos.y < this.y + this.yl / 2 + player.size.y / 2 && player.pos.z > this.z - this.zl / 2 - player.size.z / 2 && player.pos.z < this.z + this.zl / 2 + player.size.z / 2) {
		if(player.pos.y < this.y + this.yl / 2 + player.size.y / 2 && player.prev.y >= this.y + this.yl / 2 + player.size.y / 2) {
			player.pos.y = this.y + this.yl / 2 + player.size.y / 2;
			player.dir.y = 0;
		} else if(player.pos.y > this.y - this.yl / 2 - player.size.y / 2 && player.prev.y <= this.y - this.yl / 2 - player.size.y / 2) {
			player.pos.y = this.y - this.yl / 2 - player.size.y / 2;
			player.dir.y = 0;
		} else if(player.pos.x > this.x - this.xl / 2 - player.size.x / 2 && player.prev.x <= this.x - this.xl / 2 - player.size.x / 2) {
			player.pos.x = this.x - this.xl / 2 - player.size.x / 2;
		} else if(player.pos.x < this.x + this.xl / 2 + player.size.x / 2 && player.prev.x >= this.x + this.xl / 2 + player.size.x / 2) {
			player.pos.x = this.x + this.xl / 2 + player.size.x / 2;
		} else if(player.pos.z > this.z - this.zl / 2 - player.size.z / 2 && player.prev.z <= this.z - this.zl / 2 - player.size.z / 2) {
			player.pos.z = this.z - this.zl / 2 - player.size.z / 2;
		} else if(player.pos.z < this.z + this.zl / 2 + player.size.z / 2 && player.prev.z >= this.z + this.zl / 2 + player.size.z / 2) {
			player.pos.z = this.z + this.zl / 2 + player.size.z / 2;
		}
		return true;
	}
	return false;
}

function Bullet() {
	//Sets orientation
	//
	if(!this.ay || !this.az) {
		let mag = Math.hypot(this.vx, this.vy, this.vz);
		this.ay = -Math.atan(this.vx / (this.vz ? this.vz : 0.001)) - Math.PI / 2;
		this.az = -Math.asin(-this.vy / mag);
		if(this.vz < 0) {
			this.ay = Math.PI + this.ay;
		}
	}
	//Velocity incrementation
	//
	this.x += this.vx;
	this.y += this.vy;
	this.z += this.vz;
	//Enemy killing
	let enems = Object.keys(enemies);
	for(let i = 0; i < enems.length; i++) {
		if((this.x - enemies[enems[i]].x) * (this.x - enemies[enems[i]].x) + (this.y - enemies[enems[i]].y) * (this.y - enemies[enems[i]].y) + (this.z - enemies[enems[i]].z) * (this.z - enemies[enems[i]].z) <= ((this.xl + this.yl + this.zl) / 3 + enemies[enems[i]].s / 1.75) * ((this.xl + this.yl + this.zl) / 3 + enemies[enems[i]].s / 1.75)) {
			enemies[enems[i]].kill = true;
			this.kill = true;
		}
	}
	//If time to be deleted
	//
	if((this.x - player.pos.x) * (this.x - player.pos.x) + (this.y - player.pos.y) * (this.y - player.pos.y) + (this.z - player.pos.z) * (this.z - player.pos.z) > 40 * 40) {
		this.kill = true;
		return true;
	}
	return false;
}

function Enemy() {
	if(!this.added) {
		this.added = Math.round(Math.random() * 999999).toString();
		enemies[this.added] = {
			x: this.x,
			y: this.y,
			z: this.z,
			s: (this.xl + this.yl + this.zl) / 3
		};
	} else {
		enemies[this.added].x = this.x;
		enemies[this.added].y = this.y;
		enemies[this.added].z = this.z;
		//Deletion
		//
		if(enemies[this.added].kill) {
			let size = Math.random() * 0.75 * enemies[this.added].s;
			for(let i = 0; i < Math.random() * 5 + 5; i++) {
				CUBOID(Engine, this.x, this.y, this.z, size, size, size, "particle", TEXTURES.PARTICLE, 1, Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2);
			}
			if(player.health) {
				player.score++;
			}
			this.kill = true;
			delete enemies[this.added];
		}
	}
	//Sets velocity
	//
	let velocity = {
		x: player.pos.x - this.x,
		y: player.pos.y - this.y,
		z: player.pos.z - this.z
	};
	let mag = Math.hypot(velocity.x, velocity.y, velocity.z);
	velocity.x /= mag * 30;
	velocity.y /= mag * 30;
	velocity.z /= mag * 30;
	this.vx = velocity.x;
	this.vy = velocity.y;
	this.vz = velocity.z;
	//Sets orientation
	//
	mag = Math.hypot(this.vx, this.vy, this.vz);
	this.ay = -Math.atan(this.vx / (this.vz ? this.vz : 0.001)) - Math.PI / 2;
	this.az = -Math.asin(-this.vy / mag);
	if(this.vz < 0) {
		this.ay = Math.PI + this.ay;
	}
	//Velocity incrementation
	//
	this.x += this.vx;
	this.y += this.vy;
	this.z += this.vz;
	//Health deduction
	//
	if(player.pos.x > this.x - this.xl / 2 - player.size.x / 2 && player.pos.x < this.x + this.xl / 2 + player.size.x / 2 && player.pos.y > this.y - this.yl / 2 - player.size.y / 2 && player.pos.y < this.y + this.yl / 2 + player.size.y / 2 && player.pos.z > this.z - this.zl / 2 - player.size.z / 2 && player.pos.z < this.z + this.zl / 2 + player.size.z / 2) {
		player.health -= 0.25;
	}
	if(!player.health) {
		this.kill = delete enemies[this.added];
	}
	return false;
}

function Particle() {
	//Timing
	//
	if(this.time <= 0) {
		this.kill = true;
	} else if(!this.time) {
		this.time = Math.random() * 25 + 25;
	} else {
		this.time--;
	}
	//Sets orientation
	//
	mag = Math.hypot(this.vx, this.vy, this.vz);
	this.ay = -Math.atan(this.vx / (this.vz ? this.vz : 0.001)) - Math.PI / 2;
	this.az = -Math.asin(-this.vy / mag);
	if(this.vz < 0) {
		this.ay = Math.PI + this.ay;
	}
	//Velocity incrementation
	//
	this.x += this.vx;
	this.y += this.vy;
	this.z += this.vz;
	return false;
}
/*LEVEL THINGS*/
var level = 1;
var scoreAtLev = [10, 5, 15, 7];

function clearAll() {
	Engine.objects = [];
}

function testLevChange() {
	if(player.score >= scoreAtLev[level - 1]) {
		return true;
	} else {
		return false;
	}
}
/*BINDINGS TO ENGINE*/
Engine.method("block", Block);
Engine.method("bullet", Bullet);
Engine.method("enemy", Enemy);
Engine.method("particle", Particle);
/*SETUP*/
function walls(s) {
	CUBOID(Engine, 0, -s / 20, 0, s, s / 10, s, "block", TEXTURES.GROUND, 1);
	CUBOID(Engine, 0, s + s / 20, 0, s, s / 10, s, "block", TEXTURES.GROUND, 1);
	CUBOID(Engine, 0, s / 2, -s / 2 - s / 20, s, s, s / 10, "block", TEXTURES.GROUND, 1);
	CUBOID(Engine, 0, s / 2, s / 2 + s / 20, s, s, s / 10, "block", TEXTURES.GROUND, 1);
	CUBOID(Engine, -s / 2 - s / 20, s / 2, 0, s / 10, s, s, "block", TEXTURES.GROUND, 1);
	CUBOID(Engine, s / 2 + s / 20, s / 2, 0, s / 10, s, s, "block", TEXTURES.GROUND, 1);
}

function lev1() {
	walls(10);
	CUBOID(Engine, 2.5, 4.5, 2.5, 5, 1, 5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -1.5, 2.5, 3.5, 3, 1, 3, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -4.0, 1, 0.0, 2, 2, 10, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -2.5, 6.5, -2.5, 5, 1, 5, "block", TEXTURES.BOX, 1);
}

function lev2() {
	walls(10);
	CUBOID(Engine, 3.75, 1.5, 3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 1.25, 1.5, 3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -1.25, 1.5, 3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -3.75, 1.5, 3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 3.75, 1.5, -3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 1.25, 1.5, -3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -1.25, 1.5, -3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -3.75, 1.5, -3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -3.75, 1.5, -1.25, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -3.75, 1.5, 1.25, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 3.75, 1.5, -1.25, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 3.75, 1.5, 1.25, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 3.75, 5.5, 3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 1.25, 5.5, 3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -1.25, 5.5, 3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -3.75, 5.5, 3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 3.75, 5.5, -3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 1.25, 5.5, -3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -1.25, 5.5, -3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -3.75, 5.5, -3.75, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -3.75, 5.5, -1.25, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, -3.75, 5.5, 1.25, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 3.75, 5.5, -1.25, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 3.75, 5.5, 1.25, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
	CUBOID(Engine, 0, 3.5, 0, 2.5, 1, 2.5, "block", TEXTURES.BOX, 1);
}

function reset() {
	player.health = 100;
	player.pos.x = 0;
	player.pos.y = 2;
	player.pos.z = 0;
	player.score = 0;
	title.innerHTML = "";
	clearAll();
	if(level === 1) {
		lev1();
	} else if(level === 2) {
		lev2();
	}
}
Engine.init();
var time = 0;
var info = document.getElementById("info");
var title = document.getElementById("title");
var health = document.getElementById("controls");
//Suggested by Fodd Gack
//
if(window.innerWidth >= 1200) {
	document.getElementById("info").style.paddingBottom = "0px";
}
lev1();
/*GAME LOOP*/
function game() {
	Engine.run(Camera);
	Camera.FollowFPS(player);
	//Controls
	//
	if(start || player.health) {
		player.move();
		player.shoot();
	}
	player.grav();
	info.style.backgroundColor = "rgba(255,0,0," + (100 - player.health) / 255 + ")";
	//Enemy generation
	//
	if(Object.keys(enemies)
		.length <= 5 && time % 100 === 0 && start) {
		CUBOID(Engine, Math.random() * 10 - 5, Math.random() * 10, Math.random() * 10 - 5, 0.5, 0.5, 0.5, "enemy", TEXTURES.ENEMY, 1);
	}
	if(mouse.pressed && !start) {
		start = true;
	} else if(start) {
		time++;
		health.innerHTML = "HEALTH : " + Math.round(player.health * 100) / 100 + "%<br />" + "SCORE : " + player.score;
	}
	if(testLevChange()) {
		level++;
		reset();
	}
	//Health stats
	//
	if(player.health <= 0) {
		player.health = 0;
		title.innerHTML = "GAME OVER";
		health.innerHTML = "PRESS R TO RESTART<br>" + "SCORE : " + player.score;
		if(keys.R) {
			reset();
		}
	}
	mouse.reset();
	requestAnimationFrame(game);
}
game();
