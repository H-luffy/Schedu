"use client";

import type { ScheduleTemplate } from "@/lib/types";

interface TemplatePreviewProps {
  template: ScheduleTemplate;
  className?: string;
}

export function TemplatePreview({ template, className = "" }: TemplatePreviewProps) {
  return (
    <div className={`overflow-hidden rounded-lg border-2 border-slate-200 ${className}`}>
      <div
        className="border-b px-3 py-2"
        style={{
          backgroundColor: template.colors.headerBg,
          color: template.colors.headerText,
        }}
      >
        <div className="text-xs font-semibold">课程表预览</div>
      </div>
      <div className="p-3" style={{ backgroundColor: template.colors.background }}>
        <div className="grid grid-cols-5 gap-1.5">
          {["一", "二", "三", "四", "五"].map((day) => (
            <div
              key={day}
              className="rounded px-1.5 py-1 text-center text-[10px] font-medium"
              style={{
                backgroundColor: template.colors.headerBg,
                color: template.colors.headerText,
              }}
            >
              {day}
            </div>
          ))}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded px-1.5 py-1 text-[10px]"
              style={{
                backgroundColor: template.colors.courseDefault,
                color: template.colors.courseText,
              }}
            >
              示例课程 {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
