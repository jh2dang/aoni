import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  User,
  Shield,
  Star,
  Award,
  Activity,
  Users,
  Flame,
  Trophy,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Zap,
} from "lucide-react";
import type { CharacterSearchResult } from "../types";
import { fetchCharacterInfo, fetchCharacterEquipment } from "../utils/api";

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [infoData, setInfoData] = useState<any>(null);
  const [equipmentData, setEquipmentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Extract serverId from passed state or default to 1001
        const passedState = location.state?.character as
          | CharacterSearchResult
          | undefined;
        const serverId = passedState?.serverId || 1001;

        const [info, equipment] = await Promise.all([
          fetchCharacterInfo(id, serverId),
          fetchCharacterEquipment(id, serverId),
        ]);

        setInfoData(info);
        setEquipmentData(equipment);
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
  }, [id, location.state]);

  const getQualityGradient = (grade: string) => {
    switch (grade?.toLowerCase()) {
      case "legend":
      case "legendary":
        return "bg-gradient-to-br from-amber-400 to-orange-600";
      case "unique":
      case "epic":
        return "bg-gradient-to-br from-sky-400 to-cyan-500";
      case "rare":
        return "bg-gradient-to-br from-blue-400 to-cyan-600";
      case "special":
        return "bg-gradient-to-br from-emerald-400 to-teal-600";
      default:
        return "bg-gradient-to-br from-slate-400 to-slate-600";
    }
  };

  const getSlotName = (slotPosName: string) => {
    const slotMap: Record<string, string> = {
      MainHand: "무기",
      SubHand: "보조무기",
      Helmet: "투구",
      Shoulder: "견갑",
      Torso: "상의",
      Pants: "하의",
      Gloves: "장갑",
      Boots: "신발",
      Cape: "망토",
      Belt: "허리띠",
      Necklace: "목걸이",
      Earring1: "귀걸이1",
      Earring2: "귀걸이2",
      Ring1: "반지1",
      Ring2: "반지2",
      Bracelet1: "팔찌1",
      Bracelet2: "팔찌2",
      Rune1: "룬1",
      Rune2: "룬2",
      Amulet: "아뮬렛",
      Arcana1: "아르카나1",
      Arcana2: "아르카나2",
      Arcana3: "아르카나3",
      Arcana4: "아르카나4",
      Arcana5: "아르카나5",
    };
    return slotMap[slotPosName] || slotPosName;
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

  if (!infoData || !equipmentData) return null;

  const profile = infoData.profile;
  const stats = infoData.stat.statList;
  const rankings = infoData.ranking.rankingList;
  const titles = infoData.title;
  const daevanion = infoData.daevanion.boardList;
  const equipment = equipmentData.equipment.equipmentList;
  const skins = equipmentData.skin?.skinList || [];
  const skills = equipmentData.skill?.skillList || [];
  const arcanas = equipment.filter((item: any) =>
    item.slotPosName.startsWith("Arcana")
  );
  const mainEquip = equipment.filter(
    (item: any) => !item.slotPosName.startsWith("Arcana")
  );
  const petwing = equipmentData.petwing;

  // Find item level from stats
  const itemLevelStat = stats.find((s: any) => s.type === "ItemLevel");
  const itemLevel = itemLevelStat?.value || 0;

  // Basic stats (STR, DEX, INT, CON, AGI, WIS)
  const basicStats = stats.filter((s: any) =>
    ["STR", "DEX", "INT", "CON", "AGI", "WIS"].includes(s.type)
  );

  // Divine stats (Justice, Freedom, etc.)
  const divineStats = stats.filter(
    (s: any) =>
      !["STR", "DEX", "INT", "CON", "AGI", "WIS", "ItemLevel"].includes(s.type)
  );

  return (
    <div className="animate-fadeIn">
      {/* Hero Card */}
      <div className="relative rounded-3xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 overflow-hidden mb-8 shadow-xl dark:shadow-none transition-colors">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 to-cyan-400/5 dark:from-sky-900/20 dark:to-cyan-900/20"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-400/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative p-8 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-[2rem] opacity-50 blur group-hover:opacity-75 transition-opacity"></div>
            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-slate-100 dark:bg-[#0F1422] rounded-[1.8rem] flex items-center justify-center overflow-hidden">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.characterName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-slate-400 dark:text-slate-600" />
              )}
            </div>
            <div className="absolute -bottom-3 -right-3 px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-xl">
              Lv.{profile.characterLevel}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {profile.characterName}
              </h1>
              <span className="px-3 py-1 bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20 rounded-lg text-sm font-medium">
                {profile.className}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium">
                {profile.serverName}
              </span>
              {profile.titleName && (
                <span className="px-3 py-1 bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20 rounded-lg text-sm font-medium">
                  {profile.titleName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>{profile.raceName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{profile.genderName}</span>
              </div>
              {petwing.pet && (
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>{petwing.pet.name}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "아이템 레벨",
                  value: itemLevel,
                  color: "text-sky-600 dark:text-sky-400",
                },
                {
                  label: "전승",
                  value: `${titles.ownedCount}/${titles.totalCount}`,
                  color: "text-slate-900 dark:text-white",
                },
                {
                  label: "데바니온",
                  value: `${
                    daevanion.filter((d: any) => d.open === 1).length
                  }개`,
                  color: "text-slate-900 dark:text-white",
                },
                {
                  label: "스킬",
                  value: `${
                    equipmentData.skill.skillList.filter(
                      (s: any) => s.acquired === 1
                    ).length
                  }개`,
                  color: "text-emerald-500 dark:text-emerald-400",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50"
                >
                  <div className="text-xs text-slate-500 mb-1">
                    {stat.label}
                  </div>
                  <div className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button className="px-6 py-3 bg-sky-600 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-sky-700 dark:hover:bg-sky-50 transition-colors shadow-lg shadow-sky-500/20 dark:shadow-white/5">
              전적 갱신
            </button>
            <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
              즐겨찾기
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Rankings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Rankings */}
          <div className="rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                콘텐츠 랭킹
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {rankings
                .filter((r: any) => r.rank !== null)
                .map((ranking: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {ranking.rankingContentsName}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {ranking.rank}위
                      </span>
                      {ranking.rankChange && ranking.rankChange !== 0 && (
                        <span
                          className={`flex items-center gap-1 text-xs font-medium ${
                            ranking.rankChange > 0
                              ? "text-red-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {ranking.rankChange > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(ranking.rankChange)}
                        </span>
                      )}
                    </div>
                    {ranking.gradeName && (
                      <div className="flex items-center gap-2 mt-2">
                        {ranking.gradeIcon && (
                          <img
                            src={ranking.gradeIcon}
                            alt={ranking.gradeName}
                            className="w-5 h-5"
                          />
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {ranking.gradeName}
                        </span>
                      </div>
                    )}
                    {ranking.point && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {ranking.point.toLocaleString()}점
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Basic Stats */}
          <div className="rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                기본 능력치
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
              {basicStats.map((stat: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      {stat.name}
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {stat.value}
                    </span>
                  </div>
                  {stat.statSecondList && stat.statSecondList.length > 0 && (
                    <div className="space-y-1">
                      {stat.statSecondList.map((desc: string, idx: number) => (
                        <div
                          key={idx}
                          className="text-xs text-sky-600 dark:text-sky-400"
                        >
                          {desc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Divine Stats */}
          <div className="rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-cyan-500" />
                신성 능력치
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {divineStats.map((stat: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {stat.name}
                    </span>
                    <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                      {stat.value}
                    </span>
                  </div>
                  {stat.statSecondList && stat.statSecondList.length > 0 && (
                    <div className="space-y-1">
                      {stat.statSecondList.map((desc: string, idx: number) => (
                        <div
                          key={idx}
                          className="text-xs text-cyan-600 dark:text-cyan-400"
                        >
                          {desc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Titles */}
          {titles.titleList && titles.titleList.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-8 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  장착 칭호
                </h3>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {titles.ownedCount}/{titles.totalCount}
                </span>
              </div>
              <div className="space-y-3">
                {titles.titleList.map((title: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {title.name}
                      </span>
                      <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded border border-amber-200 dark:border-amber-500/20">
                        {title.grade}
                      </span>
                    </div>
                    {title.equipStatList && title.equipStatList.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {title.equipStatList.map((stat: any, idx: number) => (
                          <div
                            key={idx}
                            className="text-xs text-amber-600 dark:text-amber-400"
                          >
                            {stat.desc}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 p-8 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  스킬
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((skill: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-[#0F1422] flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                      {skill.icon ? (
                        <img
                          src={skill.icon}
                          alt={skill.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Flame className="w-5 h-5 text-sky-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {skill.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                          Lv.{skill.skillLevel}
                        </span>
                        {skill.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {skill.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>필요 레벨 {skill.needLevel}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full border ${
                            skill.acquired
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {skill.acquired ? "습득" : "미습득"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border ${
                            skill.equip
                              ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {skill.equip ? "슬롯 장착" : "미장착"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Equipment & Daevanion */}
        <div className="space-y-6">
          {/* Equipment */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                장착 장비
              </h3>
            </div>
            <div className="space-y-2">
              {mainEquip.map((item: any, i: number) => (
                <div
                  key={i}
                  className="group p-3 rounded-xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center gap-4 cursor-pointer shadow-sm dark:shadow-none"
                >
                  <div
                    className={`w-12 h-12 rounded-lg ${getQualityGradient(
                      item.grade
                    )} p-0.5 shadow-lg flex items-center justify-center`}
                  >
                    {item.icon ? (
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <Flame
                        className={`w-5 h-5 ${
                          item.grade?.toLowerCase() === "legend"
                            ? "text-amber-500"
                            : "text-sky-500"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">
                        {getSlotName(item.slotPosName)}
                      </span>
                      {item.enchantLevel > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded border border-amber-200 dark:border-amber-500/20 font-bold">
                          +{item.enchantLevel}
                          {item.exceedLevel > 0 && ` 초월${item.exceedLevel}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arcana */}
          {arcanas.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  아르카나 카드
                </h3>
              </div>
              <div className="space-y-2">
                {arcanas.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 flex items-center gap-4"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg ${getQualityGradient(
                        item.grade
                      )} p-0.5 shadow-lg flex items-center justify-center`}
                    >
                      {item.icon ? (
                        <img
                          src={item.icon}
                          alt={item.name}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Flame className="w-5 h-5 text-sky-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">
                          {getSlotName(item.slotPosName)}
                        </span>
                        {item.enchantLevel > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded border border-amber-200 dark:border-amber-500/20 font-bold">
                            +{item.enchantLevel}
                            {item.exceedLevel > 0 && ` 초월${item.exceedLevel}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skins */}
          {skins.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  스킨
                </h3>
              </div>
              <div className="space-y-2">
                {skins.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 flex items-center gap-4"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg ${getQualityGradient(
                        item.grade
                      )} p-0.5 shadow-lg flex items-center justify-center`}
                    >
                      {item.icon ? (
                        <img
                          src={item.icon}
                          alt={item.name}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Flame className="w-5 h-5 text-sky-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">
                          {getSlotName(item.slotPosName)}
                        </span>
                        {item.enchantLevel > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded border border-amber-200 dark:border-amber-500/20 font-bold">
                            +{item.enchantLevel}
                            {item.exceedLevel > 0 && ` 초월${item.exceedLevel}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daevanion */}
          {daevanion.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  데바니온
                </h3>
                <button
                  onClick={() => {
                    navigate(`/character/${id}/daevanion/optimization`, {
                      state: {
                        character: location.state?.character,
                        serverId: profile.serverId,
                      },
                    });
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  데바니온 최적화하기
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {daevanion.map((board: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => {
                      navigate(`/character/${id}/daevanion`, {
                        state: {
                          character: location.state?.character,
                          serverId: profile.serverId,
                        },
                      });
                    }}
                    className="p-4 rounded-xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {board.icon && (
                        <img
                          src={board.icon}
                          alt={board.name}
                          className="w-8 h-8"
                        />
                      )}
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">
                        {board.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {board.openNodeCount}/{board.totalNodeCount} 노드
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pet & Wing */}
          {(petwing.pet || petwing.wing) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  펫 & 날개
                </h3>
              </div>
              <div className="space-y-3">
                {petwing.pet && (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      {petwing.pet.icon && (
                        <img
                          src={petwing.pet.icon}
                          alt={petwing.pet.name}
                          className="w-10 h-10"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {petwing.pet.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Lv.{petwing.pet.level}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {petwing.wing && (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      {petwing.wing.icon && (
                        <img
                          src={petwing.wing.icon}
                          alt={petwing.wing.name}
                          className="w-10 h-10"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {petwing.wing.name}
                        </div>
                        {petwing.wing.enchantLevel > 0 && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            +{petwing.wing.enchantLevel}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
