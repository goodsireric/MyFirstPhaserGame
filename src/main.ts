import Phaser from 'phaser'

import GameBehaviorScene from './scenes/GameBehaviorScene'

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [GameBehaviorScene]
}

var game = new Phaser.Game(config)
