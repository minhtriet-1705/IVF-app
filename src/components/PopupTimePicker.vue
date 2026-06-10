<template>
  <v-dialog v-model="isShow" max-width="420">
    <v-card>
      <v-card-title>{{ $t("common.choosetime") }}</v-card-title>
      <v-card-text>
        <v-time-picker
          full-width
          :allowed-minutes="allowedMinutes"
          color="black"
          format="24hr"
          v-model="timeSelector"
          ref="picker"
        ></v-time-picker>
        <div class="d-flex justify-center mt-3">
          <v-btn @click="selectTime" dark color="dark" block>
            {{ $t("common.choose") }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      isShow: false,
      timeSelector: null,
      keyId: null,
    };
  },
  methods: {
    allowedMinutes: (v) => v % 15 == 0,
    async open(keyId) {
      this.isShow = true;
      this.timeSelector = null;
      this.keyId = keyId;
      await this.sleep(100);
      this.$refs.picker.selectingHour = true;
    },
    async selectTime() {
      this.$emit("onValue", { keyId: this.keyId, value: this.timeSelector });
      this.isShow = false;
    },
  },
};
</script>
