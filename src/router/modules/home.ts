const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "main",
  component: Layout,
  redirect: "/main",
  meta: {
    icon: "homeFilled",
    title: "首页",
    rank: 0
  },
  children: []
} as RouteConfigsTable;
