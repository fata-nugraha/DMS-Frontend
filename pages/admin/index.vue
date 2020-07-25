<template>
  <div id="content">
    <div v-if="loading">
      <Spinner />
    </div>
    <div v-else>
      <div id="users" class="feature" @click="goTo('users')">
        <h1>Users List</h1>
        <p>View information and manage the list of {{ users }} users in the system.</p>
      </div>

      <div v-if="unapproved > 0" id="unapproved" class="feature unapproved" @click="goTo('unapproved')">
        <h1>Unapproved Emails</h1>
        <p>There are {{ unapproved }} emails waiting for your approval.</p>
      </div>

      <div id="groups" class="feature" @click="goTo('groups')">
        <h1>Groups List</h1>
        <p>View information and manage the list of {{ groups }} groups in the system.</p>
      </div>

      <div id="settings" class="feature" @click="goTo('settings')">
        <h1>Settings</h1>
        <p>Control the default storage limit for users and groups, enable or disable encrytion, and manage trusted emails in the system.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .feature {
    width: 100%;
    padding: 10px 30px;
    border: 1px solid var(--admin5);
    margin-bottom: 10px;
    transition-duration: 0.2s;
  }

  .unapproved {
    color: var(--admin10);
    background-color: var(--admin14);
  }

  .unapproved h1 {
    color: var(--admin10) !important;
  }

  .feature:hover {
    box-shadow: 1px 1px 10px lightgray;
    transform: translate(-2px, -2px);
    transition-duration: 0.2s;
  }

  .feature:hover h1 {
    color: var(--admin1);
  }
</style>>

<script>
import Spinner from '../../components/admin/Spinner'
import admin from '../../assets/js/admin'

export default {
  layout: 'admin',
  components: {
    Spinner
  },
  data () {
    return {
      loading: 0,
      unapproved: 0,
      users: 0,
      groups: 0
    }
  },
  created () {
    admin.setActiveTab()
    this.getUserCount()
    this.getPendingUserCount()
    this.getGroupCount()
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

    async getUserCount () {
      this.loading++
      const url = '/app/users'
      const resp = await this.$axios.get(url)
      const arrData = Object.entries(resp.data.data)
      for (let i = 0; i < arrData.length; i++) {
        this.users++
      }
      this.loading--
    },

    async getGroupCount () {
      this.loading++
      const url = '/app/groups'
      const resp = await this.$axios.get(url)
      const arrData = Object.entries(resp.data.data)
      for (let i = 0; i < arrData.length; i++) {
        this.groups++
      }
      this.loading--
    },

    goTo (page) {
      this.$router.push('/admin/' + page)
    }
  }
}
</script>
