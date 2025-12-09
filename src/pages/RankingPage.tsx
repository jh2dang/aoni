import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, TrendingUp, TrendingDown, Minus, Users, Sword, Shield, Target } from "lucide-react";
import { fetchRankingList, fetchServerList } from "../utils/api";
import type { RankingListItem, ServerInfo } from "../types";

export default function RankingPage() {
  const navigate = useNavigate();
  const [rankingData, setRankingData] = useState<any>(null);
  const [serverList, setServerList] = useState<ServerInfo[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<number>(1001);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServerList = async () => {
      try {
        const response = await fetchServerList();
        setServerList(response.serverList);
      } catch (err) {
        console.error("Failed to load server list:", err);
      }
    };
    loadServerList();
  }, []);

  useEffect(() => {
    const loadRanking = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchRankingList({
          rankingContentsType: 1,
          rankingType: 0,
          serverId: selectedServerId,
        });
        setRankingData(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "랭킹 정보를 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRanking();
  }, [selectedServerId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRankChangeIcon = (rankChange: number) => {
    if (rankChange > 0) {
      return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    } else if (rankChange < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-amber-400 to-amber-600 text-white";
    if (rank === 2) return "bg-gradient-to-br from-slate-300 to-slate-500 text-white";
    if (rank === 3) return "bg-gradient-to-br from-orange-400 to-orange-600 text-white";
    return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
  };

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

  if (!rankingData) return null;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400/10 to-orange-400/10 border border-amber-400/20">
          <Trophy className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            랭킹
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {rankingData.season && (
              <>
                시즌 {rankingData.season.seasonNo} |{" "}
                {formatDate(rankingData.season.startDate)} ~{" "}
                {formatDate(rankingData.season.endDate)}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Server Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          서버 선택
        </label>
        <select
          value={selectedServerId}
          onChange={(e) => setSelectedServerId(Number(e.target.value))}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          {serverList.map((server) => (
            <option key={server.serverId} value={server.serverId}>
              {server.serverName}
            </option>
          ))}
        </select>
      </div>

      {/* Ranking List */}
      <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-orange-400/5 dark:from-amber-900/20 dark:to-orange-900/20"></div>
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    순위
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    캐릭터
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    직업
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    길드
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    포인트
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    등급
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    전투 기록
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    변동
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rankingData.rankingList.map((item: RankingListItem) => (
                  <tr
                    key={item.rank}
                    onClick={() => {
                      navigate(`/character/${item.characterId}`, {
                        state: {
                          serverId: selectedServerId,
                        },
                      });
                    }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getRankBadgeColor(
                            item.rank
                          )}`}
                        >
                          {item.rank}
                        </div>
                        {item.rank <= 3 && (
                          <Trophy
                            className={`w-5 h-5 ${
                              item.rank === 1
                                ? "text-amber-500"
                                : item.rank === 2
                                ? "text-slate-400"
                                : "text-orange-500"
                            }`}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.profileImage}
                          alt={item.characterName}
                          className="w-12 h-12 rounded-lg border-2 border-slate-200 dark:border-slate-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/48";
                          }}
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.characterName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {item.className}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {item.guildName || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.point.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.gradeIcon && (
                          <img
                            src={item.gradeIcon}
                            alt={item.gradeName}
                            className="w-6 h-6"
                          />
                        )}
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {item.gradeName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <Sword className="w-4 h-4" />
                          <span>{item.extraDataMap?.killCount?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Shield className="w-4 h-4" />
                          <span>{item.extraDataMap?.assistCount?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Target className="w-4 h-4" />
                          <span>{item.extraDataMap?.deathCount?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankChangeIcon(item.rankChange)}
                        {item.rankChange !== 0 && (
                          <span
                            className={`text-sm font-medium ${
                              item.rankChange > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {Math.abs(item.rankChange)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

