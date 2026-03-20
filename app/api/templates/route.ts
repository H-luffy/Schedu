
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { ScheduleTemplate } from '@/lib/types';

// Excel文件存放目录
const EXCEL_TEMPLATES_DIR = join(process.cwd(), 'excel-templates');

// 解析Excel文件并转换为模板数据
function parseExcelTemplate(filePath: string): ScheduleTemplate | null {
  try {
    // 读取Excel文件
    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // 获取第一个工作表
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // 转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // 解析模板信息（假设第一行包含模板名称和描述）
    const templateInfo = parseTemplateInfo(jsonData[0]);

    // 解析颜色配置（假设第二行包含颜色配置）
    const colors = parseColors(jsonData[1] || []);

    // 创建模板对象
    const template: ScheduleTemplate = {
      id: generateTemplateId(templateInfo.name),
      name: templateInfo.name,
      style: determineStyle(colors),
      description: templateInfo.description || "从Excel导入的模板",
      previewColor: colors.background || "#e2e8f0",
      colors,
      borderRadius: {
        cell: "8px",
        course: "12px"
      },
      spacing: {
        cellPadding: "12px",
        gap: "8px"
      }
    };

    return template;
  } catch (error) {
    console.error(`解析Excel文件 ${filePath} 失败:`, error);
    return null;
  }
}

// 解析模板信息
function parseTemplateInfo(row: any[]): { name: string; description?: string } {
  const name = row[0] || "未命名模板";
  const description = row[1];
  return { name, description };
}

// 解析颜色配置
function parseColors(row: any[]): ScheduleTemplate["colors"] {
  return {
    background: row[0] || "#ffffff",
    headerBg: row[1] || "#f8fafc",
    headerText: row[2] || "#1e293b",
    gridLines: row[3] || "#e2e8f0",
    cellBg: row[4] || "#ffffff",
    cellText: row[5] || "#64748b",
    courseDefault: row[6] || "#dbeafe",
    courseText: row[7] || "#1e3a8a",
    conflictBg: row[8] || "#fee2e2",
    conflictText: row[9] || "#991b1b"
  };
}

// 生成模板ID
function generateTemplateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// 根据颜色确定风格
function determineStyle(colors: ScheduleTemplate["colors"]): ScheduleTemplate["style"] {
  const bgLuminance = getLuminance(colors.background);

  if (bgLuminance < 0.3) return "dark";
  if (isColorful(colors)) return "colorful";
  if (isProfessional(colors)) return "professional";
  if (isCreative(colors)) return "creative";

  return "minimal";
}

// 计算颜色亮度
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;

  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

// 判断是否为多彩风格
function isColorful(colors: ScheduleTemplate["colors"]): boolean {
  const saturation = getSaturation(colors.courseDefault);
  return saturation > 0.5;
}

// 判断是否为专业风格
function isProfessional(colors: ScheduleTemplate["colors"]): boolean {
  return colors.headerBg.startsWith("#3") || colors.headerBg.startsWith("#4");
}

// 判断是否为创意风格
function isCreative(colors: ScheduleTemplate["colors"]): boolean {
  return colors.background.includes("ff") && colors.courseDefault.includes("ff");
}

// 获取颜色饱和度
function getSaturation(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const delta = max - min;

  return max === 0 ? 0 : delta / max;
}

// 十六进制转RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

// 扫描Excel模板目录并解析所有模板
function scanExcelTemplates(): ScheduleTemplate[] {
  const templates: ScheduleTemplate[] = [];

  try {
    // 检查目录是否存在
    const files = readdirSync(EXCEL_TEMPLATES_DIR);

    // 过滤出Excel文件
    const excelFiles = files.filter(file => 
      file.endsWith('.xlsx') || file.endsWith('.xls')
    );

    // 解析每个Excel文件
    for (const file of excelFiles) {
      const filePath = join(EXCEL_TEMPLATES_DIR, file);
      const template = parseExcelTemplate(filePath);
      if (template) {
        templates.push(template);
      }
    }
  } catch (error) {
    console.error('扫描Excel模板目录失败:', error);
  }

  return templates;
}

// GET请求处理：获取所有从Excel解析的模板
export async function GET() {
  try {
    const templates = scanExcelTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('获取Excel模板失败:', error);
    return NextResponse.json(
      { error: '获取Excel模板失败' },
      { status: 500 }
    );
  }
}
