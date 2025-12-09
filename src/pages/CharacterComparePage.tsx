import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getMyCharacter } from "../utils/localStorage";
import type { CharacterInfoResponse, CharacterEquipmentResponse } from "../types";

interface CharacterData {
  characterId: string;
  serverId: number;
  infoData: CharacterInfoResponse;
  equipmentData: CharacterEquipmentResponse;
}

export default function CharacterComparePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [myCharacter, setMyCharacter] = useState<CharacterData | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<CharacterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const saved = getMyCharacter();
        if (!saved) {
          setError("저장된 내 캐릭터 정보가 없습니다.");
          setIsLoading(false);
          return;
        }

        const myChar: CharacterData = {
          characterId: saved.characterId,
          serverId: saved.serverId,
          infoData: saved.infoData,
          equipmentData: saved.equipmentData,
        };

        const currentChar = location.state?.currentCharacter as CharacterData | undefined;
        
        if (!currentChar) {
          setError("비교할 캐릭터 정보가 없습니다.");
          setIsLoading(false);
          return;
        }

        setMyCharacter(myChar);
        setCurrentCharacter(currentChar);
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
      Rune3: "룬3",
    };
    return slotMap[slotPosName] || slotPosName;
  };

  // 내 캐릭터 기준으로 비교 (my - current)
  // my > current면 내가 높음 (양수, 초록색)
  // my < current면 내가 낮음 (음수, 빨간색)
  const compareValues = (my: number, current: number) => {
    const diff = my - current; // 내 캐릭터 기준으로 계산
    const absDiff = Math.abs(diff);
    const baseValue = Math.max(Math.abs(my), Math.abs(current), 1); // 0으로 나누기 방지
    const percentage = (absDiff / baseValue) * 100;
    const isSignificant = percentage > 10 || absDiff > 100; // 10% 이상 차이나거나 절대값 100 이상
    
    if (diff > 0) {
      // 내가 더 높음
      return { 
        value: diff, 
        absValue: absDiff,
        percentage,
        isSignificant,
        icon: TrendingUp, 
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
        borderColor: "border-emerald-200 dark:border-emerald-500/20",
        label: "높음"
      };
    } else if (diff < 0) {
      // 내가 더 낮음
      return { 
        value: diff, 
        absValue: absDiff,
        percentage,
        isSignificant,
        icon: TrendingDown, 
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-500/10",
        borderColor: "border-red-200 dark:border-red-500/20",
        label: "낮음"
      };
    }
    return { 
      value: 0, 
      absValue: 0,
      percentage: 0,
      isSignificant: false,
      icon: Minus, 
      color: "text-slate-400",
      bgColor: "",
      borderColor: "",
      label: "동일"
    };
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

  if (error || !myCharacter || !currentCharacter) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || "데이터를 불러올 수 없습니다."}</div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const myProfile = myCharacter.infoData.profile;
  const currentProfile = currentCharacter.infoData.profile;
  
  const myStats = myCharacter.infoData.stat.statList;
  const currentStats = currentCharacter.infoData.stat.statList;
  
  const myEquipment = myCharacter.equipmentData.equipment.equipmentList;
  const currentEquipment = currentCharacter.equipmentData.equipment.equipmentList;
  
  const mySkills = myCharacter.equipmentData.skill.skillList;
  const currentSkills = currentCharacter.equipmentData.skill.skillList;

  // Calculate item level
  const calculateItemLevel = (equipment: any[]) => {
    return equipment.reduce((sum, item) => {
      const baseLevel = item.enchantLevel || 0;
      const exceedLevel = item.exceedLevel || 0;
      return sum + baseLevel + exceedLevel;
    }, 0);
  };

  const myItemLevel = calculateItemLevel(myEquipment);
  const currentItemLevel = calculateItemLevel(currentEquipment);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm dark:shadow-none"
        >
          <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          캐릭터 비교
        </h1>
      </div>

      {/* Character Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Character (Left) */}
        <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border-2 border-emerald-200 dark:border-emerald-800/50 p-6 shadow-sm dark:shadow-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 dark:from-emerald-900/20 dark:to-teal-900/20"></div>
          <div className="relative">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wide">
              비교 대상
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={currentProfile.profileImage}
                alt={currentProfile.characterName}
                className="w-16 h-16 rounded-xl border-2 border-slate-200 dark:border-slate-700"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {currentProfile.characterName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20 rounded text-xs">
                    {currentProfile.className}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-xs">
                    {currentProfile.serverName}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">레벨</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentProfile.characterLevel}
                </div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">아이템 레벨</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentItemLevel}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Character (Right) */}
        <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border-2 border-blue-200 dark:border-blue-800/50 p-6 shadow-sm dark:shadow-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-cyan-400/5 dark:from-blue-900/20 dark:to-cyan-900/20"></div>
          <div className="relative">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
              내 캐릭터
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={myProfile.profileImage}
                alt={myProfile.characterName}
                className="w-16 h-16 rounded-xl border-2 border-slate-200 dark:border-slate-700"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {myProfile.characterName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20 rounded text-xs">
                    {myProfile.className}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-xs">
                    {myProfile.serverName}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">레벨</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {myProfile.characterLevel}
                  </div>
                  {(() => {
                    const diff = compareValues(myProfile.characterLevel, currentProfile.characterLevel);
                    if (diff.value !== 0) {
                      const DiffIcon = diff.icon;
                      return (
                        <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${diff.bgColor} ${diff.borderColor} border`}>
                          <DiffIcon className={`w-3 h-3 ${diff.color}`} />
                          <span className={diff.color}>{diff.value > 0 ? "+" : ""}{diff.value}</span>
                          <span className={`text-[10px] ${diff.color}`}>({diff.label})</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">아이템 레벨</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {myItemLevel}
                  </div>
                  {(() => {
                    const diff = compareValues(myItemLevel, currentItemLevel);
                    if (diff.value !== 0) {
                      const DiffIcon = diff.icon;
                      return (
                        <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${diff.bgColor} ${diff.borderColor} border`}>
                          <DiffIcon className={`w-3 h-3 ${diff.color}`} />
                          <span className={diff.color}>{diff.value > 0 ? "+" : ""}{diff.value}</span>
                          <span className={`text-[10px] ${diff.color}`}>({diff.label})</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Comparison */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          스탯 비교
        </h3>
        <div className="space-y-4">
          {myStats.map((myStat, index) => {
            const currentStat = currentStats.find((s) => s.type === myStat.type);
            if (!currentStat) return null;

            const myValue = myStat.value || 0;
            const currentValue = currentStat.value || 0;
            const diff = compareValues(myValue, currentValue);
            const DiffIcon = diff.icon;

            return (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Left: Current Character Card */}
                <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border-2 border-emerald-200 dark:border-emerald-800/50 p-4 shadow-sm dark:shadow-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 dark:from-emerald-900/20 dark:to-teal-900/20"></div>
                  <div className="relative">
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2 uppercase">
                      비교 대상
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {myStat.name}
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {currentValue.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Right: My Character Card with Diff */}
                <div className={`relative rounded-2xl border-2 p-4 shadow-sm dark:shadow-none overflow-hidden ${
                  diff.isSignificant
                    ? `${diff.bgColor} ${diff.borderColor}`
                    : "bg-white dark:bg-[#151A29] border-blue-200 dark:border-blue-800/50"
                }`}>
                  <div className={`absolute inset-0 ${
                    diff.isSignificant
                      ? ""
                      : "bg-gradient-to-r from-blue-400/5 to-cyan-400/5 dark:from-blue-900/20 dark:to-cyan-900/20"
                  }`}></div>
                  <div className="relative">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase">
                      내 캐릭터
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {myStat.name}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {myValue.toLocaleString()}
                      </div>
                      {diff.value !== 0 && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${diff.bgColor} ${diff.borderColor} border`}>
                          <DiffIcon className={`w-4 h-4 ${diff.color}`} />
                          <span className={`text-sm font-medium ${diff.color}`}>
                            {diff.value > 0 ? "+" : ""}{diff.value.toLocaleString()}
                          </span>
                          <span className={`text-xs ${diff.color} ml-1`}>
                            ({diff.label})
                          </span>
                          {diff.isSignificant && (
                            <span className={`text-xs ${diff.color} ml-1`}>
                              {diff.percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Comparison */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          장비 비교
        </h3>
        <div className="space-y-4">
          {[
            "MainHand",
            "SubHand",
            "Helmet",
            "Shoulder",
            "Torso",
            "Pants",
            "Gloves",
            "Boots",
            "Cape",
            "Belt",
            "Necklace",
            "Earring1",
            "Earring2",
            "Ring1",
            "Ring2",
            "Bracelet1",
            "Bracelet2",
          ].map((slotPos) => {
            const myItem = myEquipment.find((e: any) => e.slotPosName === slotPos);
            const currentItem = currentEquipment.find((e: any) => e.slotPosName === slotPos);

            const myEnchant = (myItem?.enchantLevel || 0) + (myItem?.exceedLevel || 0);
            const currentEnchant = (currentItem?.enchantLevel || 0) + (currentItem?.exceedLevel || 0);
            const enchantDiff = compareValues(myEnchant, currentEnchant);
            const hasEnchantDiff = enchantDiff.value !== 0 && enchantDiff.isSignificant;

            return (
              <div
                key={slotPos}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Left: Current Character Card */}
                <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border-2 border-emerald-200 dark:border-emerald-800/50 p-4 shadow-sm dark:shadow-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 dark:from-emerald-900/20 dark:to-teal-900/20"></div>
                  <div className="relative">
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2 uppercase">
                      비교 대상
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      {getSlotName(slotPos)}
                    </div>
                    {currentItem ? (
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg ${getQualityGradient(
                            currentItem.grade
                          )} flex items-center justify-center overflow-hidden`}
                        >
                          <img
                            src={currentItem.icon}
                            alt={currentItem.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {currentItem.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            +{currentItem.enchantLevel || 0}
                            {currentItem.exceedLevel > 0 && ` (+${currentItem.exceedLevel})`}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400">-</div>
                    )}
                  </div>
                </div>

                {/* Right: My Character Card with Diff */}
                <div className={`relative rounded-2xl border-2 p-4 shadow-sm dark:shadow-none overflow-hidden ${
                  hasEnchantDiff
                    ? `${enchantDiff.bgColor} ${enchantDiff.borderColor}`
                    : "bg-white dark:bg-[#151A29] border-blue-200 dark:border-blue-800/50"
                }`}>
                  <div className={`absolute inset-0 ${
                    hasEnchantDiff
                      ? ""
                      : "bg-gradient-to-r from-blue-400/5 to-cyan-400/5 dark:from-blue-900/20 dark:to-cyan-900/20"
                  }`}></div>
                  <div className="relative">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase">
                      내 캐릭터
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      {getSlotName(slotPos)}
                    </div>
                    {myItem ? (
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg ${getQualityGradient(
                            myItem.grade
                          )} flex items-center justify-center overflow-hidden`}
                        >
                          <img
                            src={myItem.icon}
                            alt={myItem.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {myItem.name}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              +{myItem.enchantLevel || 0}
                              {myItem.exceedLevel > 0 && ` (+${myItem.exceedLevel})`}
                            </div>
                            {enchantDiff.value !== 0 && (() => {
                              const DiffIcon = enchantDiff.icon;
                              return (
                                <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${enchantDiff.bgColor} ${enchantDiff.borderColor} border`}>
                                  <DiffIcon className={`w-3 h-3 ${enchantDiff.color}`} />
                                  <span className={enchantDiff.color}>
                                    {enchantDiff.value > 0 ? "+" : ""}{enchantDiff.value}
                                  </span>
                                  <span className={`text-[10px] ${enchantDiff.color}`}>
                                    ({enchantDiff.label})
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400">-</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills Comparison */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          스킬 비교
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Current Character Skills Card */}
          <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border-2 border-emerald-200 dark:border-emerald-800/50 p-6 shadow-sm dark:shadow-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 dark:from-emerald-900/20 dark:to-teal-900/20"></div>
            <div className="relative">
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-4 uppercase">
                비교 대상 스킬 ({currentSkills.filter((s: any) => s.acquired === 1).length}개)
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentSkills
                  .filter((s: any) => s.acquired === 1)
                  .map((skill: any) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50"
                    >
                      <img
                        src={skill.icon}
                        alt={skill.name}
                        className="w-10 h-10 rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white text-sm truncate">
                          {skill.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Lv.{skill.skillLevel} | {skill.category}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right: My Character Skills Card */}
          <div className="relative rounded-2xl bg-white dark:bg-[#151A29] border-2 border-blue-200 dark:border-blue-800/50 p-6 shadow-sm dark:shadow-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-cyan-400/5 dark:from-blue-900/20 dark:to-cyan-900/20"></div>
            <div className="relative">
              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4 uppercase">
                내 캐릭터 스킬 ({mySkills.filter((s: any) => s.acquired === 1).length}개)
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mySkills
                  .filter((s: any) => s.acquired === 1)
                  .map((skill: any) => {
                    const currentSkill = currentSkills.find((s: any) => s.id === skill.id);
                    const hasSkill = currentSkill && currentSkill.acquired === 1;
                    const levelDiff = currentSkill 
                      ? compareValues(skill.skillLevel, currentSkill.skillLevel)
                      : null;

                    return (
                      <div
                        key={skill.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          !hasSkill
                            ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                            : levelDiff && levelDiff.isSignificant
                            ? `${levelDiff.bgColor} ${levelDiff.borderColor} border-2`
                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50"
                        }`}
                      >
                        <img
                          src={skill.icon}
                          alt={skill.name}
                          className="w-10 h-10 rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {skill.name}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Lv.{skill.skillLevel} | {skill.category}
                            </div>
                            {!hasSkill && (
                              <span className="text-xs text-red-600 dark:text-red-400 font-medium px-2 py-0.5 rounded bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                                (미보유)
                              </span>
                            )}
                            {hasSkill && levelDiff && levelDiff.value !== 0 && (() => {
                              const DiffIcon = levelDiff.icon;
                              return (
                                <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${levelDiff.bgColor} ${levelDiff.borderColor} border`}>
                                  <DiffIcon className={`w-3 h-3 ${levelDiff.color}`} />
                                  <span className={levelDiff.color}>
                                    {levelDiff.value > 0 ? "+" : ""}{levelDiff.value}
                                  </span>
                                  <span className={`text-[10px] ${levelDiff.color}`}>
                                    ({levelDiff.label})
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

