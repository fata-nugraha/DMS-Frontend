<template>
  <section>
    <div class="login-container util__flex util__flex-col">
      <img src="../../assets/img/Drive__logo_.svg" class="logo">
      <hr class="auth-line">
      <div>
        <form method="post" @submit.prevent="submitRegister">
          <div class="util__flex util__flex-col single-div">
            <label class="form-label universal-button-sz">Name</label>
            <input
              v-model="form.name"
              type="text"
              class="universal-button-sz auth-input"
              name="username"
            >
          </div>
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
          </div>
          <div class="form-footer">
            <div class="universal-base-sz clickable-text">
              Already have
              <nuxt-link to="/auth/login">
                account
              </nuxt-link>?
            </div>
            <button
              class="auth-button universal-button-sz"
              type="submit"
            >
              Register
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
        username: '',
        password: '',
        repassword: ''
      }
    }
  },
  methods: {
    async submitRegister () {
      const payload = {
        pending_user_id: this.$nuxt.$route.query.id,
        name: this.form.name,
        password: this.form.password,
        confirm_password: this.form.repassword
      }
      let responseBack = null
      try {
        responseBack = await this.$axios.post('/auth/user/register', payload)
      } catch (e) {
        this.error = e.response.data.message
      }
      if (responseBack.data.status === '200 OK') {
        this.successToast('Registration success!')
        this.$router.push('/auth/Login')
      } else {
        this.errorToast(responseBack.data.message)
      }
    },
    clickSecond () {
      this.$router.push('/home')
    }
  }
}
</script>

<style>
@import "../../assets/css/elements/body.css";
@import "../../assets/css/components/authentication.css";
@import "../../assets/css/components/util.css";
</style>
