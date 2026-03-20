
import * as XLSX from "xlsx";
import type { ScheduleTemplate, CourseRawRow } from "./types";

/**
 * 解析Excel文件并转换为模板数据
 */
export function parseExcelTemplate(file: File): Promise<ScheduleTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // 解析模板信息（假设第一行包含模板名称和描述）
        const templateInfo = parseTemplateInfo(jsonData[0]);

        // 解析颜色配置（假设第二行包含颜色配置）
        const colors = parseColors(jsonData[1] || []);

        // 解析课程数据（从第三行开始）
        const courses = parseCourses(jsonData.slice(2));

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

        resolve(template);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 解析模板信息
 */
function parseTemplateInfo(row: any[]): { name: string; description?: string } {
  const name = row[0] || "未命名模板";
  const description = row[1];
  return { name, description };
}

/**
 * 解析颜色配置
 */
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

/**
 * 解析课程数据
 */
function parseCourses(rows: any[][]): CourseRawRow[] {
  return rows.map((row, index) => ({
    课程名称: row[0],
    星期: row[1],
    开始节次: row[2],
    结束节次: row[3],
    教室: row[4],
    教师: row[5],
    颜色: row[6]
  })).filter(course => course.课程名称);
}

/**
 * 生成模板ID
 */
function generateTemplateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 根据颜色确定风格
 */
function determineStyle(colors: ScheduleTemplate["colors"]): ScheduleTemplate["style"] {
  const bgLuminance = getLuminance(colors.background);

  if (bgLuminance < 0.3) return "dark";
  if (isColorful(colors)) return "colorful";
  if (isProfessional(colors)) return "professional";
  if (isCreative(colors)) return "creative";

  return "minimal";
}

/**
 * 计算颜色亮度
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;

  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

/**
 * 判断是否为多彩风格
 */
function isColorful(colors: ScheduleTemplate["colors"]): boolean {
  const saturation = getSaturation(colors.courseDefault);
  return saturation > 0.5;
}

/**
 * 判断是否为专业风格
 */
function isProfessional(colors: ScheduleTemplate["colors"]): boolean {
  return colors.headerBg.startsWith("#3") || colors.headerBg.startsWith("#4");
}

/**
 * 判断是否为创意风格
 */
function isCreative(colors: ScheduleTemplate["colors"]): boolean {
  return colors.background.includes("ff") && colors.courseDefault.includes("ff");
}

/**
 * 获取颜色饱和度
 */
function getSaturation(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const delta = max - min;

  return max === 0 ? 0 : delta / max;
}

/**
 * 十六进制转RGB
 */
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

/**
 * 批量处理多个Excel文件
 */
export async function processMultipleExcelFiles(files: File[]): Promise<ScheduleTemplate[]> {
  const templates: ScheduleTemplate[] = [];

  for (const file of files) {
    try {
      const template = await parseExcelTemplate(file);
      templates.push(template);
    } catch (error) {
      console.error(`处理文件 ${file.name} 失败:`, error);
    }
  }

  return templates;
}

/**
 * 将模板导出为Excel格式
 */
export function exportTemplateToExcel(template: ScheduleTemplate): void {
  const workbook = XLSX.utils.book_new();

  // 创建工作表数据
  const wsData = [
    // 第一行：模板信息
    [template.name, template.description],
    // 第二行：颜色配置
    [
      template.colors.background,
      template.colors.headerBg,
      template.colors.headerText,
      template.colors.gridLines,
      template.colors.cellBg,
      template.colors.cellText,
      template.colors.courseDefault,
      template.colors.courseText,
      template.colors.conflictBg,
      template.colors.conflictText
    ],
    // 第三行：列标题
    ["课程名称", "星期", "开始节次", "结束节次", "教室", "教师", "颜色"],
    // 示例数据行
    ["示例课程", "周一", 1, 2, "示例教室", "示例教师", template.colors.courseDefault]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "模板配置");

  // 导出文件
  XLSX.writeFile(workbook, `${template.name}-模板.xlsx`);
}
