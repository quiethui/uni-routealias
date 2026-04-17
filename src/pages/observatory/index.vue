<script setup lang="ts">
import { computed } from "vue";
import AppShell from "@/components/app-shell.vue";
import DemoListItem from "@/components/demo-list-item.vue";
import GlassPanel from "@/components/glass-panel.vue";
import { useDemoRouter } from "@/composables/use-demo-router";
import { getResolvedRouteInfo, routeRegistryItems } from "@/utils/route-demo";

const { currentFullPath, currentRoute, openRoute } = useDemoRouter();

const registry = computed(() =>
  routeRegistryItems.map((item) => {
    const resolved = getResolvedRouteInfo(item.actualPath);
    return {
      ...item,
      lines: [
        { label: "actual", value: resolved.actualPath },
        { label: "public", value: resolved.publicUrl },
      ],
    };
  })
);

function openRegistryItem(actualPath: string) {
  if (actualPath === "/pages/home/index") {
    openRoute("/", "switchTab");
    return;
  }

  if (actualPath === "/pages/signal/index") {
    openRoute("/signal", "switchTab");
    return;
  }

  if (actualPath === "/pages/observatory/index") {
    openRoute("/observatory", "switchTab");
    return;
  }

  openRoute(actualPath);
}
</script>

<template>
  <app-shell title="路由观测台" subtitle="注册表视图。">
    <glass-panel title="页面注册表">
      <demo-list-item
        v-for="item in registry"
        :key="item.actualPath"
        :title="item.title"
        :description="item.note"
        :lines="item.lines"
      >
        <template #actions>
          <button class="demo-button demo-button--ghost" @click="openRegistryItem(item.actualPath)">
            打开
          </button>
        </template>
      </demo-list-item>
    </glass-panel>

    <glass-panel title="当前状态">
      <view class="demo-kv-list">
        <view class="demo-kv-item">
          <text class="demo-kv-label">route</text>
          <text class="demo-kv-value">{{ currentRoute }}</text>
        </view>
        <view class="demo-kv-item">
          <text class="demo-kv-label">fullPath</text>
          <text class="demo-kv-value">{{ currentFullPath }}</text>
        </view>
      </view>
    </glass-panel>
  </app-shell>
</template>
