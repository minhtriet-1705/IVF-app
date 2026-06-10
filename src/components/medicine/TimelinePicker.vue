<template>
  <div class="d-flex timeline">
    <v-avatar size="100%" tile>
      <img alt="Avatar" :src="avatar || '/timelines/1.jpg'" />
    </v-avatar>
  </div>
</template>

<script>
export default {
  props: ["value"],
  data() {
    return {
      avatar: "",
    };
  },
  watch: {
    value() {},
  },
  mounted() {
    if (this.value) {
    }
  },
  methods: {
    render(value) {
      this.avatar = value;
    },
  },
};
</script>

<style lang="scss">
.timeline {
  img {
    border-radius: 12px !important;
    height: 180px !important;
  }
}
</style>
