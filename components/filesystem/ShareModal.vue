<template>
  <div>
    <b-modal id="share-modal" ref="shareModal" hide-footer hide-header>
      <b-tabs>
        <b-tab title="User Sharing">
          <b-tabs class="tabs-content">
            <b-tab title="Add User">
              <b-form>
                <b-form-input v-model="form.data" placeholder="Email" required type="email" />
                <div class="submit-wrapper">
                  <b-button class="auth-button submit-button" type="submit" @click="shareToUser">
                    Submit
                  </b-button>
                </div>
              </b-form>
            </b-tab>
            <b-tab title="Shared Users" @click="getSharedUsers">
              <b-table
                :items="sharedUserModified"
                :fields="share.sharedUsersFields"
                :busy="share.loading"
                show-empty
              >
                <template v-slot:cell(accessRevoke)="data" class="text-center">
                  <font-awesome-icon
                    class="icon my-icon"
                    :icon="['fas', 'user-minus']"
                    @click="revokeShareUser(data.item.email)"
                  />
                </template>
                <template v-slot:table-busy>
                  <div class="text-center text-danger my-2">
                    <b-spinner class="align-middle" />
                    <strong>Loading...</strong>
                  </div>
                </template>
              </b-table>
            </b-tab>
          </b-tabs>
        </b-tab>
        <b-tab title="Link Sharing">
          <b-form class="tabs-content">
            <b-form-input v-model="form.data" placeholder="Password" required type="text" />
            <div class="link-action d-flex justify-content-around">
              <b-button class="submit-button" aria-controls="collapse-4" @click="updateLinkSharing">
                <label v-if="share.linkSharing">
                  Update Password
                </label>
                <label v-else>
                  Add Password
                </label>
              </b-button>
              <b-button v-if="share.linkSharing" class="submit-button" @click="revokeLinkSharing">
                <label>
                  Revoke Link
                </label>
              </b-button>
            </div>
          </b-form>
          <b-collapse v-if="(share.linkSharing)" id="collapse-4" v-model="share.linkSharing" class="mt-2">
            You can use this to share your item:
            <b-card class="small text-center">
              http://localhost:3000/home/share/{{ share.target.id }}
            </b-card>
          </b-collapse>
        </b-tab>
      </b-tabs>
    </b-modal>
  </div>
</template>

<script>
import toast from '~/mixin/toast'

export default {
  name: 'ShareModal',
  mixins: [toast],
  props: {
    share: {
      type: Object,
      default () {
        return {
          target: null,
          loading: true,
          sharedUsersFields: [{ key: 'email', label: 'Email' }, { key: 'name', label: 'Name' }, { key: 'accessRevoke', label: 'Revoke Access' }],
          sharedUsers: [],
          linkSharing: false
        }
      }
    },
    userId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      active: false,
      form: {
        data: ''
      }
    }
  },
  computed: {
    currentDir () { return this.$store.state.home.currentDir },
    sharedUserModified () {
      const res = []
      let idx
      for (idx in this.share.sharedUsers) {
        if (this.share.sharedUsers.email !== null && this.share.sharedUsers.email !== undefined) {
          res.push(this.share.sharedUsers[idx])
        }
      }
      return res
    }
  },
  methods: {
    showModal () {
      this.$refs.shareModal.show()
    },
    updateLinkSharing () {
      let itemType = 'file'
      if (this.share.target.is_folder) {
        itemType = 'folder'
      }
      const endpoint = '/' + itemType + 's/share/public'
      const formData = new FormData()
      formData.append(itemType + '_id', this.share.target.id)
      formData.append('password', this.form.data)
      this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, this.currentDir)).then((response) => {
        if (response.data.status === '200 OK') {
          this.share.linkSharing = true
          this.successToast('Link sharing updated')
        } else {
          this.errorToast(response.data.message)
        }
      }).catch(() => {
        this.errorToast('There is something wrong')
      })
    },
    revokeLinkSharing () {
      let itemType = 'file'
      if (this.share.target.is_folder) {
        itemType = 'folder'
      }
      const endpoint = '/' + itemType + 's/share/private'
      const formData = new FormData()
      formData.append(itemType + '_id', this.share.target.id)
      this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, this.currentDir)).then((response) => {
        if (response.data.status === '200 OK') {
          this.successToast('Link sharing revoked')
        } else {
          this.errorToast(response.data.message)
        }
      }).catch(() => {
        this.errorToast('There is something wrong')
      })
      this.share.linkSharing = false
    },
    async getSharedUsers () {
      this.share.loading = true
      let itemType = 'file'
      if (this.share.target.is_folder) {
        itemType = 'folder'
      }
      const endpoint = '/' + itemType + 's?' + itemType + '_id=' + this.share.target.id
      const formData = new FormData()
      formData.append(itemType + '_id', this.share.target.id)
      formData.append('password', this.form.data)
      const resp = await this.$axios.get(endpoint, this.generateHeaders(this.userId, this.currentDir)).then((response) => {
        return response.data.data
      })
      if (resp.shared != null) {
        const tempList = []
        Object.entries(resp.shared).forEach((entry) => {
          tempList.push({
            id: entry[0],
            name: entry[1][0],
            email: entry[1][1]
          })
        })
        this.share.sharedUsers = tempList
      }
      this.share.loading = false
    },
    shareToUser (event) {
      event.preventDefault()
      let itemType = 'file'
      if (this.share.target.is_folder) {
        itemType = 'folder'
      }
      const endpoint = '/' + itemType + 's/share'
      const formData = new FormData()
      formData.append(itemType + '_id', this.share.target.id)
      formData.append('target_email', this.form.data)
      this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, this.currentDir)).then((response) => {
        if (response.data.status === '200 OK') {
          this.successToast('User has been added')
        } else {
          this.errorToast(response.data.message)
        }
      }).catch(() => {
        this.errorToast('Failed to add user')
      })
    },
    revokeShareUser (userEmail) {
      let itemType = 'file'
      if (this.share.target.is_folder) {
        itemType = 'folder'
      }
      const endpoint = '/' + itemType + 's/unshare'
      const formData = new FormData()
      formData.append(itemType + '_id', this.share.target.id)
      formData.append('target_email', userEmail)
      this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, this.currentDir)).then((response) => {
        if (response.data.status === '200 OK') {
          this.successToast('User removed')
        } else {
          this.errorToast(response.data.message)
        }
        this.getSharedUsers()
      }).catch(() => {
        this.errorToast('There is something wrong')
      })
    },
    generateHeaders (userId, currentDir) {
      return {
        headers: {
          user_id: userId,
          current_dir: currentDir
        }
      }
    }
  }
}
</script>

<style scoped>
  .link-action {
    display: flex;
    flex-direction: row;
    margin-top: 5%;
  }

  .submit-button {
    align-self: center;
    border-color: orange;
    color: orange;
    border-style: solid;
    border-width: 1px;
  }

  .tabs-content {
    margin-top: 5%
  }
</style>
