import Vue from "vue";
import VueRouter from "vue-router";

if (!window.VueRouter) Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home")
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
    name: "NotFound",
    component: () => import("../views/NotFound")
  },
  {
    path: "/section/:sectionId",
    component: () => import("../views/Section")
  },
  {
    path: "/topic/:topicId",
    component: () => import("../views/Topic")
  },
  {
    path: "/addTopic",
    name: "addTopic",
    component: () => import("../views/AddTopic")
  },
  {
    path: "/user",
    component: () => import("../views/User")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
