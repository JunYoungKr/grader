import { loadEnvConfig } from "@next/env";
import { refreshPromoCandidates } from "../src/lib/coupang-promo-refresh";

loadEnvConfig(process.cwd());

refreshPromoCandidates()
  .then((count) => console.log(`상품 후보 ${count}개를 저장했습니다.`))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "상품 후보 수집 실패");
    process.exitCode = 1;
  });
