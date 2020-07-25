<template>
  <div id="content">
    <PopUp
      :header="removeIdPopUp.header"
      :message="removeIdPopUp.message"
      :buttons="removeIdPopUp.buttons"
      :visible="removeIdPopUp.visible"
      @removeId="removeId"
      @cancel="cancel"
    />

    <div v-if="loading">
      <Spinner />
    </div>
    <div v-else>
      <div v-if="unapproved" id="users-unapproved" class="notice">
        <b>{{ unapproved }} emails</b> waiting for your approval.
        <div class="notice-action" @click="goToUnapproved()">
          <u>REVIEW</u>
        </div>
      </div>
      <div id="table">
        <Table
          :items="itemList"
          :type="tableType"
          @changeStorageId="changeStorageId"
          @promoteId="promoteId"
          @removeId="confirmRemoveId"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Table from '../../components/admin/Table'
import Spinner from '../../components/admin/Spinner'
import PopUp from '../../components/admin/PopUp'
import admin from '../../assets/js/admin'

export default {
  layout: 'admin',
  components: {
    Table, Spinner, PopUp
  },
  data () {
    return {
      itemList: [
      ],
      tableType: 'users',
      unapproved: 0,
      loading: 0,

      removeIdPopUp: {
        header: 'Remove User',
        message: 'Are you sure you want to remove this user from the user list?',
        buttons: [
          { name: 'Yes', class: 'btn-submit', emit: 'removeId', emitData: '' },
          { name: 'Cancel', class: '', emit: 'cancel', emitData: '' }
        ],
        visible: false
      }

    }
  },
  created () {
    admin.setActiveTab()
    this.getUsers()
    this.getPendingUserCount()
  },
  methods: {

    async getPendingUserCount () {
      this.loading++
      const url = '/app/pending'
      const resp = await this.$axios.get(url)
      const arrData = Object.entries(resp.data.data)
      for (let i = 0; i < arrData.length; i++) {
        if (!arrData[i][1][1]) {
          this.unapproved++
        }
      }
      this.loading--
    },

    async getUsers () {
      this.loading++
      this.itemList = []
      const url = '/app/users'
      const resp = await this.$axios.get(url)
      const respData = resp.data.data
      for (let i = 0; i < respData.length; i++) {
        this.itemList.push({
          id: respData[i].id,
          name: respData[i].name,
          email: respData[i].email,
          usedStorage: admin.adjustSize(respData[i].storage),
          storageLimit: respData[i].maxsize / 1073741824,
          newStorageLimit: respData[i].maxsize / 1073741824,
          buttonEnabled: false
        })
      }
      this.loading--
    },

    goToUnapproved () {
      this.$router.push('/admin/unapproved')
    },

    async changeStorageId (userData) {
      const data = {
        user_id: userData.id,
        size: userData.storageLimit
      }
      const url = '/app/users'
      const resp = await this.$axios.post(url, data)
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'Storage limit successfully updated')
        this.getUsers()
      } else {
        admin.displayStatus('status-red', 'Error: ' + resp.data.message)
      }
    },

    confirmRemoveId (id) {
      this.removeIdPopUp.buttons[0].emitData = id
      this.removeIdPopUp.visible = true
    },

    cancel () {
      this.removeIdPopUp.visible = false
    },

    async removeId (id) {
      const url = '/app/users?' + 'user_id=' + id
      const resp = await this.$axios.delete(url)
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'User removed from users list')
        this.getUsers()
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
      }
    },
    async promoteId (id) {
      const url = '/app/admin'
      const formData = new FormData()
      formData.append('user_id', id)
      const resp = await this.$axios.post(url, formData)
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'User promoted to admin')
        this.getUsers()
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
      }
    }
  }
}
</script>
