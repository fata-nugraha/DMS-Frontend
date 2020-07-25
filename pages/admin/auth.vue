<template>
  <div id="admin">
    <div id="overlay">
      <div class="card">
        <b-form-input
          v-model="form.email"
          autofocus
          type="email"
          placeholder="Email"
          class="admin-form"
          @keydown.enter="verify()"
        />
        <b-form-input
          v-model="form.password"
          type="password"
          placeholder="Password"
          class="admin-form"
          @keydown.enter="verify()"
        />
        <div id="password-error" class="notice" />
        <button id="login-button" class="btn-submit" @click="verify()">
          Login
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  #overlay {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 999;
    background-color: white;
  }

  .card {
    width: 300px;
    box-shadow: 1px 1px 10px lightgray;
    padding: 20px;
    margin: 200px auto;
  }

  input[type=password] {
    width: 250px;
    margin: 5px auto;
  }

  #login-button {
    margin: 5px auto;
  }

  .notice {
    display: none;
  }

</style>

<script>
export default {
  layout: 'admin',
  data () {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  created () {
    this.reinitialize()
    this.$cookies.remove('userid', {
      path: '/admin'
    })
    this.$cookies.remove('token', {
      path: '/admin'
    })
  },
  methods: {
    reinitialize () {
      this.$store.commit('admin/logout')
    },

    verify () {
      const endpoint = '/auth/login'
      const formData = new FormData()
      formData.append('email', this.form.email)
      formData.append('password', this.form.password)
      formData.append('admin', true)
      this.$axios.post(endpoint, formData).then((response) => {
        if (response.data.status === '200 OK') {
          this.redirectToAdminHome(response.data.data)
        } else {
          const notice = document.getElementById('password-error')
          notice.innerHTML = 'Password salah!'
          notice.style.display = 'block'
        }
      })
    },
    async redirectToAdminHome (data) {
      const userId = data.user_id
      const token = data.token
      this.$cookies.set('userid', userId, {
        maxAge: 60 * 60,
        secure: false,
        path: '/admin'
      })
      this.$cookies.set('token', token, {
        maxAge: 60 * 60,
        secure: false,
        path: '/admin'
      })
      this.$axios.interceptors.request.use((config) => {
        if (this.$cookies.get('token')) {
          config.headers.Authorization = 'Bearer ' + this.$cookies.get('token')
        }
        return config
      })
      this.$store.commit('admin/login')
      await this.$router.push('/admin/')
    }
  }
}
</script>

<style scoped>
  .admin-form {
    min-width: 260px;
  }
</style>
