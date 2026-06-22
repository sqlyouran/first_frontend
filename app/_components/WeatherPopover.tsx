"use client";

import { useState, useCallback } from "react";
import { CloudSun, Search, RefreshCw, Droplets, Wind } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWeather, type WeatherData } from "@/lib/api/services";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: WeatherData }
  | { status: "error"; message: string };

function WeatherPanel({
  state,
  city,
  onSearch,
  onRetry,
}: {
  state: State;
  city: string;
  onSearch: (city: string) => void;
  onRetry: () => void;
}) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      onSearch(input.trim());
      setInput("");
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search city..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleSubmit}
      />

      {state.status === "loading" && (
        <div data-testid="weather-loading" className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      )}

      {state.status === "error" && (
        <div className="space-y-3 text-center">
          <p className="text-sm text-destructive">{state.message}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {state.status === "success" && (
        <div className="space-y-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{state.data.city}</p>
            <p className="text-3xl font-bold text-foreground">{state.data.temperature}°C</p>
            <p className="text-sm capitalize text-muted-foreground">{state.data.description}</p>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" />
              {state.data.humidity}%
            </span>
            <span className="inline-flex items-center gap-1">
              <Wind className="h-3.5 w-3.5" />
              {state.data.wind_speed} m/s
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Updated {new Date(state.data.updated_at).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default function WeatherPopover() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [city, setCity] = useState("Beijing");

  const load = useCallback(
    async (targetCity: string) => {
      setState({ status: "loading" });
      const result = await fetchWeather(targetCity);
      if (result.data) {
        setState({ status: "success", data: result.data });
      } else {
        setState({
          status: "error",
          message: result.error?.message ?? "Failed to load weather",
        });
      }
    },
    []
  );

  const handleOpen = useCallback(() => {
    if (state.status === "idle") {
      load(city);
    }
  }, [state.status, city, load]);

  const handleSearch = useCallback(
    (newCity: string) => {
      setCity(newCity);
      load(newCity);
    },
    [load]
  );

  const handleRetry = useCallback(() => {
    load(city);
  }, [city, load]);

  const triggerBtn = (
    <button
      type="button"
      aria-label="Weather"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <CloudSun className="h-4 w-4" />
    </button>
  );

  const panel = (
    <WeatherPanel state={state} city={city} onSearch={handleSearch} onRetry={handleRetry} />
  );

  return (
    <>
      {/* Desktop: Dialog */}
      <div className="hidden md:block">
        <Dialog onOpenChange={(open) => open && handleOpen()}>
          <DialogTrigger className="cursor-pointer" render={triggerBtn} />
          <DialogContent>
            <DialogTitle>Weather</DialogTitle>
            {panel}
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile: Sheet */}
      <div className="md:hidden">
        <Sheet onOpenChange={(open) => open && handleOpen()}>
          <SheetTrigger className="cursor-pointer" render={triggerBtn} />
          <SheetContent side="bottom">
            <SheetTitle className="px-4 pt-4">Weather</SheetTitle>
            <div className="p-4">{panel}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
