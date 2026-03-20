"use client";

import { useState, ChangeEvent } from "react";
import { Image as ImageIcon, ScanLine, AlertCircle } from "lucide-react";
import type { Course, ParseResult, Weekday } from "@/lib/types";

interface ImageUploadZoneProps {
  onParsed: (result: ParseResult) => void;
}

type WeekValue = Weekday | null;

function normalizeWeekFromText(value: string): WeekValue {
  const raw = value.trim().toLowerCase();
  if (!raw) return null;
  if (["1", "周一", "星期一", "一", "mon", "monday"].includes(raw)) return 1;
  if (["2", "周二", "星期二", "二", "tue", "tues", "tuesday"].includes(raw))
    return 2;
  if (["3", "周三", "星期三", "三", "wed", "weds", "wednesday"].includes(raw))
    return 3;
  if (
    ["4", "周四", "星期四", "四", "thu", "thur", "thurs", "thursday"].includes(
      raw
    )
  )
    return 4;
  if (["5", "周五", "星期五", "五", "fri", "friday"].includes(raw)) return 5;
  if (["6", "周六", "星期六", "六", "sat", "saturday"].includes(raw)) return 6;
  if (
    ["7", "周日", "星期日", "周天", "日", "天", "sun", "sunday"].includes(raw)
  )
    return 7;
  const m = raw.match(/[1-7]/);
  if (m) {
    const n = Number(m[0]);
    if (n >= 1 && n <= 7) return n as Weekday;
  }
  return null;
}

function normalizeSlotRange(token: string): { start: number; end: number } | null {
  const m = token.match(/(\d+)\s*[-~]\s*(\d+)/);
  if (!m) return null;
  const start = Number(m[1]);
  const end = Number(m[2]);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end < start)
    return null;
  return { start, end };
}

export function ImageUploadZone({ onParsed }: ImageUploadZoneProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string>("");

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("请选择 PNG / JPG 等图片文件。");
      return;
    }

    setError(null);
    setIsParsing(true);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("chi_sim", 1);
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const text = data.text || "";
      setPreviewText(text);

      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const courses: Course[] = [];
      const warnings: ParseResult["warnings"] = [];

      lines.forEach((line, idx) => {
        // 期待格式类似： 高等数学 周一 1-2 一教101 张老师
        const tokens = line.split(/\s+/);
        if (tokens.length < 3) {
          warnings.push({
            type: "row_error",
            message: `第 ${idx + 1} 行无法识别为课程信息：${line}`,
            rowIndex: idx + 1
          });
          return;
        }

        const name = tokens[0];
        const weekToken = tokens[1];
        const slotToken = tokens[2];

        const day = normalizeWeekFromText(weekToken);
        const slotRange = normalizeSlotRange(slotToken);

        const classroom = tokens[3] ?? "";
        const teacher = tokens[4] ?? "";

        if (!name || day == null || !slotRange) {
          warnings.push({
            type: "row_error",
            message: `第 ${idx + 1} 行关键信息缺失或格式不正确：${line}`,
            rowIndex: idx + 1
          });
          return;
        }

        courses.push({
          id: `ocr-${Date.now().toString(36)}-${idx}`,
          name,
          day,
          startSlot: slotRange.start,
          endSlot: slotRange.end,
          classroom: classroom || undefined,
          teacher: teacher || undefined
        });
      });

      onParsed({ courses, warnings });
    } catch (err) {
      console.error(err);
      setError("识别图片失败，请尝试更清晰的课表截图。");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <ImageIcon className="h-4 w-4" />
          </span>
          <div className="text-xs">
            <p className="font-medium text-slate-800">上传课表图片（实验性）</p>
            <p className="text-[11px] text-slate-500">
              支持清晰的 PNG/JPG 课表截图，将尝试自动识别课程信息。
            </p>
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
          <ScanLine className="h-3.5 w-3.5" />
          选择图片
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {isParsing && (
        <p className="text-[11px] text-purple-600">正在识别图片中的文字…</p>
      )}

      {error && (
        <div className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-700">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}

      {previewText && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-2">
          <p className="mb-1 text-[11px] font-medium text-slate-600">
            识别结果预览（每行大致格式：课程名 星期 节次范围 教室 老师）
          </p>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all bg-white p-2 text-[11px] text-slate-700">
            {previewText}
          </pre>
        </div>
      )}
    </div>
  );
}

