<template>
  <div class="container">
    <b-row class="action-bar" align-v="center">
      <div class="path">
        <b-col id="root-directory" class="path-items" @click="backToRoot">
          {{ title }}
        </b-col>
        <div v-if="(path.length >= 3)" class="path-items">
          <b-col>
            <font-awesome-icon class="icon arrow" :icon="['fas', 'chevron-right']" />
          </b-col>
          <b-dropdown variant="outline-dark" class="dropdown-1" text="...">
            <div v-for="hiddenFile in hiddenPath" :key="'hiddenFile-' + hiddenFile.id">
              <b-dropdown-item @click="onChangeDirectory(hiddenFile.id)">
                {{ hiddenFile.name }}
              </b-dropdown-item>
            </div>
          </b-dropdown>
          <b-col>
            <font-awesome-icon class="icon arrow" :icon="['fas', 'chevron-right']" />
          </b-col>
          <b-col class="path-name" @click="onChangeDirectory(path[path.length - 1].id)">
            {{ path[path.length - 1].name }}
          </b-col>
        </div>
        <div v-else class="path-items">
          <div v-for="file in path" :key="'file-' + file.id" class="path-container">
            <b-col>
              <font-awesome-icon class="icon arrow" :icon="['fas', 'chevron-right']" />
            </b-col>
            <b-col class="path-name" @click="onChangeDirectory(file.id)">
              {{ file.name }}
            </b-col>
          </div>
        </div>
      </div>
      <b-button v-if="action.isMove" v-b-tooltip.hover title="Move" class="icon my-icon action-default" @click="commit('move')">
        <font-awesome-icon :icon="['fas', 'file-export']" />
      </b-button>
      <b-button v-else-if="action.isCopy" v-b-tooltip.hover title="Paste" class="icon my-icon action-default" @click="commit('copy')">
        <font-awesome-icon :icon="['fas', 'paste']" />
      </b-button>
      <ActionBar
        v-else-if="(selected.length > 0)"
        :is-folder-selected="isFolderSelected"
        :is-multiple-selected="isMultipleSelected"
        :is-xml-selected="isXmlSelected"
        :is-file-selected="isFileSelected"
        @action="onAction"
      />
      <b-button v-else-if="isInGroupSelection" v-b-modal.create-group-modal>
        <font-awesome-icon class="icon my-icon" :icon="['fas', 'plus-circle']" />
      </b-button>
      <b-row v-else-if="tab !== 'trash'">
        <b-button v-b-modal.upload-modal v-b-tooltip.hover title="Upload" class="icon action-default">
          <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" />
        </b-button>
        <div v-if="tab !== 'groups'">
          <b-button v-if="showTag" v-b-tooltip.hover title="Hide Tags" class="icon action-default" @click="toggleTag">
            <font-awesome-icon :icon="['fas', 'eye-slash']" />
          </b-button>
          <b-button v-else v-b-tooltip.hover title="Show Tags" class="icon action-default" @click="toggleTag">
            <font-awesome-icon :icon="['fas', 'eye']" />
          </b-button>
        </div>
      </b-row>
    </b-row>
    <b-modal id="upload-modal" ref="uploadModal" hide-footer>
      <b-form @submit.prevent="handleFileUpload">
        <b-form-file
          v-model="uploadedFiles"
          :file-name-formatter="formatUploadFormNames"
          multiple
          placeholder="Choose a file or drop it here..."
          drop-placeholder="Drop file here..."
        />
        <div class="submit-wrapper">
          <b-button class="submit-button" type="submit">
            Submit
          </b-button>
        </div>
      </b-form>
    </b-modal>
    <b-modal id="create-group-modal" ref="createGroupModal" hide-footer>
      <b-form @submit.stop.prevent="handleGroupCreation">
        <b-form-input v-model="form" autofocus placeholder="Group name" />
        <div class="submit-wrapper">
          <b-button class="submit-button" type="submit">
            Submit
          </b-button>
        </div>
      </b-form>
    </b-modal>
    <b-modal id="download-modal" ref="downloadModal" hide-footer>
      <template v-slot:default="{ hide }">
        <b-form @submit="handleItemsDownload">
          <div>
            You downloaded:
            <div class="download-content">
              <div v-for="item in downloadedItems" :key="'downloadItem-' + item.id">
                <label v-if="(item.is_folder)">
                  <font-awesome-icon class="icon my-icon" :icon="['far', 'folder']" />
                </label>
                <label v-else>
                  <font-awesome-icon class="icon my-icon" :icon="['far', 'file']" />
                </label>
                {{ item.name }}
              </div>
            </div>
          </div>
          <div>
            <b-form-checkbox-group
              v-model="download.form"
              :options="download.options"
              class="mb-3 download-checkbox"
              value-field="item"
              text-field="name"
              disabled-field="notEnabled"
            />
          </div>
          <div class="submit-wrapper">
            <b-button class="submit-button" type="submit" @click="hide()">
              Submit
            </b-button>
          </div>
        </b-form>
      </template>
    </b-modal>
    <b-modal ref="xmlSignModal" hide-footer>
      <b-tabs>
        <b-tab title="Auto">
          <div class="submit-wrapper">
            <b-button class="submit-button" type="submit" @click="autoSignXML">
              Sign with User's <Key></Key>
            </b-button>
          </div>
        </b-tab>
        <b-tab title="Manual">
          <b-form @submit.prevent="manualSignXML">
            <b-form-file v-model="xmlFile" class="mt-3" accept=".pem" :state="xmlSignValidation" placeholder="Submit Your Private Key" />
            <b-form-group label="Key Encryption" class="mt-3 text-center">
              <b-form-radio-group v-model="keyType">
                <b-form-radio value="pkcs-1">
                  Pkcs 1
                </b-form-radio>
                <b-form-radio value="pkcs-8">
                  Pkcs 8
                </b-form-radio>
              </b-form-radio-group>
            </b-form-group>
            <b-form-invalid-feedback class="text-center" :state="xmlSignValidation">
              Please submit a private key
            </b-form-invalid-feedback>
            <div class="submit-wrapper">
              <b-button class="submit-button" type="submit">
                Sign
              </b-button>
            </div>
          </b-form>
        </b-tab>
      </b-tabs>
    </b-modal>
    <b-table
      ref="dataTable"
      class="align-left"
      thead-class="font-orange"
      hover
      :fields="modifiedField"
      :items="items"
      :busy="loading"
      show-empty
      selectable
      :select-mode="'multi'"
      @row-selected="onRowSelected"
      @row-dblclicked="onRowDoubleClicked"
    >
      <template v-slot:cell(nameicon)="data">
        <label v-if="(data.item.is_folder)">
          <font-awesome-icon class="icon my-icon" :icon="['far', 'folder']" />
        </label>
        <label v-else>
          <font-awesome-icon class="icon my-icon" :icon="['far', 'file']" />
        </label>
        {{ data.item.name }}
      </template>
      <template>
        Test
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle" />
          <strong>Loading...</strong>
        </div>
      </template>
      <template v-slot:cell(action)="data" class="text-right">
        <b-button @click="fetchGroupData(data.item.id)">
          <font-awesome-icon class="icon my-icon" :icon="['fas', 'cog']" />
        </b-button>
      </template>
    </b-table>
    <InfoModal
      ref="infoModal"
    />
    <GroupModal
      ref="groupModal"
      :group="group"
    />
  </div>
</template>

<script>
import ActionBar from '~/components/filesystem/ActionBar'
import groupManipulation from '~/mixin/groupManipulation'
import GroupModal from '~/components/filesystem/GroupModal'
import InfoModal from '~/components/filesystem/InfoModal'

export default {
  name: 'Table',
  components: {
    ActionBar,
    GroupModal,
    InfoModal
  },
  mixins: [groupManipulation],
  props: {
    loading: {
      type: Boolean,
      default: true
    },
    isActionAllowed: {
      type: Boolean,
      default: true
    },
    isDoubleClickAllowed: {
      type: Boolean,
      default: true
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      fields: [{
        key: 'nameicon',
        label: 'Name'
      },
      {
        key: 'size',
        label: 'Size'
      }],
      selected: [],
      targetItem: [],
      moveList: [],
      uploadedFiles: [],
      downloadedItems: [],
      download: {
        form: [],
        options: [
          { item: 'isDownloadAsZip', name: 'Download as ZIP', notEnabled: false }
        ]
      },
      group: {
        name: '',
        id: '',
        members: [],
        ownerEmail: '',
        rootFolder: ''
      },
      form: '',
      xmlFile: null,
      keyType: 'pkcs-1'
    }
  },
  computed: {
    path () { return this.$store.state.home.path },
    title () { return this.$store.state.home.title },
    showTag () { return this.$store.state.home.options.showTag },
    items () {
      const itemList = this.$store.state.home.itemList.map((val, idx) => Object.assign({ index: idx }, val))
      if (this.showTag && !this.isInGroupSelection && this.tab !== 'trash') {
        let idx
        for (idx in itemList) {
          if (!itemList[idx].is_folder) {
            itemList[idx].tags = this.convertTags(itemList[idx].tags)
          }
        }
        return itemList
      } else {
        return itemList
      }
    },
    tab () { return this.$store.state.home.tab },
    action () { return this.$store.state.home.action },
    isInGroupSelection () { return this.$route.params.id === 'groups' },
    modifiedField () {
      if (this.isInGroupSelection) {
        const groupFields = []
        groupFields.push({
          key: 'nameicon',
          label: 'Name'
        })
        groupFields.push({
          key: 'action',
          label: 'Action'
        })
        return groupFields
      } else {
        const fields = this.fields.slice()
        if (this.tab !== 'trash' && this.showTag) {
          fields.push({
            key: 'tags',
            label: 'Tags'
          })
        }
        return fields
      }
    },
    hiddenPath () {
      const tempPath = this.path.slice()
      tempPath.pop()
      return tempPath
    },
    isFolderSelected () {
      let isFolderExist = false
      let idx
      for (idx in this.selected) {
        if (this.selected[idx].is_folder) {
          isFolderExist = true
        }
      }
      return isFolderExist
    },
    isMultipleSelected () {
      return this.selected.length > 1
    },
    isXmlSelected () {
      if (this.selected.length !== 1) {
        return false
      }
      const fileNameArray = this.selected[0].name.split('.')
      return fileNameArray[fileNameArray.length - 1] === 'xml'
    },
    isFileSelected () {
      let isFileExist = false
      let idx
      for (idx in this.selected) {
        if (!this.selected[idx].is_folder) {
          isFileExist = true
        }
      }
      return isFileExist
    },
    xmlSignValidation () {
      return this.xmlFile !== null
    }
  },
  methods: {
    convertTags (tags) {
      const res = []
      Object.entries(tags).forEach((items) => {
        res.push(items[1])
      })
      return res.toString()
    },
    toggleTag () {
      this.$store.commit('home/toggleShowTag')
    },
    formatUploadFormNames (files) {
      if (files.length === 1) {
        return files[0].name
      } else {
        return `${files.length} files selected`
      }
    },
    onRowSelected (items) {
      this.selected = items
    },
    async onRowDoubleClicked (item, index, event) {
      if (item.is_folder && this.isDoubleClickAllowed) {
        if (this.isInGroupSelection) {
          this.$store.dispatch('home/setLoading', true)
          const rootFolder = await this.getGroupDetail(item.id)
          const data = {
            name: item.name,
            id: rootFolder
          }
          this.$store.dispatch('home/setCurrentGroupId', item.id)
          this.$store.dispatch('home/appendPath', data)
          this.$cookies.set('group_id', item.id, {
            maxAge: 60 * 60,
            secure: false,
            path: '/'
          })
        } else {
          const data = {
            name: item.name,
            id: item.id
          }
          if (this.isPublic) {
            this.$store.dispatch('home/appendPathPublic', data)
          } else {
            this.$store.dispatch('home/appendPath', data)
          }
        }
        this.selected = []
        this.$refs.dataTable.clearSelected()
      }
    },
    onAction (action) {
      if (action.action === 'move') {
        this.$emit('saveItem', this.selected)
        this.selected = []
        this.$store.dispatch('home/setIsMove', true)
      } else if (action.action === 'trash') {
        // TODO: Send to trash
        let idx
        const tempList = []
        for (idx in this.selected) {
          tempList.push({
            name: this.selected[idx].name,
            id: this.selected[idx].id,
            is_folder: this.selected[idx].is_folder
          })
        }
        this.$emit('deleteItems', tempList)
      } else if (action.action === 'download') {
        this.$refs.downloadModal.show()
        this.downloadedItems = this.selected.slice()
        this.download.options[0].notEnabled = false
        let idx
        for (idx in this.selected) {
          if (this.selected[idx].is_folder) {
            this.download.options[0].notEnabled = true
            this.download.form = ['isDownloadAsZip']
          }
        }
      } else if (action.action === 'rename') {
        const splitList = this.selected[0].name.split('.')
        let newName = action.params
        let extension = ''
        if (splitList.length > 1) {
          extension = splitList[splitList.length - 1].split(' ')[0]
          newName = action.params + '.' + extension
        }
        this.$emit('renameItem', {
          id: this.selected[0].id,
          name: newName,
          is_folder: this.selected[0].is_folder
        })
      } else if (action.action === 'share') {
        this.$emit('shareItem', {
          id: this.selected[0].id,
          name: this.selected[0].name,
          is_folder: this.selected[0].is_folder
        })
      } else if (action.action === 'signXML') {
        this.targetItem = this.selected.slice()
        this.xmlFile = null
        this.$refs.xmlSignModal.show()
      } else if (action.action === 'copy') {
        this.$emit('saveItem', this.selected)
        this.$store.dispatch('home/setIsCopy', true)
      } else if (action.action === 'addTag') {
        this.$emit('addTag', { item_id: this.selected[0].id, tag_id: action.ID, tag_name: action.name })
      } else if (action.action === 'removeTag') {
        this.$emit('removeTag', { item_id: this.selected[0].id, tag_id: action.ID })
      } else if (action.action === 'restore') {
        const payload = []
        let idx
        for (idx in this.selected) {
          payload.push({
            id: this.selected[idx].id,
            name: this.selected[idx].name,
            is_folder: this.selected[idx].is_folder
          })
        }
        this.$emit('restoreSoftDeletedItems', payload)
      } else if (action.action === 'log') {
        this.$refs.infoModal.show({ id: this.selected[0].id, is_folder: this.selected[0].is_folder })
      } else if (action.action === 'encode') {
        this.$emit('encodeFile', this.selected[0])
      }
      this.$refs.dataTable.clearSelected()
    },
    commit (action) {
      this.$emit('commitAction', action)
    },
    handleFileUpload (event) {
      this.$refs.uploadModal.hide()
      this.$emit('uploadFiles', this.uploadedFiles)
    },
    handleItemsDownload (event) {
      event.preventDefault()
      let isZip = false
      let idx
      for (idx in this.download.form) {
        if (this.download.form[idx] === 'isDownloadAsZip') {
          isZip = true
        }
      }
      this.$emit('downloadItems', { items: this.downloadedItems, isZip })
    },
    handleGroupCreation (event) {
      this.$refs.createGroupModal.hide()
      this.$emit('createGroup', { name: this.form })
    },
    fetchGroupData (groupId) {
      this.getGroupDetail(groupId)
      this.$refs.groupModal.showModal()
    },
    autoSignXML () {
      this.$emit('signXMLItem', {
        id: this.targetItem[0].id,
        name: this.targetItem[0].name,
        isAuto: true
      })
      this.$refs.xmlSignModal.hide()
    },
    manualSignXML () {
      if (this.xmlFile !== null) {
        this.$emit('signXMLItem', {
          id: this.targetItem[0].id,
          name: this.targetItem[0].name,
          isAuto: false,
          privateKey: this.xmlFile,
          keyType: this.keyType
        })
        this.$refs.xmlSignModal.hide()
      }
    },
    onChangeDirectory (newDir) {
      if (this.isPublic) {
        this.$store.dispatch('home/changeDirectoryPublic', newDir)
      } else {
        this.$store.dispatch('home/changeDirectory', newDir)
      }
    },
    backToRoot () {
      if (this.tab === 'myDrive') {
        this.$store.dispatch('home/moveToRoot')
      } else if (this.tab === 'trash') {
        this.$store.dispatch('home/backToTrash')
      } else if (this.tab === 'share') {
        this.$store.dispatch('home/moveToRootPublic')
      } else if (this.tab === 'groups') {
        this.$store.dispatch('home/moveToRootGroup')
      }
    }
  },
  head () {
    return {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=Open+Sans&display=swap'
        }
      ]
    }
  }
}
</script>

<style>
  .container {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
    font-size: 18px;
    font-family: 'Open Sans', sans-serif
  }

  .action-default {
    border-style: none;
    background-color: #ffefc5;
    color: orange !important;
    min-width: 45px;
    margin-bottom: 5px !important;
  }
  .my-icon {
    min-width: 25px;
    color: orange;
    margin: auto 8% auto 0;
  }

  .align-left {
    text-align: left;
  }

  .icon {
    margin-right: 5%;
  }

  .path-items {
    white-space: nowrap;
    font-size: 2rem;
    display: flex;
    flex-direction: row;
    margin-bottom: 0.5rem;
    margin-right: 1rem;
    padding-top: 0.5rem;
  }

  .action-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    min-height: 110px;
  }

  .path {
    display: flex;
    flex-direction: row;
    border-color: orange;
    color: orange;
  }

  .arrow {
    margin-left: 5%;
  }
  button:hover, .dropdown-toggle {
    border-radius: 8px;
    background-color: #F1F3F4 !important;
    color: orange !important;
  }

  button, .btn {
    margin-top: 0;
    margin-bottom: 0;
    background-color: white !important;
    border-radius: 8px;
    border-color: white;
    font-size: 20px;
    padding-top: 0;
  }

  .path-name:hover, #root-directory:hover {
    border-radius: 20%;
    background-color: #F1F3F4;
  }

  .path-container {
    display: flex;
    flex-direction: row;
    margin-right: 1rem;
  }

  .submit-button {
    align-self: center;
    border-color: orange;
    color: orange;
    border-style: solid;
    border-width: 1px;
  }

  .download-content {
    margin-top: 5%;
    margin-bottom: 5%;
    border-width: 1px;
    border-style: solid;
    padding-top: 2%;
    padding-bottom: 5%;
  }

  .download-checkbox {
    line-height: 1.5;
    color: orange;
  }

  .col {
    padding-left: 5px;
    padding-right: 10px;
  }

  .submit-wrapper {
    margin-top: 5%;
    display: flex;
    justify-content: center;
  }
</style>
