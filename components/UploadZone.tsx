"use client";

import { useState, DragEvent, ChangeEvent } from "react";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { parseExcelFile, generateTemplateWorkbook } from "@/lib/excel-parser";
import type { ParseResult } from "@/lib/types";

interface UploadZoneProps {
  onParsed: (result: ParseResult) => void;
}

export function UploadZone({ onParsed }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls"].includes(ext)) {
      setError("仅支持上传 .xlsx 或 .xls 格式的 Excel 文件。");
      return;
    }
    setError(null);
    setIsParsing(true);
    try {
      const result = await parseExcelFile(file);
      onParsed(result);
    } catch (e) {
      console.error(e);
      setError("解析 Excel 文件失败，请确认文件格式是否符合模板。");
    } finally {
      setIsParsing(false);
    }
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDownloadTemplate = () => {
    const wb = generateTemplateWorkbook();
    XLSX.writeFile(wb, "课程表模板.xlsx");
  };

  return (
    <div className="space-y-3">
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragActive
            ? "border-brand bg-blue-50/70"
            : "border-slate-300 bg-white/70"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          id="excel-upload"
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={onChange}
        />
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-brand">
          <Upload className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-slate-900">
          拖拽 Excel 文件到此处，或点击选择文件上传
        </p>
        <p className="mt-1 text-xs text-slate-500">
          支持 .xlsx / .xls，表头：课程名称, 星期(1-7), 开始节次, 结束节次, 教室, 教师, 颜色(可选)
        </p>
        {isParsing && (
          <p className="mt-2 text-xs text-blue-600">正在解析课程表，请稍候…</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          下载 Excel 模板
        </button>
        {error && (
          <div className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

