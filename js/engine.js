/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */
var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        gameMatchStartTime,
        now,
        matchPlayingTime = 10000,
        pointsToWin = 50;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function startGame() {
        // Draw start screen
        ctx.fillStyle = "#6C8E7E";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "1.2em sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#FCD1B1";
        ctx.fillText("^", canvas.width / 2, 28);
        ctx.fillText("~~", canvas.width / 2, 32);
        ctx.fillText("(*v*)", canvas.width / 2, 45);
        ctx.fillText("((   ))", canvas.width / 2, 65);
        ctx.fillText("^^", canvas.width / 2, 83);
        ctx.fillText("Parrot Games", canvas.width / 2, 100);
        ctx.font = "1.5em sans-serif";
        ctx.fillText("Funny game for 2", canvas.width / 2, 205);
        ctx.font = "3em georgia";
        ctx.fillStyle = "#F69B9A";
        ctx.fillText("Kiss Princess :-*", canvas.width / 2, 260);
        ctx.font = "1em sans-serif";
        ctx.fillStyle = "#FCD1B1";
        ctx.fillText("Click to START the game", canvas.width / 2, 310);
        ctx.font = "1em sans-serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "#fff";
        ctx.fillText("PLAYER 1: left A , up W, right D, down S", 30, canvas.height - 60);
        canvas.addEventListener('click', selectHeroes);
        ctx.fillText("PLAYER 2: arrow left, arrow up , arrow right, arrow down", 30, canvas.height - 30);
    }

    // 2 Players game
    function selectHeroes() {
        var heroes = [
                'images/char-green-princess.png',
                'images/char-horn-girl.png',
                'images/char-pink-girl.png',
                'images/char-princess-girl.png',
                'images/char-cat-girl.png',
                'images/char-princess-poor.png'
            ],
            numRows = 6,
            numCols = 5,
            row, col;
        canvas.removeEventListener('click', selectHeroes);

        // Draw all princesses for player 1 to choose
        ctx.fillStyle = "#6C8E7E";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(heroes[row]), col * 101, row * 83);
            }
        }
        ctx.font = "1.3em sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#FCD1B1";
        ctx.fillText('Select Princess for Player 1', canvas.width / 2, 30);

        canvas.addEventListener('click', heroType1);

        // Handle princess selection for Player 1
        function heroType1(event) {
            if (event.offsetY < (canvas.height - 108) / 6 + 54) {
                player1 = new Player(heroes[0], 'admirer');
            } else if (event.offsetY < (canvas.height - 108) / 6 * 2 + 54) {
                player1 = new Player(heroes[1], 'admirer');
            } else if (event.offsetY < (canvas.height - 108) / 6 * 3 + 54) {
                player1 = new Player(heroes[2], 'admirer');
            } else if (event.offsetY < (canvas.height - 108) / 6 * 4 + 54) {
                player1 = new Player(heroes[3], 'admirer');
            } else if (event.offsetY < (canvas.height - 108) / 6 * 5 + 54) {
                player1 = new Player(heroes[4], 'admirer');
            } else {
                player1 = new Player(heroes[5], 'admirer');
            }

            canvas.removeEventListener('click', heroType1);

            // Draw princesses for Player 2 to choose
            ctx.fillStyle = "#6C8E7E";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (row = 0; row < numRows; row++) {
                for (col = 0; col < numCols; col++) {
                    ctx.drawImage(Resources.get(heroes[row]), col * 101, row * 83);
                }
            }
            ctx.fillStyle = "#FCD1B1";
            ctx.fillText('Select Princess for Player 2', canvas.width / 2, 30);
            canvas.addEventListener('click', heroType2);
        }

        // Handle princess selection for Player 2
        function heroType2(event) {
            if (event.offsetY < (canvas.height - 108) / 6 + 54) {
                player2 = new Player(heroes[0], 'princess');
            } else if (event.offsetY < (canvas.height - 108) / 6 * 2 + 54) {
                player2 = new Player(heroes[1], 'princess');
            } else if (event.offsetY < (canvas.height - 108) / 6 * 3 + 54) {
                player2 = new Player(heroes[2], 'princess');
            } else if (event.offsetY < (canvas.height - 108) / 6 * 4 + 54) {
                player2 = new Player(heroes[3], 'princess');
            } else if (event.offsetY < (canvas.height - 108) / 6 * 5 + 54) {
                player2 = new Player(heroes[4], 'princess');
            } else {
                player2 = new Player(heroes[5], 'princess');
            }
            canvas.removeEventListener('click', heroType2);
            init();
        }
    }

    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        now = Date.now();
        var dt = (now - lastTime) / 1000.0;
        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        // Check if someone won already
        if (player1.kissExperience < pointsToWin && player2.kissExperience < pointsToWin) {
            // No one won - continue game
            // Check if it is time to revert player roles
            if (now - gameMatchStartTime < matchPlayingTime) {
                // Continue game
                update(dt);
                render();
                player1.kiss(player1, player2);
                lastTime = now;

                /* Use the browser's requestAnimationFrame function to call this
                 * function again as soon as the browser is able to draw another frame.
                 */
                win.requestAnimationFrame(main);
                // Time to change roles
            } else {
                player1.role = player1.role === 'princess' ? 'admirer' : 'princess';
                player2.role = player2.role === 'princess' ? 'admirer' : 'princess';
                init();
            }
            // Player 2 WINS
        } else if (player1.kissExperience < pointsToWin) {
            ctx.fillStyle = "#6C8E7E";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "3em sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#F69B9A";
            ctx.fillText("Player 2 wins!", canvas.width / 2, canvas.height / 3);
            ctx.font = "1em sans-serif";
            ctx.fillStyle = "#FCD1B1";
            ctx.fillText("Reload the page (F5) to start new game", canvas.width / 2, (canvas.height / 3) * 2);
            // Player 1 WINS
        } else {
            ctx.fillStyle = "#6C8E7E";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "3em sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#F69B9A";
            ctx.fillText("Player 1 wins!", canvas.width / 2, canvas.height / 3);
            ctx.font = "1em sans-serif";
            ctx.fillStyle = "#FCD1B1";
            ctx.fillText("Reload the page (F5) to start new game", canvas.width / 2, (canvas.height / 3) * 2);
        }
        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        gameMatchStartTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player1.update();
        player2.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png', // Top row is water
                'images/stone-block.png', // Row 1 of 3 of stone
                'images/stone-block.png', // Row 2 of 3 of stone
                'images/stone-block.png', // Row 3 of 3 of stone
                'images/grass-block.png', // Row 1 of 2 of grass
                'images/grass-block.png' // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        ctx.font = "1em sans-serif";
        ctx.fillStyle = "#6C8E7E";
        ctx.textAlign = "left";
        ctx.fillText('Player 1 >> ' + player1.kissExperience, 0, 30);
        ctx.textAlign = "right";
        ctx.fillText(player2.kissExperience + ' << Player 2', canvas.width, 30);
        ctx.font = "2em sans-serif";
        ctx.fillStyle = "#F69B9A";
        ctx.textAlign = "center";
        ctx.fillText(((matchPlayingTime - (now - gameMatchStartTime)) / 1000).toFixed() + ' s', canvas.width / 2, 30);

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player1.render();
        player2.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/char-boy.png',
        'images/char-green-princess.png',
        'images/char-princess-poor.png'
    ]);
    Resources.onReady(startGame);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
