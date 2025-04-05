export {}; // Ensure this file is treated as a module

declare global {
  type UserChoice = Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;

  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: UserChoice;
    prompt(): Promise<UserChoice>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
