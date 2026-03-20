"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { SCHEDULE_TEMPLATES, getTemplateById, getDefaultTemplate } from "@/lib/templates";
import type { ScheduleTemplate } from "@/lib/types";
import { TemplatePreview } from "@/components/TemplatePreview";

interface TemplateSelectorProps {
  selectedTemplate?: ScheduleTemplate;
  onTemplateChange: (template: ScheduleTemplate) => void;
  allTemplates?: ScheduleTemplate[];
}

export function TemplateSelector({ selectedTemplate, onTemplateChange, allTemplates }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTemplate = selectedTemplate || getDefaultTemplate();
  const templates = allTemplates || SCHEDULE_TEMPLATES;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <Palette className="h-4 w-4" />
        <span>模板风格</span>
        <div
          className="h-4 w-4 rounded-full border border-slate-200"
          style={{ backgroundColor: currentTemplate.previewColor }}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">选择课表模板</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      onTemplateChange(template);
                      setIsOpen(false);
                    }}
                    className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                      currentTemplate.id === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{template.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{template.description}</p>
                      </div>
                      <div className="w-24 shrink-0">
                        <TemplatePreview template={template} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
