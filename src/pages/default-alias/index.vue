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
      <text class="hero-label">不带 /pages</text>
      <text class="hero-title">默认 alias 示例页</text>
      <text class="hero-desc">
        这个页面不写 routeAlias，插件会基于 pages 路径自动生成默认 alias：/default-alias/index。
      </text>
    </view>

    <view class="section-card">
      <text class="section-title">当前页面映射</text>
      <view class="alias-list">
        <text class="alias-item">真实路径：/pages/default-alias/index</text>
        <text class="alias-item">默认 alias：/default-alias/index</text>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">继续浏览</text>
      <view class="nav-list">
        <button class="nav-button primary-button" @click="openPage('/home')">返回 /home</button>
        <button class="nav-button" @click="openPage('/pages/with-pages/index')">打开带 /pages 示例</button>
        <button class="nav-button" @click="openPage('/subpackage-entry')">打开分包 alias 示例</button>
      </view>
    </view>
  </view>
</template>
