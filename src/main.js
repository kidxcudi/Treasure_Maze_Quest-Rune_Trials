// src/main.js
import * as THREE from 'three';
import { Game } from './core/Game.js';

// Initialize game when window loads
window.onload = () => {
  try {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) throw new Error('Game container not found');
    
    const game = new Game(gameContainer);
    game.start();
  } catch (error) {
    console.error('Game initialization failed:', error);
    alert('Failed to initialize the game. Please try refreshing the page.');
  }
};