<script setup lang="ts">
import AppShell from "@/components/app-shell.vue";
import DemoListItem from "@/components/demo-list-item.vue";
import GlassPanel from "@/components/glass-panel.vue";
import { useDemoRouter } from "@/composables/use-demo-router";
import { useRoutePage } from "@/composables/use-route-page";

const actualPath = "/pages/signal/index";
const { openRoute, copyPublicRoute } = useDemoRouter();
const { actualUrl, platformUrl, publicPaths, publicUrl } = useRoutePage(actualPath);
</script>

<template>
  <app-shell title="/signal" subtitle="tab 页 alias 示例。">
    <glass-panel title="路径映射">
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
          <text class="demo-kv-label">platform</text>
          <text class="demo-kv-value">{{ platformUrl }}</text>
        </view>
      </view>
    </glass-panel>

    <glass-panel title="可解析路径">
      <view class="demo-button-row">
        <text v-for="path in publicPaths" :key="path" class="demo-chip">{{ path }}</text>
      </view>
    </glass-panel>

    <glass-panel title="动作列表">
      <demo-list-item
        title="打开详情 alias"
        description="进入 /pulse?id=2048。"
        :lines="[{ label: 'url', value: '/pulse?id=2048' }]"
        tone="amber"
      >
        <template #actions>
          <button class="demo-button demo-button--amber" @click="openRoute('/pulse?id=2048')">打开</button>
        </template>
      </demo-list-item>

      <demo-list-item
        title="打开分包页"
        description="进入 /campaign。"
        :lines="[{ label: 'url', value: '/campaign?entry=signal' }]"
        tone="amber"
      >
        <template #actions>
          <button class="demo-button demo-button--amber" @click="openRoute('/campaign?entry=signal')">打开</button>
        </template>
      </demo-list-item>

      <demo-list-item
        title="复制当前公开地址"
        description="适合直接用作分享入口。"
        :lines="[{ label: 'public', value: publicUrl }]"
      >
        <template #actions>
          <button class="demo-button demo-button--ghost" @click="copyPublicRoute(actualUrl)">复制</button>
          <button class="demo-button demo-button--ghost" @click="openRoute('/observatory', 'switchTab')">
            去观测台
          </button>
        </template>
      </demo-list-item>
    </glass-panel>
  </app-shell>
</template>
