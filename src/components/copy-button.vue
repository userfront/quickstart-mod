<template>
  <el-button type="primary" size="mini" @click="copyToClipboard" plain>Copy</el-button>
</template>

<script>
export default {
  props: ["content"],
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
        return true;
      } catch (err) {
        return false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
button {
  position: absolute;
  top: 3px;
  right: 3px;
}
</style>