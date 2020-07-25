<template>
  <div class="column-flex" @click="isCookieExpired">
    <b-progress v-if="progress.value !== progress.max" variant="(progress.error) ? primary : error" :value="progress.value" :max="progress.max" :striped="true" />
    <FileNavbar
      :userid="userId"
      :username="userData.name"
      @searchResult="searchResult"
    />
    <div class="content-flex">
      <FileSidebar
        :currentsize="userData.currentSize"
        :maxsize="userData.maxSize"
        @tagName="createTag"
        @groupClicked="groupClicked"
        @trashClicked="trashClicked"
        @active_state="changeState"
        @createFolder="createFolder"
      />
      <Table
        v-if="validFolder"
        ref="table"
        :loading="loading"
        :is-double-click-allowed="isDoubleClickAllowed"
        @uploadFiles="uploadFiles"
        @downloadItems="downloadItems"
        @deleteItems="deleteItems"
        @renameItem="renameItem"
        @saveItem="saveItem"
        @commitAction="commitAction"
        @shareItem="shareItem"
        @signXMLItem="signXMLItem"
        @addTag="addTag"
        @removeTag="removeTag"
        @restoreSoftDeletedItems="restoreSoftDeletedItems"
        @createGroup="createGroup"
        @encodeFile="encodeFile"
      />
      <div v-else>
        Invalid Directory
      </div>
      <balloon
        v-if="(actionItemList.length > 0 && moveOriginalDir !== '')"
        title="Selected Item"
        @close="balloonClose"
      >
        <div v-for="movedFile in actionItemList" :key="'movedFile-' + movedFile.id" class="moved-element">
          <label v-if="(movedFile.is_folder)"><font-awesome-icon class="icon my-icon" :icon="['far', 'folder']" /></label>
          <label v-else><font-awesome-icon class="icon my-icon" :icon="['far', 'file']" /></label>
          <label>{{ movedFile.name }}</label>
        </div>
      </balloon>
      <ShareModal
        ref="shareModal"
        :share="share"
        :user-id="userId"
        :current-dir="currentDir"
      />
    </div>
  </div>
</template>

<script>
import FileNavbar from '~/components/filesystem/FileNavbar'
import FileSidebar from '~/components/filesystem/FileSidebar'
import ShareModal from '~/components/filesystem/ShareModal.vue'
import Table from '~/components/filesystem/Table.vue'
import fileManipulation from '~/mixin/fileManipulation'

export default {
  components: {
    FileSidebar,
    FileNavbar,
    ShareModal,
    Table
  },
  middleware: 'home',
  mixins: [fileManipulation],
  validate ({ store, params, router }) {
    return true
  },
  data () {
    return {
      isDoubleClickAllowed: true,
      validFolder: true,
      share: {
        target: null,
        loading: true,
        sharedUsersFields: [{ key: 'email', label: 'Email' }, { key: 'name', label: 'Name' }, { key: 'accessRevoke', label: 'Revoke Access' }],
        sharedUsers: [],
        linkSharing: false
      },
      progress: {
        value: 0,
        max: 0,
        error: false
      }
    }
  },
  computed: {
    rootId () { return this.$store.state.home.rootId },
    itemList () { return this.$store.state.home.itemList },
    currentDir () { return this.$store.state.home.currentDir },
    userId () { return this.$store.state.home.userId },
    loading () { return this.$store.state.home.loading },
    tab () { return this.$store.state.home.tab },
    userData () { return this.$store.state.home.user }
  },
  async created () {
    this.$axios.defaults.headers.common.Authorization = 'bearer ' + this.$cookies.get('token')
    if (this.$cookies.get('userid') == null) {
      this.$router.push('/auth/login', () => {
        location.reload()
      })
    } else {
      if (this.$route.params.id === 'trash') {
        this.trashClicked()
        this.$store.dispatch('home/setTab', 'trash')
        this.$store.dispatch('home/setPath', [])
        this.isDoubleClickAllowed = false
      } else if (this.$route.params.id === 'groups') {
        this.axiosMountGroupId()
        this.groupClicked()
        this.$store.dispatch('home/setTab', 'groups')
        this.$store.dispatch('home/setPath', [])
      } else if (this.$route.params.groupDirectory !== undefined) {
        this.validFolder = await this.$store.dispatch('home/moveToDirectoryGroup', this.$store.state.home.currentDir)
        this.$store.dispatch('home/setTab', 'groups')
      } else if (this.$route.params.id !== undefined) {
        this.validFolder = await this.$store.dispatch('home/moveToDirectory', this.$store.state.home.currentDir)
        this.$store.dispatch('home/setTab', 'myDrive')
      } else {
        this.myDriveClicked()
        this.$store.dispatch('home/setTab', 'myDrive')
      }
      this.getUserData()
    }
  },
  mounted () {
    // Dependency for baloon component
    const fontAwesomeScript = document.createElement('script')
    fontAwesomeScript.setAttribute('src', 'https://kit.fontawesome.com/c5a39a37b7.js')
    fontAwesomeScript.setAttribute('crossorigin', 'anonymous')
    document.head.appendChild(fontAwesomeScript)
    const xmldsigjs = document.createElement('script')
    xmldsigjs.setAttribute('src', 'https://unpkg.com/xmldsigjs@2.0.30/build/xmldsig.js')
    document.head.appendChild(xmldsigjs)
  },
  methods: {
    axiosMountGroupId () {
      this.$axios.interceptors.request.use((config) => {
        config.params = config.params || {}
        if (this.$cookies.get('group_id')) {
          config.params.group_id = this.$cookies.get('group_id')
        }
        return config
      })
    },
    balloonClose () {
      this.$store.dispatch('home/setActionItemList', [])
      this.$store.dispatch('home/setIsMove', false)
      this.$store.dispatch('home/setIsCopy', false)
    },
    isCookieExpired () {
      if (this.$cookies.get('userid') == null) {
        this.$router.push('/auth/login', () => {
          location.reload()
        })
      }
    },
    /** ****** NAVBAR METHOD ****** */
    searchResult (data) {
      const items = data.data
      const isTag = data.isTag
      this.$store.dispatch('home/setLoading', true)
      const tempList = []
      if (!isTag) {
        Object.entries(items.files).forEach((entry) => {
          let size = parseFloat(entry[1][1])
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
          size = parseFloat(size).toFixed(2) + ' ' + unitList[i]
          tempList.push({ id: entry[0], name: entry[1][0], size, tags: entry[1][2], is_folder: false })
        })
        Object.entries(items.folders).forEach((entry) => {
          tempList.push({ id: entry[0], name: entry[1], is_folder: false })
        })
      } else {
        Object.entries(items).forEach((entry) => {
          let size = parseFloat(entry[1][1])
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
          size = parseFloat(size).toFixed(2) + ' ' + unitList[i]
          tempList.push({ id: entry[0], name: entry[1][0], size, tags: entry[1][2], is_folder: false })
        })
      }
      this.$store.dispatch('home/showSearch', tempList)
      this.$store.dispatch('home/setLoading', false)
    },
    /** ****** SIDEBAR METHOD  ****** **/
    async createTag (tagName) {
      const endpoint = '/tags'

      const formData = new FormData()
      formData.append('name', tagName)

      try {
        return await this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, '')).then((response) => {
          if (response.data.status === '200 OK') {
            this.successToast('Tag Created')
            return response.data.data
          }
        })
      } catch (e) {
        this.error = e.data.message
        return null
      }
    },
    async addTag (params) {
      /**
       *  PERLU VALIDASI AGAR TAG TIDAK DUPLIKASI PADA ITEM YANG SAMA
       */
      if (params.tag_id === false) {
        if (confirm('The tag has not been created. Create a new tag?')) {
          params.tag_id = await this.createTag(params.tag_name)
        }
      }
      if (params.tag_id !== null) {
        const endpoint = '/tags/add'
        const formData = new FormData()
        const item = 'file_id'
        formData.append(item, params.item_id)
        formData.append('tag_id', params.tag_id)
        this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, '')).then((response) => {
          if (response.data.status === '200 OK') {
            this.successToast('Tag Added')
            this.$store.dispatch('home/moveToDirectory', this.currentDir)
          } else {
            this.errorToast(response.data.message)
          }
        })
      } else {
        this.errorToast('Add Tag failed')
      }
    },
    async removeTag (params) {
      // Cari dulu apakah tag yang dimaksud memang benar attached ke file
      if (params.tag_id !== false) {
        let endpoint = '/files?file_id='
        let foundTagInFile = false
        endpoint += params.item_id
        try {
          const tagList = await this.$axios.get(endpoint, this.generateHeaders(this.userId, '')).then((response) => {
            return response.data.data.tags
          })
          for (const tag in tagList) {
            if (tag === params.tag_id) {
              foundTagInFile = true
              break
            }
          }
        } catch (e) {
          this.error = e.response.data.message
        }
        if (foundTagInFile) {
          endpoint = '/tags/remove'
          const formData = new FormData()
          formData.append('tag_id', params.tag_id)
          formData.append('file_id', params.item_id)
          this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, '')).then((response) => {
            if (response.data.status === '200 OK') {
              this.successToast('Tag Removed')
              this.$store.dispatch('home/moveToDirectory', this.currentDir)
            } else {
              this.errorToast(response.data.message)
            }
          })
        } else {
          this.errorToast('Tag Not Attached to File')
        }
      } else {
        this.errorToast('Tag Not Found')
      }
      // Jika ya, maka buang
      // Jika tidak, keluar pesan ga ada
    },
    trashClicked () {
      this.$store.dispatch('home/backToTrash')
    },
    groupClicked () {
      this.$store.dispatch('home/backToGroup')
    },
    myDriveClicked () {
      this.$store.dispatch('home/backToMyDrive')
    },
    changeState (newState) {
      this.$store.dispatch('home/setTab', newState)
      this.$store.dispatch('home/setPath', [])
      this.$cookies.remove('group_id', {
        path: '/'
      })
      if (newState === 'myDrive') {
        if (this.$route.params.id === undefined && this.$route.params.groupDirectory === undefined) {
          this.myDriveClicked()
        } else {
          this.$router.replace('/home')
        }
      } else if (newState === 'trash') {
        if (this.$route.params.id === 'trash') {
          this.trashClicked()
        } else {
          this.$router.replace('/home/trash')
        }
      } else if (newState === 'groups') {
        if (this.$route.params.id === 'groups') {
          this.groupClicked()
        } else {
          this.$router.replace('/home/groups')
        }
      }
    },
    createGroup (params) {
      this.$store.dispatch('home/setLoading', true)
      const endpoint = '/groups'
      const formData = new FormData()
      formData.append('name', params.name)
      this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, '')).then((response) => {
        this.$store.dispatch('home/prepareMyDrive', this.$cookies.get('userid')).then(() => {
          this.groupClicked()
        })
      })
    }
  },
  head () {
    return {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=PT+Sans&display=swap' }
      ]
    }
  }
}
</script>

<style>
  body {
    background-color: white !important;
  }
  .column-flex {
    display: flex;
    flex-direction: column;
    font-family: 'PT Sans', sans-serif;
  }

  .content-flex {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin-top: 3%;
  }

  .moved-element {
    margin-top: 10px;
    margin-left: 5px;
    display: flex;
    flex-direction: row;
    zoom: 0.8;
  }

  .submit-wrapper {
    border-color: orange;
    color: orange;
    margin-top: 5%;
  }

  .icon {
    cursor: pointer;
  }

  @media screen and (max-width: 800px) {
    .content-flex {
      flex-direction: column;
    }
  }
</style>
