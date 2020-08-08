import Vue from "vue";
import App from "./App.vue";
import { modId, ModData } from "../anymod/anymod.config.js";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Loading,
  TabPane,
  Tabs,
} from "element-ui";
import "./styles/element-variables.scss";

Vue.config.productionTip = false;

Vue.use(Badge);
Vue.use(Button);
Vue.use(Card);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Loading);
Vue.use(TabPane);
Vue.use(Tabs);

Vue.use(ModData);

new Vue({
  render: (h) => h(App),
}).$mount(`#${modId}`);
