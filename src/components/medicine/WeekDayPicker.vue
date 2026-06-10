<template>
  <div class="d-flex week_day">
    <div
      v-ripple
      class="d-block week_day_item"
      v-for="option in options"
      :key="option.value"
      @click="toggle(option)"
      :class="{ selected: items.find((i) => i == option.value) || false }"
    >
      <h3 class="text-center" :class="{ en: $i18n.locale == 'en' }">
        {{ option.text }}
      </h3>
    </div>
  </div>
</template>

<script>
export default {
  props: ["value", "editable"],
  data() {
    return {
      options: [
        { text: this.$t("weekday.T2"), value: "T2" },
        { text: this.$t("weekday.T3"), value: "T3" },
        { text: this.$t("weekday.T4"), value: "T4" },
        { text: this.$t("weekday.T5"), value: "T5" },
        { text: this.$t("weekday.T6"), value: "T6" },
        { text: this.$t("weekday.T7"), value: "T7" },
        { text: this.$t("weekday.CN"), value: "CN" },
      ],
      items: [],
    };
  },
  watch: {
    value() {
      this.render(this.value);
    },
  },
  mounted() {
    if (this.value) {
      this.render(this.value);
    }
  },
  methods: {
    render(items = []) {
      this.items = items;
      this.$forceUpdate();
    },
    toggle({ value }) {
      if (!this.editable) return;
      var ind = this.items.findIndex((item) => item == value);
      if (ind == -1) {
        this.items.push(value);
      } else {
        this.items.splice(ind, 1);
      }
      this.$emit("input", this.items);
    },
  },
};
</script>

<style lang="scss">
.week_day {
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  padding-bottom: 5px;
  .week_day_item {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    cursor: pointer;
    display: flex;
    justify-content: center;
    border: 2px solid #212121;
    padding: 5px;
    margin-right: 5px;
    border-radius: 12px;
    min-width: 64px;
    :last-child {
      margin-right: 0px;
    }
    h3 {
      text-transform: uppercase;
      font-size: 115%;
      line-height: 60px;
      letter-spacing: 0.05rem;
    }
    h3.en {
      font-size: 100%;
    }
  }
  .week_day_item.selected {
    background-color: #212121 !important;
    color: white !important;
  }
}
</style>
