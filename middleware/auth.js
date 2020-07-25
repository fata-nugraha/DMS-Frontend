export default function ({ store, redirect }) {
  if (store.$cookies.get('userid') !== undefined) {
    return redirect('/home')
  }
}
