
import type { ScheduleTemplate } from "./types";

// 从API获取Excel模板
export async function fetchExcelTemplates(): Promise<ScheduleTemplate[]> {
  try {
    const response = await fetch('/api/templates');
    if (!response.ok) {
      throw new Error('获取Excel模板失败');
    }
    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    console.error('获取Excel模板失败:', error);
    return [];
  }
}

// 合并系统预设模板和Excel模板
export async function getAllTemplates(systemTemplates: ScheduleTemplate[]): Promise<ScheduleTemplate[]> {
  const excelTemplates = await fetchExcelTemplates();

  // 合并模板，Excel模板优先级更高
  const templateMap = new Map<string, ScheduleTemplate>();

  // 先添加系统预设模板
  systemTemplates.forEach(template => {
    templateMap.set(template.id, template);
  });

  // 然后添加Excel模板，会覆盖同ID的系统模板
  excelTemplates.forEach(template => {
    templateMap.set(template.id, template);
  });

  return Array.from(templateMap.values());
}
