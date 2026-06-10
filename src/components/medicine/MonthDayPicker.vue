<template>
  <div>
    <div
      v-for="row in rows"
      :key="'row' + row"
      class="d-flex month_day justify-space-around"
    >
      <div
        v-ripple
        class="d-block month_day_item"
        v-for="column in columns"
        :key="'columns' + column"
        @click="toggle((row - 1) * columns + column)"
        :class="{
          selected:
            items.find((i) => i == `D${(row - 1) * columns + column}`) || false,
        }"
      >
        <h3 class="text-center">{{ (row - 1) * columns + column }}</h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["value", "editable"],
  data() {
    return {
      rows: 5,
      columns: 6,
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
    toggle(value = 30) {
      if (!this.editable) return;
      value = `D${value}`;
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
.month_day {
  width: 100%;
  .month_day_item {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    cursor: pointer;
    display: flex;
    justify-content: center;
    border: 2px solid #212121;
    margin-right: 5px;
    border-radius: 12px;
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
    :last-child {
      margin-right: 0px;
    }
    h3 {
      text-transform: uppercase;
      font-size: 115%;
      line-height: 50px;
    }
  }
  .month_day_item.selected {
    background-color: #212121 !important;
    color: white !important;
  }
}
</style>
