# 멀티플랫폼 메신저 클라이언트 기술 전략 조사 (2026-07 기준)

환율 표기: **1 USD ≈ 1,400 KRW 가정** (원화는 근사치).

---

## 1. Electron vs Tauri 2.x

### 성능·크기 (2026년 벤치마크 종합)

| 항목 | Electron | Tauri 2 |
|---|---|---|
| 번들 크기 | 80~200MB (Chromium+Node 내장) | 2~10MB (OS WebView 사용) |
| 유휴 메모리 | 약 200~300MB | 약 30~40MB |
| 아키텍처 | Chromium 엔진 동봉 → 모든 OS에서 렌더링 동일 | OS WebView(WebView2/WKWebView/webkitgtk) → 플랫폼별 렌더링 편차 테스트 필요 |

- 출처: [PkgPulse Electron vs Tauri 2026](https://www.pkgpulse.com/guides/electron-vs-tauri-2026), [Hopp: Tauri vs Electron trade-offs](https://www.gethopp.app/blog/tauri-vs-electron), [BuildMVPFast: Tauri v2 vs Electron 2026](https://www.buildmvpfast.com/blog/tauri-v2-vs-electron-desktop-apps-2026)
- Tauri는 메모리 58~75% 절감·번들 최대 ~25배 축소가 일반적 보고이나, WebView 호환성 검증·Rust 역량이 추가 비용으로 전가됨 ([PkgPulse](https://www.pkgpulse.com/guides/electron-vs-tauri-2026)).

### 자동 업데이트
- **Electron**: `electron-builder`+`electron-updater`로 GitHub Releases 또는 사내 HTTP 서버(generic provider)에서 무료 자동 업데이트. 오픈소스면 무료 호스팅 `update.electronjs.org`도 사용 가능 ([electron-builder Auto Update](https://www.electron.build/docs/features/auto-update/), [Electron 공식 튜토리얼](https://www.electronjs.org/docs/latest/tutorial/tutorial-publishing-updating)). 사내 인트라넷 서버에 zip/yml만 올려도 동작 → **월 유지비 0원 구조 가능**.
- **Tauri 2**: 공식 updater 플러그인은 **Windows/macOS/Linux 전용, iOS/Android 미지원** ([Tauri Updater plugin](https://v2.tauri.app/plugin/updater/), [tauri-plugin-updater GitHub](https://github.com/tauri-apps/tauri-plugin-updater)). 모바일은 스토어 업데이트에 의존해야 함.

### Tauri 모바일(iOS/Android) 성숙도 — 2026년 현재
- Tauri 2.0은 2024-10-02 안정판 릴리스로 iOS/Android를 공식 타깃에 포함, "production ready mobile applications" 표방 ([Tauri 2.0 Stable Release](https://v2.tauri.app/blog/tauri-20/)).
- 단, 공식 입장: 모바일 API는 안정이지만 **일부 공식 플러그인(updater 포함)이 모바일 미지원**, 팀 스스로 "모바일이 1급 시민인 릴리스는 아니다"라고 명시 ([Tauri 2.0 RC 블로그](https://v2.tauri.app/blog/tauri-2-0-0-release-candidate/), [Tauri develop 문서](https://v2.tauri.app/develop/)).
- 실사용 평가: 웹 프런트를 그대로 iOS로 감싸는 수준은 실용적이나, 위젯·딥 네이티브 통합이 필요하면 다른 스택 권장 ([DevToolBox Tauri iOS 2026](https://viadreams.cc/en/blog/tauri-guide/)).
- **판단**: 메신저처럼 푸시·백그라운드·알림 UX가 핵심인 앱에서 Tauri 모바일은 2026년 현재 검증 사례가 적어 **리스크 높음(추정)**. 대형 메신저 중 Tauri 모바일 채택 사례는 확인되지 않음.

---

## 2. 모바일: React Native(Expo) vs Flutter vs Capacitor — 코드 공유 관점

전제: 데스크톱은 웹(React)+Electron. 이때 모바일 스택별 코드 공유:

| | React Native + Expo | Flutter | Capacitor |
|---|---|---|---|
| 언어 | TypeScript/React | Dart | 웹 그대로 (TS/React) |
| 웹·데스크톱과 공유 | 비즈니스 로직·타입·API 클라이언트·상태관리 전부 공유. UI는 react-native-web/Solito로 부분 공유 | **거의 0** (Dart 별도 스택, Flutter Web은 비주력) | **최대** — 기존 React 웹앱을 WebView로 그대로 래핑 (~90%+ 추정) |
| 성능/UX | 네이티브 컴포넌트 렌더 → 메신저급 UX 가능. New Architecture 안정화로 Flutter와 격차 축소 | 자체 렌더러(Impeller)로 최고 성능 상한 | WebView 성능 한계 (긴 채팅 리스트 스크롤 등 취약, 추정) |
| 근거 | [PkgPulse RN vs Flutter vs Expo 2026](https://www.pkgpulse.com/guides/react-native-vs-flutter-vs-expo-2026) | 같은 출처 | [Kanopy: Capacitor vs RN vs Flutter](https://kanopylabs.com/blog/capacitor-vs-react-native-vs-flutter) |

- 2026년 현재 Expo SDK가 React Native 공식 권장 생성 경로이며 New Architecture가 기본 ([PkgPulse](https://www.pkgpulse.com/guides/react-native-vs-flutter-vs-expo-2026)).
- **Expo EAS 비용**: 클라우드 빌드 무료 티어 = 월 iOS 15회+Android 15회, EAS Update(OTA) 1,000 MAU, 100GiB 대역폭 ([Expo 요금](https://expo.dev/pricing), [Expo billing 문서](https://docs.expo.dev/billing/plans/)). 유료는 Starter $19/월(≈2.7만원), Production $199/월(≈27.9만원). **로컬/자체 CI 빌드는 무제한 무료** — 사내 메신저 규모(수십~수백 명)면 무료 티어+로컬 빌드로 월 0원 운용 가능 ([metacto EAS 비용 가이드](https://www.metacto.com/blogs/the-true-cost-of-expo-app-development-a-comprehensive-guide)).
- **OTA(코드푸시) 참고**: Microsoft App Center CodePush는 2025-03-31 종료. 대안은 EAS Update(1,000 MAU까지 무료) 또는 오픈소스 CodePush 서버 자가 호스팅(현재 커뮤니티 유지) ([Expo: How to replace App Center and CodePush](https://expo.dev/blog/how-to-replace-app-center-and-codepush), [Embrace: App Center retirement](https://embrace.io/blog/app-center-retirement/)).
- 태블릿: RN/Capacitor 모두 iPadOS·Android 태블릿을 동일 코드로 지원(레이아웃 반응형 작업만 추가, 일반론).

---

## 3. 실사용 사례 — 벤치마크 4사 클라이언트 스택

| 서비스 | 데스크톱 | 모바일 |
|---|---|---|
| **Slack** | Electron + React/TypeScript ([slack.engineering](https://slack.engineering/building-hybrid-applications-with-electron/)) | **완전 네이티브** — iOS 100% Swift, Android Kotlin. 공유 C++ 라이브러리(LibSlack)는 오버헤드로 폐기 ([InfoQ](https://www.infoq.com/news/2022/01/slack-mobile-apps-modernization/), [slack.engineering LibSlack](https://slack.engineering/libslack-the-c-library-at-the-foundation-of-our-client-application-architecture/)) |
| **Discord** | Electron + React ([Discord tech stack](https://stackshare.io/discord/discord)) | React Native — iOS는 초기부터, Android도 2022년 RN 통합 ([Discord 공식 블로그](https://discord.com/blog/supercharging-discord-mobile-our-journey-to-a-faster-app), [Neowin](https://www.neowin.net/news/discord-has-adopted-react-native-for-its-android-app-and-people-are-not-happy/)) |
| **Mattermost** | Electron ([mattermost/desktop 계열, 문서](https://docs.mattermost.com/deployment-guide/mobile/host-your-own-push-proxy-service.html)) | React Native (TypeScript 92%) ([mattermost/mattermost-mobile GitHub](https://github.com/mattermost/mattermost-mobile)) |
| **Rocket.Chat** | Electron (TypeScript 95%) ([RocketChat/Rocket.Chat.Electron GitHub](https://github.com/RocketChat/Rocket.Chat.Electron)) | React Native ([Rocket.Chat 개발자 문서](https://developer.rocket.chat/docs/mobile-app)) |

**패턴**: 4사 모두 데스크톱=Electron. 모바일은 자금력이 가장 큰 Slack만 완전 네이티브이고, 나머지 3사(특히 자가호스팅 오픈소스 2사)는 React Native. Tauri를 쓰는 주요 메신저는 확인되지 않음. → **"Electron 데스크톱 + React Native 모바일"이 업계 검증 조합.**

---

## 4. 배포·인증 비용 (연간 고정비)

### Apple (iOS/iPadOS/macOS)
- **Apple Developer Program: $99/년(≈13.9만원)** — App Store·TestFlight·Apple Business Manager(ABM) 커스텀 앱·Unlisted 앱·macOS 공증(Notarization)/Developer ID 모두 포함 ([Apple 멤버십 비교](https://developer.apple.com/support/compare-memberships/), [멤버십 상세](https://developer.apple.com/programs/whats-included/)).
- **사내 배포 옵션(전부 $99 프로그램으로 가능)**:
  - **TestFlight**: 베타 배포용. 내부 100명/외부 10,000명·빌드 90일 만료(추정 — 통상 공지 수치, 이번 조사에서 Apple 원문 재확인 못 함). 상시 운영 채널로는 부적합.
  - **Unlisted 앱**: App Store에 검색 노출 없이 **직링크로만 설치**. App Review 필수, BYOD(개인 기기)에도 배포 가능 → 사내 메신저에 가장 현실적 ([Apple Unlisted app distribution](https://developer.apple.com/support/unlisted-app-distribution/)).
  - **ABM 커스텀 앱**: Apple Business Manager(무료)로 자사에만 비공개 배포, MDM 또는 다운로드 코드 필요 ([Apple 멤버십 비교](https://developer.apple.com/support/compare-memberships/)).
- **Enterprise Program: $299/년(≈41.9만원)** — **직원 100인 이상**, D-U-N-S, 공개 웹사이트, "App Store/커스텀 앱/TestFlight로 충족 불가"를 심사·인터뷰로 입증 + 갱신 시 재검증 ([Apple Enterprise Program](https://developer.apple.com/programs/enterprise/)). **수십 명 규모면 아예 부적격, 수백 명이어도 승인 문턱 높음 → 기본 계획에서 제외 권장.**

### Android
- **Google Play Console: $25 일회성(≈3.5만원)** ([Play Console Help](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en), [IconikAI 2026 정리](https://www.iconikai.com/blog/google-play-developer-account-fee-2026)).
- **사내 배포**: ① managed Google Play 비공개 앱 — MDM/EMM 콘솔 iframe에서 게시하면 **등록비 없이** 조직 전용 배포 가능 ([Google 블로그](https://blog.google/products/android-enterprise/managed-google-play-iframe/), [Android Enterprise Help](https://support.google.com/work/android/answer/9495634?hl=en)) ② **APK 직접 배포(사이드로드) 무료** — 사내 포털/인트라넷에 APK 게시, 사용자가 '알 수 없는 출처 허용'만 하면 됨 ([Appcircle 가이드](https://appcircle.io/guides/android/android-app-distribution)). → **Android 사내 배포 비용 사실상 0원.**

### Windows 코드사이닝
- **핵심 발견: Azure Artifact Signing(구 Trusted Signing, $9.99/월≈1.4만원, 5,000서명)은 미국·캐나다·EU·영국 조직/개인만 가입 가능 — 한국 법인은 사용 불가** ([Melatonin 실전 가이드](https://melatonin.dev/blog/code-signing-on-windows-with-azure-trusted-signing/), [Microsoft Q&A 지역 제한](https://learn.microsoft.com/en-nz/answers/questions/5810735/cant-create-a-new-trusted-signing-individual-ident), [Azure Artifact Signing](https://azure.microsoft.com/en-us/products/artifact-signing)).
- 따라서 한국 기업은 전통 CA에서 **OV 인증서 약 $220~320/년(≈31~45만원)** 구매가 현실적 (Sectigo 리셀러 기준 $220~225/년: [SSL2BUY](https://www.ssl2buy.com/sectigo-code-signing-certificate.php), [codesigncert](https://codesigncert.com/sectigo-code-signing-certificate)). EV는 $300~500/년 ([SSL Insights](https://sslinsights.com/best-code-signing-certificate-windows-applications/)).
- 규정 변화: 2026-03-01부터 공인 코드사이닝 인증서 최대 유효기간 460일(약 15개월)로 단축 → 다년 선구매 불가, 갱신 주기 짧아짐 ([SSL Insights](https://sslinsights.com/best-code-signing-certificate-providers/)).
- 비용 회피 옵션(추정): 사내 전용이면 미서명 배포 + MDM/GPO·AppLocker 예외 등록으로 SmartScreen 경고를 우회하는 운영도 가능하나, 보안 정책·사용자 신뢰 측면에서 서명 권장.

### macOS 공증(Notarization)
- $99 Developer Program에 포함, **공증 자체 추가 비용 없음** ([Apple 멤버십 비교](https://developer.apple.com/support/compare-memberships/)).

### 연간 고정비 합계(1안 기준)
Apple $99 + Play $25(일회성) + Windows OV $220~320 ≈ **연 $344~444 ≈ 48~62만원 + α** (서버·인건비 제외).

---

## 5. 푸시 알림

- **FCM(Android/iOS/웹): 완전 무료, 전송량 무제한, 상용 포함** ([Firebase Pricing](https://firebase.google.com/pricing), [productgrowth.in FCM 리뷰](https://productgrowth.in/tools/engagement/firebase-fcm/)). **APNs(iOS): 별도 과금 없음 — $99 Developer Program 멤버십만 필요**(Apple이 APNs 사용료를 부과한다는 근거 없음; 무과금은 업계 통설이며 Apple이 '무료'라고 명시한 단일 문서는 미확인 — 추정).
- **자가호스팅 직접 푸시 구조** (Mattermost 패턴이 표준 레퍼런스):
  1. 메신저 서버 → **푸시 프록시**(오픈소스 [mattermost-push-proxy](https://github.com/mattermost/mattermost-push-proxy) 같은 경량 릴레이) → APNs/FCM → 단말.
  2. 필요 자격증명: **APNs Auth Key(.p8)** + **FCM 서버 키** — 자체 앱을 빌드하면 푸시 프록시도 자체 운영 필수 ([Mattermost push proxy 문서](https://docs.mattermost.com/deployment-guide/mobile/host-your-own-push-proxy-service.html), [Mattermost 개발자 문서](https://developers.mattermost.com/contribute/more-info/mobile/push-notifications/service/)).
  3. 보안 옵션: **ID-only 푸시** — APNs/FCM에는 메시지 ID만 보내고 본문은 앱이 사내 서버에서 직접 조회 → 외부 인프라에 메시지 내용 노출 차단 ([Mattermost 설정 문서](https://docs.mattermost.com/administration-guide/configure/push-notification-server-configuration-settings.html)).
- 결론: **푸시 인프라 변동비 0원** — APNs/FCM 자체 무료이므로 자가호스팅 서버+무료 프록시로 월 유지비 없이 구축 가능. (사족: iOS는 APNs 외 대체 경로가 사실상 없고, Android도 배터리 최적화 때문에 FCM 경유가 표준.)

---

## 6. 요약 비교 — 스택 조합별

| 조합 | 코드 공유 | 리스크 | 고정비(연) |
|---|---|---|---|
| **1안** React 웹 + Electron 데스크톱 + RN(Expo) 모바일 | 로직·타입 공유, UI는 웹/모바일 이원화 | 낮음(업계 검증) | ≈ $344~444 |
| **2안** React 웹앱 단일 + Capacitor 모바일 + Electron(또는 Tauri) 데스크톱 | 최대(웹 코드 그대로) | WebView UX 한계 | 동일 |
| Tauri 단일(데스크톱+모바일) | 웹 코드 공유 | **높음** — 모바일 플러그인 파리티 미완·updater 미지원·검증 사례 부족 | 동일 |
| Flutter 모바일 | 웹/데스크톱과 공유 없음 | 별도 Dart 스택 인력 필요 | 동일 |

## 권고 (리서치 결론)

권장 1안(기본): "TypeScript 모노레포 — React 웹 + Electron 데스크톱 + React Native(Expo) 모바일·태블릿". Discord/Mattermost/Rocket.Chat이 검증한 업계 표준 조합으로, 비즈니스 로직·API 클라이언트·타입을 전 플랫폼에서 공유하면서 모바일은 네이티브급 UX를 확보한다. 데스크톱 자동 업데이트는 electron-updater+사내 HTTP 서버(무료), 모바일 배포는 iOS Unlisted 앱($99/년 프로그램) + Android managed Google Play/APK(무료), 푸시는 자가호스팅 서버→오픈소스 푸시 프록시→APNs/FCM(무료, ID-only 모드로 보안 확보). 연간 고정비 약 $344~444(≈48~62만원, 1USD=1,400KRW): Apple $99 + Play $25(일회성) + Windows OV 인증서 $220~320. Expo EAS는 무료 티어+로컬 빌드로 월 0원 운용 가능. / 대안 2안(개발 인력 최소화): "단일 React 웹 코드베이스 + Capacitor 모바일 래핑 + Electron 데스크톱". 코드 공유율이 최대(~90%+ 추정)라 초기 구축·유지 인력이 가장 적지만, WebView 성능 한계로 긴 채팅 리스트·알림 UX 품질이 1안보다 낮다 — 사용자 수백 명 이하 사내 도구로는 수용 가능한 트레이드오프. / 비권장: Tauri 단일 스택 3-플랫폼(모바일 updater 미지원·플러그인 파리티 미완·메신저 채택 사례 부족 — 단, 데스크톱 한정으로는 메모리·번들 이점이 커서 2안의 데스크톱 셸로 검토 가치 있음), Flutter(웹·데스크톱과 코드 공유 0). 또한 Enterprise Program($299)은 100인 미만이면 부적격이므로 기획에서 배제하고, Windows 서명 예산은 Azure Trusted Signing(한국 불가)이 아닌 OV 인증서 기준으로 잡을 것.
