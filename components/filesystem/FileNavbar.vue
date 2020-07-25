<template>
  <div class="navbar-container">
    <img src="~/assets/logo.png" alt="Logo">
    <b-tooltip v-if="searchDisabled" target="search-bar">
      You can't search on this
    </b-tooltip>
    <div id="search-bar">
      <font-awesome-icon class="icon search-icon" :icon="['fas', 'search']" @click="searchQuery" />
      <input
        id="inputText"
        v-model="searchString"
        autocomplete="off"
        list="tagList"
        placeholder="Search"
        onfocus="this.select()"
        :disabled="searchDisabled"
        @keyup.enter="searchQuery"
      >
      <div>
        <datalist id="tagList" class="scrollable">
          <option v-for="tag in tagItems" :key="tag.id">
            {{ tag.name }}
          </option>
        </datalist>
      </div>
      <button id="tag-button" v-b-tooltip.hover title="Search By" @click="setSearchMode">
        {{ tagButton }}
      </button>
    </div>
    <div class="user-bar">
      <button v-b-tooltip.hover :title="username" class="auth-button user-icon" @click="goToSetting">
        <label class="user-icon">{{ username[0] }}</label>
      </button>
      <button class="auth-button" @click="goToLogout">
        Logout
      </button>
    </div>
    <UserSettings
      ref="userSetting"
    />
  </div>
</template>

<script>
import UserSettings from '~/components/filesystem/UserSettings'
export default {
  name: 'FileNavbar',
  components: {
    UserSettings
  },
  props: {
    userid: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      searchString: '',
      isTag: false,
      tagButton: 'Name',
      tagTemp: [],
      tagItems: []
    }
  },
  computed: {
    isInGroupSelection () { return this.$route.params.id === 'groups' },
    tabs () { return this.$store.state.home.tab },
    searchDisabled () { return (this.isInGroupSelection || this.tabs === 'trash') }
  },
  methods: {
    goToSetting () {
      this.$refs.userSetting.show()
    },
    async setSearchMode () {
      this.isTag = !this.isTag
      if (this.isTag) { // search by tag
        this.tagButton = 'Tag'
      } else {
        this.tagButton = 'Name'
      }

      if (this.isTag) {
        if (this.tagTemp.length === 0) {
          this.tagItems = []
          const endpoint = '/tags'
          const header = {
            headers: {
              user_id: this.userid
            }
          }
          const responseBE = await this.$axios.get(endpoint, header).then((response) => {
            return response.data.data
          })
          const tempList = []
          let temp = ''
          for (const i in responseBE) {
            temp = responseBE[i]
            for (const key in temp) {
              tempList.push({ id: key, name: temp[key] })
            }
          }
          this.tagTemp = tempList
          this.tagItems = this.tagTemp
          this.tagItems = this.tagTemp
        } else {
          this.tagItems = this.tagTemp
        }
      } else {
        this.tagItems = []
      }
    },
    goToLogout () {
      this.$router.replace('/auth/Logout')
    },
    async searchQuery () {
      this.$store.dispatch('home/setLoading', true)
      const config = {
        headers: {
          user_id: this.userid
        }
      }

      let endpoint = ''
      let responseBE = ''
      if (this.searchString === '') {
        this.$store.dispatch('home/clearSearch')
      } else if (!this.isTag) {
        endpoint = '/items/search'
        const payload = {
          name: this.searchString
        }
        try {
          responseBE = await this.$axios.post(endpoint, payload, config)
          this.$emit('searchResult', { data: responseBE.data.data, isTag: false })
        } catch (e) {
          this.error = e.response.data.message
        }
      } else {
        let tempString = ''
        for (const i in this.tagItems) {
          if (this.searchString === this.tagItems[i].name) {
            tempString = this.tagItems[i].id
            break
          }
        }
        endpoint = '/tags/files?tag_id=' + tempString
        try {
          responseBE = await this.$axios.get(endpoint, config)
          if (responseBE.data.data === null) {
            responseBE.data.data = []
          }
          this.$emit('searchResult', { data: responseBE.data.data, isTag: true })
        } catch (e) {
          this.error = e.response.data.message
        }
      }
      this.$store.dispatch('home/setLoading', false)
    }
  }
}
</script>

<style scoped>
@import "../../assets/css/elements/body.css";
label {
  margin-bottom: 0;
}
img {
  display: block;
  max-width: 126px;
  max-height: 29px;
  align-items: center;
  margin: auto;
}

.navbar-container {
  padding: 1.5% 2.5%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: orange;
  border-width: 0 0 1px 0;
  border-style: solid;
}

#search-bar {
  flex-grow: 4;
  align-items: center;
  display: flex;
  flex-direction: row;
  background-color: #fff1dc;
  color: orange;
  padding: 0.5% 0.5%;
  margin: 0 5%;
  border-radius: 8px;
}

.user-bar {
  display: flex;
  margin: auto;
}

.search-icon {
  margin: 5px 5px 5px 20px;
}

.scrollable {
  overflow-y: scroll;
  height: 50px;
}

.user-icon {
  border-radius: 50%;
  background-color: #71d699;
  height: 25px;
  width: 25px;
  display: block;
  text-align: center;
  color: white;
  margin-right: 15px;
  line-height: 1.5;
  font-size: 1rem;
}

input {
  background-color: #fff1dc;
  color: orange;
  border-width: 0;
  flex-grow: 1;
}

input:focus {
  outline-width: 0;
}

::placeholder {
  color: orange;
}

#user-name {
  padding-top: 1.5%;
}

.auth-button {
  align-self: center;
  border-color: orange;
  color: orange;
  border-style: solid;
  border-width: 1px;
}
</style>
