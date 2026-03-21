
import * as XLSX from "xlsx";
import type { ScheduleTemplate, CourseRawRow } from "./types";

/**
 * 解析Excel文件并转换为模板数据
 * 支持多种Excel格式：
 * 1. 标准格式：第一行模板信息，第二行颜色配置，第三行列标题，后续课程数据
 * 2. 简化格式：第一行列标题，后续课程数据（使用默认模板信息）
 * 3. 自定义格式：自动识别列标题行，提取课程数据
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

        // 智能识别Excel格式并解析
        const parsedData = parseExcelData(jsonData, file.name);

        // 创建模板对象
        const template: ScheduleTemplate = {
          id: generateTemplateId(parsedData.templateInfo.name),
          name: parsedData.templateInfo.name,
          style: determineStyle(parsedData.colors),
          description: parsedData.templateInfo.description || `从 ${file.name} 导入的模板`,
          previewColor: parsedData.colors.background || "#e2e8f0",
          colors: parsedData.colors,
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
 * 智能解析Excel数据
 */
function parseExcelData(jsonData: any[][], fileName: string): {
  templateInfo: { name: string; description?: string };
  colors: ScheduleTemplate["colors"];
  courses: CourseRawRow[];
} {
  if (!jsonData || jsonData.length === 0) {
    throw new Error("Excel文件为空");
  }

  // 尝试识别第一行是否为模板信息行
  const firstRow = jsonData[0];
  const isTemplateInfoRow = isRowTemplateInfo(firstRow);

  let templateInfo: { name: string; description?: string };
  let colors: ScheduleTemplate["colors"];
  let courseDataRows: any[][];

  if (isTemplateInfoRow) {
    // 标准格式：第一行是模板信息
    templateInfo = parseTemplateInfo(firstRow);

    // 检查第二行是否为颜色配置
    if (jsonData.length > 1 && isRowColorConfig(jsonData[1])) {
      colors = parseColors(jsonData[1]);
      // 课程数据从第三行开始
      courseDataRows = jsonData.slice(2);
    } else {
      // 没有颜色配置，使用默认颜色
      colors = getDefaultColors();
      // 课程数据从第二行开始
      courseDataRows = jsonData.slice(1);
    }
  } else {
    // 简化格式：第一行不是模板信息，使用文件名作为模板名
    templateInfo = {
      name: fileName.replace(/\.(xlsx|xls)$/i, ""),
      description: undefined
    };
    colors = getDefaultColors();

    // 查找列标题行
    const headerRowIndex = findHeaderRow(jsonData);
    if (headerRowIndex !== -1) {
      courseDataRows = jsonData.slice(headerRowIndex + 1);
    } else {
      // 没有找到列标题，假设第一行就是数据
      courseDataRows = jsonData.slice(1);
    }
  }

  // 解析课程数据
  const courses = parseCourses(courseDataRows);

  return { templateInfo, colors, courses };
}

/**
 * 判断行是否为模板信息行
 */
function isRowTemplateInfo(row: any[]): boolean {
  if (!row || row.length === 0) return false;
  const firstCell = String(row[0] || "").trim();
  // 模板名称通常不是颜色代码
  return !firstCell.startsWith("#") && firstCell.length > 0;
}

/**
 * 判断行是否为颜色配置行
 */
function isRowColorConfig(row: any[]): boolean {
  if (!row || row.length === 0) return false;
  const firstCell = String(row[0] || "").trim();
  // 颜色配置行以#开头
  return firstCell.startsWith("#");
}

/**
 * 查找列标题行
 */
function findHeaderRow(rows: any[][]): number {
  const headerKeywords = ["课程名称", "课程名", "星期", "开始节次", "结束节次", "教室", "教师", "颜色"];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const rowStr = row.join(" ").toLowerCase();
    // 检查是否包含至少3个关键词
    const matchCount = headerKeywords.filter(keyword => 
      rowStr.includes(keyword.toLowerCase())
    ).length;
    if (matchCount >= 3) {
      return i;
    }
  }
  return -1;
}

/**
 * 获取默认颜色配置
 */
function getDefaultColors(): ScheduleTemplate["colors"] {
  return {
    background: "#ffffff",
    headerBg: "#f8fafc",
    headerText: "#1e293b",
    gridLines: "#e2e8f0",
    cellBg: "#ffffff",
    cellText: "#64748b",
    courseDefault: "#dbeafe",
    courseText: "#1e3a8a",
    conflictBg: "#fee2e2",
    conflictText: "#991b1b"
  };
}

/**
 * 解析模板信息
 */
function parseTemplateInfo(row: any[]): { name: string; description?: string } {
  const name = String(row[0] || "未命名模板").trim();
  const description = row[1] ? String(row[1]).trim() : undefined;
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
 * 支持智能识别列，不依赖固定列顺序
 */
function parseCourses(rows: any[][]): CourseRawRow[] {
  if (!rows || rows.length === 0) return [];

  // 尝试识别列标题
  const headerRow = rows[0];
  const columnMap = identifyColumns(headerRow);

  // 如果第一行看起来像数据行（没有列标题），则使用默认列顺序
  const startIndex = Object.keys(columnMap).length > 0 ? 1 : 0;
  const dataRows = startIndex === 1 ? rows.slice(1) : rows;

  return dataRows.map((row, index) => {
    const course: CourseRawRow = {};

    // 根据列映射提取数据
    if (columnMap.课程名称 !== undefined) {
      course.课程名称 = row[columnMap.课程名称];
    }
    if (columnMap.星期 !== undefined) {
      course.星期 = row[columnMap.星期];
    }
    if (columnMap.开始节次 !== undefined) {
      course.开始节次 = row[columnMap.开始节次];
    }
    if (columnMap.结束节次 !== undefined) {
      course.结束节次 = row[columnMap.结束节次];
    }
    if (columnMap.教室 !== undefined) {
      course.教室 = row[columnMap.教室];
    }
    if (columnMap.教师 !== undefined) {
      course.教师 = row[columnMap.教师];
    }
    if (columnMap.颜色 !== undefined) {
      course.颜色 = row[columnMap.颜色];
    }

    // 如果没有找到列映射，使用默认列顺序
    if (Object.keys(columnMap).length === 0) {
      course.课程名称 = row[0];
      course.星期 = row[1];
      course.开始节次 = row[2];
      course.结束节次 = row[3];
      course.教室 = row[4];
      course.教师 = row[5];
      course.颜色 = row[6];
    }

    return course;
  }).filter(course => course.课程名称);
}

/**
 * 识别列标题并返回列索引映射
 */
function identifyColumns(headerRow: any[]): Record<string, number> {
  if (!headerRow || headerRow.length === 0) return {};

  const columnMap: Record<string, number> = {};
  const columnAliases: Record<string, string[]> = {
    课程名称: ["课程名称", "课程名", "课程", "name", "course"],
    星期: ["星期", "周", "day", "weekday"],
    开始节次: ["开始节次", "开始", "start", "开始时间"],
    结束节次: ["结束节次", "结束", "end", "结束时间"],
    教室: ["教室", "地点", "classroom", "location", "room"],
    教师: ["教师", "老师", "teacher", "instructor"],
    颜色: ["颜色", "colour", "color"]
  };

  headerRow.forEach((cell, index) => {
    if (!cell) return;
    const cellValue = String(cell).trim().toLowerCase();

    // 查找匹配的列
    for (const [columnName, aliases] of Object.entries(columnAliases)) {
      if (aliases.some(alias => cellValue.includes(alias))) {
        columnMap[columnName] = index;
        break;
      }
    }
  });

  return columnMap;
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
