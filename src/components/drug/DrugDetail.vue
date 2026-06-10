<template>
  <v-container>
    <v-row>
      <v-col cols="12" justify="center" align="center" class="pl-3 pr-3">
        <v-avatar size="102px" style="border-radius: 0px">
          <img alt="Avatar" :src="data.avatar || '/medicine/injection.png'" />
        </v-avatar>
        <div class="w-100 mt-2" style="text-align: center" v-if="isAdmin">
          <choose-file v-model="data.avatar" />
        </div>
        <div class="d-flex justify-center">
          <choose-icon v-model="data.avatar" v-if="isAdmin" />
        </div>
        <h2 class="text-center mb-2 mt-5">{{ data.drugName }}</h2>
      </v-col>
      <v-col cols="12" justify="center" align="center" class="pl-3 pr-3">
        <v-text-field
          v-model="data.drugName"
          clearable
          :label="$t('medicine.name') + ' *'"
          filled
          outlined
          required
          hide-details
          color="primary"
          :disabled="!isAdmin"
        ></v-text-field>
        <text-editor
          v-model="data.description"
          class="mb-4"
          :placeholder="$t('common.description')"
          :editable="isAdmin"
        />
        <v-btn
          type="submit"
          block
          class="btn_login mb-5 text-uppercase"
          :loading="loading"
          v-if="data.drugName && data.description && isAdmin"
          style="margin-top: 15px"
          @click="update"
          dark
        >
          <v-icon class="mr-3" small>mdi-check</v-icon>
          {{ $t("common.confirmed") }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TextEditor from "@/components/ckeditor/TextEditor.vue";
import ChooseFile from "@/components/ChooseFile.vue";
import ChooseIcon from "@/components/ChooseIcon.vue";
import { uuidv4 } from "@/plugins/helpers";
import moment from "moment";

var defaultDrug = () => {
  return {
    drugId: "",
    drugName: "",
    description: "",
    dateCreated: moment().format(),
    dateUpdated: moment().format(),
  };
};

export default {
  props: {
    drugId: {
      type: String,
      default: "",
    },
  },
  components: {
    TextEditor,
    ChooseFile,
    ChooseIcon,
  },
  watch: {
    drugId(val) {
      this.render(val);
    },
  },
  data() {
    return {
      editable: true,
      loading: false,
      data: defaultDrug(),
    };
  },
  mounted() {
    this.render(this.drugId);
  },
  methods: {
    async update() {
      if (!this.data.drugId) this.data.drugId = uuidv4();
      this.data.dateUpdated = moment().format();
      var { drugId } = this.data;
      this.loading = true;
      await this.$dbSet(`drugs/${drugId}`, this.data);
      this.loading = false;
      this.showSuccess(this.$t("common.successMessage"));
      this.$emit("onCreate", this.data);
    },
    async render(id = "") {
      if (!id) return (this.data = defaultDrug());
      this.loading = true;
      this.data = (await this.$dbGet(`drugs/${id}`)) || defaultDrug();
      this.loading = false;
    },
    async view(id = "") {
      if (id) this.editable = false;
      this.render(id);
    },
    async edit(id = "") {
      if (!id) return;
      this.editable = true;
      this.render(id);
    },
    clean() {
      this.editable = true;
      this.loading = false;
      this.data = defaultDrug();
    },
  },
};
</script>

<style lang="scss"></style>
