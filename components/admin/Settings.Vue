<template>
  <div>
    <PopUp
      :header="encryptionPopUp.header"
      :message="encryptionPopUp.message"
      :buttons="encryptionPopUp.buttons"
      :visible="encryptionPopUp.visible"
      @toggleEncryption="toggleEncryption"
      @cancelEncryption="cancelEncryption"
    />
    <PopUp
      :header="removeEmailPopUp.header"
      :message="removeEmailPopUp.message"
      :buttons="removeEmailPopUp.buttons"
      :visible="removeEmailPopUp.visible"
      @removeEmail="removeEmail"
      @cancelRemoveEmail="cancelRemoveEmail"
    />
    <PopUp
      :header="removeDomainPopUp.header"
      :message="removeDomainPopUp.message"
      :buttons="removeDomainPopUp.buttons"
      :visible="removeDomainPopUp.visible"
      @removeDomain="removeDomain"
      @cancelRemoveDomain="cancelRemoveDomain"
    />

    <div v-if="loading">
      <Spinner />
    </div>
    <div v-else>
      <h1>Defaults</h1>
      <div class="label">
        Default storage size for Users
      </div>
      <div class="dropdown" contenteditable="true">
        <input
          v-model="newUserDefaultStorage"
          type="number"
          autocomplete="off"
          min="0.1"
          max="1"
          step="0.1"
          @keydown.enter="changeUserDefaultStorage"
        >
        <div class="extra">
          GB
        </div>
        <select v-model="newUserDefaultStorage">
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
      <button v-if="userButtonEnabled" @click="changeUserDefaultStorage">
        Change
      </button>
      <div id="userFeedback" class="feedback" />

      <br>

      <div class="label">
        Default storage size for Groups
      </div>
      <div class="dropdown" contenteditable="true">
        <input
          v-model="newGroupDefaultStorage"
          type="number"
          autocomplete="off"
          min="0.1"
          max="1"
          step="0.1"
          @keydown.enter="changeGroupDefaultStorage"
        >
        <div class="extra">
          GB
        </div>
        <select v-model="newGroupDefaultStorage">
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
      <button v-if="groupButtonEnabled" @click="changeGroupDefaultStorage">
        Change
      </button>
      <div id="groupFeedback" class="feedback" />

      <h1>Encryption</h1>
      <div class="label">
        Encryption is
        <span v-if="encrypted"> enabled </span>
        <span v-else> disabled </span>
        for all users.
      </div>
      <button v-if="encrypted" class="btn-red" @click="confirmToggleEncryption">
        Turn Off
      </button>
      <button v-else class="btn-green" @click="confirmToggleEncryption">
        Turn On
      </button>

      <h1>Trusted Emails and Domains</h1>
      <div id="email" class="trust-list">
        <div class="add">
          <input v-model="newEmail" type="text" placeholder="Add a new trusted email" @keydown.enter="addTrustedEmail">
          <button @click="addTrustedEmail">
            Add Email
          </button>
        </div>
        <div id="table">
          <EmailTable
            :items="emailList"
            :page="page"
            @remove="confirmRemoveEmail"
          />
        </div>
      </div>

      <div id="domain" class="trust-list">
        <div class="add">
          <input v-model="newDomain" type="text" placeholder="Add a new trusted domain" @keydown.enter="addTrustedDomain">
          <button @click="addTrustedDomain">
            Add Domain
          </button>
        </div>
        <div id="table">
          <EmailTable
            :items="domainList"
            :page="page"
            @remove="confirmRemoveDomain"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EmailTable from '../../components/admin/EmailTable'
import Spinner from '../../components/admin/Spinner'
import PopUp from '../../components/admin/PopUp'
import admin from '../../assets/js/admin'

export default {
  components: {
    EmailTable, Spinner, PopUp
  },
  data () {
    return {
      newEmail: '',
      newDomain: '',
      emailList: [],
      domainList: [],
      page: 'settings',

      loading: 0,

      userDefaultStorage: '0',
      groupDefaultStorage: '0',
      newUserDefaultStorage: -999,
      newGroupDefaultStorage: -999,
      userButtonEnabled: false,
      groupButtonEnabled: false,

      encrypted: false,

      encryptionPopUp: {
        header: '',
        message: 'Click \'OK\' if you wish to continue.',
        buttons: [
          { name: 'OK', class: 'btn-submit', emit: 'toggleEncryption', emitData: '' },
          { name: 'Cancel', class: '', emit: 'cancelEncryption', emitData: '' }
        ],
        visible: false
      },

      removeEmailPopUp: {
        header: 'Remove Trusted Email',
        message: 'Are you sure you want to remove this email from the trusted list?',
        buttons: [
          { name: 'Yes', class: 'btn-submit', emit: 'removeEmail', emitData: '' },
          { name: 'Cancel', class: '', emit: 'cancelRemoveEmail', emitData: '' }
        ],
        visible: false
      },

      removeDomainPopUp: {
        header: 'Remove Trusted Domain',
        message: 'Are you sure you want to remove this domain from the trusted list?',
        buttons: [
          { name: 'Yes', class: 'btn-submit', emit: 'removeDomain', emitData: '' },
          { name: 'Cancel', class: '', emit: 'cancelRemoveDomain', emitData: '' }
        ],
        visible: false
      }
    }
  },
  watch: {
    newUserDefaultStorage (newValue, oldValue) {
      if (oldValue !== -999) {
        if (newValue < 100) {
          this.userButtonEnabled = true
          document.getElementById('userFeedback').innerHTML = ''
        } else {
          this.userButtonEnabled = false
          document.getElementById('userFeedback').innerHTML = 'Size must be under 100.'
          document.getElementById('userFeedback').style.color = 'var(--admin10)'
        }
      } else {
        this.userButtonEnabled = false
      }
    },
    newGroupDefaultStorage (newValue, oldValue) {
      if (oldValue !== -999) {
        if (newValue < 100) {
          this.groupButtonEnabled = true
          document.getElementById('groupFeedback').innerHTML = ''
        } else {
          this.groupButtonEnabled = false
          document.getElementById('groupFeedback').innerHTML = 'Size must be under 100.'
          document.getElementById('groupFeedback').style.color = 'var(--admin10)'
        }
      } else {
        this.groupButtonEnabled = false
      }
    }
  },
  created () {
    admin.setActiveTab()
    this.getSettings()
    this.getTrustedEmails()
  },
  methods: {

    async getSettings () {
      this.loading++
      const url = '/app/settings'
      const resp = await this.$axios.get(url)
      const respData = resp.data.data
      this.userDefaultStorage = respData.defaultUserStorage
      this.newUserDefaultStorage = respData.defaultUserStorage
      this.groupDefaultStorage = respData.defaultGroupStorage
      this.newGroupDefaultStorage = respData.defaultGroupStorage
      this.encrypted = respData.encryption
      this.loading--
    },

    async changeUserDefaultStorage () {
      if (this.userButtonEnabled) {
        if (this.newUserDefaultStorage !== this.userDefaultStorage) {
          this.userButtonEnabled = false
          const data = {
            size: this.newUserDefaultStorage
          }
          const url = '/app/users/default'
          this.loading++
          const resp = await this.$axios.post(url, data)
          this.loading--
          if (resp.data.status === '200 OK') {
            admin.displayStatus('status-green', 'User default storage changed')
            this.getSettings()
          } else {
            admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
          }
        } else {
          this.userButtonEnabled = false
        }
      }
    },

    async changeGroupDefaultStorage () {
      if (this.groupButtonEnabled) {
        if (this.newGroupDefaultStorage !== this.groupDefaultStorage) {
          this.groupButtonEnabled = false
          const data = {
            size: this.newGroupDefaultStorage
          }
          const url = '/app/groups/default'
          this.loading++
          const resp = await this.$axios.post(url, data)
          this.loading--
          if (resp.data.status === '200 OK') {
            admin.displayStatus('status-green', 'Group default storage changed')
            this.getSettings()
          } else {
            admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
          }
        } else {
          this.groupButtonEnabled = false
        }
      }
    },

    confirmToggleEncryption () {
      if (this.encrypted) {
        this.encryptionPopUp.header = 'Turn Off Encryption?'
      } else {
        this.encryptionPopUp.header = 'Turn On Encryption?'
      }
      this.encryptionPopUp.visible = true
    },

    cancelEncryption () {
      this.encryptionPopUp.visible = false
    },

    async toggleEncryption () {
      this.encryptionPopUp.visible = false
      let url
      if (this.encrypted) {
        url = '/app/decrypt'
      } else {
        url = '/app/encrypt'
      }
      const resp = await this.$axios.post(url, {})
      if (resp.data.status === '200 OK') {
        // this.$store.commmit('admin/logout')
        // this.$router.push('/admin/auth')
        admin.displayStatus('status-green', 'System is now encrypted')
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
      }
    },

    async getTrustedEmails () {
      this.loading++
      this.emailList = []
      this.domainList = []
      const url = '/app/email'
      const resp = await this.$axios.get(url)
      const arrEmail = Object.entries(resp.data.data.emails)
      for (let i = 0; i < arrEmail.length; i++) {
        this.emailList.push({ email: arrEmail[i][1] })
      }
      const arrDomain = resp.data.data.domains
      for (let j = 0; j < arrDomain.length; j++) {
        this.domainList.push({ email: arrDomain[j] })
      }
      this.loading--
    },

    async addTrustedEmail () {
      const data = {
        email: this.newEmail
      }
      const url = '/app/email'
      this.loading++
      const resp = await this.$axios.post(url, data)
      this.loading--
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'Email added to list of trusted emails')
        this.newEmail = ''
        this.getTrustedEmails()
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
      }
    },

    async addTrustedDomain () {
      const data = {
        domain: this.newDomain
      }
      const url = '/app/domain'
      this.loading++
      const resp = await this.$axios.post(url, data)
      this.loading--
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'Domain added to list of trusted emails')
        this.newDomain = ''
        this.getTrustedEmails()
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
      }
    },

    confirmRemoveEmail (email) {
      this.removeEmailPopUp.buttons[0].emitData = email
      this.removeEmailPopUp.visible = true
    },

    confirmRemoveDomain (domain) {
      this.removeDomainPopUp.buttons[0].emitData = domain
      this.removeDomainPopUp.visible = true
    },

    cancelRemoveEmail () {
      this.removeEmailPopUp.visible = false
    },

    cancelRemoveDomain () {
      this.removeDomainPopUp.visible = false
    },

    async removeEmail (email) {
      const url = '/app/email?' + 'email=' + email
      this.removeEmailPopUp.visible = false
      this.loading++
      const resp = await this.$axios.delete(url)
      this.loading--
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'Email removed from list of trusted emails')
        this.getTrustedEmails()
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
      }
    },

    async removeDomain (domain) {
      const url = '/app/domain?' + 'domain=' + domain
      this.removeDomainPopUp.visible = false
      this.loading++
      const resp = await this.$axios.delete(url)
      this.loading--
      if (resp.data.status === '200 OK') {
        admin.displayStatus('status-green', 'Domain removed from list of trusted emails')
        this.getTrustedEmails()
      } else {
        admin.displayStatus('status-red', 'ERROR: ' + resp.data.message)
      }
    }
  }
}
</script>
<style scoped>
.add {
  width: 100%;
}

.add input {
  width: 70%;
  margin-bottom: 5px;
}

.add button {
  width: 100px !important;
}

.label {
  padding: 5px 0;
  margin-bottom: 5px;
  width: 250px;
  display: inline-block;
}

.dropdown {
  margin-right: 10px;
}

.feedback {
  display: inline-block;
  padding: 5px 0;
}

.trust-list {
  width: 45%;
  min-width: 300px;
  display: inline-block;
  margin-right: 4%;
}
</style>
