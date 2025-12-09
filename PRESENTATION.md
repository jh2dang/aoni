# 아이온2 캐릭터 정보 조회 시스템

## 📋 프로젝트 개요

아이온2 게임의 캐릭터 정보를 조회할 수 있는 웹 애플리케이션입니다. 공식 API가 제공되지 않는 상황에서, 공식 홈페이지의 네트워크 요청을 분석하여 구현한 프로젝트입니다.

---

## 🎯 프로젝트 목표

- 아이온2 공식 홈페이지의 캐릭터 정보를 조회할 수 있는 웹 인터페이스 제공
- 캐릭터 검색, 상세 정보, 장비, 스킬, 데바니온 시스템 등 종합적인 정보 제공
- 현대적인 UI/UX로 사용자 경험 개선

---

## ⚠️ 문제 상황

### 공식 API 부재

아이온2 게임은 **공식 API를 제공하지 않습니다**. 따라서 일반적인 방법으로는 게임 데이터에 접근할 수 없었습니다.

### 해결 방안

공식 홈페이지의 **캐릭터 정보실** 기능을 분석하여, 실제로 사용되는 API 엔드포인트를 발견하고 활용했습니다.

---

## 🔍 API 분석 과정

### 1. 네트워크 탭 분석

아이온2 공식 홈페이지의 캐릭터 정보실에서 캐릭터를 검색할 때:

1. **개발자 도구 열기** (F12)
2. **Network 탭** 확인
3. **검색 실행** 후 발생하는 네트워크 요청 관찰
4. **요청 URL, 파라미터, 응답 데이터** 분석

### 2. 발견한 API 엔드포인트

#### 캐릭터 검색
```
GET /ko-kr/api/search/aion2/search/v2/character
Query Parameters:
  - keyword: 검색어
  - race: 종족 (1: 아스모데이언, 2: 엘리오스)
  - serverId: 서버 ID
  - page: 페이지 번호
  - size: 페이지 크기
```

#### 캐릭터 정보
```
GET /api/character/info
Query Parameters:
  - lang: 언어 (ko)
  - characterId: 캐릭터 ID
  - serverId: 서버 ID
```

#### 캐릭터 장비
```
GET /api/character/equipment
Query Parameters:
  - lang: 언어 (ko)
  - characterId: 캐릭터 ID
  - serverId: 서버 ID
```

#### 데바니온 상세
```
GET /api/character/daevanion/detail
Query Parameters:
  - lang: 언어 (ko)
  - characterId: 캐릭터 ID
  - serverId: 서버 ID
  - boardId: 보드 ID (직업별로 다름)
```

### 3. 응답 데이터 구조 분석

각 API의 응답 구조를 분석하여 TypeScript 타입을 정의했습니다:

- `CharacterSearchResult`: 검색 결과
- `CharacterInfoResponse`: 캐릭터 기본 정보
- `CharacterEquipmentResponse`: 장비 및 스킬 정보
- `DaevanionDetailResponse`: 데바니온 보드 상세 정보

---

## 🛠️ 기술 스택

### Frontend
- **React 19.2.0**: UI 라이브러리
- **TypeScript 5.9.3**: 타입 안정성
- **Vite 7.2.4**: 빌드 도구 및 개발 서버
- **React Router 7.10.1**: 클라이언트 사이드 라우팅
- **Tailwind CSS 4.1.17**: 유틸리티 기반 CSS 프레임워크
- **Lucide React**: 아이콘 라이브러리

### 배포
- **Netlify**: 정적 사이트 호스팅
- **Netlify Redirects**: API 프록시 설정

---

## ✨ 주요 기능

### 1. 캐릭터 검색
- 실시간 검색 자동완성
- 종족별, 서버별 필터링
- 검색 결과 목록 표시

### 2. 캐릭터 상세 정보
- **기본 정보**: 레벨, 직업, 종족, 서버 등
- **능력치**: 기본 능력치, 신성 능력치
- **랭킹**: 콘텐츠별 랭킹 정보
- **칭호**: 보유 칭호 목록

### 3. 장비 정보
- 장착 장비 목록
- 아르카나 카드
- 스킨 정보
- 스킬 목록
- 펫 & 날개 정보

### 4. 데바니온 시스템
- **6개 보드** 지원 (직업별로 다른 보드 ID)
- **노드 그리드 시각화** (15x15)
- **등급별 필터링** (전설, 유니크, 희귀, 일반)
- **스탯/스킬 효과** 요약
- **직업별 보드 자동 감지**

---

## 🏗️ 프로젝트 구조

```
aoni/
├── src/
│   ├── components/
│   │   └── Layout.tsx          # 레이아웃 컴포넌트
│   ├── pages/
│   │   ├── MainPage.tsx        # 메인 페이지 (검색)
│   │   ├── CharacterDetailPage.tsx  # 캐릭터 상세 페이지
│   │   └── DaevanionDetailPage.tsx  # 데바니온 상세 페이지
│   ├── utils/
│   │   └── api.ts             # API 호출 함수
│   ├── types.ts               # TypeScript 타입 정의
│   └── App.tsx                # 라우팅 설정
├── public/
│   └── _redirects             # Netlify 리다이렉트 설정
├── netlify.toml               # Netlify 배포 설정
└── vite.config.ts             # Vite 설정 (프록시 포함)
```

---

## 🔧 구현 과정

### 1. 개발 환경 설정

#### Vite 프록시 설정
로컬 개발 환경에서 CORS 문제를 해결하기 위해 Vite의 프록시 기능을 활용했습니다.

```typescript
// vite.config.ts
server: {
  proxy: {
    "/api": {
      target: "https://aion2.plaync.com",
      changeOrigin: true,
      secure: true,
    },
    "/ko-kr/api": {
      target: "https://aion2.plaync.com",
      changeOrigin: true,
      secure: true,
    },
  },
}
```

### 2. API 함수 구현

타입 안정성을 위해 TypeScript로 API 함수를 구현했습니다.

```typescript
// utils/api.ts
export async function fetchCharacterSearch(params: {
  keyword: string;
  race?: number;
  serverId?: number;
  page?: number;
  size?: number;
}): Promise<SearchResponse> {
  const url = `${SEARCH_BASE}?keyword=${encodeURIComponent(
    keyword
  )}&race=${race}&serverId=${serverId}&page=${page}&size=${size}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch character search: ${response.statusText}`);
  }
  return response.json();
}
```

### 3. 직업별 데바니온 보드 ID 매핑

각 직업마다 다른 보드 ID 범위를 사용하므로, 직업명을 기반으로 보드 ID를 동적으로 결정했습니다.

```typescript
const CLASS_BOARD_RANGES: Record<string, { start: number; end: number }> = {
  치유성: { start: 71, end: 76 },
  마도성: { start: 61, end: 66 },
  정령성: { start: 51, end: 56 },
  살성: { start: 41, end: 46 },
  궁성: { start: 31, end: 36 },
  수호성: { start: 21, end: 26 },
  검성: { start: 11, end: 16 },
  호법성: { start: 81, end: 86 },
};
```

### 4. 노드 그리드 시각화

15x15 그리드로 데바니온 노드를 시각화했습니다.

- **활성화된 노드**: 밝은 배경 (80% 투명도), 2px 테두리
- **비활성화된 노드**: 어두운 배경 (10% 투명도), 1px 테두리
- **등급별 색상**: 전설(주황), 유니크(하늘색), 희귀(파란색), 일반(회색)
- **중앙 노드**: 보드 이름 표시

---

## 🚀 배포

### Netlify 배포 설정

#### 1. API 프록시 설정

Netlify에서는 Vite 프록시가 작동하지 않으므로, `_redirects` 파일과 `netlify.toml`을 사용하여 API 요청을 프록시했습니다.

```toml
# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://aion2.plaync.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/ko-kr/api/*"
  to = "https://aion2.plaync.com/ko-kr/api/:splat"
  status = 200
  force = true
```

#### 2. SPA 라우팅 설정

React Router를 사용하므로, 모든 요청을 `index.html`로 리다이렉트하도록 설정했습니다.

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🐛 트러블슈팅

### 문제 1: CORS 에러

**증상**: 브라우저에서 직접 API 호출 시 CORS 에러 발생

**해결**: 
- 개발 환경: Vite 프록시 사용
- 프로덕션 환경: Netlify 리다이렉트 사용

### 문제 2: 배포 후 404 에러

**증상**: 로컬에서는 정상 작동하지만 배포 후 API 요청이 404 에러 발생

**원인**: Netlify에서 Vite 프록시 설정이 작동하지 않음

**해결**: `_redirects` 파일과 `netlify.toml`을 통한 리다이렉트 설정

### 문제 3: 직업별 보드 ID 차이

**증상**: 모든 직업에 동일한 보드 ID를 사용하여 오류 발생

**해결**: 캐릭터 정보를 먼저 가져와서 직업을 확인한 후, 해당 직업의 보드 ID 범위를 동적으로 설정

---

## 📊 프로젝트 특징

### 1. 타입 안정성
- TypeScript를 사용하여 API 응답 데이터의 타입을 명확히 정의
- 컴파일 타임에 오류를 발견하여 런타임 에러 방지

### 2. 반응형 디자인
- Tailwind CSS를 활용한 모바일 친화적 레이아웃
- 다크 모드 지원

### 3. 사용자 경험
- 실시간 검색 자동완성
- 로딩 상태 및 에러 처리
- 직관적인 UI/UX

### 4. 성능 최적화
- Vite를 통한 빠른 빌드 및 HMR
- 코드 스플리팅을 통한 최적화된 번들 크기

---

## 🎓 학습 내용

### 1. API 역공학
- 공식 API가 없는 상황에서 네트워크 분석을 통한 API 발견
- 요청/응답 구조 분석 및 타입 정의

### 2. 프록시 설정
- 개발 환경과 프로덕션 환경에서의 프록시 설정 차이
- Netlify 리다이렉트를 통한 API 프록시 구현

### 3. 복잡한 데이터 시각화
- 그리드 기반 노드 시스템 시각화
- 대량의 데이터를 효율적으로 렌더링

### 4. 타입 시스템 활용
- TypeScript를 통한 안전한 API 통신
- 복잡한 중첩 객체의 타입 정의

---

## 🔮 향후 개선 사항

1. **캐싱 시스템**: API 응답 캐싱으로 성능 개선
2. **에러 핸들링 강화**: 더 상세한 에러 메시지 및 복구 방법 제시
3. **추가 기능**: 길드 정보, PvP 전적 등 추가 정보 표시
4. **성능 최적화**: 가상 스크롤링, 이미지 지연 로딩 등

---

## 📝 결론

이 프로젝트는 **공식 API가 없는 상황에서도 네트워크 분석을 통해 데이터를 활용**할 수 있음을 보여주는 사례입니다. 

주요 성과:
- ✅ 공식 API 없이도 게임 데이터 활용
- ✅ 현대적인 웹 기술 스택으로 구현
- ✅ 사용자 친화적인 UI/UX 제공
- ✅ 안정적인 배포 및 운영

이를 통해 **문제 해결 능력**, **기술 역량**, **사용자 중심 사고**를 모두 보여줄 수 있었습니다.

---

## 📚 참고 자료

- [React 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)
- [Vite 공식 문서](https://vite.dev/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [Netlify 문서](https://docs.netlify.com/)

---

**프로젝트 기간**: 2024년  
**기술 스택**: React, TypeScript, Vite, Tailwind CSS  
**배포**: Netlify  
**라이선스**: MIT

