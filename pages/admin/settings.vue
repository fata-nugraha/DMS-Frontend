<template>
  <div id="content">
    <b-tabs fill>
      <b-tab title="Settings">
        <Settings />
      </b-tab>
      <b-tab title="Admin">
        <AdminTable />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import Settings from '~/components/admin/Settings.Vue'
import AdminTable from '~/components/admin/AdminTable.Vue'
export default {
  layout: 'admin',
  components: {
    AdminTable,
    Settings
  }
}
</script>
