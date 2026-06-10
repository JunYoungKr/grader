# build-from-coupang 스크립트 설계

작성일: 2026-06-09
대상: 백로그 3번 — `scripts/build-from-coupang.ts`

## 목적

쿠팡 상품 **링크**를 입력받아, 쿠팡 파트너스 API로 **추적 딥링크(수익 링크)** 를 생성하고,
`src/content/products/<slug>.draft.ts`에 **검수용 `Article` 스켈레톤**을 써주는 CLI 스크립트.

자동화는 "API가 줄 수 있는 검증 가능한 사실"에 한정한다. 등급·평가축·스펙 같은
**판단·조사 항목은 사람이 1차 출처를 보고 채운다** (CLAUDE.md 원칙 1·2·3).

## 입력 방식 (A: 링크 모드)

```
npm run build:coupang -- \
  --slug=baby-wipes-grade-2026 \
  --category=newborn \
  --urls="https://www.coupang.com/vp/products/111,https://www.coupang.com/vp/products/222"
```

| 인자 | 필수 | 설명 |
|---|---|---|
| `--slug` | ✅ | 글 slug. 출력 파일명·딥링크 subId에 사용 |
| `--category` | ✅ | 생애주기 카테고리 slug (maternity/newborn/infant/toddler/safety) |
| `--urls` | ✅ | 쿠팡 상품 URL. 쉼표로 여러 개 |
| `--force` | ⬜ | 출력 파일이 이미 있어도 덮어쓰기 |
| `--dry-run` | ⬜ | 실제 API 호출 없이 mock 딥링크로 파일 생성 (키 없이 검증용) |

> 링크 모드의 한계: 쿠팡 파트너스 API의 딥링크 변환은 추적 링크(`originalUrl`/`shortenUrl`/`landingUrl`)만
> 돌려주고 **상품 이름·가격은 주지 않는다.** 따라서 링크 모드에서 자동 채워지는 실값은 `affiliateUrl`뿐이며,
> 이름·가격은 사람이 입력한다. (이름·가격까지 자동으로 받으려면 키워드 검색 기반 모드가 필요 — 이번 범위 밖.)

## 처리 흐름

1. **CLI 파싱** — `--slug`, `--category`, `--urls` 검증. 없으면 사용법 출력 후 종료.
2. **딥링크 생성** — `createDeeplinks(urls, subId=slug)` 호출.
   `--dry-run`이면 호출 대신 mock 딥링크 배열 반환(매핑·파일쓰기 로직만 검증).
3. **Product 매핑** — 딥링크 → `Product` (아래 표).
4. **Article 스켈레톤 조립** — `type: "comparison"` + 메타/축/출처 TODO.
5. **파일 쓰기** — `src/content/products/<slug>.draft.ts`.
   파일이 이미 있고 `--force`가 없으면 **거부**(덮어쓰지 않음).
6. **다음 단계 안내 로그** — 검수 → 정식 파일명(`<slug>.ts`)으로 이름 변경 → `lib/content.ts` 등록은 사람이 수동.

## 필드 매핑 (자동 ✅ / 사람 빈칸 ⬜)

| 필드 | 처리 |
|---|---|
| `affiliateUrl` | ✅ 딥링크 `landingUrl` 실값 |
| `provider` | ✅ `"coupang"` 고정 |
| `id` | ✅ 자동 `${slug}-${i+1}` |
| `name` | ⬜ `""` + `// TODO: 상품명` |
| `priceExample` | ⬜ `0` + `// TODO: 조회 시점 가격` |
| `grade` | ⬜ `"C"` + `// TODO: 1차 출처 보고 등급 판정` |
| `type` `descriptor` | ⬜ `""` + TODO |
| `specs` | ⬜ `[]` + `// TODO: 인증·무게·성분 등 (1차 출처)` |
| `recommended` | ⬜ 생략 (사람이 필요 시 추가) |
| `axes` `summary` `title` `description` `sources` `related` | ⬜ 스켈레톤 + TODO |

> `grade` 타입이 `"S"|"A"|"B"|"C"`라 `"?"`를 넣을 수 없다. `"C"` 기본값 + 명시적 TODO 주석으로 "미판정"을 표시한다.

## 안전장치 (사람 검수 후 발행 원칙)

- 항상 `.draft.ts`로 출력 — 정식 발행(파일명 변경 + `content.ts` 등록)은 사람이 검수 후 수동.
  스크립트는 발행까지 자동화하지 않는다.
- 출력 파일이 이미 있으면 `--force` 없이는 거부.
- 키 미설정·URL 빈값·API 오류·후보 0건은 명확한 메시지로 즉시 중단.
- 쿠팡 API 호출 제한(시간당 약 10회) 경고를 로그로 안내.

## 위치·실행·격리

- 파일: `scripts/build-from-coupang.ts` (앱 빌드와 분리, tsconfig `exclude: ["scripts"]`에 이미 포함).
- 실행: `package.json`에 `"build:coupang": "tsx scripts/build-from-coupang.ts"` 추가 (`insights`와 동일 패턴).
- `lib/coupang.ts`의 `createDeeplinks`를 재사용 — 서명·HMAC 로직 중복 금지.

## 검증

- `--dry-run`으로 mock 딥링크 → `.draft.ts` 생성까지 키 없이 검증 (파싱·매핑·파일쓰기·중복거부·force).
- 생성된 `.draft.ts`가 `tsc`로 타입 통과하는지 확인 (Article/Product 타입 충족).
- 실제 키가 들어오면 실제 URL로 1회 실호출 검증.

## 범위 밖 (YAGNI)

- 키워드 검색 기반 자동 채움(이름·가격·이미지) — 별도 모드, 이번 범위 아님.
- 등급 자동 판정 — 원칙상 불가.
- `content.ts` 자동 등록·발행.
- 가격 자동 갱신/모니터링.
