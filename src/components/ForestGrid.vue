<template>
  <div class="container">
    <h1>Forest Fire Simulation</h1>
    
    <div class="controls">
      <button @click="toggleSimulation" 
        :class="{ 'cancel-button': simulationRunning }" 
        :disabled="!simulationRunning && !canStartSimulation">
        {{ simulationRunning ? 'Cancel Simulation' : 'Start Simulation' }}
      </button>

      <button @click="openEditModal">Edit Parameters</button>
      <div class="step-counter">Current Step: {{ currentStep }}</div>
    </div>

    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeEditModal">&times;</span>
        <h2>Edit Simulation Parameters</h2>

        <div class="parameter-group">
          <label>Width:</label>
          <input type="number" v-model.number="gridWidth" @input="updateParameter('gridWidth', gridWidth)" min="1" />
        </div>

        <div class="parameter-group">
          <label>Height:</label>
          <input type="number" v-model.number="gridHeight" @input="updateParameter('gridHeight', gridHeight)" min="1" />
        </div>

        <div class="parameter-group">
          <label>Propagation Probability:</label>
          <input type="range" v-model="propagationProb" @input="updateParameter('propagationProb', propagationProb)" min="0" max="100" />
          <span>{{ propagationProb }}%</span>
        </div>

        <div class="parameter-group">
          <label>Speed of Propagation:</label>
          <input type="range" v-model="speedPercent" @input="updateSpeed()" min="1" max="100" />
          <span>{{ speedPercent }}%</span>
        </div>

        <div class="parameter-group">
          <label>Initial Fire Positions (e.g., 2,2;5,5):</label>
          <input type="text" v-model="initialFireInput" @input="validateFirePositions" />
        </div>

        <div class="modal-footer">
          <button class="reset-button" @click="resetToDefaultConfig">Reset to Default</button>
        </div>
      </div>
    </div>

    <!-- Error message for fire positions -->
    <div v-if="firePositionError" class="error-message">{{ firePositionError }}</div>

    <div class="grid-container">
      <div v-for="(row, rowIndex) in forest" :key="rowIndex" class="grid-row">
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :class="getCellClass(cell)"
          class="grid-cell"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import ForestFireSimulation from '../simulation/forestSimulation';

export default defineComponent({
  setup() {
    const forest = ref<string[][]>([]);
    const currentStep = ref(0);
    const simulationRunning = ref(false);
    const simulationInterval = ref<number | null>(null);
    let simulation: ForestFireSimulation;

    const gridWidth = ref(10);
    const gridHeight = ref(10);
    const propagationProb = ref(30);
    const speedPercent = ref(50);
    const initialFireInput = ref("2,2;5,5");
    const isModalOpen = ref(false);
    const firePositionError = ref<string | null>(null);

    const canStartSimulation = ref(true);

    const loadConfig = async () => {
      const response = await fetch('/config.json');
      const config = await response.json();
      gridWidth.value = config.gridDimension.width;
      gridHeight.value = config.gridDimension.height;
      propagationProb.value = config.propagationProb * 100;
      speedPercent.value = 50;

      initialFireInput.value = config.initialFire.map((pos: [number, number]) => pos.join(",")).join(";");
      return config;
    };

    const runSimulation = () => {
      simulationRunning.value = true;
      canStartSimulation.value = false;
      simulationInterval.value = window.setInterval(() => {
        simulation.simulateStep();
        forest.value = simulation.getForestState();
        currentStep.value++;

        if (!simulation.hasFire()) {
          stopSimulation(); // Stop when no fire remains
        }
      }, getSpeedInMs(speedPercent.value));
    };

    const startSimulation = async () => {
      const initialFire = parseInitialFirePositions(initialFireInput.value);
      
      if (initialFire.length === 0) {
        firePositionError.value = "Error: No initial fire positions provided.";
        return; // Prevent starting simulation if no valid fire positions
      }

      firePositionError.value = null; // Clear any previous error

      simulation = new ForestFireSimulation(gridWidth.value, gridHeight.value, propagationProb.value / 100, initialFire);
      forest.value = simulation.getForestState();

      currentStep.value = 0;
      runSimulation();
    };

    const stopSimulation = () => {
      if (simulationInterval.value) {
        clearInterval(simulationInterval.value);
        simulationRunning.value = false;
        canStartSimulation.value = true; // Enable the button to restart
        simulationInterval.value = null;
      }
    };

    const toggleSimulation = () => {
      if (simulationRunning.value) {
        stopSimulation(); // If running, cancel it
      } else {
        startSimulation(); // If not running, start the simulation
      }
    };

    const parseInitialFirePositions = (input: string): [number, number][] => {
      const validPositions: [number, number][] = [];
      const positions = input.split(';');

      positions.forEach(pos => {
        const coords = pos.split(',').map(Number);
        if (coords.length === 2 && 
            coords[0] >= 0 && coords[0] < gridWidth.value && 
            coords[1] >= 0 && coords[1] < gridHeight.value) {
          validPositions.push([coords[1], coords[0]]); // Store as (x,y)
        } else {
          firePositionError.value = "Error: One or more positions are out of bounds.";
        }
      });

      return validPositions;
    };

    const validateFirePositions = () => {
      try {
        const initialFire = parseInitialFirePositions(initialFireInput.value);
        if (initialFire.length === 0) {
          firePositionError.value = "Error: No valid initial fire positions.";
        } else {
          firePositionError.value = null; // Clear error if valid
        }
      } catch (error) {
        firePositionError.value = (error as Error).message; // Set error message
      }
    };

    const openEditModal = () => {
      isModalOpen.value = true;
    };

    const closeEditModal = () => {
      isModalOpen.value = false;
    };

    const resetToDefaultConfig = async () => {
      await loadConfig();
    };

    const updateParameter = (paramName: string, value: string | number | boolean) => {
      console.log(`Updated ${paramName} to ${value}`);
    };

    const updateSpeed = () => {
      console.log(`Speed set to: ${getSpeedInMs(speedPercent.value)} ms`);
    };

    const getSpeedInMs = (percent: number): number => {
      return 2000 - ((percent - 1) / 99) * (2000 - 10);
    };

    const getCellClass = (cell: string): string => {
      switch (cell) {
        case 'T':
          return 'tree';
        case 'F':
          return 'fire';
        case 'A':
          return 'ash';
        default:
          return '';
      }
    };

    onMounted(() => {
      loadConfig().then(startSimulation);
    });

    watch([gridWidth, gridHeight], ([newWidth, newHeight]) => {
      if (newWidth < 1) gridWidth.value = 1;
      if (newHeight < 1) gridHeight.value = 1;
    });

    return {
      forest,
      getCellClass,
      toggleSimulation,
      currentStep,
      simulationRunning,
      canStartSimulation,
      gridWidth,
      gridHeight,
      propagationProb,
      speedPercent,
      initialFireInput,
      openEditModal,
      closeEditModal,
      resetToDefaultConfig,
      isModalOpen,
      updateParameter,
      updateSpeed,
      getSpeedInMs,
      firePositionError,
      validateFirePositions
    };
  }
});
</script>

  <style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;

  }

  h1 {
    margin-bottom: 20px;
  }
  
  .controls {
    margin-bottom: 20px;
  }
  
  .step-counter {
    margin-top: 10px;
    font-weight: bold;
  }
  
  .grid-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .grid-row {
    display: flex;
  }
  
  .grid-cell {
    width: 20px;
    height: 20px;
    border: 1px solid #333;
  }
  
  .tree {
    background-color: green;
  }
  
  .fire {
    background-color: red;
  }
  
  .ash {
    background-color: gray;
  }
  
  button {
    margin: 5px;
    padding: 10px 20px;
    cursor: pointer;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
  }
  
  .cancel-button {
    background-color: #f44336; /* Red background */
    color: white; /* White text */
  }

  

  button:disabled {
    background-color: #ccc; /* Grey out disabled buttons */
    cursor: not-allowed;
  }
  
  button:hover:not(:disabled) {
    background-color: #45a049;
  }

  button.cancel-button:hover {
    background-color: #d32f2f; /* Ensure it stays red on hover */
  }
  
  /* Modal Styles */
  .modal {
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  }
  
  .modal-content {
    background-color: #fefefe;
    margin: 10% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 60%;
    border-radius: 10px;
  }
  
  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }
  
  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }
  
  .parameter-group {
    margin: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .parameter-group label {
    flex-basis: 40%;
  }
  
  .parameter-group input[type="number"],
  .parameter-group input[type="text"],
  .parameter-group input[type="range"] {
    flex-basis: 50%;
    padding: 5px;
  }
  
  .modal-footer {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .reset-button {
    padding: 10px 20px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
  }
  
  .reset-button:hover {
    background-color: #d32f2f;
  }

  .error-message {
    color: red;
    margin: 20px 0;
    font-weight: bold;
  }
  </style>
  