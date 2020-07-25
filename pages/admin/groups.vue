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
      <div id="table">
        <Table
          :items="itemList"
          :type="tableType"
          @changeStorageId="changeStorageId"
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
      itemList: [],
      tableType: 'groups',
      loading: false,

      removeIdPopUp: {
        header: 'Remove Group',
        message: 'Are you sure you want to remove this group from the group list?',
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
    this.getGroups()
  },
  methods: {

    async getGroups () {
      this.loading++
      this.itemList = []
      const url = '/app/groups'
      const resp = await this.$axios.get(url)
      const respData = resp.data.data
      for (let i = 0; i < respData.length; i++) {
        const ownerInfo = Object.entries(respData[i].owner)[0]
        // const ownerId = ownerInfo[0]
        // const ownerName = ownerInfo[1][0]
        const ownerEmail = ownerInfo[1][1]
        this.itemList.push({
          id: respData[i].id,
          name: respData[i].name,
          email: ownerEmail,
          usedStorage: admin.adjustSize(respData[i].storage),
          storageLimit: respData[i].maxsize / 1073741824,
          newStorageLimit: respData[i].maxsize / 1073741824,
          buttonEnabled: false
        })
      }
      this.loading--
    },

    async changeStorageId (groupData) {
      const data = {
        group_id: groupData.id,
        size: groupData.storageLimit
      }
      const url = '/app/groups'
      const resp = await this.$axios.post(url, data)
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'Storage limit successfully updated')
        this.getGroups()
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
      const url = '/app/groups?' + 'group_id=' + id
      const resp = await this.$axios.delete(url)
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'Group removed from groups list')
        this.getGroups()
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
      }
    }
  }
}
</script>
