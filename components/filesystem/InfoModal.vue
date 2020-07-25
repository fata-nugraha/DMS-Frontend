<template>
  <b-modal ref="infoModal" size="lg" responsive hide-footer>
    <b-tabs>
      <b-tab title="Log">
        <div class="modal-body" style="overflow-y: auto;">
          <div v-if="log.loading" class="tabs-content">
            <b-spinner class="align-middle" />
            <strong>Loading...</strong>
          </div>
          <label v-else-if="log.item.length === 0">There is no log in this item</label>
          <b-table
            v-else
            :fields="log.fields"
            :items="log.item"
          />
        </div>
      </b-tab>
      <b-tab v-if="!isFolder" title="Tag">
        <div class="modal-body" style="overflow-y: auto;">
          <div v-if="tag.loading" class="tabs-content">
            <b-spinner class="align-middle" />
            <strong>Loading...</strong>
          </div>
          <label v-else-if="tag.item.length === 0">There is no tag in this item</label>
          <b-table
            v-else
            :fields="tag.fields"
            :items="tag.item"
          />
        </div>
      </b-tab>
    </b-tabs>
  </b-modal>
</template>

<script>
import logManipulation from '~/mixin/logManipulation'
import fileManipulation from '~/mixin/fileManipulation'
export default {
  name: 'InfoModal',
  mixins: [fileManipulation, logManipulation],
  data () {
    return {
      isFolder: false,
      log: {
        fields: [{
          key: 'ip',
          label: 'Ip'
        },
        {
          key: 'operation',
          label: 'Operation'
        },
        {
          key: 'username',
          label: 'Username'
        },
        {
          key: 'time',
          label: 'Time'
        }],
        item: [],
        loading: false
      },
      tag: {
        fields: [{
          key: 'name',
          label: 'Name'
        }],
        item: [],
        loading: false
      }
    }
  },
  computed: {
    userId () { return this.$store.state.home.userId }
  },
  methods: {
    show (data) {
      const itemId = data.id
      this.isFolder = data.is_folder
      this.$refs.infoModal.show()
      this.log.loading = true
      this.getLog(itemId).then((response) => {
        this.log.item = response.data.data
        this.log.loading = false
      })
      if (!this.isFolder) {
        this.tag.loading = true
        this.getItemData(itemId).then((response) => {
          this.tag.item = this.convertData(response.data.data.tags)
          this.tag.loading = false
        })
      }
    },
    convertData (item) {
      const arr = []
      Object.entries(item).forEach((entry) => {
        arr.push({ id: entry[0], name: entry[1] })
      })
      return arr
    }
  }
}
</script>

<style scoped>

</style>
