<template>
  <div>
    <div class="countdown" v-if="secondCount < -1800">
      <div class="countdown__block">
        <div class="countdown__digit text-uppercase">
          {{ $t("common.missed") }}!
        </div>
        <div class="countdown__text">{{ $t("common.contactagain") }}!</div>
      </div>
    </div>
    <div class="countdown" v-else-if="secondCount <= 0">
      <div class="countdown__block">
        <div class="countdown__digit text-uppercase">
          {{ $t("common.itstime") }}!
        </div>
        <div class="countdown__text">{{ $t("common.doitnow") }}!</div>
      </div>
    </div>
    <div class="countdown" v-else>
      <div class="countdown__block">
        <div class="countdown__digit">{{ hours | twoDigits }}</div>
        <div class="countdown__text">Hrs</div>
      </div>
      <div class="countdown__block">
        <div class="countdown__digit">{{ minutes | twoDigits }}</div>
        <div class="countdown__text">Min</div>
      </div>
      <div class="countdown__block">
        <div class="countdown__digit">{{ seconds | twoDigits }}</div>
        <div class="countdown__text">Sec</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    autoStart: {
      type: Boolean,
      default: false,
    },
    autoSeconds: {
      type: Number,
      default: 300,
    },
  },
  data() {
    return {
      secondCount: 0,
      intervalCountDown: null,
    };
  },
  mounted() {
    if (this.autoStart && this.autoSeconds) {
      this.startCountDown(this.autoSeconds);
    }
  },
  methods: {
    startCountDown(seconds = 120) {
      this.secondCount = seconds;
      if (this.secondCount > 0) {
        clearInterval(this.intervalCountDown);
        this.intervalCountDown = setInterval(() => {
          this.secondCount -= 1;
          // if (this.secondCount < 0) {
          //   clearInterval(this.intervalCountDown);
          //   this.$emit("onFinish", true);
          // }
        }, 1000);
      }
    },
    stopCountDown() {
      this.secondCount = 0;
      clearInterval(this.intervalCountDown);
    },
  },
  computed: {
    seconds() {
      if (this.secondCount < 0) return 0;
      return this.secondCount % 60;
    },
    minutes() {
      if (this.secondCount < 0) return 0;
      return Math.trunc(this.secondCount / 60) % 60;
    },
    hours() {
      if (this.secondCount < 0) return 0;
      return Math.trunc(this.secondCount / 60 / 60) % 24;
    },
    days() {
      if (this.secondCount < 0) return 0;
      return Math.trunc(this.secondCount / 60 / 60 / 24);
    },
  },
  filters: {
    twoDigits(value) {
      if (value.toString().length <= 1) {
        return "0" + value.toString();
      }
      return value.toString();
    },
  },
};
</script>
<style lang="scss">
.countdown {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  display: flex;
  justify-content: center;
  &__block {
    text-align: center;
    padding: 0px 15px;
    position: relative;
    &:first-child {
      padding-left: 0;
      .countdown__digit {
        &:before {
          display: none;
        }
      }
    }
    &:last-child {
      padding-right: 0;
    }
  }
  &__text {
    display: inline-block;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  &__digit {
    font-size: 2.2rem;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 6px;
    &:before {
      content: ":";
      position: absolute;
      left: -5px;
    }
  }
}
</style>
