import type { DaevanionNode } from "../types";

// 보드 이름 인덱스 (아리엘, 아스펠 제외)
const OPTIMIZABLE_BOARDS = ["네자칸", "지켈", "바이젤", "트리니엘"];

// 등급별 포인트 비용
const GRADE_POINT_COST: Record<string, number> = {
  Common: 1,
  Rare: 2,
  Unique: 3,
  Legend: 5,
  None: 0,
};

// 노드의 포인트 비용 계산
export function getNodePointCost(node: DaevanionNode): number {
  // 시작 노드는 항상 포인트 0 (이미 활성화되어 있음)
  if (node.type === "Start") return 0;
  if (node.grade === "None" || node.type === "None") return 0;
  return GRADE_POINT_COST[node.grade] || 0;
}

// 노드의 전투력 (포인트 1당 전투력 1)
export function getNodeCombatPower(node: DaevanionNode): number {
  return getNodePointCost(node);
}

// 두 노드가 인접한지 확인 (상하좌우)
export function isAdjacent(
  node1: DaevanionNode,
  node2: DaevanionNode
): boolean {
  const rowDiff = Math.abs(node1.row - node2.row);
  const colDiff = Math.abs(node1.col - node2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// 노드가 활성화 가능한지 확인 (인접한 활성화된 노드가 있는지)
export function canActivateNode(
  node: DaevanionNode,
  activatedNodes: Set<number>
): boolean {
  // 시작 노드는 항상 활성화 가능
  if (node.type === "Start") return true;

  // 이미 활성화된 노드는 다시 활성화할 필요 없음
  if (activatedNodes.has(node.nodeId)) return false;

  // 빈 노드는 활성화할 수 없음
  if (node.grade === "None" || node.type === "None") return false;

  // 인접한 활성화된 노드가 있는지 확인
  // 이 함수는 호출하는 쪽에서 전체 노드 리스트를 제공해야 함
  return true; // 실제 검증은 최적화 함수에서 수행
}

// 보드 이름이 최적화 가능한 보드인지 확인
export function isOptimizableBoard(boardName: string): boolean {
  return OPTIMIZABLE_BOARDS.includes(boardName);
}

// 최적화 결과 타입
export interface OptimizationResult {
  totalPoints: number;
  totalCombatPower: number;
  activatedNodeIds: Set<number>;
  recommendations: {
    add: number[];
    remove: number[];
  };
  currentCombatPower: number;
  optimizedCombatPower: number;
  improvement: number;
}

// 최적 경로 탐색 (그리디 알고리즘)
export function optimizeDaevanion(
  nodes: DaevanionNode[],
  boardName: string,
  currentActivatedNodeIds: Set<number>
): OptimizationResult {
  // 최적화 가능한 보드가 아니면 빈 결과 반환
  if (!isOptimizableBoard(boardName)) {
    return {
      totalPoints: 0,
      totalCombatPower: 0,
      activatedNodeIds: new Set(),
      recommendations: { add: [], remove: [] },
      currentCombatPower: 0,
      optimizedCombatPower: 0,
      improvement: 0,
    };
  }

  // 시작 노드 찾기
  const startNode = nodes.find((node) => node.type === "Start");
  if (!startNode) {
    return {
      totalPoints: 0,
      totalCombatPower: 0,
      activatedNodeIds: new Set(),
      recommendations: { add: [], remove: [] },
      currentCombatPower: 0,
      optimizedCombatPower: 0,
      improvement: 0,
    };
  }

  // 시작 노드는 항상 활성화되어 있고 포인트가 0이므로, 현재 활성화된 노드 목록에 포함되지 않았을 수 있음
  // 시작 노드를 현재 활성화된 노드 목록에 추가 (이미 있으면 중복되지 않음)
  const currentActivatedWithStart = new Set(currentActivatedNodeIds);
  if (!currentActivatedWithStart.has(startNode.nodeId)) {
    currentActivatedWithStart.add(startNode.nodeId);
  }

  // 현재 전투력 계산 (시작 노드 포함)
  const currentCombatPower = Array.from(currentActivatedWithStart).reduce(
    (sum, nodeId) => {
      const node = nodes.find((n) => n.nodeId === nodeId);
      return sum + (node ? getNodeCombatPower(node) : 0);
    },
    0
  );

  // 현재 사용한 포인트 계산 (시작 노드는 포인트 0이므로 포함해도 무방)
  const currentPoints = Array.from(currentActivatedWithStart).reduce(
    (sum, nodeId) => {
      const node = nodes.find((n) => n.nodeId === nodeId);
      return sum + (node ? getNodePointCost(node) : 0);
    },
    0
  );

  // 모든 노드 (인접 노드 검색을 위해)
  const allNodes = [...nodes];

  // 유효한 노드만 필터링 (빈 노드 제외, 시작 노드는 제외하지 않음)
  const validNodes = nodes.filter(
    (node) => {
      // 시작 노드는 항상 포함
      if (node.nodeId === startNode.nodeId) return true;
      // 빈 노드는 제외
      return node.grade !== "None" && node.type !== "None";
    }
  );

  // 최적 경로 탐색: 시작 노드에서 시작하여 최대한 많은 노드 활성화
  const optimizedActivated = new Set<number>([startNode.nodeId]);
  let remainingPoints = currentPoints;

  // 모든 노드를 효율성 순으로 정렬 (시작 노드 제외)
  const sortedNodes = validNodes
    .filter((node) => node.nodeId !== startNode.nodeId && getNodePointCost(node) > 0)
    .sort((a, b) => {
      const aCost = getNodePointCost(a);
      const bCost = getNodePointCost(b);
      
      const aEff = getNodeCombatPower(a) / aCost;
      const bEff = getNodeCombatPower(b) / bCost;
      
      if (Math.abs(aEff - bEff) < 0.001) {
        // 효율성이 같으면 비용이 낮은 것 우선
        return aCost - bCost;
      }
      return bEff - aEff;
    });

  // BFS 기반 그리디 알고리즘: 시작 노드에서 시작하여 효율성이 높은 노드부터 추가
  const queue: DaevanionNode[] = [startNode];
  const processed = new Set<number>([startNode.nodeId]);

  // 여러 라운드를 거쳐 최대한 많은 노드 활성화
  let changed = true;
  let rounds = 0;
  const maxRounds = 200; // 충분한 라운드 수

  while (changed && remainingPoints > 0 && rounds < maxRounds) {
    changed = false;
    rounds++;

    // 큐가 비어있으면 현재 활성화된 노드들로부터 다시 시작
    if (queue.length === 0) {
      const currentActivated = Array.from(optimizedActivated)
        .map((id) => allNodes.find((n) => n.nodeId === id))
        .filter((n): n is DaevanionNode => n !== undefined);
      queue.push(...currentActivated);
    }

    const current = queue.shift();
    if (!current) break;

    // 현재 노드의 인접 노드 중 가장 효율적인 것 찾기
    const adjacentCandidates = sortedNodes.filter(
      (node) =>
        !processed.has(node.nodeId) &&
        !optimizedActivated.has(node.nodeId) &&
        isAdjacent(current, node) &&
        getNodePointCost(node) <= remainingPoints
    );

    // 효율성 순으로 정렬
    adjacentCandidates.sort((a, b) => {
      const aCost = getNodePointCost(a);
      const bCost = getNodePointCost(b);
      const aEff = getNodeCombatPower(a) / aCost;
      const bEff = getNodeCombatPower(b) / bCost;
      
      if (Math.abs(aEff - bEff) < 0.001) {
        return aCost - bCost;
      }
      return bEff - aEff;
    });

    // 가장 효율적인 인접 노드 추가
    if (adjacentCandidates.length > 0) {
      const bestNode = adjacentCandidates[0];
      const cost = getNodePointCost(bestNode);
      
      if (cost > 0 && cost <= remainingPoints) {
        optimizedActivated.add(bestNode.nodeId);
        remainingPoints -= cost;
        processed.add(bestNode.nodeId);
        queue.push(bestNode);
        changed = true;
      }
    }

    // 큐에 다시 추가하여 다른 경로도 탐색
    if (!changed && queue.length === 0) {
      // 모든 활성화된 노드에서 인접 노드 찾기
      const allActivated = Array.from(optimizedActivated)
        .map((id) => allNodes.find((n) => n.nodeId === id))
        .filter((n): n is DaevanionNode => n !== undefined);

      for (const activatedNode of allActivated) {
        const candidates = sortedNodes.filter(
          (node) =>
            !optimizedActivated.has(node.nodeId) &&
            isAdjacent(activatedNode, node) &&
            getNodePointCost(node) <= remainingPoints
        );

        if (candidates.length > 0) {
          candidates.sort((a, b) => {
            const aCost = getNodePointCost(a);
            const bCost = getNodePointCost(b);
            const aEff = getNodeCombatPower(a) / aCost;
            const bEff = getNodeCombatPower(b) / bCost;
            
            if (Math.abs(aEff - bEff) < 0.001) {
              return aCost - bCost;
            }
            return bEff - aEff;
          });

          const bestNode = candidates[0];
          const cost = getNodePointCost(bestNode);
          
          if (cost > 0 && cost <= remainingPoints) {
            optimizedActivated.add(bestNode.nodeId);
            remainingPoints -= cost;
            queue.push(bestNode);
            changed = true;
            break;
          }
        }
      }
    }
  }

  // 최적화된 전투력 계산
  let optimizedCombatPower = Array.from(optimizedActivated).reduce(
    (sum, nodeId) => {
      const node = nodes.find((n) => n.nodeId === nodeId);
      return sum + (node ? getNodeCombatPower(node) : 0);
    },
    0
  );

  // 최적화 결과가 현재보다 낮으면 현재와 같게 설정
  if (optimizedCombatPower < currentCombatPower) {
    optimizedCombatPower = currentCombatPower;
    // 현재 활성화된 노드를 그대로 유지
    optimizedActivated.clear();
    currentActivatedWithStart.forEach((id) => optimizedActivated.add(id));
  }

  // 추가할 노드와 제거할 노드 계산 (시작 노드는 제외)
  const addNodes = Array.from(optimizedActivated).filter(
    (id) => id !== startNode.nodeId && !currentActivatedWithStart.has(id)
  );
  const removeNodes = Array.from(currentActivatedWithStart).filter(
    (id) => id !== startNode.nodeId && !optimizedActivated.has(id)
  );

  // improvement 계산 (최적화 결과가 현재보다 낮으면 0)
  const improvement = optimizedCombatPower >= currentCombatPower 
    ? optimizedCombatPower - currentCombatPower 
    : 0;

  return {
    totalPoints: currentPoints,
    totalCombatPower: optimizedCombatPower,
    activatedNodeIds: optimizedActivated,
    recommendations: {
      add: addNodes,
      remove: removeNodes,
    },
    currentCombatPower,
    optimizedCombatPower,
    improvement,
  };
}

// 여러 보드의 최적화 결과 통합
export function optimizeAllBoards(
  allBoardsData: Map<string, { nodes: DaevanionNode[]; activated: Set<number> }>
): {
  totalCurrentPower: number;
  totalOptimizedPower: number;
  totalImprovement: number;
  boardResults: Map<string, OptimizationResult>;
} {
  let totalCurrentPower = 0;
  let totalOptimizedPower = 0;
  const boardResults = new Map<string, OptimizationResult>();

  for (const [boardName, { nodes, activated }] of allBoardsData.entries()) {
    if (!isOptimizableBoard(boardName)) continue;

    const result = optimizeDaevanion(nodes, boardName, activated);
    boardResults.set(boardName, result);
    totalCurrentPower += result.currentCombatPower;
    totalOptimizedPower += result.optimizedCombatPower;
  }

  // 최적화 결과가 현재보다 낮으면 현재와 같게 설정하고 improvement를 0으로
  if (totalOptimizedPower < totalCurrentPower) {
    totalOptimizedPower = totalCurrentPower;
  }

  const totalImprovement = totalOptimizedPower >= totalCurrentPower
    ? totalOptimizedPower - totalCurrentPower
    : 0;

  return {
    totalCurrentPower,
    totalOptimizedPower,
    totalImprovement,
    boardResults,
  };
}

