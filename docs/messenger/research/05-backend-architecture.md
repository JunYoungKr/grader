# 저비용 자가호스팅 메신저 백엔드 아키텍처·운영비 조사 (2026-07 기준)

환율 가정: **1 USD ≈ 1,400 KRW** (요청 기준). EUR 환산은 1 EUR ≈ 1,500 KRW로 **추정** 표기.
주의: 조사 환경의 프록시 정책으로 일부 공식 요금 페이지(oracle.com, ncloud.com, iwinv.kr 본문 등) 직접 열람이 차단되어, 해당 항목은 검색 결과 스니펫 기반이며 불확실한 값은 '추정'으로 표기함.

---

## 1) 실시간 계층: 직접 구현 vs 관리형

### 직접 구현 (권장)
- **Node.js ws/Socket.IO**: 단일 노드에서는 Redis 어댑터·스티키 세션이 필요 없고, 여러 노드로 수평 확장할 때만 `@socket.io/redis-adapter`(Redis Pub/Sub)와 스티키 세션이 필요하다. WebSocket 전용(폴링 비활성화) 시 스티키 세션도 불필요 ([Socket.IO 공식 문서 - Using multiple nodes](https://socket.io/docs/v3/using-multiple-nodes/), [Redis adapter](https://socket.io/docs/v4/redis-adapter/)).
- **Elixir Phoenix Channels**: 공식 벤치마크에서 40코어/128GB 단일 서버로 **동시 WebSocket 연결 200만 개**, 단일 토픽 브로드캐스트 1~3초를 기록 ([Phoenix 공식 블로그](https://www.phoenixframework.org/blog/the-road-to-2-million-websocket-connections)). 즉 동시 접속 300명은 이 벤치마크의 **1/6,000 수준**으로, 1~2 vCPU급 VPS로도 여유.
- **판단**: 50~300명 사내 메신저의 동시 접속은 수백 연결 수준이라 어떤 스택이든 성능은 문제 아님. 팀 역량 기준 선택(일반적으로 Node+Socket.IO가 인력 풀이 넓음, Phoenix는 장애 격리·재연결 처리 우수).

### 관리형 요금 (2026)
- **Ably**: Free 패키지 월 600만 메시지·**동시 연결 200개**·동시 채널 200개 ([Ably 공식 요금 문서](https://ably.com/docs/platform/pricing/free), [한도](https://ably.com/docs/platform/pricing/limits)). 유료 Standard는 **월 $29(≈₩40,600) + 사용량 과금** ([Ably Standard](https://ably.com/docs/platform/pricing/standard)).
- **Pusher Channels**: Sandbox 무료(동시 연결 100·일 20만 메시지), **Startup $49/월(≈₩68,600, 동시 연결 500·월 1,000만 메시지)**, Business $499/월 ([Pusher 공식 요금](https://pusher.com/channels/pricing/)).
- **판단**: 300명 회사면 동시 연결이 200~300+(멀티 디바이스 포함)라 Ably Free·Pusher Sandbox 한도를 초과 → 최소 월 ₩4~7만의 고정비 발생. 메신저는 어차피 메시지 저장·인증용 앱 서버가 필요하므로 WebSocket만 외주화하면 **비용은 늘고 아키텍처는 단순해지지 않음**. 이 규모에서는 자가 WebSocket이 합리적. (관리형의 가치는 글로벌 분산·수만 동시 연결일 때.)

## 2) 저장 계층: PostgreSQL 중심 + 검색

- **PostgreSQL 단일 DB**로 메시지·채널·유저·읽음상태 모두 처리 가능한 규모. 300명×1일 수천 건 메시지는 연간 수백만 행 수준으로 단일 인스턴스에 무리 없음(일반적 운용 경험칙, 추정).
- **Redis 필요성**: 단일 앱 서버 구성에서는 필수 아님 — Socket.IO Redis 어댑터도 "여러 노드일 때만" 필요하다고 공식 문서가 명시 ([Socket.IO docs](https://socket.io/docs/v4/redis-adapter/)). 프레즌스(온라인 표시)·타이핑 인디케이터는 메모리/Postgres로 시작하고, 서버 2대 이상 확장 시 Redis 도입이 정석.
- **한국어 검색 — Postgres 기본 FTS의 한계**: PostgreSQL 기본 전문검색은 공백 분리 언어 전제라 **한국어(CJK) 형태소 분석을 지원하지 않음** ([PGroonga 공식: "PostgreSQL supports full text search against languages that use only alphabet and digit"](https://pgroonga.github.io/)). 선택지:
  - **textsearch_ko**: mecab+mecab-ko-dic 기반 확장. 2014년산으로 사실상 유일한 형태소 FTS였으나 유지보수 정체 ([GitHub i0seph/textsearch_ko](https://github.com/i0seph/textsearch_ko), [postgresql.kr 블로그](https://postgresql.kr/blog/korean_full_textsearch.html)).
  - **pg_bigm**: 2-gram 방식이라 비알파벳 언어(한국어) 지원, 형태소 사전 불필요 — 사내 메신저 검색 품질로는 충분한 경우가 많음 ([velog 비교 정리](https://velog.io/@identity230c/postgresql-%EB%AC%B8%EC%9E%90%EC%97%B4-%EA%B2%80%EC%83%89)).
  - **PGroonga**: Groonga 엔진 기반, 전 언어(CJK 포함) 지원·활발히 유지보수(2024~ 4.x 릴리스), Supabase도 기본 제공 ([pgroonga.github.io](https://pgroonga.github.io/), [Supabase 문서](https://supabase.com/docs/guides/database/extensions/pgroonga), [PostgreSQL 뉴스](https://www.postgresql.org/about/news/pgroonga-404-multilingual-fast-full-text-search-3150/)).
  - **Meilisearch 자가호스팅**: 토크나이저 charabia가 한국어를 지원(일/한 특화 Lindera 계열) ([meilisearch/charabia](https://github.com/meilisearch/charabia), [공식 언어 문서](https://www.meilisearch.com/docs/resources/help/language)). 단 RAM 요구가 커질 수 있음 — 원본 데이터 대비 디스크 10배 권장, 1GB JSON 데이터셋에 RAM ~35GB가 든 사례 보고 ([Meilisearch FAQ](https://www.meilisearch.com/docs/resources/help/faq), [GitHub issue #591](https://github.com/meilisearch/MeiliSearch/issues/591)). 메신저 텍스트(수백 MB 이하)면 2~4GB RAM 박스로 운용 가능(추정).
- **판단**: 별도 검색 서버 없이 **PGroonga(1순위) 또는 pg_bigm**으로 Postgres 안에서 해결하는 것이 운영비·복잡도 최소. 검색 UX 고도화가 필요해지면 Meilisearch를 앱 서버에 동거 배치.

## 3) 파일 스토리지

| 항목 | Cloudflare R2 | Backblaze B2 | 로컬 디스크+MinIO |
|---|---|---|---|
| 저장 단가 | $0.015/GB·월 (≈₩21/GB) | $6/TB·월 = $0.006/GB (≈₩8.4/GB) | 서버 디스크 증설비 |
| 무료 한도 | 10GB 저장 + Class A 100만·Class B 1,000만 op/월 | (무료 한도 소액, 확인 못함 — 추정) | — |
| 이그레스 | **전량 무료** | 월평균 저장량의 3배까지 무료, 초과 $0.01/GB. Cloudflare 등 제휴 CDN 경유 무제한 무료 | 서버 대역폭 소모 |
| 출처 | [R2 공식 요금](https://developers.cloudflare.com/r2/pricing/) | [B2 공식 요금](https://www.backblaze.com/cloud-storage/pricing) | 아래 참고 |

- **MinIO 경고**: 2025년 커뮤니티 에디션에서 관리 웹 콘솔(IAM·버킷 관리·모니터링)이 제거되고 기본 '오브젝트 브라우저'만 남았으며, 유료 AIStor로 유도 중. 커뮤니티에서는 Garage/SeaweedFS/Ceph로의 이탈 권고가 확산 ([Blocks & Files 2025-06](https://www.blocksandfiles.com/ai-ml/2025/06/19/minio-users-complain-after-admin-ui-removed-from-community-edition/1610856), [linuxiac](https://linuxiac.com/minio-steering-users-toward-paid-subscriptions/), [Vonng "MinIO is Dead"](https://blog.vonng.com/en/db/minio-is-dead/)). **신규 프로젝트에 MinIO 도입은 비권장.**
- **판단**: 파일 원본은 **R2**(이그레스 0원이라 이미지 미리보기·파일 다운로드 트래픽 걱정 없음, 사전서명 URL로 서버 경유 없이 전송), 백업 사본은 **B2**(최저 단가, 벤더 분산). 100명 회사 연 100~200GB 축적 가정 시 월 수천 원 수준.

## 4) 음성/화상: LiveKit vs Jitsi Meet

- **Jitsi Meet**: 공식 요구사양은 소규모 회의 4GB RAM(최소), 일반 권장 8GB. 20명 회의 기준 4코어/8GB, 단일 서버 실용 한계 ~75 참가자. 대형화는 JVB(videobridge) 수평 증설 방식 ([Jitsi 공식 핸드북 Requirements](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-requirements/), [커뮤니티 포럼](https://community.jitsi.org/t/server-requirements-for-20-users-with-video/24865), [jitsi.guide](https://jitsi.guide/blog/jitsi-open-source-self-host-video-conferencing-guide/)). Debian 패키지 `jitsi-meet-turnserver`로 coturn이 반자동 구성됨(UDP 3478/TLS 5349) ([Jitsi TURN 문서](https://jitsi.github.io/handbook/docs/devops-guide/turn/)).
- **LiveKit self-host**: 기본 배포 최소 4코어/8GB 권장, 공식 벤치마크는 GCP 16코어 compute-optimized 인스턴스 기준으로 단일 룸 최대 참가자 수를 측정 ([LiveKit 벤치마크 문서](https://docs.livekit.io/deploy/benchmark/), [Expertflow 배포 가이드](https://docs.expertflow.com/cx-knowledgebase/latest/livekit-deployment-guide)). 실측 사례로 50~60개 1:1 세션(약 120 동시 참가자)을 중급 서버에서 처리 ([NovoServe 블로그](https://novoserve.com/blog/build-video-platforms-on-dedicated-server)). TURN 내장(livekit-turn)이나 별도 도메인+TLS 인증서 필요 ([LiveKit self-hosting 문서](https://docs.livekit.io/deploy/custom/deployments/)).
- **TURN 필요성**: 기업 방화벽/대칭 NAT 환경에서는 직접 P2P·STUN이 자주 실패해 TURN 릴레이 의존도가 매우 높음 — 일반 인터넷 약 20~30%, 엄격한 기업망에서는 대부분의 연결이 릴레이를 탄다는 업계 분석(85%까지 주장하는 자료도 있으나 블로그 출처로 정확도는 '추정') ([CelloIP TURN 가이드](https://celloip.com/blog/webrtc-turn-server-production-guide/), [webrtc.org TURN 문서](https://webrtc.org/getting-started/turn-server)). **사내 메신저 특성상 coturn(BSD 라이선스, 무료) 배치는 사실상 필수** ([coturn GitHub](https://github.com/coturn/coturn/issues/1471)).
- **판단**: "회의방 링크로 모이는" 사용이면 **Jitsi**(완성형 UI 포함, 통합 쉬움). Slack 허들처럼 **앱 안에 통화를 내장**하려면 **LiveKit**(SDK 중심, Flutter/RN/네이티브 SDK 제공). 어느 쪽이든 4코어/8GB 1대에서 시작, 회의가 잦으면 채팅 서버와 분리.

## 5) 호스팅 가격 (2026, 월 KRW)

| 옵션 | 사양 | 월 요금 | 비고 |
|---|---|---|---|
| **Oracle Cloud Always Free** | ARM A1 **2 OCPU/12GB**(2026-06부터 축소), 블록 200GB, 이그레스 10TB/월 | **0원** | 아래 리스크 참조 |
| **Vultr 서울** | 1vCPU/1GB/25GB NVMe/2TB | $6 ≈ **₩8,400** | 서울 리전 보유. 자동백업 +20% ([Vultr 요금](https://www.vultr.com/pricing/), [리전](https://www.vultr.com/features/datacenter-regions/), [checkthat 정리](https://checkthat.ai/brands/vultr/pricing)) |
| **AWS Lightsail 서울** | 2vCPU/2GB/60GB/3TB | $12 ≈ **₩16,800** | 서울(ap-northeast-2) 제공 ([요금](https://aws.amazon.com/lightsail/pricing/), [리전 문서](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-regions-and-availability-zones-in-amazon-lightsail.html)) |
| AWS Lightsail 서울 | 2vCPU/4GB/80GB/4TB | $24 ≈ **₩33,600** | 초과 트래픽 $0.09/GB ([cloudburn 정리](https://cloudburn.io/blog/amazon-lightsail-pricing)) |
| **iwinv (국내, 가산IDC)** | 1vCPU/1GB/25GB NVMe | **₩5,600** | 일단위 과금, 일 기본 전송량 제공 ([iwinv 요금 문서](https://docs.iwinv.kr/docs/billing/rate-calculator/), [iwinv](https://www.iwinv.kr/)) |
| iwinv | 2vCPU/8GB/SSD 200GB (soi_2.8_s) | **₩45,100** | 동일 출처 |
| **Hetzner** | CX22 2vCPU/4GB (독일/핀란드) | €4.35 ≈ ₩6,500 (추정 환산) | **한국 리전 없음.** 2026년 4월 ~30-35% 인상 + 6월 15일 추가 조정 예고. 싱가포르 리전은 유럽 대비 3배 이상 비싸고 ARM(CAX) 미제공 ([Hetzner 가격조정 공지](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/), [igor's Lab](https://www.igorslab.de/en/hetzner-to-significantly-increase-prices-for-cloud-and-dedicated-servers-from-april-2026/), [vpsfor.dev](https://vpsfor.dev/posts/hetzner-cx22-pricing-2026/)). 독일↔서울 RTT ~250-300ms, 싱가포르↔서울 ~70-100ms(추정) → 실시간 메신저 UX에 불리, **비권장** |
| **NCP(네이버클라우드)** | 2vCPU급 서버 | 월 약 **₩69,000** (참고치) | 국내 컴플라이언스 강점이나 동급 대비 4~8배 비쌈 ([speedykorea 비교](https://www.speedykorea.com/blog/representative-cloud-price-comparison), [NCP 요금 페이지](https://www.ncloud.com/charge/price) — 직접 열람 차단으로 참고치, '추정') |

### Oracle Always Free 상세 리스크 (중요)
- **2026년 6월부터 A1 무료 한도가 4 OCPU/24GB → 2 OCPU/12GB로 반토막** (1,500 OCPU시간+9,000 GB시간/월). 공식 블로그 공지 없이 조용히 진행됐고, 한도 초과 인스턴스는 셧다운될 수 있음 ([linuxiac](https://linuxiac.com/oracle-quietly-cuts-free-tier-ampere-a1-resources-in-half/), [TerminalBytes](https://terminalbytes.com/oracle-cloud-free-tier-changes-2026/), [Oracle 커뮤니티 논의](https://community.oracle.com/customerconnect/discussion/964620/do-the-new-reduced-ampere-a1-free-tier-limits-apply-to-existing-users)). PAYG 전환 계정은 기존 한도 유지라는 상담 답변도 있으나 공식 확인 불가(추정).
- **유휴 회수 정책**: 7일간 95퍼센타일 CPU<10% & 네트워크<10% & 메모리<10%(A1)이면 인스턴스 회수 대상. 30일 미사용 계정은 정지·해지 가능 ([Oracle 공식 Always Free 문서](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm), [Oracle FAQ](https://www.oracle.com/cloud/free/faq/)).
- **용량 부족**: 무료 계정은 서울/춘천 리전에서 "Out of capacity"로 A1 생성 자체가 안 되는 경우가 만성적이며, 춘천은 A1 미지원 ([zeupark 사례](https://zeupark.github.io/2025/06/24/Oracle-Free-Tier-Limitations.html), [hitrov 우회 스크립트](https://github.com/hitrov/oci-arm-host-capacity)).
- **판단**: 이그레스 10TB/월 무료([fullmetalbrackets 정리](https://fullmetalbrackets.com/blog/oci-free-tier-breakdown), [Oracle Free Tier](https://www.oracle.com/cloud/free/))는 매력적이나, 정책이 예고 없이 바뀌는 전례가 생겼으므로 **회사 메신저의 단독 프로덕션 인프라로는 비권장. 개발/스테이징 또는 보조 노드(모니터링·백업 검증)로 활용**.

## 6) 운영: 백업·모니터링·TLS·푸시

- **백업**: pgBackRest — 증분(16KB 블록 단위)·병렬 압축(zstd)·AES-256 암호화·PITR 지원, S3 호환 스토리지(R2/B2) 직접 업로드 ([pgbackrest.org](https://pgbackrest.org/), [RamNode 가이드: B2 $6/TB를 백업 저장소 기본으로 권장](https://ramnode.com/guides/series/postgres-superstack/pgbackrest), [Scaleway 튜토리얼](https://www.scaleway.com/en/docs/tutorials/backup-postgresql-pgbackrest-s3/)). 전략: 매일 풀/증분 + WAL 아카이브 → B2, 파일스토리지(R2)는 버전닝. 3-2-1 원칙으로 서버 스냅샷(Lightsail/Vultr 유료, Vultr +20%)은 선택.
- **모니터링**: **Uptime Kuma** — 완전 무료 오픈소스, HTTP/TCP/DB/Docker 감시 + 78개 이상 알림 채널(자기 메신저로 웹훅 알림 가능), Docker 1컨테이너로 앱 서버 동거 배치 ([GitHub louislam/uptime-kuma](https://github.com/louislam/uptime-kuma), [Better Stack 가이드](https://betterstack.com/community/guides/monitoring/uptime-kuma-guide/)). 무료 외부 감시(사이트 다운 자체 감지)는 Uptime Kuma를 Oracle 무료 인스턴스 등 별도 위치에 두는 방식으로 해결 가능.
- **TLS**: Let's Encrypt 무료 인증서 + certbot/Caddy 자동 갱신 — 비용 0원 ([letsencrypt.org](https://letsencrypt.org/)). LiveKit TURN/TLS용 별도 서브도메인 인증서도 동일하게 무료 발급.
- **푸시**: **FCM은 무료·무제한**(Spark/Blaze 공통, 메시지당 과금 없음) ([Firebase 공식 요금](https://firebase.google.com/pricing), [buildmvpfast 정리](https://www.buildmvpfast.com/tools/api-pricing-estimator/firebase-fcm)). APNs 자체도 무료이나 **Apple Developer Program 연 US$99(한국 결제 ₩129,000, 부가세 별도 여부는 추정)** 필요 ([Apple Developer 멤버십 비교](https://developer.apple.com/support/compare-memberships/), [등록 가이드](https://documentation.swing2app.co.kr/knowledgebase/appstore/apple-developer)).
- **도메인**: .kr/.co.kr 연 26,400원(가비아, VAT 포함) ≈ 월 2,200원 ([가비아 도메인](https://domain.gabia.com/), [hosting.kr 안내](https://help.hosting.kr/hc/en-us/articles/360035686051-How-much-does-the-domain-cost)).

## 권고 (리서치 결론)

**권고: 서울 리전 VPS(Lightsail/Vultr/iwinv) 1~2대 + PostgreSQL(+PGroonga) + Socket.IO(또는 Phoenix) 자가 WebSocket + Cloudflare R2 파일 + FCM 무료 푸시 구성. 관리형 실시간(Ably/Pusher)과 Oracle 무료 티어 단독 의존은 비권장.**

월 운영비 시나리오 (1 USD=1,400 KRW, 부가세·환율 변동 별도. 공통 고정비: 도메인 ₩2,200/월 + Apple 개발자 연회비 ₩129,000/년=₩10,750/월 + FCM·Let's Encrypt·Uptime Kuma 0원 = 약 ₩13,000/월):

| 항목 | 30명 | 100명 | 300명 |
|---|---|---|---|
| 앱+DB 서버 | Lightsail 서울 2GB $12 = ₩16,800 (화상 동거 시 4GB $24 = ₩33,600) | 4GB $24 = ₩33,600 | 8GB $44 = ₩61,600 (추정 요율) |
| 화상(Jitsi/LiveKit+coturn) | 앱 서버 동거(0원 추가) | 동거 0원 또는 전용 8GB ₩61,600 | 전용 4코어/8GB ₩61,600~67,200 |
| 파일(R2) | 무료 한도 내 0원 | ~50GB ≈ ₩840 | ~200GB ≈ ₩4,000 |
| 백업(B2) | 수백 원 | ~₩420 | ~₩1,700 |
| 푸시/모니터링/TLS | 0원 | 0원 | 0원 |
| 고정비(도메인+Apple) | ₩13,000 | ₩13,000 | ₩13,000 |
| **합계** | **약 ₩30,000~47,000** | **약 ₩48,000(통합)~110,000(분리)** | **약 ₩142,000~190,000** |

핵심 판단: (1) 이 규모의 실시간 부하는 Phoenix 벤치마크(단일 서버 200만 연결) 대비 0.02% 수준이라 성능이 아닌 운영 단순성이 기준 — 자가 WebSocket + 단일 노드로 시작하고 Redis는 서버 2대 확장 시점에 도입. (2) 한국어 검색은 Postgres 기본 FTS로 불가하므로 처음부터 PGroonga 또는 pg_bigm을 스키마에 반영. (3) 파일은 R2(이그레스 0원)로 서버 대역폭·디스크와 분리, 백업은 B2로 벤더 이중화. (4) 화상은 회의방 방식이면 Jitsi, 앱 내장형이면 LiveKit — 어느 쪽이든 기업망 특성상 TURN(coturn) 필수이며 4코어/8GB에서 시작. (5) Oracle Always Free는 2026년 6월 한도 축소(2 OCPU/12GB)와 유휴 회수 정책으로 프로덕션 부적합 — 스테이징·외부 모니터링 노드로만 활용. 전체적으로 SaaS(Slack Pro 1인당 월 $8.75 수준) 대비 300명 기준 월 수백만 원을 아끼는 대신, 서버 운영 인력 공수(주 수 시간)가 실질 비용임을 기획에 반영할 것.
