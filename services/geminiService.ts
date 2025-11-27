import { GoogleGenAI } from "@google/genai";
import { DailyLog, ClassEntity, CriteriaConfig } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateWeeklyReport = async (
  logs: DailyLog[],
  classes: ClassEntity[],
  criteriaList: CriteriaConfig[]
): Promise<string> => {
  const client = getClient();
  if (!client) return "Chưa cấu hình API Key. Vui lòng kiểm tra môi trường.";

  // Prepare data summary for the AI
  const summaryData = logs.map(log => {
    const className = classes.find(c => c.id === log.classId)?.name || log.classId;
    const violations = log.deductions.map(d => {
      const criteria = criteriaList.find(c => c.id === d.criteriaId);
      return `${criteria?.name || 'Lỗi không xác định'} (-${d.pointsLost}đ): ${d.note}`;
    }).join("; ");
    
    return `Ngày ${log.date}, Lớp ${className}: Điểm ${log.totalScore}. Lỗi: ${violations || "Không có"}. Nhận xét: ${log.comment}`;
  });

  const prompt = `
    Bạn là trợ lý ảo AI thông minh của đội Sao Đỏ trường Tiểu học Nguyễn Huệ.
    Dưới đây là nhật ký chấm điểm thi đua của tuần này.
    
    Dữ liệu:
    ${JSON.stringify(summaryData)}

    Yêu cầu:
    1. Viết một báo cáo ngắn gọn, súc tích để đọc trước toàn trường vào giờ chào cờ đầu tuần sau.
    2. Tuyên dương 3 lớp có điểm cao nhất (giả định dựa trên dữ liệu, nếu không đủ dữ liệu hãy khen chung).
    3. Nhắc nhở nhẹ nhàng về các lỗi vi phạm phổ biến nhất trong tuần qua.
    4. Giọng văn: Thân thiện, khuyến khích, sư phạm, phù hợp với học sinh tiểu học.
    5. Đừng dùng định dạng Markdown quá phức tạp, dùng đoạn văn rõ ràng.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Không thể tạo báo cáo lúc này.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Đã xảy ra lỗi khi kết nối với AI để tạo báo cáo.";
  }
};