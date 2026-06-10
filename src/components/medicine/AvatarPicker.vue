<template>
  <div class="avatar justify-center">
    <choose-file
      v-model="avatar"
      class="mr-2"
      style="
        z-index: 100;
        position: absolute;
        left: calc(50vw + 30px);
        margin-top: -20px;
      "
    />
    <v-avatar size="76px" style="border-radius: 0px; z-index: 3">
      <img alt="Avatar" :src="avatar || '/icons/bell.png'" />
    </v-avatar>

    <div class="d-flex justify-center mt-5">
      <choose-icon v-model="avatar" class="ml-2" />
    </div>
  </div>
</template>

<script>
import ChooseFile from "@/components/ChooseFile.vue";
import ChooseIcon from "@/components/ChooseIcon.vue";

export default {
  props: ["value"],
  components: {
    ChooseFile,
    ChooseIcon,
  },
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
.avatar {
  .v-avatar {
    background-color: #fafafa !important;
    border-radius: 100% !important;
    padding: 10px !important;
    img {
      margin: 20px;
      width: 50%;
    }
  }
}
</style>
