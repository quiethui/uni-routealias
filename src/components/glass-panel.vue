<script setup lang="ts">
defineProps<{
  title?: string;
  copy?: string;
}>();
</script>

<template>
  <view class="glass-panel">
    <view v-if="title || copy" class="glass-panel__header">
      <text v-if="title" class="glass-panel__title">{{ title }}</text>
      <text v-if="copy" class="glass-panel__copy">{{ copy }}</text>
    </view>
    <slot />
  </view>
</template>

<style scoped>
.glass-panel {
  padding: 24rpx;
  border-radius: var(--demo-radius);
  border: 1px solid var(--demo-line);
  background: var(--demo-panel);
  box-shadow: var(--demo-shadow);
}

.glass-panel__header {
  display: grid;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.glass-panel__title {
  color: var(--demo-text);
  font-size: 28rpx;
  line-height: 1.25;
  font-weight: 700;
}

.glass-panel__copy {
  color: var(--demo-muted);
  font-size: 22rpx;
  line-height: 1.55;
}
</style>
