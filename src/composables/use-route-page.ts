import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import {
  getRoutePublicPaths,
  resolvePlatformRouteUrl,
  resolvePublicRouteUrl,
} from "@/uni_modules/uni-routealias";
import {
  appendQuery,
  formatQueryRecord,
  getCurrentPageSnapshot,
  normalizeQuery,
} from "@/utils/route-demo";

export function useRoutePage(actualPath: string) {
  const query = ref<Record<string, string>>({});
  const currentRoute = ref("");
  const currentFullPath = ref("");
  const currentOptions = ref<Record<string, string>>({});
  const stackDepth = ref(0);

  function syncSnapshot() {
    const snapshot = getCurrentPageSnapshot();
    currentRoute.value = snapshot.route;
    currentFullPath.value = snapshot.fullPath;
    currentOptions.value = snapshot.options;
    stackDepth.value = snapshot.stackDepth;
  }

  onLoad((options) => {
    query.value = normalizeQuery(options);
    syncSnapshot();
  });

  onShow(() => {
    syncSnapshot();
  });

  const actualUrl = computed(() => appendQuery(actualPath, query.value));
  const publicUrl = computed(() => resolvePublicRouteUrl(actualUrl.value));
  const platformUrl = computed(() => resolvePlatformRouteUrl(actualUrl.value));
  const publicPaths = computed(() => getRoutePublicPaths(actualPath));
  const queryLabel = computed(() => formatQueryRecord(query.value));
  const entryLabel = computed(() => query.value.entry || query.value.from || "direct");

  return {
    query,
    currentRoute,
    currentFullPath,
    currentOptions,
    stackDepth,
    actualUrl,
    publicUrl,
    platformUrl,
    publicPaths,
    queryLabel,
    entryLabel,
    syncSnapshot,
  };
}
