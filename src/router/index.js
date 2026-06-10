import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "*",
    redirect: { name: "home" },
  },
  {
    path: "/",
    component: () => import("@/components/PrimaryLayout"),
    redirect: { name: "home" },
    meta: {},
    children: [
      {
        path: "/home",
        name: "home",
        meta: {
          title: "Home Page",
          requireAuth: true,
        },
        component: () => import("@/views/home/Home"),
      },
      {
        path: "/history",
        name: "history",
        meta: {
          title: "History Page",
          requireAuth: true,
        },
        component: () => import("@/views/History"),
      },
      {
        path: "/medicine",
        name: "medicine",
        meta: {
          title: "medicine Page",
          requireAuth: true,
        },
        component: () => import("@/components/medicine/MedicineDetail"),
      },
      {
        path: "/drug",
        name: "drug",
        meta: {
          title: "Drug Page",
          requireAuth: true,
        },
        component: () => import("@/views/Drug"),
      },
      {
        path: "/medicine/:id",
        name: "medicine_detail",
        meta: {
          title: "medicine Page",
          requireAuth: true,
        },
        component: () => import("@/views/Medicine"),
      },
      {
        path: "/setting",
        name: "setting",
        meta: {
          title: "Account Page",
          requireAuth: true,
        },
        component: () => import("@/views/Setting"),
      },
      {
        path: "/information",
        name: "information",
        meta: {
          title: "Information Page",
          requireAuth: true,
        },
        component: () => import("@/views/Information"),
      },
    ],
  },
  {
    path: "/term",
    name: "term",
    meta: {
      title: "Term Page",
      requireAuth: true,
    },
    component: () => import("@/components/TermCondition"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/auth"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

import store from "@/stores";
export const isAuthenticated = () => {
  return store.getters["Authen/isAuthenticated"];
};

// beforeEach for each route when run
router.beforeEach((to, from, next) => {
  // check meta data that requireAuth or not
  const requireAuth = to.matched.some(
    (childRoute) => childRoute.meta.requireAuth
  );
  // check Authenticate if having
  if (requireAuth && !isAuthenticated()) {
    next({ name: "login" });
  } else {
    if (to.name == "login" && isAuthenticated()) {
      next({ name: "home" });
    }
    next();
  }
});

// afterEach to do something when navigate success
router.afterEach((to) => {
  document.title = to.meta.title ?? "App";
});
export default router;
