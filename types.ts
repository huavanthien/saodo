
export enum CriteriaType {
  DONG_PHUC = 'Đồng phục',
  VE_SINH = 'Vệ sinh',
  TRAT_TU = 'Trật tự',
  XEP_HANG = 'Xếp hàng',
  HAT_DAU_GIO = 'Hát đầu giờ',
  THE_DUC = 'Thể dục',
}

export interface CriteriaConfig {
  id: string;
  name: string;
  maxPoints: number; // Max points deductible or total points
  type: string; // Changed from CriteriaType to string to allow dynamic categories
}

export interface ClassEntity {
  id: string;
  name: string;
  grade: number;
}

export interface DailyLog {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  week: number; // School week number (1-35)
  classId: string;
  deductions: {
    criteriaId: string;
    pointsLost: number;
    note?: string;
  }[];
  bonusPoints: number;
  totalScore: number;
  reporterName: string; // Name of the Red Star student
  comment: string;
}

export type Period = 'week' | 'semester' | 'year';

export interface RankingItem {
  classId: string;
  className: string;
  totalScore: number;
  violationCount: number;
  rank: number;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  isImportant?: boolean;
}

export interface SliderImage {
  id: string;
  url: string;
  title: string;
  subtitle: string;
}

export enum UserRole {
  ADMIN = 'ADMIN', // Tổng phụ trách
  RED_STAR = 'RED_STAR', // Sao đỏ
}

export interface User {
  username: string;
  password?: string; // In real app, never store plain text
  name: string;
  role: UserRole;
  assignedClassIds?: string[]; // Changed from single classId to array
}
