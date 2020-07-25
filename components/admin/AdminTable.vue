<template>
  <div>
    <Spinner v-if="loading" />
    <Table
      v-else
      :type="tableType"
      :items="itemList"
      @demoteId="demote"
    />
  </div>
</template>

<script>
import Spinner from '~/components/admin/Spinner'
import Table from '~/components/admin/Table'
import admin from '~/assets/js/admin'
export default {
  name: 'AdminTable',
  components: { Spinner, Table },
  data () {
    return {
      tableType: 'admins',
      itemList: [],
      loading: 0
    }
  },
  mounted () {
    this.getAdmin()
  },
  methods: {
    async getAdmin () {
      this.loading++
      const endpoint = '/app/admin'
      const response = await this.$axios.get(endpoint)
      this.itemList = response.data.data
      this.loading--
    },
    async demote (adminId) {
      const endpoint = '/app/admin?user_id=' + adminId
      const response = await this.$axios.delete(endpoint)
      if (response.data.status === '200 OK') {
        admin.displayStatus('status-green', 'Admin demoted')
        this.getAdmin()
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + response.data.message)
      }
    }
  }
}
</script>

<style scoped>

</style>
