<template>
  <div>
    <ul id="side">
      <li id="expand" @click="expand()">
        <div class="icon" />
      </li>
      <li id="home" @click="setActiveTab('')">
        <div class="icon" />
        <div class="label">
          Home
        </div>
      </li>
      <li id="users" @click="setActiveTab('users')">
        <div class="icon" />
        <div class="label">
          User List
        </div>
      </li>
      <li id="groups" @click="setActiveTab('groups')">
        <div class="icon" />
        <div class="label">
          Group List
        </div>
      </li>
      <li id="settings" @click="setActiveTab('settings')">
        <div class="icon" />
        <div class="label">
          System Settings
        </div>
      </li>
    </ul>
    <div id="cover" @click="expand" />
  </div>
</template>

<style scoped>
  #side {
    top: 0;
    list-style-type: none;
    width: 60px;
    height: 100%;
    background-color: var(--admin1);
    padding-top: 10px;
    position: fixed;
    z-index: 5;
    font-size: 14px;
  }

  #side li {
    height: 60px;
  }

  #side li:hover {
    background-color: var(--admin2);
    transition-duration: 0.2s;
    cursor: pointer
  }

  .selected {
    background-color: var(--admin2);
  }

  .icon {
    height: 60px;
    width: 60px;
    display: inline-block;
    background-repeat: no-repeat;
    background-position: center;
    filter: var(--filter-to-white);
  }

  .label {
    display: none;
    margin: 22px 5px;
    vertical-align: top;
    text-transform: uppercase;
    font-weight: bold;
    color: white;
  }

  #expand {
    margin-bottom: 40px;
  }

  #expand .icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24'%3E%3Cpath d='M24 6h-24v-4h24v4zm0 4h-24v4h24v-4zm0 8h-24v4h24v-4z'/%3E%3C/svg%3E");
  }

  #home .icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 6.453l9 8.375v9.172h-6v-6h-6v6h-6v-9.172l9-8.375zm12 5.695l-12-11.148-12 11.133 1.361 1.465 10.639-9.868 10.639 9.883 1.361-1.465z'/%3E%3C/svg%3E");
  }

  #users .icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm7.753 18.305c-.261-.586-.789-.991-1.871-1.241-2.293-.529-4.428-.993-3.393-2.945 3.145-5.942.833-9.119-2.489-9.119-3.388 0-5.644 3.299-2.489 9.119 1.066 1.964-1.148 2.427-3.393 2.945-1.084.25-1.608.658-1.867 1.246-1.405-1.723-2.251-3.919-2.251-6.31 0-5.514 4.486-10 10-10s10 4.486 10 10c0 2.389-.845 4.583-2.247 6.305z'/%3E%3C/svg%3E");
  }

  #groups .icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M10.118 16.064c2.293-.529 4.428-.993 3.394-2.945-3.146-5.942-.834-9.119 2.488-9.119 3.388 0 5.644 3.299 2.488 9.119-1.065 1.964 1.149 2.427 3.394 2.945 1.986.459 2.118 1.43 2.118 3.111l-.003.825h-15.994c0-2.196-.176-3.407 2.115-3.936zm-10.116 3.936h6.001c-.028-6.542 2.995-3.697 2.995-8.901 0-2.009-1.311-3.099-2.998-3.099-2.492 0-4.226 2.383-1.866 6.839.775 1.464-.825 1.812-2.545 2.209-1.49.344-1.589 1.072-1.589 2.333l.002.619z'/%3E%3C/svg%3E");
  }

  #settings .icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z'/%3E%3C/svg%3E");
  }

  #cover {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 4;
    display: none;
  }
</style>

<script lang="ts">
export default {
  data () {
    return {
      expanded: false
    }
  },
  methods: {
    expand () {
      const bar = document.getElementById('side')
      const cover = document.getElementById('cover')
      bar.style.transitionDuration = '0.2s'
      if (this.expanded) {
        bar.style.width = '60px'
        cover.style.display = 'none'
        const labels = document.getElementsByClassName('label')
        for (let i = 0; i < labels.length; i++) {
          labels[i].style.display = 'none'
        }
        this.expanded = false
      } else {
        bar.style.width = '250px'
        cover.style.display = 'block'
        setTimeout(() => {
          const labels = document.getElementsByClassName('label')
          for (let i = 0; i < labels.length; i++) {
            labels[i].style.display = 'inline-block'
          }
        }, 200)
        this.expanded = true
      }
      bar.style.transitionDuration = '0'
    },
    setActiveTab (tab) {
      this.$router.push('/admin/' + tab)
    }
  }
}
</script>
