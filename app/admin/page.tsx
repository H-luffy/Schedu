
"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Check, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import ExcelTemplateImporter from "@/components/ExcelTemplateImporter";
import type { ScheduleTemplate } from "@/lib/types";

export default function AdminPage() {
  const [importedTemplates, setImportedTemplates] = useState<ScheduleTemplate[]>([]);

  const handleTemplatesImported = (templates: ScheduleTemplate[]) => {
    setImportedTemplates(prev => [...prev, ...templates]);
  };

  const handleSaveTemplates = () => {
    // 将导入的模板保存到服务器或localStorage
    // 这里可以根据实际需求选择存储方式
    const templatesJson = JSON.stringify(importedTemplates, null, 2);

    // 创建下载链接
    const blob = new Blob([templatesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'excel-templates.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`已导出 ${importedTemplates.length} 个模板，请将此文件放到项目的 lib/templates 目录中`);
  };

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
          <h1 className="text-3xl font-bold text-slate-900">模板管理</h1>
          <p className="mt-2 text-slate-600">
            批量导入Excel课表模板到系统模板库
          </p>
        </header>

        <div className="space-y-6">
          <ExcelTemplateImporter onTemplatesImported={handleTemplatesImported} />

          {importedTemplates.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  已导入的模板 ({importedTemplates.length})
                </h3>
                <button
                  onClick={handleSaveTemplates}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
                >
                  <Upload className="h-4 w-4" />
                  导出模板配置
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {importedTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-12 w-12 shrink-0 rounded-xl shadow-sm"
                        style={{ backgroundColor: template.previewColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {template.name}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
