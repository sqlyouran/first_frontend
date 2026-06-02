import aiLauncher from "./aiLauncher.data";

export default function AiLauncherSlot() {
  return (
    <div data-region="ai-launcher">
      <button type="button">{aiLauncher.buttonLabel}</button>
    </div>
  );
}
