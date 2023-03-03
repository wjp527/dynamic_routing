<script setup lang="ts">
import { computed } from "vue";
import { isEqual } from "@pureadmin/utils";
import { ref, watch, onMounted, toRaw } from "vue";
import { getParentPaths, findRouteByPath } from "@/router/utils";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRoute, useRouter, RouteLocationMatched } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { pathMapBreadcrumbs } from "@/utils/map.menus";
const route = useRoute();
const levelList = ref([]);
const router = useRouter();
const routes: any = router.options.routes;
const multiTags: any = useMultiTagsStoreHook().multiTags;

const isDashboard = (route: RouteLocationMatched): boolean | string => {
  const name = route && (route.name as string);
  if (!name) return false;
  return name.trim().toLocaleLowerCase() === "Welcome".toLocaleLowerCase();
};

// 路径变化,或者左侧侧边栏数据变化,就会重新渲染页面
const breadcrumbs = computed(() => {
  // 获取左侧参数数据
  const { userMenus } = useUserStore();

  // 获取当前的路径
  const Router = useRouter();
  const path = Router.currentRoute.value.path;
  return pathMapBreadcrumbs(userMenus, path);
});
const getBreadcrumb = (): void => {
  // 当前路由信息
  let currentRoute;

  if (Object.keys(route.query).length > 0) {
    multiTags.forEach(item => {
      if (isEqual(route.query, item?.query)) {
        currentRoute = toRaw(item);
      }
    });
  } else if (Object.keys(route.params).length > 0) {
    multiTags.forEach(item => {
      if (isEqual(route.params, item?.params)) {
        currentRoute = toRaw(item);
      }
    });
  } else {
    currentRoute = findRouteByPath(router.currentRoute.value.path, multiTags);
  }
  // 当前路由的父级路径组成的数组
  const parentRoutes = getParentPaths(router.currentRoute.value.path, routes);
  // 存放组成面包屑的数组
  let matched = [];
  // 获取每个父级路径对应的路由信息
  parentRoutes.forEach(path => {
    if (path !== "/") matched.push(findRouteByPath(path, routes));
  });

  if (currentRoute?.path !== "/main") matched.push(currentRoute);

  if (!isDashboard(matched[0])) {
    matched = [
      {
        path: "/main/analysis/overview",
        parentPath: "/",
        meta: { title: "首页" }
      } as unknown as RouteLocationMatched
    ].concat(matched);
  }

  matched.forEach((item, index) => {
    if (currentRoute?.query || currentRoute?.params) return;
    if (item?.children) {
      item.children.forEach(v => {
        if (v?.meta?.title === item?.meta?.title) {
          matched.splice(index, 1);
        }
      });
    }
  });

  levelList.value = matched.filter(
    item => item?.meta && item?.meta.title !== false
  );
};

const handleLink = (): void => {};

onMounted(() => {
  getBreadcrumb();
});

watch(
  () => route.path,
  () => {
    getBreadcrumb();
  }
);
</script>

<template>
  <el-breadcrumb class="!leading-[50px] select-none" separator="/">
    <!-- <transition-group name="breadcrumb"> -->
    <el-breadcrumb-item
      class="!inline !items-stretch"
      v-for="item in breadcrumbs"
      :key="item.path"
    >
      <a @click.prevent="handleLink(item)">
        {{ item.name }}
      </a>
    </el-breadcrumb-item>
    <!-- </transition-group> -->
  </el-breadcrumb>
</template>
