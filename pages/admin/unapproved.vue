<template>
  <div id="content">
    <div v-if="loading">
      <Spinner />
    </div>
    <div v-else>
      <h1>
        <div class="clickable" @click="goToUsers()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" /></svg>
          &nbsp;Waiting for approval
        </div>
      </h1>
      <div id="table">
        <EmailTable
          :items="itemList"
          :page="page"
          @approveID="approveID"
          @rejectID="rejectID"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  svg {
    vertical-align: top;
    margin-top: 5px;
  }

  .clickable {
    max-width: 250px;
  }

  .clickable:hover {
    color: var(--admin1);
    cursor: pointer;
  }

  .clickable:hover svg {
    filter: var(--filter-to-admin1);
  }
</style>

<script>
import EmailTable from '../../components/admin/EmailTable'
import Spinner from '../../components/admin/Spinner'
import admin from '../../assets/js/admin'

export default {
  layout: 'admin',
  components: {
    EmailTable, Spinner
  },
  data () {
    return {
      itemList: [],
      page: 'unapproved',
      loading: 0
    }
  },
  created () {
    admin.setActiveTab()
    this.getPendingUsers()
  },
  methods: {

    async getPendingUsers () {
      this.loading++
      this.itemList = []
      const url = '/app/pending'
      const resp = await this.$axios.get(url)
      const arrData = Object.entries(resp.data.data)
      for (let i = 0; i < arrData.length; i++) {
        if (!arrData[i][1][1]) {
          this.itemList.push({
            id: arrData[i][0],
            email: arrData[i][1][0]
          })
        }
      }
      this.loading--
    },

    async approveID (id) {
      const data = {
        pending_user_id: id
      }
      const url = '/app/pending'
      const resp = await this.$axios.post(url, data)
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'Email approved')
        this.getPendingUsers()
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
      }
    },

    async rejectID (id) {
      const url = '/app/pending?' + 'pending_user_id=' + id
      const resp = await this.$axios.delete(url)
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'Email rejected')
        this.getPendingUsers()
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
      }
    },

    goToUsers () {
      this.$router.push('/admin/users')
    }

  }
}
</script>
