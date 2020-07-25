import toast from '~/mixin/toast'
import xmlSignature from '~/mixin/xmlSignature'

export default {
  mixins: [toast, xmlSignature],
  data () {
    return {
      isPublic: false
    }
  },
  computed: {
    virtualId () { return this.$store.state.home.virtualId },
    actionItemList () { return this.$store.state.home.action.actionItemList },
    moveOriginalDir () { return this.$store.state.home.action.moveOriginalDir }
  },
  methods: {
    async moveToDir (folderId) {
      if (this.isPublic) {
        this.validFolder = await this.$store.dispatch('home/moveToDirectoryPublic', folderId)
      } else {
        this.validFolder = await this.$store.dispatch('home/moveToDirectory', folderId)
      }
    },
    uploadFiles (uploadedFiles) {
      let idx
      this.progress.max = 0
      this.progress.error = false
      for (idx in uploadedFiles) {
        this.progress.max += uploadedFiles[idx].size
      }
      for (idx in uploadedFiles) {
        this.uploadFile(uploadedFiles[idx])
      }
      this.moveToDir(this.currentDir)
      if (!this.isPublic) {
        this.getUserData()
      }
    },
    uploadFile (uploadedFile) {
      let endpoint, headers
      if (this.$data.isPublic) {
        endpoint = '/files/upload/public'
        headers = this.generatePublicHeaders(this.virtualId, this.currentDir)
      } else {
        endpoint = '/files/upload'
        headers = this.generateHeaders(this.userId, this.currentDir)
      }
      headers.onUploadProgress = (progressEvent) => {
        this.progress.value += (progressEvent.loaded - lastLoaded)
        lastLoaded = progressEvent.loaded
      }
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('filename', uploadedFile.name)
      let lastLoaded = 0
      this.$axios.post(endpoint, formData, headers).then((response) => {
        lastLoaded += (uploadedFile.size - lastLoaded)
        this.progress.value = this.progress.max
        if (response.status !== 200 || response.data.status !== '200 OK') {
          this.progress.error = true
        }
        if (this.progress.value === this.progress.max) {
          this.moveToDir(this.currentDir)
          if (this.progress.error) {
            this.errorToast('Some file may not be uploaded')
          } else {
            this.successToast('Data uploaded successfully')
          }
        }
      }).catch((e) => {
        this.errorToast('Some file may not be uploaded')
      })
    },
    downloadItems (downloadedItems) {
      let idx
      const items = downloadedItems.items
      const isZip = downloadedItems.isZip
      if (!isZip) {
        for (idx in items) {
          this.downloadFile(items[idx], isZip)
        }
      } else {
        let params = '?'
        for (idx in items) {
          if (items[idx].is_folder) {
            params += 'folder_list[]=' + items[idx].id
          } else {
            params += 'file_list[]=' + items[idx].id
          }
          if (idx !== items.length - 1) {
            params += '&'
          }
        }
        let endpoint, headers
        if (this.isPublic) {
          endpoint = '/files/download/zip/public'
          headers = this.generatePublicHeaders(this.virtualId, this.currentDir)
        } else {
          endpoint = '/files/download/zip'
          headers = this.generateHeaders(this.userId, this.currentDir)
        }
        headers.responseType = 'blob'
        endpoint += params
        this.downloadItemsAsZip(endpoint, headers)
      }
    },
    downloadFile (downloadedFile) {
      const mime = require('mime-types')
      let endpoint, headers
      if (this.$data.isPublic) {
        endpoint = '/files/download/public?file_id=' + downloadedFile.id
        headers = this.generatePublicHeaders(this.virtualId, this.currentDir)
      } else {
        endpoint = '/files/download?file_id=' + downloadedFile.id
        headers = this.generateHeaders(this.userId, this.currentDir)
      }
      headers.responseType = 'blob'
      this.$axios.get(endpoint, headers).then((response) => {
        const reader = new FileReader()
        reader.onload = () => {
          let responseString
          if (reader.result[0] === '{') {
            responseString = JSON.parse(reader.result)
          }
          if (responseString === undefined) {
            const blob = new Blob([response.data], { type: mime.lookup(downloadedFile.name) })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = downloadedFile.name
            link.click()
            URL.revokeObjectURL(link.href)
          } else {
            this.errorToast('Error at downloading file ' + downloadedFile.name + ', ' + responseString.message)
          }
        }
        reader.readAsText(response.data)
      })
    },
    downloadItemsAsZip (endpoint, headers) {
      const mime = require('mime-types')
      this.$axios.get(endpoint, headers).then((response) => {
        const reader = new FileReader()
        reader.onload = () => {
          let responseString
          if (reader.result[0] === '{') {
            responseString = JSON.parse(reader.result)
          }
          if (responseString === undefined) {
            const blob = new Blob([response.data], { type: mime.lookup('download.zip') })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = 'download.zip'
            link.click()
            URL.revokeObjectURL(link.href)
          } else {
            this.errorToast('Error at downloading zip, ' + responseString.message)
          }
        }
        reader.readAsText(response.data)
      })
    },
    deleteItems (itemList) {
      if (this.$store.state.home.tab === 'myDrive') {
        this.softDeleteItems(itemList)
      } else {
        this.permanentDeleteItems(itemList)
      }
    },
    softDeleteItems (itemList) {
      let idx
      for (idx in itemList) {
        this.softDeleteItem(itemList[idx])
      }
    },
    async softDeleteItem (item) {
      let itemType = 'file'
      if (item.is_folder) {
        itemType = 'folder'
      }

      const endpoint = '/' + itemType + 's'
      try {
        let payload
        if (itemType === 'file') {
          payload = {
            headers: {
              user_id: this.userId
            },
            data: {
              file_id: item.id
            }
          }
        } else {
          payload = {
            headers: {
              user_id: this.userId
            },
            data: {
              folder_id: item.id
            }
          }
        }
        await this.$axios.delete(endpoint, payload).then((response) => {
          if (response.data.status === '200 OK') {
            this.successToast('Soft delete success: ' + item.name)
          } else {
            this.errorToast(response.data.message)
          }
          this.moveToDir(this.currentDir)
        })
      } catch (e) {
        this.errorToast('Soft delete failed: ' + item.name)
        this.error = e.response.data.message
        this.moveToDir(this.currentDir)
      }
    },
    restoreSoftDeletedItems (itemList) {
      let idx
      for (idx in itemList) {
        this.restoreSoftDeletedItem(itemList[idx])
      }
    },
    async restoreSoftDeletedItem (item) {
      let itemType = 'file'
      if (item.is_folder) {
        itemType = 'folder'
      }
      const endpoint = '/' + itemType + 's/restore'
      itemType += '_id'
      let payload = {}
      if (item.is_folder) {
        payload = { folder_id: item.id }
      } else {
        payload = { file_id: item.id }
      }
      try {
        await this.$axios.post(endpoint, payload, this.generateHeaders(this.userId, '')).then((response) => {
          if (response.data.status === '200 OK') {
            this.successToast('Restore success: ' + item.name)
          } else {
            this.errorToast(response.data.message)
          }
          this.trashClicked()
          return response
        })
      } catch (e) {
        this.errorToast('Restore failed: ' + item.name)
        this.trashClicked()
        this.error = e.response.data.message
      }
    },
    permanentDeleteItems (deletedItems) {
      let idx
      for (idx in deletedItems) {
        this.permanentDeleteItem(deletedItems[idx])
      }
      this.getUserData()
    },
    async permanentDeleteItem (deletedItem) {
      let itemType = 'file'
      if (deletedItem.is_folder) {
        itemType = 'folder'
      }
      const endpoint = '/' + itemType + 's/permanent'
      try {
        let payload
        if (itemType === 'file') {
          payload = {
            headers: {
              user_id: this.userId
            },
            data: {
              file_id: deletedItem.id
            }
          }
        } else {
          payload = {
            headers: {
              user_id: this.userId
            },
            data: {
              folder_id: deletedItem.id
            }
          }
        }
        await this.$axios.delete(endpoint, payload).then((response) => {
          if (response.data.status === '200 OK') {
            this.successToast('Permanent delete success: ' + deletedItem.name)
          } else {
            this.errorToast(response.data.message)
          }
          if (this.tab !== 'groups') {
            this.trashClicked()
          } else {
            this.moveToDir(this.currentDir)
          }
          this.getUserData()
        })
      } catch (e) {
        this.errorToast('Permanent delete failed: ' + deletedItem.name)
        this.error = e.response.data.message
        if (this.tab !== 'groups') {
          this.trashClicked()
        } else {
          this.moveToDir(this.currentDir)
        }
      }
    },
    renameItem (renameItem) {
      let itemType = 'file'
      if (renameItem.is_folder) {
        itemType = 'folder'
      }
      const formData = new FormData()
      formData.append(itemType + '_id', renameItem.id)
      formData.append(itemType + '_name', renameItem.name)
      const endpoint = '/' + itemType + 's/rename'
      this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, this.currentDir)).then((response) => {
        if (response.data.status === '200 OK') {
          this.successToast('Rename success: ' + renameItem.name)
        } else {
          this.errorToast(response.data.message)
        }
        this.moveToDir(this.currentDir)
      }).catch(() => {
        this.errorToast('Rename success: ' + renameItem.name)
        this.moveToDir(this.currentDir)
      })
    },
    saveItem (savedItemList) {
      this.$store.dispatch('home/setActionItemList', savedItemList)
      this.$store.dispatch('home/setMoveOriginalDir', this.currentDir)
    },
    commitAction (action) {
      let idx
      for (idx in this.actionItemList) {
        this.commitItem(this.actionItemList[idx], action)
      }
      this.$store.dispatch('home/setIsMove', false)
      this.$store.dispatch('home/setIsCopy', false)
      this.$store.dispatch('home/setActionItemList', [])
    },
    async commitItem (commitedItem, action) {
      let itemType = 'file'
      if (commitedItem.is_folder) {
        itemType = 'folder'
      }
      const endpoint = '/' + itemType + 's/' + action
      const formData = new FormData()
      formData.append(itemType + '_id', commitedItem.id)
      formData.append('target_folder_id', this.currentDir)
      await this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, this.moveOriginalDir)).then((response) => {
        if (response.data.status === '200 OK') {
          this.successToast(action + ' success: ' + commitedItem.name)
        } else {
          this.errorToast(response.data.message)
        }
        this.moveToDir(this.currentDir)
      }).catch(() => {
        this.errorToast(action + ' failed: ' + commitedItem.name)
        this.moveToDir(this.currentDir)
      })
    },
    async shareItem (sharedItem) {
      let itemType = 'file'
      if (sharedItem.is_folder) {
        itemType = 'folder'
      }
      const endpoint = '/' + itemType + 's?' + itemType + '_id=' + sharedItem.id
      const dirData = await this.$axios.get(endpoint, this.generateHeaders(this.userId, '')).then((response) => {
        return response.data.data
      })
      this.share.linkSharing = dirData.public
      this.share.target = sharedItem
      this.$refs.shareModal.showModal()
    },
    async signXMLItem (xmlFile) {
      if (xmlFile.isAuto) {
        const endpoint = '/files/sign'
        const formData = new FormData()
        formData.append('file_id', xmlFile.id)
        this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, this.currentDir)).then((response) => {
          if (response.data.status === '200 OK') {
            this.successToast('XML Sign success: ' + xmlFile.name)
          } else {
            this.errorToast(response.data.message)
          }
        }).catch(() => {
          this.errorToast('XML Sign failed: ' + xmlFile.name)
        })
      } else {
        const endpoint = '/files/download?file_id=' + xmlFile.id
        const headers = this.generateHeaders(this.userId, this.currentDir)
        const mime = require('mime-types')
        headers.responseType = 'blob'

        const response = await this.$axios.get(endpoint, headers)
        const blob = new Blob([response.data], { type: mime.lookup(xmlFile.name) })
        const reader = new FileReader()
        reader.onload = () => {
          const keyReader = new FileReader()
          keyReader.onload = async () => {
            const forge = require('node-forge')
            const pki = forge.pki
            let privatePem
            const privateKey = pki.privateKeyFromPem(keyReader.result)
            if (xmlFile.keyType === 'pkcs-1') {
              const rsaPrivateKey = pki.privateKeyToAsn1(privateKey)
              const privateKeyInfo = pki.wrapRsaPrivateKey(rsaPrivateKey)
              privatePem = pki.privateKeyInfoToPem(privateKeyInfo)
            } else {
              privatePem = keyReader.result
            }
            const publicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e)
            const publicPem = pki.publicKeyToPem(publicKey)
            let convertedPrivateKey, convertedPublicKey
            try {
              convertedPrivateKey = await this.getPrivateKey(privatePem)
              convertedPublicKey = await this.getPublicKey(publicPem)
            } catch (error) {
              this.errorToast('There is something wrong with your key or xml file')
              return
            }

            const signature = new XmlDSigJs.SignedXml()
            signature.Sign(
              { name: 'RSASSA-PKCS1-v1_5' },
              convertedPrivateKey,
              XmlDSigJs.Parse(reader.result),
              {
                keyValue: convertedPublicKey,
                references: [
                  { hash: 'SHA-512', transforms: ['enveloped', 'c14n'] }
                ]
              }
            ).then((response) => {
              const xmlResponse = this.appendSignature(reader.result, response)
              const val = new XMLSerializer().serializeToString(xmlResponse)
              const blob = new Blob([val], {
                type: 'text/plain'
              })
              this.replaceFile(xmlFile.id, xmlFile.name, blob)
            }).catch(() => {
              this.errorToast('There is something wrong with your key or xml file')
            })
          }
          keyReader.readAsText(xmlFile.privateKey)
        }
        reader.readAsText(blob)
      }
    },
    async replaceFile (fileId, fileName, xmlFile) {
      const endpoint = '/files/replace'
      const header = this.generateHeaders(this.userId, this.currentDir)
      const formData = new FormData()
      formData.append('file_id', fileId)
      formData.append('file', new File([xmlFile], fileName))
      const response = await this.$axios.post(endpoint, formData, header)
      if (response.data.status === '200 OK') {
        this.successToast('File successfully signed')
        this.moveToDir(this.currentDir)
      } else {
        this.errorToast(response.data.message)
      }
    },
    async getUserData () {
      await this.$store.dispatch('home/prepareMyDrive', this.$store.$cookies.get('userid'))
    },
    createFolder (newName) {
      let endpoint, headers
      if (this.isPublic) {
        endpoint = '/folders/public'
        headers = this.generatePublicHeaders(this.virtualId, this.currentDir)
      } else {
        endpoint = '/folders'
        headers = this.generateHeaders(this.userId, this.currentDir)
      }
      const formData = new FormData()
      formData.append('folder_name', newName)
      this.$axios.post(endpoint, formData, headers).then((response) => {
        this.moveToDir(this.currentDir)
        if (response.data.status === '200 OK') {
          this.successToast('Folder created')
        } else {
          this.errorToast(response.data.message)
        }
      }).catch(() => {
        this.errorToast('Folder creation failed')
      })
    },
    encodeFile (file) {
      const endpoint = '/files/encode'
      const formData = new FormData()
      formData.append('file_id', file.id)
      this.$axios.post(endpoint, formData, this.generateHeaders(this.userId, this.currentDir)).then((response) => {
        if (response.data.status === '200 OK') {
          this.successToast('Encode success')
        } else {
          this.errorToast(response.data.message)
        }
        this.moveToDir(this.currentDir)
      }).catch(() => {
        this.errorToast('Encode failed')
      })
    },
    getItemData (itemId) {
      const endpoint = '/files?file_id=' + itemId
      return this.$axios.get(endpoint, this.generateHeaders(this.userId, this.currentDir))
    },
    generateHeaders (userId, currentDir) {
      return {
        headers: {
          user_id: userId,
          current_dir: currentDir
        }
      }
    },
    generatePublicHeaders (virtualId, currentDir) {
      return {
        headers: {
          virtual_id: virtualId,
          current_dir: currentDir
        }
      }
    }
  }
}
