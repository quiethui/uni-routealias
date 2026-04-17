<script setup lang="ts">
type DemoLine = {
  label: string;
  value: string;
};

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    lines?: DemoLine[];
    tone?: "cyan" | "emerald" | "amber";
  }>(),
  {
    description: "",
    lines: () => [],
    tone: "cyan",
  }
);
</script>

<template>
  <view :class="['demo-list-item', `demo-list-item--${props.tone}`]">
    <view class="demo-list-item__main">
      <text class="demo-list-item__title">{{ props.title }}</text>
      <text v-if="props.description" class="demo-list-item__description">{{ props.description }}</text>
      <view v-if="props.lines.length" class="demo-list-item__lines">
        <view v-for="line in props.lines" :key="`${line.label}-${line.value}`" class="demo-list-item__line">
          <text class="demo-list-item__line-label">{{ line.label }}</text>
          <text class="demo-list-item__line-value">{{ line.value }}</text>
        </view>
      </view>
    </view>
    <view v-if="$slots.actions" class="demo-list-item__actions">
      <slot name="actions" />
    </view>
  </view>
</template>

<style scoped>
.demo-list-item {
  display: grid;
  gap: 14rpx;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--demo-line);
}

.demo-list-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.demo-list-item:first-child {
  padding-top: 0;
}

.demo-list-item__main {
  display: grid;
  gap: 10rpx;
}

.demo-list-item__title {
  color: var(--demo-text);
  font-size: 28rpx;
  line-height: 1.3;
  font-weight: 700;
}

.demo-list-item__description {
  color: var(--demo-muted);
  font-size: 22rpx;
  line-height: 1.58;
}

.demo-list-item__lines {
  display: grid;
  gap: 8rpx;
}

.demo-list-item__line {
  display: grid;
  gap: 6rpx;
}

.demo-list-item__line-label {
  color: #9aa6bc;
  font-size: 20rpx;
}

.demo-list-item__line-value {
  color: #42516a;
  font-size: 22rpx;
  line-height: 1.62;
  font-family: var(--demo-mono);
  word-break: break-all;
}

.demo-list-item__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.demo-list-item--emerald .demo-list-item__title {
  color: #1f7f59;
}

.demo-list-item--amber .demo-list-item__title {
  color: #ba6d18;
}
</style>
