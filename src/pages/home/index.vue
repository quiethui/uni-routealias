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
      <text class="hero-label">uni-routealias</text>
      <text class="hero-title">四种路由方式示例</text>
      <text class="hero-desc">
        这个示例项目分别展示带 /pages、默认 alias、自定义 alias、分包 alias 四种访问方式，所有页面内容都是静态的。
      </text>
    </view>

    <view class="section-card">
      <text class="section-title">方式总览</text>
      <view class="alias-list">
        <text class="alias-item">带 /pages：/pages/with-pages/index</text>
        <text class="alias-item">不带 /pages：/default-alias/index</text>
        <text class="alias-item">自定义：/custom-entry</text>
        <text class="alias-item">分包：/subpackage-entry</text>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">页面入口</text>
      <view class="nav-list">
        <button class="nav-button primary-button" @click="openPage('/pages/with-pages/index')">
          打开带 /pages 示例
        </button>
        <button class="nav-button" @click="openPage('/default-alias/index')">
          打开默认 alias 示例
        </button>
        <button class="nav-button" @click="openPage('/custom-entry')">
          打开自定义 alias 示例
        </button>
        <button class="nav-button" @click="openPage('/subpackage-entry')">
          打开分包 alias 示例
        </button>
      </view>
    </view>
  </view>
</template>
