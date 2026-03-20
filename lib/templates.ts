import type { ScheduleTemplate } from "./types";

export const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  {
    id: "minimal",
    name: "简约风格",
    style: "minimal",
    description: "简洁大方，适合追求极简风格的学生",
    previewColor: "#e2e8f0",
    colors: {
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
    },
    borderRadius: {
      cell: "0",
      course: "4px"
    },
    spacing: {
      cellPadding: "8px",
      gap: "4px"
    }
  },
  {
    id: "colorful",
    name: "多彩风格",
    style: "colorful",
    description: "色彩丰富，适合喜欢活泼风格的用户",
    previewColor: "#c4b5fd",
    colors: {
      background: "#faf5ff",
      headerBg: "#e9d5ff",
      headerText: "#581c87",
      gridLines: "#d8b4fe",
      cellBg: "#faf5ff",
      cellText: "#6b21a8",
      courseDefault: "#f0abfc",
      courseText: "#701a75",
      conflictBg: "#fca5a5",
      conflictText: "#7f1d1d"
    },
    borderRadius: {
      cell: "8px",
      course: "12px"
    },
    spacing: {
      cellPadding: "12px",
      gap: "8px"
    }
  },
  {
    id: "professional",
    name: "专业风格",
    style: "professional",
    description: "商务专业，适合需要正式展示的场景",
    previewColor: "#94a3b8",
    colors: {
      background: "#f8fafc",
      headerBg: "#334155",
      headerText: "#f1f5f9",
      gridLines: "#cbd5e1",
      cellBg: "#ffffff",
      cellText: "#475569",
      courseDefault: "#e2e8f0",
      courseText: "#334155",
      conflictBg: "#fecaca",
      conflictText: "#991b1b"
    },
    borderRadius: {
      cell: "2px",
      course: "4px"
    },
    spacing: {
      cellPadding: "10px",
      gap: "6px"
    }
  },
  {
    id: "creative",
    name: "创意风格",
    style: "creative",
    description: "创意独特，适合艺术类或设计类专业学生",
    previewColor: "#fdba74",
    colors: {
      background: "#fff7ed",
      headerBg: "#ffedd5",
      headerText: "#9a3412",
      gridLines: "#fed7aa",
      cellBg: "#fff7ed",
      cellText: "#9a3412",
      courseDefault: "#fdba74",
      courseText: "#7c2d12",
      conflictBg: "#fca5a5",
      conflictText: "#7f1d1d"
    },
    borderRadius: {
      cell: "16px",
      course: "20px"
    },
    spacing: {
      cellPadding: "14px",
      gap: "10px"
    }
  },
  {
    id: "dark",
    name: "暗色风格",
    style: "dark",
    description: "深色主题，适合夜间使用或喜欢暗色界面的用户",
    previewColor: "#374151",
    colors: {
      background: "#111827",
      headerBg: "#1f2937",
      headerText: "#f9fafb",
      gridLines: "#374151",
      cellBg: "#1f2937",
      cellText: "#d1d5db",
      courseDefault: "#374151",
      courseText: "#f3f4f6",
      conflictBg: "#7f1d1d",
      conflictText: "#fca5a5"
    },
    borderRadius: {
      cell: "4px",
      course: "8px"
    },
    spacing: {
      cellPadding: "10px",
      gap: "6px"
    }
  }
];

export function getTemplateById(id: string): ScheduleTemplate | undefined {
  return SCHEDULE_TEMPLATES.find(t => t.id === id);
}

export function getDefaultTemplate(): ScheduleTemplate {
  return SCHEDULE_TEMPLATES[0];
}
