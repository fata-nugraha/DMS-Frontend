<template>
  <section>
    <div class="login-container util__flex util__flex-col">
      <img src="../../assets/img/Drive__logo_.svg" alt="Drive Logo" class="logo">
      <hr class="auth-line">
      <div>
        <div>
          <b-form @submit.prevent="submitLogin">
            <div class="util__flex util__flex-col single-div">
              <label
                class="form-label universal-button-sz"
              >Email</label>
              <b-form-input
                v-model="form.email"
                type="text"
                class="universal-button-sz auth-input"
                name="email"
              />
            </div>
            <div class="util__flex util__flex-col single-div">
              <label class="form-label universal-button-sz">Password</label>
              <b-form-input
                v-model="form.password"
                type="password"
                class="universal-button-sz auth-input"
                name="password"
              />
              <span
                id="error-message"
                class="form-label universal-base-sz error-message"
              >Invalid email or password</span>
            </div>
            <div class="form-footer">
              <nuxt-link
                class="universal-base-sz clickable-text"
                to="/auth/forgot"
              >
                forgot password?
              </nuxt-link>
              <b-overlay :show="form.submitLoading">
                <button
                  class="auth-button universal-button-sz"
                  type="submit"
                >
                  Sign In
                </button>
              </b-overlay>
            </div>
          </b-form>
          <hr class="auth-line">
          <div class="form-footer">
            <b-overlay :show="form.submitLoading">
              <button
                type="button"
                class="auth-button universal-button-sz google-icon"
                @click="googleSignIn"
              >
                <img src="../../assets/img/Google__G__Logo.svg" alt="Google Logo" height="30">
                <span>Sign In with Google</span>
              </button>
            </b-overlay>
            <nuxt-link
              class="universal-base-sz clickable-text"
              style="margin-top: 20px; margin-bottom: 5px;"
              to="/auth/register_ver"
            >
              Create an Account
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import firebase from 'firebase'
import toast from '~/mixin/toast'
export default {
  middleware: 'auth',
  mixins: [toast],
  data () {
    return {
      form: {
        email: '',
        password: '',
        submitLoading: false
      }
    }
  },
  mounted () {
    document.getElementById('error-message').style.visibility = 'hidden'
    if (this.$cookies.get('errorAccessHome')) {
      this.errorToast('Please sign in before accessing home')
      this.$cookies.remove('errorAccessHome')
    }
  },
  methods: {
    submitLogin () {
      this.form.submitLoading = true
      const payload = {
        email: this.form.email,
        password: this.form.password
      }
      this.$axios.post('/auth/login', payload).then((response) => {
        if (response.data.status === '200 OK') {
          this.redirectToHome(response.data.data)
        } else {
          document.getElementById('error-message').style.visibility = 'visible'
          this.form.submitLoading = false
        }
      })
    },
    googleSignIn () {
      this.provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithPopup(this.provider).then((result) => {
        this.form.submitLoading = true
        const endpoint = '/auth/google'
        const formData = new FormData()
        formData.append('id_token', result.credential.idToken)
        formData.append('name', result.user.displayName)
        this.$axios.post(endpoint, formData).then((response) => {
          if (response.data.data.user_id !== null && response.data.data.token !== null) {
            this.redirectToHome(response.data.data)
          } else {
            this.errorToast(response.data.message)
          }
        })
      }).catch(() => {
        this.errorToast('There is something wrong, please try again')
      })
    },
    async redirectToHome (data) {
      const userId = data.user_id
      const token = data.token
      this.$cookies.set('userid', userId, {
        maxAge: 60 * 60,
        secure: false,
        path: '/'
      })
      this.$cookies.set('token', token, {
        maxAge: 60 * 60,
        secure: false,
        path: '/'
      })
      this.$axios.interceptors.request.use((config) => {
        if (this.$cookies.get('token')) {
          config.headers.Authorization = 'Bearer ' + this.$cookies.get('token')
        }
        return config
      })
      await this.$store.dispatch('home/prepareMyDrive', this.$cookies.get('userid'))
      this.form.submitLoading = false
      await this.$router.push('../home/', () => {
        location.reload()
      })
    }
  }
}
</script>

<style scoped>
  @import "../../assets/css/elements/body.css";
  @import "../../assets/css/components/authentication.css";
  @import "../../assets/css/components/util.css";
</style>
