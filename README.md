# Media Convert Desk

이미지와 짧은 영상을 브라우저에서 우선 변환하는 Next.js 기반 미디어 변환 대시보드입니다.  
현재 구현 범위는 이미지 MVP와 영상 MVP이며, 서버 큐, AI 화질 개선, 고품질 AVIF 변환은 API 계약과 타입 구조만 준비되어 있습니다.

## 빠른 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

검증 명령은 다음과 같습니다.

```bash
npm test
npm run typecheck
npm run build
```

## 주요 기능

- 이미지 업로드 및 변환: JPG, PNG, WEBP 출력
- 영상 업로드 및 변환: 작은 MP4, WEBM 파일을 브라우저 FFmpeg.wasm으로 처리
- 파일 또는 폴더 업로드: 폴더 업로드 항목은 Source queue에서 그룹으로 구분
- 그룹/아이템 선택: 전체 선택, 그룹 단위 선택, 개별 파일 선택 지원
- 드래그 정렬: 개별 아이템과 그룹 순서를 드래그 핸들로 변경
- 인라인 이름 수정: Source queue의 파일명과 폴더 그룹명 편집
- 변환/다운로드 분리: 선택 항목을 먼저 변환하고, 변환 완료 항목만 다운로드
- 다중 다운로드: 변환 완료 항목이 여러 개면 내부적으로 ZIP 생성
- 출력 이름 템플릿: `{name}`, `{width}`, `{height}`, `{format}`, `{index}` 토큰 지원
- ZIP 이름 설정: Settings 패널에서 압축 파일 이름 지정
- Preview canvas: 원본과 결과를 나란히 비교하고 before/after metadata 표시
- 확대/이동: preview 이미지를 50%부터 1000%까지 확대하고, 확대 상태에서 드래그로 이동
- 반응형 UI: 데스크톱, 태블릿, 모바일에서 Source queue와 하단 액션바가 화면에 맞게 동작

## 사용 흐름

1. `Files` 또는 `Folder` 버튼으로 이미지/영상을 추가합니다.
2. Source queue에서 변환할 항목을 체크합니다.
3. 필요하면 파일명, 폴더명, 항목 순서를 수정합니다.
4. Settings에서 이미지/영상 출력 형식, 품질, 크기, 출력 이름 템플릿, ZIP 이름을 조정합니다.
5. 하단 `변환 (N)` 버튼으로 체크된 미변환 항목을 변환합니다.
6. 변환 완료 후 `다운로드 (N)` 버튼으로 결과를 저장합니다.

지원하지 않는 파일은 Source queue에 빨간 라인으로 표시되며, 업로드 경고에서 파일명을 클릭하면 해당 항목으로 이동합니다.

## 변환 정책

이미지는 Canvas API 기반으로 브라우저에서 처리합니다.

- JPG 변환 시 투명 영역은 설정된 배경색으로 합성
- 비율 유지 리사이즈 지원
- 결과 Blob 크기를 기준으로 UI와 실제 다운로드 용량을 일치시킴

영상은 작은 파일만 브라우저에서 처리합니다.

- 데스크톱 기본 제한: 100MB 또는 2분 이하
- 모바일 기본 제한: 50MB 또는 1분 이하
- 제한을 넘는 파일은 서버 처리 권장 상태로 표시
- 서버 FFmpeg, 대용량 큐, 프레임 보간은 MVP에서 실제 처리하지 않음

## 제외된 기능

다음 기능은 구조만 준비되어 있거나 후속 단계 범위입니다.

- 고급 AI 이미지/영상 화질 개선
- 대용량 서버 처리 큐
- 서버 Sharp/FFmpeg 실제 처리
- AVIF 고품질 서버 변환
- GIF 변환, 구간 자르기, FPS 변경, 오디오 제거
- 여러 파일 ZIP 외의 고급 배치 내보내기

## 프로젝트 구조

```txt
app/                 Next.js App Router 페이지와 API 스텁
components/ui/       공통 UI primitive
constants/           지원 포맷, 기본 옵션, 제한값
features/download/   하단 변환/다운로드 액션바
features/image/      이미지 변환 설정
features/media/      워크스페이스, Source queue, Preview canvas, 이름 설정
features/upload/     파일/폴더 업로드 UI
features/video/      영상 변환 설정
lib/                 변환 엔진, metadata, validation, filename, server adapter
stores/              Zustand 미디어 상태 저장소
types/               핵심 도메인 타입
workers/             이미지/영상 worker 메시지 구조
```

## 기술 스택

- Next.js App Router, React, TypeScript
- Tailwind CSS, shadcn 스타일 UI primitive, lucide-react
- Zustand
- Canvas API, createImageBitmap
- FFmpeg.wasm
- file-saver, JSZip
- Vitest, Testing Library

## 서버 API 상태

MVP에서는 서버 처리를 실제로 수행하지 않습니다. 아래 API는 계약 고정을 위한 `501 Not Implemented` 스텁입니다.

- `POST /api/images/convert`
- `POST /api/images/enhance`
- `POST /api/videos/convert`
- `POST /api/videos/enhance`
- `POST /api/jobs`
- `GET /api/jobs/:id`
- `DELETE /api/jobs/:id`

