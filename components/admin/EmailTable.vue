<template>
  <div id="table">
    <b-table
      hover
      no-border-collapse
      :items="items"
      thead-class="hidden-element"
      :fields="shown_fields"
    >
      <template v-slot:cell()="data">
        <div class="row-attr">
          {{ data.value }}
        </div>
      </template>

      <template v-slot:cell(actions)="row">
        <template v-if="page === 'unapproved'">
          <button class="action-btn btn-red" @click="reject(row.item)">
            Reject
          </button>
          <button class="action-btn btn-green" @click="approve(row.item)">
            Approve
          </button>
        </template>

        <template v-if="page === 'settings'">
          <button class="action-btn btn-red" @click="remove(row.item)">
            Remove
          </button>
        </template>
      </template>
    </b-table>
  </div>
</template>

<style scoped>
  #table {
    margin-top: 12px;
  }

  .row-attr {
    vertical-align: bottom;
  }

  .action-btn {
    width: 80px;
    float: right;
    margin: 0 0 0 5px;
  }
</style>

<style>
  .action-column {
    min-width: 200px;
  }
</style>

<script>
export default {
  props: {
    items: {
      type: Array,
      default () {
        return []
      }
    },
    page: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data () {
    return {
      shown_fields: [
        {
          key: 'email'
        },
        {
          key: 'actions',
          class: 'action-column'
        }
      ]
    }
  },
  methods: {
    approve (item) {
      this.$emit('approveID', item.id)
    },
    reject (item) {
      this.$emit('rejectID', item.id)
    },
    remove (item) {
      this.$emit('remove', item.email)
    }
  }
}
</script>
