"use client";

import { useState } from "react";
import { ArrowLeft, Palette } from "lucide-react";
import Link from "next/link";
import { TemplateEditor } from "@/components/TemplateEditor";
import { TemplatePreview } from "@/components/TemplatePreview";
import type { ScheduleTemplate } from "@/lib/types";
import { getDefaultTemplate } from "@/lib/templates";

export default function EditorPage() {
  const [template, setTemplate] = useState<ScheduleTemplate>(getDefaultTemplate());

  const handleSave = (savedTemplate: ScheduleTemplate) => {
    setTemplate(savedTemplate);
    localStorage.setItem("custom-template", JSON.stringify(savedTemplate));
    alert("模板已保存！");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link
            href="/templates"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            返回模板库
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">创建自定义模板</h1>
          <p className="mt-2 text-slate-600">
            设计您自己的课表模板，打造独一无二的课程表
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <TemplateEditor template={template} onSave={handleSave} />
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">实时预览</h2>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <TemplatePreview template={template} className="shadow-sm" />
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">模板名称</span>
                  <span className="font-medium text-slate-900">{template.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">风格</span>
                  <span className="font-medium text-slate-900">{template.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">描述</span>
                  <span className="font-medium text-slate-900 text-right max-w-[60%]">
                    {template.description}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
