import { defineStore } from "pinia";
import { store } from "@/store";
import { userType } from "./types";
import { routerArrays } from "@/layout/types";
import { router } from "@/router";
import { storageSession } from "@pureadmin/utils";
import { getLogin, refreshTokenApi } from "@/api/user";
import { UserResult, RefreshTokenResult } from "@/api/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { type DataInfo, setToken, removeToken, sessionKey } from "@/utils/auth";
import { requestUserInfoById, reqUserMenuByRoleId } from "@/api/menu/menu";

import { mapMenusToRoutes } from "@/utils/map.menus";

import { getItems, setItems } from "@/utils/localStorage";
export const useUserStore = defineStore("pure-user", {
  state: (): userType => ({
    // 用户名
    username:
      storageSession().getItem<DataInfo<number>>(sessionKey)?.username ?? "",
    // 页面级别权限
    roles: storageSession().getItem<DataInfo<number>>(sessionKey)?.roles ?? [],

    userInfo: {},
    userMenus: {},
    token: ""
  }),
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储角色 */
    SET_ROLES(token: string) {
      this.roles = token;
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(async res => {
            if (res) {
              setToken(res.data);
              const { id, token } = res.data;
              this.token = token;
              const users = await requestUserInfoById(id);
              this.userInfo = users.data;
              localStorage.setItem("TOKEN", token);

              // 获取侧边栏数据(用户所拥有的权限)  这里是获取用户的权限id，不是用户id
              const menu = await reqUserMenuByRoleId(this.userInfo.role.id);
              this.userMenus = menu.data;

              setItems("menus", menu.data);

              // 获取用户的动态路由
              this.getsMenus(menu.data);
              // mapMenusToRoutes;
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.username = "";
      this.roles = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      // resetRouter();
      router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    // 本地加载
    // 刷新页面都会执行这个方法
    async loadLocalLogin() {
      // const token = localCache.getCache("token");
      const token = this.token;
      // const commonStore = useCommon();
      if (token) {
        this.token = token;
      }

      if (localStorage.getItem("menus")) {
        await this.getsMenus(getItems("menus"));
      } else {
        router.push("/login");
      }
    },
    async getsMenus(menus: any) {
      this.userMenus = menus;
      const routes = await mapMenusToRoutes(menus);

      // 将routes -> router.main.children
      // 注册路由
      routes.forEach(route => {
        router.addRoute("main", route);
      });

      // 收集所有的按钮权限
      // const permissions = mapMenusToPermissions(this.userMenus);
      // this.permissions = permissions;
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
