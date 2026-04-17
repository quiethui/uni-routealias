<script setup lang="ts">
import AppShell from "@/components/app-shell.vue";
import DemoListItem from "@/components/demo-list-item.vue";
import GlassPanel from "@/components/glass-panel.vue";
import { useDemoRouter } from "@/composables/use-demo-router";
import { useRoutePage } from "@/composables/use-route-page";

const actualPath = "/pages/routes/playground/index";
const { openRoute, copyPublicRoute } = useDemoRouter();
const {
  actualUrl,
  currentFullPath,
  currentRoute,
  entryLabel,
  platformUrl,
  publicPaths,
  publicUrl,
  queryLabel,
} = useRoutePage(actualPath);
</script>

<template>
  <app-shell title="原始路由 / 默认 alias" subtitle="同页双入口。">
    <glass-panel title="当前解析">
      <view class="demo-kv-list">
        <view class="demo-kv-item">
          <text class="demo-kv-label">entry</text>
          <text class="demo-kv-value">{{ entryLabel }}</text>
        </view>
        <view class="demo-kv-item">
          <text class="demo-kv-label">actual</text>
          <text class="demo-kv-value">{{ actualUrl }}</text>
        </view>
        <view class="demo-kv-item">
          <text class="demo-kv-label">public</text>
          <text class="demo-kv-value">{{ publicUrl }}</text>
        </view>
        <view class="demo-kv-item">
          <text class="demo-kv-label">platform</text>
          <text class="demo-kv-value">{{ platformUrl }}</text>
        </view>
        <view class="demo-kv-item">
          <text class="demo-kv-label">current</text>
          <text class="demo-kv-value">{{ currentRoute }} | {{ currentFullPath }}</text>
        </view>
        <view class="demo-kv-item">
          <text class="demo-kv-label">query</text>
          <text class="demo-kv-value">{{ queryLabel }}</text>
        </view>
      </view>
    </glass-panel>

    <glass-panel title="可解析路径">
      <view class="demo-button-row">
        <text v-for="path in publicPaths" :key="path" class="demo-chip">{{ path }}</text>
      </view>
    </glass-panel>

    <glass-panel title="快速切换">
      <demo-list-item
        title="再走一次原始 /pages 路由"
        description="同页重新进入，entry=raw。"
        :lines="[{ label: 'url', value: '/pages/routes/playground/index?entry=raw' }]"
      >
        <template #actions>
          <button class="demo-button demo-button--primary" @click="openRoute('/pages/routes/playground/index?entry=raw')">
            打开
          </button>
        </template>
      </demo-list-item>

      <demo-list-item
        title="改走默认 alias"
        description="不带 /pages 的同页入口。"
        :lines="[{ label: 'url', value: '/routes/playground/index?entry=default' }]"
      >
        <template #actions>
          <button class="demo-button demo-button--ghost" @click="openRoute('/routes/playground/index?entry=default')">
            打开
          </button>
          <button class="demo-button demo-button--ghost" @click="copyPublicRoute(actualUrl)">
            复制当前公开地址
          </button>
        </template>
      </demo-list-item>

      <demo-list-item
        title="切到 Signal tab"
        description="顺便看 tab 页的自定义 alias。"
        :lines="[{ label: 'url', value: '/signal' }]"
        tone="emerald"
      >
        <template #actions>
          <button class="demo-button demo-button--emerald" @click="openRoute('/signal', 'switchTab')">
            switchTab
          </button>
        </template>
      </demo-list-item>
    </glass-panel>
  </app-shell>
</template>
