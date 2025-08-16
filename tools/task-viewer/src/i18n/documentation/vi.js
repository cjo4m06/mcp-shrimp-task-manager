export const viDocumentation = {
  releaseNotes: {
    header: '📋 Ghi chú Phát hành',
    versions: 'Phiên bản',
    loading: 'Đang tải ghi chú phát hành...',
    notFound: 'Không tìm thấy ghi chú phát hành.',
    error: 'Lỗi khi tải ghi chú phát hành.',
    copy: 'Sao chép',
    copied: 'Đã sao chép!'
  },
  help: {
    header: 'ℹ️ Trợ giúp & Tài liệu',
    loading: 'Đang tải tài liệu...',
    notFound: 'Không tìm thấy README.',
    error: 'Lỗi khi tải README.',
    copy: 'Sao chép',
    copied: 'Đã sao chép!'
  },
  releases: {
    'v3.0.0': {
      title: '🚀 Task Viewer v3.0.0 Ghi chú Phát hành',
      date: 'Ngày phát hành: 7 tháng 8, 2025',
      content: `# 🚀 Task Viewer v3.0.0 Ghi chú Phát hành

*Ngày phát hành: 7 tháng 8, 2025*

## 🎉 Tính năng mới chính

### 🤖 Hệ thống Quản lý Agent
**Quản lý sub-agent toàn diện cho xử lý tác vụ chuyên biệt**

SHRIMP-TASK-MANAGER hiện hỗ trợ khả năng quản lý agent mạnh mẽ, cho phép bạn định nghĩa và sử dụng các agent AI chuyên biệt cho các loại tác vụ khác nhau. Agent là những nhân cách hoặc bộ kỹ năng AI chuyên biệt có thể được gán cho các tác vụ để thực hiện tối ưu.

Khả năng chính bao gồm:
- **Giao diện danh sách Agent**: Duyệt tất cả các agent có sẵn từ thư mục .claude/agents
- **Phân công Agent**: Gán các agent cụ thể cho tác vụ thông qua dropdown trong bảng tác vụ
- **Popup xem Agent**: Nhấp vào biểu tượng mắt để mở popup xem agent
- **Trình soạn thảo Agent**: Trình soạn thảo tích hợp với tùy chỉnh màu sắc
- **Hướng dẫn AI một cú nhấp**: Nhấp emoji robot để sao chép hướng dẫn cụ thể

### 🤖 Phân công Agent hàng loạt bằng AI
**Tự động gán các agent phù hợp nhất cho nhiều tác vụ sử dụng OpenAI GPT-4**

Task Viewer hiện tích hợp với GPT-4 của OpenAI để gán agent cho tác vụ một cách thông minh dựa trên mô tả và yêu cầu của chúng. Tính năng này giảm đáng kể thời gian cần thiết để cấu hình số lượng lớn tác vụ với các agent phù hợp.

Tính năng chính bao gồm:
- **Lựa chọn Hàng loạt**: Chọn nhiều tác vụ bằng checkbox trong bảng tác vụ
- **Gán Một cú nhấp**: Nhấp "AI Assign Agents" để tự động gán agent cho tất cả tác vụ đã chọn
- **Khớp Thông minh**: GPT-4 phân tích mô tả tác vụ và khả năng agent để thực hiện gán tối ưu

### 📊 Kiểm soát Phiên bản Git cho Lịch sử Tác vụ
**Commit Git tự động theo dõi mọi thay đổi đối với tác vụ của bạn**

SHRIMP-TASK-MANAGER hiện bao gồm tích hợp Git tích hợp sẵn tự động theo dõi tất cả thay đổi đối với file tasks.json của bạn. Điều này cung cấp một đường mòn kiểm toán hoàn chỉnh của các sửa đổi tác vụ mà không cần can thiệp thủ công.

### 📊 Giao diện Lịch sử Dự án
**Theo dõi và phân tích lịch sử thực thi tác vụ của dự án**

SHRIMP-TASK-MANAGER tự động lưu các tác vụ đã hoàn thành vào các file bộ nhớ trong dự án của bạn bất cứ khi nào bạn bắt đầu một phiên tác vụ mới. Giao diện Lịch sử Dự án mới này phơi bày lịch sử tác vụ này, cho phép bạn khám phá cách dự án phát triển theo thời gian.

### 🎨 Hệ thống Quản lý Template
**Tùy chỉnh template mạnh mẽ cho việc thực thi tác vụ AI**

Template là những hướng dẫn cốt lõi hướng dẫn SHRIMP-TASK-MANAGER trong việc phân tích và thực thi các loại thao tác khác nhau. Chúng định nghĩa cách AI nên tiếp cận các thao tác khác nhau, từ lập kế hoạch và phân tích đến thực hiện và xác minh.

### 🌍 Hỗ trợ Quốc tế hóa (i18n)
**Hỗ trợ đa ngôn ngữ với chuyển đổi ngôn ngữ liền mạch**

- **Ba Ngôn ngữ được Hỗ trợ**: Tiếng Anh (en), Tiếng Trung (中文) và Tiếng Tây Ban Nha (Español)
- **Lựa chọn Ngôn ngữ Bền vững**: Tùy chọn ngôn ngữ của bạn được lưu và ghi nhớ
- **Bản dịch UI Hoàn chỉnh**: Tất cả các phần tử UI, nút, nhãn và thông báo được dịch đầy đủ

### 🧭 Cải thiện Điều hướng & UI
**Cải tiến giao diện hiện đại, trực quan**

- **Hệ thống Tab Lồng nhau**: Điều hướng có tổ chức với tab chính và phụ
- **Đồng bộ hóa Trạng thái URL**: URL trình duyệt cập nhật để phản ánh view hiện tại
- **Điều hướng Chi tiết Tác vụ**: Nút Trước/Tiếp cho phép xem xét tác vụ tuần tự mà không cần quay lại danh sách

## 🔄 Cải tiến Đáng kể

### Điều hướng Chi tiết Tác vụ
**Workflow xem xét tác vụ liền mạch**

Giao diện Chi tiết Tác vụ hiện bao gồm các nút điều hướng Trước/Tiếp biến đổi cách bạn xem xét và làm việc qua các tác vụ.

### Nâng cao Hiệu suất
- **Render Tối ưu**: React hooks được memoized đúng cách để có hiệu suất tốt hơn
- **Lazy Loading**: Các component tải theo yêu cầu để tải trang ban đầu nhanh hơn
- **Quản lý State Hiệu quả**: Giảm các cập nhật state không cần thiết

### Trải nghiệm Nhà phát triển
- **Bộ Test Toàn diện**: Thêm test tích hợp và tính năng ngôn ngữ
- **Danh sách Kiểm tra Test**: Tài liệu test có cấu trúc
- **Xử lý Lỗi Tốt hơn**: Thông báo lỗi nhiều thông tin hơn

### Cải tiến UI/UX
- **Bảng Tác vụ Cải thiện**: Kích thước cột và xuống dòng text tốt hơn
- **Modal Nâng cao**: Styling và behavior modal nhất quán
- **Typography Tốt hơn**: Cải thiện khả năng đọc với kích thước font cập nhật

## 🐛 Sửa lỗi

### Sửa lỗi Quan trọng
- **Lỗi useRef Hook**: Sửa lỗi thiếu import React hook gây crash ứng dụng
- **Khóa Dịch**: Thêm khóa dịch thiếu cho tất cả ngôn ngữ được hỗ trợ
- **Vòng lặp Symbolic Link**: Giải quyết vấn đề vòng lặp vô hạn thư mục Screenshots

### Sửa lỗi UI
- **Z-index Modal**: Sửa vấn đề layer modal
- **Lựa chọn Tab**: Sửa sự bền vững tab qua việc reload trang
- **Bộ chọn Ngôn ngữ**: Sửa vấn đề đồng bộ hóa state

### Xử lý Dữ liệu
- **Tải Profile**: Sửa race condition khi chuyển đổi giữa các profile
- **Refresh Tác vụ**: Cải thiện độ tin cậy auto-refresh
- **Tải Lịch sử**: Sửa vấn đề phân trang trong view lịch sử

## 🎯 Tóm tắt

Phiên bản 3.0 đại diện cho một bước nhảy vọt lớn cho Task Viewer, chuyển đổi nó từ một công cụ hiển thị tác vụ đơn giản thành một nền tảng quản lý và tùy chỉnh tác vụ toàn diện. Với hỗ trợ quốc tế hóa đầy đủ, quản lý template mạnh mẽ, tự động hóa được hỗ trợ AI và khả năng theo dõi lịch sử dựa trên Git, bản phát hành này cung cấp cho các nhóm khả năng kiểm soát chưa từng có đối với quy trình phát triển được hỗ trợ AI.`
    },
    'v2.1.0': {
      title: '🚀 Task Viewer v2.1.0 Ghi chú Phát hành',
      date: 'Ngày phát hành: 29 tháng 7, 2025',
      content: `# 🚀 Task Viewer v2.1.0 Ghi chú Phát hành

*Ngày phát hành: 29 tháng 7, 2025*

## 🎉 Tính năng Mới

### 🔗 Đường dẫn File Có thể nhấp với Hỗ trợ Project Root
**Sao chép đường dẫn file đầy đủ chỉ với một cú nhấp!**

- **Đường dẫn File Nhấp để Sao chép**: Hiện tại khi bạn nhấp vào một tác vụ và vào trang Chi tiết Tác vụ, nếu có các file liên quan được liệt kê mà tác vụ sửa đổi hoặc tạo, tên file đó sẽ có hyperlink đến file thực tế trong hệ thống file của bạn

### 📋 Quản lý UUID Nâng cao
**Sao chép UUID đơn giản hóa với tương tác trực quan**

Khi tương tác với Claude, đôi khi việc dễ dàng tham chiếu một tác vụ shrimp sẽ hữu ích, ví dụ: "Claude, vui lòng hoàn thành tác vụ shrimp này: da987923-2afe-4ac3-985e-ac029cc831e7". Do đó, chúng tôi đã thêm tính năng Nhấp để Sao chép trên các badge Task # và UUID được liệt kê trong cột Tên Tác vụ.

- **Nhấp để Sao chép Badge Tác vụ**: Nhấp vào bất kỳ badge số tác vụ nào để ngay lập tức sao chép UUID của nó
- **UUID nối được hiển thị dưới tên tác vụ trong Cột Tên Tác vụ**: Nhấp vào UUID để sao chép

### 🔄 Cột Phụ thuộc Tác vụ cho Parallelization Dễ dàng

Chúng tôi đã thêm cột Phụ thuộc liệt kê các UUID liên kết của bất kỳ tác vụ phụ thuộc nào. Giờ đây bạn có thể dễ dàng điều hướng đến các tác vụ phụ thuộc.

### 🤖 Hành động Hướng dẫn AI
**Hướng dẫn tác vụ AI một cú nhấp**

Chúng tôi đã thêm Cột Hành động có emoji Robot hữu ích. Nếu bạn nhấp vào emoji, nó sẽ sao chép Hướng dẫn AI vào clipboard mà sau đó bạn có thể dán vào chat agent của mình. Hướng dẫn đã được mã hóa để sao chép như sau: "Sử dụng task manager để hoàn thành tác vụ shrimp này: < UUID >"

Hướng dẫn này hữu ích cho parallelization. Ví dụ, nếu 3 tác vụ sau không có phụ thuộc, bạn có thể mở nhiều cửa sổ terminal và dán Hướng dẫn AI.

## 🔄 Thay đổi

### Cải tiến UI/UX
- **Hành động Sao chép Đơn giản hóa**: Sao chép UUID được tích hợp chỉ vào nhấp badge tác vụ
- **Phụ thuộc thay vì Ghi chú**: Thay thế cột Ghi chú bằng cột Phụ thuộc hữu ích hơn
- **Ghi chú Phát hành Trong Ứng dụng**: Ghi chú phát hành cho task viewer hiển thị trong banner trên cùng

## 🐛 Sửa lỗi

### 🚨 SỬA LỖI QUAN TRỌNG: Upload File Tạo Bản sao Tĩnh
**Vấn đề**: Khi thêm profile bằng cách upload file tasks.json, hệ thống đang tạo bản sao tĩnh trong thư mục /tmp/. Điều này có nghĩa là bất kỳ thay đổi nào đối với file tác vụ thực tế của bạn sẽ KHÔNG được phản ánh trong viewer.

**Giải pháp**: Hoàn toàn loại bỏ upload file. Giờ đây bạn phải nhập đường dẫn thư mục trực tiếp, và hệ thống tự động thêm /tasks.json. Điều này đảm bảo viewer luôn đọc từ file thực tế trực tiếp của bạn.`
    }
  },
  readme: {
    title: '🦐 Shrimp Task Manager Viewer',
    content: `# 🦐 Shrimp Task Manager Viewer

Giao diện web hiện đại dựa trên React để xem và quản lý các tác vụ của [Shrimp Task Manager](https://github.com/cjo4m06/mcp-shrimp-task-manager) được tạo thông qua công cụ MCP (Model Context Protocol). Giao diện trực quan này cho phép bạn xem thông tin tác vụ chi tiết, theo dõi tiến độ qua nhiều dự án và dễ dàng sao chép UUID tác vụ để tương tác với AI agent.

## Tại sao sử dụng Shrimp Task Viewer?

Khi sử dụng Shrimp Task Manager làm MCP server với các AI agent như Claude, viewer này cung cấp khả năng hiển thị cần thiết vào hệ sinh thái tác vụ của bạn:

- **Tổng quan tác vụ trực quan**: Xem tất cả tác vụ, trạng thái, phụ thuộc và tiến độ trong giao diện tab sạch sẽ
- **Quản lý UUID**: Nhấp vào bất kỳ badge tác vụ nào để ngay lập tức sao chép UUID cho các lệnh như "Sử dụng task manager để hoàn thành tác vụ shrimp này: [UUID]"
- **Thực thi song song**: Mở nhiều terminal và sử dụng cột AI Actions (🤖) để sao chép hướng dẫn tác vụ
- **Cập nhật trực tiếp**: Đọc đường dẫn file trực tiếp đảm bảo bạn luôn thấy trạng thái tác vụ hiện tại
- **Hỗ trợ đa dự án**: Quản lý tác vụ qua các dự án khác nhau với các tab profile có thể kéo

## 🌟 Tính năng

### 🏷️ Giao diện Tab Hiện đại
- **Tab có thể Kéo**: Sắp xếp lại profile bằng cách kéo tab
- **Thiết kế Chuyên nghiệp**: Tab kiểu trình duyệt kết nối liền mạch với nội dung
- **Phản hồi Trực quan**: Chỉ báo tab hoạt động rõ ràng và hiệu ứng hover

### 🔍 Tìm kiếm & Lọc Nâng cao
- **Tìm kiếm Thời gian Thực**: Lọc tác vụ tức thì theo tên, mô tả, trạng thái hoặc ID
- **Cột có thể Sắp xếp**: Nhấp header cột để sắp xếp theo bất kỳ trường nào
- **Thiết kế Đáp ứng**: Hoạt động hoàn hảo trên desktop, tablet và mobile

### 🔄 Làm mới Tự động Thông minh
- **Khoảng thời gian Có thể Cấu hình**: Chọn từ 5s, 10s, 15s, 30s, 1m, 2m hoặc 5m
- **Điều khiển Thông minh**: Toggle làm mới tự động với lựa chọn khoảng thời gian
- **Làm mới Thủ công**: Nút làm mới chuyên dụng để cập nhật theo yêu cầu

### 📊 Quản lý Tác vụ Toàn diện
- **Thống kê Tác vụ**: Đếm trực tiếp cho Tổng, Hoàn thành, Đang thực hiện và Đang chờ
- **Quản lý Profile**: Thêm/xóa/sắp xếp lại profile qua giao diện trực quan
- **Cài đặt Bền vững**: Cấu hình profile lưu qua các phiên

## 🚀 Khởi động Nhanh

### Cài đặt & Thiết lập

1. **Clone và điều hướng đến thư mục task viewer**
   \`\`\`bash
   cd path/to/mcp-shrimp-task-manager/tools/task-viewer
   \`\`\`

2. **Cài đặt dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Build ứng dụng React**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Khởi động server**
   \`\`\`bash
   npm start
   \`\`\`

   Viewer sẽ có sẵn tại http://localhost:9998

### Chế độ Phát triển

Để phát triển với hot reload:

\`\`\`bash
# Khởi động development server
npm run dev
\`\`\`

Ứng dụng sẽ có sẵn tại http://localhost:3000 với rebuild tự động khi file thay đổi.

## 🖥️ Sử dụng

### Bắt đầu

1. **Khởi động server**: npm start
2. **Mở trình duyệt**: Điều hướng đến http://127.0.0.1:9998
3. **Thêm profile đầu tiên**: Nhấp nút "+ Thêm Tab" và nhập chi tiết profile
4. **Quản lý tác vụ**: Sử dụng tab để chuyển đổi profile, tìm kiếm tác vụ và cấu hình auto-refresh

## 📄 Giấy phép

Giấy phép MIT - xem giấy phép dự án chính để biết chi tiết.

## 🤝 Đóng góp

Công cụ này là một phần của dự án MCP Shrimp Task Manager. Hoan nghênh đóng góp!

**Quản lý tác vụ vui vẻ! 🦐✨**

Được xây dựng với ❤️ sử dụng React, Vite và công nghệ web hiện đại.`
  }
};