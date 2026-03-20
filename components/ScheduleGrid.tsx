"use client";

import { forwardRef, useMemo } from "react";
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

export const ScheduleGrid = forwardRef<HTMLDivElement, ScheduleGridProps>(
  ({ courses, maxSlot, template }, ref) => {
  const resolvedMaxSlot = useMemo(
    () => maxSlot ?? getMaxSlotFromCourses(courses),
    [courses, maxSlot]
  );
  const rows = Array.from({ length: resolvedMaxSlot }, (_, i) => i + 1);
  const days: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

  // 使用模板样式或默认样式
  const templateStyle = template?.colors || {
    background: "#ffffff",
    headerBg: "#f8fafc",
    headerText: "#1e293b",
    gridLines: "#e2e8f0",
    cellBg: "#ffffff",
    cellText: "#64748b",
    courseDefault: "#dbeafe",
    courseText: "#1e3a8a",
    conflictBg: "#fee2e2",
    conflictText: "#991b1b"
  };

  const borderRadius = template?.borderRadius || {
    cell: "0",
    course: "4px"
  };

  const spacing = template?.spacing || {
    cellPadding: "8px",
    gap: "4px"
  };

  return (
    <div className="space-y-4" ref={ref}>
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <div
          className="grid min-w-[720px]"
          style={{
            // 第一列：节次；其余 7 列：周一到周日
            gridTemplateColumns: "auto repeat(7, minmax(0, 1fr))",
            // 第一行：表头；其余行为第 1~N 节
            gridTemplateRows: `40px repeat(${resolvedMaxSlot}, 64px)`,
            backgroundColor: templateStyle.background,
            gap: spacing.gap
          }}
        >
          {/* 左上角表头 */}
          <div 
            className="sticky top-0 z-10 flex items-center justify-center border-b text-xs font-medium"
            style={{
              backgroundColor: templateStyle.headerBg,
              color: templateStyle.headerText,
              borderColor: templateStyle.gridLines,
              borderRadius: borderRadius.cell
            }}
          >
            节次
          </div>
          {/* 表头：周几（列头） */}
          {days.map((day) => (
            <div
              key={`col-header-${day}`}
              className="sticky top-0 z-10 flex items-center justify-center border-b border-l text-xs font-medium"
              style={{
                backgroundColor: templateStyle.headerBg,
                color: templateStyle.headerText,
                borderColor: templateStyle.gridLines,
                borderRadius: borderRadius.cell
              }}
            >
              {WEEKDAY_LABELS[day]}
            </div>
          ))}
          {/* 行头：第 1~N 节（固定在最左侧这一竖列） */}
          {rows.map((slot) => (
            <div
              key={`row-label-${slot}`}
              className="flex items-center justify-center border-b text-[11px] font-medium"
              style={{
                backgroundColor: templateStyle.cellBg,
                color: templateStyle.cellText,
                borderColor: templateStyle.gridLines,
                borderRadius: borderRadius.cell,
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
                className="relative border-b border-l"
                style={{
                  backgroundColor: templateStyle.cellBg,
                  borderColor: templateStyle.gridLines,
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
            const bg = course.color || templateStyle.courseDefault;
            const isConflict = course.isConflict;
            return (
              <div
                key={course.id}
                className="relative m-0.5 flex min-h-0 flex-col overflow-hidden border text-xs shadow-sm"
                style={{
                  gridRowStart: rowStart,
                  gridRowEnd: rowEnd,
                  gridColumnStart: colStart,
                  gridColumnEnd: colEnd,
                  backgroundColor: isConflict ? templateStyle.conflictBg : bg,
                  color: isConflict ? templateStyle.conflictText : templateStyle.courseText,
                  borderColor: isConflict ? templateStyle.conflictText : "transparent",
                  borderRadius: borderRadius.course,
                  padding: spacing.cellPadding
                }}
              >
                <div className="flex-1">
                  <p className="truncate text-xs font-semibold">
                    {course.name}
                  </p>
                  {course.classroom && (
                    <p className="mt-0.5 truncate text-[11px]">
                      {course.classroom}
                    </p>
                  )}
                  {course.teacher && (
                    <p className="mt-0.5 truncate text-[11px]">
                      {course.teacher}
                    </p>
                  )}
                </div>
                <div className="mt-1 border-t px-1 py-0.5 text-[10px] opacity-70">
                  第 {course.startSlot}-{course.endSlot} 节
                  {isConflict && (
                    <span className="ml-1 rounded-full px-1 text-[9px] font-semibold" style={{
                      backgroundColor: templateStyle.conflictText,
                      color: templateStyle.conflictBg
                    }}>
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
              className="rounded-xl border px-3 py-2 shadow-sm"
              style={{
                backgroundColor: templateStyle.background,
                borderColor: templateStyle.gridLines
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: templateStyle.headerText }}>
                  {WEEKDAY_LABELS[day]}
                </p>
                <p className="text-[11px]" style={{ color: templateStyle.cellText }}>
                  {dayCourses.length > 0
                    ? `${dayCourses.length} 门课程`
                    : "无课程"}
                </p>
              </div>
              <div className="mt-1.5 space-y-2">
                {dayCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col rounded-lg border px-2.5 py-1.5 text-xs"
                    style={{
                      backgroundColor: course.isConflict ? templateStyle.conflictBg : (course.color || templateStyle.courseDefault),
                      borderColor: course.isConflict ? templateStyle.conflictText : templateStyle.gridLines,
                      color: course.isConflict ? templateStyle.conflictText : templateStyle.courseText,
                      borderRadius: borderRadius.course
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold">{course.name}</p>
                      <span className="shrink-0 text-[11px]">
                        第 {course.startSlot}-{course.endSlot} 节
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                      {course.classroom && <span>{course.classroom}</span>}
                      {course.teacher && <span>{course.teacher}</span>}
                      {course.isConflict && (
                        <span className="rounded-full px-1 text-[10px] font-semibold" style={{
                          backgroundColor: templateStyle.conflictText,
                          color: templateStyle.conflictBg
                        }}>
                          冲突
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {dayCourses.length === 0 && (
                  <p className="py-1 text-[11px]" style={{ color: templateStyle.cellText }}>暂无课程</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ScheduleGrid.displayName = "ScheduleGrid";

