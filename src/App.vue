<template>
  <div id="app-quickstart">
    <el-tabs v-model="activeName" type="border-card" v-loading="loading">
      <el-dropdown trigger="click" @command="setProject" placement="bottom-start">
        <span class="el-dropdown-link">
          {{ project.name }}&nbsp;
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="proj in projects"
            :key="proj.tenantId"
            :command="proj"
          >{{ proj.name }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-badge :value="project.tenantId" type="info"></el-badge>

      <p>
        Paste this script inside your HTML
        <span class="code">&lt;head&gt;</span> & above any other scripts.
      </p>
      <code-block :content="scriptHtml()" language="html"></code-block>

      <br />

      <el-dropdown trigger="click" @command="setMod" placement="bottom-start" v-show="mod.eid">
        <span class="el-dropdown-link">
          {{ mod.displayTitle }}&nbsp;
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="mod in orderedMods"
            :key="mod.eid"
            :command="mod.eid"
          >{{ mod.displayTitle }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-badge :value="mod.eid" type="info"></el-badge>

      <!-- HTML -->
      <el-tab-pane label="HTML" name="html">
        <div v-show="mod.eid">
          <p>
            Paste this div inside your HTML
            <span class="code">&lt;body&gt;</span>
            wherever you want the
            {{ mod.displayTitle }} to show:
          </p>
          <code-block
            :content="modHtml(mod)"
            language="html"
            example="https://codepen.io/userfront/pen/MWyjXXq"
          ></code-block>
        </div>
      </el-tab-pane>
      <!-- /HTML -->

      <!-- React -->
      <el-tab-pane label="React" name="react">
        <div v-show="mod.eid">
          <p>
            Add the
            <span class="code">div</span> in your render code, and call
            <span class="code">Userfront.render()</span>.
          </p>
          <code-block
            :content="modReact(mod)"
            language="javascript"
            example="https://codesandbox.io/s/userfront-react-example-rhbyl"
          ></code-block>
        </div>
      </el-tab-pane>
      <!-- /React -->

      <!-- Vue -->
      <el-tab-pane label="Vue" name="vue">
        <div v-show="mod.eid">
          <p>
            Add the
            <span class="code">div</span> inside your Vue app:
          </p>
          <code-block
            :content="modVueHtml(mod)"
            language="html"
            example="https://codesandbox.io/s/userfront-vue-example-hxuuw"
          ></code-block>

          <p>
            Call
            <span class="code">Userfront.render()</span> once your component has
            mounted:
          </p>
          <code-block
            :content="modVueJs()"
            language="javascript"
            example="https://codesandbox.io/s/userfront-vue-example-hxuuw"
          ></code-block>
        </div>
      </el-tab-pane>
      <!-- /Vue -->

      <!-- Angular -->
      <el-tab-pane label="Angular" name="angular">
        <div v-show="mod.eid">
          <p>
            Make
            <span class="code">Userfront</span> available in your
            <span class="code">.ts</span> file:
          </p>
          <code-block
            :content="'declare var Userfront: any;'"
            example="https://codesandbox.io/s/userfront-angular-example-wrwn9?file=/src/app/app.component.ts"
            language="javascript"
          ></code-block>
          <p>
            Call
            <span class="code">Userfront.render()</span> in your component:
          </p>

          <code-block
            :content="modAngular(mod)"
            language="javascript"
            example="https://codesandbox.io/s/userfront-angular-example-wrwn9?file=/src/app/app.component.ts"
          ></code-block>
        </div>
      </el-tab-pane>
      <!-- /Angular -->

      <div v-if="mod.previewImageManual">
        Result:
        <div style="width:100%;text-align:center;">
          <img
            :src="mod.previewImageManual"
            :alt="mod.displayTitle"
            style="max-width:100%;height:auto;margin:20px 0 0;"
          />
        </div>
      </div>
    </el-tabs>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import CodeBlock from "./components/code-block.vue";

const isProduction = process.env.NODE_ENV === "production";
const baseDomain = isProduction ? "api.userfront.com" : "localhost:5001";
const apiUrl = `http${isProduction ? "s" : ""}://${baseDomain}/v0/`;
const cookieName = "access.q68b5qb9";

const demoProject = {
  tenantId: "demo1234",
  name: "Demo project"
};

export default {
  name: "App",
  components: { CodeBlock },
  data() {
    return {
      modData: this.$mod.data || {},
      loading: false,
      activeName: "html",
      html: "",
      project: demoProject,
      mods: [],
      mod: {}
    };
  },
  computed: {
    accessJwt() {
      return Cookies.get(cookieName);
    },
    decodedAccessToken() {
      if (!this.accessJwt) return;
      return jwt_decode(this.accessJwt);
    },
    projects() {
      if (!this.decodedAccessToken) return [demoProject];
      const projects = [];
      this.decodedAccessToken.authorization.map(project => {
        if (project.tenantId) {
          projects.push({
            tenantId: project.tenantId,
            name: project.name
          });
        }
      });
      if (projects.length === 0) return [demoProject];
      return projects;
    },
    orderedMods() {
      const order = [/signup/i, /login/i, /reset/i, /logout/i];
      function matchOrder(str) {
        if (!str) return;
        for (let i = 0; i < order.length; i++) {
          if (str.match(order[i])) return i;
        }
        return 100;
      }
      const ordered = JSON.parse(JSON.stringify(this.mods));
      ordered.sort((a, b) => {
        const matchA = matchOrder(a.displayTitle);
        const matchB = matchOrder(b.displayTitle);
        return matchA - matchB;
      });
      return ordered;
    }
  },
  watch: {
    project(newProject, oldProject) {
      if (
        !newProject ||
        !newProject.tenantId ||
        newProject.tenantId === (oldProject && oldProject.tenantId)
      )
        return;
      this.getMods(newProject.tenantId);
    }
  },
  methods: {
    async getMods(projectEid) {
      if (!projectEid) return;
      this.loading = true;
      try {
        const token = projectEid.includes("demo")
          ? "demo"
          : this.accessJwt || "demo";
        const { data } = await axios.get(
          `${apiUrl}mods?project=${projectEid}`,
          {
            headers: {
              authorization: `Bearer ${token}`
            }
          }
        );
        this.mods = data.results;
        this.mod = {};
        if (this.mods.length > 0) {
          this.setMod(this.orderedMods[0].eid);
        }
        this.loading = false;
      } catch (err) {
        this.loading = false;
      }
    },
    setProject(project) {
      if (!project || !project.tenantId) return;
      this.project = project;
      // setTimeout(this.highlightCode, 0);
    },
    setMod(eid) {
      if (!eid) return;
      this.mods.map(mod => {
        if (mod.eid === eid) {
          this.mod = mod;
          // setTimeout(this.highlightCode, 0);
        }
      });
    },
    scriptHtml() {
      if (!this.project || !this.project.tenantId) return;
      const scr = `&lt;script id="Userfront-script"&gt;
  (function(m,o,d,u,l,a,r,i,z,e) {
    u[m]={rq:[],ready:function(j){u[m].rq.push(j);},m:m,o:o,d:d,r:r};function j(s){return encodeURIComponent(btoa(s));}z=l.getElementById(m+"-"+a);r=u.location;
    e=[d+"/page/"+o+"/"+j(r.pathname)+"/"+j(r.host)+"?t="+Date.now(),d];e.map(function(w){i=l.createElement(a);i.defer=1;i.src=w;z.parentNode.insertBefore(i,z);});u.amvartem=m;
  })("Userfront", "${this.project.tenantId}", "https://mod.userfront.com/v2",window,document,"script");
&lt;/script&gt;`;
      return scr;
    },
    modHtml({ eid, displayTitle }) {
      let tag = `&lt;div id="userfront-${eid}"&gt;&lt;/div&gt;`;
      if (displayTitle) tag = `&lt;!-- ${displayTitle} --&gt;\n${tag}`;
      return tag;
    },
    modReact({ eid, displayTitle }) {
      return `class Demo extends React.Component {
  componentDidMount () {
    Userfront.render()
  }
  render () {
    // ${displayTitle}
    return &lt;div id="userfront-${eid}"&gt;&lt;/div&gt;
  }
}`;
    },
    modVueHtml({ eid, displayTitle }) {
      return `&lt;div id="app"&gt;

  &lt;!-- ${displayTitle} --&gt;
  &lt;div id="userfront-${eid}"&gt;&lt;/div&gt;

&lt;/div&gt;`;
    },
    modVueJs() {
      return `new Vue({
  el: '#app',
  mounted: function () {
    Userfront.render()
  }
})`;
    },
    modAngular({ eid }) {
      return `@Component({
  ...
  template: \`&lt;div id="userfront-${eid}"&gt;&lt;/div&gt;\`,
})
class UserfrontDemo {
  ...
  ngOnInit() {
    Userfront.render()
  }
}`;
    },
    // Add the mod key to the menu since it's outside of the mod,
    // so that the mod styling will apply to the menu too.
    addModStyling(isOpening) {
      try {
        if (!isOpening) return;
        document.querySelectorAll(".el-dropdown-menu.el-popper").forEach(el => {
          el.setAttribute(this.$mod.key, "");
        });
      } catch (err) {
        return;
      }
    }
  },
  async mounted() {
    this.setProject(this.projects[0]);
    this.getMods(this.project.tenantId);

    // Hack to add styles outside of mod
    const styleTag = document.createElement("style");
    styleTag.type = "text/css";
    styleTag.innerHTML = `
.el-dropdown-menu.el-popper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  padding: 10px 0;
  margin: 5px 0;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: 170px;
  overflow: hidden;
}
.el-dropdown-menu__item {
  font-size: 14px;
  padding: 0 20px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  height: 34px;
  line-height: 34px;
  box-sizing: border-box;
  cursor: pointer;
}
el-dropdown-menu__list {
  padding: 0;
}`;
    document.head.appendChild(styleTag);
  }
};
</script>

<style lang="scss" scoped>
#app-quickstart {
  position: relative;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 580px;
  /deep/ h2 {
    font-size: 1.5em;
  }
  .el-tabs {
    min-height: 600px;
  }
  .code {
    background: #f8f8f8;
    display: inline-block;
    padding: 1px 3px;
    margin: 0 2px;
  }
  .color-purple {
    color: #5e72e4;
  }
  .el-dropdown-link {
    font-size: 18px;
    font-weight: bold;
    color: #5e72e4;
    margin-right: 12px;
    cursor: pointer;
  }
  /deep/ .el-badge__content {
    font-family: monospace;
    font-size: 13px;
  }
}
</style>
