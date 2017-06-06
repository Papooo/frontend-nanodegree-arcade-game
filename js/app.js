// Enemies our player must avoid
var Enemy = function(x, y, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = x;
    this.y = y;
    this.speed = speed;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    this.x = this.x < document.querySelector('canvas').width ? Math.round(this.x + 50 * dt * this.speed) : -100;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(sprite, role) {
    this.sprite = sprite;
    this.kissExperience = 0;
    this.role = role;
    this.setPosition();
};

Player.prototype.update = function() {
  allEnemies.forEach(function (currentValue, index, array) {
    if (this.x > currentValue.x && this.x < currentValue.x + 50 && this.y < currentValue.y && this.y > currentValue.y - 80) {
        this.setPosition();
        this.kissExperience -= 10;
    }
  }, this);
};

Player.prototype.setPosition = function() {
    if (this.role === 'princess') {
        this.x = 0;
        this.y = 83 * 5 - 41;
    } else {
        this.x = 101 * 4;
        this.y = 83 * 5 - 41;
    }
}

Player.prototype.render = function() {
    if (this.role === 'princess') {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    } else {
        ctx.drawImage(Resources.get('images/char-boy.png'), this.x, this.y);
    }
};

Player.prototype.kiss = function(player1, player2) {
    if (player1.x === player2.x && player1.y === player2.y) {
        console.log('KISS');
        ctx.font = "3em serif";
        ctx.fillStyle = 'red';
        ctx.fillText('KISS', document.querySelector('canvas').width / 2, document.querySelector('canvas').height / 2);
        if (player1.role === 'admirer') {
            player1.kissExperience++;
        } else {
            player2.kissExperience++;
        }
    }

};

Player.prototype.handleInput = function(direction) {
  if (direction === 'left' && this.x > 0){
    this.x -= 101;
  }
  if (direction === 'right' && this.x < document.querySelector('canvas').width - 200) {
    this.x += 101;
  };
  if (direction === 'up' && this.y > 0) {
    this.y -= 83;
  };
  if (direction === 'down' && this.y < document.querySelector('canvas').height - 250) {
    this.y += 83;
  };

};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [new Enemy(0, 60, 1), new Enemy(101, 140, 2), new Enemy(202, 220, 3), new Enemy(303, 140, 4), new Enemy(404, 60, 5)];
// Place the player object in a variable called player
var player1;
var player2;


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeysP1 = {
        ArrowLeft: 'left',
        ArrowUp: 'up',
        ArrowRight: 'right',
        ArrowDown: 'down'
    };
    var allowedKeysP2 = {
        a: 'left',
        w: 'up',
        d: 'right',
        s: 'down'
    };

    player1.handleInput(allowedKeysP1[e.key]);
    player2.handleInput(allowedKeysP2[e.key]);
});
