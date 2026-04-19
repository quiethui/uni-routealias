<script lang="ts">
export default {
  onLaunch() {},
  onShow() {},
  onHide() {},
};
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
  color: #1f2937;
  background: #f6f7fb;
  font-family: "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif;
}

.page-wrap {
  min-height: 100vh;
  padding: 32rpx;
}

.hero-card,
.section-card {
  padding: 32rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, 0.06);
}

.hero-card {
  display: grid;
  gap: 16rpx;
}

.section-card {
  display: grid;
  gap: 20rpx;
  margin-top: 24rpx;
}

.hero-label {
  color: #4d80f0;
  font-size: 22rpx;
  font-weight: 600;
}

.hero-title {
  color: #111827;
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.4;
}

.hero-desc,
.alias-item {
  color: #4b5563;
  font-size: 26rpx;
  line-height: 1.7;
}

.section-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 600;
}

.alias-list,
.nav-list {
  display: grid;
  gap: 16rpx;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  border: 1px solid #d7dce5;
  border-radius: 16rpx;
  background: #ffffff;
  color: #1f2937;
  font-size: 28rpx;
}

.primary-button {
  border-color: #4d80f0;
  background: #4d80f0;
  color: #ffffff;
}
</style>
