<template>
  <div>
    <v-btn
      class="mb-3 btn-upload text-capitalize mt-1"
      @click="isShow = true"
      elevation="0"
      dark
      rounded
      style="height: 32px !important"
    >
      {{ $t("common.selecticon") }}
    </v-btn>
    <v-dialog v-model="isShow" max-width="342px">
      <v-card>
        <v-card-title>{{ $t("common.selecticon") }}</v-card-title>
        <v-card-text>
          <div
            v-for="(rows, ind) in items"
            :key="ind"
            class="d-flex justify-space-around pt-2 pb-2"
          >
            <div
              v-ripple
              v-for="item in rows"
              :key="item.imageUrl"
              class="pa-2"
              @click="chooseIcon(item)"
              style="width: 33%; text-align: center"
            >
              <v-avatar size="64px" style="border-radius: 0px">
                <img
                  alt="Avatar"
                  :src="item.imageUrl || '/medicine/injection.png'"
                /> </v-avatar
              ><br />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: ["value"],
  data() {
    return {
      isShow: false,
      items: [
        [
          { name: "Capsule", imageUrl: "/medicine/capsules.png" },
          { name: "Dropper", imageUrl: "/medicine/dropper.png" },
          { name: "Bottle", imageUrl: "/medicine/bottle.png" },
        ],
        [
          { name: "Inject", imageUrl: "/medicine/injection.png" },
          { name: "Tube", imageUrl: "/medicine/tube.png" },
          { name: "Box", imageUrl: "/medicine/box.png" },
        ],
        [
          { name: "Bell", imageUrl: "/icons/bell.png" },
          { name: "Book", imageUrl: "/icons/book.png" },
          { name: "Check", imageUrl: "/icons/check.png" },
        ],
        [
          { name: "Star", imageUrl: "/icons/star.png" },
          { name: "Tick", imageUrl: "/icons/tick.png" },
          { name: "Trophy", imageUrl: "/icons/trophy.png" },
        ],
      ],
    };
  },
  methods: {
    async chooseIcon(item = {}) {
      this.isShow = false;
      this.$emit("input", item.imageUrl);
    },
  },
};
</script>
