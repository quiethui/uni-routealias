<script setup lang="ts">
import AppShell from "@/components/app-shell.vue";
import GlassPanel from "@/components/glass-panel.vue";
import { useDemoRouter } from "@/composables/use-demo-router";
import { useRoutePage } from "@/composables/use-route-page";

const actualPath = "/packages/showcase/campaign/index";
const { openRoute, copyPublicRoute } = useDemoRouter();
const { actualUrl, publicPaths, publicUrl, queryLabel } = useRoutePage(actualPath);
</script>

<template>
  <app-shell title="/campaign" subtitle="分包页 alias。">
    <glass-panel title="分包页映射">
      <view class="demo-kv-list">
        <view class="demo-kv-item">
          <text class="demo-kv-label">actual</text>
          <text class="demo-kv-value">{{ actualUrl }}</text>
        </view>
        <view class="demo-kv-item">
          <text class="demo-kv-label">public</text>
          <text class="demo-kv-value">{{ publicUrl }}</text>
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

    <glass-panel title="返回">
      <view class="demo-button-row">
        <button class="demo-button demo-button--ghost" @click="openRoute('/pages/routes/playground/index?entry=campaign')">
          原始路由页
        </button>
        <button class="demo-button demo-button--ghost" @click="openRoute('/signal', 'switchTab')">
          Signal
        </button>
        <button class="demo-button demo-button--ghost" @click="copyPublicRoute(actualUrl)">复制</button>
      </view>
    </glass-panel>
  </app-shell>
</template>
