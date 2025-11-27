import { ClassEntity, CriteriaConfig, CriteriaType, Announcement, User, UserRole, DailyLog } from './types';

export const CLASSES: ClassEntity[] = [
  { id: '1A', name: '1A', grade: 1 },
  { id: '1B', name: '1B', grade: 1 },
  { id: '1C', name: '1C', grade: 1 },
  { id: '2A', name: '2A', grade: 2 },
  { id: '2B', name: '2B', grade: 2 },
  { id: '3A', name: '3A', grade: 3 },
  { id: '3B', name: '3B', grade: 3 },
  { id: '4A', name: '4A', grade: 4 },
  { id: '4B', name: '4B', grade: 4 },
  { id: '5A', name: '5A', grade: 5 },
  { id: '5B', name: '5B', grade: 5 },
];

export const CRITERIA_LIST: CriteriaConfig[] = [
  { id: 'c1', name: 'Mặc sai đồng phục', maxPoints: 5, type: CriteriaType.DONG_PHUC },
  { id: 'c2', name: 'Lớp bẩn/Rác', maxPoints: 5, type: CriteriaType.VE_SINH },
  { id: 'c3', name: 'Mất trật tự trong giờ', maxPoints: 5, type: CriteriaType.TRAT_TU },
  { id: 'c4', name: 'Xếp hàng chậm/lộn xộn', maxPoints: 5, type: CriteriaType.XEP_HANG },
  { id: 'c5', name: 'Không hát/Hát nhỏ', maxPoints: 2, type: CriteriaType.HAT_DAU_GIO },
  { id: 'c6', name: 'Tập thể dục sai/thiếu', maxPoints: 5, type: CriteriaType.THE_DUC },
];

export const MAX_DAILY_SCORE = 100; // Base score per day if no violations (simplified model)

// Seed some initial data for demonstration
export const INITIAL_LOGS_MOCK: DailyLog[] = [
  {
    id: 'log-1',
    date: new Date().toISOString().split('T')[0],
    week: 12, // Example week
    classId: '5A',
    deductions: [
      { criteriaId: 'c3', pointsLost: 2, note: 'Nói chuyện riêng giờ Toán' }
    ],
    bonusPoints: 0,
    totalScore: 98,
    reporterName: 'Minh Anh',
    comment: 'Lớp ngoan nhưng còn vài bạn nói chuyện.'
  },
  {
    id: 'log-2',
    date: new Date().toISOString().split('T')[0],
    week: 12, // Example week
    classId: '4B',
    deductions: [
      { criteriaId: 'c2', pointsLost: 5, note: 'Rác nhiều dưới ngăn bàn' }
    ],
    bonusPoints: 0,
    totalScore: 95,
    reporterName: 'Tuấn Hưng',
    comment: 'Cần nhắc nhở vệ sinh.'
  },
  {
    id: 'log-3',
    date: '2023-10-15', // Past date
    week: 8, // Example past week in Semester 1
    classId: '5A',
    deductions: [],
    bonusPoints: 0,
    totalScore: 100,
    reporterName: 'Minh Anh',
    comment: 'Lớp xuất sắc.'
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Phát động phong trào "Nói lời hay, làm việc tốt"',
    date: '2023-11-15',
    content: 'Tuần tới nhà trường sẽ phát động phong trào thi đua chào mừng ngày Nhà giáo Việt Nam 20/11. Đề nghị các lớp thực hiện nghiêm túc nề nếp.',
    isImportant: true
  },
  {
    id: 'a2',
    title: 'Lịch trực Sao Đỏ tuần 12',
    date: '2023-11-14',
    content: 'Đội Sao Đỏ chú ý lịch trực mới được cập nhật tại bảng tin. Các bạn khối 5 sẽ phụ trách chấm điểm khu vực sân trường.',
    isImportant: false
  },
  {
    id: 'a3',
    title: 'Kết quả thi đua tuần 11',
    date: '2023-11-11',
    content: 'Chúc mừng lớp 5A và 4B đã đạt giải nhất tuần vừa qua. Các lớp cần cố gắng hơn trong việc giữ gìn vệ sinh chung.',
    isImportant: false
  }
];

export const MOCK_USERS: User[] = [
  {
    username: 'admin',
    password: '123',
    name: 'Cô Tổng Phụ Trách',
    role: UserRole.ADMIN,
    assignedClassIds: []
  },
  {
    username: 'saodo5a',
    password: '123',
    name: 'Nguyễn Văn A',
    role: UserRole.RED_STAR,
    assignedClassIds: ['5A', '5B'] // Assign 2 classes
  },
  {
    username: 'saodo4b',
    password: '123',
    name: 'Trần Thị B',
    role: UserRole.RED_STAR,
    assignedClassIds: ['4B']
  }
];