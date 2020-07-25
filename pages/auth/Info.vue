<template>
  <div class="login-container util__flex util__flex-col">
    <img src="../../assets/img/Drive__logo_.svg" class="logo">
    <hr class="auth-line">
    <div>
      <form>
        <p class="form-label universal-base-sz" style="margin-top:15px;">
          Please check your email to proceed further.
        </p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'auth'
}
</script>

<style>
@import "../../assets/css/elements/body.css";
@import "../../assets/css/components/authentication.css";
@import "../../assets/css/components/util.css";
</style>
