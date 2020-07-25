<template>
  <div id="spinner">
    <div id="spinner-container">
      <b-spinner /><br>
      <div id="text">
        Loading...
      </div>
    </div>
  </div>
</template>

<style scoped>
  #spinner {
    width: 100%;
    height: 200px;
  }
  #spinner-container {
    text-align: center;
    margin-top: 100px;
    color: var(--admin1);
  }
  #spinner-container #text {
    padding-top: 10px;
    font-size: 18px;
  }
</style>

<script>
export default {
  data () {
    return {
      value: 0
    }
  }
}
</script>
