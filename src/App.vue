<template>
  <div id="app-quickstart">
    <el-card v-loading="loading">Hello</el-card>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";

const apiUrl = "https://api.userfront.com/v0";
const projectEid = "";

export default {
  name: "App",
  data() {
    return {
      cookieName: `auth.${projectEid}`,
      modData: this.$mod.data || {},
      loading: false,
      self: {}
    };
  },
  computed: {},
  methods: {
    async defineSelf(authToken) {
      this.loading = true;
      try {
        const { data } = await axios.get(`${apiUrl}users/self`, {
          headers: {
            authorization: `Bearer ${authToken}`
          }
        });
        this.self = data;
        this.loading = false;
      } catch (err) {
        this.loading = false;
        Cookies.remove(this.cookieName);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
#app-vue {
  position: relative;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /deep/ h2 {
    font-size: 1.5em;
  }
}
</style>
