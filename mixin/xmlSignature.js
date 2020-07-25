
export default {
  methods: {
    removeLines (str) {
      return str.replace('\n', '')
    },
    base64ToArrayBuffer (b64) {
      const byteString = window.atob(b64)
      const byteArray = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i)
      }
      return byteArray
    },
    pemPrivateToArrayBuffer (pem) {
      const b64Lines = this.removeLines(pem)
      const b64Prefix = b64Lines.replace('-----BEGIN PRIVATE KEY-----', '')
      const b64Final = b64Prefix.replace('-----END PRIVATE KEY-----', '')
      return this.base64ToArrayBuffer(b64Final)
    },

    pemPublicToArrayBuffer (pem) {
      const b64Lines = this.removeLines(pem)
      const b64Prefix = b64Lines.replace('-----BEGIN PUBLIC KEY-----', '')
      const b64Final = b64Prefix.replace('-----END PUBLIC KEY-----', '')
      return this.base64ToArrayBuffer(b64Final)
    },

    async getPrivateKey (pemFile) {
      try {
        return await window.crypto.subtle.importKey(
          'pkcs8',
          this.pemPrivateToArrayBuffer(pemFile),
          {
            name: 'RSASSA-PKCS1-v1_5',
            hash: { name: 'SHA-512' }
          },
          false,
          ['sign']
        )
      } catch (e) {
        return null
      }
    },

    async getPublicKey (pemFile) {
      try {
        return await window.crypto.subtle.importKey(
          'spki',
          this.pemPublicToArrayBuffer(pemFile),
          {
            name: 'RSASSA-PKCS1-v1_5',
            hash: { name: 'SHA-512' }
          },
          true,
          ['verify']
        )
      } catch (e) {
        return null
      }
    },
    appendSignature (xml, signature) {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xml, 'text/xml')
      const signatureDoc = parser.parseFromString(signature, 'text/xml')
      xmlDoc.lastElementChild.append(signatureDoc.documentElement)
      return xmlDoc
    }
  }
}
