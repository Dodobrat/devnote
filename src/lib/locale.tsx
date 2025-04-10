import { useState } from "react";

// TODO: refactor with jotai

const webLocalStorage = {
  getItem<TData>(key: string) {
    try {
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : undefined;
      return parsed as TData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },
  setItem<TData>(key: string, value: TData | ((prev: TData) => TData)) {
    try {
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : undefined;
      if (value instanceof Function) {
        const result = value(parsed);
        localStorage.setItem(key, JSON.stringify(result));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
    }
  },
  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  },
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(error);
    }
  },
};

function createLocaleStore<
  TLocaleKey extends string,
  TResourceStruct extends object,
>({
  mainLocale,
  locales,
  mainResource,
  persistLocaleKey = "APP_LOCALE",
}: {
  locales: TLocaleKey[];
  mainLocale: TLocaleKey;
  mainResource: TResourceStruct;
  persistLocaleKey?: string;
}) {
  const resourceMap = new Map<TLocaleKey, TResourceStruct>([
    [mainLocale, mainResource],
  ]);
  let currentLocale =
    webLocalStorage.getItem<TLocaleKey>(persistLocaleKey) || mainLocale;

  return {
    addResource(localeKey: TLocaleKey, resource: TResourceStruct) {
      resourceMap.set(localeKey, resource);
    },
    locales,
    setLocale: (localeKey: TLocaleKey) => {
      currentLocale = localeKey;
      webLocalStorage.setItem(persistLocaleKey, localeKey);
    },
    get resources() {
      return Object.fromEntries(resourceMap.entries());
    },
    get currentLocale() {
      return currentLocale;
    },
    get t() {
      return resourceMap.get(currentLocale) || mainResource;
    },
  };
}

const en = {
  hello: "hello",
  world: "world",
};

export const localeInstance = createLocaleStore({
  locales: ["en", "bg"],
  mainLocale: "en",
  mainResource: en,
});

localeInstance.addResource("bg", {
  hello: "Здравей",
  world: "Свят",
});

function setHtmlLang(value: typeof localeInstance.currentLocale) {
  const htmlEl = document?.documentElement;
  htmlEl?.setAttribute("lang", value);
}

setHtmlLang(localeInstance.currentLocale);

export function useLocale() {
  const [_, tick] = useState({});

  return {
    ...localeInstance,
    setLocale: (localeKey: Parameters<typeof localeInstance.setLocale>[0]) => {
      if (localeInstance.currentLocale === localeKey) return;
      localeInstance.setLocale(localeKey);
      setHtmlLang(localeInstance.currentLocale);
      tick({});
    },
  };
}
