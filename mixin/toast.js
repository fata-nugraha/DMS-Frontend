export default {
  methods: {
    successToast (message) {
      this.$root.$bvToast.toast(message, {
        title: 'Success',
        variant: 'success',
        solid: true
      })
    },
    errorToast (message) {
      this.$root.$bvToast.toast(message, {
        title: 'Error',
        variant: 'danger',
        solid: true
      })
    }
  }
}
