import { useState } from "react";

import { webLocalStorage } from "./storage";

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
