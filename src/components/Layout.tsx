import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Search,
  TrendingUp,
  Users,
  Trophy,
  Sparkles,
  Menu,
  Bell,
  Settings,
  Sun,
  Moon,
  ArrowUpRight,
  User,
} from "lucide-react";
import type { CharacterSearchResult } from "../types";
import { getRaceName, getClassName } from "../utils/mockApi";
import { fetchCharacterSearch } from "../utils/api";

export default function Layout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CharacterSearchResult[]>(
    []
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 0) {
      try {
        const response = await fetchCharacterSearch({
          keyword: value,
          race: 1,
          serverId: 1001,
          page: 1,
          size: 30,
        });
        // profileImageUrl가 상대 경로라면 절대 경로로 변환
        const toAbsolute = (url: string) =>
          url?.startsWith("http") ? url : `https://aion2.plaync.com${url}`;

        setSearchResults(
          response.list.map((item) => ({
            ...item,
            profileImageUrl: item.profileImageUrl
              ? toAbsolute(item.profileImageUrl)
              : "",
          }))
        );
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
        setShowDropdown(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectCharacter = (character: CharacterSearchResult) => {
    setShowDropdown(false);
    setSearchQuery(""); // Clear search query or keep it? Maybe clear to show result page cleanly
    navigate(`/character/${character.characterId}`, { state: { character } }); // Pass basic info
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (searchResults.length > 0) {
      handleSelectCharacter(searchResults[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-200 font-sans selection:bg-sky-500/30 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 bg-white dark:bg-[#0F1422] border-r border-slate-200 dark:border-slate-800/50 flex flex-col items-center py-8 z-50 transition-colors duration-300">
        <div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20 mb-12 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <nav className="flex-1 flex flex-col gap-8 w-full px-4">
          <button className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-sky-600 dark:text-sky-400 relative group">
            <div className="absolute inset-0 bg-sky-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Search className="w-5 h-5 relative z-10" />
          </button>
          <button className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <TrendingUp className="w-5 h-5" />
          </button>
          <button className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Trophy className="w-5 h-5" />
          </button>
        </nav>
        <div className="flex flex-col gap-6 w-full px-4">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="pl-20">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 px-8 py-5 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-4 w-full max-w-2xl">
            <div className="relative w-full group" ref={searchContainerRef}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity blur"></div>
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center bg-white dark:bg-[#151A29] rounded-xl border border-slate-200 dark:border-slate-800 transition-colors group-hover:border-sky-300 dark:group-hover:border-slate-700"
              >
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() =>
                    searchQuery.length > 0 && setShowDropdown(true)
                  }
                  placeholder="캐릭터, 아이템, 군단 검색..."
                  className="w-full bg-transparent border-none px-4 py-3 text-sm focus:outline-none text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                />
                <div className="pr-2">
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                    /
                  </kbd>
                </div>
              </form>

              {/* Search Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#151A29] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-fadeIn">
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.characterId}
                        onClick={() => handleSelectCharacter(result)}
                        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                          {result.profileImageUrl ? (
                            <img
                              src={result.profileImageUrl}
                              alt={result.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-medium text-slate-900 dark:text-white"
                              dangerouslySetInnerHTML={{ __html: result.name }}
                            ></span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Lv.{result.level}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {result.serverName} · {getRaceName(result.race)} ·{" "}
                            {getClassName(result.pcId)}
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0B0F19]"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
