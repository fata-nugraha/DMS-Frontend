<template>
  <div class="actionbar-container">
    <div v-if="tab === 'myDrive' || (tab === 'groups' && !isInGroupSelection)">
      <b-button v-b-tooltip.hover title="Move" class="icon action" @click="action('move')">
        <font-awesome-icon :icon="['fas', 'file-import']" />
      </b-button>
      <b-button v-b-tooltip.hover title="Copy" class="icon action" @click="action('copy')">
        <font-awesome-icon :icon="['fas', 'copy']" />
      </b-button>
      <b-button v-if="!isMultipleSelected" v-b-modal.rename-modal v-b-tooltip.hover title="Rename" class="icon action">
        <font-awesome-icon :icon="['fas', 'pen']" />
      </b-button>
      <b-button
        v-if="!isMultipleSelected && !isFolderSelected && tab !== 'groups'"
        v-b-modal.add-modal
        v-b-tooltip.hover
        title="Add Tag"
        class="icon action"
      >
        <font-awesome-icon :icon="['fas', 'tags']" />
      </b-button>
      <b-button
        v-if="!isMultipleSelected && !isFolderSelected && tab !== 'groups'"
        id="remove-tag"
        v-b-modal.remove-modal
        v-b-tooltip.hover
        title="Remove Tag"
        class="icon action"
        :style="{ color: '#666666'}"
      >
        <font-awesome-icon :icon="['fas', 'tag']" />
      </b-button>
      <b-button v-if="!isFolderSelected" v-b-tooltip.hover title="Download" class="icon action" @click="action('download')">
        <font-awesome-icon :icon="['fas', 'download']" />
      </b-button>
      <b-button v-b-tooltip.hover title="Move to Trash" class="icon action" @click="action('trash')">
        <font-awesome-icon :icon="['fas', 'trash']" />
      </b-button>
      <b-button v-if="!isMultipleSelected && !isFileSelected && (tab !== 'groups')" v-b-tooltip.hover title="Share" class="icon action" @click="action('share')">
        <font-awesome-icon :icon="['fas', 'share-alt']" />
      </b-button>
      <b-button v-if="isXmlSelected && !isMultipleSelected" v-b-tooltip.hover title="Sign XML" class="icon action" @click="action('signXML')">
        <font-awesome-icon :icon="['fas', 'file-signature']" />
      </b-button>
      <b-button v-if="!isMultipleSelected" v-b-tooltip.hover title="Show Log" class="icon action" @click="action('log')">
        <font-awesome-icon :icon="['fas', 'info-circle']" />
      </b-button>
      <b-button v-if="!isMultipleSelected && !isFolderSelected" v-b-tooltip.hover title="Encode file to XML" class="icon action" @click="action('encode')">
        <font-awesome-icon :icon="['fas', 'exchange-alt']" />
      </b-button>
      <b-modal id="rename-modal" hide-footer>
        <b-form @submit="rename">
          <b-form-input v-model="formMail.name" autofocus placeholder="Name" required type="text" />
          <div class="submit-wrapper">
            <b-button id="submit-button" type="submit">
              Submit
            </b-button>
          </div>
        </b-form>
      </b-modal>
      <b-modal id="add-modal" hide-footer>
        <span
          id="error-message"
          class="error-message"
          :style="{visibility: 'hidden'}"
        >
          Tag not found
        </span>
        <b-form @submit="submitAddTag">
          <b-form-input
            v-model="tagInput"
            autofocus
            placeholder="Add Tag"
            required
            type="text"
            @keyup="validateTagInput"
          />
          <div class="submit-wrapper">
            <b-button id="submit-button" type="submit">
              Add
            </b-button>
          </div>
        </b-form>
      </b-modal>
      <b-modal id="remove-modal" hide-footer>
        <span
          id="error-message"
          class="error-message"
          :style="{visibility: 'hidden'}"
        >
          You do not have this tag
        </span>
        <b-form @submit="submitRemoveTag">
          <b-form-input
            v-model="tagInput"
            autofocus
            placeholder="Remove Tag"
            required
            type="text"
            @keyup="validateTagInput"
          />
          <div class="submit-wrapper">
            <b-button id="submit-button" type="submit">
              Remove
            </b-button>
          </div>
        </b-form>
      </b-modal>
    </div>
    <div v-else-if="tab === 'trash'">
      <b-button v-b-tooltip.hover title="Delete" class="icon action" @click="action('trash')">
        <font-awesome-icon :icon="['fas', 'trash']" />
      </b-button>
      <b-button v-b-tooltip.hover title="Restore" class="icon action" @click="action('restore')">
        <font-awesome-icon :icon="['fas', 'undo']" />
      </b-button>
      <b-button v-if="!isMultipleSelected" v-b-tooltip.hover title="Show Log" class="icon action">
        <font-awesome-icon :icon="['fas', 'info-circle']" @click="action('log')" />
      </b-button>
    </div>
    <div v-else-if="tab === 'share'">
      <b-button v-if="!isFolderSelected" v-b-tooltip.hover title="Download" class="icon action" @click="action('download')">
        <font-awesome-icon :icon="['fas', 'download']" />
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionBar',
  props: {
    isFolderSelected: {
      type: Boolean,
      default: false
    },
    isMultipleSelected: {
      type: Boolean,
      default: false
    },
    isXmlSelected: {
      type: Boolean,
      default: false
    },
    isFileSelected: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      formMail: {
        name: ''
      },
      tagInput: '',
      tagItems: [],
      tagInitialized: false
    }
  },
  computed: {
    tab () { return this.$store.state.home.tab },
    isInGroupSelection () { return this.$route.params.id === 'groups' }
  },
  methods: {
    validateTagInput () {
      if (this.findInTagItems(this.tagInput) || this.tagInput === '') {
        document.getElementById('error-message').style.visibility = 'hidden'
        return true
      } else {
        document.getElementById('error-message').style.visibility = 'visible'
        return false
      }
    },
    async updateTagItems () {
      this.tagItems = []
      const endpoint = '/tags'
      const header = {
        headers: {
          user_id: this.$cookies.get('userid')
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
      this.tagItems = tempList
    },
    action (actionDetail) {
      this.$emit('action', { action: actionDetail })
    },
    submitAddTag (event) {
      const id = this.findInTagItems(this.tagInput)
      this.$emit('action', { action: 'addTag', ID: id, name: this.tagInput })
      this.tagInput = ''
    },
    submitRemoveTag (event) {
      const id = this.findInTagItems(this.tagInput)
      this.$emit('action', { action: 'removeTag', ID: id })
      this.tagInput = ''
    },
    findInTagItems (name) {
      if (!this.tagInitialized) {
        this.updateTagItems()
        this.tagInitialized = true
      }
      for (let i = 0; i < this.tagItems.length; i++) {
        if (this.tagItems[i].name === name) {
          return this.tagItems[i].id
        }
      }
      return false
    },
    rename (event) {
      event.preventDefault()
      this.$emit('action', { action: 'rename', params: this.formMail.name })
    }
  }
}
</script>

<style scoped>
.actionbar-container {
  color: orange;
  margin: auto 0;
  width: 30%;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.action {
  border-style: none;
  background-color: #ffefc5;
  color: orange;
  min-width: 45px;
  margin-bottom: 3px;
  margin-top: 3px;
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

.submit-wrapper {
  margin-top: 5%;
  display: flex;
  justify-content: center;
}

#submit-button {
  align-self: center;
  border-color: orange;
  color: orange;
  border-style: solid;
  border-width: 1px;
  border-radius: 20%;
}

.error-message {
  margin-top: 10px;
  margin-bottom: 10px;
	visibility: hidden;
  color: #ea4c4c;
}

</style>
