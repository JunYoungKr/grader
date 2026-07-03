# 사내 메신저 외부 연동 조사 — Gmail·메일플러그·인트라넷·캘린더 (2026-07 기준)

> 조사 환경 참고: 본 세션의 이그레스 프록시가 developers.google.com·mailplug.com 등 다수 원문 페이지 직접 열람(WebFetch)을 차단하여, 웹 검색 결과 요약을 복수 소스로 교차 확인하는 방식으로 조사했다. 환율은 **1 USD ≈ 1,400 KRW 가정**.

---

## 1. Gmail / Google Workspace 연동

### 1-1. 새 메일 실시간 알림 구조 (users.watch + Cloud Pub/Sub)

권장 아키텍처(폴링 불필요, 공식 지원 방식):

```
[메신저 백엔드] --users.watch(라벨=INBOX)--> [Gmail]
[Gmail] --새 메일 발생--> [Cloud Pub/Sub 토픽] (emailAddress + historyId만 담긴 소형 메시지)
[Pub/Sub push 구독] --HTTPS POST--> [메신저 백엔드 웹훅]
[백엔드] --users.history.list(startHistoryId)--> 변경분 조회 --> 사용자에게 메신저 알림
```

- `users.watch`로 사용자 메일함을 Pub/Sub 토픽에 구독 등록. 알림 메시지에는 본문이 없고 `emailAddress`+`historyId`만 오므로, 백엔드가 `history.list`로 변경분을 당겨온다. 출처: [Gmail push 가이드](https://developers.google.com/workspace/gmail/api/guides/push), [Unipile 2026 가이드](https://www.unipile.com/gmail-api-push-notifications/)
- **watch는 만료됨 — 최소 7일에 1회 재호출 필요**(권장: 매일 배치 갱신). 출처: [Gmail push 가이드](https://developers.google.com/workspace/gmail/api/guides/push)
- **사용자당 알림 최대 1건/초, 초과분은 드롭**(일반적으로 수 초 내 전달되나 극단 상황에서 지연·유실 가능 → historyId 기반 보정 폴링 병행 권장). 출처: [Gmail push 가이드](https://developers.google.com/workspace/gmail/api/guides/push)
- 선행 설정: GCP 프로젝트에서 Pub/Sub 토픽 생성 후 **`gmail-api-push@system.gserviceaccount.com`에 Pub/Sub Publisher 역할 부여**(누락 시 watch는 성공하지만 알림이 전혀 오지 않음). 출처: [users.watch 레퍼런스](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/watch), [Torq KB](https://kb.torq.io/en/articles/9138324-receive-gmail-push-notifications-using-google-cloud-pub-sub)

### 1-2. 필요한 OAuth 스코프

- `users.watch`에 필요한 스코프(하나 이상): `https://mail.google.com/`, `gmail.modify`, `gmail.readonly`, **`gmail.metadata`**. 출처: [users.watch 레퍼런스](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/watch)
- "새 메일 알림(발신자·제목만)" 용도라면 최소 권한인 **`gmail.metadata`**(헤더만 접근, 본문 접근 불가)로 충분 — 보안 심사·사내 설득 부담 최소화. 출처: [Gmail 스코프 문서](https://developers.google.com/workspace/gmail/api/auth/scopes)
- Gmail 스코프는 전부 Google 분류상 **restricted(제한) 스코프**. 외부 공개 앱이면 연 1회 보안 평가(CASA)까지 요구되는 가장 무거운 등급이다. 출처: [Restricted scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)

### 1-3. Google Workspace 조직 internal 앱의 검증(verification) 면제 — 확인됨

- **OAuth 동의화면 User Type을 "Internal"로 설정한 앱(프로젝트가 해당 Workspace 조직 소유)은 앱 검증 대상이 아니며, 미검증 경고 화면·100명 사용자 제한도 적용되지 않는다.** 출처: [When is verification not needed](https://support.google.com/cloud/answer/13464323), [Unverified apps](https://support.google.com/cloud/answer/7454865)
- **internal 앱은 restricted/sensitive 스코프를 써도 Google의 추가 리뷰가 불필요**("For apps used only internally by your Google Workspace organization ... use of restricted or sensitive scopes doesn't require further review by Google"). 출처: [OAuth 동의화면 구성 가이드](https://developers.google.com/workspace/guides/configure-oauth-consent)
- **선행 조건(중요)**: 회사가 Google Workspace(또는 Cloud Identity) 조직을 보유하고 GCP 프로젝트가 그 조직 소유여야 "Internal" 타입 선택 가능. 무료 @gmail.com 계정 기반이면 불가 → external 앱으로 restricted 스코프 검증(+보안평가 비용, 수백만 원대 추정)을 거쳐야 하므로 기획이 완전히 달라진다.

### 1-4. 쿼터와 비용

| 항목 | 수치 | 출처 |
|---|---|---|
| Gmail API 사용 자체 | 무료(쿼터제, 초과 과금 없음) | [Usage limits](https://developers.google.com/workspace/gmail/api/reference/quota) |
| 사용자당 속도 제한 | 250 quota units/초/사용자 (버스트 허용) | [Usage limits](https://developers.google.com/workspace/gmail/api/reference/quota) |
| 프로젝트 일일 쿼터 | 공식 문서 인용 다수는 10억 units/일, 일부 2026 가이드는 8,000만 units/일·분당 120만 units 표기(소스 간 불일치, **정확 수치는 콘솔 확인 필요 — 추정**) | [Usage limits](https://developers.google.com/workspace/gmail/api/reference/quota), [Nylas 2026 가이드](https://cli.nylas.com/guides/gmail-api-quotas-2026) |
| 메서드별 비용 | `history.list` 2 units, `messages.get`·`messages.list` 5 units, `watch`·`messages.send` 100 units | [Usage limits](https://developers.google.com/workspace/gmail/api/reference/quota), [Unipile](https://www.unipile.com/gmail-api-limits/) |
| Cloud Pub/Sub | **월 첫 10 GiB 무료, 이후 $40/TiB(≈56,000원/TiB)** | [Pub/Sub pricing](https://cloud.google.com/pubsub/pricing) |

**비용 시뮬레이션(자체 계산·추정)**: 직원 300명 × 1인당 알림 200건/일 × 메시지 ~1KB ≈ 월 1.8 GiB → **무료 한도(10 GiB) 내, 월 0원**. Gmail API 쿼터도 300명×200건×(history.list 2 + get 5 units) ≈ 42만 units/일로, 어느 쿼터 해석 기준으로도 여유가 크다. → **Gmail 연동 월 유지비 사실상 0원.**

### 1-5. Directory API 조직도/주소록 동기화 — 가능

- Admin SDK **Directory API**로 조직의 사용자·그룹·조직단위(OU) 조회 가능 → 메신저 조직도/주소록 자동 동기화에 적합. 출처: [Directory API REST 레퍼런스](https://developers.google.com/workspace/admin/directory/reference/rest)
- 구현 패턴: 서비스 계정 + **도메인 전체 위임(Domain-Wide Delegation)**을 슈퍼관리자가 설정(관리콘솔 보안 → API 제어 → 도메인 전체 위임)하고, 읽기 전용이면 `admin.directory.user.readonly` 스코프로 `users.list` 주기 호출. 출처: [Directory API DWD 사례](https://discuss.google.dev/t/google-directory-api-service-acount-with-domain-wide-delegation/164589), [구현 가이드](https://dev.to/osinachiuro/implement-admin-sdk-directory-api-for-google-workspace-management-37nd)
- 변경 실시간 반영이 필요하면 Directory API에도 push notification 채널이 있음(주기 동기화+선택적 push 권장). 출처: [Admin SDK push](https://developers.google.com/workspace/admin/directory/v1/guides/push)

---

## 2. 메일플러그(Mailplug)

### 2-1. 공개 Open API — **공개 개발자 포털/문서 없음(확인)**

- 웹 검색 기준, 메일플러그에는 Gmail API 같은 **공개(self-serve) Open API·개발자 문서가 존재하지 않는다.**
- 다만 메일플러그는 "**SSO 로그인 연동, 타 서비스 이용 중 실시간 읽지 않은 메일 개수 확인, 조직도 연동, 계정 추가·수정 등 고객사 요청에 따라 다양한 연동 API를 소스 예제와 함께 제공**"한다고 안내한다 — 단, 이 안내는 **단독형(전용 구축형) 시스템** 소개 페이지에 있다. 출처: [메일플러그 단독형 시스템](https://groupware.mailplug.com/features/dedicated), [기업 솔루션 페이지](https://www.mailplug.com/mailplug/features/dedicated)
- **일반 클라우드(공유형) 상품에서도 동일 API를 받을 수 있는지는 미확인(추정: 영업/기술지원 협의 필요, 고객센터 1544-9140)**. 계약 형태에 따라 연동 범위가 갈리므로 기획 초기에 반드시 확인할 것.
- 참고: 메일플러그 그룹웨어 자체에 '무제한 메신저' 기능이 포함되어 있음 — 자체 구축 대비 검토 대상. 출처: [메일플러그 메신저](https://groupware.mailplug.com/features/messenger)

### 2-2. IMAP/SMTP 표준 프로토콜 — 지원하되 중대한 제약 존재

| 프로토콜 | 서버 | 포트/보안 | 출처 |
|---|---|---|---|
| IMAP | imap.mailplug.co.kr | 993 / SSL | [메일플러그 고객센터](https://www.mailplug-help.com/bedd1e47-b078-4ee6-b5bc-8151ca56464e) |
| POP3 | pop3.mailplug.co.kr | 995 / SSL | 상동 |
| SMTP | smtp.mailplug.co.kr | 465 / SSL | 상동 |

- **핵심 리스크: "2025년 4월 1일 이후 개통되는 그룹웨어/기업메일 서비스는 IMAP 이용이 제한된다"** — 메일플러그 공식 매뉴얼 여러 페이지에 반복 명시. 출처: [POP3/IMAP 사용 설정 매뉴얼](https://mailplug-help.atlassian.net/wiki/spaces/MM/pages/7602243), [고객센터 FAQ](https://www.mailplug-help.com/bedd1e47-b078-4ee6-b5bc-8151ca56464e)
  - 회사 메일플러그 계약이 2025-04-01 **이전** 개통이면 IMAP 사용 가능 → **IMAP IDLE(RFC 2177) 기반 실시간 새 메일 알림** 연동 가능. 단, 계정당 IDLE 상시 연결 유지(수백 개 동시 TCP 연결) 운영 부담 고려.
  - **이후** 개통이면 IMAP 불가 → **POP3 UIDL 기반 주기 폴링(예: 1~5분)** 폴백만 가능 = "준실시간" 알림. 실시간이 필수라면 메일플러그 맞춤 API 협의 또는 메일 수신 웹훅 대안 검토 필요.
- 운영 제약: POP3/IMAP은 **계정 생성 시 기본 '사용 안 함'**이며, **30일간 사용 이력이 없으면 자동으로 '사용 안 함'으로 전환**(보안 정책) → 전 직원 일괄 활성화 및 상시 연결 유지 설계 필요. **앱 비밀번호**(계정 비밀번호와 별도) 발급 기능 제공 — 메신저 연동 시 계정당 앱 비밀번호를 수집·암호화 보관해야 함(자격증명 관리 부담 = 이 연동의 실질 난이도). 출처: [POP3/IMAP 사용 설정](https://mailplug-help.atlassian.net/wiki/spaces/MM/pages/133169263), [고객센터](https://www.mailplug-help.com/bedd1e47-b078-4ee6-b5bc-8151ca56464e)
- 발송 연동: SMTP 465/SSL로 표준 발송 가능(난이도 하). 봇/시스템 발신용 전용 계정 1개면 충분.

---

## 3. 사내 인트라넷 연동 패턴

### 3-1. SSO 도입 구조

- 권장: **OIDC Authorization Code + PKCE**(네이티브 앱 표준, [RFC 8252](https://www.rfc-editor.org/rfc/rfc8252) 참조 — 시스템 브라우저에서 로그인 후 커스텀 스킴/루프백으로 앱 복귀). 데스크톱(Electron)·모바일·인트라넷(웹)이 하나의 IdP를 공유.
- 회사가 Google Workspace 사용 시 **Google 자체를 OIDC IdP로 직접 사용하면 추가 서버 0대·월 0원**으로 SSO 가능. 자가호스팅 IdP(Keycloak/Authentik)는 Google을 상위 IdP로 브로커링하면서 인트라넷·메신저·메일플러그 SSO를 한 곳에서 관리하고 싶을 때 도입.

### 3-2. Keycloak vs Authentik (무료 자가호스팅 IdP)

| 항목 | Keycloak | Authentik | 출처 |
|---|---|---|---|
| 프로토콜 | OIDC/OAuth2/SAML + **LDAP 연동(오픈소스 중 최고 완성도)**, Kerberos/SPNEGO | OIDC/OAuth2/SAML/LDAP/SCIM, Kerberos 네이티브 미지원, **리버스 프록시 인증 기능**(비SSO 레거시 앱 보호) | [Cerbos 비교](https://www.cerbos.dev/blog/authentik-vs-keycloak-selfhosted-idp-comparison), [DanubeData 2026](https://danubedata.ro/blog/self-host-authentik-keycloak-auth0-alternative-2026) |
| 리소스 | 기본 메모리 사용 **약 1,250MB**(realm+세션 1만 캐시 기준, 비힙 ~300MB 별도), 15 로그인/초당 1 vCPU 권장. idle 기준 Authentik의 약 2.5배 무거움, JVM 기동 60~90초 | 스택 전체(**Authentik+PostgreSQL, 2025.10 릴리스부터 Redis 불필요**) **약 250~350MB RAM** | [Keycloak 공식 사이징](https://www.keycloak.org/high-availability/concepts-memory-and-cpu-sizing), [authhost 2026 비교](https://authhost.de/en/blog/authentik-vs-authelia-vs-keycloak) |
| 학습곡선 | 첫 OIDC 연동에 2~4시간, 개념(realm/client/flow) 복잡 | 관리 UI 직관적, 중소 규모 기본 추천이라는 평가 다수(2026) | [authhost](https://authhost.de/en/blog/authentik-vs-authelia-vs-keycloak), [Elestio 2026](https://blog.elest.io/authentik-vs-authelia-vs-keycloak-choosing-the-right-self-hosted-identity-provider-in-2026/) |
| 비용 | 오픈소스 무료(CNCF) | 오픈소스 무료(유료 엔터프라이즈 옵션 별도) | 상동 |

**판단**: 수십~수백 명 규모 + 월 유지비 최소화 목표면 **Authentik이 기본 추천**(2GB VPS 1대로 충분, 월 서버비 약 1.5~4만 원 수준 — 추정). AD/LDAP 연동이 핵심이거나 향후 대규모 확장·엔터프라이즈 요구가 있으면 Keycloak.

### 3-3. 인트라넷 → 메신저 인바운드 웹훅 (전자결재·공지 알림)

- 벤치마크(Slack Incoming Webhooks): 채널별 고유 URL로 JSON POST 하면 메시지 게시. **레이트 리밋 = 채널당 초당 1건(버스트 허용), 초과 시 HTTP 429 + Retry-After**. 출처: [Slack rate limits](https://docs.slack.dev/apis/web-api/rate-limits/)
- 자체 메신저에 동일 패턴 구현: `POST /hooks/{채널별 시크릿 토큰}` 엔드포인트 + 봇 계정 발신 + 큐잉/레이트리밋. 인트라넷(전자결재 완료, 공지 등록)에서 HTTP 1회 호출이면 되므로 **가장 싸고 빠른 연동**(난이도 하).

### 3-4. 메신저 → 인트라넷 딥링크 / 인트라넷 → 메신저 딥링크

- 메신저→인트라넷: 메시지 내 URL 링크면 충분(웹). 반대 방향(인트라넷 버튼→메신저 특정 채널 열기)이 딥링크 구현 대상.
- Electron 데스크톱: `app.setAsDefaultProtocolClient('myapp')`으로 커스텀 스킴(예: `myapp://channel/123`) 등록. macOS는 `open-url` 이벤트(패키징된 앱에서만 동작), Windows/Linux는 single instance lock + `second-instance` 이벤트로 URL 수신, 패키징 시 Info.plist/.desktop 파일에 프로토콜 등록 필요. 출처: [Electron Deep Links 공식 튜토리얼](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app)
- 모바일: iOS **Universal Links**·Android **App Links**(도메인 검증 파일 `apple-app-site-association`/`assetlinks.json` 호스팅) — 커스텀 스킴 단독보다 안전(스킴 하이재킹 방지). 표준 플랫폼 기능(별도 비용 없음).

---

## 4. Google Calendar 연동 (회의 알림)

- **비용: Calendar API는 전면 무료, 쿼터 일 100만 쿼리(초과 과금 없음, 2021-05부터 분 단위 제한 병행)**. 출처: [Calendar usage limits](https://developers.google.com/workspace/calendar/api/guides/quota), [Google Developers Blog](https://developers.googleblog.com/the-google-calendar-api-has-changed-how-we-manage-api-usage/)
- 실시간 변경 감지: `events.watch`로 push 채널 생성 → 변경 시 지정 HTTPS URL로 POST. 제약:
  - **채널 만료 최대 약 1주 + 자동 갱신 없음** → 만료 전 watch 재호출 잡 필수(X-Goog-Channel-Expiration 헤더로 만료 추적). 출처: [Calendar push 가이드](https://developers.google.com/workspace/calendar/api/guides/push)
  - 웹훅 URL은 **유효한 CA 서명 HTTPS 인증서 필수(자가서명 거부) + 도메인 소유권을 GCP 콘솔에 검증·등록**해야 함. 출처: [Calendar push 가이드](https://developers.google.com/workspace/calendar/api/guides/push), [CalendHub 가이드](https://calendhub.com/blog/calendar-webhook-integration-developer-guide-2025/)
- 단순 "회의 N분 전 알림"이 목적이면 push 없이 **syncToken 기반 증분 폴링(예: 5분 주기 events.list)**만으로 충분 — 구현 난이도 '하', 쿼터도 무료 한도 내. push는 2차 고도화로.
- 선행 조건: Gmail과 동일한 internal OAuth 앱에 `calendar.readonly` 스코프 추가(sensitive 스코프이나 internal 앱은 추가 리뷰 불필요 — 1-3 참조).

---

## 5. 종합: 연동별 난이도·선행 조건 표

| # | 연동 | 방식 | 난이도 | 월 비용 | 선행 조건 |
|---|---|---|---|---|---|
| 1 | 인트라넷→메신저 웹훅 | Slack형 incoming webhook | **하** | 0원 | 메신저 서버에 엔드포인트+토큰 발급 UI |
| 2 | SSO | OIDC(Google 직접 또는 Authentik/Keycloak) | **중** | 0원(Google 직접)~서버 1대(추정 1.5-4만원) | Workspace 조직 또는 IdP 서버(2GB RAM)+HTTPS |
| 3 | 조직도 동기화 | Directory API `users.list`+DWD | **중하** | 0원 | Workspace 슈퍼관리자의 DWD 승인 |
| 4 | Calendar 회의 알림 | syncToken 폴링(1차)→events.watch(2차) | **하~중** | 0원 | internal OAuth 앱, push 시 도메인 검증+CA 인증서 |
| 5 | Gmail 새 메일 알림 | users.watch+Pub/Sub+history.list | **중** | 0원(Pub/Sub 무료 한도 내) | Workspace 조직, GCP 프로젝트(조직 소유), gmail-api-push 계정에 Publisher 권한, watch 7일 갱신 잡 |
| 6 | 딥링크 | 커스텀 스킴+Universal/App Links | **하** | 0원 | 앱 패키징/코드사이닝, 도메인 검증 파일 호스팅 |
| 7 | 메일플러그 발송 | SMTP 465/SSL | **하** | 0원 | 발신 계정 SMTP 활성화+앱 비밀번호 |
| 8 | 메일플러그 새 메일 알림 | IMAP IDLE(2025-04 이전 개통) / POP3 폴링(이후) | **중** | 0원 | 계약 개통 시점 확인(critical), 계정별 IMAP/POP3 활성화(30일 미사용 자동 비활성)+앱 비밀번호 수집·암호화 보관 |
| 9 | 메일플러그 SSO·조직도·미읽음 API | 비공개 맞춤 API(요청 제공) | **중(협의 변수)** | 미확인(추정: 단독형 계약 조건) | 메일플러그 영업/기술지원 협의 — 클라우드형 제공 여부 확인 |

**월 유지비 결론**: Google 계열 연동(Gmail·Calendar·Directory)은 이 규모에서 전부 무료 한도 내(Pub/Sub 월 10 GiB 무료, 이후 $40/TiB≈56,000원/TiB이나 도달 불가 수준). 유일한 고정비는 자가호스팅 IdP 서버비(선택, 추정 월 1.5~4만 원)뿐.

## 권고 (리서치 결론)

연동 우선순위: (1) SSO 기반 구축 — 회사가 Google Workspace 사용 시 Google OIDC를 직접 IdP로 사용해 월 0원으로 시작하고, 인트라넷·메일플러그까지 통합 관리가 필요해지는 시점에 Authentik(2GB 서버 1대, 스택 250~350MB RAM)을 브로커로 도입(대규모 LDAP/AD 요건 시 Keycloak). (2) 인트라넷→메신저 인바운드 웹훅 — Slack 스타일 채널별 토큰 URL + 초당 1건 레이트리밋으로 전자결재·공지 알림을 최소 비용·최단 기간에 확보(가성비 최고). (3) Gmail 새 메일 알림 — internal OAuth 앱(검증 면제) + gmail.metadata 최소 스코프 + users.watch/Pub/Sub, watch 7일 갱신 잡 포함. 이 규모에선 전액 무료. (4) 조직도 동기화 — Directory API users.list + 도메인 전체 위임으로 주소록 자동화. (5) Google Calendar 회의 알림 — 1차는 syncToken 폴링, 2차에 events.watch push. (6) 딥링크 — Electron 커스텀 스킴 + iOS Universal Links/Android App Links를 클라이언트 초기 설계에 포함. (7) 메일플러그 — 착수 전 반드시 두 가지를 확인: 회사 계약 개통 시점(2025-04-01 이후면 IMAP IDLE 불가 → POP3 폴링 폴백)과 연동 API(SSO·조직도·미읽음 수)의 클라우드형 제공 여부(영업 협의). 발송(SMTP 465)은 즉시 가능하므로 먼저 붙이고, 새 메일 알림은 계약 확인 결과에 따라 설계를 확정하라. 월 유지비는 자가호스팅 IdP 서버비(선택, 추정 1.5~4만 원) 외 0원으로 수렴 가능하다.
