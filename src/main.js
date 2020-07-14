import Vue from "vue";
import App from "./App.vue";
import { modId, ModData } from "../anymod/anymod.config.js";
import {
  Alert,
  Button,
  Card,
  Form,
  FormItem,
  Input,
  Loading,
} from "element-ui";
import "./styles/element-variables.scss";

Vue.config.productionTip = false;

Vue.use(Alert);
Vue.use(Button);
Vue.use(Card);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Loading);

Vue.use(ModData);

new Vue({
  render: (h) => h(App),
}).$mount(`#${modId}`);
