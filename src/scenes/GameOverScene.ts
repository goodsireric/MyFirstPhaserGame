import Phaser from 'phaser'

export default class GameOverScene extends Phaser.Scene
{
    //Game variables
    private gameOver:boolean = false;
    private gameOverText?: Phaser.GameObjects.Text;

    constructor()
    {
        super('Phaser')
    }

    preload()
    {

    }

    create()
    {
        this.gameOver = true;
        this.gameOverText?.setVisible(true);
    }
}