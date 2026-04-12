import { useState } from "react";
import { Bell, Search, X, MessageSquare, ShieldCheck, Zap, Trophy, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { notifications, clearNotifications } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (section: string) => {
    if (section.includes("Communication")) return <MessageSquare className="h-4 w-4 text-blue-500" />;
    if (section.includes("Organiser")) return <ShieldCheck className="h-4 w-4 text-purple-500" />;
    if (section.includes("Sponsor")) return <Zap className="h-4 w-4 text-amber-500" />;
    if (section.includes("Tender")) return <Trophy className="h-4 w-4 text-green-500" />;
    if (section.includes("Volunteer")) return <ClipboardList className="h-4 w-4 text-red-500" />;
    return <Bell className="h-4 w-4 text-gray-500" />;
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 dark:bg-[#111] dark:border-zinc-800 relative z-50">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            name="search"
            id="search"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-700 dark:focus:ring-blue-500"
            placeholder="Search events, organisers, or tenders..."
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#111] animate-in zoom-in">
                {notifications.length}
              </span>
            )}
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-4 w-80 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border dark:border-zinc-800 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-950/50">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Recent Activity</h3>
                <div className="flex gap-2">
                  <button onClick={clearNotifications} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Clear All</button>
                  <button onClick={() => setIsOpen(false)}><X className="h-4 w-4 text-gray-400" /></button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No New Notifications</p>
                  </div>
                ) : (
                  <div className="divide-y dark:divide-zinc-800">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-950 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800">
                            {getIcon(n.section)}
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{n.section}</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-zinc-100 leading-snug">{n.message}</p>
                            <p className="text-[9px] text-gray-400 mt-2 font-medium">{n.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
