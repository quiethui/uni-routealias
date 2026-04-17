import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { resolvePlatformRouteUrl, resolvePublicRouteUrl } from "uni-routealias";
import {
  getCurrentPageSnapshot,
  type DemoOpenType,
  type DemoRouteItem,
} from "@/utils/route-demo";

function navigateWithType(url: string, openType: DemoOpenType = "navigateTo") {
  const targetUrl = resolvePlatformRouteUrl(url);

  if (openType === "switchTab") {
    uni.switchTab({ url: targetUrl });
    return;
  }

  if (openType === "redirectTo") {
    uni.redirectTo({ url: targetUrl });
    return;
  }

  if (openType === "reLaunch") {
    uni.reLaunch({ url: targetUrl });
    return;
  }

  uni.navigateTo({ url: targetUrl });
}

export function useDemoRouter() {
  const currentRoute = ref("");
  const currentFullPath = ref("");
  const stackDepth = ref(0);

  function syncPageState() {
    const snapshot = getCurrentPageSnapshot();
    currentRoute.value = snapshot.route;
    currentFullPath.value = snapshot.fullPath;
    stackDepth.value = snapshot.stackDepth;
  }

  function openRoute(target: string | DemoRouteItem, openType?: DemoOpenType) {
    if (typeof target === "string") {
      navigateWithType(target, openType);
      return;
    }

    navigateWithType(target.inputUrl, target.openType);
  }

  function copyPublicRoute(url: string) {
    uni.setClipboardData({
      data: resolvePublicRouteUrl(url),
      success() {
        uni.showToast({
          title: "公开路由已复制",
          icon: "none",
        });
      },
    });
  }

  onShow(() => {
    syncPageState();
  });

  return {
    currentRoute,
    currentFullPath,
    stackDepth,
    openRoute,
    copyPublicRoute,
    syncPageState,
  };
}
