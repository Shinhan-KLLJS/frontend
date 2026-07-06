# Jira × GitHub 워크플로우

DDOOH 프론트엔드(1인) 개발의 Jira(`DV`) ↔ GitHub(`Shinhan-KLLJS/frontend`) 연동 규칙. <br>
통합 브랜치는 `dev` (운영 전까지 메인).

---

## 핵심 요약

- **브랜치** - 스토리마다 `feature/DV-<번호>-<설명>` 1개. 하위 서브태스크는 그 안에서 작업.
- **커밋** - 앞에 서브태스크 키: `DV-<번호> <type>: <내용>`
- **PR** - base `dev`, 제목 `[DV-<번호>]`, 본문은 템플릿대로 (`Closes DV-<번호>`)
- **리뷰** - CodeRabbit AI가 PR 리뷰 → 본인 확인 → **Squash merge** → 브랜치 삭제
- **잊지 말 것** - ① 브랜치·PR엔 스토리 키, 커밋엔 서브태스크 키 ② 모든 이슈에 `Team`(FE/BE/AI) 지정 ③ Jira에서 브랜치 생성 시 레포는 `frontend`

---

## 왜 스토리 단위 브랜치인가

1인 작업이고 서브태스크들이 밀접하게 얽혀 있어(같은 `tokens.css`/`tailwind.config` 공유), 스토리 브랜치 하나로 묶고 PR도 하나로 낸다. 서브태스크 추적은 **커밋 키**로 한다 - `DV-55 feat: ...`, `DV-57 feat: ...` → 각 커밋이 해당 서브태스크의 Development 패널에 링크된다.

> 서브태스크가 독립적으로 배포·리뷰돼야 하면 그때만 `feature/DV-yy-...`로 쪼갠다.

---

## 작업 흐름

```bash
# 1. 스토리 브랜치 생성 (dev 기준)
git checkout dev && git pull origin dev
git checkout -b feature/DV-54-design-system

# 2. 서브태스크별로 커밋 (커밋 앞에 그 작업의 키)
git commit -m "DV-55 feat: ..."
git commit -m "DV-57 feat: ..."

# 3. push → PR
git push -u origin feature/DV-54-design-system
gh pr create --base dev --title "[DV-54] 디자인 시스템 기반 구축" --body "Closes DV-54"
```

→ **CodeRabbit AI 리뷰** → 반영 → **Squash & merge** → 브랜치 삭제

> Jira "브랜치 만들기" 버튼을 써도 된다. 단, 자동으로 채워지는 한글 이름을 `feature/DV-xx-...`로 고치고 Repository를 `frontend`로 선택할 것.

---

## Jira 상태 흐름

```
할일 → 기획 → 디자인 → 개발 중 → QA → 배포 → 완료
```

지금은 보드에서 **수동 드래그**. (브랜치=개발 중, PR=QA, merge=배포 식 자동 전환은 나중에 규칙으로 추가 가능.)

---

## 멀티 레포 & 커밋 규칙

- 이 Jira(`DV`)는 프론트 / 백 / AI **3개 레포 공통**. `DV-xx` 키는 전체에서 유일 → 파트 구분은 이슈의 **`Team` 필드**로.
- 커밋 타입: `feat` · `fix` · `style` · `refactor` · `docs` · `chore` · `test`
