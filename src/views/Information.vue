<template>
  <v-container class="setting pl-1 pr-0">
    <v-row>
      <v-col cols="12" justify="center" align="center" class="mt-5">
        <h3 class="text-center mt-2">{{ $t("common.doctorInCharge") }}</h3>
        <patient-doctor :enablePopup="true" :enableSelect="false" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" justify="center" align="center">
        <h3 class="text-center mb-5">
          {{ $t("common.injectioninstruction") }}
        </h3>
        <div
          class="video-wrapper w-100 mb-5"
          v-for="url in videoUrls"
          :key="url"
        >
          <iframe
            width="560"
            height="315"
            :src="url"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" justify="center" align="center" class="mt-5">
        <h3 class="text-center mt-1 mb-5">{{ $t("common.medicineList") }}</h3>
        <!-- <div style="overflow: auto; height: 450px">
          <DrugList :enableSelect="false" />
        </div> -->
        <DrugList :enableSelect="false" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" justify="center" align="center" class="mt-5">
        <h3 class="text-center mt-1 mb-5">
          {{ $t("common.hospitalinformation") }}
        </h3>
        <v-form v-model="valid" @submit.prevent="uploadHospitalProfile">
          <text-editor
            v-model="hospitalprofile"
            class="mb-4"
            :placeholder="$t('common.hospitalinformation')"
            :editable="isAdmin"
          />
          <v-btn
            type="submit"
            block
            class="btn_login mt-4 mb-2 text-uppercase"
            style="margin-top: 15px"
            :loading="loading"
            :disabled="!valid"
            color="primary"
            v-if="isAdmin"
            >{{ $t("common.save") }}
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
  </v-container>
</template>

<script>
import PatientDoctor from "@/components/patient/PatientDoctor.vue";
import DrugList from "@/components/drug/DrugList.vue";
import TextEditor from "@/components/ckeditor/TextEditor.vue";

export default {
  components: { PatientDoctor, DrugList, TextEditor },
  data() {
    return {
      hospitalprofile: "",
      loading: false,
      valid: false,
      videoUrls: [
        "https://www.youtube.com/embed/d8BGDTfGlKE",
        "https://www.youtube.com/embed/ZbNtq609pIo",
        "https://www.youtube.com/embed/C9o-m4V14fU",
        "https://www.youtube.com/embed/Vu7r3yhvVFc",
      ],
    };
  },
  mounted() {
    // this.createVideoUrls();
    this.getVideoUrls();
    this.renderHospitalProfile();
  },
  methods: {
    async renderHospitalProfile() {
      this.hospitalprofile = (await this.$dbGet("hospitalprofile")) || "";
    },
    async uploadHospitalProfile() {
      this.loading = true;
      await this.$dbSet("hospitalprofile", this.hospitalprofile);
      await this.sleep(200);
      this.loading = false;
      this.showSuccess(this.$t("common.successMessage"));
    },
    async createVideoUrls() {
      await this.$dbSet("videos", this.videoUrls);
    },
    async getVideoUrls() {
      this.videoUrls = (await this.$dbGet("videos")) || [];
    },
  },
};
</script>

<style>
.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
