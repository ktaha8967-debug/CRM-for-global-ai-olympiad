"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  Search, 
  Plus, 
  Filter, 
  Tag, 
  MapPin, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Award, 
  Trash2, 
  CheckSquare, 
  Briefcase,
  ExternalLink,
  ChevronRight,
  ClipboardList
} from "lucide-react";

interface VolunteerTask {
  id: string;
  title: string;
  status: "Pending" | "Completed";
  dueDate: string;
}

interface VolunteerNote {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface Volunteer {
  id: string;
  name: string;
  university: string;
  skills: string[];
  status: "Applied" | "Approved" | "Assigned" | "Onboarding" | "Inactive";
  event: string;
  email: string;
  phone: string;
  availability: string;
  experience: string;
  joinedAt: string;
  tasks: VolunteerTask[];
  notes: VolunteerNote[];
  hasCertificate: boolean;
}

const initialVolunteers: Volunteer[] = [
  { 
    id: "V-001", 
    name: "Alice Thompson", 
    university: "Stanford University", 
    skills: ["AI Ethics", "Logistics"], 
    status: "Assigned", 
    event: "Tokyo AI Challenge", 
    email: "alice.t@stanford.edu",
    phone: "+1 415 555 0123",
    availability: "Weekends",
    experience: "Lead volunteer for 3 hackathons.",
    joinedAt: "2026-01-10",
    tasks: [
      { id: "T-1", title: "Complete Safety Briefing", status: "Completed", dueDate: "2026-04-01" },
      { id: "T-2", title: "Review Venue Layout", status: "Pending", dueDate: "2026-04-15" }
    ],
    notes: [
      { id: "N-1", text: "Great communication skills.", author: "Super Admin", timestamp: "2026-02-15 10:00 AM" }
    ],
    hasCertificate: false
  },
  { 
    id: "V-002", 
    name: "Robert Chen", 
    university: "Oxford University", 
    skills: ["Python", "Mentorship"], 
    status: "Approved", 
    event: "N/A", 
    email: "r.chen@ox.ac.uk",
    phone: "+44 20 7946 0123",
    availability: "Full-time",
    experience: "CS Graduate student.",
    joinedAt: "2026-02-05",
    tasks: [],
    notes: [],
    hasCertificate: true
  },
];

export default function VolunteersPage() {
  const { user, addNotification } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [activeManageTab, setActiveManageTab] = useState<"OVERVIEW" | "TASKS" | "NOTES">("OVERVIEW");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  // Forms state
  const [formData, setFormData] = useState({ name: "", university: "", skills: "", email: "", phone: "", availability: "", experience: "" });
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newNoteText, setNewNoteText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('gaio_volunteers_v2');
    if (saved) {
      try {
        setVolunteers(JSON.parse(saved));
      } catch (e) {
        setVolunteers(initialVolunteers);
      }
    } else {
      setVolunteers(initialVolunteers);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gaio_volunteers_v2', JSON.stringify(volunteers));
    }
  }, [volunteers, isLoaded]);

  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || v.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    const newV: Volunteer = {
      id: `V-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      university: formData.university,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      status: "Applied",
      event: "N/A",
      email: formData.email,
      phone: formData.phone,
      availability: formData.availability,
      experience: formData.experience,
      joinedAt: new Date().toISOString().split('T')[0],
      tasks: [],
      notes: [],
      hasCertificate: false
    };
    setVolunteers([newV, ...volunteers]);
    setFormData({ name: "", university: "", skills: "", email: "", phone: "", availability: "", experience: "" });
    setIsModalOpen(false);
  };

  const updateVolunteer = (updated: Volunteer) => {
    setVolunteers(volunteers.map(v => v.id === updated.id ? updated : v));
    setSelectedVolunteer(updated);
  };

  const handleDeleteVolunteer = (id: string) => {
    if (confirm("Are you sure you want to remove this volunteer?")) {
      setVolunteers(volunteers.filter(v => v.id !== id));
      setIsManageOpen(false);
    }
  };

  const addTask = () => {
    if (!newTaskTitle || !selectedVolunteer) return;
    const task: VolunteerTask = {
      id: `T-${Date.now()}`,
      title: newTaskTitle,
      status: "Pending",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    updateVolunteer({ ...selectedVolunteer, tasks: [...selectedVolunteer.tasks, task] });
    setNewTaskTitle("");
  };

  const addNote = () => {
    if (!newNoteText || !selectedVolunteer || !user) return;
    const note: VolunteerNote = {
      id: `N-${Date.now()}`,
      text: newNoteText,
      author: user.name,
      timestamp: new Date().toLocaleString()
    };
    updateVolunteer({ ...selectedVolunteer, notes: [note, ...selectedVolunteer.notes] });
    addNotification(`New admin log for ${selectedVolunteer.name}`, "Volunteer Network");
    setNewNoteText("");
  };

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">Volunteer Hub</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Coordinate global volunteer applications and event assignments.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Application
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        {[
          { label: "Total Volunteers", val: volunteers.length, color: "text-blue-600" },
          { label: "Active Assignments", val: volunteers.filter(v => v.status === 'Assigned').length, color: "text-green-600" },
          { label: "Pending Review", val: volunteers.filter(v => v.status === 'Applied').length, color: "text-amber-500" },
          { label: "Certified", val: volunteers.filter(v => v.hasCertificate).length, color: "text-purple-600" }
        ].map(stat => (
          <div key={stat.label} className="rounded-[2rem] border-2 border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#111]">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
            <div className={`mt-2 text-3xl font-black ${stat.color} tracking-tighter`}>{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, university or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-xs font-bold ring-2 ring-gray-100 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "APPLIED", "APPROVED", "ASSIGNED", "ONBOARDING"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${
                statusFilter === status 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "bg-white text-gray-400 border-2 border-gray-100 hover:border-blue-600 dark:bg-zinc-900 dark:border-zinc-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVolunteers.length > 0 ? (
          filteredVolunteers.map((v) => (
            <div key={v.id} className="group rounded-[2.5rem] border-2 border-gray-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#111] hover:shadow-2xl hover:border-blue-600/20 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-black text-2xl text-blue-600 dark:text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
                    {v.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{v.name}</h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      <GraduationCap className="h-3 w-3" />
                      {v.university}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  v.status === 'Assigned' ? 'bg-green-100 text-green-700' :
                  v.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                  v.status === 'Applied' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {v.status}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {v.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-3 py-1 bg-gray-50 dark:bg-zinc-900/50 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-zinc-800">{skill}</span>
                  ))}
                  {v.skills.length > 3 && <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 py-1">+{v.skills.length - 3}</span>}
                </div>
                
                <div className="pt-6 border-t border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Assignment</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 mt-1">{v.event === 'N/A' ? 'Unassigned' : v.event}</span>
                  </div>
                  <button 
                    onClick={() => { setSelectedVolunteer(v); setIsManageOpen(true); setActiveManageTab("OVERVIEW"); }}
                    className="h-10 px-6 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                  >
                    Manage Hub
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <User className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic opacity-50">No volunteers found</p>
          </div>
        )}
      </div>

      {/* Register Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-xl rounded-[3rem] bg-white p-12 shadow-2xl dark:bg-[#0a0a0a] border-4 border-blue-600/10">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Volunteer Onboarding</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl text-gray-400"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleAddVolunteer} className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Full Name</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl px-6 py-4 font-black text-xl shadow-inner text-gray-900 dark:text-white" placeholder="NAME" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">University</label>
                <input required value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl px-6 py-4 font-bold text-sm shadow-inner text-gray-900 dark:text-white" placeholder="COLLEGE" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl px-6 py-4 font-bold text-sm shadow-inner text-gray-900 dark:text-white" placeholder="EMAIL" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Skills (Comma separated)</label>
                <input value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl px-6 py-4 font-bold text-sm shadow-inner text-gray-900 dark:text-white" placeholder="AI, PYTHON, LOGISTICS..." />
              </div>
              <button type="submit" className="col-span-2 mt-4 bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-600/40 uppercase tracking-[0.4em] text-xs hover:bg-blue-500 transition-all">Register Candidate</button>
            </form>
          </div>
        </div>
      )}

      {/* Advanced Management Hub */}
      {isManageOpen && selectedVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[4rem] bg-white shadow-2xl dark:bg-[#0a0a0a] dark:border-4 dark:border-zinc-800 flex flex-col">
            
            <div className="p-12 border-b dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-10">
                <div className="h-24 w-24 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30">
                  <User className="h-12 w-12" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">{selectedVolunteer.name}</h2>
                  <div className="flex items-center gap-6 mt-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      selectedVolunteer.status === 'Assigned' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>{selectedVolunteer.status}</span>
                    <span className="text-gray-300 dark:text-zinc-700">|</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4"/> Global Network</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsManageOpen(false)} className="p-4 bg-white dark:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-[1.5rem] shadow-xl transition-all border border-gray-100 dark:border-zinc-700">
                <X className="h-8 w-8" />
              </button>
            </div>

            <div className="flex px-12 border-b dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
              {[
                { id: "OVERVIEW", icon: Briefcase, label: "Dossier" },
                { id: "TASKS", icon: CheckSquare, label: "Assignments" },
                { id: "NOTES", icon: MessageSquare, label: "Admin Notes" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveManageTab(tab.id as any)}
                  className={`flex items-center gap-4 px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-4 ${
                    activeManageTab === tab.id 
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
              {activeManageTab === "OVERVIEW" && (
                <div className="space-y-12 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                      { l: "Joined GAIO", v: selectedVolunteer.joinedAt, i: Calendar },
                      { l: "Assigned Event", v: selectedVolunteer.event, i: MapPin },
                      { l: "Pending Tasks", v: selectedVolunteer.tasks.filter(t => t.status === 'Pending').length, i: ClipboardList },
                      { l: "Certification", v: selectedVolunteer.hasCertificate ? "ISSUED" : "PENDING", i: Award }
                    ].map(item => (
                      <div key={item.l} className="p-8 rounded-[2.5rem] border-2 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
                        <item.i className="h-6 w-6 text-blue-600 mb-4" />
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{item.l}</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white mt-1">{item.v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-10">
                      <h3 className="text-2xl font-black uppercase tracking-tighter italic border-l-4 border-blue-600 pl-6">Profile Details</h3>
                      <div className="space-y-6">
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Current Status</label>
                          <select 
                            value={selectedVolunteer.status}
                            onChange={(e) => updateVolunteer({...selectedVolunteer, status: e.target.value as any})}
                            className="w-full bg-gray-50 dark:bg-zinc-900 rounded-2xl px-6 py-4 font-black text-sm uppercase tracking-widest border-0"
                          >
                            <option>Applied</option><option>Onboarding</option><option>Approved</option><option>Assigned</option><option>Inactive</option>
                          </select>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Target Event</label>
                          <input value={selectedVolunteer.event} onChange={(e) => updateVolunteer({...selectedVolunteer, event: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-2xl px-6 py-4 font-bold text-sm border-0 shadow-inner" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Certification</label>
                            <button onClick={() => updateVolunteer({...selectedVolunteer, hasCertificate: !selectedVolunteer.hasCertificate})} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedVolunteer.hasCertificate ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-purple-50 hover:text-purple-600'}`}>
                              {selectedVolunteer.hasCertificate ? 'Revoke Cert' : 'Issue Cert'}
                            </button>
                          </div>
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Data Actions</label>
                            <button onClick={() => handleDeleteVolunteer(selectedVolunteer.id)} className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all">Delete Record</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-12 rounded-[3.5rem] bg-zinc-900 text-white relative overflow-hidden shadow-2xl">
                      <Award className="absolute -right-10 -bottom-10 h-64 w-64 opacity-10" />
                      <h3 className="text-3xl font-black italic tracking-tighter mb-8">Capabilities</h3>
                      <div className="space-y-8 relative z-10">
                        <div className="flex flex-wrap gap-3">
                          {selectedVolunteer.skills.map(s => (
                            <span key={s} className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">{s}</span>
                          ))}
                        </div>
                        <div className="pt-8 border-t border-white/10">
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-3">Professional Experience</p>
                          <p className="text-sm font-bold text-zinc-400 leading-relaxed italic">"{selectedVolunteer.experience}"</p>
                        </div>
                        <div className="pt-4">
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-3">Availability</p>
                          <p className="text-lg font-black">{selectedVolunteer.availability}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeManageTab === "TASKS" && (
                <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center">
                    <h3 className="text-4xl font-black uppercase tracking-tighter italic">Volunteer Checklist</h3>
                    <div className="flex gap-4">
                      <input 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="ASSIGN NEW TASK..." 
                        className="bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl px-8 py-4 font-black text-sm w-80 shadow-inner"
                      />
                      <button onClick={addTask} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl hover:scale-110 transition-all"><Plus className="w-6 h-6"/></button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {selectedVolunteer.tasks.length === 0 && <div className="p-20 border-4 border-dashed dark:border-zinc-800 rounded-[3rem] text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">No active tasks assigned</div>}
                    {selectedVolunteer.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-8 bg-gray-50/50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 dark:border-zinc-800 group hover:bg-white dark:hover:bg-[#0a0a0a] transition-all">
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => updateVolunteer({...selectedVolunteer, tasks: selectedVolunteer.tasks.map(t => t.id === task.id ? {...t, status: t.status === 'Completed' ? 'Pending' : 'Completed'} : t)})}
                            className={`h-10 w-10 rounded-2xl border-4 flex items-center justify-center transition-all ${task.status === 'Completed' ? 'bg-green-500 border-green-500 text-white shadow-xl' : 'border-gray-200 dark:border-zinc-700'}`}
                          >
                            {task.status === 'Completed' && <CheckCircle2 className="h-6 w-6" />}
                          </button>
                          <div>
                            <p className={`text-xl font-black uppercase tracking-tighter ${task.status === 'Completed' ? 'line-through opacity-30' : 'text-gray-900 dark:text-white'}`}>{task.title}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Due: {task.dueDate}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => updateVolunteer({...selectedVolunteer, tasks: selectedVolunteer.tasks.filter(t => t.id !== task.id)})}
                          className="p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeManageTab === "NOTES" && (
                <div className="space-y-12 animate-in zoom-in-95 duration-300">
                  <div className="p-12 rounded-[4rem] border-2 border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
                    <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 mb-8 italic"><MessageSquare className="h-8 w-8 text-blue-600" /> Admin Logs</h3>
                    <div className="flex gap-4">
                      <textarea 
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="ENTER LOG ENTRY..."
                        className="flex-1 bg-white dark:bg-[#0a0a0a] border-4 border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-8 font-bold text-sm shadow-2xl focus:border-blue-600 outline-none transition-all text-gray-900 dark:text-white h-32"
                      />
                      <button onClick={addNote} className="self-end bg-gray-900 dark:bg-white text-white dark:text-black p-6 rounded-[2rem] shadow-2xl hover:bg-blue-600 hover:text-white transition-all">
                        <Plus className="h-8 w-8" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {selectedVolunteer.notes.map((note) => (
                      <div key={note.id} className="p-10 bg-white dark:bg-[#111] rounded-[3rem] border-2 dark:border-zinc-800 shadow-sm relative group">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{note.author}</span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{note.timestamp}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-700 dark:text-zinc-300 leading-relaxed border-l-4 border-gray-100 dark:border-zinc-800 pl-6">{note.text}</p>
                        <button 
                          onClick={() => updateVolunteer({...selectedVolunteer, notes: selectedVolunteer.notes.filter(n => n.id !== note.id)})}
                          className="absolute top-8 right-8 p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t dark:border-zinc-800 text-center bg-gray-50/50 dark:bg-zinc-900/50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Volunteer Logistics System • v2.0.4</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
