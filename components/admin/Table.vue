<template>
  <div id="table">
    <b-table
      hover
      no-border-collapse
      :items="items"
      :fields="shown_fields"
    >
      <template v-slot:cell()="data">
        <div class="row-attr">
          {{ data.value }}
        </div>
      </template>

      <template v-slot:cell(usedStorage)="data">
        <div class="row-attr">
          {{ data.value }} <span class="subtitle"> out of </span>
        </div>
      </template>

      <template v-slot:cell(storageLimit)="row">
        <div class="dropdown" contenteditable="true">
          <input
            v-model="row.item.newStorageLimit"
            type="number"
            autocomplete="off"
            min="0.1"
            max="1"
            step="0.1"
            @keydown.enter="changeStorage(row.item)"
          >
          <div class="extra">
            GB
          </div>
          <select v-model="row.item.newStorageLimit">
            <option value="0.1">
              100 MB
            </option>
            <option value="0.5">
              500 MB
            </option>
            <option value="1">
              1 GB
            </option>
          </select>
        </div>
        <button class="btn-submit" @click="changeStorage(row.item)">
          Change
        </button>
        <div :id="row.item.id" class="feedback" />
      </template>

      <template v-slot:cell(action)="row">
        <button v-if="type !== 'admins'" class="action-btn btn-red" @click="remove(row.item)">
          Remove
        </button>
        <button v-if="type === 'users'" class="action-btn btn-green" @click="promote(row.item)">
          Promote to Admin
        </button>
        <button v-else-if="type === 'admins'" class="action-btn btn-red" @click="demote(row.item)">
          Demote
        </button>
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

  .storagelimit-column {
    min-width: 110px;
  }

  .action-btn {
    float: right;
    margin: 0 0 0 5px;
  }

  .feedback {
    display: none;
    padding: 5px 0;
  }
</style>

<style>
  .action-column {
    min-width: 150px;
  }

  .storagelimit-column {
    min-width: 110px;
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
    type: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data () {
    if (this.type === 'users') {
      return {
        shown_fields: [
          {
            key: 'selected',
            label: ''
          },
          {
            key: 'name'
          },
          {
            key: 'email'
          },
          {
            key: 'usedStorage'
          },
          {
            key: 'storageLimit',
            label: '',
            class: 'storagelimit-column'
          },
          {
            key: 'action',
            label: '',
            class: 'action-column'
          }
        ]
      }
    } else if (this.type === 'admins') {
      return {
        shown_fields: [
          {
            key: 'selected',
            label: ''
          },
          {
            key: 'name'
          },
          {
            key: 'email'
          },
          {
            key: 'action',
            label: '',
            class: 'action-column'
          }
        ]
      }
    } else {
      return {
        shown_fields: [
          {
            key: 'selected',
            label: ''
          },
          {
            key: 'name',
            label: 'Group Name'
          },
          {
            key: 'email',
            label: 'Owner Email'
          },
          {
            key: 'usedStorage'
          },
          {
            key: 'storageLimit',
            label: '',
            class: 'storagelimit-column'
          },
          {
            key: 'action',
            label: '',
            class: 'action-column'
          }
        ]
      }
    }
  },
  methods: {
    promote (item) {
      this.$emit('promoteId', item.id)
    },
    demote (item) {
      this.$emit('demoteId', item.id)
    },
    remove (item) {
      this.$emit('removeId', item.id)
    },
    changeStorage (item) {
      if (item.newStorageLimit >= 0.1 && item.newStorageLimit <= 1) {
        if (item.newStorageLimit !== item.storageLimit) {
          this.$emit('changeStorageId', { id: item.id, storageLimit: item.newStorageLimit })
          document.getElementById(item.id).innerHTML = 'Saving...'
          document.getElementById(item.id).style.color = 'var(--admin9)'
          document.getElementById(item.id).style.display = 'block'
        } else {
          document.getElementById(item.id).innerHTML = 'Unchanged'
          document.getElementById(item.id).style.color = 'var(--admin9)'
          document.getElementById(item.id).style.display = 'block'
          setTimeout(() => {
            document.getElementById(item.id).innerHTML = ''
            document.getElementById(item.id).style.display = 'none'
          }, 1200)
        }
      } else if (item.newStorageLimit < 0.1) {
        document.getElementById(item.id).innerHTML = 'Size must be at least 0.1 GB.'
        document.getElementById(item.id).style.color = 'var(--admin10)'
        document.getElementById(item.id).style.display = 'block'
      } else if (item.newStorageLimit > 1) {
        document.getElementById(item.id).innerHTML = 'Size must be equal or under 1 GB.'
        document.getElementById(item.id).style.color = 'var(--admin10)'
        document.getElementById(item.id).style.display = 'block'
      }
    }
  }
}
</script>
