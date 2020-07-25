<template>
  <div />
</template>

<script>
export default {
  created () {
    const userId = this.$cookies.get('userid')
    const endpoint = '/auth/logout'
    const headers = {
      headers: {
        user_id: userId
      }
    }
    this.$axios.post(endpoint, null, headers)
    this.$cookies.removeAll()
    this.$router.push('/auth/login', () => {
      location.reload()
    })
  }
}
</script>
