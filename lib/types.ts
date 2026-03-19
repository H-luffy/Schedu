export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CourseRawRow {
  课程名称?: string;
  星期?: string | number;
  开始节次?: string | number;
  结束节次?: string | number;
  教室?: string;
  教师?: string;
  颜色?: string;
  [key: string]: unknown;
}

export interface Course {
  id: string;
  name: string;
  day: Weekday;
  startSlot: number;
  endSlot: number;
  classroom?: string;
  teacher?: string;
  color?: string;
  isConflict?: boolean;
}

export interface ParseWarning {
  type: "row_error" | "conflict";
  message: string;
  rowIndex?: number;
  courseIds?: string[];
}

export interface ParseResult {
  courses: Course[];
  warnings: ParseWarning[];
}

export interface ScheduleGridProps {
  courses: Course[];
  maxSlot?: number;
}

