import { useEffect, useState } from "react";
import { AppWindowMacIcon } from "lucide-react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

import { Button } from "~/components/ui/button";
import { useMediaQuery } from "~/hooks";

export function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent>();
  const [isInstalled, setIsInstalled] = useState(false);

  const isDisplayStandalone = useMediaQuery("(display-mode: standalone)");

  useEffect(() => {
    const controller = new AbortController();

    // Check if the app is already installed
    const isNavigatorStandalone =
      "standalone" in window.navigator &&
      Boolean(window.navigator["standalone"]);

    setIsInstalled(isDisplayStandalone || isNavigatorStandalone);

    window.addEventListener(
      "beforeinstallprompt",
      (e) => {
        e.preventDefault();
        setDeferred(e);
      },
      { signal: controller.signal },
    );

    window.addEventListener(
      "appinstalled",
      () => {
        setIsInstalled(true);
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, [isDisplayStandalone]);

  const handleInstallClick = async () => {
    if (!deferred) return;

    deferred.prompt();

    const { outcome } = await deferred.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }

    if (outcome === "dismissed") {
      console.log("User dismissed the install prompt");
    }

    setDeferred(undefined);
  };

  if (!deferred || isInstalled) return null;

  if (isDisplayStandalone) return null;

  return (
    <Button onClick={handleInstallClick}>
      <AppWindowMacIcon aria-hidden />
      <span>Install the App</span>
    </Button>
  );
}

export function useServiceWorkerPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedRefresh: () => setNeedRefresh(true),
    onOfflineReady: () => setOfflineReady(true),
    onRegisterError() {
      toast.error("Failed to register service worker", { duration: Infinity });
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.info("App is offline ready");
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast.info("New version available", {
        duration: Infinity,
        action: {
          label: "Refresh",
          onClick: () => updateServiceWorker(true),
        },
      });
    }
  }, [needRefresh, updateServiceWorker]);
}
