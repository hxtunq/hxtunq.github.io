/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo, useState } from "react";
import { blogPosts } from "../lib/blog-loader";
import { notesPosts } from "../lib/notes-loader";
import { newsItems } from "../lib/news-loader";

interface ActivityItem {
  type: "Blog Post" | "Note" | "Update";
  title: string;
  date: string; // YYYY-MM-DD
}

function parseToISODate(dateVal?: string | number): string | null {
  if (!dateVal) return null;
  if (typeof dateVal === "number") return null;

  const str = String(dateVal).trim();
  
  // 1. Exact match for YYYY-MM-DD or ISO timestamp (e.g. "2026-08-25T10:00:00Z")
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // 2. Standard Date string parse (e.g. "Aug 22, 2026")
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return null;
}

interface ActivityHeatmapProps {
  leftHeaderSlot?: React.ReactNode;
  leftSlot?: React.ReactNode;
  rightHeaderSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export default function ActivityHeatmap({
  leftHeaderSlot,
  leftSlot,
  rightHeaderSlot,
  rightSlot,
}: ActivityHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    formattedDate: string;
    items: ActivityItem[];
    x: number;
    y: number;
  } | null>(null);

  // Aggregate all activities from blogPosts, notesPosts, newsItems
  const { activityMap, availableYears } = useMemo(() => {
    const map = new Map<string, ActivityItem[]>();
    const yearsSet = new Set<number>([2026]);

    // 1. Blog posts
    blogPosts.forEach((post) => {
      const iso = parseToISODate(post.date) || parseToISODate(post.yamlHeader?.match(/date:\s*"([^"]+)"/)?.[1]);
      if (iso) {
        const list = map.get(iso) || [];
        list.push({ type: "Blog Post", title: post.title, date: iso });
        map.set(iso, list);
        const y = parseInt(iso.split("-")[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });

    // 2. Notes
    notesPosts.forEach((post) => {
      const iso = parseToISODate(post.createdAt);
      if (iso) {
        const list = map.get(iso) || [];
        const cleanPreview = post.content.replace(/[#*`_]/g, "").trim().slice(0, 45);
        list.push({
          type: "Note",
          title: cleanPreview ? `${cleanPreview}...` : "Quick Note",
          date: iso,
        });
        map.set(iso, list);
        const y = parseInt(iso.split("-")[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });

    // 3. News items
    newsItems.forEach((item) => {
      const iso = parseToISODate(item.createdAt) || parseToISODate(item.date);
      if (iso) {
        const list = map.get(iso) || [];
        list.push({
          type: "Update",
          title: item.content.slice(0, 45),
          date: iso,
        });
        map.set(iso, list);
        const y = parseInt(iso.split("-")[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });

    const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
    return { activityMap: map, availableYears: sortedYears };
  }, []);

  // Build Full 12-Month (53-week) Matrix for the Selected Year
  const { weeks, monthLabels } = useMemo(() => {
    // Start on Sunday of the week containing Jan 1 of selectedYear
    const firstDayOfYear = new Date(selectedYear, 0, 1);
    const startDayOfWeek = firstDayOfYear.getDay(); // 0 = Sun
    const startDate = new Date(firstDayOfYear);
    startDate.setDate(firstDayOfYear.getDate() - startDayOfWeek);

    // End on Saturday of the week containing Dec 31 of selectedYear
    const lastDayOfYear = new Date(selectedYear, 11, 31);
    const endDayOfWeek = lastDayOfYear.getDay();
    const endDate = new Date(lastDayOfYear);
    endDate.setDate(lastDayOfYear.getDate() + (6 - endDayOfWeek));

    const weeksList: {
      colIndex: number;
      days: {
        date: Date;
        iso: string;
        isFuture: boolean;
        isCurrentYear: boolean;
        activityCount: number;
        items: ActivityItem[];
      }[];
    }[] = [];

    const monthPositions: { month: string; colIndex: number }[] = [];
    const seenMonths = new Set<number>();
    let yearTotal = 0;

    const curr = new Date(startDate);
    let currentWeek: {
      date: Date;
      iso: string;
      isFuture: boolean;
      isCurrentYear: boolean;
      activityCount: number;
      items: ActivityItem[];
    }[] = [];

    let col = 0;
    const now = new Date();

    while (curr <= endDate) {
      const year = curr.getFullYear();
      const month = curr.getMonth();
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(curr.getDate()).padStart(2, "0")}`;
      const isFuture = selectedYear === now.getFullYear() ? curr > now : false;
      const isYearMatch = year === selectedYear;
      const items = activityMap.get(iso) || [];

      if (!isFuture && isYearMatch && items.length > 0) {
        yearTotal += items.length;
      }

      // Record starting column of each month in the selected year
      if (isYearMatch && !seenMonths.has(month)) {
        seenMonths.add(month);
        const monthName = curr.toLocaleString("en-US", { month: "short" });
        monthPositions.push({ month: monthName, colIndex: col });
      }

      currentWeek.push({
        date: new Date(curr),
        iso,
        isFuture,
        isCurrentYear: isYearMatch,
        activityCount: items.length,
        items,
      });

      if (currentWeek.length === 7) {
        weeksList.push({ colIndex: col, days: currentWeek });
        currentWeek = [];
        col++;
      }

      curr.setDate(curr.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeksList.push({ colIndex: col, days: currentWeek });
    }

    return { weeks: weeksList, monthLabels: monthPositions, totalContributionsYear: yearTotal };
  }, [activityMap, selectedYear]);

  // GitHub contribution color classes
  const getColorClass = (count: number, isFuture: boolean, isCurrentYear: boolean) => {
    if (!isCurrentYear || isFuture) {
      return "opacity-0 pointer-events-none";
    }
    if (count === 0) {
      return "bg-[#ebedf0] dark:bg-[#161b22] border border-[#d0d7de]/40 dark:border-[#30363d]/60 hover:ring-1 hover:ring-brand-primary";
    }
    if (count === 1) {
      return "bg-[#9be9a8] dark:bg-[#0e4429] border border-[#9be9a8] dark:border-[#006d32] hover:ring-1 hover:ring-brand-primary";
    }
    if (count === 2) {
      return "bg-[#40c463] dark:bg-[#006d32] border border-[#40c463] dark:border-[#26a641] hover:ring-1 hover:ring-brand-primary";
    }
    if (count === 3) {
      return "bg-[#30a14e] dark:bg-[#26a641] border border-[#30a14e] dark:border-[#39d353] hover:ring-1 hover:ring-brand-primary";
    }
    return "bg-[#216e39] dark:bg-[#39d353] border border-[#216e39] dark:border-[#39d353] hover:ring-1 hover:ring-brand-primary";
  };

  // Map month label by week column index for 100% exact alignment
  const monthMap = useMemo(() => {
    const map = new Map<number, string>();
    monthLabels.forEach((m) => map.set(m.colIndex, m.month));
    return map;
  }, [monthLabels]);

  return (
    <div className="w-full text-left font-sans">
      {/* Top Header line spanning both Quote (Left) & Heatmap (Right) columns */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-3 w-full">
        {/* Left Header (aligned directly above Left Card / Quote) */}
        <div className="flex-1 min-w-0 px-0.5">
          {leftHeaderSlot && leftHeaderSlot}
        </div>

        {/* Right Header (aligned directly above Heatmap card) */}
        <div className="flex items-center justify-between gap-3 w-full lg:w-[670px] lg:shrink-0 px-0.5">
          <h4 className="font-sans text-[12.5px] sm:text-[13.5px] text-brand-on-surface-variant font-medium">
            <span className="text-brand-secondary font-semibold">Recent Website Activity</span>
          </h4>

          {/* Year Selectors */}
          <div className="flex items-center gap-1.5">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-2.5 py-0.5 rounded-[0.25rem] text-[11px] sm:text-[11.5px] font-mono font-medium tracking-wide transition-colors cursor-pointer ${
                  selectedYear === year
                    ? "bg-brand-primary text-brand-surface-lowest shadow-sm"
                    : "text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface-low/80"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row containing Left Slot Card Box (Quote) & Heatmap Card Box (Right) with equal height and same top alignment */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch w-full">
        {/* Left Slot Card (Quote Card - strictly equal height and top baseline) */}
        {leftSlot && leftSlot}
        {/* GitHub Card Container */}
        <div className="w-full lg:w-[670px] lg:shrink-0 bg-brand-surface-lowest border border-brand-surface-highest rounded-md px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-sm flex flex-col justify-between">
          {/* Heatmap Grid Wrapper */}
          <div className="w-full overflow-hidden flex flex-col items-center">
            <div className="w-full max-w-full">
              {/* Month Labels aligned directly with week columns */}
              <div className="flex gap-[3px] items-center mb-2.5 sm:mb-3 text-[10px] font-mono text-brand-on-surface-variant/70 h-3.5">
                {/* Day label spacer */}
                <div className="w-6 shrink-0" />

                {/* 53 week header slots */}
                <div className="flex gap-[3px] flex-1 justify-between">
                  {weeks.map((week) => {
                    const label = monthMap.get(week.colIndex);
                    return (
                      <div
                        key={week.colIndex}
                        className="flex-1 min-w-[7px] max-w-[12px] relative flex items-center justify-start overflow-visible"
                      >
                        {label && (
                          <span className="absolute left-0 top-0 whitespace-nowrap">
                            {label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid Container (Day labels on left + 53 Week columns) */}
              <div className="flex gap-[3px] items-center w-full">
                {/* Day Labels (Mon, Wed, Fri only) */}
                <div className="flex flex-col justify-between h-[82px] sm:h-[90px] w-6 shrink-0 text-[9px] font-mono text-brand-on-surface-variant/70 py-0.5">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>

                {/* Weeks Grid (53 columns) */}
                <div className="flex gap-[3px] flex-1 justify-between">
                  {weeks.map((week) => (
                    <div key={week.colIndex} className="flex flex-col gap-[3px] flex-1 min-w-[7px] max-w-[12px]">
                      {week.days.map((day, dIdx) => {
                        const colorClass = getColorClass(day.activityCount, day.isFuture, day.isCurrentYear);
                        return (
                          <div
                            key={dIdx}
                            onMouseEnter={(e) => {
                              if (!day.isCurrentYear || day.isFuture) return;
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredDay({
                                dateStr: day.iso,
                                formattedDate: day.date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }),
                                items: day.items,
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                              });
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`aspect-square w-full rounded-[1.5px] sm:rounded-[2px] transition-colors cursor-pointer ${colorClass}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Legend & Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-brand-surface-highest/60 dark:border-[#30363d]/60 text-[11px] font-sans text-brand-on-surface-variant/80">
            <span className="text-[11px] text-brand-on-surface-variant/70">
              Activity tracked from notebooks, publications & blog posts
            </span>

            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>Less</span>
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#ebedf0] dark:bg-[#161b22] border border-[#d0d7de]/40 dark:border-[#30363d]/60" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#9be9a8] dark:bg-[#0e4429] border border-[#9be9a8] dark:border-[#006d32]" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#40c463] dark:bg-[#006d32] border border-[#40c463] dark:border-[#26a641]" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#30a14e] dark:bg-[#26a641] border border-[#30a14e] dark:border-[#39d353]" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#216e39] dark:bg-[#39d353] border border-[#216e39] dark:border-[#39d353]" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && (
        <div
          style={{
            position: "fixed",
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 8}px`,
            transform: "translate(-50%, -100%)",
          }}
          className="z-50 pointer-events-none bg-[#24292f] text-white dark:bg-[#6e7681] dark:text-[#0d1117] p-2.5 rounded shadow-xl text-xs max-w-xs whitespace-normal border border-slate-700/50 animate-fade-in"
        >
          <div className="font-mono text-[10px] font-bold border-b border-white/20 pb-1 mb-1.5 opacity-90">
            {hoveredDay.formattedDate}
          </div>
          {hoveredDay.items.length === 0 ? (
            <span className="font-sans text-[11px] opacity-80">No contributions on this date</span>
          ) : (
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-emerald-300 block mb-1">
                {hoveredDay.items.length} contribution{hoveredDay.items.length === 1 ? "" : "s"}:
              </span>
              {hoveredDay.items.map((it, i) => (
                <div key={i} className="font-sans text-[11px] leading-tight">
                  <span className="font-semibold opacity-90 font-mono text-[10px] mr-1">
                    [{it.type}]
                  </span>
                  <span>{it.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
