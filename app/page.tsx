"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { TemplateSelector } from "@/components/TemplateSelector";
import { CourseEditor } from "@/components/CourseEditor";
import type { Course, ParseResult, ScheduleTemplate } from "@/lib/types";
import { exportCoursesToWorkbook } from "@/lib/excel-parser";
import { getDefaultTemplate, SCHEDULE_TEMPLATES } from "@/lib/templates";
import { getAllTemplates } from "@/lib/excelTemplateLoader";
import * as XLSX from "xlsx";
import { Download, Trash2, AlertTriangle, FileText, Edit3, ImageDown } from "lucide-react";

const STORAGE_KEY = "schedule-courses-v1";

const TEMPLATE_STORAGE_KEY = "schedule-template-v1";

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [warnings, setWarnings] = useState<ParseResult["warnings"]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null);
  const [allTemplates, setAllTemplates] = useState<ScheduleTemplate[]>(SCHEDULE_TEMPLATES);
  const [activeTab, setActiveTab] = useState<"import" | "edit">("import");
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
      
      // 确保在导出前等待所有内容渲染完成
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 获取桌面版的课表元素（第一个子div）
      const desktopGrid = gridRef.current.querySelector('.overflow-x-auto') as HTMLElement;
      
      if (!desktopGrid) {
        throw new Error("找不到课表元素");
      }
      
      // 临时移除hidden类以进行截图
      const originalDisplay = desktopGrid.style.display;
      desktopGrid.style.display = 'block';
      
      try {
        const canvas = await html2canvas(desktopGrid, {
          backgroundColor: bgColor,
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          foreignObjectRendering: false,
          imageTimeout: 5000,
          removeContainer: true,
          onclone: (clonedDoc) => {
            // 在克隆的文档中优化样式
            const grid = clonedDoc.querySelector('.grid') as HTMLElement;
            if (grid) {
              // 确保grid布局正确
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = 'auto repeat(7, minmax(0, 1fr))';
              // 确保文字完整显示
              const allElements = grid.querySelectorAll('*');
              allElements.forEach((el: any) => {
                el.style.overflow = 'visible';
                el.style.lineHeight = '1.5';
              });
            }
          }
        });
        
        const url = canvas.toDataURL("image/png");

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `我的课表_${new Date().toLocaleDateString()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        // 恢复原始显示状态
        desktopGrid.style.display = originalDisplay;
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
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 pb-6 pt-4 sm:px-4 lg:px-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:h-12 sm:w-12">
            <FileText className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
              学生课程表管理系统
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-sm">
              上传 Excel 或手动编辑课程，自动生成周课表
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            allTemplates={allTemplates}
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={courses.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-xs font-medium text-white shadow-md transition-all hover:shadow-lg hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">导出 Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
          <button
            type="button"
            onClick={handleExportImage}
            disabled={courses.length === 0 || exportingImage}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-2 text-xs font-medium text-white shadow-md transition-all hover:shadow-lg hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <ImageDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{exportingImage ? "导出中..." : "导出图片"}</span>
            <span className="sm:hidden">{exportingImage ? "导出中" : "图片"}</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={courses.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-md transition-all hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-700 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">清空</span>
            <span className="sm:hidden">清空</span>
          </button>
        </div>
      </header>
      <section className="mb-5 space-y-3 sm:mb-6 sm:space-y-4">
        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("import")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
              activeTab === "import"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            导入课表
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
              activeTab === "edit"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            手动编辑
          </button>
        </div>

        {activeTab === "import" && (
          <>
            <UploadZone onParsed={handleParsed} />
            {warnings.length > 0 && (
              <div className="mt-3 space-y-1.5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2.5 text-xs text-amber-800 sm:mt-4 sm:space-y-2 sm:px-4 sm:py-3 sm:text-sm">
                <div className="flex items-center gap-1.5 font-semibold sm:gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>导入提示</span>
                </div>
                <ul className="ml-5 list-outside list-disc space-y-0.5 sm:ml-6 sm:space-y-1">
                  {warnings.map((w, idx) => (
                    <li key={idx}>{w.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {activeTab === "edit" && (
          <CourseEditor courses={courses} onCoursesChange={setCourses} />
        )}
      </section>
      <section className="flex-1 space-y-3 sm:space-y-4">
        {courses.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 text-center sm:h-80">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 sm:mb-4 sm:h-16 sm:w-16">
              <FileText className="h-7 w-7 text-blue-600 sm:h-8 sm:w-8" />
            </div>
            <p className="text-sm font-semibold text-slate-700 sm:text-base">暂无课表数据</p>
            <p className="mt-1.5 max-w-md px-2 text-xs text-slate-500 sm:mt-2 sm:px-4 sm:text-sm">
              请先上传 Excel 模板文件或手动添加课程，系统会自动解析并渲染为周课表
            </p>
          </div>
        ) : (
          <>
            {hasConflictWarning && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 sm:mt-0 sm:h-4 sm:w-4" />
                <p>已自动高亮标记存在时间冲突的课程（红色），请核对后调整</p>
              </div>
            )}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <div className="min-w-[600px] p-3 sm:p-4 md:p-6">
                  <ScheduleGrid ref={gridRef} courses={courses} maxSlot={rowCount} template={selectedTemplate} />
                </div>
              </div>
            </div>
          </>
        )}
      </section>
      <footer className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500 sm:mt-8 sm:pt-6 sm:text-sm">
        <p className="mb-1 sm:mb-2">本项目基于 Next.js 14 + TypeScript + Tailwind CSS 构建</p>
        <p className="text-[10px] text-slate-400 sm:text-xs">可一键部署到 Vercel</p>
      </footer>
    </main>
  );
}

