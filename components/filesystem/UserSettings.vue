<template>
  <b-modal ref="userSetting" hide-footer>
    <b-tabs>
      <b-tab v-if="!isGoogleAcc" title="Detail">
        <b-row>
          <b-col class="column-flex">
            <div style="flex-direction: column" class="text-center">
              <div>
                <label>
                  Full Name
                </label>
                <b-form-input
                  v-model="form.name"
                  :placeholder="userData.name"
                  type="text"
                  name="name"
                />
              </div>
              <p>Password</p>
              <div>
                <b-form-input
                  v-model="form.current_password"
                  placeholder="Current Password"
                  type="password"
                  name="password"
                />
                <b-button id="change-detail-button" v-b-toggle.change-password-collapse variant="primary">
                  Change Password
                </b-button>
                <b-collapse id="change-password-collapse" title="Change password">
                  <b-form-input
                    v-model="form.new_password"
                    placeholder="New Password"
                    type="password"
                    name="email"
                    :state="newPasswordValid"
                    aria-describedby="input-live-help password-feedback"
                  />
                  <b-form-invalid-feedback id="password-feedback">
                    Enter at least 8 letters
                  </b-form-invalid-feedback>
                  <div>
                    <b-form-input
                      v-model="form.confirm_password"
                      placeholder="Confirm New Password"
                      type="password"
                      name="email"
                      :state="confirmPasswordValid"
                      aria-describedby="input-live-help confirm-password-feedback"
                    />
                    <b-form-invalid-feedback id="confirm-password-feedback">
                      Your confirmation password is different
                    </b-form-invalid-feedback>
                  </div>
                </b-collapse>
                <div>
                  <b-button id="change-detail-button" @click="changeSettings">
                    Save
                  </b-button>
                </div>
              </div>
            </div>
          </b-col>
        </b-row>
      </b-tab>
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
    </b-tabs>
  </b-modal>
</template>

<script>
import logManipulation from '~/mixin/logManipulation'
import toast from '~/mixin/toast'
export default {
  mixins: [logManipulation, toast],
  data () {
    return {
      userData: {
        name: '',
        email: ''
      },
      form: {
        name: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      },
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
      }
    }
  },
  computed: {
    userId () { return this.$store.state.home.userId },
    isGoogleAcc () { return this.$store.state.home.user.isGoogle },
    newPasswordValid () {
      if (this.form.new_password === '') {
        return null
      }
      return this.form.new_password.length >= 8
    },
    confirmPasswordValid () {
      if (this.form.new_password === '') {
        return null
      }
      return this.form.new_password === this.form.confirm_password
    }
  },
  methods: {
    show () {
      this.log.loading = true
      this.$refs.userSetting.show()
      this.getLog(this.userId).then((response) => {
        this.log.item = response.data.data
        this.log.loading = false
      })
    },
    async changeSettings () {
      const payload = {
        name: this.form.name,
        current_password: this.form.current_password,
        new_password: this.form.new_password,
        confirm_password: this.form.confirm_password
      }
      try {
        await this.$axios.post('/users', payload, {
          headers: {
            user_id: this.$cookies.get('userid')
          }
        }).then((response) => {
          if (response.data.status === '200 OK') {
            this.successToast('Data successfully changed')
            this.$router.go(0)
          } else {
            this.errorToast(response.data.message)
          }
        })
      } catch (e) {
        this.error = e.response.data.message
      }
    },
    generateHeaders (userId, currentDir) {
      return {
        headers: {
          user_id: userId,
          current_dir: currentDir
        }
      }
    }
  },
  head () {
    return {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=PT+Sans&display=swap' }
      ]
    }
  }
}
</script>

<style>
  .column-flex {
    display: flex;
    flex-direction: column;
    font-family: 'PT Sans', sans-serif;
  }

  #change-detail-button {
    align-self: center;
    border-color: orange;
    color: orange;
    border-style: solid;
    border-width: 1px;
    margin-top: 10px;
    margin-bottom: 10px;
  }
</style>
