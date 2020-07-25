export default function ({ store, redirect }) {
  // If the admin is not authenticated
  if (!store.state.admin.authenticated) {
    return redirect('/admin/auth')
  }
}
