<template>
  <backdrop-blur>
    <v-row class="tab_navigation_drawer" justify="center" align="center">
      <v-col style="max-width: 664px">
        <v-container>
          <v-row>
            <h2 class="w-100 text-center text-uppercase mt-5">
              {{ $t("common.termCondition") }}
            </h2>
            <h3 class="w-100 ml-3 mt-1 text-center">
              Tôi tên là: {{ fullName }}
            </h3>
            <h3 class="w-100 ml-3 mt-1 text-center">
              Ngày sinh: {{ birthDate }}
            </h3>
            <v-col cols="12" justify="center" align="center" class="pl-3 pr-3">
              <text-editor
                v-model="termCondition"
                class="mb-4"
                :placeholder="$t('common.description')"
                :editable="false"
              />
              <v-btn
                type="submit"
                block
                class="mb-5 text-uppercase"
                :loading="loading"
                style="margin-top: 15px"
                dark
                @click="editable ? createUser() : confirm()"
                large
                rounded
              >
                <v-icon class="mr-3" small>mdi-check</v-icon>
                {{ $t("common.confirmed") }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </backdrop-blur>
</template>

<script>
import TextEditor from "@/components/ckeditor/TextEditor.vue";
import BackdropBlur from "@/components/BackdropBlur.vue";
import { mapGetters } from "vuex";

export default {
  props: {
    editable: {
      type: Boolean,
      default: function () {
        return true;
      },
    },
  },
  computed: {
    fullName() {
      return this.$store.state.Authen.user.fullName;
    },
    birthDate() {
      return this.$store.state.Authen.user.birthDate;
    },
    ...mapGetters("Authen", ["doctorInCharge"]),
  },
  components: {
    TextEditor,
    BackdropBlur,
  },
  data() {
    return {
      loading: false,
      termCondition: "",
    };
  },
  mounted() {
    this.render();
  },
  methods: {
    async render() {
      this.loading = true;
      this.termCondition = await this.$dbGet(`terms`);
      this.loading = false;
    },
    /*     async update() {
      this.loading = true;
      await this.$dbSet(`terms`, this.termCondition);
      this.loading = false;
      this.showSuccess(this.$t("common.successMessage"));
    }, */
    async confirm() {
      this.$emit("confirmed", true);
    },
    async createUser() {
      this.loading = true;
      // await this.$dbSet(`terms`, this.termCondition);
      try {
        var user = this.$store.getters["Authen/getUser"];
        var id = user.id;
        // var userObj = await this.$dbGet(`users/${id}`);
        var userObj = await this.getUserLite(id);
        if (userObj) {
          user = { ...userObj, ...user };
          // await this.$dbUpdate(`users/${id}`, user);
          await this.$dbSet(`users/${id}/fullName`, user.fullName);
          await this.$dbSet(`users/${id}/gender`, user.gender);
          await this.$dbSet(`users/${id}/birthDate`, user.birthDate);
          await this.$dbSet(`users/${id}/profileID`, user.profileID);
          await this.$dbSet(`users/${id}/avatar`, user.avatar);
          this.$store.commit("Authen/SET_USER", user);
        } else {
          await this.$dbSet(`users/${id}`, user);
        }
        await this.ensurePatientProfileExist();
        await this.addDoctorInChargeToPatientProfile(this.doctorInCharge);
      } catch (err) {
        alert(err.message);
      }
      await this.sleep(100);
      await this.registerNotificationToken();
      this.loading = false;
      this.showSuccess(this.$t("common.successMessage"));
      this.$router.push("home");
    },
  },
};
</script>

<style lang="scss">
@import "./primaryLayout.scss";
</style>
