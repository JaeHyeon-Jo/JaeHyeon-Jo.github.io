---
title: "Obsidian GPS 위치 삽입 플러그인 — 프롬프트로 1시간 만에 내 입맛대로 개조하기"
date: 2026-07-28
tags:
  - 개발
  - 프로젝트회고
  - obsidian
  - typescript
  - plugin
  - prompt
  - vibecoding
---

<div class="popover-hint">
  <p><strong>💡 블로그 읽기 안내</strong></p>
  <p>이 글은 복잡한 이론 설명 대신 <strong>"실제 AI와 주고받은 실전 프롬프트"</strong>와 <strong>"바로 복사해서 쓸 수 있는 요약 프롬프트 템플릿"</strong> 중심으로 작성되었습니다. 창을 띄워놓고 직접 따라 해보세요!</p>
</div>

---

## 📌 1장 요약 (개요 & 배경)

- **목표**: 임장, 맛집 방문, 야외 메모 시 **옵시디언 노트에 '현재 시간 + GPS 위도/경도 좌표'를 1초 만에 삽입**하는 나만의 플러그인 만들기.
- **핵심 기술 스택**: TypeScript, Obsidian Plugin API, macOS Apple Shortcuts (`shortcuts run "GetGPS"`), Web Geolocation API
- **결과물**: 리본 버튼 원클릭으로 `14:20 [현재 위치](geo:lat,lon) #위치` 텍스트를 삽입하며, 유명 지도 플러그인 **[Obsidian Map View]**와 완벽히 연동됨.
- **💻 깃허브 저장소:** [JaeHyeon-Jo/Obsi_InsertLoc](https://github.com/JaeHyeon-Jo/Obsi_InsertLoc)

---

## 💬 2. 실전 기록: AI와 주고받은 실제 프롬프트 & 개발 과정

이 플러그인을 만들면서 실제로 AI에게 던졌던 핵심 질문과 단계별 해결 과정을 공개합니다.

### STEP 1. 기본 기능 초안 뽑아내기 (프롬프트 #1)

> 🗣️ **실제 던진 프롬프트**
> *"옵시디언(Obsidian) 플러그인을 만들고 싶어. 에디터에서 리본 버튼을 클릭하면 현재 시간(HH:mm)과 GPS 좌표가 `HH:mm [현재 위치](geo:lat,lon) #위치` 형식으로 커서 위치에 들어가는 TypeScript 코드를 작성해 줘. Map View 플러그인 문법과 완벽히 호환돼야 해."*

- **AI의 답변 포인트**: 
  - `Plugin` 클래스 상속 및 `this.addRibbonIcon`, `this.addCommand`를 통한 명령어 등록
  - `editor.replaceSelection()`을 활용한 커서 위치 마크다운 텍스트 자동 삽입 로직 구성

---

### STEP 2. macOS 데스크톱과 모바일 플랫폼 한계 돌파 (프롬프트 #2)

> 🗣️ **실제 던진 프롬프트**
> *"문제가 있어. 모바일(iOS/Android)에서는 `navigator.geolocation.getCurrentPosition`으로 좌표를 잘 가져오는데, macOS 데스크톱(Electron)에서는 위치 권한 때문에 안 돼. macOS에서는 Apple 단축어(Shortcuts) 앱의 CLI(`shortcuts run "GetGPS"`)를 실행해서 위경도를 파싱하고, 모바일에서는 Geolocation API를 쓰도록 하이브리드로 만들어 줘."*

- **AI의 답변 포인트**: 
  - `Platform.isDesktopApp`과 `Platform.isMobileApp`을 이용한 크로스 플랫폼 분기
  - 데스크톱에서는 `child_process.exec`로 macOS 터미널 단축어 명령어를 비동기 호출하여 stdout 파싱

---

### STEP 3. 모바일 빌드 크래시 방어 (트러블슈팅 프롬프트 #3)

> 🗣️ **실제 던진 프롬프트**
> *"상단에서 `import { exec } from 'child_process'`를 썼더니 모바일 앱에서 Node.js 내장 모듈을 지원하지 않는다고 플러그인이 크래시가 나. 이 문제를 어떻게 해결해야 해?"*

- **AI의 답변 포인트 (핵심 해결!)**: 
  - 정적 `import` 대신, `Platform.isDesktopApp` 분기 내부에서만 **동적 로딩(`require('child_process')`)**을 호출하도록 수정하여 단일 번들로 데스크톱/모바일 완벽 호환 달성!

```typescript
// 핵심 해결 코드 요약
async function getCoordinates() {
  if (Platform.isDesktopApp) {
    // 모바일 앱 빌드에서 에러가 나지 않도록 분기 내부에서 동적 require 호출!
    const cp = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(cp.exec);
    const { stdout } = await execAsync('shortcuts run "GetGPS"');
    // ...좌표 파싱 로직...
  } else if (Platform.isMobileApp) {
    // ...navigator.geolocation 호출 로직...
  }
}
```

---

## 📋 3. 직접 해보기 (복붙용 핵심 프롬프트 템플릿)

여러분도 옵시디언 플러그인을 만들거나, 크로스 플랫폼 기능이 필요할 때 **아래 프롬프트를 복사해서 빈칸(`[ ]`)만 채워 AI에게 질문해 보세요!**

### 💡 템플릿 ①: 옵시디언 텍스트 삽입 플러그인 만들기
```markdown
너는 옵시디언(Obsidian) 플러그인 개발 전문가야.
에디터에서 [기능 명시: 예 - 리본 아이콘 클릭 시] 동작하는 플러그인의 `main.ts` 코드를 짜줘.

요구사항:
1. 삽입될 텍스트 형식: [예: `HH:mm [현재 위치](geo:lat,lon) #위치`]
2. 옵시디언 API의 `addRibbonIcon`과 `addCommand`를 둘 다 등록해 줘.
3. 현재 활성화된 마크다운 편집기(`MarkdownView`)의 커서 위치에 `replaceSelection`으로 텍스트를 삽입해 줘.
```

### 💡 템플릿 ②: Node.js 내장 모듈 모바일 크래시 방어하기
```markdown
Obsidian 플러그인에서 Node.js 모듈(`[모듈명: 예 - child_process]`)을 쓰니까 모바일 앱에서 크래시가 발생해.
`Platform.isDesktopApp` 분기 내부에서만 `require('[모듈명]')`으로 동적 로딩하여
데스크톱과 모바일을 모두 지원하는 하이브리드 구조로 리팩토링해 줘.
```

---

## 🏁 4. 마치며

기성 앱의 스펙에 나를 맞추지 않고, **"프롬프트 몇 줄"**로 내 기록 습관에 완벽히 들어맞는 기능을 직접 만들어 심는 것. 이것이 바로 AI와 옵시디언을 함께 사용하는 최고의 묘미입니다.

---

## 🔗 함께 읽으면 좋은 글
- [[lite-capture-개발기|lite-capture — 내 입맛대로 만든 10MB 캡처 도구 개발 회고]]
- [[D-Plus-Day-기록-트래커-개발기|D+Day — 이발 주기 헷갈려서 만든 D+ 트래커 개발 회고]]
- [[index|🍱 Guri Blog 홈으로 돌아가기]]
