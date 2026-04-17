<script setup lang="ts">
import { resolvePlatformRouteUrl } from "@/uni_modules/uni-routealias";

type ShellTone = "cyan" | "emerald" | "amber";

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    tone?: ShellTone;
    showBack?: boolean;
  }>(),
  {
    tone: "cyan",
    showBack: true,
    subtitle: "",
  }
);

function goBack() {
  const pages = getCurrentPages();

  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }

  uni.reLaunch({
    url: resolvePlatformRouteUrl("/"),
  });
}

function goHome() {
  uni.reLaunch({
    url: resolvePlatformRouteUrl("/"),
  });
}
</script>

<template>
  <view :class="['demo-page', 'app-shell', `app-shell--${props.tone}`]">
    <view class="app-shell__inner">
      <view class="app-shell__header">
        <view class="app-shell__copy">
          <text class="app-shell__eyebrow">UNI-ROUTEALIAS DEMO</text>
          <text class="app-shell__title">{{ props.title }}</text>
          <text v-if="props.subtitle" class="app-shell__subtitle">{{ props.subtitle }}</text>
        </view>
        <view class="app-shell__actions">
          <button
            v-if="props.showBack"
            class="demo-button demo-button--ghost"
            @click="goBack"
          >
            返回
          </button>
          <button class="demo-button demo-button--primary" @click="goHome">
            首页
          </button>
        </view>
      </view>

      <view class="app-shell__content">
        <slot />
      </view>
    </view>
  </view>
</template>

<style scoped>
.app-shell {
  position: relative;
}

.app-shell__inner {
  position: relative;
  z-index: 1;
  width: min(100%, 860rpx);
  margin: 0 auto;
  padding: calc(78rpx + env(safe-area-inset-top)) 24rpx calc(32rpx + var(--window-bottom, 0px));
}

.app-shell__header {
  display: grid;
  gap: 14rpx;
}

.app-shell__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 36rpx;
  width: fit-content;
  padding: 0 12rpx;
  border-radius: 999rpx;
  border: 1px solid rgba(77, 128, 240, 0.1);
  background: rgba(77, 128, 240, 0.08);
  color: var(--demo-cyan);
  font-size: 18rpx;
  letter-spacing: 2rpx;
}

.app-shell__title {
  display: block;
  color: var(--demo-text);
  margin-top: 8rpx;
  font-size: 42rpx;
  line-height: 1.18;
  font-weight: 700;
}

.app-shell__subtitle {
  display: block;
  max-width: 680rpx;
  margin-top: 8rpx;
  color: var(--demo-muted);
  font-size: 22rpx;
  line-height: 1.6;
}

.app-shell__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.app-shell__content {
  display: grid;
  gap: 14rpx;
  margin-top: 18rpx;
}

@media (min-width: 860px) {
  .app-shell__header {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }
}
</style>
