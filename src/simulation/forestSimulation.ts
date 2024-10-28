type Cell = 'T' | 'F' | 'A'; // T: Tree, F: Fire, A: Ash

class ForestFireSimulation {
  private width: number;
  private height: number;
  private forest: Cell[][];
  private propagationProb: number;

  constructor(width: number, height: number, propagationProb: number, initialFire: [number, number][]) {
    this.width = width;
    this.height = height;
    this.propagationProb = propagationProb;

    // Initialize forest grid with trees (T)
    this.forest = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 'T')
    );

    // Set the initial fire locations
    initialFire.forEach(([x, y]) => {
      this.forest[x][y] = 'F';
    });
  }

  // Simulate one step of the fire spread
  simulateStep() {
    const newForest: Cell[][] = this.forest.map(row => [...row]);

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.forest[i][j] === 'F') {
          // The fire turns to ash
          newForest[i][j] = 'A';
          this.propagateFire(i, j, newForest);
        }
      }
    }

    // Update the forest
    this.forest = newForest;
  }

  // Propagate fire to neighboring cells
  private propagateFire(x: number, y: number, newForest: Cell[][]) {
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0] // Right, Down, Left, Up
    ];

    directions.forEach(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;

      if (this.isValidCell(newX, newY) && this.forest[newX][newY] === 'T') {
        // Random chance to spread fire
        if (Math.random() < this.propagationProb) {
          newForest[newX][newY] = 'F';
        }
      }
    });
  }

  // Check if the cell is within the grid
  private isValidCell(x: number, y: number): boolean {
    return x >= 0 && x < this.height && y >= 0 && y < this.width;
  }

  // Check if there are still cells on fire
  hasFire(): boolean {
    return this.forest.some(row => row.includes('F'));
  }

  // Get the current state of the forest
  getForestState(): Cell[][] {
    return this.forest;
  }
}

export default ForestFireSimulation;
