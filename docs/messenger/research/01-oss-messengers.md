# 오픈소스 자가호스팅 메신저 4종 비교 (Mattermost / Rocket.Chat / Zulip / Matrix) — 2026-07 기준

> 환율 가정: **1 USD ≈ 1,400 KRW** (원화는 근사치 병기).
> 조사 방법 주의: 이 세션의 이그레스 정책상 mattermost.com, docs.mattermost.com, rocket.chat, zulip.com 등 **공식 사이트 직접 접속(WebFetch)이 차단**되어, 모든 수치는 WebSearch가 반환한 해당 공식 문서/공지의 인용 내용 기반이다. 출처 URL은 전부 공식 문서·공식 포럼·공식 블로그로 한정했고, 직접 열람 못 한 항목은 '추정'으로 표기했다.

---

## 0. 한눈에 보는 결론 (50~300명 한국 기업 기준)

| 항목 | Mattermost | Rocket.Chat | Zulip | Matrix (Synapse+Element) |
|---|---|---|---|---|
| 무료 에디션의 실용성(50~300명) | **나쁨** — v11(2025-12)부터 무료판 대폭 축소 | **조건부** — 50명 이하는 Starter 무료로 우수, 초과 시 급락 | **좋음** — 기능 페이월 없음, 푸시만 유료 | **좋음** — 전 기능 무료, 운영 난이도 높음 |
| SSO/SAML/LDAP 무료 여부 | 유료 (Team Edition엔 SSO 없음) | 기본만 무료, 고급 동기화 유료 / Starter(≤50명)엔 포함 | **전부 무료** (SAML·LDAP·SCIM) | **전부 무료** (OIDC·SAML·CAS 내장) |
| 공식 푸시 무료 한도 | Entry 10,000건/월 · TE는 TPNS(무SLA·비암호화) | Community 10,000건/월 | 10명 초과 시 유료($3.50/인/월) | matrix.org 게이트웨이 무료(공표 한도 없음) |
| 데스크톱 | Electron | Electron | Electron | Electron(Element Desktop) |
| 앱 포크/리브랜딩 | 가능(자체 푸시 프록시 필수) | 가능(공식 화이트라벨 가이드) | 가능(공식 문서화) | 가능(AGPL·상표 제거 조건) |
| 한국어 UI | 공식 지원 | 커뮤니티 번역(품질 편차) | 거의 완역 | 부분(비율 미확인, 추정) |

---

## 1. Mattermost

### (1) 라이선스·무료 에디션 제한 — ⚠️ 2025년 12월 v11에서 대폭 축소
- 오픈소스 프로젝트 소스코드는 **AGPLv3** 유지. 단, **Mattermost가 배포하는 공식 바이너리에 제한이 걸리며, 직접 컴파일하면 사용자 수 제한 없음** — [Mattermost v11 Changes in Free Offerings (공식 포럼 공지)](https://forum.mattermost.com/t/mattermost-v11-changes-in-free-offerings/25126), [라이선스 FAQ](https://docs.mattermost.com/about/faq-license.html)
- **Team Edition(무료)**: v11부터 **활성 사용자 250명 제한**(종전 1,000명), **GitLab SSO 제거**. "SSO가 필요 없는 소규모 팀·개인용"으로 규정 — [Editions and Offerings](https://docs.mattermost.com/product-overview/editions-and-offerings.html), [사용자 제한 문의 포럼](https://forum.mattermost.com/t/clarification-request-on-user-limits-max-250-user-server-v-11/25309)
- **Entry(신규 무료 티어, Enterprise Advanced의 무료 모드, 상용 라이선스)**: 전 기능 제공하되 **채널 메시지 열람·검색 이력 10,000건(서버 전체)**, **푸시 10,000건/월**, Playbook 실행 5회/월, AI Agent 쿼리 250회/월, 통화 40분 제한. 권장 규모 25~50명 — [Introducing Mattermost Entry (공식 블로그)](https://mattermost.com/blog/introducing-mattermost-entry/), [Editions and Offerings](https://docs.mattermost.com/product-overview/editions-and-offerings.html). 10,000건 메시지 제한은 기존 설치에도 소급 적용되어 커뮤니티 반발이 컸음 — [GIGAZINE 보도](https://gigazine.net/gsc_news/en/20251226-mattermost-message-limit/), [GitHub 이슈 #34271](https://github.com/mattermost/mattermost/issues/34271)
- **SSO/SAML/AD·LDAP**: 유료(Professional/Enterprise 이상). **감사 로그·컴플라이언스 내보내기·데이터 보존정책도 Enterprise 전용** — [Data retention policy 문서](https://docs.mattermost.com/administration-guide/comply/data-retention-policy.html), [Compliance export 문서](https://docs.mattermost.com/administration-guide/comply/compliance-export.html)
- 유료 단가: 가격 페이지 직접 확인 불가(접속 차단). '추정': Enterprise급은 영업 문의 기반.

### (2) 모바일 푸시 정책
- 무료 자가호스팅은 **TPNS(Test Push Notification Service)**: 무료지만 **"프로덕션 비권장", SLA 없음, 푸시 페이로드 비암호화**, 스토어 공식 앱에서만 동작 — [Mobile push notifications 문서](https://docs.mattermost.com/deploy/mobile-hpns.html), [HPNS 약관](https://mattermost.com/hpns-terms/)
- **HPNS(프로덕션급)**는 유료 플랜 전용. Entry는 푸시 10,000건/월 — [Entry 블로그](https://mattermost.com/blog/introducing-mattermost-entry/)
- **자체 푸시 프록시(mattermost-push-proxy, 오픈소스)** 셀프호스팅 가능하나, Apple/Google 정책상 앱 서명과 푸시 키가 일치해야 하므로 **모바일 앱을 직접 빌드·배포하는 경우에만** 사용 가능 — [Host your own push proxy service](https://docs.mattermost.com/deployment-guide/mobile/host-your-own-push-proxy-service.html), [mattermost-push-proxy GitHub](https://github.com/mattermost/mattermost-push-proxy)

### (3) 클라이언트
- 데스크톱: **Electron** ([mattermost/desktop](https://github.com/mattermost/desktop)). 모바일: React Native iOS/Android(태블릿 지원). 웹 포함 전부 오픈소스로 포크/리브랜딩 가능하되, 커스텀 빌드는 자체 푸시 프록시 필수(위 문서).

### (4) 커스터마이징
- 수신/발신 웹훅, 슬래시 커맨드, 전체 REST API, **Go(서버)+React(웹) 플러그인 프레임워크** — [developers.mattermost.com Webhooks](https://developers.mattermost.com/integrate/webhooks/), [REST API](https://developers.mattermost.com/integrate/reference/rest-api/), [Slash commands](https://developers.mattermost.com/integrate/slash-commands/). 수신 이메일 게이트웨이(메일→채널)는 내장 없음(추정 — 문서상 확인 못 함). 인트라넷 연동은 웹훅+REST로 무난.

### (5) 50~300명 서버 사양
- 공식: **250~500명 = 2 vCPU / 4GB RAM / 45~90GB 스토리지**(단일 서버, PostgreSQL 포함 기준) — [Software and hardware requirements](https://docs.mattermost.com/deployment-guide/software-hardware-requirements.html)

### (6) 한국어
- **한국어 공식 지원**(20여 개 지원 언어에 포함, 웹/데스크톱/모바일) — [Mattermost language support KB](https://support.mattermost.com/hc/en-us/articles/4407480932628-Mattermost-language-support-is-product-dependent), [번역 현황 Weblate](https://translate.mattermost.com/languages/)

**평가**: v11 이후 무료 자가호스팅 후보로서 매력 급락. AGPL 소스 직접 빌드로 제한 회피는 가능하나(법적으론 허용) 업그레이드·유지관리 부담과 정책 리스크(추가 축소 가능성)가 큼.

---

## 2. Rocket.Chat

### (1) 라이선스·무료 에디션 제한
- 코어는 **MIT**(Community Edition). 2026년 플랜 체계 기준 — [공식 플랜 문서](https://docs.rocket.chat/docs/our-plans):
  - **Starter(무료)**: **50명까지**, 자가호스팅, AD/LDAP·SSO·MFA·RBAC·E2EE·보존정책·DLP 등 유료 기능 포함 + **푸시 무제한** — [Starter 플랜 공지](https://forums.rocket.chat/t/introducing-the-starter-plan-free-access-to-premium-features-for-limited-scale-use/18736), [Rocket.Chat 7.0 블로그(Starter 50명 확대)](https://www.rocket.chat/blog/introducing-rocket-chat-7-0)
  - **Community(무료, MIT)**: **동시접속 100명까지**로 포지셔닝, "핵심 메시징 + 기본 신원관리"만, 앱 연동 제한, **푸시 10,000건/월 제한**. 공식 문서가 "업무 필수 용도의 프로덕션엔 부적합"이라 명시 — [공식 플랜 문서](https://docs.rocket.chat/docs/our-plans)
  - **Pro 플랜은 2026-04-29부로 신규 판매 종료(레거시)** — [공식 플랜 문서](https://docs.rocket.chat/docs/our-plans). 유료는 Commercial/Government/Defense 축으로 영업 문의. 클라우드 $4/인/월(≈5,600원) 표기는 서드파티 집계로 '추정' — [rocket.chat/pricing](https://www.rocket.chat/pricing)
- **신원관리**: 4.0부터 LDAP/SAML/커스텀 OAuth의 **고급 기능(확장 속성 동기화, 그룹/팀 매핑, 백그라운드 동기화 등)은 유료**, 기본 연결·로그인은 CE에 잔존 — [Identity Management FAQ](https://docs.rocket.chat/docs/identity-management-faq), [LDAP Premium Settings](https://docs.rocket.chat/use-rocket.chat/authentication/ldap/ldap-premium-settings)

### (2) 모바일 푸시 정책
- 공식 푸시 게이트웨이: **Community 워크스페이스 월 10,000건 제한, 초과 시 월 리셋까지 미발송** — [Push Notifications FAQ](https://docs.rocket.chat/docs/push-notifications-faq)
- **자체 푸시 게이트웨이(오픈소스) 셀프호스팅 가능**하나, 공식 스토어 앱은 Rocket.Chat 게이트웨이 전용이므로 **자체 게이트웨이를 쓰려면 앱도 직접 빌드**해야 함(자체 APN/FCM 키) — [Mobile App FAQs](https://developer.rocket.chat/docs/mobile-app-faqs), [자체 게이트웨이 이슈 #8692](https://github.com/RocketChat/Rocket.Chat/issues/8692)
- 참고: 50명 이하 **Starter는 푸시 무제한** — [플랜 문서](https://docs.rocket.chat/docs/our-plans)

### (3) 클라이언트
- 데스크톱 **Electron**, 모바일 React Native(iOS/Android/태블릿). **공식 화이트라벨(리브랜딩) 가이드 제공** — [Mobile App White-Labeling](https://developer.rocket.chat/docs/mobile-app-white-labeling), [Android White-Labeling](https://developer.rocket.chat/docs/android-app-white-labeling), [Desktop White-Labeling](https://developer.rocket.chat/docs/desktop-app-white-labeling)

### (4) 커스터마이징
- REST API + Realtime API, 수신/발신 웹훅(JS 변환 스크립트 지원), **Apps-Engine(TypeScript 앱 프레임워크)**, 옴니채널 이벤트 웹훅·이메일 채널 — [Rocket.Chat API](https://developer.rocket.chat/apidocs/rocketchat-api), [Omnichannel Webhooks](https://docs.rocket.chat/docs/webhooks). 단, 새 플랜 문서상 Community의 "앱 연동 제한" 명시 — 무료판에서 마켓플레이스 앱 수 제한 있음(추정).

### (5) 50~300명 서버 사양
- 공식 문서 기준 "**총 200명/동시 50명까지는 최소 사양 VM**으로 충분"(구체 수치는 문서 표 참조, 통상 2 vCPU/4GB 수준 — 수치 자체는 추정). 5,000 동시접속 초과 시 16 vCPU/12GiB 권장 — [System Requirements](https://docs.rocket.chat/docs/system-requirements). **MongoDB 별도 운영 필요**(v5+는 CPU AVX 명령어 필수) — [MongoDB AVX 이슈 #29641](https://github.com/RocketChat/Rocket.Chat/issues/29641)

### (6) 한국어
- 80+개 언어 커뮤니티 번역(Lingohub), 공식 언어 개념 없음(티어제: 80%+ = Tier 1). **한국어는 존재하나 품질 편차**로 커뮤니티가 개선 번역파일(ko.json)을 따로 배포한 사례 있음 — [Localization 문서](https://docs.rocket.chat/docs/localization), [한국어 번역 개선 글(Medium)](https://medium.com/rocket-chat-%ED%8C%8C%ED%97%A4%EC%B9%98%EA%B8%B0/%EC%A0%9C%EB%8C%80%EB%A1%9C%EB%90%9C-%ED%95%9C%EA%B5%AD%EC%96%B4-%EB%B2%88%EC%97%AD%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-ce0d254c7c9d)

**평가**: 조직이 50명 이하로 확정이면 Starter가 무료 후보 중 기능·푸시 면에서 최강. 그러나 50명을 넘는 순간 Community(기능 축소+푸시 10k/월)나 유료로 가야 해서 "수십~수백 명" 성장 시나리오에는 위험.

---

## 3. Zulip

### (1) 라이선스·무료 에디션 제한 — 기능 페이월 없음
- **Apache 2.0, 100% 오픈소스. 오픈코어 아님**: **SAML, LDAP/AD 동기화, SCIM 프로비저닝, 세분화된 RBAC, 토픽별 보존·삭제 정책, 감사 로깅이 전부 무료 자가호스팅에 포함** — [zulip.com/self-hosting](https://zulip.com/self-hosting/), [인증 방식 문서(SAML/LDAP/SCIM)](https://zulip.readthedocs.io/en/stable/production/authentication-methods.html)
- 유료는 소프트웨어 기능이 아니라 **서비스**(푸시 중계 + 상용 지원)에만 부과 — [Plans and pricing](https://zulip.com/plans/)

### (2) 모바일 푸시 정책 — 유일한 실질 비용 항목
- 공식 **Mobile Push Notification Service**: **10명 이하 조직 무료**. 초과 상용 조직은 **Basic $3.50/인/월(≈4,900원, 첫해 월 $20 할인)**, **Business $6.67/인/월(연간 결제, ≈9,300원)**. 오픈소스/연구/비영리 커뮤니티는 Community 플랜으로 무료 — [Plans and pricing](https://zulip.com/plans/), [Self-hosted billing](https://zulip.com/help/self-hosted-billing), [신규 플랜 공지 블로그](https://blog.zulip.com/2023/12/15/new-plans-for-self-hosted-customers/)
- **회피 경로**: 푸시 중계 서버(bouncer) 코드도 100% 오픈소스. **공식 앱을 포크해 자체 APNs/FCM 키로 배포하면 자체 bouncer로 월 0원** 운영 가능. 단 공식 문서가 "쉽지 않다 — Apple 절차(DUNS 등록 등)로 수백 달러·1주 이상 소요 가능"이라 경고 — [Mobile push notification service 문서](https://zulip.readthedocs.io/en/stable/production/mobile-push-notifications.html)
- 비용 시뮬레이션(Basic 기준): 50명 = $175/월 ≈ 24.5만원 · 150명 = $525/월 ≈ 73.5만원 · 300명 = $1,050/월 ≈ 147만원.

### (3) 클라이언트
- 데스크톱: **Electron** — [zulip/zulip-desktop](https://github.com/zulip/zulip-desktop). 모바일: **2025-06 정식 출시된 Flutter 신규 앱**(구 React Native 앱 대체, iOS/Android) — [공식 블로그](https://blog.zulip.com/2025/06/17/flutter-mobile-app-launched/), [zulip/zulip-flutter](https://github.com/zulip/zulip-flutter). 태블릿 전용 UI 최적화 수준은 미확인(추정: 폰 UI 확대 수준). 앱 전부 오픈소스로 **포크/리브랜딩 절차가 공식 문서화**되어 있음(위 푸시 문서).

### (4) 커스터마이징 — 메일 연동에 특히 강함
- **120+ 네이티브 연동, 수신/발신 웹훅, Slack 호환 수신 웹훅, Zapier/IFTTT, 전체 REST API, Python 봇 프레임워크** — [Integrations overview](https://zulip.com/help/integrations-overview), [API 문서](https://zulip.com/api/), [Outgoing webhooks](https://zulip.com/api/outgoing-webhooks)
- **수신 이메일 게이트웨이 내장**(이메일을 특정 채널·토픽으로 수신) — Gmail·메일플러그 알림을 메신저로 흘리는 요구사항에 바로 부합 — [Message a channel by email](https://zulip.com/help/message-a-stream-by-email) (기능 존재는 공식 헬프 문서, 직접 열람은 차단되어 '추정' 등급)

### (5) 50~300명 서버 사양
- 공식: **100명 이상 = 최소 2 CPU/4GB RAM, 100명 이상 '일일 활성' 기준 8GB 권장**, 디스크 10GB+ SSD(수십 명 기준, 파일 업로드에 따라 증가) — [Requirements and scalability](https://zulip.readthedocs.io/en/stable/production/requirements.html). 즉 300명 회사도 4 vCPU/8GB 단일 VM이면 충분(추정).

### (6) 한국어
- 공식 번역 가이드 문서에서 **한국어를 '거의 완역(mostly-complete)' 언어군으로 명시** — [Translation guidelines](https://zulip.readthedocs.io/en/latest/translating/translating.html), [언어 변경 헬프](https://zulip.com/help/change-your-language)

**평가**: 무료 자가호스팅에서 SSO·보존정책·감사까지 전부 열려 있는 유일한 "완전 무페이월" Slack 대체재. 유일한 비용(푸시)도 규모에 따라 저렴하거나 포크로 제거 가능. 토픽 기반 스레드 UX가 Slack과 달라 적응 교육 필요(벤치마크 대비 차이점).

---

## 4. Matrix (Synapse + Element)

### (1) 라이선스·기능 제한
- Synapse·Sygnal 등 서버군은 2023-11부터 **AGPLv3**(Element로 이관, CLA 기반 상용 이중 라이선스) — [Element 공식 블로그](https://element.io/blog/element-to-adopt-agplv3/), [TechCrunch 보도](https://techcrunch.com/2023/11/06/decentralized-communication-protocol-matrix-shifts-to-less-permissive-agpl-open-source-license/)
- **기능 페이월 없음**: **SSO(OIDC·SAML·CAS) 내장 무료** — [Synapse SSO 문서](https://matrix-org.github.io/synapse/latest/usage/configuration/user_authentication/single_sign_on/index.html), [OIDC 문서](https://matrix-org.github.io/synapse/latest/openid.html). 메시지 보존정책도 서버 설정으로 지원(공식 문서 존재, 직접 열람 미확인 — 추정). **기업형 감사로그/관리 콘솔은 없고** 그건 유료 Element Server Suite(ESS) 영역 — [ESS 문서](https://docs.element.io/)
- 사용자 수 제한 없음.

### (2) 모바일 푸시 정책
- 공식 Element 앱은 **matrix.org 푸시 게이트웨이(https://matrix.org/_matrix/push/v1/notify)를 무료 사용, 공표된 건수 한도 없음**(한도·과금 문서 부재 — '무제한'은 추정) — [Element 푸시 이해 문서](https://docs.element.io/latest/element-support/element-androidios-client-settings/understanding-push-notifications/)
- **포크/커스텀 앱은 자체 Sygnal(오픈소스 푸시 게이트웨이) + 자체 FCM/APNs 키 필요** — [Sygnal GitHub](https://github.com/matrix-org/sygnal), [Element 푸시 게이트웨이 문서](https://docs.element.io/latest/element-server-suite-classic/advanced-configuration/notifications-mdm-push-gateway/)
- Android는 **UnifiedPush/ntfy로 구글 없이 자가 푸시** 가능(단 Element X는 여전히 fcm.googleapis.com 접근 이슈 보고 있음) — [UnifiedPush/ntfy 가이드](https://docs.element.io/latest/element-support/element-androidios-client-settings/using-unified-push-and-ntfy-for-push-notifications/), [element-x-android #6551](https://github.com/element-hq/element-x-android/issues/6551)

### (3) 클라이언트
- Element Web/**Desktop(Electron)**, 차세대 **Element X iOS/Android**(Rust SDK 기반 네이티브, iPad 멀티윈도우 지원, 2025-12 릴리스는 iOS 18+ 요구) — [element-x-ios GitHub](https://github.com/element-hq/element-x-ios), [App Store](https://apps.apple.com/us/app/element-x-secure-chat-call/id1631335820)
- AGPLv3라 **포크·리브랜딩 가능(상표 제거 + 소스 공개 의무)**, App Store 배포 포크 사례 논의 존재 — [element-x-ios #5193](https://github.com/element-hq/element-x-ios/issues/5193)

### (4) 커스터마이징
- Client-Server **REST API**·Application Services(브리지 프레임워크), **Hookshot**(범용 수신 웹훅 + JS 변환 스크립트, GitHub/GitLab/JIRA/RSS 브리지) — [matrix-hookshot](https://github.com/matrix-org/matrix-hookshot), [Hookshot 웹훅 문서](https://matrix-org.github.io/matrix-hookshot/latest/setup/webhooks.html), [Push Gateway API 스펙](https://spec.matrix.org/unstable/push-gateway-api/). 이메일 수신 게이트웨이는 성숙한 공식 솔루션 부재(추정) — 연동 조립 난이도가 4종 중 가장 높음.

### (5) 50~300명 서버 사양
- **공식 인원별 사양표 없음**. 레퍼런스 구성 2 vCPU/4GB/50GB, "폐쇄 페더레이션 100명은 소규모" — [Understanding Synapse Hosting](https://matrix.org/docs/older/understanding-synapse-hosting/), [Synapse 설치 문서(대형 룸 참여 시 최소 1GB RAM)](https://matrix-org.github.io/synapse/latest/setup/installation.html). 외부 페더레이션 차단한 사내 전용이면 2~4 vCPU/4~8GB로 충분(커뮤니티 사례 기반 추정).

### (6) 한국어
- Element Web/X 번역은 Localazy 운영, **한국어 존재하나 완성도(%) 미확인 — 부분 지원 추정** — [Element Web Localazy](https://localazy.com/p/element-web), [Element X Localazy](https://localazy.com/p/element)

**평가**: 총소유비용은 최저(푸시 포함 0원 가능)지만, E2EE·페더레이션 중심 설계라 관리 콘솔·감사·조직 온보딩이 Slack형 제품 대비 원시적이고, 한국어·운영 난이도 리스크가 있음.

---

## 5. 월 유지비 비교(150명 가정, 서버비 제외, 1 USD=1,400 KRW)

| 시나리오 | 라이선스비 | 푸시 비용 | 비고 |
|---|---|---|---|
| Mattermost Team Edition | 0원 | 0원(TPNS, 무SLA·비암호화) | SSO 불가, 250명 한도, 정책 리스크 |
| Mattermost Entry | 0원 | 포함(10k/월) | **메시지 이력 10k 제한으로 실사용 불가급** |
| Rocket.Chat Community | 0원 | 0원(10k/월 한도) | 150명이면 푸시 한도 초과 상시(1인당 월 66건) |
| Zulip Free + 공식 앱 | 0원 | **$525/월 ≈ 73.5만원**(Basic) | 기능 제한 전무 |
| Zulip Free + 포크 앱 + 자체 bouncer | 0원 | 0원 | 초기 앱 배포 공수 + Apple 개발자 계정($99/년) |
| Matrix (Synapse+Element 공식 앱) | 0원 | 0원(matrix.org 게이트웨이) | 운영·연동 공수 최대 |

서버비는 4종 모두 4 vCPU/8GB급 VM 1대(월 5~10만원대, 국내 클라우드 기준 추정)로 유사.

---

## 6. 요구사항 적합성 메모 (Gmail·메일플러그·인트라넷 연동)

- 4종 모두 **수신 웹훅 + REST API**를 갖춰 인트라넷 알림 연동은 동급으로 쉬움.
- 메일 연동은 **Zulip이 유일하게 수신 이메일 게이트웨이를 내장**(메일→채널 토픽). Gmail은 Zapier/IFTTT 공식 연동도 있음. 메일플러그는 표준 SMTP 포워딩만 되면 게이트웨이로 유입 가능(추정 — 메일플러그 측 포워딩 정책 확인 필요).
- Mattermost/Rocket.Chat은 플러그인·Apps-Engine으로 자체 개발 필요, Matrix는 브리지 자작 필요.

## 권고 (리서치 결론)

최적 후보는 Zulip이다. 근거: (1) 4종 중 유일하게 무료 자가호스팅판에 기능 페이월이 전혀 없어 SSO/SAML·LDAP·SCIM·보존정책·감사 등 기업 필수 기능을 0원에 쓸 수 있다(Mattermost는 v11에서 무료판이 250명 제한+SSO 제거+Entry 메시지 10k 제한으로 붕괴, Rocket.Chat은 50명 초과 시 무료 CE가 푸시 10k/월+기능 축소로 부적합). (2) 요구사항인 메일(Gmail/메일플러그)·인트라넷 연동에 수신 이메일 게이트웨이 내장 + 120+ 연동 + Slack 호환 웹훅 + REST API로 4종 중 연동 조립이 가장 쉽다. (3) 클라이언트가 Electron 데스크톱 + 2025년 출시 Flutter 모바일(iOS/Android)로 전부 Apache 2.0이며 포크/리브랜딩 절차가 공식 문서화되어 '커스터마이징 기반' 전략과 정합적이다. (4) 한국어가 '거의 완역'으로 공식 명시된다. (5) 300명 규모도 4 vCPU/8GB VM 1대면 충분해 서버비가 최소다. 유일한 비용인 공식 푸시 서비스($3.50/인/월, 150명 기준 약 73.5만원/월)는 초기에는 그대로 쓰다가, 사내 개발 리소스로 모바일 앱을 리브랜딩 배포하고 자가 푸시 bouncer로 전환하면 월 유지비를 서버비만으로 낮출 수 있다. 차선: 인원이 50명 이하로 확정이면 Rocket.Chat Starter(무료, SSO+푸시 무제한)가 더 편하고, 푸시 포함 완전 0원이 절대 조건이면 Matrix(Synapse+Element)이지만 운영 난이도·관리도구·한국어 완성도 리스크를 감수해야 한다. 단, Slack과 다른 Zulip의 토픽 스레드 UX는 도입 교육이 필요하므로 파일럿(1개 팀, 2주)으로 수용성을 먼저 검증할 것.
