import Phaser from 'phaser'

export default class GameBehaviorScene extends Phaser.Scene
{
    //Game objects
    private platforms?: Phaser.Physics.Arcade.StaticGroup 
    private stars?: Phaser.Physics.Arcade.Group
    private player?: Phaser.Physics.Arcade.Sprite
    private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys
    private bombs?: Phaser.Physics.Arcade.Group

    //Game variables
    private canDoubleJump: boolean = true;
    private score:integer = 0;
    private scoreText?:Phaser.GameObjects.Text;
    private gameOver:boolean = false;
    private gameOverText?: Phaser.GameObjects.Text;

	constructor()
	{
		super('hello-world')
	}

	preload()
    {
        this.load.image('sky', 'images/sky.png');
        this.load.image('ground', 'images/platform.png');
        this.load.image('star', 'images/star.png');
        this.load.image('bomb', 'images/bomb.png');
        this.load.spritesheet('dude', 
            'images/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    private collectStar(p:Phaser.GameObjects.GameObject, s:Phaser.GameObjects.GameObject)
    {
        //add to the score
        const star = s as Phaser.Physics.Arcade.Image;
        const player = p as Phaser.Physics.Arcade.Sprite; 
        star.disableBody(true,true);
        this.score += 10;
        this.scoreText?.setText('Score: ' + this.score);

        //Once all stars have been collected, add a bomb bouncing around the map
        if(!this.stars || !this.bombs)
        {
            return;
        }
        if(this.stars?.countActive(true) === 0)
        {
            //respawn the stars
            this.stars.children.iterate((c) => {
                const child = c as Phaser.Physics.Arcade.Image;
                child.enableBody(true, child.x, 0, true, true);
            });
            
            //Create a bouncing bomb
            const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0,400);
            const bomb = this.bombs?.create(x,16,'bomb') as Phaser.Physics.Arcade.Image;
            bomb.setBounce(1); //never lose velocity
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }

    }

    private hitBomb(p:Phaser.GameObjects.GameObject, b:Phaser.GameObjects.GameObject)
    {
        const player = p as Phaser.Physics.Arcade.Sprite; 
        this.physics.pause();
        player.setTint(0xFF0000);
        player.anims.play('turn');
        this.gameOver = true;
        this.gameOverText?.setVisible(true);
    }

    create()
    {
        this.add.image(0, 0, 'sky').setOrigin(0,0);
        this.platforms = this.physics.add.staticGroup();

        //Create the platforms
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        //Create the player
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        //Create the stars
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x:12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate((c) => {
            const child = c as Phaser.Physics.Arcade.Image
            child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
        });
        
        //Create the bombs
        this.bombs = this.physics.add.group();


        //Add physics effects
        this.player.setGravityY(300);
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player,this.bombs,this.hitBomb,undefined,this);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        //Add score text
        this.scoreText = this.add.text(16,16,'score: 0', {fontSize: '32px', fill: '#000'});

        //Add game over text and hide it
        this.gameOverText = this.add.text(300,300,'GAME OVER', {fontSize: '32px', color: '#f00', strokeThickness: 3, stroke: '#000'});
        this.gameOverText.setVisible(false);
    }

    update ()
    {
        if(!this.cursorKeys || !this.player || !this.stars)
        {
            return
        }
        if (this.cursorKeys.left?.isDown)
        {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (this.cursorKeys?.right?.isDown)
        {
            this.player?.setVelocityX(160);

            this.player?.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);

            this.player.anims.play('idle');
        }

        if(this.cursorKeys.up?.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-330);
        }
        
        const didPressJump = Phaser.Input.Keyboard.JustDown(this.cursorKeys.up! );
        // player can only double jump if the player just jumped
        if (didPressJump) {
            if (this.player.body.touching.down) {
                // player can only double jump if it is on the floor
                this.canDoubleJump = true;
                this.player.setVelocityY(-330);
            } else if (this.canDoubleJump) {
                // player can only jump 2x (double jump)
                this.canDoubleJump = false;
                this.player.setVelocityY(-330);
            }
        }
    }
}
