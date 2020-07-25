const admin = {
  displayStatus (style, message) {
    const status = document.getElementById('status-message')
    status.classList = [style]
    status.innerHTML = message
    status.style.display = 'inline-block'
    setTimeout(() => {
      status.innerHTML = ''
      status.style.display = 'none'
    }, 2400)
  },

  setActiveTab () {
    let activePage = window.location.pathname.slice(7).split('/')[0]

    if (activePage === '') {
      activePage = 'home'
    } else if (activePage === 'unapproved') {
      activePage = 'users'
    }

    let activeTab = ''
    const tabs = document.getElementsByTagName('li')
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove('selected')
      if (tabs[i].id === activePage) {
        activeTab = tabs[i]
      }
    }
    activeTab.classList.add('selected')
  },

  adjustSize (bytes) {
    let size = bytes / 1073741824
    let unit = 'GB'

    if (size < 1) {
      size *= 1000
      unit = 'MB'
      if (size < 0.01) {
        size *= 1000
        unit = 'KB'
        if (size < 0.01) {
          size *= 1073.741824
          unit = 'bytes'
        }
      }
    }

    return (String((Math.round(size * 100) / 100).toFixed(2)) + ' ' + unit)
  }
}

export default admin
