import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import NotFound from "../views/NotFound";
import Section from "../views/Section";
import Topic from "../views/Topic";
import AddTopic from "../views/AddTopic";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "*",
    component: NotFound
  },
  {
    path: "/section/:sectionId",
    component: Section
  },
  {
    path: "/topic/:topicId",
    component: Topic
  },
  {
    path: "/addTopic",
    name: "addTopic",
    component: AddTopic
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
