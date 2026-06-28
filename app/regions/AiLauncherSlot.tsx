import aiLauncher from "./aiLauncher.data";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";
import { AiChatPanel } from "@/app/_components/AiChatPanel";

const triggerClass =
  "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg transition-all cursor-pointer";

export default function AiLauncherSlot() {
  return (
    <div data-region="ai-launcher">
      {/* Desktop: Dialog */}
      <div className="hidden md:block">
        <Dialog>
          <DialogTrigger className={triggerClass}>
            <Sparkles className="h-5 w-5" />
            <span>{aiLauncher.buttonLabel}</span>
          </DialogTrigger>
          <DialogContent className="flex h-[70vh] flex-col sm:max-w-lg p-0">
            <AiChatPanel />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile: Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger className={triggerClass}>
            <Sparkles className="h-5 w-5" />
            <span>{aiLauncher.buttonLabel}</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="flex h-[85vh] flex-col p-0">
            <AiChatPanel />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
