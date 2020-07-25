export const state = () => ({
  authenticated: false
})

export const getters = {
  getAuth (state) {
    return state.authenticated
  }
}

export const mutations = {
  login (state) {
    state.authenticated = true
  },

  logout (state) {
    state.authenticated = false
  }
}

export const actions = {
  login (context) {
    context.commit('login')
  },

  logout (context) {
    context.commit('logout')
  }
}
