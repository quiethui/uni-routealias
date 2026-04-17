<script setup lang="ts">
import { computed } from "vue";
import AppShell from "@/components/app-shell.vue";
import GlassPanel from "@/components/glass-panel.vue";
import { useDemoRouter } from "@/composables/use-demo-router";
import { useRoutePage } from "@/composables/use-route-page";

const actualPath = "/pages/article/detail";
const { openRoute, copyPublicRoute } = useDemoRouter();
const { actualUrl, publicUrl, query, queryLabel } = useRoutePage(actualPath);

const articleId = computed(() => query.value.id || "2048");
</script>

<template>
  <app-shell title="/pulse" subtitle="alias + query。">
    <glass-panel title="详情参数">
      <view class="demo-kv-list">
        <view class="demo-kv-item">
          <text class="demo-kv-label">id</text>
          <text class="demo-kv-value">{{ articleId }}</text>
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
          <text class="demo-kv-label">query</text>
          <text class="demo-kv-value">{{ queryLabel }}</text>
        </view>
      </view>
    </glass-panel>

    <glass-panel title="继续跳转">
      <view class="demo-button-row">
        <button class="demo-button demo-button--amber" @click="openRoute('/campaign?entry=detail&article=' + articleId)">
          打开 /campaign
        </button>
        <button class="demo-button demo-button--ghost" @click="openRoute('/observatory', 'switchTab')">
          去观测台
        </button>
        <button class="demo-button demo-button--ghost" @click="copyPublicRoute(actualUrl)">复制</button>
      </view>
    </glass-panel>
  </app-shell>
</template>
