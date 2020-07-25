export const state = () => ({
  tab: '',
  title: '',
  myDriveId: '',
  userId: '',
  rootId: '',
  virtualId: '',
  currentGroupId: '',
  itemList: [],
  path: [],
  groups: [],
  currentDir: '',
  loading: false,
  action: {
    isCopy: false,
    isMove: false,
    moveOriginalDir: '',
    actionItemList: []
  },
  search: {
    prevItemList: [],
    isInitialized: false
  },
  user: {
    isGoogle: false,
    name: '',
    email: '',
    currentSize: 0,
    maxSize: 0
  },
  options: {
    showTag: false
  }
})

export const mutations = {
  setUserId (state, userId) {
    state.userId = userId
  },
  setRootId (state, rootId) {
    state.rootId = rootId
  },
  setItemList (state, itemList) {
    state.itemList = itemList
  },
  setCurrentDir (state, currentDir) {
    state.currentDir = currentDir
  },
  setPath (state, newPath) {
    state.path = newPath
  },
  appendPath (state, newEntry) {
    state.path.push(newEntry)
  },
  setLoading (state, newValue) {
    state.loading = newValue
  },
  setTitle (state, title) {
    state.title = title
  },
  setMyDriveId (state, myDriveId) {
    state.myDriveId = myDriveId
  },
  setTab (state, tab) {
    state.tab = tab
  },
  setVirtualId (state, virtualId) {
    state.virtualId = virtualId
  },
  setGroups (state, groups) {
    state.groups = groups
  },
  setCurrentGroupId (state, groupId) {
    state.currentGroupId = groupId
  },
  setIsMove (state, isMove) {
    state.action.isMove = isMove
  },
  setIsCopy (state, isCopy) {
    state.action.isCopy = isCopy
  },
  setActionItemList (state, actionItemList) {
    state.action.actionItemList = actionItemList
  },
  setMoveOriginalDir (state, moveOriginalDir) {
    state.action.moveOriginalDir = moveOriginalDir
  },
  setSearch (state, search) {
    state.search = search
  },
  setUserData (state, userData) {
    state.user = userData
  },
  toggleShowTag (state) {
    state.options.showTag = !state.options.showTag
  },
  clearSearch (state) {
    state.search = {
      prevItemList: [],
      isInitialized: false
    }
  }
}

export const actions = {
  async prepareMyDrive ({ state, commit, dispatch }, userId) {
    commit('setUserId', userId)
    const endpoint = '/users'
    const headers = await dispatch('generateHeaders', { userId: state.userId, currentDir: '' })
    return this.$axios.get(endpoint, headers).then((response) => {
      const myDriveId = response.data.data.root_folder
      const tempList = response.data.data.groups
      const userData = {
        isGoogle: response.data.data.google,
        name: response.data.data.name,
        email: response.data.data.email,
        currentSize: response.data.data.storage,
        maxSize: response.data.data.maxsize
      }
      commit('setMyDriveId', myDriveId)
      commit('setUserData', userData)
      const groupList = []
      Object.entries(tempList).forEach((entry) => {
        groupList.push({ id: entry[0], name: entry[1], is_folder: true })
      })
      commit('setGroups', groupList)
      return true
    }).catch((error) => {
      this.error = error
      return false
    })
  },

  moveToRoot ({ state, commit, dispatch }) {
    commit('setPath', [])
    if (state.rootId === state.myDriveId) {
      if (this.app.router.currentRoute.params.id === undefined) {
        dispatch('backToMyDrive')
      } else {
        this.app.router.replace('/home')
      }
    } else if (this.app.router.currentRoute.params.id === state.rootId) {
      dispatch('moveToDirectory', state.rootId)
    } else {
      this.app.router.replace('/home/' + state.rootId)
    }
  },

  moveToRootPublic ({ state, commit, dispatch }) {
    commit('setPath', [])
    this.app.router.replace('/home/share/' + state.rootId)
    commit('setCurrentDir', state.rootId)
  },
  moveToRootGroup ({ state, commit, dispatch }) {
    commit('setPath', [])
    this.app.router.replace('/home/groups').catch(() => {
      dispatch('backToGroup')
    })
  },

  async moveToDirectory ({ state, commit, dispatch }, folderId) {
    commit('setLoading', true)
    const endpoint = '/folders?folder_id=' + folderId
    const headers = await dispatch('generateHeaders', { userId: state.userId, currentDir: '' })
    return dispatch('performMoveDirectory', { endpoint, headers, targetDir: folderId })
  },
  async moveToDirectoryGroup ({ state, commit, dispatch }, folderId) {
    commit('setLoading', true)
    const endpoint = '/folders?folder_id=' + folderId + '&group_id=' + state.currentGroupId
    const headers = await dispatch('generateHeaders', { userId: state.userId, currentDir: '' })
    return dispatch('performMoveDirectory', { endpoint, headers, targetDir: folderId })
  },
  async moveToDirectoryPublic ({ state, commit, dispatch }, folderId) {
    commit('setLoading', true)
    const endpoint = '/folders/public?folder_id=' + folderId
    const headers = await dispatch('generatePublicHeaders', { virtualId: state.virtualId, currentDir: '' })
    return dispatch('performMoveDirectory', { endpoint, headers, targetDir: folderId })
  },

  async performMoveDirectory ({ state, commit, dispatch }, { endpoint, headers, targetDir }) {
    const itemList = []
    commit('setCurrentDir', targetDir)
    const dirData = await this.$axios.get(endpoint, headers).then((response) => {
      return response.data.data
    })
    if (dirData === null) {
      return false
    }
    if (state.title === '') {
      if (dirData.name === null) {
        dirData.name = 'My Drive'
      }
      commit('setTitle', dirData.name)
    }
    Object.entries(dirData.folders).forEach((entry) => {
      itemList.push({ id: entry[0], name: entry[1], is_folder: true })
    })
    Object.entries(dirData.files).forEach((entry) => {
      let size = parseFloat(entry[1][1])
      const unitList = ['byte', 'KB', 'MB', 'GB', 'TB']
      let i = 0
      while (true) {
        if (size > 1024) {
          size /= 1024
          i += 1
        } else {
          break
        }
      }
      size = parseFloat(size).toFixed(2) + ' ' + unitList[i]
      itemList.push({ id: entry[0], name: entry[1][0], size, tags: entry[1][2], is_folder: false })
    })

    if (targetDir === state.currentDir) {
      commit('clearSearch')
      commit('setItemList', itemList)
      commit('setLoading', false)
    }
    return true
  },

  parseSize (initialSize) {
    let size = parseFloat(initialSize)
    const unitList = ['byte', 'KB', 'MB', 'GB', 'TB']
    let i = 0
    while (true) {
      if (size > 1024) {
        size /= 1024
        i += 1
      } else {
        break
      }
    }
    return parseFloat(size).toFixed(2) + ' ' + unitList[i]
  },

  setCurrentDir ({ commit }, currentDir) {
    commit('setCurrentDir', currentDir)
  },

  appendPath ({ state, commit }, newEntry) {
    commit('setLoading', true)
    commit('appendPath', newEntry)
    if (state.tab === 'groups') {
      this.app.router.replace('/home/groups/' + newEntry.id)
    } else {
      this.app.router.replace('/home/' + newEntry.id)
    }
  },

  appendPathPublic ({ state, commit }, newEntry) {
    commit('setLoading', true)
    commit('appendPath', newEntry)
    this.app.router.replace('../share/' + newEntry.id)
    commit('setLoading', false)
  },

  async changeDirectory ({ state, commit, dispatch }, newDir) {
    commit('setLoading', true)
    const statePath = state.path.slice()
    if (statePath[statePath.length - 1].id === newDir) {
      if (state.tab === 'groups') {
        await dispatch('moveToDirectoryGroup', newDir)
      } else {
        await dispatch('moveToDirectory', newDir)
      }
    } else {
      while (statePath[statePath.length - 1].id !== newDir) {
        statePath.pop()
      }
      if (state.tab === 'groups') {
        if (this.app.router.currentRoute.params.groupDirectory !== statePath[statePath.length - 1].id) {
          this.app.router.replace('../groups/' + statePath[statePath.length - 1].id)
        }
      } else if (this.app.router.currentRoute.params.id !== statePath[statePath.length - 1].id) {
        this.app.router.replace('../home/' + statePath[statePath.length - 1].id)
      }
      commit('setPath', statePath)
    }

    commit('setLoading', false)
  },

  changeDirectoryPublic ({ state, commit }, newDir) {
    commit('setLoading', true)
    const statePath = state.path.slice()
    while (statePath[statePath.length - 1].id !== newDir) {
      statePath.pop()
    }
    this.app.router.replace('../share/' + statePath[statePath.length - 1].id)
    commit('setPath', statePath)
    commit('setLoading', false)
  },

  setRootId ({ state, commit }, rootId) {
    commit('setRootId', rootId)
  },

  backToMyDrive ({ state, commit, dispatch }) {
    dispatch('moveToDirectory', state.myDriveId)
    commit('setRootId', state.myDriveId)
    commit('setTitle', 'My Drive')
    if (this.app.router.currentRoute.params.id !== undefined) {
      this.app.router.replace('/home')
    }
  },

  async backToTrash ({ state, commit, dispatch }) {
    commit('setRootId', 'Trash')
    commit('setTitle', 'Trash')
    commit('setCurrentDir', 'trash')
    commit('setLoading', true)
    const tempList = []
    const endpoint = '/users/trash'
    const headers = await dispatch('generateHeaders', { userId: state.userId, currentDir: '' })
    const responseData = await this.$axios.get(endpoint, headers).then((response) => {
      return response.data.data
    })
    Object.entries(responseData.trashed_folders).forEach((entry) => {
      tempList.push({ id: entry[0], name: entry[1], is_folder: true })
    })
    Object.entries(responseData.trashed_files).forEach((entry) => {
      let size = parseFloat(entry[1][1])
      const unitList = ['byte', 'KB', 'MB', 'GB', 'TB']
      let i = 0
      while (true) {
        if (size > 1024) {
          size /= 1024
          i += 1
        } else {
          break
        }
      }
      size = parseFloat(size).toFixed(2) + ' ' + unitList[i]
      tempList.push({ id: entry[0], name: entry[1][0], size, tags: entry[1][2], is_folder: false })
    })
    if (state.currentDir === 'trash') {
      commit('clearSearch')
      commit('setItemList', tempList)
      commit('setLoading', false)
    }
  },

  backToGroup ({ state, commit }) {
    commit('setLoading', true)
    commit('setTitle', 'Groups')
    commit('clearSearch')
    commit('setItemList', state.groups)
    commit('setCurrentDir', 'groups')
    commit('setCurrentGroupId', '')
    commit('setLoading', false)
  },

  showSearch ({ state, commit }, searchItemList) {
    if (!state.search.isInitialized) {
      const search = {
        prevItemList: state.itemList,
        isInitialized: true
      }
      commit('setSearch', search)
    }
    commit('setItemList', searchItemList)
  },
  clearSearch ({ state, commit }) {
    if (state.search.isInitialized) {
      commit('setItemList', state.search.prevItemList)
      commit('clearSearch')
    }
  },

  setLoading ({ commit }, value) {
    commit('setLoading', value)
  },

  setItemList ({ commit }, items) {
    commit('setItemList', items)
  },

  setTitle ({ commit }, title) {
    commit('setTitle', title)
  },

  setTab ({ commit }, tab) {
    commit('setTab', tab)
  },

  setPath ({ commit }, path) {
    commit('setPath', path)
  },

  setUserId ({ commit }, userId) {
    commit('setUserId', userId)
  },

  setVirtualId ({ commit }, virtualId) {
    commit('setVirtualId', virtualId)
  },

  setCurrentGroupId ({ commit }, groupId) {
    commit('setCurrentGroupId', groupId)
  },

  setIsCopy ({ commit }, isCopy) {
    commit('setIsCopy', isCopy)
  },

  setIsMove ({ commit }, isMove) {
    commit('setIsMove', isMove)
  },

  setActionItemList ({ commit }, actionItemList) {
    commit('setActionItemList', actionItemList)
  },
  setMoveOriginalDir ({ commit }, moveOriginalDir) {
    commit('setMoveOriginalDir', moveOriginalDir)
  },

  generateHeaders (context, { userId, currentDir }) {
    return {
      headers: {
        user_id: userId,
        current_dir: currentDir
      }
    }
  },
  generatePublicHeaders (context, { virtualId, currentDir }) {
    return {
      headers: {
        virtual_id: virtualId,
        current_dir: currentDir
      }
    }
  }
}
