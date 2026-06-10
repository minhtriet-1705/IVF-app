<template>
  <v-list align="center" v-if="template">
    <v-list-item
      v-show="template.title"
      class="content_card_title"
      align="left"
    >
      <v-list-item-title class="pl-3 pr-3 text-capitalize">
        <b>{{ title }}</b>
      </v-list-item-title>
      <slot name="title-controller" />
    </v-list-item>
    <v-progress-circular
      v-show="loading"
      indeterminate
      :color="loadingColor || '#fefefe'"
    ></v-progress-circular>
    <content-item
      v-show="!loading"
      v-for="(item, index) in items"
      :key="index"
      :item="item"
      @view="$emit('view', item)"
    >
      <template v-slot:controller>
        <slot name="card-controller" :item="item" />
      </template>
    </content-item>
    <h5 v-if="noData" class="no_data">
      {{ $t("common.nodata") }}
    </h5>
    <div v-if="pageCount > 1">
      <v-pagination
        v-model="pagination.page"
        class="my-4"
        :length="pageCount"
        color="#6166f5"
        @input="render(template)"
      ></v-pagination>
    </div>
  </v-list>
</template>

<script>
import ContentItem from "./ContentItem.vue";

export default {
  components: { ContentItem },
  props: {
    loadingColor: {
      type: String,
      default: "",
    },
    template: {
      type: Object,
      default() {
        return {
          title: "",
          api: {
            url: "",
            query: {},
            headers: {},
          },
          transform: {
            id: "",
            title: "",
            content: "",
            message: null,
            image: false,
          },
        };
      },
    },
  },
  watch: {
    template: {
      deep: true,
      handler(value) {
        this.clean();
        this.render(value);
      },
    },
  },
  data() {
    return {
      title: "",
      pageCount: 1,
      pagination: {
        page: 1,
        limit: 10,
      },
      loading: false,
      noData: false,
      items: [],
      defaultImage: "/icons/arrow-right.png",
    };
  },
  mounted() {
    this.clean();
  },
  methods: {
    getTitleByLanguage(title) {
      if (!title) return "";
      var result = this.$t(`nav.${title.toLowerCase()}`);
      if (!result.includes("nav.")) return result;
      return title;
    },
    async render(template) {
      if (!template.api || !template.api.url) {
        this.noData = true;
        this.items = [];
        return;
      }
      this.title = this.getTitleByLanguage(template.title);
      this.noData = false;
      this.loading = true;
      var err;
      try {
        var { url, query, headers } = this.template.api;
        query = query || {};
        headers = headers || {};
        headers = { ...headers, ...this.pagination };
        var result = await this.$httpClient.get(url, query, headers);
        if (result.error) {
          err = result.error;
        } else {
          var { items, totals } = result;
          if (!items.length) {
            this.noData = true;
          } else {
            this.items = this.transformItems(items);
            this.pageCount = Math.ceil(totals / this.pagination.limit);
          }
        }
      } catch (error) {
        err = error;
      }
      if (err) {
        this.showError(err || err.message);
      }
      this.loading = false;
    },
    transformItems(items = []) {
      return items.map((item) => {
        var { id, title, content, message, image } = this.template.transform;
        return {
          ...item,
          id: item[id],
          title:
            typeof title == "string"
              ? item[title]
              : title.transform(item[title.field]),
          content:
            typeof content == "string"
              ? item[content]
              : content.transform(item[content.field]),
          message:
            message == null || typeof message == "string"
              ? item[message]
              : message.transform(item[message.field]), // not use message
          image:
            image == false // not use image
              ? false
              : typeof image == "object"
              ? image.transform(item[image.field])
              : image.includes("/") // image is url
              ? image
              : item[image] // image is provided
              ? item[image]
              : this.defaultImage, // image default
          item,
        };
      });
    },
    clean() {
      this.pageCount = 1;
      this.items = [];
      this.pagination = {
        page: 1,
        limit: 10,
      };
      if (!this.template) return;
      var { api } = this.template;
      if (!api) return;
      var { headers } = api;
      if (!headers) return;
      var { page, limit } = headers;
      if (page) {
        this.pagination.page = page;
      }
      if (limit) {
        this.pagination.limit = limit;
      }
    },
  },
};
</script>
