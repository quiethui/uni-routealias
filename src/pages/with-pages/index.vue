<script setup lang="ts">
import { resolvePlatformRouteUrl } from "uni-routealias";

function openPage(url: string) {
  uni.navigateTo({
    url: resolvePlatformRouteUrl(url),
  });
}
</script>

<template>
  <view class="page-wrap">
    <view class="hero-card">
      <text class="hero-label">带 /pages</text>
      <text class="hero-title">真实路径示例页</text>
      <text class="hero-desc">
        这个页面不配置 routeAlias，直接通过真实路径 /pages/with-pages/index 打开，适合演示最原始的 uni-app 页面访问方式。
      </text>
    </view>

    <view class="section-card">
      <text class="section-title">当前页面映射</text>
      <view class="alias-list">
        <text class="alias-item">访问方式：/pages/with-pages/index</text>
        <text class="alias-item">页面路径：/pages/with-pages/index</text>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">继续浏览</text>
      <view class="nav-list">
        <button class="nav-button primary-button" @click="openPage('/home')">返回 /home</button>
        <button class="nav-button" @click="openPage('/default-alias/index')">打开默认 alias 示例</button>
        <button class="nav-button" @click="openPage('/custom-entry')">打开自定义 alias 示例</button>
      </view>
    </view>
  </view>
</template>
