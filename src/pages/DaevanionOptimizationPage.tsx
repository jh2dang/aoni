import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { fetchDaevanionDetail, fetchCharacterInfo } from "../utils/api";
import type { DaevanionDetailResponse, DaevanionNode } from "../types";
import {
  optimizeAllBoards,
  isOptimizableBoard,
  getNodePointCost,
  getNodeCombatPower,
} from "../utils/daevanionOptimizer";

// 보드 이름 (모든 직업 공통)
const BOARD_NAME_LIST = ["네자칸", "지켈", "바이젤", "트리니엘", "아리엘", "아스펠"];

// 보드 ID에 따른 이름 매핑 함수
const getBoardName = (boardId: number): string => {
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

const getBoardIdsForClass = (className: string): number[] => {
  const classKey = Object.keys(CLASS_BOARD_RANGES).find((key) =>
    className.includes(key)
  );

  if (classKey && CLASS_BOARD_RANGES[classKey]) {
    const { start, end } = CLASS_BOARD_RANGES[classKey];
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  return [71, 72, 73, 74, 75, 76];
};

export default function DaevanionOptimizationPage() {
  const { characterId } = useParams<{ characterId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [boardIds, setBoardIds] = useState<number[]>([]);
  const [allBoardsData, setAllBoardsData] = useState<
    Map<number, DaevanionDetailResponse>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serverId =
    (location.state?.character?.serverId as number) ||
    (location.state?.serverId as number) ||
    1001;

  // 캐릭터 정보 로드 및 보드 ID 설정
  useEffect(() => {
    if (!characterId) return;

    const loadCharacterInfo = async () => {
      setIsLoading(true);
      try {
        const characterInfo = await fetchCharacterInfo(characterId, serverId);
        const className = characterInfo.profile.className;
        const ids = getBoardIdsForClass(className);
        
        if (ids.length > 0) {
          setBoardIds(ids);
        } else {
          // 기본값 사용 (치유성)
          console.warn("Could not determine class, using default board IDs");
          setBoardIds([71, 72, 73, 74, 75, 76]);
        }
      } catch (err) {
        console.error("Failed to load character info:", err);
        setError("캐릭터 정보를 불러오는데 실패했습니다.");
        // 기본값 사용 (치유성)
        setBoardIds([71, 72, 73, 74, 75, 76]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacterInfo();
  }, [characterId, serverId]);

  // 모든 보드 데이터 로드
  useEffect(() => {
    if (!characterId || boardIds.length === 0) {
      setIsLoading(false);
      return;
    }

    const loadAllBoards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const boardDataMap = new Map<number, DaevanionDetailResponse>();
        const loadPromises = boardIds.map(async (boardId) => {
          try {
            const response = await fetchDaevanionDetail(
              characterId,
              serverId,
              boardId
            );
            boardDataMap.set(boardId, response);
          } catch (err) {
            console.error(`Failed to load board ${boardId}:`, err);
          }
        });
        
        await Promise.all(loadPromises);
        setAllBoardsData(boardDataMap);
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

    loadAllBoards();
  }, [characterId, serverId, boardIds]);

  // 최적화 결과 계산
  const optimizationResult = useMemo(() => {
    if (allBoardsData.size === 0) return null;

    const boardsMap = new Map<
      string,
      { nodes: DaevanionNode[]; activated: Set<number> }
    >();

    for (const [boardId, boardData] of allBoardsData.entries()) {
      const boardName = getBoardName(boardId);
      if (!isOptimizableBoard(boardName)) continue;

      const activatedNodes = new Set<number>();
      const startNode = boardData.nodeList.find((node) => node.type === "Start");
      
      boardData.nodeList.forEach((node) => {
        if (node.open === 1) {
          activatedNodes.add(node.nodeId);
        }
      });
      
      // 시작 노드는 항상 활성화되어 있고 포인트가 0이므로, open 값과 관계없이 포함
      if (startNode) {
        activatedNodes.add(startNode.nodeId);
      }

      boardsMap.set(boardName, {
        nodes: boardData.nodeList,
        activated: activatedNodes,
      });
    }

    if (boardsMap.size === 0) return null;

    return optimizeAllBoards(boardsMap);
  }, [allBoardsData]);

  if (isLoading) {
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

  if (!optimizationResult) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <div className="text-slate-600 dark:text-slate-400">
            최적화 가능한 보드 데이터를 불러올 수 없습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm dark:shadow-none"
        >
          <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
        </button>
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            데바니온 최적화 분석
          </h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 to-cyan-400/5 dark:from-sky-900/20 dark:to-cyan-900/20"></div>
          <div className="relative">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              현재 전투력
            </div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white">
              {optimizationResult.totalCurrentPower}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              네자칸, 지켈, 바이젤, 트리니엘 합계
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 dark:from-emerald-900/20 dark:to-teal-900/20"></div>
          <div className="relative">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              최적화 후 전투력
            </div>
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              {optimizationResult.totalOptimizedPower}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              동일 포인트로 최대 전투력
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-orange-400/5 dark:from-amber-900/20 dark:to-orange-900/20"></div>
          <div className="relative">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              전투력 향상
            </div>
            <div
              className={`text-4xl font-bold flex items-center gap-2 ${
                optimizationResult.totalImprovement > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : optimizationResult.totalImprovement < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {optimizationResult.totalImprovement > 0 ? (
                <TrendingUp className="w-8 h-8" />
              ) : optimizationResult.totalImprovement < 0 ? (
                <TrendingDown className="w-8 h-8" />
              ) : null}
              {optimizationResult.totalImprovement > 0 ? "+" : ""}
              {optimizationResult.totalImprovement}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {optimizationResult.totalImprovement > 0
                ? "개선 가능"
                : optimizationResult.totalImprovement < 0
                ? "현재 구성이 더 효율적"
                : "이미 최적"}
            </div>
          </div>
        </div>
      </div>

      {/* Board Details */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          보드별 상세 분석
        </h2>

        {Array.from(optimizationResult.boardResults.entries()).map(
          ([boardName, result]) => {
            const boardId = Array.from(allBoardsData.keys()).find(
              (id) => getBoardName(id) === boardName
            );
            const boardData = boardId
              ? allBoardsData.get(boardId)
              : undefined;

            if (!boardData) return null;

            return (
              <div
                key={boardName}
                className="relative rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-none overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 to-cyan-400/5 dark:from-sky-900/20 dark:to-cyan-900/20"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {boardName}
                    </h3>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">
                          현재:{" "}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {result.currentCombatPower} 전투력
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">
                          최적:{" "}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {result.optimizedCombatPower} 전투력
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">
                          향상:{" "}
                        </span>
                        <span
                          className={`font-bold ${
                            result.improvement > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : result.improvement < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {result.improvement > 0 ? "+" : ""}
                          {result.improvement}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 추가 권장 노드 */}
                    {result.recommendations.add.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                          추가 권장 노드 ({result.recommendations.add.length}개)
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {result.recommendations.add.map((nodeId) => {
                            const node = boardData.nodeList.find(
                              (n) => n.nodeId === nodeId
                            );
                            if (!node) return null;
                            return (
                              <div
                                key={nodeId}
                                className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-emerald-900 dark:text-emerald-300">
                                    {node.name || `노드 ${nodeId}`}
                                  </div>
                                  <div className="text-xs text-emerald-700 dark:text-emerald-400">
                                    {getNodePointCost(node)}P → +
                                    {getNodeCombatPower(node)} 전투력
                                  </div>
                                </div>
                                {node.effectList.length > 0 && (
                                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                    {node.effectList[0].desc}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 제거 권장 노드 */}
                    {result.recommendations.remove.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                          제거 권장 노드 ({result.recommendations.remove.length}개)
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {result.recommendations.remove.map((nodeId) => {
                            const node = boardData.nodeList.find(
                              (n) => n.nodeId === nodeId
                            );
                            if (!node) return null;
                            return (
                              <div
                                key={nodeId}
                                className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-red-900 dark:text-red-300">
                                    {node.name || `노드 ${nodeId}`}
                                  </div>
                                  <div className="text-xs text-red-700 dark:text-red-400">
                                    {getNodePointCost(node)}P → -
                                    {getNodeCombatPower(node)} 전투력
                                  </div>
                                </div>
                                {node.effectList.length > 0 && (
                                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    {node.effectList[0].desc}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {result.recommendations.add.length === 0 &&
                      result.recommendations.remove.length === 0 && (
                        <div className="col-span-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-center">
                          <div className="text-slate-600 dark:text-slate-400">
                            이미 최적의 구성입니다! 🎉
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

