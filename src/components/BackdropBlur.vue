<template>
  <div class="backdrop_blur">
    <div class="container_background grey">
      <div class="blur_filter"></div>
    </div>
    <div class="container_page" transition="fade-transition">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="scss">
.backdrop_blur {
  .container_background {
    position: fixed;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    width: 100vw;
    height: 100vh;
    min-width: 360px;
    .blur_filter {
      position: fixed;
      width: 100vw;
      height: 100vh;
      min-width: 360px;
    }
  }
  .container_page {
    width: 100vw;
    height: 100vh;
    position: fixed;
    overflow-x: hidden;
    overflow-y: scroll;
    max-width: 768px;
    min-width: 360px;
  }
  @media screen and (min-width: 768px) {
    .container_page {
      margin-left: calc(50vw - 384px);
    }
  }
  .bottom_navigation_drawer {
    @media screen and (min-width: 768px) {
      margin-left: calc(50vw - 384px);
    }
  }
}
</style>
