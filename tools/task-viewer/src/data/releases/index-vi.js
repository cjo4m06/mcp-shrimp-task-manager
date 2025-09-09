// Metadata ghi chú phát hành - nội dung thực tế được tải từ các tệp /releases/*.md
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: 'Hệ thống Lưu trữ Tóm tắt Hoàn thành Tác vụ',
    summary: 'Nâng cao chi tiết hoàn thành tác vụ với mô hình dữ liệu có cấu trúc và khả năng phân tích tóm tắt thông minh'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: 'Ghi chú Phát hành Nâng cao & Hệ thống Lưu trữ',
    summary: 'Theo dõi ngữ cảnh với Hiển thị Yêu cầu Ban đầu, tóm tắt được hỗ trợ bởi AI, Ghi chú Phát hành nâng cao với mục lục và quản lý Lưu trữ toàn diện'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: 'Hiển thị Yêu cầu Ban đầu',
    summary: 'Ghi lại và hiển thị yêu cầu ban đầu của người dùng đã khởi tạo việc lập kế hoạch tác vụ, cung cấp ngữ cảnh thiết yếu cho danh sách tác vụ'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: 'Quốc tế hóa, Lịch sử Tác vụ, Tác nhân Con, Lightbox',
    summary: 'Hỗ trợ đa ngôn ngữ, tùy chỉnh mẫu, lịch sử dự án, quản lý tác nhân, lightbox hình ảnh và các cải tiến giao diện người dùng chính'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: 'Quản lý Tác vụ Nâng cao & Tích hợp VS Code',
    summary: 'Liên kết tệp VS Code, cải thiện quản lý UUID, cột phụ thuộc và ghi chú phát hành trong ứng dụng'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: 'Phát hành Độc lập Ban đầu',
    summary: 'Trình xem tác vụ dựa trên web với quản lý hồ sơ, cập nhật thời gian thực và giao diện người dùng hiện đại'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};