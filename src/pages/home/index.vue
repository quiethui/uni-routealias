<script setup lang="ts">
import { computed } from "vue";
import AppShell from "@/components/app-shell.vue";
import DemoListItem from "@/components/demo-list-item.vue";
import GlassPanel from "@/components/glass-panel.vue";
import { useDemoRouter } from "@/composables/use-demo-router";
import { getResolvedRouteInfo, routeShowcaseItems, type DemoRouteItem } from "@/utils/route-demo";

const { currentFullPath, currentRoute, openRoute, copyPublicRoute, stackDepth } = useDemoRouter();

const routeItems = computed(() =>
  routeShowcaseItems.map((item) => {
    const resolved = getResolvedRouteInfo(item.inputUrl);
    return {
      ...item,
      lines: [
        { label: "输入", value: item.inputUrl },
        { label: "平台", value: resolved.platformUrl },
        { label: "公开", value: resolved.publicUrl },
      ],
    };
  })
);

function openItem(item: DemoRouteItem) {
  openRoute(item);
}
</script>

<template>
  <app-shell
    title="uni-routealias Demo"
    subtitle="一个用来演示路由别名与公开路径的示例工程。"
    :show-back="false"
  >
    <glass-panel title="功能入口">
      <demo-list-item
        v-for="item in routeItems"
        :key="item.id"
        :title="item.title"
        :description="item.description"
        :lines="item.lines"
        :tone="item.tone"
      >
        <template #actions>
          <button class="demo-button demo-button--primary" @click="openItem(item)">打开</button>
          <button class="demo-button demo-button--ghost" @click="copyPublicRoute(item.inputUrl)">
            复制
          </button>
        </template>
      </demo-list-item>
    </glass-panel>

    <glass-panel title="当前页">
      <view class="demo-kv-list">
        <view class="demo-kv-item">
          <text class="demo-kv-label">route</text>
          <text class="demo-kv-value">{{ currentRoute || "/" }}</text>
        </view>
        <view class="demo-kv-item">
          <text class="demo-kv-label">fullPath</text>
          <text class="demo-kv-value">{{ currentFullPath || "/" }}</text>
        </view>
        <view class="demo-kv-item">
          <text class="demo-kv-label">stack</text>
          <text class="demo-kv-value">{{ String(stackDepth) }}</text>
        </view>
      </view>
    </glass-panel>
  </app-shell>
</template>
