import Vue from "vue";
import App from "./App.vue";
import { modId, ModData } from "../anymod/anymod.config.js";
import {
  Button,
  Card,
  Loading,
  Option,
  Select,
  TabPane,
  Tabs,
} from "element-ui";
import "./styles/element-variables.scss";

Vue.config.productionTip = false;

Vue.use(Button);
Vue.use(Card);
Vue.use(Loading);
Vue.use(Option);
Vue.use(Select);
Vue.use(TabPane);
Vue.use(Tabs);

Vue.use(ModData);

new Vue({
  render: (h) => h(App),
}).$mount(`#${modId}`);
