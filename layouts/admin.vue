<template>
  <div id="admin">
    <Sidebar />
    <div id="non-sidebar">
      <Navbar :admin-name="adminName" />
      <div id="status-message-container">
        <div id="status-message" />
      </div>
      <nuxt />
    </div>
  </div>
</template>

<style>
  @import url('https://fonts.googleapis.com/css?family=Ubuntu&display=swap');
  @import url('https://fonts.googleapis.com/css?family=Lato&display=swap');

  * {
    margin: 0;
    padding: 0;
  }

  #admin {
    font-family: 'Ubuntu', sans-serif;
    font-size: 14px;
    transition-duration: 0.2s;
    --admin1: #00509B;
    --admin2: #003B72;
    --admin4: #C9E8FF;
    --admin5: #C3C3C1;
    --admin6: #676767;
    --admin7: #00B648;
    --admin8: #EA4C4C;
    --admin9: #00973B;
    --admin10: #D64040;
    --admin11: #B3B3B2;
    --admin13: #71D699;
    --admin14: #F5B0B0;
    --admin15: #DBDBDB;
    --filter-to-white: invert(100%) sepia(0%) saturate(7482%) hue-rotate(142deg) brightness(99%) contrast(100%);
    --filter-to-admin1: invert(21%) sepia(77%) saturate(1909%) hue-rotate(191deg) brightness(93%) contrast(105%);
  }

  #admin h1 {
    font-family: 'Lato', sans-serif;
    font-size: 24px;
    padding-top: 20px;
    padding-bottom: 10px;
  }

  #admin .subtitle {
    color: var(--admin6);
  }

  #admin input, #admin button {
    min-height: 28px;
    padding: 0 10px;
  }

  #admin input, #admin .dropdown {
    border: 1px solid var(--admin5);
  }

  #admin button {
    vertical-align: top;
    width: auto;
    border: none !important;
  }

  #admin button {
    color: black;
    background-color: var(--admin5);
  }

  #admin button:hover {
    background-color: var(--admin11);
  }

  #admin button:disabled {
    color: var(--admin11);
    background-color: var(--admin15);
  }

  #admin .btn-green {
    color: white;
    background-color: var(--admin7);
  }

  #admin .btn-green:hover {
    background-color: var(--admin9);
  }

  #admin .btn-green:disabled {
    color: white;
    background-color: var(--admin13);
  }

  #admin .btn-red {
    color: white;
    background-color: var(--admin8);
  }

  #admin .btn-red:hover {
    background-color: var(--admin10);
  }

  #admin .btn-red:disabled {
    color: white;
    background-color: var(--admin14);
  }

  #admin .btn-submit {
    color: white;
    background-color: var(--admin1);
  }

  #admin .btn-submit:hover {
    color: white;
    background-color: var(--admin2);
  }

  #admin th, #admin td, #admin .notice {
    padding: 4px 12px !important;
    vertical-align: middle !important;
  }

  #admin th {
    background-color: var(--admin1);
    color: white;
  }

  #admin #status-message-container {
    z-index: 3;
    width: 100%;
    position: absolute;
    text-align: center;
  }

  #admin #status-message {
    padding: 5px 15px;
    display: none;
  }

  #admin .status-green {
    background-color: var(--admin13);
    color: var(--admin9);
  }

  #admin .status-red {
    background-color: var(--admin14);
    color: var(--admin10);
  }

  #admin .notice {
    background-color: var(--admin14);
    color: var(--admin10);
  }

  #admin .notice-action {
    float: right;
    font-weight: bold;
    cursor: pointer;
  }

  #admin .hidden-element {
    display: none;
  }

  #admin #non-sidebar {
    margin-left: 60px;
    margin-top: 10px;
  }

  #admin #content {
    width: 95%;
    margin: 10px auto 0 auto;
  }

  #admin .dropdown {
    display: inline-block;
    caret-color: transparent;
  }

  #admin .dropdown:focus-within {
    outline: 5px auto -webkit-focus-ring-color;
  }

  #admin .dropdown input {
    padding: 0 0 0 10px;
    height: 26px !important;
    width: 30px;
    display: inline-block;
    border: none !important;
    outline: none;
    caret-color: black;
    z-index: 2;
    position: relative;
  }

  #admin .dropdown .extra {
    width: 25px;
    display: inline-block;
    z-index: 1;
    position: relative;
    margin-left: -4px;
    background-color: white;
    text-align: right;
  }

  #admin .dropdown input::-webkit-inner-spin-button,
  #admin .dropdwon input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  #admin .dropdown select {
    text-align: right;
    padding: 4px 0;
    width: 75px;
    margin-left: -58px;
    display: inline-block;
    border: none;
    outline: none;
    z-index: 0;
  }

</style>

<script>
import Navbar from '../components/admin/Navbar'
import Sidebar from '../components/admin/Sidebar'

export default {
  components: {
    Navbar,
    Sidebar
  },
  middleware: 'admin-auth',
  data () {
    return {
      adminName: 'Administrator'
    }
  }
  // TODO: Fetch admin name
}
</script>
