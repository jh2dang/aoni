import type { SearchResponse } from "../types";

export const mockSearchCharacters = async (
  keyword: string
): Promise<SearchResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        list: [
          {
            characterId: "char1",
            name: keyword,
            race: 0, // 0: Elyos(천족)
            pcId: 1, // 검성
            level: 45,
            serverId: 1001,
            serverName: "시엘",
            profileImageUrl: "",
          },
          {
            characterId: "char2",
            name: `김${keyword}`,
            race: 1, // 1: Asmodian(마족)
            pcId: 2, // 수호성
            level: 45,
            serverId: 1001,
            serverName: "시엘",
            profileImageUrl: "",
          },
        ],
        pagination: { page: 1, size: 30, total: 2, endPage: 1 },
      });
    }, 300);
  });
};

export const getRaceName = (raceId: number) => (raceId === 1 ? "천족" : "마족");
export const getClassName = (pcId: number) => {
  const classes: Record<number, string> = {
    1: "검성",
    2: "수호성",
    3: "궁성",
    4: "살성",
    5: "마도성",
    6: "정령성",
    7: "치유성",
    8: "호법성",
  };
  return classes[pcId] || "기타";
};
