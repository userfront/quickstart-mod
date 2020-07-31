<template>
  <div id="app-quickstart">
    <el-tabs v-model="activeName" type="border-card" v-loading="loading">
      <el-select
        style="max-width:170px;"
        v-model="selects.projectEid"
        placeholder="Project"
        v-if="projects && projects.length > 0"
        @visible-change="addModStyling"
      >
        <el-option
          v-for="proj in projects"
          :key="proj.tenantId"
          :value="proj.tenantId"
          :label="proj.name"
        ></el-option>
      </el-select>&nbsp;
      <small>
        <i class="el-icon-arrow-right"></i>
      </small>
      &nbsp;
      <el-select
        style="max-width:170px;"
        v-model="selects.modEid"
        placeholder="Toolkit"
        v-if="mods && mods.length > 0"
        @visible-change="addModStyling"
      >
        <el-option v-for="mod in mods" :key="mod.eid" :value="mod.eid" :label="mod.displayTitle"></el-option>
      </el-select>&nbsp;
      <br />

      <!-- HTML -->
      <el-tab-pane label="HTML" name="html">
        <p>
          Paste inside HTML
          <span class="code">&lt;head&gt;</span>:
        </p>
        <pre><code class="language-html" v-html="scriptHtml()"></code></pre>
        <br />
        <p>
          Paste inside HTML
          <span class="code">&lt;body&gt;</span>:
        </p>
        <pre><code class="language-html" v-html="modHtml(mod)"></code></pre>
      </el-tab-pane>
      <!-- /HTML -->

      <!-- React -->
      <el-tab-pane label="React" name="react">
        <p>
          Paste inside HTML
          <span class="code">&lt;head&gt;</span>:
        </p>
        <pre><code class="language-html" v-html="scriptHtml()"></code></pre>
        <br />
        <p>
          Add
          <span class="code">div</span> and
          <span class="code">Userfront.render()</span>:
        </p>
        <pre><code class="language-javascript" v-html="modReact(mod)"></code></pre>
      </el-tab-pane>
      <!-- /React -->

      <!-- Vue -->
      <el-tab-pane label="Vue" name="vue">
        <p>
          Paste inside HTML
          <span class="code">&lt;head&gt;</span>:
        </p>
        <pre><code class="language-html" v-html="scriptHtml()"></code></pre>
        <br />
        <p>Add the div inside your app HTML:</p>
        <pre><code class="language-html" v-html="modVueHtml(mod)"></code></pre>
        <p>
          Call
          <span class="code">Userfront.render()</span> in JS:
        </p>
        <pre><code class="language-javascript" v-html="modVueJs()"></code></pre>
      </el-tab-pane>
      <!-- /Vue -->

      <!-- Angular -->
      <el-tab-pane label="Angular" name="angular">
        <p>
          Paste inside HTML
          <span class="code">&lt;head&gt;</span>:
        </p>
        <pre><code class="language-html" v-html="scriptHtml()"></code></pre>
        <br />
        <p>
          Make
          <span class="code">Userfront</span> available in your
          <span class="code">.ts</span> file:
        </p>
        <pre><code class="language-javascript">declare var Userfront: any;</code></pre>
        <br />
        <p>
          Call
          <span class="code">Userfront.render()</span> in your component:
        </p>

        <pre><code class="language-javascript" v-html="modAngular(mod)"></code></pre>
      </el-tab-pane>
      <!-- /Angular -->
    </el-tabs>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";

import hljs from "highlight.js/lib/core";
import hljsHtml from "highlight.js/lib/languages/xml";
import hljsJs from "highlight.js/lib/languages/javascript";
import hljsCss from "highlight.js/lib/languages/css";
hljs.registerLanguage("html", hljsHtml);
hljs.registerLanguage("javascript", hljsJs);
hljs.registerLanguage("css", hljsCss);
import "highlight.js/styles/github.css";

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
  data() {
    return {
      modData: this.$mod.data || {},
      loading: false,
      activeName: "html",
      html: "",
      project: demoProject,
      mods: [],
      mod: {},
      selects: {
        projectEid: "",
        modEid: ""
      }
    };
  },
  computed: {
    accessJwt() {
      return Cookies.get(cookieName);
    },
    accessToken() {
      if (!this.accessJwt) return;
      return jwt_decode(this.accessJwt);
    },
    projects() {
      if (!this.accessToken) return [demoProject];
      const projects = [];
      this.accessToken.authorization.map(project => {
        if (project.tenantId) {
          projects.push({
            tenantId: project.tenantId,
            name: project.name
          });
        }
      });
      if (projects.length === 0) return [demoProject];
      return projects;
    }
  },
  watch: {
    "selects.projectEid": function(newEid, oldEid) {
      if (!newEid || newEid === oldEid) return;
      this.getMods(newEid);
    },
    "selects.modEid": function(newEid, oldEid) {
      if (!newEid || newEid === oldEid) return;
      this.setMod(newEid);
    }
  },
  methods: {
    async getMods(projectEid) {
      if (!projectEid) return;
      this.loading = true;
      try {
        const { data } = await axios.get(
          `${apiUrl}mods?project=${projectEid}`,
          {
            headers: {
              authorization: `Bearer ${this.accessJwt}`
            }
          }
        );
        this.mods = data.results;
        this.mod = {};
        if (this.mods.length > 0) {
          this.setMod(this.mods[0].eid);
        }
        this.loading = false;
      } catch (err) {
        this.loading = false;
      }
    },
    setProject(project) {
      if (!project || !project.tenantId) return;
      this.project = project;
      this.selects.projectEid = this.project.tenantId;
      setTimeout(this.highlightCode, 0);
    },
    setMod(eid) {
      if (!eid) return;
      this.mods.map(mod => {
        if (mod.eid === eid) {
          this.mod = mod;
          this.selects.modEid = this.mod.eid;
          setTimeout(this.highlightCode, 0);
        }
      });
    },
    highlightCode() {
      document
        .querySelectorAll("#app-quickstart pre > code")
        .forEach(hljs.highlightBlock);
    },
    scriptHtml() {
      if (!this.selects.projectEid) return;
      const scr = `&lt;script id="Userfront-script"&gt;
  (function(m,o,d,u,l,a,r,i,z,e) {
    u[m]={rq:[],ready:function(j){u[m].rq.push(j);},m:m,o:o,d:d,r:r};function j(s){return encodeURIComponent(btoa(s));}z=l.getElementById(m+"-"+a);r=u.location;
    e=[d+"/page/"+o+"/"+j(r.pathname)+"/"+j(r.host)+"?t="+Date.now(),d];e.map(function(w){i=l.createElement(a);i.defer=1;i.src=w;z.parentNode.insertBefore(i,z);});u.amvartem=m;
  })("Userfront", "${this.selects.projectEid}", "https://mod.userfront.com/v2",window,document,"script");
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
      return `
@Component({
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
.el-select-dropdown.el-popper {
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
  max-width: 420px;
  color: #2c3e50;
  /deep/ h2 {
    font-size: 1.5em;
  }
  .code {
    background: #f8f8f8;
    display: inline-block;
    padding: 1px 3px;
    margin: 0 2px;
  }
}
</style>
