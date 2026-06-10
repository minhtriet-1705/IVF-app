<template>
  <v-list-item
    class="content_card_body"
    align="left"
    @click="
      $emit('click');
      $emit('view', item);
    "
  >
    <v-list-item-avatar
      class="content_card_image"
      v-if="item.image != false"
      :size="item.imageSize || 40"
    >
      <img alt="Avatar" :src="item.image" />
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title v-html="item.title"></v-list-item-title>
      <v-list-item-subtitle v-html="item.content" v-if="item.content">
      </v-list-item-subtitle>
      <p
        class="freeContent"
        v-html="item.freeContent"
        v-if="item.freeContent"
      ></p>
      <p
        class="freeContent"
        v-html="item.freeContent2"
        v-if="item.freeContent2"
      ></p>
      <v-list-item-subtitle
        v-html="item.message"
        v-if="item.message"
      ></v-list-item-subtitle>
      <v-list-item-subtitle v-if="item.rating">
        <v-rating
          v-model="item.rating"
          background-color="yellow lighten-3"
          color="yellow accent-4"
          class="ml-n1 pr-n1"
          half-increments
          small
          dense
        ></v-rating>
      </v-list-item-subtitle>
    </v-list-item-content>

    <slot name="controller"></slot>
  </v-list-item>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default() {
        return {
          id: "",
          title: "",
          content: "",
          message: "",
          image: false,
          imageSize: 40,
          item: null,
          rating: null,
        };
      },
    },
  },
  data() {
    return {};
  },
  methods: {},
};
</script>
