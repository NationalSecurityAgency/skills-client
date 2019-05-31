<template>
  <div id="app">
    <show-skills/>
  </div>
</template>

<script>
import ShowSkills from "./components/ShowSkills";

export default {
  name: 'app',
  components: {
    ShowSkills,
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
