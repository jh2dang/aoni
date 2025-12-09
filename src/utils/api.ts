import type {
  CharacterInfoResponse,
  CharacterEquipmentResponse,
  SearchResponse,
  DaevanionDetailResponse,
  RankingResponse,
  ServerListResponse,
  ClassListResponse,
} from "../types";

// 개발 환경에서는 프록시를 통해 요청하므로 상대 경로 사용
const API_BASE = "/api";
const SEARCH_BASE = "/ko-kr/api/search/aion2/search/v2/character";

export async function fetchCharacterInfo(
  characterId: string,
  serverId: number = 1001
): Promise<CharacterInfoResponse> {
  const url = `${API_BASE}/character/info?lang=ko&characterId=${encodeURIComponent(
    characterId
  )}&serverId=${serverId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch character info: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchCharacterSearch(params: {
  keyword: string;
  race?: number;
  serverId?: number;
  page?: number;
  size?: number;
}): Promise<SearchResponse> {
  const { keyword, race = 1, serverId = 1001, page = 1, size = 30 } = params;
  const url = `${SEARCH_BASE}?keyword=${encodeURIComponent(
    keyword
  )}&race=${race}&serverId=${serverId}&page=${page}&size=${size}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch character search: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchCharacterEquipment(
  characterId: string,
  serverId: number = 1001
): Promise<CharacterEquipmentResponse> {
  const url = `${API_BASE}/character/equipment?lang=ko&characterId=${encodeURIComponent(
    characterId
  )}&serverId=${serverId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch character equipment: ${response.statusText}`
    );
  }
  return response.json();
}

export async function fetchDaevanionDetail(
  characterId: string,
  serverId: number = 1001,
  boardId: number
): Promise<DaevanionDetailResponse> {
  const url = `${API_BASE}/character/daevanion/detail?lang=ko&characterId=${encodeURIComponent(
    characterId
  )}&serverId=${serverId}&boardId=${boardId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch daevanion detail: ${response.statusText}`
    );
  }
  return response.json();
}

export async function fetchRankingList(params: {
  rankingContentsType?: number;
  rankingType?: number;
  serverId?: number;
  characterId?: string;
}): Promise<RankingResponse> {
  const {
    rankingContentsType = 1,
    rankingType = 0,
    serverId = 1001,
    characterId = "",
  } = params;
  const url = `${API_BASE}/ranking/list?lang=ko&rankingContentsType=${rankingContentsType}&rankingType=${rankingType}&serverId=${serverId}${characterId ? `&characterId=${encodeURIComponent(characterId)}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ranking list: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchServerList(): Promise<ServerListResponse> {
  const url = `${API_BASE}/gameinfo/servers?lang=ko`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch server list: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchClassList(): Promise<ClassListResponse> {
  const url = `${API_BASE}/gameinfo/classes?lang=ko`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch class list: ${response.statusText}`);
  }
  return response.json();
}
