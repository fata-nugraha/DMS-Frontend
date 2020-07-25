<template>
  <div v-if="visible" id="overlay" @click="handleButton({emit: 'cancel', emitData: ''})">
    <div id="card">
      <h1>{{ header }}</h1>
      <div id="message">
        {{ message }}
      </div>
      <div id="buttons">
        <template v-for="button in buttons">
          <button :key="button.emit" :class="button.class" @click="handleButton(button)">
            {{ button.name }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
  #overlay {
    z-index: 999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5)
  }

  #card {
    width: 40%;
    min-width: 200px;
    margin: 100px auto;
    padding: 20px 32px;
    text-align: center;
    background-color: white;
  }

  #card #message {
    text-align: left;
  }

  #card #buttons {
    margin-top: 32px;
    margin-bottom: 20px;
  }

  #card #buttons button {
    margin: 4px;
    min-width: 100px;
  }
</style>

<script>
export default {
  props: {
    header: {
      type: String,
      default () {
        return 'This is a Header'
      }
    },
    message: {
      type: String,
      default () {
        return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      }
    },
    buttons: {
      type: Array,
      default () {
        return [
          { name: 'Green Button', class: 'btn-green', emit: 'test2', emitData: '' },
          { name: 'Red Button', class: 'btn-red', emit: 'test3', emitData: '' },
          { name: 'Normal Button', class: '', emit: 'test4', emitData: '' }
        ]
      }
    },
    visible: {
      type: Boolean,
      default () {
        return true
      }
    }
  },
  methods: {
    handleButton (button) {
      this.$emit(button.emit, button.emitData)
    }
  }
}
</script>
