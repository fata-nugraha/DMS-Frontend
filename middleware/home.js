export default async function ({ store, params, redirect }) {
  store.dispatch('home/setLoading', true)
  store.$axios.defaults.headers.common.Authorization = 'bearer ' + store.$cookies.get('token')
  let isIdValid = (store.state.home.myDriveId !== '')
  if (!isIdValid) {
    isIdValid = await store.dispatch('home/prepareMyDrive', store.$cookies.get('userid'))
    if (!isIdValid) {
      store.$cookies.removeAll()
      store.$cookies.set('errorAccessHome', true)
      redirect('/auth/login')
    }
    if (params.id !== undefined) {
      store.dispatch('home/setRootId', params.id)
    } else if (params.groupDirectory !== undefined) {
      store.dispatch('home/setRootId', '')
    } else {
      store.dispatch('home/setRootId', store.state.home.myDriveId)
    }
  }
  if (params.id !== undefined) {
    store.dispatch('home/setCurrentDir', params.id)
  } else if (params.groupDirectory !== undefined) {
    store.dispatch('home/setCurrentDir', params.groupDirectory)
  } else {
    store.dispatch('home/setCurrentDir', store.state.home.myDriveId)
  }
}
