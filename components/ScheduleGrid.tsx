"use client";

import { useMemo } from "react";
import type React from "react";
import type { ScheduleGridProps, Weekday } from "@/lib/types";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

const WEEKDAY_LABELS: Record<Weekday, string> = {
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
  7: "周日"
};

function getMaxSlotFromCourses(courses: ScheduleGridProps["courses"]): number {
  return courses.reduce((max, c) => Math.max(max, c.endSlot), 10);
}

export function ScheduleGrid({ courses, maxSlot }: ScheduleGridProps) {
  const resolvedMaxSlot = useMemo(
    () => maxSlot ?? getMaxSlotFromCourses(courses),
    [courses, maxSlot]
  );
  const rows = Array.from({ length: resolvedMaxSlot }, (_, i) => i + 1);
  const days: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-4">
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <div
          className="grid min-w-[720px]"
          style={{
            // 第一列：节次；其余 7 列：周一到周日
            gridTemplateColumns: "auto repeat(7, minmax(0, 1fr))",
            // 第一行：表头；其余行为第 1~N 节
            gridTemplateRows: `40px repeat(${resolvedMaxSlot}, 64px)`
          }}
        >
          {/* 左上角表头 */}
          <div className="sticky top-0 z-10 flex items-center justify-center border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
            节次
          </div>
          {/* 表头：周几（列头） */}
          {days.map((day) => (
            <div
              key={`col-header-${day}`}
              className="sticky top-0 z-10 flex items-center justify-center border-b border-l border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
            >
              {WEEKDAY_LABELS[day]}
            </div>
          ))}
          {/* 行头：第 1~N 节（固定在最左侧这一竖列） */}
          {rows.map((slot) => (
            <div
              key={`row-label-${slot}`}
              className="flex items-center justify-center border-b border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-600"
              style={{
                gridColumnStart: 1,
                gridColumnEnd: 2,
                gridRowStart: slot + 1,
                gridRowEnd: slot + 2
              }}
            >
              第 {slot} 节
            </div>
          ))}
          {/* 背景格线：N 行 x 7 列（从第二列开始，对应周一到周日） */}
          {rows.map((slot) =>
            days.map((day) => (
              <div
                key={`cell-bg-${day}-${slot}`}
                className="relative border-b border-l border-slate-100"
                style={{
                  gridColumnStart: day + 1,
                  gridColumnEnd: day + 2,
                  gridRowStart: slot + 1,
                  gridRowEnd: slot + 2
                }}
              />
            ))
          )}

          {/* 课程卡片：按节次作为行，周几作为列 */}
          {courses.map((course) => {
            const rowStart = course.startSlot + 1; // +1 因为第 1 行是表头
            const rowEnd = course.endSlot + 2;
            const colStart = course.day + 1; // +1 因为第 1 列是节次
            const colEnd = course.day + 2;
            const bg = course.color || "#dbeafe";
            return (
              <div
                key={course.id}
                className={twMerge(
                  "relative m-0.5 flex min-h-0 flex-col overflow-hidden rounded-lg border text-xs shadow-sm",
                  clsx(
                    "border-transparent text-slate-900",
                    course.isConflict
                      ? "border-red-500 bg-red-50"
                      : "bg-[color:var(--course-color)]"
                  )
                )}
                style={
                  {
                    gridRowStart: rowStart,
                    gridRowEnd: rowEnd,
                    gridColumnStart: colStart,
                    gridColumnEnd: colEnd,
                    "--course-color": bg
                  } as React.CSSProperties
                }
              >
                <div className="flex-1 px-2.5 py-2">
                  <p className="truncate text-xs font-semibold">
                    {course.name}
                  </p>
                  {course.classroom && (
                    <p className="mt-0.5 truncate text-[11px] text-slate-700">
                      {course.classroom}
                    </p>
                  )}
                  {course.teacher && (
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {course.teacher}
                    </p>
                  )}
                </div>
                <div className="border-t border-white/40 bg-black/5 px-2 py-0.5 text-[10px] text-slate-700">
                  第 {course.startSlot}-{course.endSlot} 节
                  {course.isConflict && (
                    <span className="ml-1 rounded-full bg-red-500/90 px-1 text-[9px] font-semibold text-white">
                      冲突
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="space-y-3 md:hidden">
        {days.map((day) => {
          const dayCourses = courses
            .filter((c) => c.day === day)
            .sort((a, b) => a.startSlot - b.startSlot);
          return (
            <div
              key={`mobile-day-${day}`}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-800">
                  {WEEKDAY_LABELS[day]}
                </p>
                <p className="text-[11px] text-slate-500">
                  {dayCourses.length > 0
                    ? `${dayCourses.length} 门课程`
                    : "无课程"}
                </p>
              </div>
              <div className="mt-1.5 space-y-2">
                {dayCourses.map((course) => (
                  <div
                    key={course.id}
                    className={twMerge(
                      "flex flex-col rounded-lg border px-2.5 py-1.5 text-xs",
                      course.isConflict
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold">{course.name}</p>
                      <span className="shrink-0 text-[11px] text-slate-600">
                        第 {course.startSlot}-{course.endSlot} 节
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600">
                      {course.classroom && <span>{course.classroom}</span>}
                      {course.teacher && <span>{course.teacher}</span>}
                      {course.isConflict && (
                        <span className="rounded-full bg-red-500/90 px-1 text-[10px] font-semibold text-white">
                          冲突
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {dayCourses.length === 0 && (
                  <p className="py-1 text-[11px] text-slate-400">暂无课程</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

