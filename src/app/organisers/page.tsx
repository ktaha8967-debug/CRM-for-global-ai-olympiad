"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  X, 
  CheckSquare, 
  MessageSquare, 
  Users, 
  Send, 
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  Reply
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
}

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  status: "Active" | "Away";
}

interface Message {
  id: string;
  sender: string;
  role?: string;
  text: string;
  timestamp: string;
}

interface Organiser {
  id: string;
  name: string;
  country: string;
  contact: string;
  email: string;
  teamSize: number;
  status: string;
  tasks: Task[];
  team: TeamMember[];
  messages: Message[];
}

const initialOrganisers: Organiser[] = [
  { 
    id: "ORG-001", 
    name: "TechEd UK", 
    country: "United Kingdom", 
    contact: "James Wilson", 
    email: "james@teched.uk", 
    teamSize: 3, 
    status: "Approved",
    tasks: [
      { id: "T-1", title: "Finalize Venue Contract", status: "Completed", dueDate: "2026-04-10" },
      { id: "T-2", title: "Speaker Onboarding", status: "In Progress", dueDate: "2026-04-15" }
    ],
    team: [
      { id: "TM-1", name: "Sarah Smith", designation: "Event Coordinator", status: "Active" },
      { id: "TM-2", name: "Robert Fox", designation: "Technical Lead", status: "Active" },
      { id: "TM-3", name: "Alice Wong", designation: "Marketing Manager", status: "Away" }
    ],
    messages: [
      { id: "M-1", sender: "Super Admin", role: "SUPER_ADMIN", text: "Please update the venue status.", timestamp: "10:30 AM" },
      { id: "M-2", sender: "James Wilson", role: "ORGANISER", text: "Working on it, will update by EOD.", timestamp: "11:00 AM" }
    ]
  },
  { 
    id: "ORG-002", 
    name: "Japan AI Foundation", 
    country: "Japan", 
    contact: "Yuki Tanaka", 
    email: "y.tanaka@jaif.jp", 
    teamSize: 2, 
    status: "Approved",
    tasks: [],
    team: [
      { id: "TM-4", name: "Kenji Sato", designation: "Lead Developer", status: "Active" },
      { id: "TM-5", name: "Mina Suzuki", designation: "Community Manager", status: "Active" }
    ],
    messages: []
  },
];

export default function OrganisersPage() {
  const { user, addNotification } = useAuth();
  const [organisers, setOrganisers] = useState<Organiser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", country: "", contact: "", email: "" });

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [manageData, setManageData] = useState<Organiser | null>(null);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "TASKS" | "TEAM" | "CHAT">("OVERVIEW");
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberDesignation, setNewMemberDesignation] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('gaio_organisers');
    if (saved) {
      setOrganisers(JSON.parse(saved));
    } else {
      setOrganisers(initialOrganisers);
    }
  }, []);

  useEffect(() => {
    if (organisers.length > 0) {
      localStorage.setItem('gaio_organisers', JSON.stringify(organisers));
    }
  }, [organisers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newOrg: Organiser = {
      id: `ORG-00${organisers.length + 1}`,
      name: formData.name,
      country: formData.country,
      contact: formData.contact,
      email: formData.email,
      teamSize: 0,
      status: "Applied",
      tasks: [],
      team: [],
      messages: []
    };

    setOrganisers([newOrg, ...organisers]);
    setFormData({ name: "", country: "", contact: "", email: "" });
    setIsModalOpen(false);
  };

  const handleOpenManage = (org: Organiser) => {
    setManageData(org);
    setIsManageOpen(true);
    setActiveTab("OVERVIEW");
  };

  const updateOrganiser = (updatedOrg: Organiser) => {
    setOrganisers(organisers.map(org => org.id === updatedOrg.id ? updatedOrg : org));
    setManageData(updatedOrg);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this organiser?")) {
      setOrganisers(organisers.filter(org => org.id !== id));
      setIsManageOpen(false);
    }
  };

  const addTask = () => {
    if (!newTaskTitle || !manageData) return;
    const newTask: Task = {
      id: `T-${Date.now()}`,
      title: newTaskTitle,
      status: "Pending",
      dueDate: newTaskDate || new Date().toISOString().split('T')[0]
    };
    const updated = { ...manageData, tasks: [...manageData.tasks, newTask] };
    updateOrganiser(updated);
    setNewTaskTitle("");
    setNewTaskDate("");
  };

  const toggleTaskStatus = (taskId: string) => {
    if (!manageData) return;
    const updatedTasks = manageData.tasks.map(t => {
      if (t.id === taskId) {
        const nextStatus: Task['status'] = t.status === "Pending" ? "In Progress" : t.status === "In Progress" ? "Completed" : "Pending";
        return { ...t, status: nextStatus };
      }
      return t;
    });
    updateOrganiser({ ...manageData, tasks: updatedTasks });
  };

  const deleteTask = (taskId: string) => {
    if (!manageData) return;
    updateOrganiser({ ...manageData, tasks: manageData.tasks.filter(t => t.id !== taskId) });
  };

  const addTeamMember = () => {
    if (!newMemberName || !manageData) return;
    const newMember: TeamMember = {
      id: `TM-${Date.now()}`,
      name: newMemberName,
      designation: newMemberDesignation || "Team Member",
      status: "Active"
    };
    const updated = { ...manageData, team: [...manageData.team, newMember], teamSize: manageData.team.length + 1 };
    updateOrganiser(updated);
    setNewMemberName("");
    setNewMemberDesignation("");
  };

  const deleteTeamMember = (memberId: string) => {
    if (!manageData) return;
    const updatedTeam = manageData.team.filter(m => m.id !== memberId);
    updateOrganiser({ ...manageData, team: updatedTeam, teamSize: updatedTeam.length });
  };

  const sendMessage = () => {
    if (!newMessage || !manageData || !user) return;
    const msg: Message = {
      id: `M-${Date.now()}`,
      sender: user.name,
      role: user.roles?.[0] || user.role,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    updateOrganiser({ ...manageData, messages: [...manageData.messages, msg] });
    addNotification(`New message to ${manageData.name}`, "Organiser Management");
    setNewMessage("");
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Organiser Management</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Review and manage national and regional event organisers.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Organiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {organisers.map((org) => (
          <div key={org.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#111]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{org.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{org.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                    <MapPin className="h-3 w-3" />
                    {org.country}
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                org.status === 'Approved' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400' :
                org.status === 'Under Review' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-500' :
                'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {org.status}
              </span>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-gray-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 dark:bg-zinc-900/50">
                <CheckSquare className="h-3.5 w-3.5" />
                {org.tasks.length} Tasks
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 dark:bg-zinc-900/50">
                <Users className="h-3.5 w-3.5" />
                {org.team.length} Team Members
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 dark:bg-zinc-900/50">
                <MessageSquare className="h-3.5 w-3.5" />
                {org.messages.length} Messages
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-zinc-500">Contact: {org.contact}</span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-600">{org.email}</span>
              </div>
              <button onClick={() => handleOpenManage(org)} className="bg-blue-600/10 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all">Manage Hub</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-[#111] dark:border dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Organiser</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Organisation Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Country</label>
                  <input type="text" required value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Contact Person</label>
                  <input type="text" required value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Save Organiser</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isManageOpen && manageData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#0a0a0a] dark:border dark:border-zinc-800 flex flex-col">
            <div className="p-6 border-b dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                  {manageData.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{manageData.name}</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {manageData.country} • {manageData.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleDelete(manageData.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
                <button onClick={() => setIsManageOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex border-b dark:border-zinc-800 px-6 bg-white dark:bg-[#0a0a0a]">
              {[
                { id: "OVERVIEW", icon: Clock, label: "Overview" },
                { id: "TASKS", icon: CheckSquare, label: "Tasks" },
                { id: "TEAM", icon: Users, label: "Team Management" },
                { id: "CHAT", icon: MessageSquare, label: "Communication" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                    activeTab === tab.id 
                    ? "text-blue-600 border-blue-600" 
                    : "text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === "OVERVIEW" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl border dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/30">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</span>
                      <div className="mt-1">
                        <select 
                          value={manageData.status} 
                          onChange={(e) => updateOrganiser({...manageData, status: e.target.value})}
                          className="w-full bg-transparent font-bold text-gray-900 dark:text-white border-0 p-0 focus:ring-0"
                        >
                          <option>Applied</option>
                          <option>Under Review</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/30">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact</span>
                      <p className="mt-1 font-bold text-gray-900 dark:text-white">{manageData.contact}</p>
                    </div>
                    <div className="p-4 rounded-xl border dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/30">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</span>
                      <p className="mt-1 font-bold text-gray-900 dark:text-white">{manageData.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Recent Progress
                      </h3>
                      <div className="p-6 rounded-2xl border dark:border-zinc-800 space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-xs text-gray-500">Task Completion</span>
                          <span className="text-2xl font-black text-blue-600">
                            {Math.round((manageData.tasks.filter(t => t.status === "Completed").length / (manageData.tasks.length || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-1000" 
                            style={{ width: `${(manageData.tasks.filter(t => t.status === "Completed").length / (manageData.tasks.length || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-500" />
                        Team Capacity
                      </h3>
                      <div className="p-6 rounded-2xl border dark:border-zinc-800 flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-black text-gray-900 dark:text-white">{manageData.team.length}</p>
                          <p className="text-xs text-gray-500">Active Professionals</p>
                        </div>
                        <div className="flex -space-x-2">
                          {manageData.team.map((m) => (
                            <div key={m.id} className="h-8 w-8 rounded-full border-2 border-white dark:border-zinc-900 bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-600">
                              {m.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "TASKS" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border dark:border-zinc-800">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">New Task Title</label>
                      <input 
                        type="text" 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Assign a new responsibility..." 
                        className="w-full bg-transparent border-b dark:border-zinc-800 focus:border-blue-600 transition-colors p-1 text-sm font-medium"
                      />
                    </div>
                    <div className="w-40 space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Due Date</label>
                      <input 
                        type="date" 
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        className="w-full bg-transparent border-b dark:border-zinc-800 focus:border-blue-600 transition-colors p-1 text-sm"
                      />
                    </div>
                    <button 
                      onClick={addTask}
                      className="mt-auto p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {manageData.tasks.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed dark:border-zinc-800 rounded-2xl">
                        <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">No tasks assigned yet.</p>
                      </div>
                    )}
                    {manageData.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-all group">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${
                              task.status === 'Completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-zinc-700'
                            }`}
                          >
                            {task.status === 'Completed' && <CheckCircle2 className="h-4 w-4" />}
                          </button>
                          <div>
                            <p className={`text-sm font-bold ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                task.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {task.status.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {task.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "TEAM" && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border dark:border-zinc-800">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Full Name</label>
                      <input 
                        type="text" 
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="John Doe" 
                        className="w-full bg-transparent border-b dark:border-zinc-800 focus:border-blue-600 p-1 text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Designation / Role</label>
                      <input 
                        type="text" 
                        value={newMemberDesignation}
                        onChange={(e) => setNewMemberDesignation(e.target.value)}
                        placeholder="e.g. Lead Designer" 
                        className="w-full bg-transparent border-b dark:border-zinc-800 focus:border-blue-600 p-1 text-sm font-medium"
                      />
                    </div>
                    <button 
                      onClick={addTeamMember}
                      className="h-10 mt-auto bg-gray-900 text-white dark:bg-white dark:text-black rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Add Member
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {manageData.team.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl border dark:border-zinc-800 bg-white dark:bg-[#111] hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center font-black text-gray-400">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{member.name}</p>
                            <p className="text-xs text-blue-600 font-bold">{member.designation}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`h-1.5 w-1.5 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                              <span className="text-[10px] text-gray-400 font-medium uppercase">{member.status}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteTeamMember(member.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "CHAT" && (
                <div className="h-[500px] flex flex-col animate-in zoom-in-95 duration-300">
                  <div className="flex-1 overflow-y-auto space-y-4 p-6 rounded-2xl border dark:border-zinc-800 bg-[#efe7de] dark:bg-zinc-950/30 mb-4 shadow-inner">
                    {manageData.messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-40">
                        <MessageSquare className="h-12 w-12 mb-2" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Encrypted Channel Active</p>
                      </div>
                    )}
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

                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..." 
                      className="flex-1 bg-white dark:bg-[#111] border dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all shadow-sm"
                    />
                    <button 
                      onClick={sendMessage}
                      className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20"
                    >
                      <Send className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t dark:border-zinc-800 text-center bg-gray-50 dark:bg-zinc-900/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Last System Sync: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
