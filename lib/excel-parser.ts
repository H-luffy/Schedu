"use client";

import * as XLSX from "xlsx";
import type { Course, CourseRawRow, ParseResult, Weekday } from "./types";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const WEEK_MAP: Record<string, Weekday> = {
  "1": 1,
  "周一": 1,
  "星期一": 1,
  "mon": 1,
  "monday": 1,
  "一": 1,
  "2": 2,
  "周二": 2,
  "星期二": 2,
  "tue": 2,
  "tues": 2,
  "tuesday": 2,
  "二": 2,
  "3": 3,
  "周三": 3,
  "星期三": 3,
  "wed": 3,
  "wednesday": 3,
  "三": 3,
  "4": 4,
  "周四": 4,
  "星期四": 4,
  "thu": 4,
  "thur": 4,
  "thurs": 4,
  "thursday": 4,
  "四": 4,
  "5": 5,
  "周五": 5,
  "星期五": 5,
  "fri": 5,
  "friday": 5,
  "五": 5,
  "6": 6,
  "周六": 6,
  "星期六": 6,
  "sat": 6,
  "saturday": 6,
  "六": 6,
  "7": 7,
  "周日": 7,
  "星期日": 7,
  "周天": 7,
  "sun": 7,
  "sunday": 7,
  "日": 7,
  "天": 7
};

function normalizeWeek(value: unknown): Weekday | null {
  if (value == null) return null;
  if (typeof value === "number") {
    const n = Math.floor(value);
    return n >= 1 && n <= 7 ? (n as Weekday) : null;
  }
  const raw = String(value).trim().toLowerCase();
  if (!raw) return null;
  if (WEEK_MAP[raw] != null) return WEEK_MAP[raw];
  const match = raw.match(/[1-7]/);
  if (match) {
    const n = Number(match[0]);
    if (n >= 1 && n <= 7) return n as Weekday;
  }
  return null;
}

function normalizeSlot(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value > 0 ? Math.floor(value) : null;
  const raw = String(value).trim();
  if (!raw) return null;
  const match = raw.match(/\d+/);
  if (!match) return null;
  const n = Number(match[0]);
  return n > 0 ? n : null;
}

function normalizeColor(value: unknown): string | undefined {
  if (!value) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  return raw;
}

export function generateTemplateWorkbook(): XLSX.WorkBook {
  const data = [
    ["课程名称", "星期(1-7)", "开始节次", "结束节次", "教室", "教师", "颜色(可选)"],
    ["高等数学", "1", "1", "2", "一教101", "张老师", "#bfdbfe"],
    ["大学英语", "3", "3", "4", "二教305", "李老师", "#bbf7d0"]
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "课程表模板");
  return wb;
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<CourseRawRow>(sheet, {
    defval: "",
    raw: true
  });
  const courses: Course[] = [];
  const warnings: ParseResult["warnings"] = [];
  rows.forEach((row, index) => {
    const rowIndex = index + 2;
    const name =
      (row["课程名称"] as string | undefined)?.trim() ||
      (row["课程名"] as string | undefined)?.trim() ||
      (row["Course Name"] as string | undefined)?.trim() ||
      "";
    const day = normalizeWeek(row["星期"] ?? row["星期(1-7)"]);
    const startSlot = normalizeSlot(row["开始节次"]);
    const endSlot = normalizeSlot(row["结束节次"]);
    const classroom =
      (row["教室"] as string | undefined)?.trim() ||
      (row["教室/地点"] as string | undefined)?.trim();
    const teacher =
      (row["教师"] as string | undefined)?.trim() ||
      (row["老师"] as string | undefined)?.trim();
    const color = normalizeColor(row["颜色"] ?? row["颜色(可选)"]);
    if (!name || day == null || startSlot == null || endSlot == null) {
      warnings.push({
        type: "row_error",
        message: `第 ${rowIndex} 行数据不完整或格式有误，已跳过。`,
        rowIndex
      });
      return;
    }
    if (endSlot < startSlot) {
      warnings.push({
        type: "row_error",
        message: `第 ${rowIndex} 行结束节次小于开始节次，已跳过。`,
        rowIndex
      });
      return;
    }
    courses.push({
      id: generateId(),
      name,
      day,
      startSlot,
      endSlot,
      classroom,
      teacher,
      color
    });
  });
  courses.sort((a, b) => {
    if (a.day === b.day) return a.startSlot - b.startSlot;
    return a.day - b.day;
  });
  const conflictPairs: [Course, Course][] = [];
  for (let i = 0; i < courses.length; i += 1) {
    for (let j = i + 1; j < courses.length; j += 1) {
      const c1 = courses[i];
      const c2 = courses[j];
      if (c1.day !== c2.day) break;
      if (c2.startSlot > c1.endSlot) break;
      const overlap = c2.startSlot <= c1.endSlot && c1.startSlot <= c2.endSlot;
      if (overlap) {
        conflictPairs.push([c1, c2]);
      }
    }
  }
  if (conflictPairs.length > 0) {
    const conflictIds = new Set<string>();
    conflictPairs.forEach(([a, b]) => {
      conflictIds.add(a.id);
      conflictIds.add(b.id);
    });
    courses.forEach((c) => {
      if (conflictIds.has(c.id)) c.isConflict = true;
    });
    warnings.push({
      type: "conflict",
      message: "检测到部分课程时间存在冲突，请在课表中查看红色标记课程。",
      courseIds: Array.from(conflictIds)
    });
  }
  return { courses, warnings };
}

export function exportCoursesToWorkbook(courses: Course[]): XLSX.WorkBook {
  const header = [
    "课程名称",
    "星期(1-7)",
    "开始节次",
    "结束节次",
    "教室",
    "教师",
    "颜色(可选)"
  ];
  const data = courses.map((c) => [
    c.name,
    c.day,
    c.startSlot,
    c.endSlot,
    c.classroom ?? "",
    c.teacher ?? "",
    c.color ?? ""
  ]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "课程表");
  return wb;
}

