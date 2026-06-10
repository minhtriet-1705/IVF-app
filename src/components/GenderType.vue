<template>
  <v-icon
    v-if="gender"
    class="mr-2"
    :color="gender == 1 ? 'blue lighten-1' : 'pink lighten-3'"
    large
  >
    {{ gender == 1 ? "mdi-human-male" : "mdi-human-female" }}</v-icon
  >
</template>

<script>
export default {
  props: ["gender"],
};
</script>
