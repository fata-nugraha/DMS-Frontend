<template>
  <section>
    <div class="login-container util__flex util__flex-col">
      <img src="../../assets/img/Drive__logo_.svg" class="logo">
      <hr class="auth-line">
      <div>
        <form method="post" @submit.prevent="verifyEmail">
          <div class="util__flex util__flex-col single-div">
            <label
              class="form-label universal-button-sz"
            >Email</label>
            <input
              v-model="form.email"
              type="text"
              class="universal-button-sz auth-input"
              name="email"
            >
            <span
              id="error-message"
              class="form-label universal-base-sz error-message"
            >Invalid email format</span>
          </div>
          <div class="form-footer">
            <nuxt-link
              class="universal-base-sz clickable-text"
              to="/auth/login"
            >
              Already have account?
            </nuxt-link>
            <b-overlay :show="form.submitLoading">
              <button
                class="auth-button universal-button-sz"
                type="submit"
              >
                Verify
              </button>
            </b-overlay>
          </div>
          <hr class="auth-line">
          <div class="form-footer">
            <button
              type="button"
              class="auth-button universal-button-sz google-icon"
              @click="googleSignIn"
            >
              <img src="../../assets/img/Google__G__Logo.svg" height="30">
              <span>Register with Google</span>
            </button>
          </div>
        </form>
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
        submitLoading: false
      }
    }
  },
  methods: {
    verifyEmail () {
      this.form.submitLoading = true
      const payload = {
        email: this.form.email
      }
      try {
        this.$axios.post(
          '/auth/email/register',
          payload
        ).then((response) => {
          this.form.submitLoading = false
          if (response.data.status === '200 OK') {
            this.$router.push('/auth/login')
            this.successToast('Please wait until our administrator approve your registration')
          } else {
            this.errorToast(response.data.message)
          }
        })
      } catch (e) {
        this.error = e.response.data.message
        this.errorToast('There is something wrong')
        this.form.submitLoading = false
      }
    },
    googleSignIn () {
      this.provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithPopup(this.provider).then((result) => {
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
      }).catch((e) => {
        this.error = e.response.data.message
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
          config.headers.Authorization = 'bearer ' + this.$cookies.get('token')
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

<style>
@import "../../assets/css/elements/body.css";
@import "../../assets/css/components/authentication.css";
@import "../../assets/css/components/util.css";

</style>
