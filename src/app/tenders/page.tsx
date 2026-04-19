"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  FileText, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  Users, 
  ShieldCheck,
  MessageSquare,
  Send,
  Trash2,
  Trophy,
  LayoutDashboard,
  Globe,
  Mail,
  Building2,
  Upload,
  Eye,
  DollarSign,
  Info,
  Star,
  Flag,
  History,
  AlertCircle,
  BarChart3,
  CheckSquare,
  Reply
} from "lucide-react";

interface Document {
  name: string;
  type: string;
  data: string;
}

interface ApplicationLog {
  status: string;
  timestamp: string;
  note: string;
}

interface Message {
  sender: string;
  role?: string;
  text: string;
  timestamp: string;
}

interface TenderApplication {
  id: string;
  tender_name: string;
  organisation_name: string;
  website: string;
  contact_person: string;
  email: string;
  country: string;
  team_size: string;
  past_experience: string;
  venue: string;
  budget: string;
  document_url: string;
  status: "Pending" | "Under Review" | "Awarded" | "Rejected";
  created_at: string;
  messages: Message[];
  // NEW MANAGEMENT FIELDS
  rating_score: number; // 1-5 rating
  review_notes: string;
  approved_by: string;
  metadata?: any;
  logs: ApplicationLog[];
}

interface Tender {
  id: string;
  title: string;
  type: string;
  location: string;
  deadline: string;
  status: "Open" | "Under Review" | "Awarded" | "Closed";
  description: string;
  requirements: string;
  budget: string;
}

const initialTenders: Tender[] = [
  { 
    id: "TND-001", 
    title: "Regional Finals - Southeast Asia", 
    type: "Regional Finals", 
    location: "Singapore", 
    deadline: "30 May 2026", 
    status: "Open", 
    description: "Host the Southeast Asian Regional Finals bringing together winners from 10 countries across the region.",
    requirements: "International event experience. Multi-language support. Venue for 300+ participants. Travel and accommodation coordination capability.",
    budget: "$150,000"
  },
  { 
    id: "TND-002", 
    title: "National AI Olympiad 2026 - United Kingdom", 
    type: "National Olympiad", 
    location: "London, UK", 
    deadline: "15 Jun 2026", 
    status: "Open", 
    description: "Organise the UK National AI Olympiad 2026. The event will host 500+ students from across the United Kingdom competing in AI challenges.",
    requirements: "Must have experience organising national-level competitions. Venue capacity of 500+. Strong partnership with local educational institutions.",
    budget: "$80,000"
  },
];

export default function TendersPage() {
  const { user, addNotification } = useAuth();
  const [viewMode, setViewMode] = useState<"BROWSE" | "ADMIN">("BROWSE");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [applications, setApplications] = useState<TenderApplication[]>([]);
  
  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [selectedApp, setSelectedApp] = useState<TenderApplication | null>(null);
  const [adminTab, setAdminTab] = useState<"DETAILS" | "DOCUMENTS" | "CHAT" | "LOGS">("DETAILS");

  // Form States
  const [applyForm, setApplyForm] = useState({ 
    organisation_name: "", 
    website: "", 
    contact_person: "", 
    email: "", 
    country: "", 
    team_size: "", 
    past_experience: "", 
    venue: "", 
    budget: "",
    metadata: ""
  });
  const [uploadedDocUrl, setUploadedDocUrl] = useState("");
  const [tenderForm, setTenderForm] = useState<Tender>({ id: "", title: "", type: "National Olympiad", location: "", deadline: "", status: "Open", description: "", requirements: "", budget: "" });
  const [chatMessage, setChatMessage] = useState("");

  // Load Data
  useEffect(() => {
    const savedTenders = localStorage.getItem('gaio_tenders_v5');
    const savedApps = localStorage.getItem('gaio_tender_apps_v5');
    if (savedTenders) setTenders(JSON.parse(savedTenders)); else setTenders(initialTenders);
    if (savedApps) setApplications(JSON.parse(savedApps));
  }, []);

  // Sync Data
  useEffect(() => {
    if (tenders.length > 0) localStorage.setItem('gaio_tenders_v5', JSON.stringify(tenders));
    localStorage.setItem('gaio_tender_apps_v5', JSON.stringify(applications));
  }, [tenders, applications]);

  // Actions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // For prototype, we just use the name as a dummy URL
      setUploadedDocUrl(`https://gaio-storage.local/${e.target.files[0].name}`);
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender) return;

    let parsedMetadata = {};
    try {
      if (applyForm.metadata) {
        parsedMetadata = JSON.parse(applyForm.metadata);
      }
    } catch (e) {
      alert("Invalid JSON in metadata field");
      return;
    }

    const newApp: TenderApplication = {
      id: `APP-${Date.now()}`,
      tender_name: selectedTender.title,
      ...applyForm,
      document_url: uploadedDocUrl || "https://gaio-storage.local/default.pdf",
      status: "Pending",
      created_at: new Date().toISOString().split('T')[0],
      messages: [],
      rating_score: 0,
      review_notes: "",
      approved_by: "",
      metadata: parsedMetadata,
      logs: [{ status: "Pending", timestamp: new Date().toLocaleString(), note: "Application submitted via public portal." }]
    };
    setApplications([...applications, newApp]);
    setIsApplyModalOpen(false);
    setApplyForm({ 
      organisation_name: "", 
      website: "", 
      contact_person: "", 
      email: "", 
      country: "", 
      team_size: "", 
      past_experience: "", 
      venue: "", 
      budget: "",
      metadata: ""
    });
    setUploadedDocUrl("");
    alert("Application submitted successfully!");
  };

  const handleUpdateAppStatus = (appId: string, status: TenderApplication['status']) => {
    const logEntry = { status, timestamp: new Date().toLocaleString(), note: `Status updated to ${status} by ${user?.name || 'Administrator'}.` };
    const updatedApps = applications.map(app => app.id === appId ? { 
      ...app, 
      status, 
      approved_by: status === 'Awarded' ? (user?.name || 'Admin') : app.approved_by,
      logs: [...app.logs, logEntry] 
    } : app);
    setApplications(updatedApps);
    if (selectedApp?.id === appId) setSelectedApp({ ...selectedApp, status, logs: [...selectedApp.logs, logEntry] });
    
    if (status === "Awarded") {
      const app = applications.find(a => a.id === appId);
      if (app) setTenders(tenders.map(t => t.title === app.tender_name ? { ...t, status: "Awarded" } : t));
    }
  };

  const updateAppField = (appId: string, field: keyof TenderApplication, value: any) => {
    const updatedApps = applications.map(app => app.id === appId ? { ...app, [field]: value } : app);
    setApplications(updatedApps);
    if (selectedApp?.id === appId) setSelectedApp({ ...selectedApp, [field]: value });
  };

  const handleCreateTender = (e: React.FormEvent) => {
    e.preventDefault();
    const newTender = { ...tenderForm, id: `TND-${Date.now()}` };
    setTenders([...tenders, newTender]);
    setIsAddModalOpen(false);
    setTenderForm({ id: "", title: "", type: "National Olympiad", location: "", deadline: "", status: "Open", description: "", requirements: "", budget: "" });
  };

  const updateTenderField = (tenderId: string, field: keyof Tender, value: any) => {
    const updatedTenders = tenders.map(t => t.id === tenderId ? { ...t, [field]: value } : t);
    setTenders(updatedTenders);
    if (selectedTender?.id === tenderId) setSelectedTender({ ...selectedTender, [field]: value });
  };

  const sendChatMessage = (customText?: string) => {
    const text = customText || chatMessage;
    if (!text || !selectedApp || !user) return;
    const msg: Message = { 
      sender: user.name, 
      role: user.roles?.[0] || user.role,
      text, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    const updatedApp = { ...selectedApp, messages: [...selectedApp.messages, msg] };
    setApplications(applications.map(a => a.id === selectedApp.id ? updatedApp : a));
    setSelectedApp(updatedApp);
    addNotification(`New message to ${selectedApp.organisation_name}`, "Tender Management");
    setChatMessage("");
  };

  const adminStats = {
    total: tenders.length,
    open: tenders.filter(t => t.status === "Open").length,
    apps: applications.length,
    shortlisted: applications.filter(a => a.rating_score >= 4).length
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500" />
            GAIO Tender Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            {viewMode === "BROWSE" ? "Apply to organise official Global AI Olympiad events." : "Manage event opportunities and verify incoming organiser proposals."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode(viewMode === "BROWSE" ? "ADMIN" : "BROWSE")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-sm font-black text-gray-700 dark:text-zinc-300 hover:bg-gray-200 transition-all">
            {viewMode === "BROWSE" ? <LayoutDashboard className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            {viewMode === "BROWSE" ? "Admin Command Center" : "Public Browse View"}
          </button>
          {viewMode === "ADMIN" && (
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-500 shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4" /> Create Tender
            </button>
          )}
        </div>
      </div>

      {viewMode === "BROWSE" ? (
        /* PUBLIC VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          {tenders.filter(t => t.status === "Open").map((tender) => (
            <div key={tender.id} className="group relative bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 hover:border-blue-500 transition-all hover:shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest border border-green-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  {tender.status}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tender.type}</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">{tender.title}</h2>
              <div className="flex flex-wrap gap-4 mb-6 text-xs text-gray-500 font-bold">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {tender.location}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Deadline: {tender.deadline}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-8">{tender.description}</p>
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 mb-8 border dark:border-zinc-800">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Organiser Requirements</h4>
                <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed font-medium">{tender.requirements}</p>
              </div>
              <button onClick={() => { setSelectedTender(tender); setIsApplyModalOpen(true); }} className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white dark:bg-white dark:text-black rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group-hover:shadow-xl">
                Apply for This Tender <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* ADMIN VIEW */
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Active Tenders", value: adminStats.open, icon: Trophy, color: "text-amber-500" },
              { label: "Total Applications", value: adminStats.apps, icon: FileText, color: "text-blue-500" },
              { label: "High Rating", value: adminStats.shortlisted, icon: Flag, color: "text-green-500" },
              { label: "Pending Review", value: applications.filter(a => a.status === 'Pending').length, icon: AlertCircle, color: "text-purple-500" }
            ].map(stat => (
              <div key={stat.label} className="p-6 rounded-[2rem] border dark:border-zinc-800 bg-white dark:bg-[#111] shadow-sm">
                <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Tender Registry */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2"><Briefcase className="h-6 w-6 text-blue-600" /> Active Opportunities</h3>
              </div>
              <div className="bg-white dark:bg-[#111] rounded-[2rem] border dark:border-zinc-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-zinc-900/20 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Opportunity</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Apps</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-800">
                    {tenders.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white text-sm">{t.title}</div>
                          <div className="text-[10px] text-gray-500 font-medium">{t.location} • {t.budget}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${t.status === 'Open' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{t.status}</span>
                        </td>
                        <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-xs font-black text-blue-600"><Users className="h-3 w-3" />{applications.filter(a => a.tender_name === t.title).length}</span></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setSelectedTender(t); setIsManageModalOpen(true); setSelectedApp(null); }} className="text-blue-600 hover:text-blue-500 text-xs font-black uppercase tracking-widest">Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Top Applicants */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2"><Flag className="h-6 w-6 text-green-600" /> High Potential</h3>
              <div className="space-y-4">
                {applications.filter(a => a.rating_score >= 4).length === 0 && (
                  <div className="p-10 text-center border-2 border-dashed rounded-[2rem] dark:border-zinc-800">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No High Rated Applicants</p>
                  </div>
                )}
                {applications.filter(a => a.rating_score >= 4).map(app => (
                  <div key={app.id} className="p-5 rounded-2xl bg-white dark:bg-[#111] border dark:border-zinc-800 flex items-center justify-between group hover:border-blue-500 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-black">{app.organisation_name.charAt(0)}</div>
                      <div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[120px]">{app.organisation_name}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`h-2.5 w-2.5 ${i < app.rating_score ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedApp(app); setIsManageModalOpen(true); setAdminTab("DETAILS"); }} className="p-2 bg-gray-50 dark:bg-zinc-900 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><ArrowRight className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN COMMAND HUB */}
      {isManageModalOpen && (selectedApp || selectedTender) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl border dark:border-zinc-800 flex flex-col">
            <div className="p-8 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-6">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-xl ${selectedApp ? 'bg-blue-600' : 'bg-amber-600'}`}>
                  {selectedApp ? <ShieldCheck className="h-8 w-8" /> : <Trophy className="h-8 w-8" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-2">{selectedApp ? selectedApp.organisation_name : selectedTender?.title}</h2>
                  <div className="flex items-center gap-3">
                    {selectedApp && (
                      <div className="flex items-center gap-1 mr-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} onClick={() => updateAppField(selectedApp.id, 'rating_score', i + 1)} className={`h-4 w-4 cursor-pointer transition-transform hover:scale-125 ${i < selectedApp.rating_score ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{selectedApp ? "Proposal Evaluation" : "Tender Orchestration"}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => { setIsManageModalOpen(false); setSelectedApp(null); }} className="p-3 rounded-full hover:bg-white dark:hover:bg-zinc-800 text-gray-400 transition-colors"><X className="h-8 w-8" /></button>
            </div>

            {selectedApp && (
              <div className="flex px-10 border-b dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
                {[
                  { id: "DETAILS", icon: Info, label: "Proposal Analysis" },
                  { id: "DOCUMENTS", icon: FileText, label: "Verification Assets" },
                  { id: "CHAT", icon: MessageSquare, label: "Direct Communication" },
                  { id: "LOGS", icon: History, label: "System Audit Logs" }
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setAdminTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-5 text-sm font-black transition-all border-b-2 ${adminTab === tab.id ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-zinc-300"}`}>
                    <tab.icon className="h-4 w-4" /> {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-10 bg-white dark:bg-[#0a0a0a]">
              {selectedApp ? (
                <div className="animate-in fade-in duration-300">
                  {adminTab === "DETAILS" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-2 space-y-10">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          {[
                            { l: "Contact", v: selectedApp.contact_person, i: Users },
                            { l: "Email", v: selectedApp.email, i: Mail },
                            { l: "Country", v: selectedApp.country, i: MapPin },
                            { l: "Proposed Venue", v: selectedApp.venue, i: Building2 },
                            { l: "Budget Capability", v: selectedApp.budget, i: DollarSign },
                            { l: "Team Size", v: selectedApp.team_size, i: BarChart3 }
                          ].map(it => (
                            <div key={it.l} className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{it.l}</p>
                              <p className="text-sm font-black text-gray-900 dark:text-white truncate">{it.v || 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-6">
                          <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Organiser Experience & Proposal</h4>
                          <div className="p-8 rounded-3xl bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 text-sm font-medium leading-relaxed text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">{selectedApp.past_experience}</div>
                        </div>
                        {selectedApp.metadata && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Metadata</h4>
                            <pre className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 text-xs font-mono">
                              {JSON.stringify(selectedApp.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      <div className="space-y-8">
                        <div className="p-8 rounded-3xl bg-blue-600 text-white shadow-xl relative overflow-hidden">
                          <CheckSquare className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
                          <h4 className="text-lg font-black mb-4">Administration Notes</h4>
                          <textarea value={selectedApp.review_notes} onChange={e => updateAppField(selectedApp.id, 'review_notes', e.target.value)} placeholder="Private internal evaluation notes..." className="w-full bg-white/10 border-white/20 rounded-2xl p-4 text-xs font-bold placeholder:text-blue-200 h-40 focus:ring-0 outline-none" />
                        </div>
                        {selectedApp.approved_by && (
                          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50">
                            <p className="text-[10px] font-black text-green-600 uppercase">Approved By</p>
                            <p className="text-sm font-black text-green-700 dark:text-green-400">{selectedApp.approved_by}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => handleUpdateAppStatus(selectedApp.id, 'Awarded')} className="py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-500 shadow-xl transition-all">Award Tender</button>
                          <button onClick={() => handleUpdateAppStatus(selectedApp.id, 'Rejected')} className="py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 shadow-xl transition-all">Reject</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {adminTab === "DOCUMENTS" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 rounded-3xl border dark:border-zinc-800 bg-white dark:bg-[#111] hover:shadow-xl transition-all group relative overflow-hidden">
                        <FileText className="h-10 w-10 text-blue-600 mb-4" />
                        <h5 className="font-black text-gray-900 dark:text-white text-sm truncate">Main Application Proposal</h5>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-6">PDF Document</p>
                        <a href={selectedApp.document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"><Eye className="h-4 w-4" /> Open Verification Doc</a>
                      </div>
                    </div>
                  )}

                  {adminTab === "CHAT" && (
                    <div className="h-[550px] flex gap-10">
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 bg-[#efe7de] dark:bg-zinc-950/50 rounded-[2.5rem] border dark:border-zinc-800 p-8 overflow-y-auto mb-6 shadow-inner">
                          {selectedApp.messages.map((m, i) => {
                            const isMe = m.sender === user?.name;
                            return (
                              <div key={i} className={`flex flex-col mb-6 ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`p-5 rounded-3xl max-w-[85%] text-sm font-bold shadow-sm ${
                                  isMe 
                                  ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none dark:bg-blue-900/40 dark:text-blue-50' 
                                  : 'bg-white text-gray-900 dark:text-white rounded-tl-none border dark:border-zinc-800 dark:bg-zinc-900'
                                }`}>
                                  {m.text}
                                </div>
                                <div className={`mt-2 flex items-center gap-2 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                  <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">{m.sender}</span>
                                  <span className="text-[10px] text-gray-400">•</span>
                                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{m.role?.replace('_', ' ')}</span>
                                  <span className="text-[10px] text-gray-400">•</span>
                                  <span className="text-[9px] font-bold text-gray-400">{m.timestamp}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-4">
                          <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChatMessage()} placeholder="Type your message to the applicant..." className="flex-1 bg-white dark:bg-[#111] border dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 focus:ring-blue-600 outline-none shadow-sm" />
                          <button onClick={() => sendChatMessage()} className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20"><Send className="h-6 w-6" /></button>
                        </div>
                      </div>
                      <div className="w-64 space-y-4">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Quick Responses</h5>
                        {[
                          "Request detailed venue floorplan.",
                          "Please upload past event certificates.",
                          "Schedule technical review meeting.",
                          "Proposal accepted for next round.",
                          "Clarification needed on budget."
                        ].map(q => (
                          <button key={q} onClick={() => sendChatMessage(q)} className="w-full p-4 text-left rounded-2xl border dark:border-zinc-800 text-[10px] font-bold text-gray-600 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-600 transition-all bg-white dark:bg-zinc-900 shadow-sm">{q}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {adminTab === "LOGS" && (
                    <div className="space-y-4">
                      {selectedApp.logs.map((log, i) => (
                        <div key={i} className="flex items-start gap-6 p-6 rounded-3xl bg-gray-50 dark:bg-zinc-950 border dark:border-zinc-800 relative overflow-hidden">
                          <div className="h-full w-1 bg-blue-600 absolute left-0 top-0" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{log.status}</span>
                            <p className="text-sm font-black text-gray-900 dark:text-white mb-2">{log.note}</p>
                            <span className="text-[10px] text-gray-400 font-bold">{log.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* TENDER CONFIG */
                <div className="max-w-2xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black">Opportunity Orchestration</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tender Title</label>
                        <input value={selectedTender?.title || ""} onChange={e => updateTenderField(selectedTender!.id, 'title', e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-black" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Budget</label>
                          <input value={selectedTender?.budget || ""} onChange={e => updateTenderField(selectedTender!.id, 'budget', e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-black" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deadline</label>
                          <input value={selectedTender?.deadline || ""} onChange={e => updateTenderField(selectedTender!.id, 'deadline', e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-black" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opportunity Status</label>
                        <select value={selectedTender?.status} onChange={e => updateTenderField(selectedTender!.id, 'status', e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-black">
                          <option>Open</option>
                          <option>Under Review</option>
                          <option>Awarded</option>
                          <option>Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="pt-10 border-t dark:border-zinc-800 flex justify-between items-center">
                    <button onClick={() => { if(confirm("Permanently delete this opportunity?")) setTenders(tenders.filter(t => t.id !== selectedTender?.id)); setIsManageModalOpen(false); }} className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /> Wipe from System</button>
                    <button onClick={() => setIsManageModalOpen(false)} className="px-10 py-4 bg-gray-900 text-white dark:bg-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Apply Changes</button>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t dark:border-zinc-800 text-center bg-gray-50/50 dark:bg-zinc-900/50"><span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">GAIO Global Orchestration Hub • End-to-End Encryption Active</span></div>
          </div>
        </div>
      )}

      {/* PUBLIC APPLY MODAL */}
      {isApplyModalOpen && selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0a0a] rounded-3xl p-10 shadow-2xl border dark:border-zinc-800">
            <div className="flex justify-between items-center mb-8 pb-6 border-b dark:border-zinc-800">
              <div><h2 className="text-2xl font-black text-gray-900 dark:text-white">Formal Tender Application</h2><p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">{selectedTender.title}</p></div>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleApply} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Organisation Name *</label><input required value={applyForm.organisation_name} onChange={e => setApplyForm({...applyForm, organisation_name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Website</label><div className="relative"><Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="url" placeholder="https://" value={applyForm.website} onChange={e => setApplyForm({...applyForm, website: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 pl-12 text-sm font-bold" /></div></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Person *</label><input required value={applyForm.contact_person} onChange={e => setApplyForm({...applyForm, contact_person: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email *</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input required type="email" value={applyForm.email} onChange={e => setApplyForm({...applyForm, email: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 pl-12 text-sm font-bold" /></div></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Country *</label><input required value={applyForm.country} onChange={e => setApplyForm({...applyForm, country: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Size</label><input type="number" value={applyForm.team_size} onChange={e => setApplyForm({...applyForm, team_size: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" /></div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Past Experience *</label><textarea required rows={3} value={applyForm.past_experience} onChange={e => setApplyForm({...applyForm, past_experience: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-medium" placeholder="Describe past events..." /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Proposed Venue</label><input value={applyForm.venue} onChange={e => setApplyForm({...applyForm, venue: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Budget</label><input value={applyForm.budget} onChange={e => setApplyForm({...applyForm, budget: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" /></div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metadata (JSON)</label><textarea value={applyForm.metadata} onChange={e => setApplyForm({...applyForm, metadata: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" placeholder='{"key": "value"}' rows={2} /></div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Supporting Documents</label>
                <div className="p-8 border-2 border-dashed dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center bg-gray-50/50 dark:bg-zinc-950/50 relative">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-xs font-bold text-gray-500 uppercase">Click to upload (PDF, DOCX — max 5MB)</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                </div>
                {uploadedDocUrl && <div className="flex flex-wrap gap-2"><div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black uppercase"><FileText className="h-3 w-3" /> {uploadedDocUrl.split('/').pop()}<X className="h-3 w-3 cursor-pointer" onClick={() => setUploadedDocUrl("")} /></div></div>}
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-blue-500 shadow-2xl transition-all">Submit Application</button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TENDER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-3xl p-10 shadow-2xl border dark:border-zinc-800">
            <h2 className="text-2xl font-black mb-8 pb-6 border-b dark:border-zinc-800">Create New Event Tender</h2>
            <form onSubmit={handleCreateTender} className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase">Title</label><input required placeholder="e.g. National AI Olympiad 2026" value={tenderForm.title} onChange={e => setTenderForm({...tenderForm, title: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" /></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase">Location</label><input required placeholder="London, UK" value={tenderForm.location} onChange={e => setTenderForm({...tenderForm, location: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase">Deadline</label><input required placeholder="15 Jun 2026" value={tenderForm.deadline} onChange={e => setTenderForm({...tenderForm, deadline: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" /></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase">Type</label><select value={tenderForm.type} onChange={e => setTenderForm({...tenderForm, type: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold"><option>National Olympiad</option><option>Regional Finals</option><option>Global Grand Final</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase">Budget</label><input placeholder="$80,000" value={tenderForm.budget} onChange={e => setTenderForm({...tenderForm, budget: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold" /></div>
              </div>
              <textarea rows={3} placeholder="Full Description..." value={tenderForm.description} onChange={e => setTenderForm({...tenderForm, description: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-medium" />
              <button type="submit" className="w-full py-5 bg-gray-900 text-white dark:bg-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all">Publish Opportunity</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
