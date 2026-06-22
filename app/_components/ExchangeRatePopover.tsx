"use client";

import { useState, useCallback, useMemo } from "react";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
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
import { fetchExchangeRate, type ExchangeRateData } from "@/lib/api/services";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "KRW", "AUD", "CAD", "CHF"];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ExchangeRateData }
  | { status: "error"; message: string };

function RatePanel({
  state,
  base,
  onRetry,
  onBaseChange,
}: {
  state: State;
  base: string;
  onRetry: () => void;
  onBaseChange: (base: string) => void;
}) {
  const [amount, setAmount] = useState("");

  const cnyRate = useMemo(() => {
    if (state.status !== "success") return null;
    const rate = state.data.rates["CNY"];
    return rate ? parseFloat(rate) : null;
  }, [state]);

  const convertedAmount = useMemo(() => {
    if (!cnyRate || !amount) return null;
    const num = parseFloat(amount);
    if (isNaN(num)) return null;
    return (num * cnyRate).toFixed(2);
  }, [cnyRate, amount]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={base}
          onChange={(e) => onBaseChange(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">→ CNY</span>
      </div>

      {state.status === "loading" && (
        <div data-testid="rate-loading" className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-32" />
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

      {state.status === "success" && cnyRate && (
        <div className="space-y-3">
          <div>
            <p className="text-2xl font-bold text-foreground">
              1 {base} = {cnyRate} CNY
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Convert amount</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">{base}</span>
              <span className="text-sm text-muted-foreground">=</span>
              {convertedAmount !== null ? (
                <span className="text-sm font-semibold text-foreground">
                  {convertedAmount} CNY
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">— CNY</span>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Updated {new Date(state.data.updated_at).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ExchangeRatePopover() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [base, setBase] = useState("USD");

  const load = useCallback(async (baseCurrency: string) => {
    setState({ status: "loading" });
    const result = await fetchExchangeRate(baseCurrency);
    if (result.data) {
      setState({ status: "success", data: result.data });
    } else {
      setState({
        status: "error",
        message: result.error?.message ?? "Failed to load rates",
      });
    }
  }, []);

  const handleOpen = useCallback(() => {
    if (state.status === "idle") {
      load(base);
    }
  }, [state.status, base, load]);

  const handleBaseChange = useCallback(
    (newBase: string) => {
      setBase(newBase);
      load(newBase);
    },
    [load]
  );

  const handleRetry = useCallback(() => {
    load(base);
  }, [base, load]);

  const triggerBtn = (
    <button
      type="button"
      aria-label="Exchange rate"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <ArrowLeftRight className="h-4 w-4" />
    </button>
  );

  const panel = (
    <RatePanel state={state} base={base} onRetry={handleRetry} onBaseChange={handleBaseChange} />
  );

  return (
    <>
      {/* Desktop: Dialog */}
      <div className="hidden md:block">
        <Dialog onOpenChange={(open) => open && handleOpen()}>
          <DialogTrigger className="cursor-pointer" render={triggerBtn} />
          <DialogContent>
            <DialogTitle>Exchange Rate</DialogTitle>
            {panel}
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile: Sheet */}
      <div className="md:hidden">
        <Sheet onOpenChange={(open) => open && handleOpen()}>
          <SheetTrigger className="cursor-pointer" render={triggerBtn} />
          <SheetContent side="bottom">
            <SheetTitle className="px-4 pt-4">Exchange Rate</SheetTitle>
            <div className="p-4">{panel}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
