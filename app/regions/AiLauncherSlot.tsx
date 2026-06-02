import aiLauncher from "./aiLauncher.data";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";

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
          <DialogContent className="sm:max-w-md">
            <div className="p-6 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-blue-700" />
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                AI Trip Planner
              </h3>
              <p className="text-slate-600">
                Coming soon. Plan your perfect China itinerary with AI.
              </p>
            </div>
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
          <SheetContent side="bottom">
            <div className="p-6 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-blue-700" />
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                AI Trip Planner
              </h3>
              <p className="text-slate-600">
                Coming soon. Plan your perfect China itinerary with AI.
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
