<template>
  <div class="login-container util__flex util__flex-col">
    <img src="../../assets/img/Drive__logo_.svg" class="logo">
    <hr class="auth-line">
    <div>
      <form method="post" @submit.prevent="resetPassword">
        <p class="form-label universal-base-sz" style="margin-top:15px;">
          We will send you a link to your email to reset the password.
        </p>
        <div class="util__flex util__flex-col single-div">
          <input
            v-model="form.email"
            type="text"
            class="universal-button-sz auth-input"
            name="email"
          >
        </div>
        <div class="form-footer">
          <button
            class="auth-button universal-button-sz"
            type="submit"
          >
            Request Reset
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import toast from '~/mixin/toast'
export default {
  middleware: 'auth',
  mixins: [toast],
  data () {
    return {
      form: {
        email: ''
      }
    }
  },
  methods: {
    async resetPassword () {
      const payload = {
        email: this.form.email
      }
      let responseBack = null
      try {
        responseBack = await this.$axios.get('/auth/password?email=' + payload.email)
      } catch (e) {
        this.error = e.response.data.message
      }
      if (responseBack.data.status === '200 OK') {
        this.successToast('Reset request has been sent to your email')
        this.$router.push('/auth/Login')
      } else {
        this.errorToast(responseBack.data.message)
      }
    }
  }
}
</script>

<style>
@import "../../assets/css/elements/body.css";
@import "../../assets/css/components/authentication.css";
@import "../../assets/css/components/util.css";
</style>
