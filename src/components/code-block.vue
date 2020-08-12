<template>
  <div>
    <pre><code :class="`language-${language}`" v-html="content" ref="code"></code><div class="button-corner"><a v-if="example" :href="example" class="example-link" target="_blank">See example</a><el-button
  type="primary"
  size="mini"
  @click="copyToClipboard"
  :icon="showCheck ? 'el-icon-check' : ''"
  plain
  ref="button"
>Copy</el-button>
</div></pre>
  </div>
</template>

<script>
import hljs from "highlight.js/lib/core";
import hljsHtml from "highlight.js/lib/languages/xml";
import hljsJs from "highlight.js/lib/languages/javascript";
import hljsCss from "highlight.js/lib/languages/css";
hljs.registerLanguage("html", hljsHtml);
hljs.registerLanguage("javascript", hljsJs);
hljs.registerLanguage("css", hljsCss);
import "highlight.js/styles/github.css";

export default {
  props: ["content", "language", "example"],
  data() {
    return {
      showCheck: false
    };
  },
  methods: {
    copyToClipboard() {
      try {
        const toCopy = "" + this.content;
        navigator.clipboard.writeText(
          toCopy
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
        );
        this.flashCheck();
        return true;
      } catch (err) {
        return false;
      }
    },
    flashCheck() {
      this.showCheck = true;
      setTimeout(() => {
        this.showCheck = false;
        this.$refs.button.$el.blur();
      }, 3000);
    }
  },
  watch: {
    content() {
      setTimeout(() => hljs.highlightBlock(this.$refs.code));
    }
  },
  mounted() {
    hljs.highlightBlock(this.$refs.code);
  }
};
</script>

<style lang="scss" scoped>
pre {
  position: relative;
}
pre > code {
  font-size: 14px;
  min-height: 22px;
}
.button-corner {
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
}
.example-link {
  padding: 4px 12px;
  margin-right: 5px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #5e72e4;
  font-size: 14px;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
</style>