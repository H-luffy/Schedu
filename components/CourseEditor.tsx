"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Clock, MapPin, User, Calendar } from "lucide-react";
import type { Course, Weekday } from "@/lib/types";

const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = [
  { value: 1, label: "周一" },
  { value: 2, label: "周二" },
  { value: 3, label: "周三" },
  { value: 4, label: "周四" },
  { value: 5, label: "周五" },
  { value: 6, label: "周六" },
  { value: 7, label: "周日" }
];

const COLOR_OPTIONS = [
  { value: "#dbeafe", label: "蓝色", bg: "bg-blue-100" },
  { value: "#dcfce7", label: "绿色", bg: "bg-green-100" },
  { value: "#fef9c3", label: "黄色", bg: "bg-yellow-100" },
  { value: "#fee2e2", label: "红色", bg: "bg-red-100" },
  { value: "#f3e8ff", label: "紫色", bg: "bg-purple-100" },
  { value: "#fae8ff", label: "粉色", bg: "bg-pink-100" },
  { value: "#e0f2fe", label: "天蓝", bg: "bg-sky-100" },
  { value: "#fce7f3", label: "玫瑰", bg: "bg-rose-100" }
];

interface CourseEditorProps {
  courses: Course[];
  onCoursesChange: (courses: Course[]) => void;
}

interface EditingCourse extends Omit<Course, "id"> {
  id?: string;
}

export function CourseEditor({ courses, onCoursesChange }: CourseEditorProps) {
  const [editingCourse, setEditingCourse] = useState<EditingCourse | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleAddCourse = () => {
    setEditingCourse({
      name: "",
      day: 1,
      startSlot: 1,
      endSlot: 2,
      classroom: "",
      teacher: "",
      color: COLOR_OPTIONS[0].value
    });
    setIsFormVisible(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse({ ...course });
    setIsFormVisible(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm("确定要删除这门课程吗？")) {
      onCoursesChange(courses.filter(c => c.id !== courseId));
    }
  };

  const handleSaveCourse = () => {
    if (!editingCourse || !editingCourse.name.trim()) {
      alert("请输入课程名称");
      return;
    }

    if (editingCourse.startSlot > editingCourse.endSlot) {
      alert("开始节次不能大于结束节次");
      return;
    }

    const newCourse: Course = {
      ...editingCourse,
      id: editingCourse.id || `course-${Date.now()}`,
      name: editingCourse.name.trim(),
      classroom: editingCourse.classroom?.trim(),
      teacher: editingCourse.teacher?.trim()
    };

    if (editingCourse.id) {
      // 编辑现有课程
      onCoursesChange(courses.map(c => c.id === editingCourse.id ? newCourse : c));
    } else {
      // 添加新课程
      onCoursesChange([...courses, newCourse]);
    }

    setEditingCourse(null);
    setIsFormVisible(false);
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setIsFormVisible(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">课程编辑</h2>
        <button
          onClick={handleAddCourse}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          添加课程
        </button>
      </div>

      {isFormVisible && editingCourse && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingCourse.id ? "编辑课程" : "添加新课程"}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                课程名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingCourse.name}
                onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="例如：高等数学"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  星期 <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingCourse.day}
                  onChange={(e) => setEditingCourse({ ...editingCourse, day: Number(e.target.value) as Weekday })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {WEEKDAY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    开始节次 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingCourse.startSlot}
                    onChange={(e) => setEditingCourse({ ...editingCourse, startSlot: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(slot => (
                      <option key={slot} value={slot}>第 {slot} 节</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    结束节次 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingCourse.endSlot}
                    onChange={(e) => setEditingCourse({ ...editingCourse, endSlot: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(slot => (
                      <option key={slot} value={slot} disabled={slot < editingCourse.startSlot}>第 {slot} 节</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                教室
              </label>
              <input
                type="text"
                value={editingCourse.classroom || ""}
                onChange={(e) => setEditingCourse({ ...editingCourse, classroom: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="例如：教学楼A-101"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                教师
              </label>
              <input
                type="text"
                value={editingCourse.teacher || ""}
                onChange={(e) => setEditingCourse({ ...editingCourse, teacher: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="例如：张教授"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                课程颜色
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setEditingCourse({ ...editingCourse, color: option.value })}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      editingCourse.color === option.value
                        ? "border-blue-500 scale-110"
                        : "border-transparent hover:border-slate-300"
                    }`}
                    style={{ backgroundColor: option.value }}
                    title={option.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCancelEdit}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveCourse}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                保存课程
              </button>
            </div>
          </div>
        </div>
      )}

      {courses.length === 0 && !isFormVisible && (
        <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-600">暂无课程</p>
          <p className="mt-1 text-xs text-slate-500">点击"添加课程"按钮开始创建</p>
        </div>
      )}

      {courses.length > 0 && (
        <div className="space-y-2">
          {courses
            .sort((a, b) => a.day - b.day || a.startSlot - b.startSlot)
            .map(course => (
              <div
                key={course.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <div
                  className="h-10 w-10 flex-shrink-0 rounded-lg"
                  style={{ backgroundColor: course.color || "#dbeafe" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {course.name}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {WEEKDAY_OPTIONS.find(w => w.value === course.day)?.label}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      第 {course.startSlot}-{course.endSlot} 节
                    </span>
                    {course.classroom && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {course.classroom}
                      </span>
                    )}
                    {course.teacher && (
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {course.teacher}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                    title="编辑"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition"
                    title="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
