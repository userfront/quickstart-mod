// Change this to match mod id
const modId = "baboon";
const projectId = "q68b5qb9";

const defaultModData = {};

const modHtml = `<div id="${modId}"></div>`;

const ModData = {
  install(Vue) {
    let modObj;
    if (process.env.NODE_ENV !== "production") {
      modObj = {
        external: { project: projectId },
        data: defaultModData,
      };
    } else {
      /*global mod*/
      modObj = mod;
    }
    Vue.prototype.$mod = modObj;
  },
};

module.exports = {
  modId,
  projectId,
  modHtml,
  ModData,
};
