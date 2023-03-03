import { RouteRecordRaw } from "vue-router";
const firstMenu: any = null;
const firstRoute: RouteRecordRaw | undefined = undefined;

export interface IBreadCrumb {
  name: string;
  path?: string;
}

// 计算动态路由
export async function mapMenusToRoutes(
  userMenus: any[]
  // utilFuns: any[]
): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];
  // 1.先去加载默认所有的routes
  const utilFuns: any = [];
  // 要递归的文件路径， 是否要进行递归，递归以.ts结尾的文件
  const files = import.meta.glob("../router/main/*.ts");
  for (const path in files) {
    await files[path]().then(mod => {
      utilFuns.push(mod.default);
    });
  }

  // 2.根据菜单获取需要添加的routes
  // 递归函数
  const _recurseGetRoute = (menus: any[]) => {
    for (const menu of menus) {
      // 要做映射的菜单
      if (menu.type === 2) {
        const route = utilFuns.find(item => item.path === menu.url);
        if (route) {
          routes.push(route);
        }
        // 获取第一个二级的id
        // if (!firstRoute && !firstMenu) {
        //   firstMenu = menu;
        //   firstRoute = route;
        // }
      } else {
        _recurseGetRoute(menu.children);
      }
    }
  };
  _recurseGetRoute(userMenus);

  return routes;
}

export function pathMapBreadcrumbs(userMenus: any[], currentPath: string) {
  const breadcrumb: IBreadCrumb[] = [];
  pathMapToMenu(userMenus, currentPath, breadcrumb);
  return breadcrumb;
}

// 根据导航栏上的路由路径,进行获取左侧侧边栏的默认展示字段
export function pathMapToMenu(
  Menu: any[],
  currentPath: string,
  breadcrumb?: IBreadCrumb[]
): any {
  for (const item of Menu) {
    // 继续向下遍历
    if (item.type === 1) {
      const findMenu = pathMapToMenu(item.children ?? [], currentPath);
      if (findMenu) {
        breadcrumb?.push({ name: item.name });
        breadcrumb?.push({ name: findMenu.name });

        return findMenu;
      }
    } else if (item.type === 2 && item.url === currentPath) {
      return item;
    }
  }
}
export { firstMenu, firstRoute };
