<template>
  <div id="app-quickstart">
    <el-tabs
      v-model="activeName"
      @tab-click="tabChange"
      type="border-card"
      v-loading="loading"
    >
      <el-dropdown trigger="click" @visible-change="addModStyling">
        <el-button size="small">
          {{ projectEid }}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>Action 1</el-dropdown-item>
          <el-dropdown-item>Action 2</el-dropdown-item>
        </el-dropdown-menu> </el-dropdown
      >&nbsp;
      <small>
        <i class="el-icon-arrow-right"></i>
      </small>
      &nbsp;
      <el-dropdown trigger="click" @visible-change="addModStyling">
        <el-button size="small">
          Signup form
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>Action 1</el-dropdown-item>
          <el-dropdown-item>Action 2</el-dropdown-item>
          <el-dropdown-item>Action 3</el-dropdown-item>
          <el-dropdown-item>Action 4</el-dropdown-item>
          <el-dropdown-item>Action 5</el-dropdown-item>
        </el-dropdown-menu> </el-dropdown
      >&nbsp;
      <!-- HTML -->
      <el-tab-pane label="HTML" name="html">
        <p>Paste inside HTML <span class="code">&lt;head&gt;</span>:</p>
        <pre><code class="language-html" v-html="scriptHtml(projectEid)"></code></pre>
        <br />
        <p>Paste inside HTML <span class="code">&lt;body&gt;</span>:</p>
        <pre><code class="language-html" v-html="modHtml(mod)"></code></pre>
      </el-tab-pane>
      <!-- /HTML -->

      <!-- React -->
      <el-tab-pane label="React" name="react">
        <p>Paste inside HTML <span class="code">&lt;head&gt;</span>:</p>
        <pre><code class="language-html" v-html="scriptHtml(projectEid)"></code></pre>
        <br />
        <p>
          Add <span class="code">div</span> and
          <span class="code">Userfront.render()</span>:
        </p>
        <pre><code class="language-javascript" v-html="modReact(mod)"></code></pre>
      </el-tab-pane>
      <!-- /React -->

      <!-- Vue -->
      <el-tab-pane label="Vue" name="vue">
        <p>Paste inside HTML <span class="code">&lt;head&gt;</span>:</p>
        <pre><code class="language-html" v-html="scriptHtml(projectEid)"></code></pre>
        <br />
        <p>Add the div inside your app HTML:</p>
        <pre><code class="language-html" v-html="modVueHtml(mod)"></code></pre>
        <p>Call <span class="code">Userfront.render()</span> in JS:</p>
        <pre><code class="language-javascript" v-html="modVueJs()"></code></pre>
      </el-tab-pane>
      <!-- /Vue -->

      <!-- Angular -->
      <el-tab-pane label="Angular" name="angular">
        <p>Paste inside HTML <span class="code">&lt;head&gt;</span>:</p>
        <pre><code class="language-html" v-html="scriptHtml(projectEid)"></code></pre>
        <br />
        <p>
          Make <span class="code">Userfront</span> available in your
          <span class="code">.ts</span> file:
        </p>
        <pre><code class="language-javascript">declare var Userfront: any;</code></pre>
        <br />
        <p>
          Call <span class="code">Userfront.render()</span> in your component:
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
import hljs from "highlight.js/lib/core";
import hljsHtml from "highlight.js/lib/languages/xml";
import hljsJs from "highlight.js/lib/languages/javascript";
import hljsCss from "highlight.js/lib/languages/css";
hljs.registerLanguage("html", hljsHtml);
hljs.registerLanguage("javascript", hljsJs);
hljs.registerLanguage("css", hljsCss);
import "highlight.js/styles/github.css";

const apiUrl = "https://api.userfront.com/v0/";
const projectEid = "";

export default {
  name: "App",
  data() {
    return {
      cookieName: `auth.${projectEid}`,
      modData: this.$mod.data || {},
      loading: false,
      activeName: "html",
      html: "",
      self: {},
      projectEid: "demo1234",
      mod: {
        eid: "abcdefgh",
        title: "Signup mod",
      },
    };
  },
  methods: {
    scriptHtml(eid) {
      const scr = `&lt;script id="Userfront-script"&gt;
  (function(m,o,d,u,l,a,r,i,z,e) {
    u[m]={rq:[],ready:function(j){u[m].rq.push(j);},m:m,o:o,d:d,r:r};function j(s){return encodeURIComponent(btoa(s));}z=l.getElementById(m+"-"+a);r=u.location;
    e=[d+"/page/"+o+"/"+j(r.pathname)+"/"+j(r.host)+"?t="+Date.now(),d];e.map(function(w){i=l.createElement(a);i.defer=1;i.src=w;z.parentNode.insertBefore(i,z);});u.amvartem=m;
  })("Userfront", "${eid}", "https://mod.userfront.com/v2",window,document,"script");
&lt;/script&gt;`;
      return scr;
    },
    modHtml({ eid, title }) {
      let tag = `&lt;div id="userfront-${eid}"&gt;&lt;/div&gt;`;
      if (title) tag = `&lt;!-- ${title} --&gt;\n${tag}`;
      return tag;
    },
    modReact({ eid, title }) {
      return `class Demo extends React.Component {
  componentDidMount () {
    Userfront.render()
  }
  render () {
    // ${title}
    return &lt;div id="userfront-${eid}"&gt;&lt;/div&gt;
  }
}`;
    },
    modVueHtml({ eid, title }) {
      return `&lt;div id="app"&gt;

  // ${title}
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
    tabChange(tab) {
      console.log("tabChange", tab);
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
    // Add the mod key to the menu since it's outside of the mod,
    // so that the mod styling will apply to the menu too.
    addModStyling(isOpening) {
      try {
        if (!isOpening) return;
        document
          .querySelectorAll(".el-dropdown-menu.el-popper")
          .forEach((el) => {
            el.setAttribute(this.$mod.key, "");
          });
      } catch (err) {
        return;
      }
    },
  },
  mounted() {
    document
      .querySelectorAll("#app-quickstart pre > code")
      .forEach(hljs.highlightBlock);

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
}`;
    document.head.appendChild(styleTag);
  },
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
