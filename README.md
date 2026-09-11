# Study Dashboard — Gwen × Street v1.1

GitHub Pages에서 실행되는 개인용 학습 관리 웹앱입니다.

## 구조

- `index.html` — 화면 구조
- `style.css` — 디자인
- `app.js` — 기능 및 localStorage 데이터
- `assets/albums/` — 앨범 커버

## v1.1 추가 기능

- 오늘 TO-DO를 전부 완료하면 하루 1회 +10 Coins
- 100 Coins로 20개 앨범 중 1개를 동일 확률로 랜덤 획득
- 앨범 첫 획득은 Lv.1
- 같은 앨범을 다시 획득하면 Lv.+1
- Coins / 보상 지급 기록 / 앨범 레벨은 localStorage에 저장
- 아직 커버를 받지 못한 앨범은 `COVER COMING SOON`으로 표시

## GitHub Pages

저장소에 파일을 업로드한 뒤 GitHub Pages의 배포 소스를 `main` 브랜치의 root(`/`)로 설정하면 됩니다.
