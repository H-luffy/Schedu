"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check, Palette, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { SCHEDULE_TEMPLATES, getDefaultTemplate } from "@/lib/templates";
import { getAllTemplates } from "@/lib/excelTemplateLoader";
import type { ScheduleTemplate } from "@/lib/types";

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate>(getDefaultTemplate());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [allTemplates, setAllTemplates] = useState<ScheduleTemplate[]>(SCHEDULE_TEMPLATES);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
  };

  // 加载Excel模板
  useEffect(() => {
    const loadExcelTemplates = async () => {
      setIsLoading(true);
      try {
        const templates = await getAllTemplates(SCHEDULE_TEMPLATES);
        setAllTemplates(templates);
      } catch (error) {
        console.error("加载Excel模板失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExcelTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">课表模板库</h1>
          <p className="mt-2 text-slate-600">
            选择您喜欢的模板风格，打造个性化的课程表
          </p>
        </header>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">所有模板</h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                加载Excel模板中...
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {allTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedTemplate.id === template.id
                      ? "border-blue-500 shadow-lg"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="h-12 w-12 shrink-0 rounded-xl shadow-sm"
                          style={{ backgroundColor: template.previewColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-slate-900">
                            {template.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      {selectedTemplate.id === template.id && (
                        <div className="rounded-full bg-blue-500 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={(e) => toggleFavorite(e, template.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          favorites.has(template.id)
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${
                            favorites.has(template.id) ? "fill-current" : ""
                          }`}
                        />
                        {favorites.has(template.id) ? "已收藏" : "收藏"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">模板预览</h3>
              <div
                className="overflow-hidden rounded-2xl border-2 border-slate-200 shadow-lg"
                style={{ backgroundColor: selectedTemplate.colors.background }}
              >
                <div
                  className="border-b px-4 py-3"
                  style={{
                    backgroundColor: selectedTemplate.colors.headerBg,
                    color: selectedTemplate.colors.headerText,
                  }}
                >
                  <div className="text-sm font-semibold">课程表预览</div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {["周一", "周二", "周三", "周四", "周五", "周六"].map((day) => (
                      <div
                        key={day}
                        className="rounded px-2 py-1 text-center text-xs font-medium"
                        style={{
                          backgroundColor: selectedTemplate.colors.headerBg,
                          color: selectedTemplate.colors.headerText,
                        }}
                      >
                        {day}
                      </div>
                    ))}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="rounded p-2 text-xs"
                        style={{
                          backgroundColor: selectedTemplate.colors.courseDefault,
                          color: selectedTemplate.colors.courseText,
                        }}
                      >
                        示例课程 {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">模板信息</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">名称</dt>
                    <dd className="font-medium text-slate-900">{selectedTemplate.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">风格</dt>
                    <dd className="font-medium text-slate-900">{selectedTemplate.style}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">描述</dt>
                    <dd className="font-medium text-slate-900 text-right">
                      {selectedTemplate.description}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
