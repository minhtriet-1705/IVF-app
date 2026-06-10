<template>
  <div style="width: 100%; text-align: center">
    <div
      ref="lav2Container"
      style="height: auto; margin-left: auto; margin-right: auto"
      :style="{ width, ...styleCss }"
    ></div>
  </div>
</template>

<script>
import lottie from "lottie-web";

export default {
  props: {
    url: {
      type: String,
      default: "",
    },
    width: {
      type: String,
      default: "50%",
    },
    styleCss: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  async mounted() {
    this.renderBleAnimation();
  },
  methods: {
    async renderBleAnimation() {
      if (!this.url) return;
      // then lottie can render ble icon
      lottie.loadAnimation({
        container: this.$refs.lav2Container,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: this.url,
      });
    },
  },
};
</script>
