<template>
  <div class="sidebar-container">
    <b-button id="create-folder" v-b-modal.my-modal class="sideButton" :disabled="createFolderDisabled">
      <font-awesome-icon class="icon my-icon upload-icon" :icon="['fas', 'folder-plus']" />
      New
    </b-button>
    <b-modal id="my-modal" ref="createFolder" hide-footer>
      <b-form @submit="createFolder">
        <b-form-input v-model="formMail.name" autofocus placeholder="Name" required type="text" />
        <div class="submit-wrapper">
          <b-button class="submit-button" type="submit">
            Submit
          </b-button>
        </div>
      </b-form>
    </b-modal>
    <b-button v-if="!isPublic" id="createTagButton" v-b-modal.my-tag-modal class="sideButton">
      <font-awesome-icon class="icon my-icon upload-icon" :icon="['fas', 'tag']" />
      Tag
    </b-button>
    <b-modal id="my-tag-modal" ref="createTag" hide-footer @show="fetchTag">
      <b-tabs>
        <b-tab title="Create Tag">
          <b-form class="tabs-content" @submit="createTag">
            <b-form-input v-model="tagName" placeholder="Add New Tag Name" required type="text" />
            <div class="submit-wrapper">
              <b-button class="submit-button" type="submit">
                Create
              </b-button>
            </div>
          </b-form>
        </b-tab>
        <b-tab title="Tag List">
          <div v-if="tag.loading" class="tabs-content">
            <b-spinner class="align-middle" />
            <strong>Loading...</strong>
          </div>
          <label v-else-if="tag.item.length === 0" class="tabs-content text-center">There is no tag</label>
          <b-table
            v-else
            :fields="tag.fields"
            :items="tag.item"
            class="tabs-content"
          >
            <template v-slot:cell(action)="data" class="text-right">
              <b-button @click="removeTag(data.item.id)">
                <font-awesome-icon v-b-tooltip.hover title="Remove tag" class="icon my-icon" :icon="['fas', 'minus']" />
              </b-button>
            </template>
          </b-table>
        </b-tab>
      </b-tabs>
    </b-modal>
    <div v-if="!isPublic" class="side-tabs">
      <div id="myDrive" @click="click('myDrive')">
        <font-awesome-icon id="myDrive-icon" class="icon my-icon" :icon="['fas', 'folder-open']" />My Drive
      </div>
      <div id="group" @click="click('groups')">
        <font-awesome-icon id="group-icon" class="icon my-icon" :icon="['fas', 'users']" />Groups
      </div>
      <div id="trash" @click="click('trash')">
        <font-awesome-icon id="trash-icon" class="icon my-icon" :icon="['fas', 'trash']" />Trash
      </div>
    </div>
    <div v-if="!isPublic" id="storage" class="storage-tabs">
      <div class="storage-section">
        <font-awesome-icon class="icon my-icon" :icon="['fas', 'hdd']" />Storage
      </div>
      <b-progress :max="maxsize" show-progress>
        <b-progress-bar :value="currentsize" variant="warning">
          {{ percentage }} %
        </b-progress-bar>
      </b-progress>
      {{ showSize }} used
    </div>
  </div>
</template>

<script>
import toast from '~/mixin/toast'
export default {
  name: 'FileSidebar',
  mixins: [toast],
  props: {
    currentsize: {
      type: Number,
      default: 0
    },
    maxsize: {
      type: Number,
      default: 0
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      active_state: 'myDrive',
      formMail: {
        name: ''
      },
      form: {
        fileId: ''
      },
      tagName: '',
      unit: 'byte',
      tag: {
        fields: [{
          key: 'name',
          label: 'Name'
        },
        {
          key: 'action',
          label: 'Action'
        }],
        item: [],
        loading: false
      }
    }
  },
  computed: {
    userId () { return this.$store.state.home.userId },
    showPercent () {
      return (parseFloat(this.currentsize) * 100 / parseFloat(this.maxsize)).toFixed(2)
    },
    showSize () {
      let size = parseFloat(this.currentsize)
      const unitList = ['byte', 'KB', 'MB', 'GB', 'TB']
      let i = 0
      while (true) {
        if (size > 1024) {
          size /= 1024
          i += 1
        } else {
          break
        }
      }
      return parseFloat(size).toFixed(2) + ' ' + unitList[i]
    },
    percentage () {
      return (this.currentsize * 100 / this.maxsize).toFixed(2)
    },
    isInGroupSelection () { return this.$route.params.id === 'groups' },
    tabs () { return this.$store.state.home.tab },
    createFolderDisabled () { return (this.isInGroupSelection || this.tabs === 'trash') }
  },
  methods: {
    click (state) {
      this.$emit('active_state', state)
    },
    createFolder (event) {
      event.preventDefault()
      this.$refs.createFolder.hide()
      this.$emit('createFolder', this.formMail.name)
    },
    createTag (event) {
      event.preventDefault()
      this.$refs.createTag.hide()
      this.$emit('tagName', this.tagName)
    },
    fetchTag () {
      this.tag.loading = true
      this.tag.item = []
      const endpoint = '/tags'
      const headers = {
        headers: {
          user_id: this.userId
        }
      }
      this.$axios.get(endpoint, headers).then((response) => {
        this.tag.item = this.convertData(response.data.data)
        this.tag.loading = false
      })
    },
    removeTag (tagId) {
      this.tag.loading = true
      this.tag.item = []
      const endpoint = '/tags?tag_id=' + tagId
      const headers = {
        headers: {
          user_id: this.userId
        }
      }
      this.$axios.delete(endpoint, headers).then((response) => {
        this.fetchTag()
        if (response.data.status === '200 OK') {
          this.successToast('Tag has been deleted')
        } else {
          this.errorToast(response.data.message)
        }
      }).catch(() => {
        this.errorToast('There is something wrong')
      })
    },
    convertData (item) {
      const arr = []
      let idx
      for (idx in item) {
        Object.entries(item[idx]).forEach((entry) => {
          arr.push({ id: entry[0], name: entry[1] })
        })
      }
      return arr
    }
  }
}
</script>

<style scoped>

  .sidebar-container {
    color: orange;
    display: flex;
    flex-direction: column;
    vertical-align: top;
    margin-left: 2%;
    width: 15%;
    font-weight: bold;
  }

  .my-icon {
    min-width: 15%;
  }

  .upload-icon {
    margin-right: 15%;
  }
  #storageSizeContainer{
    width: 70%;
    background-color: #DDDDDD;
    height: 15px;
    align-items: center;
  }

  .sideButton {
    border-style: solid;
    border-width: 1px;
    padding: 10px 0 10px 0;
    justify-content: center;
    max-width: 50%;
    margin: 0 7% 0 0;
    background-color: white;
    border-color: orange;
    color: orange;
    font-weight: bold;
    height: auto;
  }

  .side-tabs {
    padding-left: 15%;
    justify-content: space-between;
    border-style: solid;
    border-width: 0 0 1px 0;
  }

  .side-tabs > div {
    margin-top: 5%;
    margin-bottom: 5%;
  }

  .storage-tabs > div {
    margin-top: 5%;
    margin-bottom: 5%;
  }

  #storage {
    padding-top: 5%;
    padding-left: 15%;
  }

  .submit-wrapper {
    margin-top: 5%;
    display: flex;
    justify-content: center;
  }

  .submit-button {
    align-self: center;
    border-color: orange;
    color: orange;
    border-style: solid;
    border-width: 1px;
  }
  .tabs-content {
    margin-top: 5%;
  }

  @media screen and (max-width: 800px) {
    .sidebar-container {
      flex-direction: column;
      margin: 0 auto;
      width: 100%;
      max-width: 540px;
      align-items: center;
      justify-content: center;
    }
    .side-tabs {
      padding-top: 5%;
      padding-bottom: 5%;
      flex-direction: row;
      padding-left: 0;
    }
    .icon {
      margin-right: 5px;
    }
    #storage {
      padding-left: 0;
    }
    .sideButton {
      margin-right: 0;
      margin-bottom: 5%;
      min-width: 75px;
    }
  }
</style>
