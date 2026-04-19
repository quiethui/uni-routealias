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
      <text class="hero-label">分包 alias</text>
      <text class="hero-title">分包页面示例页</text>
      <text class="hero-desc">
        这个页面位于分包 packages/demo 下，并显式配置 routeAlias 为 /subpackage-entry，用来演示分包页面的公开路径。
      </text>
    </view>

    <view class="section-card">
      <text class="section-title">当前页面映射</text>
      <view class="alias-list">
        <text class="alias-item">真实路径：/packages/demo/subpage/index</text>
        <text class="alias-item">分包 alias：/subpackage-entry</text>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">继续浏览</text>
      <view class="nav-list">
        <button class="nav-button primary-button" @click="openPage('/home')">返回 /home</button>
        <button class="nav-button" @click="openPage('/pages/with-pages/index')">打开带 /pages 示例</button>
        <button class="nav-button" @click="openPage('/custom-entry')">打开自定义 alias 示例</button>
      </view>
    </view>
  </view>
</template>
