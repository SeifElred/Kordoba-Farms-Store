"use client";

import type { CSSProperties } from "react";
import { DayPicker } from "react-day-picker";
import {
  arSA,
  enUS,
  ms,
  zhCN,
  type Locale,
} from "react-day-picker/locale";
import "react-day-picker/dist/style.css";

const LOCALE_MAP: Record<string, Locale> = {
  ar: arSA,
  en: enUS,
  ms,
  zh: zhCN,
};

type CalendarSelectorProps = {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  from?: Date;
  to?: Date;
  /** App locale for month/weekday names and RTL (e.g. "ar", "en", "ms", "zh"). */
  locale?: string;
};

export function CalendarSelector({
  selected,
  onSelect,
  from,
  to,
  locale: localeCode = "en",
}: CalendarSelectorProps) {
  const today = new Date();
  const min = from ?? today;
  const max =
    to ??
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 60,
    );

  const locale = LOCALE_MAP[localeCode] ?? enUS;
  const isRtl = localeCode === "ar";

  const style: CSSProperties = {
    ["--rdp-cell-size" as string]: "32px",
    ["--rdp-accent-color" as string]: "var(--primary)",
    ["--rdp-accent-background-color" as string]: "var(--primary)",
    ["--rdp-outline" as string]: "none",
  };

  return (
    <div
      className="mx-auto flex justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 sm:px-4 sm:py-3"
      style={style}
    >
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={[{ before: min }, { after: max }]}
        locale={locale}
        dir={isRtl ? "rtl" : "ltr"}
        className="rdp w-fit text-[11px] sm:text-xs [&_.rdp-month]:flex [&_.rdp-month]:flex-col [&_.rdp-month]:items-center [&_.rdp-month_grid]:mx-auto"
        showOutsideDays
        captionLayout="dropdown"
        classNames={{
          day_selected:
            "rdp-day rdp-day_selected bg-[var(--primary)] text-white hover:bg-[var(--primary)] hover:text-white",
          day_today:
            "rdp-day rdp-day_today border border-[var(--primary)] text-[var(--primary)]",
          nav_button:
            "rdp-nav_button text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
          caption_label:
            "rdp-caption_label text-[var(--foreground)] text-xs sm:text-sm font-medium",
          head_cell:
            "rdp-head_cell text-[10px] sm:text-[11px] text-[var(--muted-foreground)]",
        }}
      />
    </div>
  );
}

