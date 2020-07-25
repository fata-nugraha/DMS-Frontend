<template>
  <div class="column-flex">
    <b-progress v-if="progress.value !== progress.max" variant="(progress.error) ? primary : error" :value="progress.value" :max="progress.max" :striped="true" />
    <div class="content-flex">
      <FileSidebar
        :is-public="isPublic"
        @createFolder="createFolder"
      />
      <Table
        v-if="validFolder"
        ref="table"
        :loading="loading"
        :is-double-click-allowed="true"
        :is-public="isPublic"
        @uploadFiles="uploadFiles"
        @downloadItems="downloadItems"
        @deleteItems="deleteItems"
        @renameItem="renameItem"
        @saveItem="saveItem"
        @commitAction="commitAction"
        @shareItem="shareItem"
        @signXMLItem="signXMLItem"
      />
      <div v-else>
        Invalid Directory
      </div>
    </div>
    <b-modal
      id="password-modal"
      ref="passModal"
      title="Enter your password"
      hide-footer
      :no-close-on-esc="true"
      :no-close-on-backdrop="true"
      :hide-header-close="true"
      @ok-only="true"
      @show="resetModal"
      @hidden="resetModal"
      @close="handleClose"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          :state="passwordState"
          label="Password"
          label-for="password-input"
          invalid-feedback="Invalid password"
        >
          <b-form-input
            id="name-input"
            v-model="password"
            :state="passwordState"
            type="password"
            required
          />
          <div class="submit-wrapper">
            <b-button class="submit-button" type="submit">
              Submit
            </b-button>
          </div>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
import Table from '~/components/filesystem/Table.vue'
import fileManipulation from '~/mixin/fileManipulation'
import FileSidebar from '~/components/filesystem/FileSidebar'

export default {
  components: {
    FileSidebar,
    Table
  },
  mixins: [fileManipulation],
  data () {
    return {
      progress: {
        value: 0,
        max: 0,
        error: false
      },
      password: '',
      passwordState: null,
      validFolder: true
    }
  },
  computed: {
    loading () { return this.$store.state.home.loading },
    currentDir () { return this.$store.state.home.currentDir },
    virtualId () { return this.$store.state.home.virtualId }
  },
  mounted () {
    this.isPublic = true
    this.$store.dispatch('home/setTab', 'share')
    if (this.virtualId === '') {
      this.$store.dispatch('home/setItemList', [])
      this.$store.dispatch('home/setPath', [])
      this.$refs.passModal.show()
    } else {
      this.moveToDir(this.$route.params.id)
    }
  },
  methods: {
    resetModal () {
      this.password = ''
      this.passwordState = null
    },
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      this.handleSubmit()
    },
    handleClose (bvModalEvt) {
      bvModalEvt.preventDefault()
    },
    handleSubmit () {
      const endpoint = '/auth/virtual'
      const formData = new FormData()
      formData.append('id', this.$route.params.id)
      formData.append('password', this.password)
      this.$axios.post(endpoint, formData).then((response) => {
        if (response.data.status === '200 OK') {
          this.passwordState = true
          this.$store.dispatch('home/setVirtualId', response.data.data)
          this.$store.dispatch('home/setRootId', this.$route.params.id)
          this.moveToDir(this.$route.params.id)
          this.$nextTick(() => {
            this.$bvModal.hide('password-modal')
          })
        } else {
          this.passwordState = false
        }
      })
    }
  }
}
</script>

<style>
  body {
    background-color: white;
  }

  .column-flex {
    display: flex;
    flex-direction: column;
    font-family: 'PT Sans', sans-serif;
  }

  .content-flex {
    display: flex;
    flex-direction: row;
    margin-top: 3%;
  }

  .moved-element {
    margin-top: 10px;
    margin-left: 5px;
    display: flex;
    flex-direction: row;
    zoom: 0.8;
  }

  .submit-wrapper {
    border-color: orange;
    color: orange;
    margin-top: 5%;
  }

  .link-action {
    display: flex;
    flex-direction: row;
    margin-top: 5%;
  }

  .user-sharing-tabs {
    margin-top: 5%;
  }

  .icon {
    cursor: pointer;
  }

  .button {
    border-style: solid;
    border-width: 1px;
    padding: 10px 0 10px 0;
    justify-content: center;
    max-width: 50%;
    margin: 0 7% 0 0;
    background-color: white;
    border-color: orange;
    color: orange;
    font-weight: bold;
    height: auto;
  }

  .submit-button {
    align-self: center;
    border-color: orange !important;
    color: orange !important;
    border-style: solid;
    border-width: 1px;
  }

  @media screen and (max-width: 800px) {
    .content-flex {
      flex-direction: column;
    }
  }
</style>
