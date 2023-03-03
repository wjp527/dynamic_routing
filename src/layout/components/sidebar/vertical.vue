<script setup lang="ts">
import Logo from "./logo.vue";
import { useRoute, useRouter } from "vue-router";
import { emitter } from "@/utils/mitt";
import SidebarItem from "./sidebarItem.vue";
import leftCollapse from "./leftCollapse.vue";
import { useNav } from "@/layout/hooks/useNav";
import { storageLocal } from "@pureadmin/utils";
import { ref, computed, watch, onBeforeMount } from "vue";
import { findRouteByPath, getParentPaths } from "@/router/utils";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useUserStore } from "../../../store/modules/user";
import { pathMapToMenu } from "@/utils/map.menus";
const route = useRoute();
const router = useRouter();
const showLogo = ref(
  storageLocal().getItem<StorageConfigs>("responsive-configure")?.showLogo ??
    true
);

const userStore = useUserStore();

const { routers, device, pureApp, isCollapse, menuSelect, toggleSideBar } =
  useNav();

const subMenuData = ref([]);

const menuData = computed(() => {
  return pureApp.layout === "mix" && device.value !== "mobile"
    ? subMenuData.value
    : usePermissionStoreHook().wholeMenus;
});

function getSubMenuData(path: string) {
  // path的上级路由组成的数组
  const parentPathArr = getParentPaths(
    path,
    usePermissionStoreHook().wholeMenus
  );
  // 当前路由的父级路由信息
  const parenetRoute = findRouteByPath(
    parentPathArr[0] || path,
    usePermissionStoreHook().wholeMenus
  );
  if (!parenetRoute?.children) return;
  subMenuData.value = parenetRoute?.children;
}

getSubMenuData(route.path);

onBeforeMount(() => {
  emitter.on("logoChange", key => {
    showLogo.value = key;
  });
});

watch(
  () => [route.path, usePermissionStoreHook().wholeMenus],
  () => {
    getSubMenuData(route.path);
    menuSelect(route.path, routers);
  }
);

const menus = userStore.userMenus;
const menu = pathMapToMenu(menus, route.path);

const defaultValue = ref<string>(menu.id + "");
// const defaultValue = ref<string>(39);

const handleMenuItemClick = (item: any) => {
  defaultValue.value = item.id + "";
  router.push({
    path: item.url ?? "/notFound"
  });
};

console.log(menus, "==");
</script>

<template>
  <div :class="['sidebar-container', showLogo ? 'has-logo' : '']">
    <Logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar
      wrap-class="scrollbar-wrapper"
      :class="[device === 'mobile' ? 'mobile' : 'pc']"
    >
      <el-menu
        class="el-menu-vertical-demo"
        :default-active="defaultValue"
        background-color="#0c2135"
        text-color="#b7bdc3"
        active-text-color="#0a60bd"
        :collapse="isCollapse"
        :collapse-transition="isCollapse"
      >
        <template v-for="item in menus" :key="item.id">
          <!-- 二级菜单 -->
          <template v-if="item.type === 1">
            <!-- 二级菜单的可以展开的标题 -->
            <el-sub-menu :index="item.id + ''">
              <template #title>
                <!-- <i v-if="item.icon" :class="item.icon"></i> -->
                <!-- <el-icon><Setting /></el-icon> -->
                <span>{{ item.name }}</span>
              </template>

              <template v-for="subitem in item.children" :key="subitem.id">
                <el-menu-item
                  :index="subitem.id + ''"
                  @click="handleMenuItemClick(subitem)"
                >
                  <!-- <i v-if="subitem.icon" :class="subitem.icon"></i> -->
                  <span>{{ subitem.name }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>
          </template>
          <!-- 一级菜单 -->
          <template v-else-if="item.type === 2">
            <el-menu-item :index="item.id + ''">
              <i v-if="item.icon" :class="item.icon" />
              <span>{{ item.name }}</span>
            </el-menu-item>
          </template>
        </template>
      </el-menu>
    </el-scrollbar>
    <leftCollapse
      v-if="device !== 'mobile'"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />
  </div>
</template>

<style scoped>
:deep(.el-loading-mask) {
  /* opacity: 0.45; */
}
</style>
