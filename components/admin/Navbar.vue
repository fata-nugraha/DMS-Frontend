<template>
  <div id="nav">
    <div id="overlay" @click="expand" />
    <div id="container">
      <nuxt-link to="/admin/">
        <div id="logo" />
      </nuxt-link>
      <div id="profile">
        <div id="default" @click="expand">
          <div id="picture" />
          <div id="name">
            {{ adminName }}
          </div>
        </div>
        <ul id="expanded">
          <!--
          <li>
            <div>Profile Settings</div>
          </li>
          -->
          <li>
            <div @click="signOut">
              Sign Out
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
  #nav {
    width: 100%;
    top: 10px;
    background-color: white;
    font-size: 14px;
  }

  #overlay {
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    position: absolute;
    display: none;
    z-index: 6;
  }

  #container {
    width: 95%;
    height: 60px;
    margin: auto;
    position: relative;
  }

  #logo {
    height: 100%;
    width: 124px;
    float: left;
    background-image: url("data:image/svg+xml,%3Csvg width='115' height='26.25' viewBox='0 0 184 42' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.23779 14.9475L8.201 11.9771H38.3408L37.4306 14.9475H9.23779Z' fill='%230A2640'/%3E%3Cpath d='M32.6098 26.8291L30.601 38.7108H5.56688L3.55805 26.8291H9.04194L12.4327 31.2847H23.7351L27.1258 26.8291H32.6098ZM36.1678 23.8588H25.6189L22.2281 28.3144H13.9397L10.549 23.8588H0L3.014 41.6812H33.1538L36.1678 23.8588Z' fill='%2300509B'/%3E%3Cpath d='M36.3752 20.8883L37.293 17.9179H4.13919L5.05694 20.8883H36.3752Z' fill='%2300509B'/%3E%3Cpath d='M38.1105 9.00672L39.2242 6.03638H12.1465L13.3401 9.00672H38.1105Z' fill='%2300509B'/%3E%3Cpath d='M43.2917 6.11554H59.4971C63.2579 6.11554 66.5285 6.72204 69.3089 7.93504C72.1236 9.14803 74.3082 10.8833 75.8627 13.1408C77.4173 15.3983 78.2519 18.0602 78.3666 21.1264C78.519 25.2034 77.696 28.7918 75.8973 31.8917C74.0974 34.9579 71.5196 37.3333 68.1637 39.0181C64.8408 40.6691 61.0084 41.4946 56.6664 41.4946H37.4353L43.2917 6.11554ZM56.7288 32.195C59.84 32.195 62.2144 31.2347 63.852 29.3141C65.5225 27.3598 66.3011 24.8664 66.1877 21.834C66.1108 19.7786 65.402 18.195 64.0612 17.0831C62.7547 15.9711 60.8877 15.4152 58.4603 15.4152H53.8448L51.0877 32.195H56.7288Z' fill='%230A2640'/%3E%3Cpath d='M94.4657 16.6787C96.6732 14.4549 99.9137 13.343 104.187 13.343L102.514 23.4513C101.654 23.3165 100.814 23.2491 99.9936 23.2491C98.0107 23.2491 96.4544 23.6871 95.3247 24.5632C94.228 25.4055 93.5104 26.787 93.172 28.7076L91.0348 41.4946H79.4449L84.0007 13.8484H94.924L94.4657 16.6787Z' fill='%230A2640'/%3E%3Cpath d='M107.338 13.8484H118.877L114.321 41.4946H102.783L107.338 13.8484ZM114.281 11.6245C112.298 11.6245 110.689 11.1191 109.455 10.1083C108.219 9.06378 107.573 7.76655 107.515 6.21661C107.448 4.4308 108.076 2.94826 109.4 1.76895C110.723 0.589653 112.479 0 114.667 0C116.65 0 118.258 0.488573 119.491 1.46571C120.723 2.40915 121.368 3.65584 121.426 5.20577C121.498 7.12635 120.872 8.67629 119.548 9.85559C118.259 11.0349 116.503 11.6245 114.281 11.6245Z' fill='%230A2640'/%3E%3Cpath d='M155.248 13.8484L139.41 41.4946H127.41L120.683 13.8484H132.119L135.444 28.7076L143.812 13.8484H155.248Z' fill='%230A2640'/%3E%3Cpath d='M183.988 25.5235C184.045 27.0397 183.899 28.6402 183.552 30.3249H163.911C164.193 31.4705 164.788 32.296 165.696 32.8014C166.604 33.3069 167.844 33.5596 169.417 33.5596C171.741 33.5596 173.752 32.9194 175.447 31.639L180.527 38.5632C177.194 40.8544 173.151 42 168.399 42C165.356 42 162.636 41.4777 160.238 40.4332C157.874 39.3887 156.006 37.9061 154.635 35.9856C153.298 34.065 152.581 31.8075 152.484 29.213C152.371 26.1805 152.988 23.4681 154.334 21.0758C155.713 18.6498 157.694 16.7629 160.276 15.4152C162.857 14.0337 165.857 13.343 169.276 13.343C172.216 13.343 174.783 13.8652 176.976 14.9097C179.167 15.9206 180.862 17.3526 182.059 19.2058C183.256 21.0253 183.899 23.1312 183.988 25.5235ZM169.054 21.1264C167.789 21.1264 166.742 21.4633 165.912 22.1372C165.116 22.7774 164.534 23.6703 164.166 24.8159H173.346C173.303 23.6703 172.894 22.7774 172.118 22.1372C171.34 21.4633 170.319 21.1264 169.054 21.1264Z' fill='%2300509B'/%3E%3Cpath d='M114.281 11.6245C112.298 11.6245 110.689 11.1191 109.455 10.1083C108.219 9.06378 107.573 7.76654 107.515 6.21661C107.448 4.4308 108.076 2.94826 109.4 1.76895C110.723 0.58965 112.479 0 114.667 0C116.65 0 118.258 0.48857 119.491 1.46571C120.723 2.40915 121.368 3.65584 121.426 5.20577C121.498 7.12635 120.872 8.67628 119.548 9.85559C118.259 11.0349 116.503 11.6245 114.281 11.6245Z' fill='%2300509B'/%3E%3C/svg%3E%0A");
    background-repeat: no-repeat;
    background-position: center;
  }

  #profile {
    height: 60px;
    width: 240px;
    position: absolute;
    right: 0;
    border-radius: 8px;
    background-color: white;
    padding: 14px 20px;
  }

  #profile #default {
    cursor: pointer;
  }

  #profile #picture {
    height: 36px;
    width: 36px;
    border-radius: 100%;
    margin: 0 8px 4px 0;
    background-color: teal;
    display: inline-block;
  }

  #profile #name {
    margin: 8px 0;
    vertical-align: top;
    display: inline-block;
    font-weight: bold;
  }

  #profile #default:hover {
    color: var(--admin1);
  }

  #profile #expanded {
    list-style-type: none;
    display: none;
    margin: 0;
  }

  #profile #expanded li {
    height: 32px;
  }

  #profile #expanded li:hover {
    color: var(--admin1);
    cursor: pointer;
  }

  #profile #expanded li div {
    padding: 8px 0;
    text-transform: uppercase;
    font-weight: bold;
  }
</style>

<script lang="ts">
export default {
  props: {
    adminName: {
      type: String,
      default () {
        return 'Admin Name'
      }
    }
  },
  data () {
    return {
      expanded: false
    }
  },
  methods: {

    expand () {
      const profile = document.getElementById('profile')
      profile.style.transitionDuration = '0.2s'
      if (this.expanded) {
        profile.style.height = '60px'
        profile.style.boxShadow = 'none'
        profile.style.zIndex = '0'
        const expansion = document.getElementById('expanded')
        expansion.style.display = 'none'
        const overlay = document.getElementById('overlay')
        overlay.style.display = 'none'
        this.expanded = false
      } else {
        profile.style.height = 'auto'
        profile.style.boxShadow = '1px 1px 10px lightgray'
        profile.style.zIndex = '7'
        setTimeout(() => {
          const expansion = document.getElementById('expanded')
          expansion.style.display = 'block'
          const overlay = document.getElementById('overlay')
          overlay.style.display = 'block'
        }, 200)
        this.expanded = true
      }
      profile.style.transitionDuration = '0'
    },

    signOut () {
      // TODO: Cookie logout
      const userId = this.$cookies.get('userid')
      const endpoint = '/auth/logout'
      const headers = {
        headers: {
          user_id: userId
        }
      }
      this.$axios.post(endpoint, null, headers).then(() => {
        this.$cookies.removeAll()
        this.$router.push('/admin/auth')
      })
    }
  }
}
</script>
