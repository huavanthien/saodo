import { ClassEntity, CriteriaConfig, CriteriaType, Announcement, User, UserRole, DailyLog } from './types';

// Danh sách lớp mới cập nhật
export const CLASSES: ClassEntity[] = [
  // Khối 1
  { id: '1A1', name: '1A1', grade: 1 },
  { id: '1A2', name: '1A2', grade: 1 },
  { id: '1A3', name: '1A3', grade: 1 },
  { id: '1A4', name: '1A4', grade: 1 },
  // Khối 2
  { id: '2A1', name: '2A1', grade: 2 },
  { id: '2A2', name: '2A2', grade: 2 },
  { id: '2A3', name: '2A3', grade: 2 },
  { id: '2A4', name: '2A4', grade: 2 },
  // Khối 3
  { id: '3A1', name: '3A1', grade: 3 },
  { id: '3A2', name: '3A2', grade: 3 },
  { id: '3A3', name: '3A3', grade: 3 },
  { id: '3A4', name: '3A4', grade: 3 },
  // Khối 4
  { id: '4A1', name: '4A1', grade: 4 },
  { id: '4A2', name: '4A2', grade: 4 },
  { id: '4A3', name: '4A3', grade: 4 },
  // Khối 5
  { id: '5A1', name: '5A1', grade: 5 },
  { id: '5A2', name: '5A2', grade: 5 },
  { id: '5A3', name: '5A3', grade: 5 },
];

export const CRITERIA_LIST: CriteriaConfig[] = [
  { id: 'c1', name: 'Mặc sai đồng phục', maxPoints: 5, type: CriteriaType.DONG_PHUC },
  { id: 'c2', name: 'Lớp bẩn/Rác', maxPoints: 5, type: CriteriaType.VE_SINH },
  { id: 'c3', name: 'Mất trật tự trong giờ', maxPoints: 5, type: CriteriaType.TRAT_TU },
  { id: 'c4', name: 'Xếp hàng chậm/lộn xộn', maxPoints: 5, type: CriteriaType.XEP_HANG },
  { id: 'c5', name: 'Không hát/Hát nhỏ', maxPoints: 2, type: CriteriaType.HAT_DAU_GIO },
  { id: 'c6', name: 'Tập thể dục sai/thiếu', maxPoints: 5, type: CriteriaType.THE_DUC },
];

export const MAX_DAILY_SCORE = 100;

// Hàm sinh dữ liệu tự động từ tuần 1 đến tuần 12
const generateMockLogs = (): DailyLog[] => {
  const logs: DailyLog[] = [];
  const startSchoolDate = new Date('2025-09-05'); // Ngày khai giảng giả định năm 2025
  const reporters = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Ngô Thị F'];
  const commentsGood = ['Lớp nề nếp tốt.', 'Thực hiện tốt các quy định.', 'Xếp hàng nhanh, trật tự.', 'Vệ sinh sạch sẽ.', 'Lớp học sôi nổi.'];
  const commentsBad = ['Cần chấn chỉnh trật tự.', 'Vệ sinh còn bẩn.', 'Chưa thuộc bài hát đầu giờ.', 'Xếp hàng còn chậm.', 'Nói chuyện riêng nhiều.'];

  // Helper cộng ngày
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Duyệt qua 12 tuần
  for (let w = 1; w <= 12; w++) {
    // Giả sử lấy ngày Thứ 6 hàng tuần làm ngày chốt sổ
    const logDate = addDays(startSchoolDate, (w - 1) * 7 + 4).toISOString().split('T')[0];

    CLASSES.forEach((cls) => {
      // Logic ngẫu nhiên: 
      // 20% lớp xuất sắc (100 điểm)
      // 50% lớp tốt (95-99 điểm)
      // 30% lớp khá/trung bình (85-94 điểm)
      const rand = Math.random();
      let targetScore = 100;

      if (rand > 0.8) {
         // Xuất sắc giữ nguyên 100
         targetScore = 100;
      } else if (rand > 0.3) {
         // Tốt
         targetScore = 95 + Math.floor(Math.random() * 5); // 95 -> 99
      } else {
         // Khá
         targetScore = 85 + Math.floor(Math.random() * 10); // 85 -> 94
      }

      // Tạo danh sách lỗi để trừ điểm sao cho khớp với targetScore
      let currentScore = 100;
      const deductions: any[] = [];
      
      if (targetScore < 100) {
        let pointsToDeduct = 100 - targetScore;
        
        while (pointsToDeduct > 0) {
            // Chọn ngẫu nhiên 1 lỗi
            const crit = CRITERIA_LIST[Math.floor(Math.random() * CRITERIA_LIST.length)];
            // Trừ điểm (không quá số điểm cần trừ và max point của lỗi)
            const points = Math.min(crit.maxPoints, Math.min(pointsToDeduct, Math.ceil(Math.random() * crit.maxPoints)));
            
            deductions.push({
                criteriaId: crit.id,
                pointsLost: points,
                note: `Vi phạm ${crit.name.toLowerCase()}`
            });
            
            pointsToDeduct -= points;
            currentScore -= points;
        }
      }

      // Điểm cộng (5% cơ hội)
      let bonusPoints = 0;
      if (Math.random() > 0.95) {
          bonusPoints = 5;
          currentScore += 5;
      }

      logs.push({
        id: `log-w${w}-${cls.id}`,
        date: logDate,
        week: w,
        classId: cls.id,
        deductions: deductions,
        bonusPoints: bonusPoints,
        totalScore: currentScore,
        reporterName: reporters[Math.floor(Math.random() * reporters.length)],
        comment: currentScore >= 98 ? commentsGood[Math.floor(Math.random() * commentsGood.length)] : commentsBad[Math.floor(Math.random() * commentsBad.length)]
      });
    });
  }

  // Sắp xếp log mới nhất lên đầu
  return logs.reverse();
};

export const INITIAL_LOGS_MOCK: DailyLog[] = generateMockLogs();

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Phát động phong trào "Nói lời hay, làm việc tốt"',
    date: '2025-11-15',
    content: 'Tuần tới nhà trường sẽ phát động phong trào thi đua chào mừng ngày Nhà giáo Việt Nam 20/11. Đề nghị các lớp thực hiện nghiêm túc nề nếp.',
    isImportant: true
  },
  {
    id: 'a2',
    title: 'Lịch trực Sao Đỏ tuần 13',
    date: '2025-11-20',
    content: 'Đội Sao Đỏ chú ý lịch trực mới được cập nhật tại bảng tin. Các bạn khối 5 sẽ phụ trách chấm điểm khu vực sân trường.',
    isImportant: false
  },
  {
    id: 'a3',
    title: 'Kết quả thi đua tuần 12',
    date: '2025-11-18',
    content: 'Chúc mừng lớp 5A1 và 4A2 đã đạt giải nhất tuần vừa qua. Các lớp cần cố gắng hơn trong việc giữ gìn vệ sinh chung.',
    isImportant: false
  }
];

export const MOCK_USERS: User[] = [
  {
    username: 'admin',
    password: '123',
    name: 'Tổng Phụ Trách',
    role: UserRole.ADMIN,
    assignedClassIds: []
  },
  {
    username: 'saodo1',
    password: '123',
    name: 'Nguyễn Văn A',
    role: UserRole.RED_STAR,
    assignedClassIds: ['5A1', '5A2', '5A3', '4A1'] 
  },
  {
    username: 'saodo2',
    password: '123',
    name: 'Trần Thị B',
    role: UserRole.RED_STAR,
    assignedClassIds: ['4A2', '4A3', '3A1', '3A2']
  },
  {
    username: 'saodo3',
    password: '123',
    name: 'Lê Văn C',
    role: UserRole.RED_STAR,
    assignedClassIds: ['3A3', '3A4', '2A1', '2A2']
  }
];

export const SLIDER_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop',
    title: 'Lễ Khai Giảng Năm Học Mới',
    subtitle: 'Hân hoan chào đón năm học 2025 - 2026'
  },
  {
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop',
    title: 'Hoạt Động Ngoại Khóa',
    subtitle: 'Học sinh tham gia vẽ tranh bảo vệ môi trường'
  },
  {
    url: 'https://images.unsplash.com/photo-1427504746696-ea3093607dbe?q=80&w=800&auto=format&fit=crop',
    title: 'Thi Đua Dạy Tốt - Học Tốt',
    subtitle: 'Phong trào thi đua chào mừng 20/11'
  },
  {
    url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800&auto=format&fit=crop',
    title: 'Thư Viện Xanh',
    subtitle: 'Không gian đọc sách thân thiện cho học sinh'
  }
];