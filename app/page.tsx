"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { UploadZone } from "@/components/UploadZone";
import { ImageUploadZone } from "@/components/ImageUploadZone";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { TemplateSelector } from "@/components/TemplateSelector";
import type { Course, ParseResult, ScheduleTemplate } from "@/lib/types";
import { exportCoursesToWorkbook } from "@/lib/excel-parser";
import { getDefaultTemplate, SCHEDULE_TEMPLATES } from "@/lib/templates";
import { getAllTemplates } from "@/lib/excelTemplateLoader";
import * as XLSX from "xlsx";
import { Download, Trash2, AlertTriangle, ImageDown, Palette } from "lucide-react";

const STORAGE_KEY = "schedule-courses-v1";

const TEMPLATE_STORAGE_KEY = "schedule-template-v1";

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [warnings, setWarnings] = useState<ParseResult["warnings"]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null);
  const [allTemplates, setAllTemplates] = useState<ScheduleTemplate[]>(SCHEDULE_TEMPLATES);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Course[] = JSON.parse(raw);
        setCourses(parsed);
      }
      
      // 加载系统预设模板和Excel模板
      const loadTemplates = async () => {
        try {
          const templates = await getAllTemplates(SCHEDULE_TEMPLATES);
          setAllTemplates(templates);
        } catch (error) {
          console.error("加载模板失败:", error);
        }
      };

      loadTemplates();

      // 加载用户选择的模板
      const templateRaw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);

      if (templateRaw) {
        const parsed = JSON.parse(templateRaw);
        setSelectedTemplate(parsed);
      } else {
        setSelectedTemplate(getDefaultTemplate());
      }
    } catch (e) {
      console.error("读取 localStorage 失败", e);
      setSelectedTemplate(getDefaultTemplate());
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    } catch (e) {
      console.error("写入 localStorage 失败", e);
    }
  }, [courses, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || !selectedTemplate) return;
    try {
      window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(selectedTemplate));
    } catch (e) {
      console.error("写入模板 localStorage 失败", e);
    }
  }, [selectedTemplate, hasHydrated]);

  const handleParsed = (result: ParseResult) => {
    setCourses(result.courses);
    setWarnings(result.warnings);
  };

  const handleClear = () => {
    setCourses([]);
    setWarnings([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = () => {
    if (courses.length === 0) return;
    const wb = exportCoursesToWorkbook(courses);
    XLSX.writeFile(wb, "我的课表.xlsx");
  };

  const handleExportImage = async () => {
    if (!gridRef.current || courses.length === 0) return;
    setExportingImage(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const bgColor = selectedTemplate?.colors.background || "#f8fafc";
      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true
      });
      const url = canvas.toDataURL("image/png");

      // 在新标签页直接写入完整 HTML，避免某些情况下 DOM 操作被拦截
      const win = window.open("");
      if (win) {
        win.document.open();
        win.document.write(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>我的课表</title>
    <style>
      body { margin: 0; background: ${bgColor}; display:flex; align-items:center; justify-content:center; min-height:100vh; }
      img { max-width: 100%; height: auto; display:block; box-shadow: 0 10px 30px rgba(15,23,42,0.18); border-radius: 12px; }
    </style>
  </head>
  <body>
    <img src="${url}" alt="我的课表" />
  </body>
</html>`);
        win.document.close();
      }
    } catch (e) {
      console.error(e);
      alert("导出课表图片失败，请重试。");
    } finally {
      setExportingImage(false);
    }
  };

  const hasConflictWarning = useMemo(
    () => warnings.some((w) => w.type === "conflict"),
    [warnings]
  );

  const rowCount = useMemo(
    () =>
      courses.reduce((max, c) => (c.endSlot > max ? c.endSlot : max), 10),
    [courses]
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            学生课程表管理系统
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            上传 Excel 或课表图片，自动生成周课表，支持本地保存与导出。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            allTemplates={allTemplates}
          />
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            <Palette className="h-3.5 w-3.5" />
            查看更多模板
          </Link>
          <button
            type="button"
            onClick={handleExport}
            disabled={courses.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            <Download className="h-3.5 w-3.5" />
            导出课表 Excel
          </button>
          <button
            type="button"
            onClick={handleExportImage}
            disabled={courses.length === 0 || exportingImage}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            <ImageDown className="h-3.5 w-3.5" />
            {exportingImage ? "正在导出..." : "导出课表图片"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={courses.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空课表
          </button>
        </div>
      </header>
      <section className="mb-5 space-y-4">
        <UploadZone onParsed={handleParsed} />
        <ImageUploadZone onParsed={handleParsed} />
        {warnings.length > 0 && (
          <div className="mt-3 space-y-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>导入提示</span>
            </div>
            <ul className="list-inside list-disc space-y-0.5">
              {warnings.map((w, idx) => (
                <li key={idx}>{w.message}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section className="flex-1 space-y-3">
        {courses.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center text-sm text-slate-500">
            <p className="font-medium text-slate-600">暂无课表数据</p>
            <p className="mt-1 text-xs text-slate-500">
              请先上传 Excel 模板文件，系统会自动解析并渲染为周课表。
            </p>
          </div>
        ) : (
          <>
            {hasConflictWarning && (
              <p className="text-xs text-red-600">
                已自动高亮标记存在时间冲突的课程（红色），请核对后调整 Excel。
              </p>
            )}
            <ScheduleGrid ref={gridRef} courses={courses} maxSlot={rowCount} template={selectedTemplate} />
          </>
        )}
      </section>
      <footer className="mt-6 border-t border-slate-200 pt-3 text-center text-[11px] text-slate-400">
        本项目基于 Next.js 14 + TypeScript + Tailwind CSS，可一键部署到 Vercel。
      </footer>
    </main>
  );
}

