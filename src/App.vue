<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("uni-routealias demo launch");
});

onShow(() => {
  console.log("uni-routealias demo show");
});

onHide(() => {
  console.log("uni-routealias demo hide");
});
</script>

<style>
page,
view,
text,
button,
scroll-view,
navigator {
  box-sizing: border-box;
}

button::after {
  border: 0;
}

page {
  min-height: 100%;
  color: #24324a;
  background: #f5f7fb;
  font-family: "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif;
}

page::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(93, 129, 255, 0.06) 0%, rgba(93, 129, 255, 0) 18%),
    linear-gradient(180deg, #f8faff 0%, #f5f7fb 100%);
}

:root,
page {
  --demo-bg: #f5f7fb;
  --demo-panel: #ffffff;
  --demo-panel-soft: #f7f9fd;
  --demo-line: #e8edf5;
  --demo-line-strong: rgba(93, 129, 255, 0.18);
  --demo-text: #24324a;
  --demo-muted: #7b879d;
  --demo-cyan: #4d80f0;
  --demo-emerald: #2db983;
  --demo-amber: #f59f45;
  --demo-radius: 24rpx;
  --demo-radius-sm: 16rpx;
  --demo-shadow: 0 12rpx 36rpx rgba(31, 45, 61, 0.06);
  --demo-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
}

.demo-page {
  position: relative;
  min-height: 100vh;
}

.demo-chip {
  display: inline-flex;
  align-items: center;
  min-height: 42rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  border: 1px solid rgba(77, 128, 240, 0.1);
  background: rgba(77, 128, 240, 0.08);
  color: var(--demo-muted);
  font-size: 21rpx;
  line-height: 1;
}

.demo-code {
  display: block;
  width: 100%;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: var(--demo-panel-soft);
  border: 1px solid var(--demo-line);
  color: #41506a;
  font-size: 22rpx;
  line-height: 1.65;
  font-family: var(--demo-mono);
  word-break: break-all;
  white-space: pre-wrap;
}

.demo-kv-list {
  display: grid;
  gap: 12rpx;
}

.demo-kv-item {
  display: grid;
  gap: 6rpx;
  padding: 14rpx 0;
  border-bottom: 1px solid var(--demo-line);
}

.demo-kv-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.demo-kv-item:first-child {
  padding-top: 0;
}

.demo-kv-label {
  color: #9aa6bc;
  font-size: 20rpx;
}

.demo-kv-value {
  color: var(--demo-text);
  font-size: 24rpx;
  line-height: 1.62;
  font-family: var(--demo-mono);
  word-break: break-all;
}

.demo-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 68rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.demo-button:active {
  opacity: 0.92;
}

.demo-button--primary {
  background: #4d80f0;
  border: 1px solid #4d80f0;
  color: #ffffff;
}

.demo-button--ghost {
  background: #ffffff;
  border: 1px solid var(--demo-line);
  color: var(--demo-text);
}

.demo-button--amber {
  background: rgba(245, 159, 69, 0.12);
  border: 1px solid rgba(245, 159, 69, 0.18);
  color: #b96817;
}

.demo-button--emerald {
  background: rgba(45, 185, 131, 0.12);
  border: 1px solid rgba(45, 185, 131, 0.16);
  color: #18845c;
}

.demo-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
</style>
