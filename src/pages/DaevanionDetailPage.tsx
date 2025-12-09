import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Zap } from "lucide-react";
import { fetchDaevanionDetail, fetchCharacterInfo } from "../utils/api";
import type { DaevanionDetailResponse, DaevanionNode } from "../types";

// 직업별 보드 ID 범위
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

// 보드 이름 (모든 직업 공통)
const BOARD_NAME_LIST = ["네자칸", "지켈", "바이젤", "트리니엘", "아리엘", "아스펠"];

// 보드 ID에 따른 이름 매핑 함수
const getBoardName = (boardId: number): string => {
  // 각 직업별 보드 ID 범위에서 인덱스 계산
  const ranges = [
    { start: 11, end: 16 }, // 검성
    { start: 21, end: 26 }, // 수호성
    { start: 31, end: 36 }, // 궁성
    { start: 41, end: 46 }, // 살성
    { start: 51, end: 56 }, // 정령성
    { start: 61, end: 66 }, // 마도성
    { start: 71, end: 76 }, // 치유성
    { start: 81, end: 86 }, // 호법성
  ];

  for (const range of ranges) {
    if (boardId >= range.start && boardId <= range.end) {
      const index = boardId - range.start;
      return BOARD_NAME_LIST[index] || `보드${index + 1}`;
    }
  }

  return `보드${boardId}`;
};

// 직업명에서 보드 ID 범위를 가져오는 함수
const getBoardIdsForClass = (className: string): number[] => {
  // 직업명에서 "성"으로 끝나는 부분을 찾아서 매핑
  const classKey = Object.keys(CLASS_BOARD_RANGES).find((key) =>
    className.includes(key)
  );
  
  if (classKey && CLASS_BOARD_RANGES[classKey]) {
    const { start, end } = CLASS_BOARD_RANGES[classKey];
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  
  // 기본값: 치유성 (71~76)
  return [71, 72, 73, 74, 75, 76];
};

// 활성화된 노드용 색상 (더 밝게)
const GRADE_COLORS_OPEN: Record<string, string> = {
  Legend: "bg-amber-500/80",
  Unique: "bg-sky-500/80",
  Rare: "bg-blue-500/80",
  Common: "bg-slate-500/80",
  None: "bg-transparent",
};

// 비활성화된 노드용 색상 (더 어둡게)
const GRADE_COLORS_CLOSED: Record<string, string> = {
  Legend: "bg-amber-500/10",
  Unique: "bg-sky-500/10",
  Rare: "bg-blue-500/10",
  Common: "bg-slate-500/10",
  None: "bg-transparent",
};

const GRADE_BORDER_COLORS: Record<string, string> = {
  Legend: "border-amber-500 border-solid",
  Unique: "border-sky-500 border-solid",
  Rare: "border-blue-500 border-solid",
  Common: "border-slate-500 border-solid",
  None: "border-transparent",
};

export default function DaevanionDetailPage() {
  const { characterId } = useParams<{ characterId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [boardIds, setBoardIds] = useState<number[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);
  const [data, setData] = useState<DaevanionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    legend: true,
    unique: true,
    rare: true,
    common: true,
  });

  const serverId =
    (location.state?.character?.serverId as number) ||
    (location.state?.serverId as number) ||
    1001;

  // 캐릭터 정보를 가져와서 직업에 맞는 보드 ID 범위 설정
  useEffect(() => {
    if (!characterId) return;

    const loadCharacterInfo = async () => {
      setIsLoadingBoards(true);
      try {
        const characterInfo = await fetchCharacterInfo(characterId, serverId);
        const className = characterInfo.profile.className;
        console.log("Character class:", className); // 디버깅용
        const ids = getBoardIdsForClass(className);
        console.log("Board IDs for class:", ids); // 디버깅용
        
        if (ids.length > 0) {
          setBoardIds(ids);
          setSelectedBoardId(ids[0]); // 첫 번째 보드를 기본 선택
        } else {
          console.error("No board IDs found for class:", className);
        }
      } catch (err) {
        console.error("Failed to load character info:", err);
        setError("캐릭터 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingBoards(false);
      }
    };

    loadCharacterInfo();
  }, [characterId, serverId]);


  useEffect(() => {
    if (!characterId || selectedBoardId === null) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchDaevanionDetail(
          characterId,
          serverId,
          selectedBoardId
        );
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "데이터를 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [characterId, serverId, selectedBoardId]);

  const handleBack = () => {
    navigate(-1);
  };

  const toggleFilter = (grade: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [grade]: !prev[grade] }));
  };

  const shouldShowNode = (node: DaevanionNode) => {
    if (node.grade === "None" || node.type === "None") return true;
    if (node.grade === "Legend") return filters.legend;
    if (node.grade === "Unique") return filters.unique;
    if (node.grade === "Rare") return filters.rare;
    if (node.grade === "Common") return filters.common;
    return true;
  };

  // Create a 15x15 grid
  const grid: (DaevanionNode | null)[][] = Array(15)
    .fill(null)
    .map(() => Array(15).fill(null));

  // Find center node (Start type or center position with no effects)
  let centerNode: DaevanionNode | null = null;
  if (data) {
    // First try to find Start type node
    centerNode = data.nodeList.find((node) => node.type === "Start") || null;
    
    // If no Start node, find node at center position (row 8, col 8 in 1-based)
    if (!centerNode) {
      centerNode = data.nodeList.find((node) => node.row === 8 && node.col === 8) || null;
    }
    
    // If still not found, find node at center with no effects (empty effectList)
    if (!centerNode) {
      centerNode = data.nodeList.find(
        (node) => 
          (node.row === 8 && node.col === 8) || 
          (node.effectList.length === 0 && (node.row === 7 || node.row === 8 || node.row === 9) && (node.col === 7 || node.col === 8 || node.col === 9))
      ) || null;
    }

    data.nodeList.forEach((node) => {
      const row = node.row - 1; // Convert to 0-based index
      const col = node.col - 1; // Convert to 0-based index
      if (row >= 0 && row < 15 && col >= 0 && col < 15) {
        grid[row][col] = node;
      }
    });
  }

  const openNodeCount = data?.nodeList.filter((n) => n.open === 1).length || 0;

  if (isLoadingBoards || (isLoading && selectedBoardId === null)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 rounded-xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm dark:shadow-none"
        >
          <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          데바니온
        </h1>
        <div className="ml-auto px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 text-sm text-slate-600 dark:text-slate-400">
          활성화 노드: <span className="font-bold text-slate-900 dark:text-white">{openNodeCount}개</span>
        </div>
      </div>

      {/* Board Tabs */}
      <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
        {boardIds.map((boardId) => (
          <button
            key={boardId}
            onClick={() => setSelectedBoardId(boardId)}
            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedBoardId === boardId
                ? "bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30 scale-105"
                : "bg-white dark:bg-[#151A29] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm dark:shadow-none"
            }`}
          >
            {getBoardName(boardId)}
          </button>
        ))}
      </div>

      {/* Stat and Skill Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Stat Effects */}
        <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 to-cyan-400/5 dark:from-sky-900/20 dark:to-cyan-900/20"></div>
          <div className="relative">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              스탯 효과
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.openStatEffectList.map((effect, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/50"
                >
                  {effect.desc}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skill Effects */}
        <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-sky-400/5 dark:from-cyan-900/20 dark:to-sky-900/20"></div>
          <div className="relative">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              스킬 효과
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.openSkillEffectList.map((effect, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/50"
                >
                  {effect.desc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Node Grid */}
      <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 to-cyan-400/5 dark:from-sky-900/20 dark:to-cyan-900/20"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              노드 상세
            </h3>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => {
                  navigate(`/character/${characterId}/daevanion/optimization`, {
                    state: {
                      character: location.state?.character,
                      serverId: serverId,
                    },
                  });
                }}
                className="px-4 py-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                데바니온 최적화하기
              </button>
              <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.legend}
                  onChange={() => toggleFilter("legend")}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  전설
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.unique}
                  onChange={() => toggleFilter("unique")}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  유니크
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.rare}
                  onChange={() => toggleFilter("rare")}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  희귀
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.common}
                  onChange={() => toggleFilter("common")}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-500 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  일반
                </span>
              </label>
            </div>
          </div>

          {/* Grid Container - Centered */}
          <div className="overflow-auto max-h-[900px] border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-slate-50 dark:bg-slate-900/30">
            <div className="flex justify-center">
              <div className="inline-block">
                <div className="grid grid-cols-15 gap-1">
                  {grid.map((row, rowIdx) =>
                    row.map((node, colIdx) => {
                      if (!node) {
                        return (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className="w-14 h-14 bg-transparent"
                          />
                        );
                      }

                      const showNode = shouldShowNode(node);
                      const isOpen = node.open === 1;
                      const isStart = node.type === "Start";
                      const isEmpty = node.grade === "None" || node.type === "None";
                      const isCenterNode = centerNode && node.nodeId === centerNode.nodeId;

                      if (!showNode && !isEmpty) {
                        return (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className="w-14 h-14 bg-transparent"
                          />
                        );
                      }

                      // Extract stat value from effect description
                      // For center node, always show board name
                      const statText = isCenterNode
                        ? getBoardName(selectedBoardId!)
                        : node.effectList.length > 0 
                        ? node.effectList[0].desc 
                        : node.name || "";

                      return (
                        <div
                          key={`${rowIdx}-${colIdx}`}
                          className={`w-14 h-14 rounded-xl p-1 flex flex-col items-center justify-center relative transition-all group cursor-pointer hover:scale-110 hover:z-10 ${
                            isCenterNode
                              ? "bg-slate-600/70 border-2 border-slate-400 border-solid shadow-lg"
                              : isEmpty
                              ? "bg-transparent border-transparent"
                              : isStart
                              ? "bg-orange-500/80 border-2 border-orange-500 border-solid shadow-lg"
                              : isOpen
                              ? `${GRADE_COLORS_OPEN[node.grade] || GRADE_COLORS_OPEN.Common} border-2 ${GRADE_BORDER_COLORS[node.grade] || GRADE_BORDER_COLORS.Common} shadow-md`
                              : `${GRADE_COLORS_CLOSED[node.grade] || GRADE_COLORS_CLOSED.Common} border ${GRADE_BORDER_COLORS[node.grade] || GRADE_BORDER_COLORS.Common} border-opacity-30`
                          }`}
                          title={
                            node.name
                              ? `${node.name}${node.effectList.length > 0 ? ` - ${node.effectList.map((e) => e.desc).join(", ")}` : ""}`
                              : ""
                          }
                        >
                          {/* Stat text in center */}
                          {/* Always show board name for center node */}
                          {isCenterNode ? (
                            <div className="text-[9px] font-bold text-center leading-tight px-0.5 text-white drop-shadow-[0_0_3px_rgba(0,0,0,1)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                              {getBoardName(selectedBoardId!)}
                            </div>
                          ) : (
                            statText && !isEmpty && (
                              <div className={`text-[9px] font-bold text-center leading-tight px-0.5 ${
                                isStart || isOpen
                                  ? "text-white drop-shadow-[0_0_2px_rgba(0,0,0,1)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                                  : "text-white/40 drop-shadow-[0_0_2px_rgba(0,0,0,1)]"
                              }`}>
                                {statText.length > 10 ? statText.substring(0, 9) + "..." : statText}
                              </div>
                            )
                          )}
                          {/* Tooltip on hover */}
                          {node.name && !isEmpty && (
                            <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-20 shadow-xl border border-slate-700 min-w-[200px]">
                              <div className="font-semibold mb-1.5 text-sky-400">{node.name}</div>
                              {node.effectList.map((effect, i) => (
                                <div key={i} className="text-slate-300 text-xs">
                                  {effect.desc}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

