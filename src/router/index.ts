import NProgress from "@/utils/progress";
import { Router, createRouter } from "vue-router";
import { getHistoryMode } from "./utils";

import remainingRouter from "./modules/remaining";
const Layout = () => import("@/layout/index.vue");
/** 自动导入全部静态路由，无需再手动引入！匹配 src/router/modules 目录（任何嵌套级别）中具有 .ts 扩展名的所有文件，除了 remaining.ts 文件
 * 如何匹配所有文件请看：https://github.com/mrmlnc/fast-glob#basic-syntax
 * 如何排除文件请看：https://cn.vitejs.dev/guide/features.html#negative-patterns
 */
const modules: Record<string, any> = import.meta.glob(
  ["./modules/**/*.ts", "!./modules/**/remaining.ts"],
  {
    eager: true
  }
);

/** 原始静态路由（未做任何处理） */
const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
      showLink: false,
      rank: 101
    }
  },
  {
    path: "/main",
    name: "MainVue",
    redirect: "/main/analysis/overview",
    component: Layout
    // component: () => import("@/views/main/index.vue")
    // children: [] -> 根据 userMenus 来决定
  }
];

Object.keys(modules).forEach(key => {
  routes.push(modules[key].default);
});

/** 不参与菜单的路由 */
export const remainingPaths = Object.keys(remainingRouter).map(v => {
  return remainingRouter[v].path;
});

/** 创建路由实例 */
export const router: Router = createRouter({
  history: getHistoryMode(import.meta.env.VITE_ROUTER_HISTORY),
  routes: routes,
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise(resolve => {
      if (savedPosition) {
        return savedPosition;
      } else {
        if (from.meta.saveSrollTop) {
          const top: number =
            document.documentElement.scrollTop || document.body.scrollTop;
          resolve({ left: 0, top });
        }
      }
    });
  }
});

router.beforeEach(to => {
  const token = localStorage.getItem("TOKEN");
  if (to.path !== "/login") {
    if (!token) {
      return "/login";
    }
  }

  if (to.path === "/main") {
    // return firstRoute?.path;
  }
  console.log(router.getRoutes(), to);
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
