<template>
  <section>
    <div class="login-container util__flex util__flex-col">
      <img src="../../assets/img/Drive__logo_.svg" class="logo">
      <hr class="auth-line">
      <div>
        <form method="post" @submit.prevent="submitReset">
          <div class="util__flex util__flex-col single-div">
            <label class="form-label universal-button-sz">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="universal-button-sz auth-input"
              name="password"
            >
            <input
              v-model="form.repassword"
              type="password"
              class="universal-button-sz auth-input"
              name="re-password"
              placeholder="re-type password"
            >
            <input
              v-model="form.hidden_id"
              type="password"
              style="visibility:hidden;"
              name="hidden"
            >
            <input
              v-model="form.hidden_token"
              type="password"
              style="visibility:hidden;"
              name="hidden"
            >
          </div>
          <div class="form-footer">
            <button
              class="auth-button universal-button-sz"
              type="submit"
            >
              Reset
            </button>
          </div>
          <hr class="auth-line">
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import toast from '~/mixin/toast'
export default {
  middleware: 'auth',
  mixins: [toast],
  data () {
    return {
      form: {
        hidden_id: this.$nuxt.$route.query.id,
        hidden_token: this.$nuxt.$route.query.token,
        password: '',
        repassword: ''
      }
    }
  },
  methods: {
    async submitReset (event) {
      event.preventDefault()
      const payload = {
        user_id: this.form.hidden_id,
        token: this.form.hidden_token,
        password: this.form.password,
        confirm_password: this.form.repassword
      }
      let responseBack = null
      try {
        responseBack = await this.$axios.post('/auth/password', payload)
      } catch (e) {
        this.error = e.response.data.message
      }
      if (responseBack.data.status === '200 OK') {
        this.successToast('Reset success!')
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
