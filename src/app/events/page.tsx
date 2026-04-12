"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar, MapPin, Users, Plus, ArrowRight, Activity, Layers, Globe,
  Briefcase, CheckCircle, ChevronRight, FileText, Layout,
  Video, DollarSign, Lock, LockOpen, EyeOff, Eye, Shield, Award, Settings,
  Play, Target, MessageSquare, TrendingUp, Search, X, UploadCloud, Trash2, 
  Edit3, Signature, Check, Building2, Zap, Clock, ExternalLink, ShieldCheck, 
  Eraser, Download, FileSearch, Send, Cpu, Database
} from "lucide-react";

// --- TYPES & INTERFACES --- //
type EventType = "City Qualifiers" | "National Championships" | "Continental Finals" | "Global Grand Final";
type EventLayer = "Validation" | "Development" | "Refinement" | "Showcase";
type EventStatus = "Draft" | "Upcoming" | "Live" | "Completed";

interface GAIOEvent { id: string; name: string; type: EventType; layer: EventLayer; parentId: string; country: string; city: string; region: string; hostOrg: string; mode: "Virtual" | "Physical" | "Hybrid"; startDate: string; endDate: string; status: EventStatus; }
interface Task { id: string; name: string; done: boolean; }
interface Phase { id: string; name: string; startDate: string; endDate: string; status: "Pending" | "Active" | "Completed"; manager: string; tasks: Task[]; }
interface TeamMember { id: string; name: string; role: string; bio: string; }
interface Team { id: string; eventId: string; name: string; memberList: TeamMember[]; size: number; purpose: "Startup" | "Individual" | "Academic"; country: string; university: string; skills: string; status: "Active" | "Eliminated" | "Qualified"; submittedAt: string; }
interface Session { id: string; eventId: string; day: string; type: string; title: string; speakers: string; time: string; duration: string; location: string; streamLink: string; status: string; }
interface Sponsor { id: string; eventId: string; name: string; type: string; contribution: string; deliverables: string; }
interface HostGov { id: string; eventId: string; country: string; org: string; contacts: string; approvalStatus: string; notes: string; endorsementDoc?: string; signature?: string; endorsementDate?: string; }
interface Expense { id: string; description: string; cost: number; }
interface Logistics { eventId: string; venueName: string; venueAddress: string; venueCapacity: number; budget: number; fundingSource: string; expenses: Expense[]; }

interface CRMState { events: GAIOEvent[]; teams: Team[]; phases: Record<string, Phase[]>; sessions: Session[]; sponsors: Sponsor[]; hosts: HostGov[]; logistics: Record<string, Logistics>; }

const PHASE_BLUEPRINT = [
  { name: "Preparation", tasks: ["Venue Search", "Budget Approval"] },
  { name: "Registration", tasks: ["Open Signups", "Marketing Start"] },
  { name: "Workshops", tasks: ["Invite Mentors", "Plan Content"] }
];

const INITIAL_STATE: CRMState = {
  events: [
    { id: "EVT-G", name: "Global Grand Final", type: "Global Grand Final", layer: "Showcase", parentId: "", country: "UAE", city: "Dubai", region: "Middle East", hostOrg: "GAIO Team", mode: "Physical", startDate: "2026-12-01", endDate: "2026-12-05", status: "Upcoming" },
    { id: "EVT-U", name: "UK National", type: "National Championships", layer: "Development", parentId: "EVT-G", country: "UK", city: "London", region: "Europe", hostOrg: "Tech UK", mode: "Physical", startDate: "2026-08-01", endDate: "2026-08-05", status: "Live" }
  ],
  teams: [
    { id: "TM-1", eventId: "EVT-U", name: "Alpha Intelligence", size: 2, purpose: "Startup", memberList: [{ id: "M1", name: "John D", role: "AI Lead", bio: "Tech Specialist." }, { id: "M2", name: "Sarah K", role: "Design Lead", bio: "Visual Specialist." }], country: "UK", university: "UCL", skills: "Python, PyTorch", status: "Active", submittedAt: "2026-04-01" }
  ],
  phases: {},
  sessions: [],
  sponsors: [{ id: "SPN-1", eventId: "EVT-G", name: "TechCorp", type: "Title", contribution: "Financial", deliverables: "Main Stage Branding" }],
  hosts: [],
  logistics: {}
};

export default function EventManagementSystem() {
  const [state, setState] = useState<CRMState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState("EVENTS"); 
  const [selectedEventId, setSelectedEventId] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("OVERVIEW");
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Event Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEventForm, setNewEventForm] = useState<Partial<GAIOEvent>>({ type: "City Qualifiers", layer: "Validation", status: "Draft" });
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  
  // Team Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState<Partial<Team>>({ purpose: "Startup" });
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [isTeamManageOpen, setIsTeamManageOpen] = useState(false);
  const [teamSubTab, setTeamSubTab] = useState("MEMBERS");

  const genId = (p: string) => `${p}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const getEvent = (id: string) => state.events.find(ev => ev.id === id);
  const getTeam = (id: string) => state.teams.find(t => t.id === id);
  const update = (k: keyof CRMState, d: any) => setState(p => ({ ...p, [k]: d }));

  useEffect(() => {
    const saved = localStorage.getItem('gaio_events_core_simple_v2');
    if (saved) {
      try { setState(JSON.parse(saved)); } catch (e) { console.error(e); }
    } else {
      const phs: Record<string, Phase[]> = {};
      INITIAL_STATE.events.forEach(e => {
        phs[e.id] = PHASE_BLUEPRINT.map((b, i) => ({ id: `PH-INIT-${e.id}-${i}-${Math.random().toString(36).substr(2, 4)}`, name: b.name, startDate: "", endDate: "", status: "Pending", manager: "", tasks: b.tasks.map(t => ({ id: genId("T"), name: t, done: false })) }));
      });
      const newState = { ...INITIAL_STATE, phases: phs };
      setState(newState);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => { if (isLoaded) localStorage.setItem('gaio_events_core_simple_v2', JSON.stringify(state)); }, [state, isLoaded]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const id = genId("EVT");
    const newPhases = PHASE_BLUEPRINT.map((b, i) => ({ id: `PH-${id}-${i}-${Math.random().toString(36).substr(2, 4)}`, name: b.name, startDate: "", endDate: "", status: "Pending", manager: "", tasks: b.tasks.map(t => ({ id: genId("T"), name: t, done: false })) }));
    update("events", [{ ...newEventForm, id } as GAIOEvent, ...state.events]);
    update("phases", { ...state.phases, [id]: newPhases });
    setIsCreateOpen(false);
  };

  const toggleTask = (eventId: string, phaseId: string, taskId: string) => {
    const phs = state.phases[eventId] || [];
    update("phases", { ...state.phases, [eventId]: phs.map(p => p.id === phaseId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) } : p) });
  };

  const addPhase = (eventId: string) => {
    const newP: Phase = { id: genId("PH"), name: "New Step", status: "Pending", manager: "", tasks: [] };
    update("phases", { ...state.phases, [eventId]: [...(state.phases[eventId] || []), newP] });
  };

  const addHost = (eventId: string) => {
    update("hosts", [...state.hosts, {id: genId("HST"), eventId, country: "", org: "New Partner", contacts: "", approvalStatus: "Pending", notes: "" }]);
  };

  const addSession = (eventId: string) => {
    update("sessions", [...state.sessions, {id: genId("SES"), eventId, day: "Day 1", type: "Workshop", title: "New Session", speakers: "", time: "10:00 AM", duration: "1h", location: "", streamLink: "", status: "Upcoming"}]);
  };

  if (!isLoaded) return null;

  return (
    <div className="flex h-screen bg-[#fcfcfc] dark:bg-[#050505] overflow-hidden font-sans selection:bg-blue-100">
      <aside className="w-72 flex flex-col bg-white dark:bg-[#0a0a0a] border-r-2 dark:border-zinc-800 relative z-10 shadow-xl">
        <div className="p-12 pb-6"><div className="flex items-center gap-4 text-blue-600 animate-in slide-in-from-left duration-500"><Globe className="w-10 h-10 stroke-[3]" /><h1 className="text-4xl font-black tracking-tighter leading-none italic">GAIO</h1></div></div>
        <div className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
          <button onClick={() => setActiveTab("EVENTS")} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] text-[10px] font-black tracking-[0.3em] transition-all uppercase ${activeTab === "EVENTS" || activeTab === "DETAILS" ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-105" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
            <Calendar className="w-5 h-5"/> EVENTS
          </button>
          <button onClick={() => setActiveTab("PARTICIPANTS")} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] text-[10px] font-black tracking-[0.3em] transition-all uppercase ${activeTab === "PARTICIPANTS" || activeTab === "TEAM_DETAILS" ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-105" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
            <Users className="w-5 h-5"/> PARTICIPANTS
          </button>
          <div className="pt-10 pb-4 px-8 text-[9px] font-black text-gray-400 uppercase tracking-[0.5em] opacity-50 border-b dark:border-zinc-800 mb-4">Management</div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 lg:p-16 bg-white dark:bg-[#050505] scroll-smooth">
         
         {/* --- EVENTS LIST --- */}
         {activeTab === "EVENTS" && (
           <div className="space-y-10 animate-in fade-in duration-500">
             <div className="sm:flex sm:items-center sm:justify-between">
               <div>
                 <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">All Events</h1>
                 <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Manage your global competitions, locations, and partners.</p>
               </div>
               <button onClick={() => setIsCreateOpen(true)} className="block rounded-2xl bg-blue-600 px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center gap-2">
                 <Plus className="h-4 w-4" /> Add New Event
               </button>
             </div>

             {isCreateOpen && (
               <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[3rem] border-4 border-blue-600/20 shadow-2xl animate-in zoom-in-95 mb-10">
                 <div className="flex justify-between items-center mb-8"><h3 className="text-lg font-black uppercase tracking-widest text-blue-600">Event Details</h3><button onClick={() => setIsCreateOpen(false)}><X className="w-6 h-6 text-gray-400"/></button></div>
                 <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Name</label><input required value={newEventForm.name || ""} onChange={v => setNewEventForm({...newEventForm, name: v.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-[1.2rem] px-6 py-4 border-0 font-black text-lg shadow-inner text-gray-900 dark:text-white" /></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Level</label><select value={newEventForm.type} onChange={v => setNewEventForm({...newEventForm, type: v.target.value as any})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-[1.2rem] px-6 py-4 border-0 font-black uppercase text-xs tracking-widest shadow-inner text-gray-900 dark:text-white"><option>City Qualifiers</option><option>National Championships</option><option>Continental Finals</option><option>Global Grand Final</option></select></div>
                   <button type="submit" className="md:col-span-2 bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-600/40 uppercase tracking-[0.3em] text-xs">Create Event</button>
                 </form>
               </div>
             )}

             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {state.events.map(ev => (
                 <div key={ev.id} className="rounded-[2.5rem] border-2 border-gray-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#111] hover:shadow-xl transition-all group">
                   <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 mb-6 group-hover:scale-110 transition-transform">
                     <Globe className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                   </div>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">{ev.name}</h3>
                   <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black mt-1 uppercase tracking-widest">{ev.type}</p>
                   
                   <div className="mt-8 space-y-4">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-gray-400">Status</span>
                       <span className={`px-3 py-1 rounded-full ${ev.status === 'Live' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{ev.status}</span>
                     </div>
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                       <span>Steps Active</span>
                       <span className="text-gray-900 dark:text-white">{(state.phases[ev.id] || []).length} Phases</span>
                     </div>
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                       <span>Location</span>
                       <span className="text-gray-900 dark:text-white truncate max-w-[100px] text-right">{ev.city || "Global Hub"}</span>
                     </div>
                   </div>

                   <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                     <button onClick={() => { setSelectedEventId(ev.id); setActiveTab("DETAILS"); setActiveSubTab("OVERVIEW"); }} className="text-[10px] font-black text-blue-600 hover:text-blue-500 uppercase tracking-[0.2em]">Manage Event</button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* --- EVENT DETAILS PANEL --- */}
         {activeTab === "DETAILS" && (() => {
           const e = getEvent(selectedEventId);
           if (!e) return <div className="p-20 text-center font-black uppercase text-gray-400 tracking-[0.5em]">Event Not Found</div>;
           const phs = state.phases[e.id] || [];
           const l = state.logistics[e.id] || { eventId: e.id, venueName: "", venueAddress: "", venueCapacity: 0, budget: 0, fundingSource: "", expenses: [] };
           const spent = l.expenses.reduce((a,c) => a+c.cost, 0);

           return (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
               <div className="w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-[3rem] bg-white shadow-2xl dark:bg-[#0a0a0a] dark:border dark:border-zinc-800 flex flex-col">
                 
                 <div className="p-10 border-b dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
                   <div className="flex items-center gap-8">
                     <div className="h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30">
                       <Layers className="h-10 w-10" />
                     </div>
                     <div>
                       <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate max-w-md">{e.name}</h2>
                       <div className="flex items-center gap-4 mt-2">
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{e.type}</span>
                         <span className="text-gray-300 dark:text-zinc-700">|</span>
                         <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3"/> {e.city}, {e.country}</span>
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <select value={e.status} onChange={v => update("events", state.events.map(ev => ev.id === e.id ? {...ev, status: v.target.value as any} : ev))} className="bg-white dark:bg-zinc-800 rounded-xl px-6 py-3 text-[10px] font-black uppercase border-0 shadow-lg tracking-widest">
                       <option>Draft</option><option>Upcoming</option><option>Live</option><option>Completed</option>
                     </select>
                     <button onClick={() => setActiveTab("EVENTS")} className="p-3 bg-white dark:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-2xl shadow-lg transition-all">
                       <X className="h-6 w-6" />
                     </button>
                   </div>
                 </div>

                 <div className="flex px-10 border-b dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
                   {[
                     { id: "OVERVIEW", icon: Clock, label: "Event Summary" },
                     { id: "PHASES", icon: Zap, label: "Steps & Phases" },
                     { id: "LOGISTICS", icon: Briefcase, label: "Venue & Costs" },
                     { id: "HOSTS", icon: ShieldCheck, label: "Partner Approval" },
                     { id: "SESSIONS", icon: Video, label: "Schedule" },
                     { id: "SPONSORS", icon: DollarSign, label: "Sponsors" }
                   ].map((tab) => (
                     <button
                       key={tab.id}
                       onClick={() => setActiveSubTab(tab.id as any)}
                       className={`flex items-center gap-3 px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 ${
                         activeSubTab === tab.id 
                         ? "text-blue-600 border-blue-600" 
                         : "text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-zinc-300"
                       }`}
                     >
                       <tab.icon className="h-4 w-4" />
                       {tab.label}
                     </button>
                   ))}
                 </div>

                 <div className="flex-1 overflow-y-auto p-12">
                   {activeSubTab === "OVERVIEW" && (
                     <div className="space-y-12 animate-in fade-in duration-300">
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                         {[
                           { label: "Level", value: e.type, icon: ShieldCheck, color: "text-green-500" },
                           { label: "Start Date", value: e.startDate, icon: Calendar, color: "text-blue-600" },
                           { label: "Active Steps", value: phs.length, icon: Zap, color: "text-purple-600" },
                           { label: "Money Spent", value: `$${spent}`, icon: DollarSign, color: "text-red-600" }
                         ].map((stat) => (
                           <div key={stat.label} className="p-8 rounded-[2rem] border-2 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
                             <stat.icon className={`h-6 w-6 ${stat.color} mb-4`} />
                             <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                             <p className="text-xl font-black text-gray-900 dark:text-white mt-1 uppercase tracking-tighter">{stat.value}</p>
                           </div>
                         ))}
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-8">
                           <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter"><Target className="h-6 w-6 text-blue-600" />Event Setup</h3>
                           <div className="grid grid-cols-1 gap-6">
                             <div>
                               <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Is it Physical or Virtual?</label>
                               <select value={e.mode} onChange={v => update("events", state.events.map(ev => ev.id === e.id ? {...ev, mode: v.target.value as any} : ev))} className="w-full mt-2 bg-gray-50 dark:bg-zinc-900 border-2 dark:border-zinc-800 rounded-2xl p-4 text-xs font-black uppercase tracking-widest"><option>Physical</option><option>Virtual</option><option>Hybrid</option></select>
                             </div>
                             <div>
                               <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Connection Status</label>
                               <div className="mt-2 p-4 bg-gray-50 dark:bg-zinc-900 rounded-2xl border-2 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-blue-600">LIVE DATA LINK ACTIVE</div>
                             </div>
                           </div>
                         </div>
                         <div className="p-10 rounded-[3rem] bg-zinc-900 text-white relative overflow-hidden group border-4 border-blue-600/20 shadow-2xl">
                           <TrendingUp className="absolute -right-6 -bottom-6 h-48 w-48 opacity-10" />
                           <h3 className="text-2xl font-black italic tracking-tighter mb-4">Event Goal</h3>
                           <p className="text-sm text-zinc-400 mb-10 leading-relaxed font-bold">Focus on finishing all steps and checking partner approvals for this event level.</p>
                           <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] bg-blue-600 hover:bg-blue-500 py-4 px-8 rounded-2xl transition-all shadow-xl shadow-blue-600/30">Download Details</button>
                         </div>
                       </div>
                     </div>
                   )}
                   {activeSubTab === "PHASES" && (
                     <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                       <div className="flex justify-between items-center"><h3 className="text-3xl font-black uppercase tracking-tighter text-blue-600">Event Steps</h3><button onClick={() => addPhase(e.id)} className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-full shadow-lg hover:rotate-90 transition-all"><Plus className="w-6 h-6"/></button></div>
                       <div className="space-y-8">
                         {phs.map((p, i) => (
                           <div key={p.id + '-' + i} onClick={() => setActivePhaseId(p.id === activePhaseId ? null : p.id)} className={`flex items-start gap-10 group cursor-pointer transition-all ${p.id === activePhaseId ? 'translate-x-4' : ''}`}>
                             <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 font-black text-white shadow-2xl transition-all ${p.status === 'Completed' ? 'bg-green-500 scale-90' : p.status === 'Active' ? 'bg-blue-600 animate-pulse' : 'bg-gray-200 dark:bg-zinc-800 text-gray-400'}`}>{p.status === 'Completed' ? <Check className="w-8 h-8 stroke-[4]"/> : i+1}</div>
                             <div className={`flex-1 bg-gray-50/50 dark:bg-zinc-900/50 p-10 rounded-[3rem] border-2 ${p.id === activePhaseId ? 'border-blue-600 bg-blue-50/10' : 'border-transparent'} transition-all shadow-sm`}>
                               <div className="flex justify-between items-center mb-8">
                                 <input value={p.name} onChange={v => update("phases", { ...state.phases, [e.id]: phs.map(pp => pp.id === p.id ? {...pp, name: v.target.value} : pp) })} onClick={ev => ev.stopPropagation()} className="bg-transparent font-black uppercase tracking-tighter text-2xl border-0 p-0 focus:ring-0 w-2/3 text-gray-900 dark:text-white" />
                                 <select value={p.status} onChange={v => update("phases", { ...state.phases, [e.id]: phs.map(pp => pp.id === p.id ? {...pp, status: v.target.value as any} : pp) })} onClick={ev => ev.stopPropagation()} className="text-[10px] font-black rounded-xl bg-white dark:bg-zinc-800 px-5 py-3 border dark:border-zinc-700 uppercase shadow-sm text-gray-900 dark:text-white"><option>Pending</option><option>Active</option><option>Completed</option></select>
                               </div>
                               {p.id === activePhaseId && (
                                 <div className="mt-6 pt-8 border-t-2 border-dashed dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
                                   {p.tasks.map((t, ti) => <div key={t.id + '-' + ti} onClick={ev => { ev.stopPropagation(); toggleTask(e.id, p.id, t.id); }} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-500 cursor-pointer group/task"><div className={`w-6 h-6 rounded-xl border-4 flex items-center justify-center transition-all ${t.done ? 'bg-blue-600 border-blue-600 shadow-xl' : 'border-gray-200 dark:border-zinc-700'}`}>{t.done && <Check className="w-3.5 h-3.5 text-white stroke-[4]"/>}</div> <span className={t.done ? 'line-through opacity-30' : ''}>{t.name}</span></div>)}
                                   <button onClick={ev => { ev.stopPropagation(); const n = prompt("Task Name?"); if(n) update("phases", {...state.phases, [e.id]: phs.map(pp => pp.id === p.id ? {...pp, tasks: [...pp.tasks, {id: genId("T"), name: n, done: false}]} : pp)}); }} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">+ Add Task</button>
                                 </div>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                   {activeSubTab === "LOGISTICS" && (() => {
                     const l = state.logistics[e.id] || { eventId: e.id, venueName: "", venueAddress: "", venueCapacity: 0, budget: 0, fundingSource: "", expenses: [] };
                     const upL = (f: keyof Logistics, v: any) => update("logistics", { ...state.logistics, [e.id]: { ...l, [f]: v } });
                     const spent = l.expenses.reduce((a,c) => a+c.cost, 0);
                     return (
                       <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                         <h3 className="text-3xl font-black uppercase tracking-tighter text-purple-600">Venue & Money</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-8">
                               <div className="space-y-3"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Venue Name</label><input value={l.venueName} onChange={v => upL("venueName", v.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-[1.5rem] px-8 py-6 border-0 font-black uppercase text-sm shadow-inner text-gray-900 dark:text-white" placeholder="Site Name" /></div>
                               <div className="space-y-3"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Address</label><textarea value={l.venueAddress} onChange={v => upL("venueAddress", v.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-[1.5rem] px-8 py-6 border-0 font-bold text-xs text-gray-900 dark:text-white" rows={3} /></div>
                               <div className="space-y-3"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Max People</label><input type="number" value={l.venueCapacity} onChange={v => upL("venueCapacity", Number(v.target.value))} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-[1.5rem] px-8 py-6 border-0 font-black text-xl text-gray-900 dark:text-white" /></div>
                            </div>
                            <div className="p-10 bg-gray-50 dark:bg-zinc-900 rounded-[3.5rem] border-2 border-dashed dark:border-zinc-800 space-y-10">
                               <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Money Spent</label><button onClick={() => { const d = prompt("Description?"); const c = prompt("USD?"); if(d&&c) upL("expenses", [...l.expenses, {id: genId("EX"), description: d, cost: Number(c)}]); }} className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20"><Plus className="w-5 h-5"/></button></div>
                               <div className="max-h-64 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                                 {l.expenses.map((ex, xi) => <div key={ex.id + '-' + xi} className="flex justify-between items-center p-5 bg-white dark:bg-zinc-800 rounded-3xl shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white"><span>{ex.description}</span><span className="text-red-500 font-black">-${ex.cost}</span></div>)}
                               </div>
                               <div className="pt-8 flex justify-between items-center border-t-2 border-double dark:border-zinc-800"><span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Total Spent</span><span className="text-4xl font-black text-red-500 tracking-tighter">${spent}</span></div>
                            </div>
                         </div>
                       </div>
                     );
                   })()}
                   {activeSubTab === "HOSTS" && (() => {
                     const hsts = state.hosts.filter(h => h.eventId === e.id);
                     return (
                       <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                         <div className="flex justify-between items-center">
                           <h3 className="text-3xl font-black uppercase tracking-tighter text-blue-600">Partner Approvals</h3>
                           <button onClick={() => addHost(e.id)} className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all"><Plus className="w-6 h-6"/></button>
                         </div>
                         <div className="grid grid-cols-1 gap-8">
                           {hsts.length === 0 && <div className="p-20 border-4 border-dashed dark:border-zinc-800 rounded-[3rem] text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">No partners added yet</div>}
                           {hsts.map((h, hi) => (
                             <div key={h.id + '-' + hi} className="bg-gray-50/50 dark:bg-zinc-900/50 p-10 rounded-[3rem] border-2 dark:border-zinc-800 space-y-8 group hover:bg-white dark:hover:bg-[#0a0a0a] transition-all">
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                 <div className="space-y-3">
                                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Organization</label>
                                   <input value={h.org} onChange={v => update("hosts", state.hosts.map(hh => hh.id === h.id ? {...hh, org: v.target.value} : hh))} className="w-full bg-white dark:bg-zinc-800 rounded-2xl px-6 py-4 border-0 font-black uppercase text-sm shadow-sm text-gray-900 dark:text-white" />
                                 </div>
                                 <div className="space-y-3">
                                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Country</label>
                                   <input value={h.country} onChange={v => update("hosts", state.hosts.map(hh => hh.id === h.id ? {...hh, country: v.target.value} : hh))} className="w-full bg-white dark:bg-zinc-800 rounded-2xl px-6 py-4 border-0 font-black uppercase text-sm shadow-sm text-gray-900 dark:text-white" />
                                 </div>
                                 <div className="space-y-3">
                                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Approval Status</label>
                                   <select value={h.approvalStatus} onChange={v => update("hosts", state.hosts.map(hh => hh.id === h.id ? {...hh, approvalStatus: v.target.value} : hh))} className="w-full bg-white dark:bg-zinc-800 rounded-2xl px-6 py-4 border-0 font-black uppercase text-xs shadow-sm text-gray-900 dark:text-white">
                                     <option>Pending</option><option>In Review</option><option>Approved</option><option>Rejected</option>
                                   </select>
                                 </div>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-3">
                                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Contacts</label>
                                   <textarea value={h.contacts} onChange={v => update("hosts", state.hosts.map(hh => hh.id === h.id ? {...hh, contacts: v.target.value} : hh))} className="w-full bg-white dark:bg-zinc-800 rounded-2xl px-6 py-4 border-0 font-bold text-xs text-gray-900 dark:text-white" rows={2} />
                                 </div>
                                 <div className="space-y-3">
                                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Notes</label>
                                   <textarea value={h.notes} onChange={v => update("hosts", state.hosts.map(hh => hh.id === h.id ? {...hh, notes: v.target.value} : hh))} className="w-full bg-white dark:bg-zinc-800 rounded-2xl px-6 py-4 border-0 font-bold text-xs text-gray-900 dark:text-white" rows={2} />
                                 </div>
                               </div>
                               <div className="flex justify-end">
                                 <button onClick={() => update("hosts", state.hosts.filter(hh => hh.id !== h.id))} className="text-red-500 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5"/></button>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   })()}
                   {activeSubTab === "SESSIONS" && (() => {
                     const sess = state.sessions.filter(s => s.eventId === e.id);
                     return (
                       <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                         <div className="flex justify-between items-center">
                           <h3 className="text-3xl font-black uppercase tracking-tighter text-blue-600">Event Schedule</h3>
                           <button onClick={() => addSession(e.id)} className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all"><Plus className="w-6 h-6"/></button>
                         </div>
                         <div className="space-y-6">
                           {sess.length === 0 && <div className="p-20 border-4 border-dashed dark:border-zinc-800 rounded-[3rem] text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">No sessions scheduled</div>}
                           {sess.map((s, si) => (
                             <div key={s.id + '-' + si} className="flex flex-col md:flex-row items-center gap-8 bg-gray-50/50 dark:bg-zinc-900/50 p-8 rounded-[2.5rem] border-2 dark:border-zinc-800 group hover:bg-white dark:hover:bg-[#0a0a0a] transition-all">
                               <div className="w-full md:w-32 text-center">
                                 <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{s.day}</p>
                                 <input value={s.time} onChange={v => update("sessions", state.sessions.map(ss => ss.id === s.id ? {...ss, time: v.target.value} : ss))} className="w-full bg-transparent text-center font-black text-xl border-0 p-0 focus:ring-0 text-gray-900 dark:text-white" />
                               </div>
                               <div className="flex-1 space-y-4 w-full">
                                 <input value={s.title} onChange={v => update("sessions", state.sessions.map(ss => ss.id === s.id ? {...ss, title: v.target.value} : ss))} className="w-full bg-transparent font-black uppercase tracking-tighter text-2xl border-0 p-0 focus:ring-0 text-gray-900 dark:text-white" />
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                   <div className="space-y-1"><label className="text-[8px] font-black uppercase text-gray-400">Type</label><input value={s.type} onChange={v => update("sessions", state.sessions.map(ss => ss.id === s.id ? {...ss, type: v.target.value} : ss))} className="w-full bg-white dark:bg-zinc-800 rounded-lg px-3 py-1.5 border-0 text-[10px] font-bold text-gray-900 dark:text-white shadow-sm" /></div>
                                   <div className="space-y-1"><label className="text-[8px] font-black uppercase text-gray-400">Location</label><input value={s.location} onChange={v => update("sessions", state.sessions.map(ss => ss.id === s.id ? {...ss, location: v.target.value} : ss))} className="w-full bg-white dark:bg-zinc-800 rounded-lg px-3 py-1.5 border-0 text-[10px] font-bold text-gray-900 dark:text-white shadow-sm" /></div>
                                   <div className="space-y-1"><label className="text-[8px] font-black uppercase text-gray-400">Speakers</label><input value={s.speakers} onChange={v => update("sessions", state.sessions.map(ss => ss.id === s.id ? {...ss, speakers: v.target.value} : ss))} className="w-full bg-white dark:bg-zinc-800 rounded-lg px-3 py-1.5 border-0 text-[10px] font-bold text-gray-900 dark:text-white shadow-sm" /></div>
                                   <div className="space-y-1"><label className="text-[8px] font-black uppercase text-gray-400">Status</label><select value={s.status} onChange={v => update("sessions", state.sessions.map(ss => ss.id === s.id ? {...ss, status: v.target.value} : ss))} className="w-full bg-white dark:bg-zinc-800 rounded-lg px-3 py-1.5 border-0 text-[10px] font-black uppercase text-gray-900 dark:text-white shadow-sm"><option>Upcoming</option><option>Live</option><option>Completed</option></select></div>
                                 </div>
                               </div>
                               <button onClick={() => update("sessions", state.sessions.filter(ss => ss.id !== s.id))} className="text-red-500 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-6 h-6"/></button>
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   })()}
                   {activeSubTab === "SPONSORS" && (() => {
                     const spns = state.sponsors.filter(s => s.eventId === e.id);
                     return (
                       <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                         <div className="flex justify-between items-center">
                           <h3 className="text-3xl font-black uppercase tracking-tighter text-blue-600">Event Sponsors</h3>
                           <button onClick={() => update("sponsors", [...state.sponsors, {id: genId("SPN"), eventId: e.id, name: "New Sponsor", type: "Partner", contribution: "", deliverables: ""}])} className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all"><Plus className="w-6 h-6"/></button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           {spns.length === 0 && <div className="md:col-span-2 p-20 border-4 border-dashed dark:border-zinc-800 rounded-[3rem] text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">No sponsors added yet</div>}
                           {spns.map((s, si) => (
                             <div key={s.id + '-' + si} className="bg-gray-50/50 dark:bg-zinc-900/50 p-10 rounded-[3rem] border-2 dark:border-zinc-800 group hover:bg-white dark:hover:bg-[#0a0a0a] transition-all relative">
                               <div className="flex items-center gap-6 mb-8">
                                 <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><DollarSign className="w-8 h-8 text-blue-600"/></div>
                                 <div className="flex-1">
                                   <input value={s.name} onChange={v => update("sponsors", state.sponsors.map(ss => ss.id === s.id ? {...ss, name: v.target.value} : ss))} className="w-full bg-transparent font-black uppercase tracking-tighter text-2xl border-0 p-0 focus:ring-0 text-gray-900 dark:text-white" />
                                   <input value={s.type} onChange={v => update("sponsors", state.sponsors.map(ss => ss.id === s.id ? {...ss, type: v.target.value} : ss))} className="w-full bg-transparent text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 border-0 p-0 focus:ring-0" placeholder="SPONSOR TYPE" />
                                 </div>
                               </div>
                               <div className="space-y-6">
                                 <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Contribution</label><input value={s.contribution} onChange={v => update("sponsors", state.sponsors.map(ss => ss.id === s.id ? {...ss, contribution: v.target.value} : ss))} className="w-full bg-white dark:bg-zinc-800 rounded-xl px-5 py-3 border-0 text-xs font-bold text-gray-900 dark:text-white shadow-sm" /></div>
                                 <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Deliverables</label><textarea value={s.deliverables} onChange={v => update("sponsors", state.sponsors.map(ss => ss.id === s.id ? {...ss, deliverables: v.target.value} : ss))} className="w-full bg-white dark:bg-zinc-800 rounded-xl px-5 py-3 border-0 text-xs font-bold text-gray-900 dark:text-white shadow-sm" rows={2} /></div>
                               </div>
                               <button onClick={() => update("sponsors", state.sponsors.filter(ss => ss.id !== s.id))} className="absolute top-8 right-8 p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   })()}
                 </div>
                 <div className="p-6 border-t dark:border-zinc-800 text-center bg-gray-50/50 dark:bg-zinc-900/50"><span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Event Management Terminal</span></div>
               </div>
             </div>
           );
         })()}

         {/* --- PARTICIPANTS HUB --- */}
         {activeTab === "PARTICIPANTS" && (
           <div className="space-y-10 animate-in fade-in duration-500">
             <div className="sm:flex sm:items-center sm:justify-between border-b-2 dark:border-zinc-800 pb-8">
               <div>
                 <h1 className="text-4xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">Team List</h1>
                 <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Details about teams and startup groups across the global network.</p>
               </div>
               <button onClick={() => setIsTeamModalOpen(true)} className="block rounded-[2.5rem] bg-blue-600 px-10 py-4 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white shadow-2xl shadow-blue-600/40 hover:bg-blue-500 transition-all">
                 Add New Team
               </button>
             </div>

             {isTeamModalOpen && (
               <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[3rem] border-4 border-blue-600/20 shadow-2xl animate-in zoom-in-95 mb-10">
                 <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black uppercase tracking-tighter italic text-blue-600">Team Details</h3><button onClick={() => setIsTeamModalOpen(false)} className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl"><X className="w-6 h-6 text-gray-400"/></button></div>
                 <form onSubmit={(e) => { e.preventDefault(); const id = genId("TM"); update("teams", [...state.teams, {...newTeam, id, memberList: [], size: 0, status: 'Active', submittedAt: '2026-Q2'} as Team]); setIsTeamModalOpen(false); }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-3"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Team Name</label><input required onChange={v => setNewTeam({...newTeam, name: v.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl px-8 py-6 font-black text-2xl uppercase tracking-tighter text-gray-900 dark:text-white shadow-inner" placeholder="Team Name" /></div>
                   <div className="space-y-3"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">University</label><input required onChange={v => setNewTeam({...newTeam, university: v.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl px-8 py-6 font-black text-xl uppercase text-gray-900 dark:text-white shadow-inner" placeholder="University" /></div>
                   <button type="submit" className="md:col-span-2 bg-blue-600 text-white font-black py-6 rounded-[2.5rem] uppercase tracking-[0.5em] text-xs shadow-2xl">Create Team</button>
                 </form>
               </div>
             )}

             <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
               {state.teams.map((team) => (
                 <div key={team.id} className="rounded-[3rem] border-2 border-gray-100 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-[#111] hover:shadow-2xl transition-all group relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-50/50 dark:bg-blue-900/10 blur-2xl group-hover:bg-blue-100/50 transition-colors" />
                   
                   <div className="relative z-10">
                     <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 mb-8 group-hover:scale-110 transition-transform">
                       <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                     </div>
                     <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate leading-none mb-2">{team.name}</h3>
                     <p className="text-[11px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] truncate">{team.university}</p>
                     
                     <div className="mt-10 space-y-5 border-t border-gray-100 dark:border-zinc-800 pt-8">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-gray-400 font-medium tracking-widest">Status</span>
                         <span className={`px-4 py-1.5 rounded-xl border ${team.status === 'Qualified' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-zinc-900 dark:border-zinc-800'}`}>{team.status}</span>
                       </div>
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                         <span>Members</span>
                         <span className="text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900 px-3 py-1 rounded-lg font-black">{team.memberList.length} Units</span>
                       </div>
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                         <span>Level</span>
                         <span className="text-gray-900 dark:text-white font-black">{team.purpose}</span>
                       </div>
                     </div>

                     <div className="mt-10 pt-8 flex items-center justify-between">
                       <button onClick={() => update("teams", state.teams.filter(tt=>tt.id!==team.id))} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all border border-transparent hover:border-red-100">
                         <Trash2 className="h-5 w-5"/>
                       </button>
                       <button onClick={() => { setSelectedTeamId(team.id); setIsTeamManageOpen(true); setTeamSubTab("MEMBERS"); }} className="bg-gray-900 dark:bg-white text-white dark:text-black font-black px-8 py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">View Details</button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* --- TEAM DETAILS PANEL --- */}
         {isTeamManageOpen && (() => {
           const t = getTeam(selectedTeamId);
           if (!t) return null;
           return (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
               <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[3.5rem] bg-white shadow-2xl dark:bg-[#0a0a0a] dark:border-4 dark:border-zinc-800 flex flex-col">
                 
                 <div className="p-12 border-b dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
                   <div className="flex items-center gap-10">
                     <div className="h-24 w-24 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30">
                       <Cpu className="h-12 w-12" />
                     </div>
                     <div>
                       <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate max-w-lg">{t.name}</h2>
                       <div className="flex items-center gap-6 mt-3">
                         <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-blue-100 dark:border-blue-900/30">{t.purpose} Team</span>
                         <span className="text-gray-300 dark:text-zinc-700">|</span>
                         <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2"><Globe className="w-4 h-4"/> {t.university}</span>
                       </div>
                     </div>
                   </div>
                   <button onClick={() => setIsTeamManageOpen(false)} className="p-4 bg-white dark:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-[1.5rem] shadow-xl transition-all border border-gray-100 dark:border-zinc-700">
                     <X className="h-8 w-8" />
                   </button>
                 </div>

                 <div className="flex px-12 border-b dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
                   {[
                     { id: "MEMBERS", icon: Users, label: "Team Members" },
                     { id: "BLUEPRINT", icon: Award, label: "Team Info" },
                     { id: "STACK", icon: Database, label: "Tech Used" }
                   ].map((tab) => (
                     <button
                       key={tab.id}
                       onClick={() => setTeamSubTab(tab.id as any)}
                       className={`flex items-center gap-4 px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-4 ${
                         teamSubTab === tab.id 
                         ? "text-blue-600 border-blue-600" 
                         : "text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-zinc-300"
                       }`}
                     >
                       <tab.icon className="h-5 w-5" />
                       {tab.label}
                     </button>
                   ))}
                 </div>

                 <div className="flex-1 overflow-y-auto p-16">
                   {teamSubTab === "MEMBERS" && (
                     <div className="space-y-12 animate-in fade-in duration-300">
                       <div className="flex justify-between items-center"><h3 className="text-2xl font-black uppercase tracking-tighter italic">Official Members</h3><button onClick={() => { const n = prompt("Name?"); if(n) update("teams", state.teams.map(tt => tt.id === t.id ? {...tt, memberList: [...tt.memberList, {id: genId("M"), name: n, role: 'Team Member', bio: 'Add details here...'}], size: tt.size + 1} : tt)); }} className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/40 hover:scale-105 transition-all">+ Add Member</button></div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         {t.memberList.map((m) => (
                           <div key={m.id} className="p-12 bg-gray-50/50 dark:bg-zinc-900/50 rounded-[3.5rem] border-2 border-gray-100 dark:border-zinc-800 shadow-sm relative group hover:bg-white dark:group-hover:bg-[#0a0a0a] transition-all">
                             <div className="flex items-center gap-6 mb-8">
                               <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-lg"><Users className="h-6 w-6 text-gray-400" /></div>
                               <div>
                                 <p className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">{m.name}</p>
                                 <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.4em]">{m.role}</p>
                               </div>
                             </div>
                             <p className="text-sm text-gray-500 font-bold leading-relaxed italic border-l-4 border-blue-600 pl-8">{m.bio}</p>
                             <button onClick={() => update("teams", state.teams.map(tt => tt.id === t.id ? {...tt, memberList: tt.memberList.filter(mm=>mm.id!==m.id), size: tt.size - 1} : tt))} className="absolute top-8 right-8 p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-2xl"><Trash2 className="h-5 w-5"/></button>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                   {teamSubTab === "BLUEPRINT" && (
                     <div className="p-16 bg-zinc-900 text-white rounded-[4rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 border-4 border-white/5">
                       <Award className="absolute -right-10 -bottom-10 h-80 w-80 opacity-10" />
                       <div className="relative z-10 space-y-12">
                         <h3 className="text-4xl font-black uppercase tracking-tighter italic text-blue-500">Team Summary</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                           <div className="space-y-10">
                             {[ 
                               {l: 'Team Name', v: t.name}, 
                               {l: 'University', v: t.university}, 
                               {l: 'Current Event', v: getEvent(t.eventId)?.name || "Not Assigned"} 
                             ].map((item, idx) => (
                               <div key={idx} className="flex justify-between border-b-2 border-white/10 pb-8"><span className="text-[11px] font-black uppercase opacity-50 tracking-[0.3em]">{item.l}</span><span className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">{item.v}</span></div>
                             ))}
                           </div>
                           <div className="space-y-10">
                             {[ 
                               {l: 'Joined On', v: t.submittedAt}, 
                               {l: 'Team Size', v: `${t.size} Core Members`}, 
                               {l: 'Status', v: t.status} 
                             ].map((item, idx) => (
                               <div key={idx} className="flex justify-between border-b-2 border-white/10 pb-8"><span className="text-[11px] font-black uppercase opacity-50 tracking-[0.3em]">{item.l}</span><span className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">{item.v}</span></div>
                             ))}
                           </div>
                         </div>
                         <div className="pt-12 flex justify-end"><button className="bg-white text-black font-black px-12 py-5 rounded-[2rem] text-[10px] uppercase tracking-[0.5em] shadow-2xl hover:bg-blue-50 transition-all active:scale-95">Download Info</button></div>
                       </div>
                     </div>
                   )}
                   {teamSubTab === "STACK" && (
                     <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-300">
                       <div className="p-12 rounded-[4rem] border-2 border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
                         <div className="flex items-center justify-between mb-10"><h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4"><Database className="h-8 w-8 text-blue-600" /> Technical Skills</h3><span className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black rounded-xl uppercase tracking-widest">Update Access</span></div>
                         <textarea 
                           value={t.skills} 
                           onChange={v => update("teams", state.teams.map(tt => tt.id === t.id ? {...tt, skills: v.target.value} : tt))} 
                           className="w-full bg-white dark:bg-[#0a0a0a] border-4 border-gray-100 dark:border-zinc-800 rounded-[3rem] p-12 font-black uppercase text-2xl tracking-tighter shadow-2xl min-h-[300px] focus:border-blue-600 outline-none transition-all text-gray-900 dark:text-white" 
                           placeholder="Enter technical details here..." 
                         />
                       </div>
                     </div>
                   )}
                 </div>
                 <div className="p-8 border-t dark:border-zinc-800 text-center bg-gray-50/50 dark:bg-zinc-900/50"><span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Team Management System • v1.5.3</span></div>
               </div>
             </div>
           );
         })()}
      </main>
    </div>
  );
}
