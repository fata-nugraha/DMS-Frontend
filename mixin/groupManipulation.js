import toast from '~/mixin/toast'

export default {
  mixins: [toast],
  computed: {
    userId () { return this.$store.state.home.userId }
  },
  methods: {
    async getGroupDetail (groupId) {
      const endpoint = '/groups?group_id=' + groupId
      const headers = this.generateHeaders(this.userId)
      this.group.id = groupId
      const rootFolder = await this.$axios.get(endpoint, headers).then((response) => {
        this.group.name = response.data.data.name
        this.group.ownerId = response.data.data.owner_id
        this.group.rootFolder = response.data.data.root_folder
        const tempList = []
        Object.entries(response.data.data.members).forEach((entry) => {
          tempList.push({ id: entry[0], name: entry[1] })
        })
        this.group.members = tempList
        return this.group.rootFolder
      })
      return rootFolder
    },
    removeMember (targetUserId) {
      const endpoint = '/groups/remove'
      const headers = this.generateHeaders(this.userId)
      const formData = new FormData()
      formData.append('group_id', this.group.id)
      formData.append('target_id', targetUserId)
      this.$axios.post(endpoint, formData, headers).then((response) => {
        if (response.data.status === '200 OK') {
          this.successToast('User has been removed')
        } else {
          this.errorToast(response.data.message)
        }
        this.getGroupDetail(this.group.id)
      }).catch(() => {
        this.errorToast('There is something wrong')
      })
    },
    addMember (targetUserEmail) {
      const endpoint = '/groups/add'
      const headers = this.generateHeaders(this.userId)
      const formData = new FormData()
      formData.append('invitation', targetUserEmail)
      formData.append('group_id', this.group.id)
      this.$axios.post(endpoint, formData, headers).then((response) => {
        if (response.data.status === '200 OK') {
          this.successToast('User has been added')
        } else {
          this.errorToast(response.data.message)
        }
        this.getGroupDetail(this.group.id)
      }).catch(() => {
        this.errorToast('There is something wrong')
      })
    },
    leftGroup (groupId) {
      const endpoint = '/users/quitgroup'
      const headers = this.generateHeaders(this.userId)
      const formData = new FormData()
      formData.append('group_id', groupId)
      this.$axios.post(endpoint, formData, headers).then((response) => {
        if (response.data.status === '200 OK') {
          this.successToast('You have left from ' + this.group.name)
        } else {
          this.errorToast(response.data.message)
        }
        this.$store.dispatch('home/prepareMyDrive', this.$store.state.home.userId)
      }).catch(() => {
        this.errorToast('There is something wrong')
      })
    },
    generateHeaders (userId) {
      return {
        headers: {
          user_id: userId
        }
      }
    }
  }
}
