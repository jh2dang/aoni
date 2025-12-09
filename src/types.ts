export interface CharacterSearchResult {
  characterId: string;
  name: string;
  race: number;
  pcId: number;
  level: number;
  serverId: number;
  serverName: string;
  profileImageUrl: string;
}

export interface SearchResponse {
  list: CharacterSearchResult[];
  pagination: {
    page: number;
    size: number;
    total: number;
    endPage: number;
  };
}

export interface Character {
  id: string;
  name: string;
  level: number;
  class: string;
  race: string;
  server: string;
  legion: string;
  itemLevel: number;
  lastUpdate: string;
  stats: {
    victory: number;
    victoryMax: number;
    skill: number;
    skillMax: number;
    equipment: number;
    stigma: number;
  };
  rankings: {
    overall: number;
    race: number;
    class: number;
    server: number;
    combined: number;
  };
}

// API Response Types
export interface StatItem {
  type: string;
  name: string;
  value: number;
  statSecondList: string[] | null;
}

export interface RankingItem {
  rankingContentsType: number;
  rankingContentsName: string;
  rankingType: number | null;
  rank: number | null;
  characterId: string | null;
  characterName: string | null;
  classId: number | null;
  className: string | null;
  guildName: string | null;
  point: number | null;
  prevRank: number | null;
  rankChange: number | null;
  gradeId: number | null;
  gradeName: string | null;
  gradeIcon: string | null;
  profileImage: string | null;
  extraDataMap: any | null;
}

export interface TitleItem {
  id: number;
  equipCategory: string;
  name: string;
  grade: string;
  totalCount: number;
  ownedCount: number;
  statList: Array<{ desc: string }>;
  equipStatList: Array<{ desc: string }>;
}

export interface DaevanionBoard {
  id: number;
  name: string;
  totalNodeCount: number;
  openNodeCount: number;
  icon: string;
  open: number;
}

export interface CharacterProfile {
  characterId: string;
  characterName: string;
  serverId: number;
  serverName: string;
  regionName: string;
  pcId: number;
  className: string;
  raceId: number;
  raceName: string;
  gender: number;
  genderName: string;
  characterLevel: number;
  titleId: number;
  titleName: string;
  titleGrade: string;
  profileImage: string;
}

export interface CharacterInfoResponse {
  stat: {
    statList: StatItem[];
  };
  ranking: {
    rankingList: RankingItem[];
  };
  profile: CharacterProfile;
  title: {
    totalCount: number;
    ownedCount: number;
    titleList: TitleItem[];
  };
  daevanion: {
    boardList: DaevanionBoard[];
  };
}

export interface EquipmentItem {
  id: number;
  name: string;
  enchantLevel: number;
  exceedLevel: number;
  grade: string;
  slotPos: number;
  slotPosName: string;
  icon: string;
}

export interface SkillItem {
  id: number;
  name: string;
  needLevel: number;
  skillLevel: number;
  icon: string;
  category: string;
  acquired: number;
  equip: number;
}

export interface PetWing {
  pet: {
    id: number;
    name: string;
    level: number;
    icon: string;
  } | null;
  wing: {
    id: number;
    name: string;
    enchantLevel: number;
    grade: string;
    icon: string;
  } | null;
}

export interface CharacterEquipmentResponse {
  equipment: {
    equipmentList: EquipmentItem[];
    skinList: EquipmentItem[];
  };
  skill: {
    skillList: SkillItem[];
  };
  petwing: PetWing;
}

export interface DaevanionNode {
  boardId: number;
  nodeId: number;
  name: string;
  row: number;
  col: number;
  grade: "Common" | "Rare" | "Unique" | "Legend" | "None";
  type: "Stat" | "SkillLevel" | "Start" | "None";
  icon: string;
  effectList: Array<{ desc: string }>;
  open: number;
}

export interface DaevanionDetailResponse {
  nodeList: DaevanionNode[];
  openStatEffectList: Array<{ desc: string }>;
  openSkillEffectList: Array<{ desc: string }>;
}