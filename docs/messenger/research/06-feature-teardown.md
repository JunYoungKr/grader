# Slack/Discord 기능 분해와 한국형 사내 메신저 MVP 스펙 (2026-07 조사)

> 환율 표기: **1 USD ≈ 1,400 KRW 가정**. 원화는 근사치. 확인 못 한 항목은 '추정'으로 명시.

---

## 1. Slack 핵심 기능 분해와 업무 가치

Slack 공식 기능 페이지·헬프 문서 및 2026년 요금 분석 자료 기준.

| 기능 | 내용 (출처 기준) | 업무 가치 |
|---|---|---|
| **채널(공개/비공개)** | 팀·프로젝트 단위 대화방. Slack에서 주간 약 150억 건의 액션이 채널에서 발생 ([slack.com/features](https://slack.com/features)) | 정보의 '장소'를 고정 → 메일 CC 지옥 제거, 신규 입사자가 과거 맥락을 즉시 흡수 |
| **DM/그룹 DM** | 1:1 및 소그룹 대화 ([slack.com/pricing/paid-vs-free](https://slack.com/pricing/paid-vs-free)) | 비공식·민감 대화 채널 |
| **스레드** | 메시지에 종속된 답글 트리 ([slack.com/features](https://slack.com/features)) | 채널 소음 억제 — 하나의 주제가 채널 타임라인을 점령하지 않음 |
| **허들(Huddles)** | 채널/DM 어디서나 즉석 음성·영상. 유료 플랜 최대 **50명**, 영상 활성화는 동시 25명(출처 간 12~25명으로 상이 — '추정'), 무료 플랜은 **1:1·30분 제한** ([slack.com/help — Use huddles](https://slack.com/help/articles/4402059015315-Use-huddles-in-Slack), [usecarly.com](https://www.usecarly.com/blog/slack-free-plan-limits/)) | "회의 잡기" 오버헤드 제거 — 5분짜리 논의를 즉석 음성으로 |
| **검색(연산자·필터)** | from:/in:/기간·파일형 필터, 메시지·파일·채널·사람 통합 검색 ([slack.com/help — Search in Slack](https://slack.com/help/articles/202528808-Search-in-Slack)) | 메신저를 '조직 지식 DB'로 만드는 핵심. 무료 플랜은 90일 이력만 검색 가능 |
| **북마크(채널 상단 고정 링크)** | 대시보드·문서·핵심 링크를 채널 상단에 고정 ([slack.com/blog](https://slack.com/blog/productivity/whats-new-in-slack-simplified-search-channel-bookmarks)) | 채널별 '시작 페이지' — 반복 질문 감소 |
| **리마인더(/remind)** | `/remind [#채널] [내용] [시점]`, 반복 리마인더 지원 ([slack.com/help — Set a reminder](https://slack.com/help/articles/208423427-Set-a-reminder)) | 후속조치 누락 방지, 정기 업무 리듬화 |
| **워크플로 빌더** | 노코드 자동화. 2026년 현재 생성형 AI 스텝 내장, 분기당 최대 5중 중첩 분기 ([slack.com/features/workflow-automation](https://slack.com/features/workflow-automation), [releasebot.io/updates/slack](https://releasebot.io/updates/slack)) | 휴가 신청·온보딩·장애 보고 등 폼 기반 반복 업무 자동화. **유료 전용** |
| **캔버스(Canvas)** | 채널·DM에 붙는 협업 문서, 허들마다 노트용 캔버스 자동 생성 ([slack.com/features/canvas](https://slack.com/features/canvas)) | 대화(휘발) ↔ 문서(축적)의 브리지. 무료 플랜은 읽기 전용 ([slack.com/help — Free 제한](https://slack.com/help/articles/27204752526611-Feature-limitations-on-the-free-version-of-Slack)) |
| **이모지 반응(reacji)** | 메시지에 이모지로 상태·감정 표시 ([slack.com/features](https://slack.com/features)) | "확인했습니다" 답글 홍수 제거 — 저비용 수신 신호(단, 한국식 '읽음 확인'의 대체재는 아님) |
| **앱 연동** | 2,600+ 외부 연동(GitHub·Jira·Google Workspace 등). 무료 플랜은 10개 제한 ([eesel.ai](https://www.eesel.ai/blog/slack-vs-discord), [slack.com/help](https://slack.com/help/articles/27204752526611-Feature-limitations-on-the-free-version-of-Slack)) | 알림 허브화 — 메신저가 업무 시스템의 프론트엔드가 됨. **Gmail·메일플러그·인트라넷 연동 요구의 벤치마크 지점** |
| **리스트(Lists)** | 경량 태스크/티켓 표 ([slack.com/help — updates](https://slack.com/help/articles/115004846068-Slack-updates-and-changes)) | 별도 PM 툴 없는 소규모 팀의 태스크 추적 |

**Slack 요금 맥락(연간 결제, 2026)**: Free $0 / Pro **$7.25**(≈ **10,150원**)/인/월 / Business+ **$15**(≈ **21,000원**)/인/월. 월별 결제 시 Pro $8.75(≈12,250원), Business+ $18(≈25,200원) ([slack.com/pricing](https://slack.com/pricing), [costbench.com](https://costbench.com/software/communication/slack/), [flat.social](https://flat.social/guides/slack-pricing)). 무료 플랜은 90일 이력 + 1년 초과분 영구 삭제 ([viewexport.com](https://viewexport.com/post/slack-free-plan-limitations)).

**시사점**: Slack의 진짜 가치는 개별 기능이 아니라 "채널=장소, 스레드=소음 제어, 검색=지식화, 연동=허브화"라는 4축 구조. MVP는 이 4축을 얇게라도 모두 갖춰야 한다.

---

## 2. Discord가 Slack과 다른 점 — 업무용으로 가져올 것

| Discord 차별점 | 내용 | 업무용 채택 판단 |
|---|---|---|
| **상시(persistent) 음성 채널** | 하루 종일 열려 있는 음성 채널에 자유롭게 드나드는 구조. 음성 채널 최대 **동시 99명**, 영상/화면공유는 최대 50명 ([support.discord.com — Caps](https://support.discord.com/hc/en-us/articles/33694251638295-Discord-Account-Caps-Server-Caps-and-More), [support.discord.com — Go Live](https://support.discord.com/hc/en-us/articles/360040816151-Go-Live-and-Screen-Share)) | **채택 권장(Phase 2)**. 원격/하이브리드 팀의 '가상 사무실 존재감'에 유효. Slack 허들(임시 개설)과 반대 모델 ([rock.so](https://www.rock.so/blog/slack-vs-discord)) |
| **역할(Role) 기반 세분 권한** | 서버 → 카테고리 → 채널 3계층 권한 + 채널별 오버라이드(허용/거부/상속, 명시적 거부 우선) ([support.discord.com — Roles](https://support.discord.com/hc/en-us/articles/214836687-Discord-Roles-and-Permissions), [mava.app](https://www.mava.app/blog/discord-permissions-by-categories-channels-and-roles-explained)) | **개념만 채택**. Slack에는 이 수준의 역할 시스템이 없음 ([gemspace.com](https://gemspace.com/blog/discord-vs-slack)). 한국 기업의 '직급·부서별 접근 통제'(임원 채널, 인사팀 전용 등)와 궁합이 좋음 — 단 풀 구현은 난이도 상, MVP는 관리자/멤버/게스트 3단계로 축소 |
| **저지연 음성 품질** | 게임용으로 최적화된 상시 음성 인프라 — 크리에이티브·게임 스튜디오가 선호 ([lovable.dev](https://lovable.dev/guides/slack-vs-discord-comparison)). 구체 지연 수치(ms)는 공식 문서에서 확인 못 함 — **'저지연은 정성적 평판' 수준으로 추정** | 자체 구축 시 SFU(LiveKit/mediasoup 등 오픈소스) 채택으로 유사 품질 확보 가능(구현 난이도 상) |
| **무료 중심 모델** | 서버 개설·음성·역할 모두 무료, 수익화는 개인 Nitro/부스트 | 유지비 관점에선 매력적이나 아래 결격 사유로 상쇄 |
| **기업용 결격 사유** | SOC 2·ISO 27001 등 컴플라이언스 인증 부재, 비즈니스 툴 네이티브 연동 부재, 중앙 관리·감사 기능 부재 ([eesel.ai](https://www.eesel.ai/blog/slack-vs-discord), [lovable.dev](https://lovable.dev/guides/slack-vs-discord-comparison)) | **Discord 자체를 사내 메신저로 쓰는 선택지는 배제**. UX 패턴(상시 음성, 역할)만 차용 |

---

## 3. 한국 기업 메신저의 특수 요구 — 국내 3사 공통 기능 근거

Jandi(토스랩)·카카오워크·NAVER WORKS가 공통 제공하는 기능은 곧 "한국 사용자가 기본으로 기대하는 것"이다. **Slack에는 이 중 대부분이 없다**는 점이 국산 제품의 존재 이유.

### 3-1. 읽음 확인(수신 확인) — 3사 공통, 한국형 필수 기능
- **잔디**: 모든 메시지에 '읽음 N' 표시, 클릭하면 **누가 읽었는지 명단** 확인 ([blog.jandi.com — 파워유저 팁](https://blog.jandi.com/ko/2020/07/09/jandi-user-tip-6/))
- **카카오워크**: 채팅방 구성원별 메시지 읽음 여부 확인 ([kakaocorp.com — 카카오워크 소개](https://www.kakaocorp.com/page/service/service/KakaoWork))
- **네이버웍스**: 메시지를 읽은 사람 수를 실시간 표시 ([naver.worksmobile.com](https://naver.worksmobile.com/feature/overview/))
- Slack은 읽음 확인이 없고 이모지 반응으로 대체하는 문화 — 한국 조직의 "봤어요/안 봤어요" 확인 문화와 충돌.

### 3-2. 조직도 기반 사용자 탐색 — 3사 공통
- **잔디**: 부서·직책 설정과 조직도(조직관리) 기능 ([blog.jandi.com — 관리자 기능 5가지](http://blog.jandi.com/ko/2020/06/11/using-admin-function/))
- **카카오워크**: 조직도 연동으로 친구 추가 없이 바로 대화, 근태시스템과 조직도 연계 ([cs.kakao.com](https://cs.kakao.com/helps?articleId=1073198559&category=663&device=&locale=ko&service=171))
- **네이버웍스**: 주소록에서 조직도를 한눈에 조회 ([naver.worksmobile.com](https://naver.worksmobile.com/feature/overview/))
- 한국 조직은 "이름이 아니라 부서·직급으로 사람을 찾는다" — 검색 UX의 1차 축이 조직도여야 함. **메일플러그 그룹웨어도 메신저·쪽지가 사내 조직도와 기본 연동** ([groupware.mailplug.com](https://groupware.mailplug.com/features/dedicated)) — 조직도 마스터를 메일플러그/인트라넷에서 동기화하는 아키텍처가 자연스러움. 메일플러그는 SSO·타 서비스 조직도 연동 API를 예제와 함께 제공 ([mailplug.com — 기능](https://www.mailplug.com/mailplug/features/dedicated)).

### 3-3. 공지 강제 알림(필독) — 3사 공통 패턴
- **네이버웍스**: 게시판 공지에 **필독 설정 + 미열람 구성원 재알림** ([naver.worksmobile.com — 코어 제품](https://naver.worksmobile.com/products/naver-works/))
- **잔디**: 공지 메시지의 수신 확인으로 미확인자를 파악해 @멘션 등 추가 조치 ([blog.jandi.com](https://blog.jandi.com/ko/2020/07/09/jandi-user-tip-6/))
- **카카오워크**: 관리자 공지·소통 통계 기능 ([blog.kakaowork.com — 관리자 업데이트](https://blog.kakaowork.com/51))
- 핵심 = "공지 게시"가 아니라 **"안 읽은 사람을 특정해 다시 미는" 폐루프**.

### 3-4. 쪽지 — 그룹웨어 계열의 유산
- 메일플러그 그룹웨어가 쪽지·메신저·조직도·전자결재를 통합 제공 ([groupware.mailplug.com](https://groupware.mailplug.com/features/dedicated)). 쪽지는 '읽음 추적되는 비동기 공식 통보' 용도.
- 신규 메신저에서는 별도 쪽지 모듈 대신 **'DM + 읽음 확인 + 보관 정책'으로 흡수**하는 것이 합리적 (자체 판단 — 추정). 단 메일플러그 쪽지와의 브리지가 필요한지 현업 확인 필요.

### 3-5. 전자결재·근태 알림 연동 — 3사 공통 방향
- **카카오워크**: 근태관리/전자결재를 내장(승인·반려 알림을 메신저로 실시간 수신, 클릭 한 번 처리) ([blog.kakaowork.com/40](https://blog.kakaowork.com/40), [kakaocorp.com](https://www.kakaocorp.com/page/service/service/KakaoWork)) — 단 해당 블로그 글 시점의 무료 정책이 2026년 현재도 유지되는지는 **미확인(추정)**
- **메일플러그**: 전자결재·근태관리 모듈 보유 ([groupware.mailplug.com/features/worknote](https://groupware.mailplug.com/features/worknote))
- 신규 메신저는 결재 엔진을 만들지 말고, **메일플러그 결재의 알림·딥링크를 메신저로 받아 처리 화면으로 점프**시키는 봇/웹훅 모델이 정답 (Slack의 앱 연동 패턴 차용).

### 3-6. 대화 내보내기·유출 통제 — 3사 공통(유료/관리자 기능)
- **잔디**: 파일 다운로드 제한(디바이스·권한·IP별), 문서 워터마크, 다운로드 기록, 접속 허용 IP, 2FA. 비공개 토픽은 관리자도 열람 불가 ([blog.jandi.com — 보안 11가지](https://blog.jandi.com/ko/2022/05/16/all-about-jandi-security/), [blog.jandi.com — 관리자 메뉴](https://blog.jandi.com/ko/2022/07/29/admin-menu/))
- **카카오워크**: 메시지 복사 금지/글자 수 제한(100·300·500자), 파일 다운로드 제한, 워터마크, 보안 파일 뷰어(유료) ([blog.kakaowork.com/232](https://blog.kakaowork.com/232), [kakaowork.com/security](https://www.kakaowork.com/security)). 대화 캡처도 카카오워크 내부 공유만 허용, 외부 공유 차단 ([blog.kakaowork.com/194](https://blog.kakaowork.com/194))
- **네이버웍스**: 관리자 감사 로그(메시지 송수신·입퇴장 내역, 180일 보관, 조건 검색·다운로드), 서비스별 파일 다운로드 제한 ([guide.worksmobile.com — 감사](https://guide.worksmobile.com/kr/admin/admin-guide/audit/), [guide.worksmobile.com — 파일 보안](https://guide.worksmobile.com/kr/admin/admin-guide/security/file-security/))
- 시사점: 한국 기업은 "직원이 대화를 통째로 들고 나가는 것"을 막는 통제 + 컴플라이언스용 감사 로그를 관리자 기능의 표준으로 기대. 단 네이버웍스 사례처럼 '관리자 사찰' 논란도 있으므로 ([newsw.co.kr](https://www.newsw.co.kr/news/articleView.html?idxno=3337)) **감사 범위 고지·비공개방 열람 불가 원칙을 정책으로 명문화**해야 함.

---

## 4. 3단계 기능 로드맵 (구현 난이도: 상/중/하)

전제: Electron 데스크톱 + React Native(또는 유사) 모바일/태블릿, 자체 서버(또는 Matrix/Mattermost 등 오픈소스 코어 활용 시 난이도 1단계씩 하락 — 추정).

### MVP (필수 — 이것 없으면 출시 불가)
| # | 기능 | 근거 | 난이도 |
|---|---|---|---|
| 1 | 채널(공개/비공개) + DM/그룹 DM | Slack 4축의 기본 ([slack.com/features](https://slack.com/features)) | 중 |
| 2 | **읽음 확인(읽은 사람 명단)** | 국내 3사 공통, 한국형 핵심 차별 요구 (§3-1) | 중 |
| 3 | **조직도 기반 사용자 탐색·프로필(부서/직급)** + 메일플러그 조직도 동기화 | 국내 3사 공통 (§3-2), 메일플러그 API 존재 ([mailplug.com](https://www.mailplug.com/mailplug/features/dedicated)) | 중 |
| 4 | **공지(필독) + 미열람자 재알림** | 국내 3사 공통 패턴 (§3-3) | 중 |
| 5 | 스레드(답글) | 채널 소음 제어 — Slack 검증 ([slack.com/features](https://slack.com/features)) | 중 |
| 6 | 이모지 반응 | 저비용 수신 신호, 구현 대비 효용 최상 | 하 |
| 7 | 멘션(@사용자/@채널) + 푸시 알림(모바일 FCM/APNs, 데스크톱) | 알림 없는 메신저는 무용 | 중 |
| 8 | 파일 공유 + 이미지 미리보기 | 기본기 | 중 |
| 9 | 검색(메시지·파일·사람, from:/in:/기간 필터) — **무제한 이력** | Slack 무료판 90일 제한이 최대 불만 지점 ([viewexport.com](https://viewexport.com/post/slack-free-plan-limitations)) — 자체 구축의 최대 장점 | 상 |
| 10 | 관리자 콘솔 v1: 계정 프로비저닝(메일플러그/Gmail 계정 연계 SSO), 권한 3단계(관리자/멤버/게스트), 감사 로그 기본 | 국내 3사 공통 관리 요구 (§3-6) | 중 |
| 11 | 전자결재·근태 **알림 수신 봇**(인바운드 웹훅 + 딥링크) | §3-5 — 결재 엔진 자체 개발 회피 | 하~중 |

### Phase 2 (차별화)
| # | 기능 | 근거 | 난이도 |
|---|---|---|---|
| 1 | 음성 허들(1:1→소그룹, 화면공유 1인) | Slack 허들 검증 ([slack.com/help](https://slack.com/help/articles/4402059015315-Use-huddles-in-Slack)). WebRTC SFU 필요 | 상 |
| 2 | **상시 음성 채널(Discord식 드나드는 방)** | Discord 차별점 중 업무 가치 최상 (§2) | 상(허들 인프라 재사용 시 중) |
| 3 | 북마크(채널 상단 고정) + 메시지 저장(나중에 보기) | Slack 검증 ([slack.com/blog](https://slack.com/blog/productivity/whats-new-in-slack-simplified-search-channel-bookmarks)) | 하 |
| 4 | 리마인더(/remind, 반복) | Slack 검증 ([slack.com/help](https://slack.com/help/articles/208423427-Set-a-reminder)) | 중 |
| 5 | 역할 기반 권한 확장(부서·직급 롤 + 채널별 오버라이드) | Discord 모델 축소판 (§2) | 상 |
| 6 | 유출 통제 v1: 파일 다운로드 제한, 워터마크, 대화 내보내기 관리자 승인제 | 국내 3사 유료 기능 (§3-6) | 중 |
| 7 | Gmail/메일플러그 메일 → 채널 전달(메일 to 채널 주소), 인트라넷 알림 웹훅 표준화 | 연동 허브화 (§1 앱 연동) | 중 |
| 8 | 투표/간단 설문 | 잔디·네이버웍스 제공 ([ko.wikipedia.org — 잔디](https://ko.wikipedia.org/wiki/%EC%9E%94%EB%94%94_(%EB%A9%94%EC%8B%A0%EC%A0%80))) | 하 |

### Phase 3 (확장)
| # | 기능 | 근거 | 난이도 |
|---|---|---|---|
| 1 | 워크플로 빌더(노코드 폼·자동화) | Slack 유료 핵심 ([slack.com/features/workflow-automation](https://slack.com/features/workflow-automation)) | 상 |
| 2 | 협업 문서(캔버스류) 또는 기존 위키 연동 | Slack Canvas ([slack.com/features/canvas](https://slack.com/features/canvas)) — 자체 개발보다 연동 우선 | 상(연동이면 중) |
| 3 | 영상 회의(다자 영상 25~50명급) | Slack 허들 50명/Discord 50명 벤치마크 | 상 |
| 4 | 경량 태스크(리스트/할 일) | Slack Lists, 잔디 할 일 | 중 |
| 5 | 감사·컴플라이언스 고도화(eDiscovery식 내보내기, 보존 정책, 로그 180일+ ) | 네이버웍스 감사 모델 ([guide.worksmobile.com](https://guide.worksmobile.com/kr/admin/admin-guide/audit/)) | 중 |
| 6 | 오픈 API/봇 플랫폼(아웃고잉 웹훅, 슬래시 커맨드) | Slack 2,600+ 생태계의 축소 재현 ([eesel.ai](https://www.eesel.ai/blog/slack-vs-discord)) | 상 |
| 7 | AI 검색·요약(스레드 요약, 미확인 공지 요약) | Slack AI(Business+ 이상) 트렌드 ([costbench.com](https://costbench.com/software/communication/slack/)) | 상 |

---

## 5. 불확실·추정 항목 정리
- Slack 허들의 동시 영상 인원(12명 vs 25명)은 출처 간 상이 — **25명(공식 헬프 계열 출처) 우선, 추정 병기**.
- Discord '저지연'의 정량 수치(ms)는 공식 문서에서 미확인 — **정성 평판으로만 인용**.
- 카카오워크 근태/전자결재의 현재(2026) 무료 제공 여부 — 블로그 글 시점 기준이라 **현행 요금 정책 재확인 필요(추정)**.
- 메일플러그 연동 API의 실제 범위(조직도 동기화 방향·웹훅 유무)는 영업 문의로 확인 필요 — 공식 페이지는 "SSO·조직도 연동 API, 소스 예제 제공"까지만 명시 ([mailplug.com](https://www.mailplug.com/mailplug/features/dedicated)).
- 구현 난이도(상/중/하)는 리서치 담당의 엔지니어링 판단이며 출처가 있는 사실이 아님.

## 권고 (리서치 결론)

MVP에서 절대 빼면 안 되는 것 5가지: (1) 읽음 확인(읽은 사람 명단 단위) — 국내 3사(잔디·카카오워크·네이버웍스) 공통이자 Slack 대비 한국형 핵심 차별점으로, 없으면 카카오톡 회귀가 일어난다. (2) 조직도 기반 사용자 탐색 + 메일플러그/인트라넷 계정·조직도 동기화(SSO) — 한국 조직은 부서·직급으로 사람을 찾으며, 메일플러그가 조직도·SSO API를 제공하므로 조직도 마스터는 그룹웨어 쪽에 두고 동기화한다. (3) 공지(필독) + 미열람자 자동 재알림 폐루프 — '게시'가 아니라 '안 읽은 사람을 특정해 다시 미는' 기능이 본질. (4) 채널·스레드·멘션·모바일 푸시로 구성된 Slack형 대화 코어 — 스레드 없는 채널은 단톡방 소음을 재생산하고, 푸시 없는 메신저는 채택 자체가 실패한다. (5) 무제한 이력의 통합 검색(메시지·파일·사람) — Slack 무료판의 90일 제한이 최대 불만 지점이므로 자체 구축의 최대 장점으로 삼는다. 반대로 음성(허들·상시 채널)·워크플로 빌더·협업 문서는 난이도 상이므로 MVP에서 과감히 제외하고 Phase 2~3로 미루되, 전자결재·근태는 자체 개발 대신 메일플러그 알림 봇+딥링크로 흡수한다. Discord는 제품 채택이 아니라 상시 음성 채널(Phase 2)과 역할 권한 모델(축소판)의 참조 사례로만 활용한다.
