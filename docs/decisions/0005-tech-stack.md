# 0005. 기술 스택 베이스라인 — 언어·스타일·저장·테스트 러너

- 상태: 채택
- 날짜: 2026-05-29

## 맥락 (왜 이 결정이 필요한가)
프레임워크는 Next.js로 정했다([0003](0003-framework.md)). 그 위에서 쓸 나머지 토대 — 언어, 화면 스타일, 데이터 저장, 테스트 러너 — 를 "주력 스택이니까"라며 암묵적으로 끌고 오지 않고, **한 번에 명시적으로 정해 기록**한다(앞선 문서들이 이들을 정해진 것처럼 다뤘으나 실제로는 결정·기록된 적이 없어 바로잡음). 이들은 변동성이 낮은 "표준 스택 채택"이라 한 장에 묶는다. 변동성이 큰 그래프 그리는 라이브러리는 [0006](0006-graph-library.md)에서 따로 정한다.

## 결정
- **언어 = TypeScript**
- **화면 스타일 = Tailwind CSS**
- **데이터 저장 = 브라우저 localStorage + JSON 내보내기/가져오기** (데이터베이스는 미룸, [roadmap](../roadmap.md) #7)
- **테스트 러너 = Vitest**
- **HTTP 요청 = 브라우저·Node 내장 `fetch`** (axios 등 별도 HTTP 라이브러리 미사용) — 2026-06-01 보강
- **린트·포맷 표준 = cuddle-market 방식 채택** — ESLint flat config(`eslint-config-next` core-web-vitals + typescript + prettier + react/hooks, 팀 규칙: 타입은 interface·이름 있는 컴포넌트는 function 선언) + Prettier(세미콜론 X·작은따옴표·printWidth 130·Tailwind 클래스 정렬). 단 **Storybook 플러그인은 미사용이라 제외**. 구체 설정·적용법은 [setup-lint-format](../setup-lint-format.md).
- **버전(주력 스택, cuddle-market 기준)**: Next 16 · React 19 · TypeScript 5 · Tailwind 4 · Vitest 4 · ESLint 9(flat config).

## 근거 / 무엇을 얻고 무엇을 포기했나
- **TypeScript**: 추출기 같은 로직의 입력·출력을 타입으로 못박아 실수를 컴파일 단계(약한 게이트)에서 잡는다. Next.js·React 기본 지원, 사용자 주력 언어. (포기: 순수 JS의 가벼움 — 작은 프로젝트라도 타입 이득이 더 큼)
- **Tailwind CSS**: 사용자 주력, 빠른 UI 작성. (포기: 별도 CSS 설계 — MVP엔 불필요)
- **localStorage + JSON**: 서버·DB 없이 0 인프라로 저장(로컬 우선, [0003]). JSON 내보내기/가져오기로 백업·이동. (포기: 기기 간 동기화 — DB는 [roadmap](../roadmap.md) #7로)
- **Vitest**: 요즘 표준 러너. Vite/Next 생태계·ESM 친화, 빠름, RTL과 궁합 좋음. 순수 함수(추출기) TDD에 충분. (포기: Jest의 더 넓은 레거시 생태계 — 신규 프로젝트엔 Vitest가 가벼움)
- **fetch(내장)**: velog 본문 가져오기 등 외부 요청이 소수라 내장 `fetch`로 충분하다. 의존성 0(설치 불필요)·클라이언트와 서버 라우트(Node)에서 동일 동작·Next.js의 fetch 확장(캐싱)과 궁합. (포기: axios의 자동 JSON 파싱·인터셉터·HTTP 4xx/5xx 자동 throw — 요청이 적어 직접 처리로 충분. 요청 수·공통 처리(인증 헤더 등)가 늘면 재검토)

## 결과 (이 결정으로 생기는 영향)
- MVP 게이트: `tsc`(타입체크) + lint + Vitest 유닛테스트(추출기) + 사람 수동 검수.
- 저장 모듈은 localStorage 읽기/쓰기 + JSON 직렬화로 구현하고, DB 추상화 계층은 두지 않는다(YAGNI).
- 그래프 그리는 라이브러리는 [0006](0006-graph-library.md)에서 결정.
