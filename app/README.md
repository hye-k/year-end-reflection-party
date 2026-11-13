# 2026 다이브 로그

친구들과 함께하는 연말 파티 준비 사이트입니다. 질문에 답하며 올해를 돌아보고(2026 다이브 로그), 새해 목표를 만다라트로 적습니다(2027 시즌 훈련표). 답변은 Google Apps Script를 거쳐 Google 시트에 저장됩니다.

Vite + React + TypeScript로 만든 정적 사이트이며 서버가 없습니다.

## 실행

```sh
cd app
npm install
cp .env.example .env.local   # VITE_APPS_SCRIPT_URL에 Apps Script 웹 앱 주소를 넣습니다
npm run dev
npm test        # 단위 테스트
```

`VITE_APPS_SCRIPT_URL`이 없으면 서버 없이 동작합니다. 답변은 이 기기에만 저장됩니다.

## 서버

`apps-script/Code.gs`를 Google 시트에 연결한 Apps Script에 붙여 넣고 웹 앱으로 배포합니다. `NAMES`에 참여자 이름을 적습니다.

## 배포

`.env.local`의 `VITE_SITE_URL`에 사이트 주소를 넣고 `npm run deploy`를 실행하면 `gh-pages` 브랜치에 빌드 결과가 올라갑니다.

## 에셋

- 스프라이트: [Szym의 SpearFishing Assets Pack](https://nszym.itch.io/spearfishing-assets-pack). 라이선스상 재배포가 금지되어 있어 원본은 이 저장소에 없습니다(`app/src/assets/sprites/`는 `.gitignore`). 스프라이트 없이는 빌드되지 않으며, 배포된 사이트에서만 사용됩니다.
- 글꼴: [Galmuri](https://galmuri.quiple.dev/), [Pretendard](https://github.com/orioncactus/pretendard)
- 팔레트: [Apollo](https://lospec.com/palette-list/apollo)
