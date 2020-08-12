<template>
  <div>
    <pre><code :class="`language-${language}`" v-html="content" ref="code"></code><el-button
  type="primary"
  size="mini"
  @click="copyToClipboard"
  :icon="showCheck ? 'el-icon-check' : ''"
  plain
  ref="button"
>Copy</el-button></pre>
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
  props: ["content", "language"],
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
}
button {
  position: absolute;
  top: 3px;
  right: 3px;
}
</style>