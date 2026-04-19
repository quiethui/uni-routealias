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
      <text class="hero-label">自定义 alias</text>
      <text class="hero-title">自定义公开路径示例页</text>
      <text class="hero-desc">
        这个页面显式配置 routeAlias，公开访问路径是 /custom-entry，对应真实路径 /pages/custom/index。
      </text>
    </view>

    <view class="section-card">
      <text class="section-title">当前页面映射</text>
      <view class="alias-list">
        <text class="alias-item">真实路径：/pages/custom/index</text>
        <text class="alias-item">自定义 alias：/custom-entry</text>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">继续浏览</text>
      <view class="nav-list">
        <button class="nav-button primary-button" @click="openPage('/home')">返回 /home</button>
        <button class="nav-button" @click="openPage('/default-alias/index')">打开默认 alias 示例</button>
        <button class="nav-button" @click="openPage('/subpackage-entry')">打开分包 alias 示例</button>
      </view>
    </view>
  </view>
</template>
