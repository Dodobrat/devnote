import { useEffect } from "react";
import { WifiIcon, WifiOffIcon } from "lucide-react";
import { ExternalToast, toast } from "sonner";

const commonOnlineIndicatorOptions: ExternalToast = {
  id: "online-indicator",
  duration: 1000 * 30,
  closeButton: true,
};

export function OnlineIndicator() {
  useEffect(() => {
    const handleOnline = () => {
      toast.info("You are online", {
        icon: <WifiIcon />,
        ...commonOnlineIndicatorOptions,
      });
    };

    const handleOffline = () => {
      toast.info("You are offline", {
        icon: <WifiOffIcon />,
        ...commonOnlineIndicatorOptions,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return null;
}
