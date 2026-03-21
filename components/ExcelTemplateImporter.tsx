
"use client";

import { useState } from "react";
import { Upload, Check, AlertCircle, Loader2 } from "lucide-react";
import { processMultipleExcelFiles } from "@/lib/excelTemplateUtils";
import type { ScheduleTemplate } from "@/lib/types";

interface ExcelTemplateImporterProps {
  onTemplatesImported: (templates: ScheduleTemplate[]) => void;
}

export default function ExcelTemplateImporter({ onTemplatesImported }: ExcelTemplateImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    templates: ScheduleTemplate[];
  } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    setImportResults(null);

    try {
      const templates = await processMultipleExcelFiles(files);

      setImportResults({
        success: templates.length,
        failed: files.length - templates.length,
        templates
      });

      if (templates.length > 0) {
        onTemplatesImported(templates);
      }
    } catch (error) {
      console.error("批量导入失败:", error);
      setImportResults({
        success: 0,
        failed: files.length,
        templates: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">批量导入Excel模板</h3>
        <label className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              处理中...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              选择Excel文件
            </>
          )}
          <input
            type="file"
            accept=".xlsx,.xls"
            multiple
            onChange={handleFileSelect}
            disabled={isProcessing}
            className="hidden"
          />
        </label>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-medium text-slate-900">Excel文件格式说明：</h4>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>支持多种格式，系统会自动识别Excel结构</li>
          <li><strong>标准格式</strong>：第一行模板信息，第二行颜色配置，第三行列标题，后续课程数据</li>
          <li><strong>简化格式</strong>：第一行列标题，后续课程数据（使用默认样式）</li>
          <li><strong>自定义格式</strong>：系统自动识别列标题，支持任意列顺序</li>
          <li>支持的列名：课程名称/课程名、星期、开始节次/开始、结束节次/结束、教室/地点、教师/老师、颜色</li>
          <li>如果缺少模板信息，将使用文件名作为模板名称</li>
        </ul>
      </div>

      {importResults && (
        <div className={`rounded-lg border p-4 ${
          importResults.success > 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        }`}>
          <div className="flex items-start gap-3">
            {importResults.success > 0 ? (
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="text-sm font-medium text-slate-900">导入结果</h4>
              <p className="mt-1 text-sm text-slate-600">
                成功导入 {importResults.success} 个模板，
                {importResults.failed > 0 && ` 失败 ${importResults.failed} 个`}
              </p>
              {importResults.templates.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-slate-700 mb-2">已导入的模板：</h5>
                  <div className="space-y-1">
                    {importResults.templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <div
                          className="h-4 w-4 rounded"
                          style={{ backgroundColor: template.previewColor }}
                        />
                        {template.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
