import Matter from 'matter-js';

const engine = Matter.Engine.create();
const world = engine.world;

// Add puck, paddles, walls to world
// Run physics in a loop and emit positions to other player

export { engine, world };
