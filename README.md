# Zindozang Blog

링크 : https://zindozang.vercel.app

## 1. 개요 (Overview)

링크 : https://zindozang.vercel.app

Zindozang Blog는 기술 블로그 용도로 제작된 프로젝트입니다.

React Quill을 활용한 에디터 기능, 카테고리 및 태그 필터링 기능 등을 갖춘 블로그 플랫폼이며,

CSR(Client-Side Rendering) 방식으로 개발되었고, Vercel을 통해 배포되었습니다.

- 주요 기능: 에디터, 게시글 CRUD, 이미지 업로드, 카테고리/태그 필터링
- 기술 스택: Next.js 15, React, JavaScript, Prisma, MongoDB, Firebase, module.css, CSR

---

## 2. 폴더 구조 (Project Structure)

> `src/app`: 페이지 및 API 라우팅 구조
>
> `src/components`: UI 컴포넌트 모음
>
> `src/utils`: Firebase, Prisma 등 유틸 함수
>
> `prisma`: Prisma 스키마 및 설정
>
> `public`: 정적 파일

---

## 3. 주요 기능 (Features)

- 게시글 작성, 수정, 삭제 (CRUD)
- 이미지 업로드 (Firebase)
- 카테고리 및 태그 관리
- 태그/카테고리 필터링
- 라이트/다크 모드
- 로그인 인증 (NextAuth 사용)

---

## 4. 사용 기술 및 라이브러리

| 기술          | 설명                        |
| ------------- | --------------------------- |
| Next.js 15    | App Router 기반 CSR 구조    |
| React         | 프론트엔드 UI               |
| JavaScript    | 기본 개발 언어              |
| Prisma        | ORM, MongoDB 연동           |
| MongoDB Atlas | 클라우드 NoSQL 데이터베이스 |
| Firebase      | 이미지 업로드 기능          |
| Vercel        | 정적 배포                   |
| module.css    | 모듈 단위 CSS 적용          |

---

## 5. 개발 과정 요약 및 트러블슈팅

### 🔧 Prisma와 MongoDB 연결 이슈

- 문제: `prisma migrate dev` 명령어가 작동하지 않음
- 원인: MongoDB는 관계형 DB가 아니므로 마이그레이션 지원이 제한적
- 해결: `prisma db push` 명령어로 직접 스키마를 반영

### 🖼️ 이미지 업로드 - Firebase Storage

- 문제: CSR 환경에서 Firebase 초기화 타이밍 이슈
- 해결: 클라이언트 사이드 전용 코드로 Firebase 로직 분리

### ✍️ 에디터 기능 - React-Quill

- 문제: React-Quill이 기본 서버 컴포넌트 환경(Next.js 15)에서 동작하지 않음
- 해결: `react-quill-new` 포크 버전으로 교체하여 해결

### 🔧 이미지 사이즈 조절 기능

- 문제: `quill-image-resize-module-react` 사용 시 SSR 이슈 발생
- 해결: 동적 import 방식으로 Quill 인스턴스를 클라이언트에서만 로드

### 🏷️ 태그 설정 이슈

- 문제: 태그 중복 선택 문제 발생
- 원인: API와 컴포넌트 간 태그 구분자 설정 불일치로 추정
- 해결: 추후 개선 예정 (2차 리팩토링 단계에서 처리 계획)

---

## 6. 배포 정보 (Deployment)

- 배포 플랫폼: Vercel
- 자동 배포: GitHub main 브랜치에 push 시 자동 배포
- 환경 변수 설정: `.env`에 Firebase, MongoDB, NextAuth 관련 정보 포함

### ⚠️ 배포 트러블슈팅

- 문제 : Prisma Client 누락 오류 (Vercel)
- 원인 : Vercel은 prisma generate를 자동 실행하지 안흥ㅁ
- 해결 : package.json의 buil스크립트 "build": "prisma generate && next build"로 수정

---

## 7. 회고 및 다음 단계 (Retrospective & Next Steps)

- SSR 및 메타 태그 최적화를 위한 리팩토링 예정
- lihgthouse 모바일 부분에서 점수 개선 필요
- TypeScript 전환 필요성 느낌:
  - 에러 추적 및 리팩토링 시 타입 시스템의 부재가 불편함
- 에디터 커스터마이징을 추가로 개선하고 싶음
- tag컴포넌트에서 중복 선택이 안되는 오류 개선이 필요함
- ***

## 📌 다음 리팩토링 계획 (2차 개발 방향)

- 이미지 로딩 최적화 (lazy loading, CDN 활용)
- 테스트 코드(Jest) 작성
- SSR 전환 및 SEO 개선
- (선택) MDX 지원, 전반적인 스타일 개선
