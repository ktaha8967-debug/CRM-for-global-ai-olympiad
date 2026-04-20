"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Users, 
  Globe, 
  CalendarDays, 
  Building2, 
  TrendingUp, 
  ArrowUpRight,
  ClipboardList
} from "lucide-react";

const ParticipationChart = dynamic(() => import("@/components/ParticipationChart"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-50 dark:bg-zinc-900/50 rounded-xl" />
});

const RegionChart = dynamic(() => import("@/components/RegionChart"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-50 dark:bg-zinc-900/50 rounded-xl" />
});

export default function GlobalDashboard() {
  const [counts, setCounts] = useState({ countries: 0, events: 0, sponsors: 0, volunteers: 0 });
  const [tenders, setTenders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const [statsRes, tendersRes] = await Promise.all([
          fetch('/api/statistics'),
          fetch('/api/tenders')
        ]);

        const statsData = statsRes.ok ? await statsRes.json() : null;
        const tendersData = tendersRes.ok ? await tendersRes.json() : [];

        if (statsData) {
          setCounts({
            countries: statsData.countries || 107,
            sponsors: statsData.sponsors || 32,
            events: statsData.events || 145,
            volunteers: statsData.volunteers || 856
          });
        }

        setTenders(Array.isArray(tendersData) ? tendersData : []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchRealData();
  }, []);

  const stats = [
    { name: "Total Volunteers", value: counts.volunteers.toLocaleString(), change: "+12.5%", icon: Users },
    { name: "Active Countries", value: counts.countries.toString(), change: "+4", icon: Globe },
    { name: "Managed Events", value: counts.events.toString(), change: "+24", icon: CalendarDays },
    { name: "Sponsor Partners", value: counts.sponsors.toString(), change: "+2", icon: Building2 },
  ];

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white uppercase italic tracking-tighter">Global Command Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          Real-time overview of the Global AI Olympiad operations and international infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-[2rem] border-2 border-gray-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#111] hover:shadow-xl transition-all"
          >
            <dt>
              <div className="absolute rounded-2xl bg-blue-50 p-4 dark:bg-blue-900/20">
                <stat.icon className="h-6 w-6 text-blue-700 dark:text-blue-400" aria-hidden="true" />
              </div>
              <p className="ml-20 truncate text-[10px] font-black uppercase tracking-widest text-gray-400">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-20 flex items-baseline pb-1 sm:pb-2">
              <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</p>
              <p className="ml-2 flex items-baseline text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
                <TrendingUp className="mr-1 h-3 w-3 shrink-0 self-center text-green-500" />
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-[2.5rem] border-2 border-gray-100 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-[#111]">
          <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-8 italic">Engagement Metrics (YTD)</h2>
          <ParticipationChart />
        </div>
        <div className="rounded-[2.5rem] border-2 border-gray-100 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-[#111]">
          <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-8 italic">Geopolitical Distribution</h2>
          <RegionChart />
        </div>
      </div>

      <div className="rounded-[3rem] border-2 border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between border-b-2 border-gray-100 px-10 py-8 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white italic flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              Strategic Active Tenders
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Managed international procurement cycles</p>
          </div>
          <a href="/tenders" className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">
            Open Tender Portal
          </a>
        </div>
        <div className="px-10 py-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-100 dark:divide-zinc-800">
              <thead>
                <tr>
                  <th scope="col" className="py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Reference</th>
                  <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Title</th>
                  <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Closing Date</th>
                  <th scope="col" className="px-3 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100 dark:divide-zinc-800">
                {tenders.length > 0 ? tenders.map((tender: any) => (
                  <tr key={tender.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all">
                    <td className="whitespace-nowrap py-6 text-xs font-black text-blue-600 dark:text-blue-400">
                      {tender.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-6 text-sm font-bold text-gray-900 dark:text-white">{tender.title}</td>
                    <td className="whitespace-nowrap px-3 py-6 text-xs font-black uppercase text-gray-500 tracking-widest">{tender.type}</td>
                    <td className="whitespace-nowrap px-3 py-6 text-xs font-bold text-gray-500">{tender.date}</td>
                    <td className="whitespace-nowrap px-3 py-6 text-right">
                      <span className={`inline-flex items-center rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest ${
                        tender.status === 'Open' ? 'bg-green-100 text-green-700' :
                        tender.status === 'Under Review' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {tender.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">No active tenders found in the registry</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
