# 국내외 업무 메신저 SaaS 가격·정책 조사 (2026-07 기준)

**조사 방법 주의사항**: 본 환경의 프록시가 벤더 공식 사이트 직접 접근(WebFetch)을 대부분 차단하여(403 정책 거부), 수치는 WebSearch가 반환한 공식 페이지·언론·비교 사이트 요약을 교차 확인해 정리했다. 원화 환산은 **1 USD ≈ 1,400 KRW 가정**(임의 가정, 실제 청구는 환율·부가세에 따라 변동). 확인하지 못한 값은 **[추정]** 으로 표기. 국내 B2B SaaS 가격의 VAT 포함 여부는 서비스별로 표기가 달라, 명시 확인 못 한 경우 "VAT 별도 추정"으로 적었다.

---

## 1. Slack (벤치마크 1)

- **무료 플랜**: 메시지 히스토리 **90일**(이후 숨김, **1년 경과 시 서버에서 영구 삭제**), 앱 연동 **10개**, 파일 스토리지 **전체 공용 5GB**, 허들(음성/화상) **1:1·30분 제한**(그룹 허들 불가), 외부 협업 파트너 1곳 제한. 출처: [Slack 공식 무료 버전 기능 제한](https://slack.com/help/articles/27204752526611-Feature-limitations-on-the-free-version-of-Slack), [ViewExport 정리](https://viewexport.com/post/slack-free-plan-limitations), [CompareTiers](https://comparetiers.com/blog/slack-free-plan-limitations-2026)
- **Pro**: **$7.25/인/월(연간 결제) ≈ 10,150원**, 월간 결제 시 $8.75 ≈ 12,250원. 출처: [Slack 공식 요금](https://slack.com/pricing), [Vendr](https://www.vendr.com/blog/slack-cost-per-user-real-pricing-by-plan-in-2026), [Costbench](https://costbench.com/software/communication/slack/)
- **Business+**: **$15/인/월(연간) ≈ 21,000원**, 월간 $18 ≈ 25,200원 (2025년 인상 후 가격). 출처: [Slack 플랜 가격 업데이트 공지](https://slack.com/help/articles/39264531104275-Updates-to-feature-availability-and-pricing-for-Slack-plans), [Costbench](https://costbench.com/software/communication/slack/)
- **연동**: 사내메일 기능 없음(외부 메일 연동형). **Gmail**: 무료 포함 전 플랜에서 [Slack for Gmail 애드온](https://workspace.google.com/marketplace/app/slack_for_gmail/533288507123) 사용 가능, **채널 전용 이메일 주소로 메일 수신은 유료 플랜 전용**. 출처: [Send emails to Slack](https://slack.com/help/articles/206819278-Send-emails-to-Slack). 캘린더는 Google Calendar 앱 연동. **전자결재 없음**(외부 그룹웨어를 웹훅/앱으로 연동). 메일플러그 공식 연동은 확인되지 않음 — 웹훅/SMTP 전달로 우회 가능 [추정].

## 2. Discord (벤치마크 2)

- **가격**: 서버 개설·이용 무료. Nitro **$9.99/인/월 ≈ 14,000원**, Nitro Basic $2.99, 서버 부스트 $4.99/개 — 전부 개인 구독형이며 **기업 관리자용 플랜 자체가 없음**. 출처: [eesel Discord pricing](https://www.eesel.ai/blog/discord-pricing), [Costbench Discord](https://costbench.com/software/communication/discord/)
- **업무용 한계**: **SSO/SAML·SCIM 프로비저닝 없음**, SOC 2·ISO 27001 등 **컴플라이언스 인증 없음**, 감사 로그 **90일 제한**, 서버당 연동 **50개 제한**, DLP·데이터 보존 정책 등 관리 기능 부재. 사내 공식 메신저로는 부적합하고 커뮤니티 용도에 한정. 출처: [Lovable Slack vs Discord](https://lovable.dev/guides/slack-vs-discord-comparison), [Exoscale Discord alternatives](https://www.exoscale.com/blog/discord-alternatives/), [OCD Tech SOC2](https://ocd-tech.com/platform-compliance/is-discord-soc-2-compliant), [Accord 감사로그](https://www.accord.gg/articles/the-2026-discord-audit-logs-guide-and-why-theyre-not-analytics)
- **결론**: "Discord처럼 무료"는 성립하지만 보안·관리·이메일/결재 연동 요구를 전혀 못 맞춤. UI/UX 벤치마크 대상으로만 유효.

## 3. KakaoWork (카카오워크)

- **2026년 1월 요금제 개편** — 2026-03-04 신규 워크스페이스 선적용, **2026-07-01 전체 적용**(즉 지금 도입하면 개편 정책 적용). 출처: [비즈워치 기사](https://news.bizwatch.co.kr/article/mobile/2026/01/30/0039), [카카오워크 개편 FAQ](https://blog.kakaowork.com/246)
- **Free(0원)**: 개편 후 **멤버 30인 제한**, 메시지 **노출 90일·보관 1년**, 공용 저장공간 5GB, **전자결재 제외**. 출처: [비즈워치](https://news.bizwatch.co.kr/article/mobile/2026/01/30/0039)
- **Mini**: 월간 2,900원 → **연간 결제 시 인당 월 약 2,400원**. 메신저 중심, **메일·전자결재 제외**. 출처: [비즈워치](https://news.bizwatch.co.kr/article/mobile/2026/01/30/0039)
- **Standard: 6,500원/인/월(연간 계약 기준)** — 저장 용량 개편으로 인당 100GB, 메시지 보관 최대 5년. **Premium: 9,900원/인/월(연간)** — 인당 1TB, 보관 10년, 커스텀 앱 무제한. VAT 별도 [추정]. 출처: [카카오워크 요금안내(검색 요약)](https://www.kakaowork.com/pricing), [비즈워치](https://news.bizwatch.co.kr/article/mobile/2026/01/30/0039)
- **연동**: 자체 워크메일 제공 + **IMAP/POP3 지원**(Gmail 등 외부 클라이언트와 양방향 동기화 가능). 출처: [카카오워크 블로그](https://blog.kakaowork.com/182). 캘린더는 **Google/Outlook/iOS 캘린더와 공유·가져오기 지원**. 출처: [카카오워크 블로그](https://blog.kakaowork.com/167). 전자결재·근태·조직도 내장(유료). 봇/커스텀 앱 API로 인트라넷 연동 가능.

## 4. Jandi (잔디)

- **무료 플랜**: 있음 — 스토리지 5GB, 할 일 100개 제한 등 기능 제한. 출처: [잔디 요금안내(검색 요약)](https://www.jandi.com/landing/kr/pricing), [잔디 블로그](http://blog.jandi.com/ko/2018/08/23/잔디-유료-플랜에서만-제공되는-기능은/)
- **Premium: 인당 월 8,000원, Enterprise: 11,000원 (VAT 별도)** — 연간 결제가 월간보다 25% 저렴하다는 안내가 있어, 위 금액의 결제 주기 기준(연간 추정)은 재확인 필요 [일부 추정]. 출처: [잔디 요금안내(검색 요약)](https://www.jandi.com/landing/kr/pricing), [바질리 비교 글(잔디 프리미엄 연간 8,000원)](https://blog.basily.space/guksan-collaboration-tools-comparison), 해외 표기 [Capterra: Enterprise $11/인/월](https://www.capterra.com/p/170176/Jandi/)
- **화상회의는 Enterprise 전용(최대 64명)**, 메시지 수신 확인은 유료 전용. 출처: [잔디 유료 플랜 가이드](https://support.jandi.com/ko/categories/%EC%9C%A0%EB%A3%8C-%ED%94%8C%EB%9E%9C-%EA%B8%B0%EB%8A%A5-0aa2efc1)
- **연동**: 사내메일·전자결재 **내장 없음**. '잔디 커넥트'로 Google Calendar·Trello·JIRA·GitHub·RSS + **인커밍/아웃고잉 웹훅** 제공 — 그룹웨어 전자결재 알림(예: KT 비즈메카)·사내 시스템 연동 사례 있음. 메일플러그·인트라넷도 웹훅으로 알림 연동 가능 [추정]. 출처: [잔디 커넥트 가이드](https://support.jandi.com/ko/categories/%EC%BB%A4%EB%84%A5%ED%8A%B8-%EC%97%B0%EB%8F%99-b19b2e55), [잔디 웹훅 연동 사례](https://blog.jandi.com/ko/2017/08/23/jandi-connect-outgoing-webhook/)

## 5. Dooray! (NHN 두레이)

- **구조**: 메신저·프로젝트·**메일·캘린더·전자결재·화상회의·드라이브**를 한 계정에 담은 올인원. 플랜은 Free/Basic/Business/Enterprise이며 **프로젝트·메일·결재 등 서비스 모듈별 선택 과금**. 출처: [Dooray 요금안내](https://dooray.com/main/en/pricing/), [Dooray 요금 가이드(2026-02-27 갱신)](https://helpdesk.dooray.com/share/pages/LeTCSCECTSCu0itFjV5zTQ)
- **무료**: **25인 이하 조직은 Free 플랜으로 계속 무료**(26인부터 유료 전환). 출처: [Dooray 요금안내(검색 요약)](https://dooray.com/main/en/pricing/)
- **가격**: 인원·모듈 조합별 과금으로 **정확한 인당 단가는 검색으로 확정 못 함 [추정: 기능 조합에 따라 인당 월 4,000~9,000원대]**. 제3자 정리에서 "기능당 1인 기준 4~5,000원씩 추가" 언급. 월간 결제는 연간 대비 20% 가산. 2024-02 공용 용량 추가요금 인상 이력 있음. 출처: [valuable12 협업툴 비교](https://valuable12.com/entry/%EC%97%85%EB%AC%B4%EC%9A%A9-%ED%98%91%EC%97%85%ED%88%B4-%EC%B6%94%EC%B2%9C-%EB%B0%8F-%EB%B9%84%EA%B5%90), [Dooray 용량 요금 인상 공지](https://doorayhelp.oc.nhncloud.com/dooray/hc/notice/43/?lang=ko) — **도입 검토 시 공식 견적 필수**
- **연동**: 메일·캘린더·전자결재가 **내장**이라 별도 연동 불필요(외부 메일은 IMAP 연동). 공공기관 전용 상품 별도 존재. 출처: [gov-dooray 요금](https://gov-dooray.com/main/pricing/)

## 6. Flow (마드라스체크, flow.team)

- **무료**: 체험 성격의 무료 플랜 존재(기능 제한). 출처: [플로우 요금제 안내](https://support.flow.team/ko/flow/234707787)
- **비즈니스 플랜**: **최소 5인 월 60,000원 + 5인 초과 1인당 월 12,000원(VAT 별도)**, **12개월 선결제 시 25% 할인**(→ 인당 월 약 9,000원 [추정], 10인 이상 연간 결제 시 인당 8,000원이라는 안내도 검색됨 [추정]). 출처: [플로우 요금제 안내](https://support.flow.team/ko/flow/234707787)
- **특징·연동**: 2025~26년 개편으로 **전자결재·이메일·일정 등 그룹웨어 핵심 기능을 무료 통합 제공** 방향 발표. 프로젝트 관리 중심 + 메신저. 구축형(온프레미스) 도입 옵션 별도 견적. 출처: [헬로티 기사](https://www.hellot.net/news/article.html?no=99898), [임팩트플로우 플로우 정리](https://impactflow.kr/product/flow)

## 7. NAVER WORKS (네이버웍스 코어)

- **Free(0원)**: **최대 30명**(2024-06-04부로 100명→30명 축소), 메시지·캘린더·주소록·화상회의 등 기본 기능, 공용 5GB, **메일·드라이브 미포함**. 출처: [네이버웍스 코어 이용요금](https://naver.worksmobile.com/pricing/), [Free 상품 정책 변경](https://naver.worksmobile.com/whats-new/naver-works-users/product-change/free/)
- **Lite: 연간 3,000원/월간 4,000원(인/월)** — 기능 제한 해제, 메일·드라이브 없음. **Standard: 연간 7,000원/월간 8,500원** — **메일(인당 100GB)·드라이브(인당 1TB 공용) 포함**. **Standard Plus: 연간 11,000원/월간 13,000원**. VAT 별도 [추정]. 출처: [네이버웍스 코어 이용요금](https://naver.worksmobile.com/pricing/), [신규 상품 소개](https://naver.worksmobile.com/whats-new/naver-works-users/product-policy-change/product-overview/)
- **전자결재**: 기본 미포함 — '웍스 결재' 애드온 **인당 월 3,000원(연간)/4,000원(월간)**, 근태·급여는 결재 상품 필수. 출처: [경영지원 이용요금](https://naver.worksmobile.com/pricing/works-support/)
- **연동**: 자체 메일/캘린더 완비(Standard 이상). 외부(Gmail·메일플러그) 메일과의 연동은 표준 메일 프로토콜 수준 [추정].

## 참고: 메일플러그(Mailplug) 자체 스택

이미 메일플러그를 쓰는 회사라면: 메일플러그 **그룹웨어는 정상가 계정당 월 3,200원**(12개월 결제 첫해 50% 할인 시 1,600원)으로 **전자결재·근태·조직도 연동 메신저까지 포함** — "메신저+결재+메일"을 최저 비용으로 묶는 선택지가 됨. 기업메일 단독은 월 2,600원. 출처: [메일플러그 서비스 요금](https://groupware.mailplug.com/gw/fee), [메일플러그 요금 페이지](https://groupware.mailplug.com/pricing)

---

## 8. 30 / 100 / 300명 월 비용 비교표 (연간 결제 기준, VAT 별도, 1 USD=1,400 KRW 가정)

| 서비스 (플랜) | 인당/월 | 30명 | 100명 | 300명 |
|---|---|---|---|---|
| Discord (무료) | 0원 | 0원 | 0원 | 0원 (업무용 부적합) |
| 네이버웍스 Free | 0원 | 0원 (30명 한도 딱 걸림) | 불가 | 불가 |
| 카카오워크 Free | 0원 | 0원 (30인 한도, 히스토리 90일) | 불가 | 불가 |
| 카카오워크 Mini | 2,400원 | 72,000원 | 240,000원 | 720,000원 |
| 네이버웍스 Lite | 3,000원 | 90,000원 | 300,000원 | 900,000원 |
| 메일플러그 그룹웨어(참고) | 3,200원 | 96,000원 | 320,000원 | 960,000원 |
| 카카오워크 Standard | 6,500원 | 195,000원 | 650,000원 | 1,950,000원 |
| 네이버웍스 Standard (메일 포함) | 7,000원 | 210,000원 | 700,000원 | 2,100,000원 |
| 잔디 Premium | 8,000원 | 240,000원 | 800,000원 | 2,400,000원 |
| 두레이 [추정 5,000~9,000원] | — | 15만~27만원 | 50만~90만원 | 150만~270만원 |
| 플로우 비즈니스 (연간, [추정]) | ≈9,000원 | ≈270,000원 | ≈900,000원 | ≈2,700,000원 |
| 카카오워크 Premium | 9,900원 | 297,000원 | 990,000원 | 2,970,000원 |
| Slack Pro | $7.25≈10,150원 | ≈304,500원 ($217.5) | ≈1,015,000원 ($725) | ≈3,045,000원 ($2,175) |
| 잔디 Enterprise | 11,000원 | 330,000원 | 1,100,000원 | 3,300,000원 |
| 네이버웍스 Std+웍스결재 | 10,000원 | 300,000원 | 1,000,000원 | 3,000,000원 |
| Slack Business+ | $15≈21,000원 | ≈630,000원 | ≈2,100,000원 | ≈6,300,000원 |

핵심 패턴: **Slack은 국내 협업툴 대비 인당 30~100% 비싸고 환율 리스크가 있으며**, 국내 서비스는 메일·결재 포함형(두레이/네이버웍스 Standard/카카오워크 Standard)이 인당 6,500~10,000원 선에 수렴한다. 30명 이하는 카카오워크/네이버웍스 Free로 0원 운영이 가능하지만 히스토리·메일 제한이 크다.

---

## 9. 자체 구축 손익분기 분석 (전부 [추정] — 내부 인건비 기준으로 재계산 필요)

**전제**: "자체 구축"을 (a) 오픈소스 셀프호스팅(Rocket.Chat/Mattermost + Electron 기반 공식 데스크톱/모바일 앱 그대로 사용, 필요 시 스킨/연동만 개발)과 (b) 완전 자체 개발(Electron 앱 신규 개발)로 구분.

- 오픈소스 라이선스 현황: **Mattermost 무료 셀프호스트 에디션은 v11부터 250인 제한**(Professional은 $10/인/월), **Rocket.Chat Community Edition은 셀프호스팅 시 인원 무제한**. 출처: [Mattermost 포럼(1,000→250인 축소)](https://forum.mattermost.com/t/when-was-the-1-000-user-limit-first-applied-to-the-free-self-hosted-team-edition/25425), [Mattermost 셀프호스티드 문서](https://docs.mattermost.com/about/self-hosted-subscriptions.html), [비교 글](https://docrack.me/en/mattermost-vs-rocketchat-self-hosted-team-messaging-comparison/) — 300명 회사라면 무료 기준으로는 Rocket.Chat CE가 사실상 유일한 선택.
- 셀프호스팅 상시 비용 [추정]: 인프라(앱+DB+스토리지+백업) 30명 월 5~15만원, 300명 월 30~60만원 + **운영 인력 0.2~0.5 FTE ≈ 월 100~300만원**(시니어 월 인건비 600만원 가정). 즉 **총 월 110~360만원**이 규모와 거의 무관하게 고정.
- **손익분기 [추정]**: SaaS 월 비용이 110만원을 넘는 지점부터 역전 가능 → Slack Pro 기준 **약 110~150명**, 국내 저가형(네이버웍스 Standard 7,000원) 기준 **약 160~300명 이상**, 초저가(Lite 3,000원·메일플러그) 기준으로는 **수백 명 규모에서도 SaaS가 계속 유리**. 30명 회사는 어떤 시나리오에서도 SaaS(또는 무료 플랜)가 압도적으로 저렴.
- **완전 자체 개발(Electron 신규 개발)**: 메신저+모바일+푸시+검색+파일 수준 기능에 개발자 3~5명 × 6~12개월 = **초기 3~10억 원 + 유지 월 수백만 원 [추정]**. 300명 규모의 SaaS 연 비용(약 2,300만~3,700만 원)과 비교하면 **회수 기간 10년 이상 → 비용 논리로는 성립하지 않음**. Electron 지원이 목적이라면 Rocket.Chat/Mattermost의 기존 Electron 데스크톱 앱 활용이 합리적.

**자체 구축의 비가격 장점**: 데이터 주권(메시지가 자사 서버에), 무제한 히스토리(무료 플랜 90일 제한류 없음), 메일플러그·인트라넷·Gmail과의 **커스텀 연동 자유**(웹훅/REST/봇), 2026년에도 반복된 **요금 인상·무료 축소 리스크 차단**(카카오워크 Free 30인 제한 신설, 네이버웍스 Free 100→30명, Slack Business+ 인상, Mattermost 무료판 250인 제한), 인원 증가 시 한계비용 미미.
**비가격 단점**: 보안 패치·백업·장애 대응을 자사가 전담(메신저 다운 = 전사 커뮤니케이션 마비), 모바일 푸시 품질·앱스토어 배포 등 운영 난이도, 전자결재·근태 등 그룹웨어 기능 부재로 별도 도구 필요, 담당자 이탈 리스크, SSO·감사 로그 등 일부 고급 기능은 오픈소스에서도 유료 에디션인 경우 있음.

## 권고 (리서치 결론)

비용 관점 손익분기(추정): 오픈소스 셀프호스팅(Rocket.Chat CE 등)의 상시 비용은 인프라+운영 인력 0.2~0.5 FTE로 월 약 110~360만 원이 규모와 무관하게 고정되므로, Slack Pro(인당 약 10,150원) 기준 약 110~150명, 국내 메일·결재 포함형 SaaS(인당 6,500~7,000원) 기준 약 160~300명부터 자체 호스팅이 유리해진다. 30명 규모는 어떤 시나리오에서도 SaaS(카카오워크/네이버웍스 무료 플랜 포함)가 압도적으로 저렴하고, 100명은 경계선, 300명부터 자체 호스팅 검토 가치가 생긴다. 단, Electron 앱을 포함한 '완전 자체 개발'은 초기 3~10억 원(추정)으로 300명 규모 SaaS 연 비용(약 2,300만~3,700만 원) 대비 회수가 불가능하므로 배제하고, 자체 구축은 반드시 기존 데스크톱/모바일 앱이 있는 오픈소스 셀프호스팅으로 한정할 것. 자체 구축의 비가격 장점은 데이터 주권, 무제한 히스토리, 메일플러그·인트라넷·Gmail과의 자유로운 커스텀 연동, 2026년에도 반복된 무료 축소·요금 인상 리스크(카카오워크·네이버웍스 Free 축소, Slack Business+ 인상, Mattermost 무료판 250인 제한) 차단이며, 단점은 보안 패치·백업·장애 대응 전담 부담(메신저 다운 = 전사 마비), 모바일 푸시 품질, 전자결재·근태 등 그룹웨어 기능 부재다. 현재 요구사항(Gmail·메일플러그 연동 + 월 유지비 최소화, 수십~수백 명)이라면 1차 후보는 네이버웍스 Standard 또는 두레이(메일·결재 내장, 인당 7천 원 내외), 메일플러그 유지 시 메일플러그 그룹웨어(월 3,200원, 메신저·결재 포함)가 최저 비용 조합이고, 300명 접근 시 Rocket.Chat 셀프호스팅 전환을 재평가하라. 단 두레이 정확 단가와 각 사 VAT 포함 여부는 공식 견적으로 재확인 필요(본 조사에서 추정 표기).
