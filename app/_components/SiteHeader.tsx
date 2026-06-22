"use client";

import Link from "next/link";
import UserDropdown from "@/app/_components/UserDropdown";
import { NotificationBell } from "@/app/_components/NotificationBell";
import { MessageIcon } from "@/app/_components/MessageIcon";
import WeatherPopover from "@/app/_components/WeatherPopover";
import ExchangeRatePopover from "@/app/_components/ExchangeRatePopover";
import { Compass } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-8 sm:px-12 lg:px-16">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-bold"
        >
          <Compass className="size-5 text-primary" />
          Wanderchina
        </Link>
        <div className="flex items-center gap-1">
          <WeatherPopover />
          <ExchangeRatePopover />
          <NotificationBell />
          <MessageIcon />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
