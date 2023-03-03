import type { App } from "vue";
import { createPinia } from "pinia";
const store = createPinia();
import { createPersistedState } from "pinia-plugin-persistedstate";
export function setupStore(app: App<Element>) {
  app.use(store);
}

store.use(
  createPersistedState({
    serializer: {
      // 指定参数序列化器
      serialize: JSON.stringify,
      deserialize: JSON.parse
    }
  })
);

export { store };
