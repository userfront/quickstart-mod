<template>
  <div>
    <el-card v-loading="loading">
      <h2 v-if="formTitles[formType]">{{ formTitles[formType] }}</h2>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100%"
        @submit.native.prevent="submitForm"
        v-if="formType !== 'sent'"
      >
        <el-form-item prop="emailOrUsername" v-if="formType === 'login'">
          <el-input
            v-model="form.emailOrUsername"
            placeholder="Email or username"
            suffix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password" v-if="formType === 'login'">
          <el-input
            type="password"
            v-model="form.password"
            placeholder="Password"
            suffix-icon="el-icon-lock"
            show-password
            @keyup.enter.native="submitForm"
          ></el-input>
          <p class="uf-muted" style="margin:6px 0 0;line-height:1.3">
            At least 16 characters OR at least 8 characters including a number
            and a letter.
          </p>
        </el-form-item>
        <el-form-item prop="email" v-if="formType !== 'login'">
          <el-input
            v-model="form.email"
            placeholder="Email address"
            suffix-icon="el-icon-message"
          ></el-input>
        </el-form-item>
        <el-alert
          v-if="alertDescription"
          title="Problem logging in"
          type="error alert"
        >
          {{ alertDescription }}
        </el-alert>
        <el-alert
          v-if="alertDescription && isDev"
          type="info alert"
          style="margin-top: 6px"
        >
          Use
          <a href="https://userfront.com/guide/dev-mode" target="_blank"
            >these users</a
          >
          when in dev mode
        </el-alert>
        <el-form-item style="margin: 12px 0;">
          <el-button
            type="primary"
            @click="submitForm"
            :loading="loading"
            class="w-100"
            >{{ formTitles[formType] }}</el-button
          >
        </el-form-item>
        <div class="uf-links">
          <a
            href="#"
            @click.prevent="formType = 'login'"
            v-if="formType !== 'login'"
            >Log in</a
          >
          <a
            href="#"
            @click.prevent="formType = 'link'"
            v-if="formType !== 'link'"
            >Get login link</a
          >
          <a
            href="#"
            @click.prevent="formType = 'reset'"
            v-if="formType !== 'reset'"
            >Reset password</a
          >
        </div>
      </el-form>
      <div
        v-if="formType === 'sent'"
        style="margin-bottom:32px;text-align:left;"
      >
        <el-alert type="success alert" :title="sentTitle" :closable="false">
          <slot v-if="!isDev">{{ sentDescription }}</slot>
          <slot v-if="isDev">
            <p>
              <a :href="sentDescription">{{ sentDescription }}</a>
            </p>
          </slot>
        </el-alert>
      </div>
      <div class="uf-branding uf-muted">
        <img v-if="!isDev" src="../assets/shield.png" style="opacity:0.5" />
        <a v-if="!isDev" href="https://userfront.com" target="_blank"
          >Secured by Userfront</a
        >
        <img v-if="isDev" src="../assets/info.png" alt="" />
        <a
          v-if="isDev"
          href="https://userfront.com/guide/dev-mode"
          target="_blank"
          >Dev mode</a
        >
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";

const privateIPRegex = /((^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.))\d{1,3}\.\d{1,3}/g;
const isDevHostname = (hostname) =>
  hostname.match(/localhost/g) ||
  hostname.match(/file/g) ||
  hostname.match(privateIPRegex);

const apiUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.userfront.com/v0/"
    : "http://localhost:5001/v0/";

export default {
  name: "Login",
  data() {
    return {
      cookieName: `auth.${this.$mod.external.project}`,
      modData: this.$mod.data || {},
      loading: false,
      alertDescription: "",
      sentDescription: "",
      formType: "login", // [login, link, reset, sent]
      formTitles: {
        login: "Log in",
        link: "Get login link",
        reset: "Reset password",
        sent: "We sent you a link",
      },
      form: {
        emailOrUsername: "",
        password: "",
        email: "",
      },
      self: {},
      isDev: isDevHostname(window.location.hostname),
    };
  },
  computed: {
    redirectUrl() {
      return this.getQueryAttr("redirect");
    },
    token() {
      return this.getQueryAttr("token");
    },
    uuid() {
      return this.getQueryAttr("uuid");
    },
    rules() {
      return {
        emailOrUsername: [
          {
            required: this.formType === "login",
            message: `Please enter your email or username`,
            trigger: "blur",
          },
        ],
        password: [
          {
            required: this.formType === "login",
            message: "Please enter your password",
            trigger: "blur",
          },
        ],
        email: [
          {
            required: this.formType !== "login",
            message: "Please enter your email",
            trigger: "blur",
          },
        ],
      };
    },
    sentTitle() {
      return this.isDev ? "Dev mode link" : "Check your email";
    },
  },
  methods: {
    getQueryAttr(attrName) {
      if (
        !window.location.href ||
        window.location.href.indexOf(`${attrName}=`) < 0
      )
        return;
      return decodeURIComponent(
        window.location.href.split(`${attrName}=`)[1].split("&")[0]
      );
    },
    submitForm() {
      if (this.formType === "login") this.login();
      if (this.formType === "link") this.sendLink();
      if (this.formType === "reset") this.sendLink();
    },
    login() {
      this.alertDescription = "";
      this.$refs.form.validate(async (valid) => {
        if (!valid) return false;

        try {
          this.loading = true;
          const { data } = await axios.post(`${apiUrl}auth/basic`, {
            project: this.$mod.external.project,
            emailOrUsername: this.form.emailOrUsername,
            password: this.form.password,
          });
          this.loading = false;

          if (data.token) {
            Cookies.set(this.cookieName, data.token);
            this.redirectToPath(this.redirectUrl || data.redirectTo || "/");
          } else {
            this.notifyError({ message: "Please try again." });
          }

          this.resetForm();
        } catch (err) {
          this.loading = false;
          this.notifyError(err);
        }
      });
    },
    async sendLink() {
      this.loading = true;
      this.alertDescription = "";

      try {
        const uri =
          this.formType === "link"
            ? `${apiUrl}auth/link`
            : `${apiUrl}auth/reset/link`;
        const { data } = await axios.post(uri, {
          email: this.form.email,
          project: this.$mod.external.project,
        });

        if (data && data.Message === "OK") {
          this.sentDescription =
            this.formType === "link"
              ? "We sent you a link to log in"
              : "We sent you a link to set your password";
          this.formType = "sent";
          if (data.link) this.sentDescription = data.link;
        } else {
          this.notifyError({ message: "Problem sending link" });
        }
        this.loading = false;
      } catch (err) {
        this.loading = false;
        this.notifyError(err);
      }
    },
    async loginWithTokenAndUuid(token, uuid) {
      this.loading = true;
      this.alertDescription = "";

      try {
        const { data } = await axios.put(`${apiUrl}auth/link`, {
          token,
          uuid,
          project: this.$mod.external.project,
        });

        if (data.token) {
          Cookies.set(this.cookieName, data.token);
          this.redirectToPath(this.redirectUrl || data.redirectTo || "/");
        } else {
          this.notifyError("Problem logging in");
        }

        this.loading = false;
      } catch (err) {
        this.loading = false;
        this.notifyError(err);
      }
    },
    async loginWithCookie() {
      const authToken = Cookies.get(this.cookieName);
      if (!authToken) return;
      await this.defineSelf(authToken);
    },
    async defineSelf(authToken) {
      this.loading = true;
      try {
        const { data } = await axios.get(`${apiUrl}users/self`, {
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        });
        this.self = data;
        this.loading = false;
      } catch (err) {
        this.loading = false;
        Cookies.remove(this.cookieName);
      }
    },

    notifyError(err) {
      let message = "";
      if (err && err.message) message = err.message;
      if (err && err.response && err.response.data) {
        message = err.response.data.message;
      }
      this.alertDescription = message;
    },
    resetForm() {
      this.$refs.form.resetFields();
    },
    async setMode() {
      try {
        const { data } = await axios.get(
          `${apiUrl}projects/${this.$mod.external.project}/mode`
        );
        this.isDev = data.mode === "dev";
      } catch (err) {
        this.isDev = true;
      }
    },
    /**
     * Redirect to path portion of the URL. Don't redirect to another host,
     * since the cookie would not be valid in that case.
     */
    redirectToPath(pathOrUrl) {
      if (!pathOrUrl) return;
      const el = document.createElement("a");
      el.href = pathOrUrl;
      let path = `${el.pathname}${el.hash}${el.search}`;
      if (el.pathname !== window.location.pathname) {
        window.location.href = path;
      }
      this.loading = false;
    },
  },
  watch: {
    self(newVal) {
      if (newVal && newVal.project && newVal.project.liveLoginRedirectUrl) {
        this.loading = true;
        this.redirectToPath(newVal.project.liveLoginRedirectUrl);
      } else {
        this.loading = false;
      }
    },
  },
  created() {
    this.setMode();
  },
  async mounted() {
    if (this.token && this.uuid) {
      await this.loginWithTokenAndUuid(this.token, this.uuid);
    } else {
      this.loginWithCookie();
    }
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/element-variables.scss";

.el-card {
  max-width: 340px;
  margin: 0 auto;
}
/deep/ .el-form-item {
  &__label {
    display: block;
    float: none;
    text-align: left;
  }
  &__content {
    margin-left: 0 !important;
  }
  input::placeholder {
    color: #999;
  }
}
.el-form {
  text-align: left;
}
/deep/ .el-alert__description {
  font-size: 14px !important;
}
.w-100 {
  width: 100%;
}
.uf-muted {
  color: #777;
  font-size: 12px;
}
.uf-links {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-bottom: 26px;
  a {
    font-size: 13px;
    margin: 0 12px;
    color: $--color-primary;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
.uf-branding {
  color: #777;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  img {
    vertical-align: middle;
    margin-right: 6px;
  }
  a {
    color: #777;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
