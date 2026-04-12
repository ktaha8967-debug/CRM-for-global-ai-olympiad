"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Building2, 
  Plus, 
  X, 
  MessageSquare, 
  FileText, 
  PenTool, 
  Send, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Briefcase,
  ExternalLink,
  ShieldCheck,
  Zap,
  DollarSign,
  Upload,
  Eye,
  Eraser,
  Download,
  FileSearch,
  Reply
} from "lucide-react";

interface Message {
  id: string;
  sender: string;
  role?: string;
  text: string;
  timestamp: string;
}

interface Contract {
  id: string;
  title: string;
  status: "Draft" | "Pending Signature" | "Signed";
  content: string;
  createdAt: string;
  signedAt?: string;
  signatureData?: string; // Base64 signature image
  fileData?: string; // Base64/DataURL for PDF or other files
  fileType?: string;
}

interface Plan {
  id: string;
  name: string;
  details: string;
  cost: string;
  status: "Proposed" | "Accepted" | "Rejected";
}

interface Sponsor {
  id: string;
  name: string;
  tier: string;
  industry: string;
  funding: string;
  status: string;
  plans: Plan[];
  contracts: Contract[];
  messages: Message[];
}

const initialSponsors: Sponsor[] = [
  { 
    id: "S-1", 
    name: "Global AI Tech", 
    tier: "Global Strategic Partner", 
    industry: "Technology", 
    funding: "$500,000", 
    status: "Active",
    plans: [
      { id: "P-1", name: "AI Summit Sponsorship", details: "Main stage branding and 10 VIP passes", cost: "$50,000", status: "Accepted" }
    ],
    contracts: [
      { id: "C-1", title: "Master Partnership Agreement", status: "Signed", content: "Terms and conditions for global partnership...", createdAt: "2026-01-15", signedAt: "2026-01-20" }
    ],
    messages: [
      { id: "M-1", sender: "Super Admin", role: "SUPER_ADMIN", text: "Welcome to GAIO, looking forward to our collaboration.", timestamp: "10:30 AM" }
    ]
  },
  { 
    id: "S-2", 
    name: "Future Finance", 
    tier: "Innovation Partner", 
    industry: "Finance", 
    funding: "$250,000", 
    status: "Active",
    plans: [],
    contracts: [],
    messages: []
  },
];

export default function SponsorsPage() {
  const { user, addNotification } = useAuth();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", tier: "Technology Partner", industry: "", funding: "" });

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [manageData, setManageData] = useState<Sponsor | null>(null);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "PLANS" | "CONTRACTS" | "CHAT">("OVERVIEW");

  // Contract/Signature States
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isViewingContract, setIsViewingContract] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Input states
  const [newPlan, setNewPlan] = useState({ name: "", details: "", cost: "" });
  const [newContract, setNewContract] = useState({ title: "", content: "" });
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('gaio_sponsors');
    if (saved) {
      setSponsors(JSON.parse(saved));
    } else {
      setSponsors(initialSponsors);
    }
  }, []);

  useEffect(() => {
    if (sponsors.length > 0) {
      localStorage.setItem('gaio_sponsors', JSON.stringify(sponsors));
    }
  }, [sponsors]);

  const saveToStore = (data: Sponsor[]) => {
    setSponsors(data);
    localStorage.setItem('gaio_sponsors', JSON.stringify(data));
  };

  const updateSponsor = (updatedSponsor: Sponsor) => {
    const newSponsors = sponsors.map(s => s.id === updatedSponsor.id ? updatedSponsor : s);
    setSponsors(newSponsors);
    setManageData(updatedSponsor);
    localStorage.setItem('gaio_sponsors', JSON.stringify(newSponsors));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newSponsor: Sponsor = {
      id: `S-${Date.now()}`,
      name: formData.name,
      tier: formData.tier,
      industry: formData.industry || "General",
      funding: formData.funding || "TBD",
      status: "Pending",
      plans: [],
      contracts: [],
      messages: []
    };

    saveToStore([newSponsor, ...sponsors]);
    setFormData({ name: "", tier: "Technology Partner", industry: "", funding: "" });
    setIsModalOpen(false);
  };

  const handleOpenManage = (sponsor: Sponsor) => {
    setManageData(sponsor);
    setIsManageOpen(true);
    setActiveTab("OVERVIEW");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this partner?")) {
      saveToStore(sponsors.filter((s) => s.id !== id));
      setIsManageOpen(false);
    }
  };

  // Plan Actions
  const addPlan = () => {
    if (!newPlan.name || !manageData) return;
    const plan: Plan = {
      id: `P-${Date.now()}`,
      ...newPlan,
      status: "Proposed"
    };
    updateSponsor({ ...manageData, plans: [...manageData.plans, plan] });
    setNewPlan({ name: "", details: "", cost: "" });
  };

  const updatePlanStatus = (planId: string, status: Plan['status']) => {
    if (!manageData) return;
    const updatedPlans = manageData.plans.map(p => p.id === planId ? { ...p, status } : p);
    updateSponsor({ ...manageData, plans: updatedPlans });
  };

  // Contract Actions
  const createContract = () => {
    if (!newContract.title || !manageData) return;
    const contract: Contract = {
      id: `C-${Date.now()}`,
      title: newContract.title,
      status: "Draft",
      content: newContract.content || "Placeholder contract content. This agreement outlines the terms of sponsorship between GAIO and the partner organisation...",
      createdAt: new Date().toISOString().split('T')[0]
    };
    updateSponsor({ ...manageData, contracts: [...manageData.contracts, contract] });
    setNewContract({ title: "", content: "" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && manageData) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const fileData = event.target?.result as string;
        const contract: Contract = {
          id: `C-${Date.now()}`,
          title: file.name,
          status: "Draft",
          content: `Attached File: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type}`,
          createdAt: new Date().toISOString().split('T')[0],
          fileData: fileData,
          fileType: file.type
        };
        updateSponsor({ ...manageData, contracts: [...manageData.contracts, contract] });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const openPdf = (contract: Contract) => {
    if (contract.fileData) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Viewing ${contract.title}</title></head>
            <body style="margin:0; padding:0; height:100vh;">
              <iframe src="${contract.fileData}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>
            </body>
          </html>
        `);
      }
    } else {
      alert("No PDF file attached to this contract record.");
    }
  };

  // Signature Canvas Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && selectedContract && manageData) {
      const signatureData = canvas.toDataURL();
      const updatedContracts = manageData.contracts.map(c => 
        c.id === selectedContract.id ? { 
          ...c, 
          status: "Signed" as const, 
          signedAt: new Date().toISOString().split('T')[0],
          signatureData 
        } : c
      );
      updateSponsor({ ...manageData, contracts: updatedContracts });
      setIsSignModalOpen(false);
      setSelectedContract(null);
    }
  };

  // Message Actions
  const sendMessage = () => {
    if (!newMessage || !manageData || !user) return;
    const msg: Message = {
      id: `M-${Date.now()}`,
      sender: user.name,
      role: user.roles?.[0] || user.role,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    updateSponsor({ ...manageData, messages: [...manageData.messages, msg] });
    addNotification(`New message to ${manageData.name}`, "Sponsors & Partners");
    setNewMessage("");
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Sponsors & Partners</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Manage corporate partnerships, discuss plans, and execute hand-signed legal contracts.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Partner
          </button>
        </div>
      </div>

      {/* Sponsor Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#111] hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 mb-4">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{sponsor.name}</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1 truncate">{sponsor.tier}</p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-500 dark:text-zinc-400 font-medium tracking-tight">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  sponsor.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>{sponsor.status}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-zinc-400">Active Plans</span>
                <span className="text-gray-900 dark:text-white font-black">{sponsor.plans.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-zinc-400">Contracts</span>
                <span className="text-gray-900 dark:text-white font-black">{sponsor.contracts.length}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
              <button onClick={() => handleOpenManage(sponsor)} className="text-sm font-black text-blue-600 hover:text-blue-500 dark:text-blue-400">Manage Hub</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-[#111] dark:border dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Partner</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Company Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Tier</label>
                  <select value={formData.tier} onChange={(e) => setFormData({...formData, tier: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800">
                    <option value="Global Strategic Partner">Global Strategic Partner</option>
                    <option value="Innovation Partner">Innovation Partner</option>
                    <option value="Technology Partner">Technology Partner</option>
                    <option value="Education Partner">Education Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Industry</label>
                  <input type="text" value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Funding Amount</label>
                  <input type="text" placeholder="e.g. $100,000" value={formData.funding} onChange={(e) => setFormData({...formData, funding: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Save Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advanced Partner Management Hub */}
      {isManageOpen && manageData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#0a0a0a] dark:border dark:border-zinc-800 flex flex-col">
            {/* Nav Header */}
            <div className="p-8 border-b dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">{manageData.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{manageData.tier}</span>
                    <span className="text-gray-300 dark:text-zinc-700">|</span>
                    <span className="text-xs text-gray-500 font-medium">{manageData.industry}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => handleDelete(manageData.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                  <Trash2 className="h-5 w-5" />
                </button>
                <button onClick={() => setIsManageOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex px-8 border-b dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
              {[
                { id: "OVERVIEW", icon: Clock, label: "Partner Overview" },
                { id: "PLANS", icon: Zap, label: "Strategy & Plans" },
                { id: "CONTRACTS", icon: FileText, label: "Contracts & Legal" },
                { id: "CHAT", icon: MessageSquare, label: "Communication" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-5 text-sm font-black transition-all border-b-2 ${
                    activeTab === tab.id 
                    ? "text-blue-600 border-blue-600" 
                    : "text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-zinc-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10">
              {activeTab === "OVERVIEW" && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: "Status", value: manageData.status, icon: ShieldCheck, color: "text-green-500" },
                      { label: "Total Funding", value: manageData.funding, icon: DollarSign, color: "text-blue-600" },
                      { label: "Active Plans", value: manageData.plans.length, icon: Zap, color: "text-purple-600" },
                      { label: "Signed Documents", value: manageData.contracts.filter(c => c.status === 'Signed').length, icon: FileText, color: "text-amber-600" }
                    ].map((stat) => (
                      <div key={stat.label} className="p-6 rounded-2xl border dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
                        <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h3 className="text-lg font-black flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        Quick Profile Edit
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Partner Status</label>
                          <select 
                            value={manageData.status} 
                            onChange={(e) => updateSponsor({...manageData, status: e.target.value})}
                            className="w-full mt-1 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-3 text-sm font-bold"
                          >
                            <option>Active</option>
                            <option>Pending</option>
                            <option>Inactive</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Tier Level</label>
                          <select 
                            value={manageData.tier} 
                            onChange={(e) => updateSponsor({...manageData, tier: e.target.value})}
                            className="w-full mt-1 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-3 text-sm font-bold"
                          >
                            <option>Global Strategic Partner</option>
                            <option>Innovation Partner</option>
                            <option>Technology Partner</option>
                            <option>Education Partner</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-blue-600 text-white relative overflow-hidden group">
                      <Zap className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-black mb-2">Strategy Summary</h3>
                      <p className="text-sm text-blue-100 mb-6 leading-relaxed">
                        This partner is critical for the upcoming AI World Expo. We are focusing on technology integration and strategic funding for the main stadium.
                      </p>
                      <button className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 py-2 px-4 rounded-full transition-all">
                        <ExternalLink className="h-3.5 w-3.5" /> View Full Dossier
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "PLANS" && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="p-8 rounded-3xl border dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/20">
                    <h3 className="text-lg font-black mb-6">Propose New Sponsorship Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Plan Name</label>
                        <input 
                          type="text" 
                          value={newPlan.name}
                          onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                          placeholder="e.g. Platinum Branding" 
                          className="w-full bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl p-3 text-sm font-bold" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Cost / Funding</label>
                        <input 
                          type="text" 
                          value={newPlan.cost}
                          onChange={(e) => setNewPlan({...newPlan, cost: e.target.value})}
                          placeholder="e.g. $25,000" 
                          className="w-full bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl p-3 text-sm font-bold" 
                        />
                      </div>
                      <button 
                        onClick={addPlan}
                        className="h-12 mt-auto bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
                      >
                        Submit Proposal
                      </button>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Full Plan Details</label>
                        <textarea 
                          value={newPlan.details}
                          onChange={(e) => setNewPlan({...newPlan, details: e.target.value})}
                          placeholder="Describe the deliverables, exposure, and benefits..."
                          className="w-full bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl p-3 text-sm font-medium h-24"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {manageData.plans.map((plan) => (
                      <div key={plan.id} className="p-6 rounded-3xl border dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] group hover:border-blue-500 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-black text-gray-900 dark:text-white">{plan.name}</h4>
                            <span className="text-xs font-bold text-blue-600">{plan.cost}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                            plan.status === 'Accepted' ? 'bg-green-100 text-green-700' : 
                            plan.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {plan.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-zinc-500 mb-6 leading-relaxed">
                          {plan.details}
                        </p>
                        <div className="flex gap-3 pt-4 border-t dark:border-zinc-900">
                          <button 
                            onClick={() => updatePlanStatus(plan.id, 'Accepted')}
                            className="flex-1 py-2 rounded-lg bg-green-50 text-green-700 text-[10px] font-black uppercase hover:bg-green-100 transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => updatePlanStatus(plan.id, 'Rejected')}
                            className="flex-1 py-2 rounded-lg bg-red-50 text-red-700 text-[10px] font-black uppercase hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "CONTRACTS" && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                  {/* Create/Upload Section */}
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="flex-1 space-y-6">
                      <h3 className="text-xl font-black">Draft New Agreement</h3>
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          value={newContract.title}
                          onChange={(e) => setNewContract({...newContract, title: e.target.value})}
                          placeholder="Agreement Title..." 
                          className="w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                        <textarea 
                          value={newContract.content}
                          onChange={(e) => setNewContract({...newContract, content: e.target.value})}
                          placeholder="Contract content and legal terms..."
                          className="w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-3 text-sm font-medium h-32 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                        <button 
                          onClick={createContract}
                          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white dark:bg-white dark:text-black py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                        >
                          <PenTool className="h-4 w-4" /> Create Draft
                        </button>
                      </div>
                    </div>
                    <div className="w-full md:w-80 p-8 rounded-3xl border-2 border-dashed dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                      <Upload className="h-10 w-10 text-gray-300 mb-4" />
                      <h4 className="font-black text-gray-900 dark:text-white mb-2">Upload Legal Files</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-6 tracking-widest">PDF, DOCX (Max 10MB)</p>
                      <label className="cursor-pointer bg-blue-600/10 text-blue-600 py-3 px-6 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                        Browse Files
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                      </label>
                    </div>
                  </div>

                  {/* Contract List */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-black">Contract Registry</h3>
                    {manageData.contracts.map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between p-6 rounded-3xl border dark:border-zinc-800 bg-white dark:bg-[#111] hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-6">
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                            contract.status === 'Signed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 dark:text-white">{contract.title}</h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created: {contract.createdAt}</span>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                contract.status === 'Signed' ? 'text-green-600' : 'text-amber-600'
                              }`}>{contract.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {contract.fileData && (
                            <button 
                              onClick={() => openPdf(contract)}
                              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                              title="Open Original PDF"
                            >
                              <FileSearch className="h-5 w-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => { setSelectedContract(contract); setIsViewingContract(true); }}
                            className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl text-gray-600 hover:text-blue-600 transition-all"
                            title="View Document Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {contract.status !== 'Signed' && (
                            <button 
                              onClick={() => { setSelectedContract(contract); setIsSignModalOpen(true); }}
                              className="flex items-center gap-2 bg-blue-600 text-white py-2.5 px-6 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                            >
                              <PenTool className="h-4 w-4" /> Sign Digitally
                            </button>
                          )}
                          <button 
                            onClick={() => { if(confirm("Remove contract?")) updateSponsor({...manageData, contracts: manageData.contracts.filter(c => c.id !== contract.id)}); }}
                            className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "CHAT" && (
                <div className="h-[600px] flex flex-col animate-in zoom-in-95 duration-300">
                  <div className="flex-1 overflow-y-auto space-y-4 p-8 rounded-3xl border dark:border-zinc-800 bg-[#efe7de] dark:bg-zinc-950/20 mb-6 shadow-inner">
                    {manageData.messages.map((msg) => {
                      const isMe = msg.sender === user?.name;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold shadow-sm ${
                            isMe 
                            ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none dark:bg-blue-900/40 dark:text-blue-50' 
                            : 'bg-white text-gray-900 dark:text-white rounded-tl-none border dark:border-zinc-800 dark:bg-zinc-900'
                          }`}>
                            {msg.text}
                          </div>
                          <div className={`mt-1.5 flex items-center gap-2 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">{msg.sender}</span>
                            <span className="text-[10px] text-gray-400">•</span>
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{msg.role?.replace('_', ' ')}</span>
                            <span className="text-[10px] text-gray-400">•</span>
                            <span className="text-[9px] font-bold text-gray-400">{msg.timestamp}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Discuss strategy, ask questions, or confirm details..." 
                      className="flex-1 bg-white dark:bg-[#111] border dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none shadow-sm transition-all"
                    />
                    <button 
                      onClick={sendMessage}
                      className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/30"
                    >
                      <Send className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hub Footer */}
            <div className="p-4 border-t dark:border-zinc-800 text-center bg-gray-50/50 dark:bg-zinc-900/50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                GAIO Global Partner CRM • Secure Encrypted Connection
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contract Viewer Modal */}
      {isViewingContract && selectedContract && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border dark:border-zinc-800">
            <div className="p-6 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">{selectedContract.title}</h3>
              <div className="flex items-center gap-2">
                {selectedContract.fileData && (
                  <button 
                    onClick={() => openPdf(selectedContract)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500"
                  >
                    <ExternalLink className="h-3 w-3" /> View Source PDF
                  </button>
                )}
                <button onClick={() => setIsViewingContract(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X className="h-6 w-6" /></button>
              </div>
            </div>
            <div className="p-10 overflow-y-auto bg-white dark:bg-[#0a0a0a] prose dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-10 pb-6 border-b dark:border-zinc-800">
                <Building2 className="h-10 w-10 text-blue-600" />
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document ID</p>
                  <p className="text-sm font-bold">{selectedContract.id}</p>
                </div>
              </div>
              <div className="whitespace-pre-wrap font-serif leading-relaxed text-gray-700 dark:text-zinc-300">
                {selectedContract.content}
              </div>
              {selectedContract.signatureData && (
                <div className="mt-20 pt-10 border-t dark:border-zinc-800 flex justify-end">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Signed On {selectedContract.signedAt}</p>
                    <img src={selectedContract.signatureData} alt="Signature" className="h-20 w-auto bg-gray-50 dark:bg-zinc-900 p-2 rounded-xl" />
                    <div className="mt-2 h-0.5 w-40 bg-gray-900 dark:bg-white mx-auto"></div>
                    <p className="text-xs font-bold mt-2">Authorised Signatory</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t dark:border-zinc-800 flex justify-end gap-4 bg-gray-50 dark:bg-zinc-900/50">
              <button onClick={() => setIsViewingContract(false)} className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800">Close Viewer</button>
              {selectedContract.status !== 'Signed' && (
                <button 
                  onClick={() => { setIsViewingContract(false); setIsSignModalOpen(true); }}
                  className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                >
                  Proceed to Sign
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {isSignModalOpen && selectedContract && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 shadow-2xl border dark:border-zinc-800">
            <div className="text-center mb-8">
              <PenTool className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Digital Hand-Signature</h3>
              <p className="text-sm text-gray-500 mt-1">Draw your signature in the box below for <strong>{selectedContract.title}</strong></p>
            </div>

            <div className="relative bg-gray-50 dark:bg-zinc-900 rounded-2xl border-2 border-gray-100 dark:border-zinc-800 overflow-hidden cursor-crosshair">
              <canvas 
                ref={canvasRef}
                width={450}
                height={200}
                className="w-full h-[200px] touch-none"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={clearSignature} className="p-2 bg-white dark:bg-zinc-800 shadow-sm rounded-lg text-gray-500 hover:text-red-500 transition-colors" title="Clear Canvas">
                  <Eraser className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => { setIsSignModalOpen(false); setSelectedContract(null); }}
                className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={saveSignature}
                className="flex-1 py-4 rounded-2xl bg-gray-900 text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
              >
                Confirm & Sign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
