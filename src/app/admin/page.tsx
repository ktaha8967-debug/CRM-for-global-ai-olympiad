"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  Users, 
  Globe, 
  Mail, 
  Activity, 
  Database, 
  Settings, 
  Search, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Filter,
  MoreVertical,
  Key,
  X,
  Star,
  DollarSign
} from "lucide-react";

// Mock data for Admin Section
const initialSystemUsers = [
  { id: "U-1", name: "Super Admin", email: "admin@gaio.uk", roles: ["SUPER_ADMIN", "GLOBAL_ADMIN"], status: "Active", lastLogin: "Just Now" },
  { id: "U-X", name: "Alexander Vance", email: "a.vance@gaio.uk", password: "admin", roles: ["SUPER_ADMIN", "GLOBAL_ADMIN"], status: "Active", lastLogin: "Just Now" },
  { id: "U-S1", name: "Shaheer", email: "shr@gaio.com", password: "shaheer", roles: ["SUPER_ADMIN", "GLOBAL_ADMIN"], status: "Active", lastLogin: "Just Now" },
  { id: "U-Z1", name: "Zohaib", email: "zhb@gaio.com", password: "zohaib", roles: ["SUPER_ADMIN", "GLOBAL_ADMIN"], status: "Active", lastLogin: "Just Now" },
  { id: "U-2", name: "James Wilson", email: "james@teched.uk", roles: ["COUNTRY_DIRECTOR"], status: "Active", lastLogin: "1 hour ago" },
  { id: "U-3", name: "Sarah Jenkins", email: "s.jenkins@mit.edu", roles: ["VOLUNTEER_LEAD"], status: "Inactive", lastLogin: "3 days ago" },
  { id: "U-5", name: "Marco Rossi", email: "m.rossi@organiser.it", roles: ["ORGANISER", "EVENT_MANAGER"], status: "Active", lastLogin: "15 mins ago" },
];

const availableRoles = [
  "SUPER_ADMIN", "GLOBAL_ADMIN", "REGIONAL_COORDINATOR", "COUNTRY_DIRECTOR", 
  "VOLUNTEER_LEAD", "ORGANISER", "EVENT_MANAGER", "SPONSOR_PARTNER"
];

const systemModules = [
  "Global Dashboard",
  "Global Communication",
  "Global Mailbox",
  "Country Network",
  "Organiser Management",
  "Organiser Mailbox",
  "Sponsors & Partners",
  "Sponsor Mailbox",
  "Tender Management",
  "Event Management",
  "Volunteer Network",
  "Volunteer Mailbox",
  "Recognition",
  "Settings"
];

const initialAuditLogs = [
  { id: 1, user: "Super Admin", action: "System Infrastructure Initialized", time: "08:00 AM", severity: "INFO" },
  { id: 2, user: "Super Admin", action: "Global Security Matrix Online", time: "08:05 AM", severity: "HIGH" },
];

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'SUPER_ADMIN' && !user.roles?.includes('SUPER_ADMIN')))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.role !== 'SUPER_ADMIN' && !user.roles?.includes('SUPER_ADMIN'))) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="text-center space-y-6">
          <div className="h-24 w-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">Security Violation</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Restricted Access • Super Admin Only</p>
          <button 
            onClick={() => router.push('/')}
            className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105"
          >
            Back to Safe Zone
          </button>
        </div>
      </div>
    );
  }

  // USER MANAGEMENT STATE
  const [systemUsers, setSystemUsers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gaio_system_users_v3');
      if (saved) {
        const users = JSON.parse(saved);
        return users.map((u: any) => ({
          ...u,
          allowedSections: u.allowedSections || (u.roles?.includes('SUPER_ADMIN') ? systemModules : ["Global Dashboard", "Settings"]),
          roles: u.roles || (u.role ? [u.role] : [])
        }));
      }
    }
    return initialSystemUsers.map(u => ({ 
      ...u, 
      allowedSections: u.roles?.includes('SUPER_ADMIN') ? systemModules : ["Global Dashboard", "Settings"],
      roles: (u as any).roles || ((u as any).role ? [(u as any).role] : [])
    }));
  });

  // PERMISSIONS MATRIX STATE
  const [permissionsMatrix, setPermissionsMatrix] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gaio_permissions_matrix');
      if (saved) return JSON.parse(saved);
    }
    // Default matrix: Admin has everything
    const matrix: any = {};
    systemModules.forEach(mod => {
      matrix[mod] = { SUPER_ADMIN: true, GLOBAL_ADMIN: true };
    });
    return matrix;
  });

  useEffect(() => {
    localStorage.setItem('gaio_system_users_v3', JSON.stringify(systemUsers));
  }, [systemUsers]);

  useEffect(() => {
    localStorage.setItem('gaio_permissions_matrix', JSON.stringify(permissionsMatrix));
  }, [permissionsMatrix]);

  // REAL-TIME ANALYTICS & STATUS STATE
  const [counts, setCounts] = useState({ countries: 0, organisers: 0, events: 0, volunteers: 0 });
  const [financials, setFinancials] = useState({
    totalBudget: 15000000,
    totalSponsorships: 0,
    operationalSpend: 0,
    sponsorBreakdown: [] as any[],
    eventSpendBreakdown: [] as any[],
    regionalFunding: [] as any[]
  });
  const [latencies, setLatencies] = useState({ api: "24ms", db: "12ms", smtp: "115ms", imap: "450ms" });
  const [auditLogs, setLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gaio_audit_logs');
      return saved ? JSON.parse(saved) : initialAuditLogs;
    }
    return initialAuditLogs;
  });

  useEffect(() => {
    localStorage.setItem('gaio_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // LIVE UPDATES EFFECT
  useEffect(() => {
    const updateData = () => {
      // 1. Fetch Real Counts
      const countries = JSON.parse(localStorage.getItem('gaio_countries') || '[]');
      const organisers = JSON.parse(localStorage.getItem('gaio_organisers') || '[]');
      const eventsData = JSON.parse(localStorage.getItem('gaio_events_core_simple_v2') || '{"events":[], "logistics": {}}');
      const volunteers = JSON.parse(localStorage.getItem('gaio_volunteers_v2') || '[]');
      const sponsors = JSON.parse(localStorage.getItem('gaio_sponsors') || '[]');
      
      setCounts({
        countries: countries.length || 84,
        organisers: organisers.length || 124,
        events: eventsData.events?.length || 12,
        volunteers: volunteers.length || 856
      });

      // 2. Calculate Financials
      let totalSponsorships = 0;
      const sponsorBreakdown = sponsors.map((s: any) => {
        const amount = parseInt(s.funding?.replace(/[^0-9]/g, '') || '0');
        totalSponsorships += amount;
        return { name: s.name, amount, tier: s.tier, industry: s.industry };
      });

      let operationalSpend = 0;
      const eventSpendBreakdown = eventsData.events?.map((e: any) => {
        const log = eventsData.logistics?.[e.id];
        const spent = log?.expenses?.reduce((sum: number, exp: any) => sum + (exp.cost || 0), 0) || 0;
        operationalSpend += spent;
        return { name: e.name, spent, region: e.region };
      }) || [];

      // Regional Distribution Logic
      const regions = ["Europe", "Asia Pacific", "Americas", "Middle East & Africa"];
      const regionalFunding = regions.map(r => {
        const regionEvents = eventSpendBreakdown.filter(e => e.region === r);
        const amount = regionEvents.reduce((sum, e) => sum + e.spent, 0);
        return { region: r, amount: `$${(amount/1000000).toFixed(1)}M`, percent: Math.min(100, Math.floor((amount / (operationalSpend || 1)) * 100)) };
      });

      setFinancials({
        totalBudget: 15000000, // Strategic Target
        totalSponsorships,
        operationalSpend,
        sponsorBreakdown,
        eventSpendBreakdown,
        regionalFunding
      });

      // 3. Simulate Real-time Latency Fluctuations
      setLatencies({
        api: `${Math.floor(Math.random() * 15 + 15)}ms`,
        db: `${Math.floor(Math.random() * 10 + 5)}ms`,
        smtp: `${Math.floor(Math.random() * 50 + 90)}ms`,
        imap: `${Math.floor(Math.random() * 100 + 380)}ms`,
      });
    };

    updateData();
    const interval = setInterval(updateData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const [userSearch, setUserSearch] = useState("");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({ 
    name: "", 
    email: "", 
    roles: ["COUNTRY_DIRECTOR"] as string[], 
    allowedSections: ["Global Dashboard", "Settings"] as string[],
    password: "" 
  });
  const [generatedInviteLink, setGeneratedLink] = useState("");
  const [newInviteData, setNewInviteData] = useState({ roles: [] as string[], sections: ["Global Dashboard", "Settings"] as string[] });

  const handleCreateInvite = () => {
    if (newInviteData.roles.length === 0) return alert("Please select at least one role for this invite.");
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const invite = {
      token,
      roles: newInviteData.roles,
      allowedSections: newInviteData.sections,
      used: false,
      createdAt: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem('gaio_invites') || '[]');
    localStorage.setItem('gaio_invites', JSON.stringify([...existing, invite]));
    
    const url = `${window.location.origin}/invite/${token}`;
    setGeneratedLink(url);
    addLog(`Generated invitation link for roles: ${newInviteData.roles.join(", ")}`, "MEDIUM");
  };

  // ANNOUNCEMENTS STATE
  const [announcement, setAnnouncement] = useState({ title: "", content: "", audience: "All Users (Global)", priority: "Normal (Informational)", emailSync: false });

  // SYSTEM CONFIG STATE
  const [sysConfig, setSysConfig] = useState({ maintenance: false, registration: true, publicTenders: false });

  // GLOBAL MAIL STATE
  const [activeMailAccount, setActiveMailAccount] = useState<any>(null);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  
  const defaultCategories = ["Global", "Organiser", "Sponsor", "Volunteer", "Country Director", "Support"];
  
  const [mailAccounts, setMailAccounts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gaio_mail_accounts_v2');
      if (saved) return JSON.parse(saved);
      
      // Fallback/Initial Migration from old keys
      const initial = [
        { id: 'global', name: 'Global Main', category: 'Global', status: 'Not Configured' },
        { id: 'organisers', name: 'Organisers', category: 'Organiser', status: 'Not Configured' },
        { id: 'sponsors', name: 'Sponsors', category: 'Sponsor', status: 'Not Configured' },
        { id: 'volunteers', name: 'Volunteers', category: 'Volunteer', status: 'Not Configured' },
      ].map(d => {
        const configKey = d.id === 'global' ? 'gaioMailConfig' : `gaioMailConfig_${d.id}`;
        const configSaved = localStorage.getItem(configKey);
        if (configSaved) {
          const config = JSON.parse(configSaved);
          return { ...d, ...config, status: 'Connected' };
        }
        return d;
      });
      return initial;
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('gaio_mail_accounts_v2', JSON.stringify(mailAccounts));
  }, [mailAccounts]);

  const [tempMailConfig, setTempMailConfig] = useState({
    id: "",
    name: "",
    category: "Global",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    imapHost: "imap.gmail.com",
    imapPort: "993",
    user: "",
    pass: ""
  });

  const addLog = (action: string, severity: string = "INFO") => {
    const newLog = {
      id: Date.now(),
      user: "Super Admin",
      action,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity
    };
    setLogs((prev: any) => [newLog, ...prev].slice(0, 50));
  };

  const handleOpenMailConfig = (account: any) => {
    setActiveMailAccount(account);
    setTempMailConfig({
      id: account.id,
      name: account.name,
      category: account.category || "Global",
      smtpHost: account.smtpHost || "smtp.gmail.com",
      smtpPort: account.smtpPort || "587",
      imapHost: account.imapHost || "imap.gmail.com",
      imapPort: account.imapPort || "993",
      user: account.user || "",
      pass: account.pass || ""
    });
    setIsMailModalOpen(true);
  };

  const handleSaveMailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAccounts = mailAccounts.map((acc: any) => 
      acc.id === activeMailAccount.id ? { ...acc, ...tempMailConfig, status: 'Connected' } : acc
    );
    setMailAccounts(updatedAccounts);
    setIsMailModalOpen(false);
    addLog(`Updated ${tempMailConfig.name} mail configuration`, "MEDIUM");
    alert(`Configuration for ${tempMailConfig.name} has been updated successfully.`);
  };

  const handleAddMailAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount = {
      ...tempMailConfig,
      id: `mail-${Date.now()}`,
      status: tempMailConfig.user ? 'Connected' : 'Not Configured'
    };
    setMailAccounts([...mailAccounts, newAccount]);
    setIsAddAccountModalOpen(false);
    addLog(`Added new mail account: ${newAccount.name} (${newAccount.category})`, "MEDIUM");
    setTempMailConfig({
      id: "",
      name: "",
      category: "Global",
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      imapHost: "imap.gmail.com",
      imapPort: "993",
      user: "",
      pass: ""
    });
  };

  const handleDeleteMailAccount = (id: string) => {
    if (confirm("Are you sure you want to delete this mail account?")) {
      setMailAccounts(mailAccounts.filter((acc: any) => acc.id !== id));
      addLog(`Deleted mail account`, "HIGH");
    }
  };

  const stats = [
    { label: "Total System Users", value: systemUsers.length.toString(), icon: Users, color: "text-blue-600" },
    { label: "Active Countries", value: counts.countries.toString(), icon: Globe, color: "text-green-600" },
    { label: "Security Alerts", value: "0", icon: Shield, color: "text-emerald-600" },
    { label: "Active Volunteers", value: counts.volunteers.toString(), icon: Activity, color: "text-purple-600" },
  ];

  const filteredUsers = systemUsers.filter((u: any) => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.roles.some((r: string) => r.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setSystemUsers(systemUsers.map((u: any) => u.id === selectedUser.id ? selectedUser : u));
    addLog(`Updated security clearance for ${selectedUser.name}`, "MEDIUM");
    setIsRoleModalOpen(false);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.password || newUser.roles.length === 0) {
      alert("Please provide a password and select at least one role.");
      return;
    }
    const createdUser = {
      id: `U-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      roles: newUser.roles,
      allowedSections: newUser.allowedSections,
      password: newUser.password,
      status: "Active",
      lastLogin: "Never"
    };
    setSystemUsers([createdUser, ...systemUsers]);
    addLog(`Granted system access to ${newUser.name}`, "HIGH");
    setIsAddUserModalOpen(false);
    setNewUser({ 
      name: "", 
      email: "", 
      roles: ["COUNTRY_DIRECTOR"], 
      allowedSections: ["Global Dashboard", "Settings"],
      password: "" 
    });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to completely remove this user from the system?")) {
      const user = systemUsers.find((u: any) => u.id === id);
      setSystemUsers(systemUsers.filter((u: any) => u.id !== id));
      addLog(`Revoked system access for ${user?.name}`, "HIGH");
      setIsRoleModalOpen(false);
    }
  };

  const handleBroadcast = () => {
    if (!announcement.title || !announcement.content) return alert("Please fill in all fields");
    addLog(`Broadcast Sent: ${announcement.title}`, "MEDIUM");
    alert(`Broadcast Sent: ${announcement.title}\nTo: ${announcement.audience}\nPriority: ${announcement.priority}\nEmail Sync: ${announcement.emailSync}`);
    setAnnouncement({ title: "", content: "", audience: "All Users (Global)", priority: "Normal (Informational)", emailSync: false });
  };

  const handleResetMailConfig = (dept: string) => {
    if (confirm(`Are you sure you want to reset the global mail configuration for ${dept}? This will disconnect their inbox.`)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`gaioMailConfig_${dept}`);
        addLog(`Reset mail config for ${dept}`, "MEDIUM");
        alert(`${dept} mail configuration reset successfully.`);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          Super Admin Command Center
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          The ultimate control panel for managing GAIO's global digital infrastructure.
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto pb-1">
        {["OVERVIEW", "USER_MANAGEMENT", "PERMISSIONS", "FINANCIALS", "ANNOUNCEMENTS", "SYSTEM_LOGS", "ENTITY_CONTROL", "GLOBAL_MAIL", "SYSTEM_CONFIG"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap ${
              activeTab === tab 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {activeTab === "OVERVIEW" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Top Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#111]">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    +12%
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-zinc-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* System Health */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#111]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Real-time System Status
                </h2>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-green-600">All Systems Operational</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { name: "API Gateway", status: "99.9% Uptime", latency: latencies.api },
                  { name: "Database Cluster", status: "Healthy", latency: latencies.db },
                  { name: "SMTP Relay Server", status: "Operational", latency: latencies.smtp },
                  { name: "IMAP Sync Engine", status: "Busy", latency: latencies.imap },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/50">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{s.status}</span>
                    </div>
                    <div className="text-xs font-mono text-gray-400">{s.latency}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Audit */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#111]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-500" />
                Recent Audit Trail
              </h2>
              <div className="space-y-6">
                {auditLogs.slice(0, 4).map((log: any) => (
                  <div key={log.id} className="relative pl-6 pb-6 last:pb-0 border-l border-gray-100 dark:border-zinc-800">
                    <div className={`absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full ${
                      log.severity === 'HIGH' ? 'bg-red-500' : log.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">{log.action}</div>
                    <div className="mt-1 text-[10px] text-gray-500 flex justify-between">
                      <span>{log.user}</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab("SYSTEM_LOGS")}
                className="mt-6 w-full py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30"
              >
                View Full Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "USER_MANAGEMENT" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search system users by name, email or role..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-sm ring-1 ring-inset ring-gray-200 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" 
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { setGeneratedLink(""); setIsInviteModalOpen(true); }}
                className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-xl"
              >
                <Star className="h-4 w-4" />
                Create Invite Link
              </button>
              <button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-500"
              >
                <Key className="h-4 w-4" />
                Grant Access
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
              <thead className="bg-gray-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">User Details</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">System Role</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Last Active</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-[#111]">
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role: string) => (
                          <span key={role} className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                            role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          }`}>
                            {role.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-bold">{user.lastLogin}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                        user.status === 'Active' 
                        ? 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' 
                        : 'bg-gray-50 text-gray-400 border border-gray-100 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700'
                      }`}>
                        {user.status === 'Active' ? (
                          <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </div>
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-zinc-600"></div>
                        )}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedUser(user); setIsRoleModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest border-b-2 border-blue-600/20 hover:border-blue-600 transition-all"
                      >
                        Manage Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "PERMISSIONS" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="rounded-[3rem] border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#0a0a0a] overflow-hidden">
            <div className="p-10 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">Global RBAC Matrix</h2>
                <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest">Configure granular system-wide module access permissions.</p>
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('gaio_permissions_matrix', JSON.stringify(permissionsMatrix));
                  addLog("Updated Global Permissions Matrix", "HIGH");
                  alert("Security Matrix Synchronized Successfully!");
                }}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all"
              >
                Sync Matrix
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                <thead>
                  <tr className="bg-white dark:bg-[#0a0a0a]">
                    <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-r dark:border-zinc-800">Capability Module</th>
                    {availableRoles.map(role => (
                      <th key={role} className="px-4 py-6 text-center text-[9px] font-black text-blue-600 uppercase tracking-tighter leading-none w-24">
                        {role.replace('_', '\n')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {systemModules.map((mod) => (
                    <tr key={mod} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="px-10 py-6 text-xs font-black text-gray-700 dark:text-zinc-300 uppercase tracking-widest border-r dark:border-zinc-800 group-hover:text-blue-600">{mod}</td>
                      {availableRoles.map(role => (
                        <td key={`${mod}-${role}`} className="px-4 py-6 text-center">
                          <button 
                            onClick={() => togglePermission(mod, role)}
                            className={`h-6 w-6 rounded-lg border-2 transition-all flex items-center justify-center mx-auto ${
                              permissionsMatrix[mod]?.[role] 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                              : 'border-gray-200 dark:border-zinc-800 bg-transparent text-transparent hover:border-blue-300'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "FINANCIALS" && (
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-8 rounded-[2rem] border-2 border-gray-100 bg-white dark:border-zinc-800 dark:bg-[#111] shadow-sm">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Global Strategic Target</div>
              <div className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">${(financials.totalBudget/1000000).toFixed(1)}M</div>
              <div className="mt-3 text-xs text-blue-600 font-bold uppercase tracking-widest">FY 2026 Procurement</div>
            </div>
            <div className="p-8 rounded-[2rem] border-2 border-gray-100 bg-white dark:border-zinc-800 dark:bg-[#111] shadow-sm">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Secured Funding</div>
              <div className="text-4xl font-black text-green-600 tracking-tighter">${(financials.totalSponsorships/1000).toLocaleString()}K</div>
              <div className="mt-3 text-xs text-gray-500 font-bold uppercase tracking-widest">{financials.sponsorBreakdown.length} Active Partners</div>
            </div>
            <div className="p-8 rounded-[2rem] border-2 border-gray-100 bg-white dark:border-zinc-800 dark:bg-[#111] shadow-sm">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Operational Spend</div>
              <div className="text-4xl font-black text-red-600 tracking-tighter">${(financials.operationalSpend/1000).toLocaleString()}K</div>
              <div className="mt-3 text-xs text-gray-500 font-bold uppercase tracking-widest">Real-time GL sync</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-[2.5rem] border-2 border-gray-100 bg-white dark:border-zinc-800 dark:bg-[#111] overflow-hidden shadow-sm">
              <div className="p-8 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">Sponsor Ledger</h2>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Direct revenue contributions</p>
                </div>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="min-w-full divide-y-2 divide-gray-100 dark:divide-zinc-800">
                  <thead className="bg-white dark:bg-[#111]">
                    <tr>
                      <th className="px-8 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Partner</th>
                      <th className="px-8 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100 dark:divide-zinc-800">
                    {financials.sponsorBreakdown.length > 0 ? financials.sponsorBreakdown.map((s, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</span>
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{s.tier}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-gray-900 dark:text-white text-lg tracking-tighter">
                          ${s.amount.toLocaleString()}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={2} className="p-10 text-center text-gray-400 text-[10px] font-black uppercase italic">No sponsor data found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[2.5rem] border-2 border-gray-100 bg-white dark:border-zinc-800 dark:bg-[#111] overflow-hidden shadow-sm">
              <div className="p-8 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">Regional Allocation</h2>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget distribution by territory</p>
                </div>
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="p-8 space-y-8">
                {financials.regionalFunding.map((r) => (
                  <div key={r.region}>
                    <div className="flex justify-between text-xs mb-3">
                      <span className="font-black uppercase tracking-widest text-gray-700 dark:text-zinc-300">{r.region}</span>
                      <span className="font-black text-blue-600">{r.amount} utilized</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden border dark:border-zinc-700">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]" style={{ width: `${r.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[3rem] border-2 border-gray-100 bg-white dark:border-zinc-800 dark:bg-[#111] overflow-hidden shadow-sm">
            <div className="p-8 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Event Expenditure Registry</h2>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Real-time spend tracking per managed event</p>
              </div>
              <Activity className="h-6 w-6 text-red-500" />
            </div>
            <div className="p-0">
              <table className="min-w-full divide-y-2 divide-gray-100 dark:divide-zinc-800">
                <thead className="bg-gray-50/20 dark:bg-zinc-900/20">
                  <tr>
                    <th className="px-10 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Managed Event</th>
                    <th className="px-10 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Region</th>
                    <th className="px-10 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-100 dark:divide-zinc-800">
                  {financials.eventSpendBreakdown.length > 0 ? financials.eventSpendBreakdown.map((e, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-10 py-6 font-bold text-gray-900 dark:text-white">{e.name}</td>
                      <td className="px-10 py-6 text-xs font-black uppercase text-gray-500 tracking-widest">{e.region}</td>
                      <td className="px-10 py-6 text-right font-black text-red-500 text-lg tracking-tighter">
                        ${e.spent.toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="p-20 text-center text-gray-400 text-[10px] font-black uppercase italic">No active event expenditures recorded</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ANNOUNCEMENTS" && (
        <div className="max-w-2xl space-y-8 animate-in slide-in-from-top-4 duration-500">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#111]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Global Broadcast System
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Announcement Title</label>
                <input 
                  type="text" 
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                  placeholder="e.g. Scheduled Maintenance" 
                  className="w-full mt-1 p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Message Content</label>
                <textarea 
                  value={announcement.content}
                  onChange={(e) => setAnnouncement({...announcement, content: e.target.value})}
                  placeholder="Write your global message here..." 
                  className="w-full mt-1 p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800 h-32 resize-none" 
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Target Audience</label>
                  <select 
                    value={announcement.audience}
                    onChange={(e) => setAnnouncement({...announcement, audience: e.target.value})}
                    className="w-full mt-1 p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800"
                  >
                    <option>All Users (Global)</option>
                    <option>Country Directors Only</option>
                    <option>Organisers Only</option>
                    <option>Volunteers Only</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Priority Level</label>
                  <select 
                    value={announcement.priority}
                    onChange={(e) => setAnnouncement({...announcement, priority: e.target.value})}
                    className="w-full mt-1 p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800"
                  >
                    <option>Normal (Informational)</option>
                    <option>Medium (Alert)</option>
                    <option>High (Action Required)</option>
                    <option>Critical (Emergency)</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="email-sync" 
                  checked={announcement.emailSync}
                  onChange={(e) => setAnnouncement({...announcement, emailSync: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600" 
                />
                <label htmlFor="email-sync" className="text-xs text-gray-500 cursor-pointer">Also send as email to all targeted users via Global Mail Relay</label>
              </div>
              <button 
                onClick={handleBroadcast}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-500"
              >
                Broadcast Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "SYSTEM_LOGS" && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111] overflow-hidden animate-in fade-in duration-500">
          <div className="p-6 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">Comprehensive Audit Trail</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Real-time log of all administrative and security actions</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border-2 dark:border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">
                <Filter className="h-3.5 w-3.5" /> Filter Logs
              </button>
              <button 
                onClick={() => {
                  const csv = auditLogs.map((l: any) => `${l.time},${l.user},${l.action},${l.severity}`).join('\n');
                  const blob = new Blob([`Timestamp,Operator,Action,Severity\n${csv}`], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `gaio_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  addLog("Exported Audit Logs to CSV", "INFO");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
              <thead className="bg-white dark:bg-[#111]">
                <tr>
                  <th className="px-10 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-10 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Operator</th>
                  <th className="px-10 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Action Performed</th>
                  <th className="px-10 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100 dark:divide-zinc-800">
                {auditLogs.length > 0 ? auditLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group">
                    <td className="px-10 py-6 text-gray-500 font-bold text-xs tabular-nums">{log.time}</td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[10px] font-black text-blue-600">{log.user.charAt(0)}</div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-gray-600 dark:text-zinc-400 font-mono text-[11px] font-bold group-hover:text-blue-600 transition-colors">
                      {log.action}
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        log.severity === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400' :
                        log.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400' :
                        'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Activity className="h-12 w-12 text-gray-400" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Registry initialization in progress...</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "ENTITY_CONTROL" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
          {[
            { title: "Countries", count: counts.countries, path: "/countries", icon: Globe },
            { title: "Organisers", count: counts.organisers, path: "/organisers", icon: Users },
            { title: "Events", count: counts.events, path: "/events", icon: CheckCircle2 },
            { title: "Tenders", count: JSON.parse(localStorage.getItem('gaio_tenders') || '[]').length, path: "/tenders", icon: Database },
            { title: "Sponsors", count: JSON.parse(localStorage.getItem('gaio_sponsors') || '[]').length, path: "/sponsors", icon: Star },
            { title: "Volunteers", count: counts.volunteers, path: "/volunteers", icon: Activity },
          ].map((entity) => (
            <div key={entity.title} className="p-6 rounded-2xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-[#111] hover:border-blue-500 transition-all group shadow-sm hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:scale-110 transition-transform">
                  <entity.icon className="h-6 w-6" />
                </div>
                <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="h-5 w-5" /></button>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter italic">{entity.title}</h3>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-1">{entity.count} Active Records</p>
              <div className="mt-6 pt-6 border-t dark:border-zinc-800">
                <a href={entity.path} className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg">
                  Open Governance Hub
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "GLOBAL_MAIL" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111] overflow-hidden">
            <div className="p-6 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50">
              <div>
                <h2 className="text-lg font-bold">Mail Infrastructure</h2>
                <p className="text-xs text-gray-500">Centralized SMTP/IMAP configuration for all platform departments.</p>
              </div>
              <button 
                onClick={() => {
                  setTempMailConfig({
                    id: "",
                    name: "",
                    category: "Global",
                    smtpHost: "smtp.gmail.com",
                    smtpPort: "587",
                    imapHost: "imap.gmail.com",
                    imapPort: "993",
                    user: "",
                    pass: ""
                  });
                  setIsAddAccountModalOpen(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-500 transition-all"
              >
                <Mail className="h-4 w-4" />
                Add Mail Account
              </button>
            </div>
            <div className="p-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                <thead className="bg-gray-50/50 dark:bg-zinc-900/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase">Account Name</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase">Assigned Email</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-[#111]">
                  {mailAccounts.map((acc: any) => (
                    <tr key={acc.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{acc.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                          {acc.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{acc.user || 'None'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
                          acc.status === 'Connected' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`h-1 w-1 rounded-full ${acc.status === 'Connected' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                          {acc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => handleDeleteMailAccount(acc.id)} className="text-red-600 hover:text-red-500 text-xs font-bold">Delete</button>
                        <button onClick={() => handleOpenMailConfig(acc)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-500">Configure</button>
                      </td>
                    </tr>
                  ))}
                  {mailAccounts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic text-sm">
                        No mail accounts configured. Click "Add Mail Account" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Global Mail Modal (Configure Existing) */}
      {isMailModalOpen && activeMailAccount && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-[#111] dark:border dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configure {tempMailConfig.name}</h2>
                <p className="text-xs text-gray-500 mt-1">Update SMTP and IMAP settings for this account.</p>
              </div>
              <button onClick={() => setIsMailModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSaveMailConfig} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Account Name</label>
                  <input required value={tempMailConfig.name} onChange={e => setTempMailConfig({...tempMailConfig, name: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Category</label>
                  <select 
                    value={tempMailConfig.category} 
                    onChange={e => setTempMailConfig({...tempMailConfig, category: e.target.value})} 
                    className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800 text-sm"
                  >
                    {defaultCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">IMAP Host</label>
                  <input required value={tempMailConfig.imapHost} onChange={e => setTempMailConfig({...tempMailConfig, imapHost: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">IMAP Port</label>
                  <input required value={tempMailConfig.imapPort} onChange={e => setTempMailConfig({...tempMailConfig, imapPort: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">SMTP Host</label>
                  <input required value={tempMailConfig.smtpHost} onChange={e => setTempMailConfig({...tempMailConfig, smtpHost: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">SMTP Port</label>
                  <input required value={tempMailConfig.smtpPort} onChange={e => setTempMailConfig({...tempMailConfig, smtpPort: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Email / User</label>
                <input required type="email" value={tempMailConfig.user} onChange={e => setTempMailConfig({...tempMailConfig, user: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" placeholder="e.g. support@gaio.uk" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">App Password</label>
                <input required type="password" value={tempMailConfig.pass} onChange={e => setTempMailConfig({...tempMailConfig, pass: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" placeholder="••••••••••••••••" />
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t dark:border-zinc-800">
                <button type="button" onClick={() => setIsMailModalOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-zinc-400">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                  Update Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Mail Account Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-[#111] dark:border dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Mail Account</h2>
                <p className="text-xs text-gray-500 mt-1">Configure a new SMTP/IMAP connection and assign a category.</p>
              </div>
              <button onClick={() => setIsAddAccountModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleAddMailAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Account Name</label>
                  <input required placeholder="e.g. Global Support" value={tempMailConfig.name} onChange={e => setTempMailConfig({...tempMailConfig, name: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Category</label>
                  <select 
                    value={tempMailConfig.category} 
                    onChange={e => setTempMailConfig({...tempMailConfig, category: e.target.value})} 
                    className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800 text-sm"
                  >
                    {defaultCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">IMAP Host</label>
                  <input required value={tempMailConfig.imapHost} onChange={e => setTempMailConfig({...tempMailConfig, imapHost: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">IMAP Port</label>
                  <input required value={tempMailConfig.imapPort} onChange={e => setTempMailConfig({...tempMailConfig, imapPort: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">SMTP Host</label>
                  <input required value={tempMailConfig.smtpHost} onChange={e => setTempMailConfig({...tempMailConfig, smtpHost: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">SMTP Port</label>
                  <input required value={tempMailConfig.smtpPort} onChange={e => setTempMailConfig({...tempMailConfig, smtpPort: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Email / User</label>
                <input required type="email" value={tempMailConfig.user} onChange={e => setTempMailConfig({...tempMailConfig, user: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" placeholder="e.g. support@gaio.uk" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">App Password</label>
                <input required type="password" value={tempMailConfig.pass} onChange={e => setTempMailConfig({...tempMailConfig, pass: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-[#1a1a1a] dark:border-zinc-800" placeholder="••••••••••••••••" />
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t dark:border-zinc-800">
                <button type="button" onClick={() => setIsAddAccountModalOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-zinc-400">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "SYSTEM_CONFIG" && (
        <div className="max-w-4xl space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#111]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-400" />
              Global Platform Governance
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border dark:border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Maintenance Mode</span>
                  <span className="text-xs text-gray-500">When enabled, only Super Admins can access the platform.</span>
                </div>
                <button 
                  onClick={() => setSysConfig({...sysConfig, maintenance: !sysConfig.maintenance})}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${sysConfig.maintenance ? 'bg-red-600' : 'bg-gray-200 dark:bg-zinc-800'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${sysConfig.maintenance ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border dark:border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">New Organiser Registration</span>
                  <span className="text-xs text-gray-500">Allow new organisations to apply for national status.</span>
                </div>
                <button 
                  onClick={() => setSysConfig({...sysConfig, registration: !sysConfig.registration})}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${sysConfig.registration ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-800'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${sysConfig.registration ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border dark:border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Public Tender Portal</span>
                  <span className="text-xs text-gray-500">Make the tenders section visible to guest users.</span>
                </div>
                <button 
                  onClick={() => setSysConfig({...sysConfig, publicTenders: !sysConfig.publicTenders})}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${sysConfig.publicTenders ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-800'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${sysConfig.publicTenders ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#111]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Database className="h-5 w-5 text-gray-400" />
              Infrastructure & API Gateway
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Global API Key</label>
                <div className="flex gap-2">
                  <input type="password" value="********************************" readOnly className="flex-1 p-2.5 rounded-lg border dark:bg-zinc-900 dark:border-zinc-800 text-xs font-mono" />
                  <button onClick={() => alert("API Key Rotated!")} className="px-3 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-xs font-bold hover:bg-gray-200">Rotate</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Backup Frequency</label>
                <select className="w-full p-2.5 rounded-lg border dark:bg-zinc-900 dark:border-zinc-800 text-sm">
                  <option>Every 6 Hours</option>
                  <option>Daily (Midnight)</option>
                  <option>Weekly</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => alert("Global System Configurations applied successfully.")}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-500"
              >
                Apply System Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-[2.5rem] bg-white p-10 shadow-2xl dark:bg-[#0a0a0a] border-4 border-blue-600/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Provision New Identity</h2>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-2 bg-gray-50 dark:bg-zinc-900 rounded-xl text-gray-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Full Name</label>
                  <input required type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-xl px-4 py-3 font-bold text-sm shadow-inner text-gray-900 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Secure Email</label>
                  <input required type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-xl px-4 py-3 font-bold text-sm shadow-inner text-gray-900 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">System Roles</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900 rounded-2xl border-2 dark:border-zinc-800">
                    {availableRoles.map(role => (
                      <label key={role} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={newUser.roles.includes(role)}
                          onChange={(e) => {
                            const roles = e.target.checked 
                              ? [...newUser.roles, role]
                              : newUser.roles.filter(r => r !== role);
                            setNewUser({...newUser, roles});
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-blue-600 transition-colors">{role.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Visible Sections</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900 rounded-2xl border-2 dark:border-zinc-800">
                    {systemModules.map(mod => (
                      <label key={mod} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={newUser.allowedSections.includes(mod)}
                          onChange={(e) => {
                            const sections = e.target.checked 
                              ? [...newUser.allowedSections, mod]
                              : newUser.allowedSections.filter(s => s !== mod);
                            setNewUser({...newUser, allowedSections: sections});
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-blue-600 transition-colors">{mod}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">System Cipher (Password)</label>
                <input required type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-xl px-4 py-3 font-bold text-sm shadow-inner text-gray-900 dark:text-white" placeholder="••••••••" />
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t dark:border-zinc-800">
                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:text-zinc-400">Abort</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30">Commit Identity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-[2.5rem] bg-white p-10 shadow-2xl dark:bg-[#0a0a0a] border-4 border-blue-600/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Modify Clearance</h2>
              <button onClick={() => setIsRoleModalOpen(false)} className="p-2 bg-gray-50 dark:bg-zinc-900 rounded-xl text-gray-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Active Status</label>
                <select value={selectedUser.status} onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-xl px-4 py-3 font-black text-xs shadow-inner uppercase tracking-widest">
                  <option value="Active">Active / Online</option>
                  <option value="Inactive">Inactive / Offline</option>
                  <option value="Suspended">Suspended / Restricted</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Assigned Roles</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900 rounded-2xl border-2 dark:border-zinc-800">
                    {availableRoles.map(role => (
                      <label key={role} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedUser.roles.includes(role)}
                          onChange={(e) => {
                            const roles = e.target.checked 
                              ? [...selectedUser.roles, role]
                              : selectedUser.roles.filter((r: string) => r !== role);
                            setSelectedUser({...selectedUser, roles});
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-blue-600 transition-colors">{role.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Visible Sections</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900 rounded-2xl border-2 dark:border-zinc-800">
                    {systemModules.map(mod => (
                      <label key={mod} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedUser.allowedSections.includes(mod)}
                          onChange={(e) => {
                            const sections = e.target.checked 
                              ? [...selectedUser.allowedSections, mod]
                              : selectedUser.allowedSections.filter((s: string) => s !== mod);
                            setSelectedUser({...selectedUser, allowedSections: sections});
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-blue-600 transition-colors">{mod}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center pt-6 border-t dark:border-zinc-800">
                <button type="button" onClick={() => handleDeleteUser(selectedUser.id)} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-500 border-b-2 border-red-600/20">Terminate</button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsRoleModalOpen(false)} className="rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:text-zinc-400">Abort</button>
                  <button type="submit" className="rounded-xl bg-blue-600 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30">Update Dossier</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-[2.5rem] bg-white p-10 shadow-2xl dark:bg-[#0a0a0a] border-4 border-blue-600/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Generate Onboarding Token</h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-2 bg-gray-50 dark:bg-zinc-900 rounded-xl text-gray-400"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="space-y-8">
              {!generatedInviteLink ? (
                <>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Target Roles</label>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900 rounded-2xl border-2 dark:border-zinc-800">
                        {availableRoles.map(role => (
                          <label key={role} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={newInviteData.roles.includes(role)}
                              onChange={(e) => {
                                const roles = e.target.checked 
                                  ? [...newInviteData.roles, role]
                                  : newInviteData.roles.filter(r => r !== role);
                                setNewInviteData({...newInviteData, roles});
                              }}
                              className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-blue-600 transition-colors">{role.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Default Section Permissions</label>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900 rounded-2xl border-2 dark:border-zinc-800">
                        {systemModules.map(mod => (
                          <label key={mod} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={newInviteData.sections.includes(mod)}
                              onChange={(e) => {
                                const sections = e.target.checked 
                                  ? [...newInviteData.sections, mod]
                                  : newInviteData.sections.filter(s => s !== mod);
                                setNewInviteData({...newInviteData, sections});
                              }}
                              className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-blue-600 transition-colors">{mod}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleCreateInvite}
                    className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/30 uppercase tracking-[0.3em] text-xs hover:bg-blue-500 transition-all"
                  >
                    Generate Secure Link
                  </button>
                </>
              ) : (
                <div className="space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="p-8 bg-green-50 dark:bg-green-900/10 border-2 border-green-100 dark:border-green-900/30 rounded-3xl text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-black uppercase tracking-tighter text-green-700 dark:text-green-400">Invite Link Generated</h3>
                    <p className="text-xs text-green-600/70 font-bold mt-1">This token allows a single user to self-provision their account.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Secure URL</label>
                    <div className="flex gap-2">
                      <input readOnly value={generatedInviteLink} className="flex-1 bg-gray-50 dark:bg-zinc-900 border-2 dark:border-zinc-800 rounded-xl px-4 py-3 font-bold text-xs text-blue-600" />
                      <button 
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(generatedInviteLink)
                              .then(() => alert("Link copied to clipboard!"))
                              .catch(() => alert("Failed to copy link."));
                          } else {
                            const textArea = document.createElement("textarea");
                            textArea.value = generatedInviteLink;
                            document.body.appendChild(textArea);
                            textArea.select();
                            try {
                              document.execCommand("copy");
                              alert("Link copied to clipboard!");
                            } catch (err) {
                              alert("Failed to copy link.");
                            }
                            document.body.removeChild(textArea);
                          }
                        }}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setGeneratedLink(""); setIsInviteModalOpen(false); }}
                    className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all"
                  >
                    Close Portal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
