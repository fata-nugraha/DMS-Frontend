export default {
  methods: {
    getLog (itemId) {
      const endpoint = '/getlog?object_id=' + itemId
      return this.$axios.get(endpoint, this.generateHeaders(this.userId, this.currentDir))
    },
    generateHeaders (userId, currentDir) {
      return {
        headers: {
          user_id: userId,
          current_dir: currentDir
        }
      }
    }
  }
}
