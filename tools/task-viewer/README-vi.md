# 🦐 Shrimp Task Manager Viewer

Giao diện web hiện đại dựa trên React để xem và quản lý các tác vụ của [Shrimp Task Manager](https://github.com/cjo4m06/mcp-shrimp-task-manager) được tạo thông qua công cụ MCP (Model Context Protocol). Giao diện trực quan này cho phép bạn xem thông tin tác vụ chi tiết, theo dõi tiến độ qua nhiều dự án và dễ dàng sao chép UUID tác vụ để tương tác với AI agent.

## Tại sao sử dụng Shrimp Task Viewer?

Khi sử dụng Shrimp Task Manager làm MCP server với các AI agent như Claude, viewer này cung cấp khả năng hiển thị cần thiết vào hệ sinh thái tác vụ của bạn:

- **Tổng quan tác vụ trực quan**: Xem tất cả tác vụ, trạng thái, phụ thuộc và tiến độ trong giao diện tab sạch sẽ
- **Quản lý UUID**: Nhấp vào bất kỳ badge tác vụ nào để ngay lập tức sao chép UUID cho các lệnh như `"Sử dụng task manager để hoàn thành tác vụ shrimp này: [UUID]"`
- **Thực thi song song**: Mở nhiều terminal và sử dụng cột AI Actions (🤖) để sao chép hướng dẫn tác vụ cho việc thực thi AI agent song song
- **Cập nhật trực tiếp**: Đọc đường dẫn file trực tiếp đảm bảo bạn luôn thấy trạng thái tác vụ hiện tại
- **Hỗ trợ đa dự án**: Quản lý tác vụ qua các dự án khác nhau với các tab profile có thể kéo

Để biết thông tin về thiết lập Shrimp Task Manager làm MCP server, xem [repository chính](https://github.com/cjo4m06/mcp-shrimp-task-manager).

## 📖 Tài liệu chi tiết từng trang

### 📋 Trang Tác vụ

Trang Tác vụ chính là trung tâm điều khiển để quản lý tác vụ. Nó cung cấp view toàn diện về tất cả tác vụ trong profile đã chọn với các tính năng mạnh mẽ cho tổ chức và thực thi.

![Tổng quan Trang Tác vụ](task-viewer-interface.png)

**Tính năng chính:**
- **Bảng Tác vụ**: Hiển thị tất cả tác vụ với các cột có thể sắp xếp bao gồm Số Tác vụ, Trạng thái, Agent, Ngày Tạo, Tên, Phụ thuộc và Hành động
- **Badge Trạng thái**: Badge màu (🟡 Đang chờ, 🔵 Đang thực hiện, 🟢 Hoàn thành, 🔴 Bị chặn)
- **Gán Agent**: Bộ chọn dropdown để gán các AI agent cụ thể cho tác vụ
- **Popup Xem Agent**: Nhấp vào biểu tượng mắt (👁️) để mở popup nơi bạn có thể duyệt và chọn agent
- **Cột Phụ thuộc**: Hiển thị các ID tác vụ liên kết với chức năng nhấp để điều hướng
- **Cột Hành động**: Chứa emoji robot mạnh mẽ (🤖) để thực thi tác vụ AI
- **Điều hướng Chi tiết Tác vụ**: Khi xem chi tiết tác vụ, sử dụng nút ← Trước và Tiếp theo → để nhanh chóng điều hướng giữa các tác vụ

#### 🤖 Emoji Robot - Thực thi Tác vụ AI

Emoji robot trong cột Hành động là tính năng mạnh mẽ để thực thi tác vụ được hỗ trợ AI:

![Tooltip Hướng dẫn Emoji Robot](releases/agent-copy-instruction-tooltip.png)

**Cách hoạt động:**
1. **Nhấp emoji 🤖** để sao chép hướng dẫn thực thi tác vụ vào clipboard
2. **Với tác vụ có agent**: Sao chép `sử dụng subagent có sẵn nằm trong ./claude/agents/[agent-name] để hoàn thành tác vụ shrimp này: [task-id] vui lòng khi bắt đầu làm việc đánh dấu tác vụ shrimp đang thực hiện`
3. **Với tác vụ không có agent**: Sao chép `Sử dụng task manager để hoàn thành tác vụ shrimp này: [task-id] vui lòng khi bắt đầu làm việc đánh dấu tác vụ shrimp đang thực hiện`
4. **Phản hồi trực quan**: Emoji thay đổi thành ✓ một thời gian ngắn để xác nhận hành động sao chép

**Trường hợp sử dụng:**
- **Thực thi Song song**: Mở nhiều cửa sổ terminal với các AI agent khác nhau và dán hướng dẫn để xử lý tác vụ đồng thời
- **Chuyên môn hóa Agent**: Gán các agent chuyên biệt (ví dụ: `react-components.md`, `database-specialist.md`) cho các tác vụ phù hợp
- **Chuyển giao nhanh**: Nhanh chóng ủy thác tác vụ cho AI agent mà không cần gõ lệnh phức tạp

#### 🤖 Gán Agent hàng loạt bằng AI

Trang Tác vụ hiện bao gồm gán agent hàng loạt bằng AI sử dụng GPT-4 của OpenAI:

**Cách sử dụng:**
1. **Chọn Tác vụ**: Sử dụng checkbox để chọn nhiều tác vụ cần gán agent
2. **Thanh Hành động Hàng loạt**: Một thanh màu xanh xuất hiện hiển thị "🤖 Gán Agent AI (đã chọn X tác vụ)"
3. **Gán Một lần nhấp**: Nhấp nút để GPT-4 phân tích tác vụ và gán agent phù hợp
4. **Khớp Tự động**: AI xem xét mô tả tác vụ, phụ thuộc và khả năng agent

**Yêu cầu Thiết lập:**
1. **Cấu hình API Key**: Đi đến Cài đặt → Cài đặt Toàn cục
2. **Nhập OpenAI Key**: Dán OpenAI API key vào trường (hiển thị là ✓ Đã cấu hình khi đặt)
3. **Phương pháp Thay thế**: Đặt biến môi trường `OPENAI_API_KEY` hoặc `OPEN_AI_KEY_SHRIMP_TASK_VIEWER`
4. **Lấy API Key**: Truy cập [OpenAI Platform](https://platform.openai.com/api-keys) để tạo key

![Cài đặt Toàn cục OpenAI Key](releases/global-settings-openai-key.png)
*Trang Cài đặt Toàn cục cung cấp trường an toàn để cấu hình OpenAI API key của bạn*

#### 📝 View Chi tiết Tác vụ

Nhấp vào bất kỳ hàng tác vụ nào để mở view chi tiết tác vụ với thông tin toàn diện:

**Tính năng:**
- **Thông tin Tác vụ Đầy đủ**: Xem mô tả hoàn chỉnh, ghi chú, hướng dẫn thực hiện và tiêu chí xác minh
- **Điều hướng Tác vụ**: Sử dụng nút ← Trước và Tiếp theo → để di chuyển giữa các tác vụ mà không quay lại danh sách
- **File Liên quan**: Xem tất cả file liên quan với tác vụ với số dòng
- **Biểu đồ Phụ thuộc**: Đại diện trực quan cho phụ thuộc tác vụ
- **Chế độ Chỉnh sửa**: Nhấp Chỉnh sửa để sửa đổi chi tiết tác vụ (cho tác vụ chưa hoàn thành)
- **Hành động Nhanh**: Sao chép ID tác vụ, xem JSON thô hoặc xóa tác vụ

**Lợi ích Điều hướng:**
- **Xem xét Hiệu quả**: Nhanh chóng xem xét nhiều tác vụ theo thứ tự
- **Bảo tồn Ngữ cảnh**: Ở lại trong view chi tiết khi di chuyển giữa các tác vụ
- **Hỗ trợ Bàn phím**: Sử dụng phím mũi tên để điều hướng nhanh hơn

### 📜 Trang Lịch sử Dự án

Trang Lịch sử Dự án cung cấp thông tin chi tiết có giá trị về sự phát triển của dự án bằng cách hiển thị các bản chụp của tác vụ hoàn thành được lưu bởi Shrimp Task Manager.

![Tổng quan Lịch sử Dự án](releases/project-history-view.png)

**Tính năng:**
- **View Timeline**: Duyệt qua các bản chụp lịch sử của trạng thái tác vụ dự án
- **File Bộ nhớ**: Tự động lưu bởi Shrimp Task Manager khi bắt đầu phiên mới
- **Tiến hóa Tác vụ**: Theo dõi cách tác vụ tiến triển từ tạo đến hoàn thành
- **Hệ thống Ghi chú**: Thêm chú thích cá nhân vào các mục lịch sử

![Chi tiết Lịch sử Dự án](releases/project-history-detail-view.png)

**Điều hướng:**
- Nhấp vào bất kỳ mục lịch sử nào để xem trạng thái tác vụ chi tiết tại thời điểm đó
- Sử dụng nút điều hướng để di chuyển giữa các bản chụp khác nhau
- Tìm kiếm và lọc tác vụ lịch sử giống như trong view tác vụ chính

### 🤖 Trang Sub-Agent

Trang Sub-Agent cho phép bạn quản lý các agent AI chuyên biệt có thể được gán cho tác vụ để thực thi tối ưu.

![View Danh sách Agent với Hướng dẫn AI](releases/agent-list-view-with-ai-instruction.png)

**Tính năng:**
- **Thư viện Agent**: Xem tất cả agent có sẵn từ thư mục `.claude/agents`
- **Cột Hướng dẫn AI**: Nhấp emoji robot (🤖) để ngay lập tức sao chép hướng dẫn sử dụng agent
  - Ví dụ: `sử dụng subagent debugger.md nằm trong ./claude/agents để thực hiện:`
  - Không cần gõ đường dẫn agent thủ công hoặc nhớ cú pháp
  - Phản hồi trực quan xác nhận sao chép thành công vào clipboard
- **Editor Agent**: Editor markdown tích hợp để tạo và sửa đổi agent
- **Mã hóa Màu**: Gán màu cho agent để tổ chức trực quan
- **Gán Agent**: Dễ dàng gán agent cho tác vụ qua dropdown trong bảng tác vụ
- **Popup Xem Agent**: Nhấp biểu tượng mắt (👁️) để duyệt và chọn agent

![Editor Agent](releases/agent-editor-color-selection.png)

**Quy trình Gán Agent:**

![Dropdown Agent](releases/agent-dropdown-task-table.png)

1. **Chọn agent** từ dropdown trong bảng tác vụ
2. **Hoặc nhấp biểu tượng mắt (👁️)** để mở popup xem agent
3. **Duyệt qua agent** trong popup để tìm agent phù hợp cho tác vụ
4. **Lưu tự động** cập nhật metadata của tác vụ
5. **Sử dụng emoji robot** để sao chép hướng dẫn thực thi cụ thể của agent

![Popup Xem Agent](releases/agent-viewer-popup.png)
*Popup xem agent cho phép bạn duyệt qua tất cả agent có sẵn và chọn agent tốt nhất cho từng tác vụ*

### 🎨 Trang Template

Quản lý các template hướng dẫn AI định hướng cách Shrimp Task Manager phân tích và thực thi các loại thao tác khác nhau.

![Quản lý Template](releases/template-management-system.png)

**Khả năng:**
- **Editor Template**: Editor markdown đầy đủ tính năng với syntax highlighting
- **Loại Template**: Trạng thái Mặc định, Tùy chỉnh và Tùy chỉnh+Thêm
- **Xem trước Trực tiếp**: Xem hiệu ứng template trước khi kích hoạt
- **Xuất/Nhập**: Chia sẻ template với thành viên nhóm

### ⚙️ Cài đặt Toàn cục

Cấu hình cài đặt toàn hệ thống bao gồm đường dẫn thư mục Claude để truy cập agent toàn cục.

**Cài đặt Bao gồm:**
- **Đường dẫn Thư mục Claude**: Đặt đường dẫn đến thư mục `.claude` toàn cục
- **Cấu hình API Key**: Quản lý biến môi trường cho dịch vụ AI
- **Tùy chọn Ngôn ngữ**: Chuyển đổi giữa các ngôn ngữ được hỗ trợ

## 🌟 Tính năng

### 🏷️ Giao diện Tab Hiện đại
- **Tab có thể Kéo**: Sắp xếp lại profile bằng cách kéo tab
- **Thiết kế Chuyên nghiệp**: Tab kiểu trình duyệt kết nối liền mạch với nội dung
- **Phản hồi Trực quan**: Chỉ báo tab hoạt động rõ ràng và hiệu ứng hover
- **Thêm Profile Mới**: Nút "+" tích hợp phù hợp với thiết kế giao diện

### 🔍 Tìm kiếm & Lọc Nâng cao
- **Tìm kiếm Thời gian Thực**: Lọc tác vụ tức thì theo tên, mô tả, trạng thái hoặc ID
- **Cột có thể Sắp xếp**: Nhấp header cột để sắp xếp theo bất kỳ trường nào
- **TanStack Table**: Component bảng mạnh mẽ với phân trang và lọc
- **Thiết kế Đáp ứng**: Hoạt động hoàn hảo trên desktop, tablet và mobile

### 🔄 Làm mới Tự động Thông minh
- **Khoảng thời gian Có thể Cấu hình**: Chọn từ 5s, 10s, 15s, 30s, 1m, 2m hoặc 5m
- **Điều khiển Thông minh**: Toggle làm mới tự động với lựa chọn khoảng thời gian
- **Chỉ báo Trực quan**: Trạng thái tải và trạng thái làm mới
- **Làm mới Thủ công**: Nút làm mới chuyên dụng để cập nhật theo yêu cầu

### 📊 Quản lý Tác vụ Toàn diện
- **Thống kê Tác vụ**: Đếm trực tiếp cho Tổng, Hoàn thành, Đang thực hiện và Đang chờ
- **Quản lý Profile**: Thêm/xóa/sắp xếp lại profile qua giao diện trực quan
- **Cài đặt Bền vững**: Cấu hình profile lưu qua các phiên
- **Hot Reload**: Chế độ phát triển với cập nhật tức thì

### 🤖 Tính năng Được hỗ trợ AI
- **Gán Agent Hàng loạt**: Chọn nhiều tác vụ và sử dụng GPT-4 để tự động gán agent phù hợp nhất
- **Tích hợp OpenAI**: Cấu hình API key trong Cài đặt Toàn cục hoặc qua biến môi trường
- **Khớp Thông minh**: AI phân tích mô tả tác vụ và khả năng agent để gán tối ưu
- **Hướng dẫn Lỗi**: Hướng dẫn rõ ràng nếu API key chưa được cấu hình

### 📚 Kiểm soát Phiên bản & Lịch sử
- **Tích hợp Git**: Commit Git tự động theo dõi mọi thay đổi đối với tasks.json với thông báo có timestamp
- **Đường mòn Kiểm toán Hoàn chỉnh**: Xem xét lịch sử đầy đủ của các sửa đổi tác vụ bằng công cụ Git tiêu chuẩn
- **Thao tác Không chặn**: Lỗi Git không ngắt quản lý tác vụ
- **Repository Tách biệt**: Lịch sử tác vụ được theo dõi riêng biệt khỏi repository dự án của bạn

### 🎨 UI/UX Chuyên nghiệp
- **Theme Tối**: Tối ưu cho môi trường phát triển
- **Layout Đáp ứng**: Thích ứng với mọi kích thước màn hình
- **Khả năng Truy cập**: Điều hướng bàn phím đầy đủ và hỗ trợ trình đọc màn hình
- **Phần tử Tương tác**: Tooltip hover và phản hồi trực quan xuyên suốt

## 🚀 Khởi động Nhanh

### Cài đặt & Thiết lập

1. **Clone và điều hướng đến thư mục task viewer**
   ```bash
   cd path/to/mcp-shrimp-task-manager/tools/task-viewer
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Build ứng dụng React**
   ```bash
   npm run build
   ```

4. **Khởi động server**
   ```bash
   npm start
   ```

   Viewer sẽ có sẵn tại `http://localhost:9998`

### Chế độ Phát triển

Để phát triển với hot reload:

```bash
# Khởi động cả API server và development server
npm run start:all

# Hoặc chạy riêng biệt:
npm start          # API server trên port 9998
npm run dev        # Vite dev server trên port 3000
```

Ứng dụng sẽ có sẵn tại `http://localhost:3000` với rebuild tự động khi file thay đổi.

### Triển khai Production

#### Triển khai Tiêu chuẩn

```bash
# Build cho production
npm run build

# Khởi động production server
npm start
```

#### Dịch vụ Systemd (Linux)

Để khởi động tự động và quản lý process:

1. **Cài đặt làm dịch vụ**
   ```bash
   sudo ./install-service.sh
   ```

2. **Quản lý dịch vụ**
   ```bash
   # Kiểm tra trạng thái
   systemctl status shrimp-task-viewer
   
   # Khởi động/dừng/khởi động lại
   sudo systemctl start shrimp-task-viewer
   sudo systemctl stop shrimp-task-viewer
   sudo systemctl restart shrimp-task-viewer
   
   # Xem log
   journalctl -u shrimp-task-viewer -f
   
   # Tắt/bật tự khởi động
   sudo systemctl disable shrimp-task-viewer
   sudo systemctl enable shrimp-task-viewer
   ```

3. **Gỡ cài đặt dịch vụ**
   ```bash
   sudo ./uninstall-service.sh
   ```

## 🖥️ Sử dụng

### Bắt đầu

1. **Khởi động server**:
   ```bash
   npm start
   ```
   
   **Lưu ý**: Nếu bạn chưa build ứng dụng hoặc muốn sử dụng chế độ phát triển với hot reload, hãy dùng `npm run start:all` thay thế.

2. **Mở trình duyệt**:
   Điều hướng đến `http://127.0.0.1:9998` (production) hoặc `http://localhost:3000` (development)

3. **Thêm profile đầu tiên**:
   - Nhấp nút "**+ Thêm Tab**"
   - Nhập tên profile mô tả (ví dụ: "Tác vụ Nhóm Alpha")
   - Nhập đường dẫn đến thư mục dữ liệu shrimp chứa tasks.json
   - **Mẹo:** Điều hướng đến thư mục của bạn trong terminal và gõ `pwd` để lấy đường dẫn đầy đủ
   - Nhấp "**Thêm Profile**"

4. **Quản lý tác vụ**:
   - Chuyển đổi giữa profile bằng tab
   - Tìm kiếm tác vụ bằng hộp tìm kiếm
   - Sắp xếp cột bằng cách nhấp header
   - Cấu hình auto-refresh theo nhu cầu

### Quản lý Tab

- **Chuyển Profile**: Nhấp bất kỳ tab nào để chuyển đến profile đó
- **Sắp xếp lại Tab**: Kéo tab để sắp xếp theo thứ tự mong muốn
- **Thêm Profile Mới**: Nhấp nút "**+ Thêm Tab**"
- **Xóa Profile**: Nhấp × trên bất kỳ tab nào (có xác nhận)

### Tìm kiếm & Lọc

- **Tìm kiếm Toàn cục**: Gõ trong hộp tìm kiếm để lọc qua tất cả trường tác vụ
- **Sắp xếp Cột**: Nhấp bất kỳ header cột nào để sắp xếp (nhấp lại để đảo ngược)
- **Phân trang**: Điều hướng danh sách tác vụ lớn với điều khiển phân trang tích hợp
- **Cập nhật Thời gian Thực**: Tìm kiếm và sắp xếp cập nhật tức thì khi gõ

### Cấu hình Auto-refresh

1. **Bật Auto-refresh**: Đánh dấu checkbox "Auto-refresh"
2. **Đặt Khoảng thời gian**: Chọn từ dropdown (5s đến 5m)
3. **Làm mới Thủ công**: Nhấp nút 🔄 bất cứ lúc nào để làm mới tức thì
4. **Phản hồi Trực quan**: Spinner hiển thị trong quá trình làm mới

## 🔧 Cấu hình

### Biến Môi trường

Để làm cho biến môi trường bền vững qua các phiên terminal, thêm chúng vào file cấu hình shell:

**Cho macOS/Linux với Zsh** (mặc định trên macOS hiện đại):
```bash
# Thêm vào ~/.zshrc
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.zshrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.zshrc

# Reload cấu hình
source ~/.zshrc
```

**Cho Linux/Unix với Bash**:
```bash
# Thêm vào ~/.bashrc
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.bashrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.bashrc

# Reload cấu hình
source ~/.bashrc
```

**Tại sao thêm vào cấu hình shell?**
- **Bền vững**: Biến được đặt bằng `export` trong terminal chỉ tồn tại trong phiên đó
- **Nhất quán**: Tất cả cửa sổ terminal mới sẽ có những cài đặt này
- **Tiện lợi**: Không cần đặt biến mỗi lần khởi động server

**Biến Có sẵn**:
```bash
SHRIMP_VIEWER_PORT=9998           # Port server (mặc định: 9998)
SHRIMP_VIEWER_HOST=127.0.0.1      # Host server (chỉ localhost)
OPENAI_API_KEY=sk-...             # OpenAI API key cho gán agent AI
OPEN_AI_KEY_SHRIMP_TASK_VIEWER=sk-...  # Biến env thay thế cho OpenAI key
```

### Cấu hình Phát triển

- **Phát triển với hot reload (khuyến nghị cho phát triển)**:
  ```bash
  npm run start:all  # Chạy API server (9998) + Vite dev server (3000)
  ```
  
  **Tại sao dùng start:all?** Lệnh này chạy cả API server và Vite dev server đồng thời. Bạn có hot module replacement (HMR) tức thì cho thay đổi UI trong khi có đầy đủ chức năng API. Thay đổi xuất hiện ngay lập tức trong trình duyệt tại `http://localhost:3000` mà không cần làm mới thủ công.

- **Chỉ API server (cho production hoặc kiểm tra API)**:
  ```bash
  npm start  # Chạy trên port 9998
  ```
  
  **Tại sao chỉ dùng API server?** Dùng này khi bạn đã build file production và muốn kiểm tra ứng dụng hoàn chỉnh như sẽ chạy trong production, hoặc khi chỉ cần API endpoint.

- **Build và serve cho production**:
  ```bash
  npm run build && npm start  # Build rồi serve trên port 9998
  ```
  
  **Tại sao build cho production?** Build production tối ưu code bằng cách minify JavaScript, loại bỏ dead code và bundle asset hiệu quả. Kết quả là thời gian tải nhanh hơn và hiệu suất tốt hơn cho người dùng cuối. Luôn dùng build production khi triển khai.

### Lưu trữ Dữ liệu Profile

**Hiểu Quản lý Dữ liệu Profile**: Task Viewer sử dụng cách tiếp cận lai để lưu trữ dữ liệu ưu tiên cả tính bền vững và độ chính xác thời gian thực. Cấu hình profile (như tên tab, đường dẫn thư mục và thứ tự tab) được lưu cục bộ trong file cài đặt JSON trong thư mục home, trong khi dữ liệu tác vụ được đọc trực tiếp từ thư mục dự án theo thời gian thực.

- **File Cài đặt**: `~/.shrimp-task-viewer-settings.json`
  
  File ẩn này trong thư mục home lưu tất cả cấu hình profile bao gồm tên tab, đường dẫn thư mục, thứ tự tab và các tùy chọn khác. Nó tự động được tạo khi bạn thêm profile đầu tiên và cập nhật khi bạn thực hiện thay đổi. Bạn có thể chỉnh sửa file này thủ công nếu cần, nhưng hãy cẩn thận duy trì định dạng JSON hợp lệ.

- **File Tác vụ**: Đọc trực tiếp từ đường dẫn thư mục được chỉ định (không upload)
  
  Không như các ứng dụng web truyền thống upload và lưu bản sao file, Task Viewer đọc file `tasks.json` trực tiếp từ đường dẫn thư mục bạn chỉ định. Điều này đảm bảo bạn luôn thấy trạng thái hiện tại của tác vụ mà không cần upload lại hoặc đồng bộ. Khi thêm profile, bạn chỉ đơn giản nói với viewer nơi tìm file tasks.json.

- **Hot Reload**: Thay đổi phát triển rebuild tự động
  
  Khi chạy trong chế độ phát triển (`npm run dev`), bất kỳ thay đổi nào trong source code đều kích hoạt rebuild tự động và refresh trình duyệt. Điều này áp dụng cho React component, style và server code, làm cho phát triển nhanh hơn và hiệu quả hơn.

### Lịch sử Tác vụ Git

**Kiểm soát Phiên bản Tự động**: Bắt đầu từ v3.0, Shrimp Task Manager tự động theo dõi tất cả thay đổi tác vụ bằng Git. Điều này cung cấp đường mòn kiểm toán hoàn chỉnh mà không cần cấu hình thủ công.

- **Vị trí Repository**: `<shrimp-data-directory>/.git`
  
  Mỗi dự án có repository Git riêng trong thư mục dữ liệu được cấu hình trong file `.mcp.json`. Điều này hoàn toàn tách biệt khỏi repository Git chính của dự án, ngăn ngừa xung đột hoặc can thiệp.

- **Xem Lịch sử**: Sử dụng lệnh Git tiêu chuẩn để khám phá lịch sử tác vụ
  ```bash
  cd <shrimp-data-directory>
  git log --oneline          # Xem lịch sử commit
  git show <commit-hash>     # Xem thay đổi cụ thể
  git diff HEAD~5            # So sánh với 5 commit trước
  ```

- **Định dạng Commit**: Tất cả commit bao gồm timestamp và thông báo mô tả
  ```
  [2025-08-07T13:45:23-07:00] Thêm tác vụ mới: Implement user authentication
  [2025-08-07T14:12:10-07:00] Cập nhật tác vụ: Fix login validation
  [2025-08-07T14:45:55-07:00] Thao tác tác vụ hàng loạt: chế độ append, 6 tác vụ
  ```

- **Khôi phục**: Phục hồi trạng thái tác vụ trước đó nếu cần
  ```bash
  cd <shrimp-data-directory>
  git checkout <commit-hash> -- tasks.json  # Phục hồi phiên bản cụ thể
  git reset --hard <commit-hash>            # Reset đầy đủ về trạng thái trước
  ```

## 🏗️ Kiến trúc Kỹ thuật

### Stack Công nghệ

- **Frontend**: React 19 + Vite cho phát triển hot reload
- **Component Bảng**: TanStack React Table cho tính năng bảng nâng cao
- **Styling**: CSS tùy chỉnh với theme tối và thiết kế đáp ứng
- **Backend**: Server HTTP Node.js với RESTful API
- **Build System**: Vite cho phát triển nhanh và build production tối ưu

### Cấu trúc File

**Tổ chức Dự án**: Task Viewer theo cấu trúc modular sạch sẽ tách biệt concern và làm cho codebase dễ điều hướng và mở rộng. Mỗi thư mục và file có mục đích cụ thể trong kiến trúc ứng dụng.

```
task-viewer/
├── src/                       # Source code ứng dụng React
│   ├── App.jsx               # Component React chính - quản lý state, profile và tab
│   ├── components/           # Component React có thể tái sử dụng
│   │   ├── TaskTable.jsx     # Bảng TanStack để hiển thị và sắp xếp tác vụ
│   │   ├── Help.jsx          # Viewer README với render markdown
│   │   └── ReleaseNotes.jsx  # Lịch sử phiên bản với syntax highlighting
│   ├── data/                 # Dữ liệu tĩnh và cấu hình
│   │   └── releases.js       # Metadata release và thông tin phiên bản
│   └── index.css             # Hệ thống styling hoàn chỉnh với theme tối
├── releases/                  # File markdown release notes và hình ảnh
│   ├── v*.md                 # File release note từng phiên bản
│   └── *.png                 # Screenshot và hình ảnh cho release
├── dist/                     # Output build production (tự động tạo)
│   ├── index.html            # Entry point HTML tối ưu
│   └── assets/               # JS, CSS và asset khác được bundle
├── server.js                 # API server Node.js kiểu Express
├── cli.js                    # Command-line interface cho quản lý service
├── vite.config.js            # Cấu hình build tool cho development/production
├── package.json              # Metadata dự án, dependency và npm script
├── install-service.sh        # Trình cài đặt service systemd Linux
└── README.md                 # Tài liệu toàn diện (file này)
```

**Thư mục Chính Được giải thích**:

- **`src/`**: Chứa tất cả source code React. Đây là nơi bạn sẽ thực hiện hầu hết thay đổi UI.
- **`dist/`**: Build production tự động tạo. Không bao giờ chỉnh sửa trực tiếp những file này.
- **`releases/`**: Lưu release note ở định dạng markdown với hình ảnh liên quan.
- **File Root**: File cấu hình và server xử lý building, serving và deployment.

### API Endpoint

- `GET /` - Phục vụ ứng dụng React
- `GET /api/agents` - Liệt kê tất cả profile được cấu hình
- `GET /api/tasks/{profileId}` - Trả về tác vụ cho profile cụ thể
- `POST /api/add-profile` - Thêm profile mới với đường dẫn thư mục
- `DELETE /api/remove-profile/{profileId}` - Xóa profile
- `PUT /api/rename-profile/{profileId}` - Đổi tên profile
- `PUT /api/update-profile/{profileId}` - Cập nhật cài đặt profile
- `GET /api/readme` - Trả về nội dung README cho tab help
- `GET /releases/*.md` - Phục vụ file markdown release notes
- `GET /releases/*.png` - Phục vụ hình ảnh release notes

## 🛠️ Phát triển

### Thiết lập Môi trường Phát triển

```bash
# Cài đặt dependency
npm install

# Khởi động development server với hot reload
npm run dev

# Development server chạy trên http://localhost:3000
# Backend API server chạy trên http://localhost:9998
```

### Building cho Production

```bash
# Build bundle production tối ưu
npm run build

# File được tạo trong thư mục dist/
# Khởi động production server
npm start
```

### Mở rộng Giao diện

Kiến trúc React modular giúp dễ dàng mở rộng:

1. **Thêm Component Mới**: Tạo trong `src/components/`
2. **Sửa đổi Styling**: Chỉnh sửa `src/index.css` với CSS custom properties
3. **Thêm Tính năng**: Mở rộng `App.jsx` với state và functionality mới
4. **Tích hợp API**: Thêm endpoint trong `server.js`

## 🔒 Bảo mật & Hiệu suất

### Tính năng Bảo mật

- **Binding Localhost**: Server chỉ có thể truy cập từ máy local
- **Truy cập File Trực tiếp**: Đọc file tác vụ trực tiếp từ đường dẫn filesystem
- **Không Dependency Ngoài**: Tự đủ với bề mặt tấn công tối thiểu
- **Bảo vệ CORS**: API endpoint được bảo vệ với CORS header

### Tối ưu Hiệu suất

- **Hot Module Replacement**: Cập nhật development tức thì
- **Code Splitting**: Tải bundle tối ưu
- **Re-rendering Hiệu quả**: Pattern tối ưu React
- **Caching**: Static asset caching cho tải nhanh hơn
- **Responsive Image**: Tối ưu cho mọi kích thước thiết bị

## 🐛 Khắc phục Sự cố

### Vấn đề Thường gặp

**Server Không Khởi động**
```bash
# Kiểm tra port có đang được sử dụng
lsof -i :9998

# Kill process đang tồn tại
pkill -f "node.*server.js"

# Thử port khác
SHRIMP_VIEWER_PORT=8080 node server.js
```

**Tab Help/Readme Hiển thị HTML**
Nếu tab Help hiển thị HTML thay vì nội dung README, server cần khởi động lại để tải API endpoint mới:
```bash
# Dừng server (Ctrl+C) và khởi động lại
npm start
```

**Hot Reload Không hoạt động**
```bash
# Đảm bảo development dependency được cài đặt
npm install

# Khởi động lại development server
npm run dev
```

**Tác vụ Không tải**
1. Kiểm tra file `tasks.json` chứa JSON hợp lệ
2. Xác minh quyền file có thể đọc
3. Kiểm tra browser console cho thông báo lỗi
4. Sử dụng nút refresh thủ công để reload dữ liệu

**Lỗi Build**
```bash
# Xóa node_modules và cài đặt lại
rm -rf node_modules package-lock.json
npm install

# Xóa Vite cache
rm -rf dist/
npm run build
```

## 📋 Changelog

### Version 2.1.0 (Mới nhất) - 2025-07-29

#### 🚀 Tính năng Chính
- **Hỗ trợ Đường dẫn File Trực tiếp**: Thay thế upload file bằng nhập đường dẫn thư mục trực tiếp cho cập nhật trực tiếp
- **Tab Help/Readme**: Thêm tab documentation với render markdown
- **Tab Release Notes**: Viewer release note trong app với hỗ trợ hình ảnh  
- **Dependency Có thể nhấp**: Điều hướng giữa tác vụ phụ thuộc dễ dàng
- **Cột AI Actions**: Sao chép hướng dẫn AI để hoàn thành tác vụ
- **Quản lý UUID Cải tiến**: Nhấp badge tác vụ để sao chép UUID
- **Chỉnh sửa Profile**: Đổi tên profile và cấu hình project root
- **Hỗ trợ ES Module**: Chuyển đổi sang ES module để tương thích tốt hơn

#### 🐛 Sửa lỗi Quan trọng
- **Sửa Vấn đề Sao chép File Tĩnh**: File hiện được đọc trực tiếp từ đường dẫn chỉ định thay vì tạo bản sao tĩnh trong `/tmp/`

### Version 1.0.3 - 2025-07-26

#### 🧪 Kiểm tra & Độ tin cậy
- **Test Suite Toàn diện**: Thêm coverage test đầy đủ với Vitest
- **Component Test**: React Testing Library test cho tất cả component
- **Integration Test**: End-to-end testing của server và API endpoint
- **Bug Fix**: Giải quyết xử lý multipart form data trong quản lý profile

### Version 1.0.2 - 2025-07-26

#### 🎨 Task Detail View
- **Điều hướng Trong Tab**: Thay thế modal bằng chi tiết tác vụ trong tab liền mạch
- **Nút Back**: Điều hướng dễ dàng trở lại danh sách tác vụ
- **UX Cải tiến**: Workflow tốt hơn không có gián đoạn popup

### Version 1.0.1 - 2025-07-13

#### 🎨 Cải tiến UI Lớn
- **Giao diện Tab Hiện đại**: Tab kiểu trình duyệt chuyên nghiệp với drag & drop reordering
- **Thiết kế Kết nối**: Kết nối trực quan liền mạch giữa tab và nội dung
- **Layout Cải tiến**: Tìm kiếm và điều khiển được định vị lại cho workflow tốt hơn

#### ⚡ Chức năng Nâng cao  
- **Auto-refresh Có thể cấu hình**: Chọn khoảng thời gian từ 5 giây đến 5 phút
- **Tìm kiếm Nâng cao**: Lọc thời gian thực qua tất cả trường tác vụ
- **Cột Có thể sắp xếp**: Nhấp header để sắp xếp theo bất kỳ cột nào
- **Hot Reload Development**: Cập nhật tức thì trong development

#### 🔧 Cải tiến Kỹ thuật
- **Kiến trúc React**: Viết lại hoàn toàn sử dụng React 19 + Vite
- **TanStack Table**: Component bảng chuyên nghiệp với phân trang
- **Thiết kế Đáp ứng**: Cách tiếp cận mobile-first với tối ưu breakpoint
- **Hiệu suất**: Render tối ưu và quản lý state hiệu quả

### Version 1.0.0 - 2025-07-01

#### 🚀 Release Ban đầu
- **Viewer Cơ bản**: Implementation ban đầu với giao diện web cơ bản
- **Quản lý Profile**: Thêm và xóa task profile
- **Server API**: RESTful endpoint cho dữ liệu tác vụ
- **Hiển thị Tác vụ**: Xem tác vụ từ nhiều dự án

## 📄 Giấy phép

Giấy phép MIT - xem giấy phép dự án chính để biết chi tiết.

## 🤝 Đóng góp

Công cụ này là một phần của dự án MCP Shrimp Task Manager. Hoan nghênh đóng góp!

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Thực hiện thay đổi với kiểm tra phù hợp
4. Commit thay đổi (`git commit -m 'Add amazing feature'`)
5. Push lên branch (`git push origin feature/amazing-feature`)
6. Gửi pull request

### Hướng dẫn Phát triển

- Tuân theo React best practice và pattern hook
- Duy trì nguyên tắc thiết kế đáp ứng
- Thêm kiểu TypeScript phù hợp khi áp dụng
- Kiểm tra qua các trình duyệt và thiết bị khác nhau
- Cập nhật documentation cho tính năng mới

---

**Quản lý tác vụ vui vẻ! 🦐✨**

Được xây dựng với ❤️ sử dụng React, Vite và công nghệ web hiện đại.