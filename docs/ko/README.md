[🇺🇸 English](../../README.md) | [🇩🇪 Deutsch](../de/README.md) | [🇪🇸 Español](../es/README.md) | [🇫🇷 Français](../fr/README.md) | [🇮🇹 Italiano](../it/README.md) | [🇮🇳 हिन्दी](../hi/README.md) | [🇯🇵 日本語](../ja/README.md) | [🇰🇷 한국어](README.md) | [🇧🇷 Português](../pt/README.md) | [🇷🇺 Русский](../ru/README.md) | [🇨🇳 中文](../zh/README.md)

# MCP Shrimp Task Manager

> 🦐 **AI 기반 개발을 위한 지능형 작업 관리** - 복잡한 프로젝트를 관리 가능한 작업으로 분해하고, 세션 간 컨텍스트를 유지하며, 개발 워크플로우를 가속화하세요.

<div align="center">
  
[![Shrimp Task Manager Demo](../yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

**[데모 영상 보기](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[빠른 시작](#-빠른-시작)** • **[문서](#-문서)**

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)
<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager"><img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" /></a>

</div>

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+ 
- npm 또는 yarn
- MCP 호환 AI 클라이언트 (Claude Code 등)

### 설치

#### Claude Code 설치

**Windows 11 (WSL2 사용):**
```bash
# 먼저 WSL2가 설치되어 있는지 확인 (PowerShell을 관리자로 실행)
wsl --install

# Ubuntu/WSL 환경으로 진입
wsl -d Ubuntu

# Claude Code 전역 설치
npm install -g @anthropic-ai/claude-code

# Claude Code 시작
claude
```

**macOS/Linux:**
```bash
# Claude Code 전역 설치
npm install -g @anthropic-ai/claude-code

# Claude Code 시작
claude
```

#### Shrimp Task Manager 설치

```bash
# 저장소 클론
git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git
cd mcp-shrimp-task-manager

# 의존성 설치
npm install

# 프로젝트 빌드
npm run build
```

### Claude Code 설정

프로젝트 디렉토리에 `.mcp.json` 파일을 생성하세요:

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/your/shrimp_data",
        "TEMPLATES_USE": "ko",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

설정 예시:
```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/home/fire/claude/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/home/fire/claude/project/shrimp_data",
        "TEMPLATES_USE": "ko",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

그런 다음 사용자 정의 MCP 설정으로 Claude Code를 시작하세요:

```bash
claude --dangerously-skip-permissions --mcp-config .mcp.json
```

<details>
<summary><b>기타 AI 클라이언트</b></summary>

**Cline (VS Code 확장)**: AI 지원 코딩을 위한 VS Code 확장. VS Code settings.json의 `cline.mcpServers`에 추가

**Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) 또는 `%APPDATA%\Claude\claude_desktop_config.json` (Windows)에 추가
</details>

### 사용 시작

1. **프로젝트 초기화**: `"init project rules"`
2. **작업 계획**: `"plan task: 사용자 인증 구현"`
3. **작업 실행**: `"execute task"` 또는 `"continuous mode"`

## 💡 Shrimp란 무엇인가요?

Shrimp Task Manager는 AI 에이전트가 소프트웨어 개발에 접근하는 방식을 변화시키는 MCP (Model Context Protocol) 서버입니다. 컨텍스트를 잃거나 작업을 반복하는 대신, Shrimp는 다음을 제공합니다:

- **🧠 지속적인 메모리**: 작업과 진행 상황이 세션 간에 유지됩니다
- **📋 구조화된 워크플로우**: 계획, 실행, 검증을 위한 가이드된 프로세스
- **🔄 지능형 분해**: 복잡한 작업을 자동으로 관리 가능한 하위 작업으로 분해
- **🎯 컨텍스트 보존**: 토큰 제한이 있어도 위치를 잃지 않습니다

## ✨ 핵심 기능

### 작업 관리
- **지능형 계획**: 구현 전 요구사항의 심층 분석
- **작업 분해**: 큰 프로젝트를 원자적이고 테스트 가능한 단위로 분할
- **의존성 추적**: 작업 관계의 자동 관리
- **진행 상황 모니터링**: 실시간 상태 추적 및 업데이트

### 고급 기능
- **🔬 연구 모드**: 기술과 솔루션의 체계적 탐색
- **🤖 에이전트 시스템**: 특정 작업에 전문 AI 에이전트 할당 ([더 알아보기](../agents.md))
- **📏 프로젝트 규칙**: 프로젝트 내 코딩 표준 정의 및 유지
- **💾 작업 메모리**: 작업 기록의 자동 백업 및 복원

### 웹 인터페이스

#### 🖥️ Task Viewer
드래그 앤 드롭, 실시간 검색, 다중 프로필 지원이 있는 시각적 작업 관리를 위한 현대적인 React 인터페이스.

**빠른 설정:**
```bash
cd tools/task-viewer
npm install
npm run start:all
# http://localhost:5173에서 접근
```

[📖 전체 Task Viewer 문서](../../tools/task-viewer/README.md)

<kbd><img src="../../tools/task-viewer/task-viewer-interface.png" alt="Task Viewer 인터페이스" width="600"/></kbd>

#### 🌐 Web GUI
빠른 작업 개요를 위한 선택적 경량 웹 인터페이스.

`.env`에서 활성화: `ENABLE_GUI=true`

## 📚 문서

- [📖 전체 문서](../README.md)
- [🛠️ 사용 가능한 도구](../tools.md)
- [🤖 에이전트 관리](../agents.md)
- [🎨 프롬프트 사용자 정의](prompt-customization.md)
- [🔧 API 참조](../api.md)

## 🎯 일반적인 사용 사례

<details>
<summary><b>기능 개발</b></summary>

```
에이전트: "plan task: JWT를 사용한 사용자 인증 추가"
# 에이전트가 코드베이스를 분석하고 하위 작업을 생성

에이전트: "execute task"
# 단계별로 인증을 구현
```
</details>

<details>
<summary><b>버그 수정</b></summary>

```
에이전트: "plan task: 데이터 처리의 메모리 누수 수정"
# 에이전트가 문제를 조사하고 수정 계획을 생성

에이전트: "continuous mode"
# 모든 수정 작업을 자동으로 실행
```
</details>

<details>
<summary><b>연구 및 학습</b></summary>

```
에이전트: "research: 이 프로젝트에 대한 React vs Vue 비교"
# 장단점이 있는 체계적 분석

에이전트: "plan task: 선택한 프레임워크로 컴포넌트 마이그레이션"
# 연구를 기반으로 마이그레이션 계획 생성
```
</details>

## 🛠️ 설정

### 환경 변수

`.env` 파일을 생성하세요:

```bash
# 필수
DATA_DIR=/path/to/data/storage

# 선택사항
ENABLE_GUI=true          # 웹 GUI 활성화
WEB_PORT=3000           # 사용자 정의 웹 포트
PROMPT_LANGUAGE=ko      # 프롬프트 언어 (ko, en, zh 등)
```

### 사용 가능한 명령어

| 명령어 | 설명 |
|---------|-------------|
| `init project rules` | 프로젝트 표준 초기화 |
| `plan task [설명]` | 작업 계획 생성 |
| `execute task [id]` | 특정 작업 실행 |
| `continuous mode` | 모든 작업을 순차적으로 실행 |
| `list tasks` | 모든 작업 표시 |
| `research [주제]` | 연구 모드 진입 |
| `reflect task [id]` | 작업 검토 및 개선 |

## 🤝 기여

기여를 환영합니다! 자세한 내용은 [기여 가이드](../../CONTRIBUTING.md)를 참조하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다 - 자세한 내용은 [LICENSE](../../LICENSE) 파일을 참조하세요.

## 🌟 크레딧

[cjo4m06](https://github.com/cjo4m06)이 만들고 커뮤니티에서 유지 관리합니다.

---

<p align="center">
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager">GitHub</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/issues">Issues</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/discussions">토론</a>
</p>