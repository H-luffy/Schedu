"use client";

import { useState } from "react";
import { Save, Download, Upload, Palette } from "lucide-react";
import type { ScheduleTemplate } from "@/lib/types";
import { getDefaultTemplate } from "@/lib/templates";

interface TemplateEditorProps {
  template?: ScheduleTemplate;
  onSave?: (template: ScheduleTemplate) => void;
}

export function TemplateEditor({ template = getDefaultTemplate(), onSave }: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<ScheduleTemplate>(template);

  const handleColorChange = (key: keyof ScheduleTemplate["colors"], value: string) => {
    setEditedTemplate((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
  };

  const handleSpacingChange = (key: keyof ScheduleTemplate["spacing"], value: string) => {
    setEditedTemplate((prev) => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }));
  };

  const handleBorderRadiusChange = (key: keyof ScheduleTemplate["borderRadius"], value: string) => {
    setEditedTemplate((prev) => ({
      ...prev,
      borderRadius: {
        ...prev.borderRadius,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave?.(editedTemplate);
  };

  const downloadTemplate = () => {
    const dataStr = JSON.stringify(editedTemplate, null, 2);
    const dataUri = "data:application/json;charset=utf-8,"+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `schedule-template-${editedTemplate.id}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as ScheduleTemplate;
        if (imported.id && imported.name && imported.colors) {
          setEditedTemplate(imported);
          alert("模板导入成功！");
        } else {
          alert("无效的模板格式");
        }
      } catch (error) {
        alert("解析模板文件失败");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">模板编辑器</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer">
            <Upload className="h-4 w-4" />
            导入模板
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplate}
              className="hidden"
            />
          </label>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            下载模板
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
          >
            <Save className="h-4 w-4" />
            保存模板
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">基本信息</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">模板名称</label>
                <input
                  type="text"
                  value={editedTemplate.name}
                  onChange={(e) => setEditedTemplate((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">模板描述</label>
                <textarea
                  value={editedTemplate.description}
                  onChange={(e) => setEditedTemplate((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">颜色设置</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">背景色</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedTemplate.colors.background}
                      onChange={(e) => handleColorChange("background", e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editedTemplate.colors.background}
                      onChange={(e) => handleColorChange("background", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">表头背景</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedTemplate.colors.headerBg}
                      onChange={(e) => handleColorChange("headerBg", e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editedTemplate.colors.headerBg}
                      onChange={(e) => handleColorChange("headerBg", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">表头文字</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedTemplate.colors.headerText}
                      onChange={(e) => handleColorChange("headerText", e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editedTemplate.colors.headerText}
                      onChange={(e) => handleColorChange("headerText", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">网格线</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedTemplate.colors.gridLines}
                      onChange={(e) => handleColorChange("gridLines", e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editedTemplate.colors.gridLines}
                      onChange={(e) => handleColorChange("gridLines", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">单元格背景</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedTemplate.colors.cellBg}
                      onChange={(e) => handleColorChange("cellBg", e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editedTemplate.colors.cellBg}
                      onChange={(e) => handleColorChange("cellBg", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">单元格文字</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedTemplate.colors.cellText}
                      onChange={(e) => handleColorChange("cellText", e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editedTemplate.colors.cellText}
                      onChange={(e) => handleColorChange("cellText", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">课程默认背景</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedTemplate.colors.courseDefault}
                      onChange={(e) => handleColorChange("courseDefault", e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editedTemplate.colors.courseDefault}
                      onChange={(e) => handleColorChange("courseDefault", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">课程文字</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedTemplate.colors.courseText}
                      onChange={(e) => handleColorChange("courseText", e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editedTemplate.colors.courseText}
                      onChange={(e) => handleColorChange("courseText", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">冲突背景</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedTemplate.colors.conflictBg}
                      onChange={(e) => handleColorChange("conflictBg", e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editedTemplate.colors.conflictBg}
                      onChange={(e) => handleColorChange("conflictBg", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">冲突文字</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedTemplate.colors.conflictText}
                      onChange={(e) => handleColorChange("conflictText", e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editedTemplate.colors.conflictText}
                      onChange={(e) => handleColorChange("conflictText", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">样式设置</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">单元格圆角</label>
                  <input
                    type="text"
                    value={editedTemplate.borderRadius?.cell || "0"}
                    onChange={(e) => handleBorderRadiusChange("cell", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">课程块圆角</label>
                  <input
                    type="text"
                    value={editedTemplate.borderRadius?.course || "0"}
                    onChange={(e) => handleBorderRadiusChange("course", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">单元格内边距</label>
                  <input
                    type="text"
                    value={editedTemplate.spacing?.cellPadding || "8px"}
                    onChange={(e) => handleSpacingChange("cellPadding", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">单元格间距</label>
                  <input
                    type="text"
                    value={editedTemplate.spacing?.gap || "4px"}
                    onChange={(e) => handleSpacingChange("gap", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="sticky top-8">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">实时预览</h3>
            <div
              className="overflow-hidden rounded-2xl border-2 border-slate-200 shadow-lg"
              style={{ backgroundColor: editedTemplate.colors.background }}
            >
              <div
                className="border-b px-4 py-3"
                style={{
                  backgroundColor: editedTemplate.colors.headerBg,
                  color: editedTemplate.colors.headerText,
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
                        backgroundColor: editedTemplate.colors.headerBg,
                        color: editedTemplate.colors.headerText,
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
                        backgroundColor: editedTemplate.colors.courseDefault,
                        color: editedTemplate.colors.courseText,
                      }}
                    >
                      示例课程 {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
