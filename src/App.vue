<template>
  <div id="app">
    <forest-grid></forest-grid>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ForestGrid from './components/ForestGrid.vue';

export default defineComponent({
  components: {
    ForestGrid
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
</style>
