// 릴리스 메타데이터 전용 - 실제 콘텐츠는 /releases/*.md 파일에서 로드됩니다
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: '작업 완료 요약 저장 시스템',
    summary: '구조화된 데이터 모델과 지능형 요약 파싱 기능을 통한 향상된 작업 완료 세부 정보'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: '향상된 릴리스 노트 및 아카이브 시스템',
    summary: '초기 요청 표시를 통한 컨텍스트 추적, AI 기반 요약, 목차가 포함된 향상된 릴리스 노트, 종합적인 아카이브 관리'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: '초기 요청 표시',
    summary: '작업 계획을 시작한 원본 사용자 요청을 캡처하고 표시하여 작업 목록에 필수적인 컨텍스트 제공'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: '국제화, 작업 히스토리, 하위 에이전트, 라이트박스',
    summary: '다국어 지원, 템플릿 커스터마이징, 프로젝트 히스토리, 에이전트 관리, 이미지 라이트박스, 주요 UI 개선'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: '향상된 작업 관리 및 VS Code 통합',
    summary: 'VS Code 파일 링크, 개선된 UUID 관리, 의존성 컬럼, 인앱 릴리스 노트'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: '초기 독립형 릴리스',
    summary: '프로파일 관리, 실시간 업데이트, 모던 UI를 갖춘 웹 기반 작업 뷰어'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};