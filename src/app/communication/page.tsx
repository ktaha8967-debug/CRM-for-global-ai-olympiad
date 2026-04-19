"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Send, 
  Hash, 
  Plus, 
  Search, 
  Users, 
  Bell, 
  Megaphone, 
  Globe, 
  MessageSquare,
  Shield,
  Filter,
  Reply,
  X,
  Clock,
  Star
} from "lucide-react";

const initialChannels = [
  { id: "ch-1", name: "Global Announcements", type: "ANNOUNCEMENT", description: "Official updates from GAIO Leadership", target: "ALL" },
  { id: "ch-2", name: "Regional Coordination - Europe", type: "REGIONAL", description: "Coordination for European national organisers", target: "ORGANISER" },
  { id: "ch-3", name: "Volunteer Network", type: "GENERAL", description: "General discussion for all global volunteers", target: "VOLUNTEER" },
  { id: "ch-4", name: "Technical Support", type: "SUPPORT", description: "Platform and competition technical help", target: "ALL" },
  { id: "ch-5", name: "Sponsor & Partners", type: "PARTNER", description: "Communication with global sponsors", target: "SPONSOR" },
];

const mockMessages = [
  { id: "m1", channelId: "ch-1", sender: "Super Admin", role: "SUPER_ADMIN", content: "Welcome to the new GAIO Command Communication system. All major announcements will be posted here.", time: "10:30 AM", target: "ALL", isAdminMsg: true },
];

const directory = [
  { name: "James Wilson", role: "Country Director", country: "United Kingdom", online: true },
  { name: "Yuki Tanaka", role: "Regional Coordinator", country: "Japan", online: true },
  { name: "Carlos Silva", role: "Event Organiser", country: "Brazil", online: false },
  { name: "Zanele Mbeki", role: "Global Admin", country: "South Africa", online: true },
];

export default function CommunicationPage() {
  const { user, addNotification } = useAuth();
  
  const [channels, setChannels] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gaio_channels_v2');
      if (saved) return JSON.parse(saved);
    }
    return initialChannels.map(c => ({
      ...c,
      mode: c.type === 'ANNOUNCEMENT' ? 'ONE_WAY' : 'TWO_WAY',
      allowedToMessage: ['SUPER_ADMIN', 'ADMIN', c.target || 'ALL']
    }));
  });

  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [targetType, setTargetType] = useState("ALL");
  
  // Modals
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isManagePermissions, setIsManagePermissions] = useState(false);
  
  // New Channel Form
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    type: "GENERAL",
    mode: "TWO_WAY",
    allowedToMessage: ["ALL"]
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMsgs = localStorage.getItem('gaio_messages_v2');
    if (savedMsgs) {
      setAllMessages(JSON.parse(savedMsgs));
    } else {
      setAllMessages(mockMessages);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gaio_messages_v2', JSON.stringify(allMessages));
      localStorage.setItem('gaio_channels_v2', JSON.stringify(channels));
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [allMessages, channels, isLoaded]);

  // Filter messages for the active channel
  const filteredMessages = allMessages.filter(m => m.channelId === activeChannel.id);

  const canUserMessage = () => {
    if (!user) return false;
    const userRole = user.roles?.[0] || user.role;
    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    
    if (isAdmin) return true;
    if (activeChannel.mode === 'ONE_WAY') return false;
    
    if (activeChannel.allowedToMessage.includes('ALL')) return true;
    return activeChannel.allowedToMessage.includes(userRole);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !canUserMessage()) return;

    const isAdmin = user.roles?.includes('SUPER_ADMIN') || user.role === 'SUPER_ADMIN';
    
    const msg = {
      id: `m-${Date.now()}`,
      channelId: activeChannel.id,
      sender: user.name,
      role: user.roles?.[0] || user.role,
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      target: isAdmin ? targetType : 'ALL',
      replyTo: replyTo ? {
        sender: replyTo.sender,
        content: replyTo.content
      } : null,
      isAdminMsg: isAdmin
    };

    setAllMessages([...allMessages, msg]);
    addNotification(`New message in ${activeChannel.name}`, "Global Communication");
    setNewMessage("");
    setReplyTo(null);
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const channel = {
      ...newChannel,
      id: `ch-${Date.now()}`,
      target: newChannel.allowedToMessage[0] || 'ALL'
    };
    setChannels([...channels, channel]);
    setIsCreatingChannel(false);
    setActiveChannel(channel);
    addNotification(`New channel created: ${channel.name}`, "Communication");
  };

  const updatePermissions = (roles: string[]) => {
    const updated = channels.map((c: any) => 
      c.id === activeChannel.id ? { ...c, allowedToMessage: roles } : c
    );
    setChannels(updated);
    const updatedActive = updated.find((c: any) => c.id === activeChannel.id);
    if (updatedActive) setActiveChannel(updatedActive);
    setIsManagePermissions(false);
    addNotification(`Permissions updated for ${activeChannel.name}`, "Security");
  };

  const toggleMode = () => {
    const newMode = activeChannel.mode === 'ONE_WAY' ? 'TWO_WAY' : 'ONE_WAY';
    const updated = channels.map((c: any) => 
      c.id === activeChannel.id ? { ...c, mode: newMode } : c
    );
    setChannels(updated);
    const updatedActive = updated.find((c: any) => c.id === activeChannel.id);
    if (updatedActive) setActiveChannel(updatedActive);
    addNotification(`Channel mode changed to ${newMode}`, "Communication");
  };

  if (!isLoaded) return null;

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 overflow-hidden animate-in fade-in duration-500">
      {/* Channels Sidebar */}
      <div className="flex w-72 flex-col rounded-[2rem] border-2 border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111]">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-zinc-800">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">System Channels</h2>
          <button onClick={() => setIsCreatingChannel(true)} className="rounded-xl p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:scale-110 transition-transform"><Plus className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                activeChannel.id === channel.id
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30"
                  : "text-gray-500 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
              }`}
            >
              {channel.type === 'ANNOUNCEMENT' ? <Megaphone className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
              <span className="flex-1 text-left">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col rounded-[2.5rem] border-2 border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0a0a0a] overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-50 p-6 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              {activeChannel.type === 'ANNOUNCEMENT' ? <Megaphone className="h-6 w-6" /> : <Hash className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white italic">{activeChannel.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">{activeChannel.description}</p>
            </div>
          </div>
          
          {(user?.role === 'SUPER_ADMIN' || user?.roles?.includes('SUPER_ADMIN')) && (
            <button 
              onClick={() => setIsManagePermissions(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border-2 border-gray-100 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              <Shield className="h-4 w-4 text-blue-600" />
              Manage Permissions
            </button>
          )}
        </div>

        {/* Message History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#efe7de] dark:bg-zinc-950/50">
          {filteredMessages.map((msg) => {
            const isMe = msg.sender === user?.name;
            const showOnRight = isMe;

            return (
              <div key={msg.id} className={`flex flex-col ${showOnRight ? 'items-end' : 'items-start'}`}>
                {msg.replyTo && (
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/50 dark:bg-zinc-800/50 px-4 py-1.5 rounded-full backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50">
                    <Reply className="w-3 h-3" />
                    Replying to <span className="text-blue-600">{msg.replyTo.sender}</span>
                  </div>
                )}
                
                <div className={`flex gap-3 max-w-[80%] group ${showOnRight ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-black text-xs shadow-sm ${
                    showOnRight ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-white text-gray-600 border-gray-100'
                  }`}>
                    {msg.sender.charAt(0)}
                  </div>

                  <div className={`flex flex-col ${showOnRight ? 'items-end' : 'items-start'}`}>
                    {/* Message Bubble */}
                    <div className={`relative p-4 rounded-2xl text-sm font-bold leading-relaxed shadow-sm ${
                      showOnRight 
                        ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none dark:bg-blue-900/40 dark:text-blue-50' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800'
                    }`}>
                      {msg.content}
                      
                      {/* Reply Button for Others' Messages */}
                      {!showOnRight && (
                        <button 
                          onClick={() => setReplyTo(msg)}
                          className="absolute -right-10 top-0 p-2 opacity-0 group-hover:opacity-100 transition-all text-gray-400 hover:text-blue-600"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                      )}
                      {showOnRight && (
                        <button 
                          onClick={() => setReplyTo(msg)}
                          className="absolute -left-10 top-0 p-2 opacity-0 group-hover:opacity-100 transition-all text-gray-400 hover:text-blue-600"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Sender Info Below Bubble */}
                    <div className={`mt-1.5 flex items-center gap-2 px-1 ${showOnRight ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        msg.isAdminMsg ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {msg.role?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-[9px] font-bold text-gray-400">{msg.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Indicator */}
        {replyTo && (
          <div className="px-8 py-3 bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-100 dark:border-blue-900/30 flex justify-between items-center animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <Reply className="w-4 h-4 text-blue-600" />
              <div className="text-xs">
                <span className="font-black text-blue-600 uppercase tracking-widest">Replying to {replyTo.sender}</span>
                <p className="text-gray-500 truncate w-64 italic">"{replyTo.content}"</p>
              </div>
            </div>
            <button onClick={() => setReplyTo(null)} className="p-1.5 hover:bg-white rounded-full transition-all"><X className="w-4 h-4 text-gray-400" /></button>
          </div>
        )}

        {/* Message Input */}
        <div className="p-6 border-t-2 border-gray-100 dark:border-zinc-800 bg-white dark:bg-transparent">
          {!canUserMessage() ? (
            <div className="flex items-center justify-center gap-3 py-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
              <Shield className="h-5 w-5 text-gray-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                {activeChannel.mode === 'ONE_WAY' ? 'Broadcast Only Channel (Read Only)' : `Only ${activeChannel.allowedToMessage.join(', ')} can message here`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage}>
              <div className="relative flex items-center gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={replyTo ? `Replying to ${replyTo.sender}...` : "Type your message..."}
                  className="flex-1 bg-gray-50 dark:bg-zinc-900 border-0 rounded-[1.5rem] py-4 px-6 font-bold text-sm shadow-inner text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <button type="submit" className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 hover:scale-105 hover:bg-blue-500 transition-all">
                  <Send className="h-6 w-6" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Directory Sidebar */}
      <div className="flex w-72 flex-col rounded-[2rem] border-2 border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111]">
        <div className="border-b border-gray-100 p-6 dark:border-zinc-800">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Personnel</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {directory.map((user) => (
            <div key={user.name} className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs font-black text-blue-600">
                  {user.name.charAt(0)}
                </div>
                {user.online && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-[#111] animate-pulse" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="truncate text-xs font-black text-gray-900 dark:text-white uppercase">{user.name}</h4>
                <p className="truncate text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      {isCreatingChannel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border-2 border-gray-100 dark:border-zinc-800 shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Initialize Channel</h2>
              <button onClick={() => setIsCreatingChannel(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-all"><X className="h-6 w-6 text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest px-1">Channel Name</label>
                <input required value={newChannel.name} onChange={e => setNewChannel({...newChannel, name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-2xl px-5 py-3 font-bold border-0 focus:ring-2 focus:ring-blue-600" placeholder="e.g. global-coordination" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest px-1">Description</label>
                <input required value={newChannel.description} onChange={e => setNewChannel({...newChannel, description: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-2xl px-5 py-3 font-bold border-0 focus:ring-2 focus:ring-blue-600" placeholder="Purpose of this channel..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest px-1">Mode</label>
                  <select value={newChannel.mode} onChange={e => setNewChannel({...newChannel, mode: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-2xl px-5 py-3 font-bold border-0 focus:ring-2 focus:ring-blue-600">
                    <option value="TWO_WAY">Everyone Can Talk</option>
                    <option value="ONE_WAY">Broadcast Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest px-1">Target Audience</label>
                  <select value={newChannel.target} onChange={e => setNewChannel({...newChannel, target: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-2xl px-5 py-3 font-bold border-0 focus:ring-2 focus:ring-blue-600">
                    <option value="ALL">Everyone</option>
                    <option value="ORGANISER">Organisers Only</option>
                    <option value="SPONSOR">Sponsors Only</option>
                    <option value="VOLUNTEER">Volunteers Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest px-1">Channel Type</label>
                <select value={newChannel.type} onChange={e => setNewChannel({...newChannel, type: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-2xl px-5 py-3 font-bold border-0 focus:ring-2 focus:ring-blue-600">
                  <option value="GENERAL">General Discussion</option>
                  <option value="ANNOUNCEMENT">Official Announcement</option>
                  <option value="REGIONAL">Regional Focus</option>
                  <option value="SUPPORT">Technical Support</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsCreatingChannel(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-105 transition-all">Establish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isManagePermissions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border-2 border-gray-100 dark:border-zinc-800 shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Access Control</h2>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{activeChannel.name}</p>
              </div>
              <button onClick={() => setIsManagePermissions(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-all"><X className="h-6 w-6 text-gray-400" /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-3 tracking-widest px-1">Communication Flow</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => toggleMode()}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      activeChannel.mode === 'ONE_WAY' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-zinc-800'
                    }`}
                  >
                    <Megaphone className={`h-6 w-6 ${activeChannel.mode === 'ONE_WAY' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">One Way</span>
                  </button>
                  <button 
                    onClick={() => toggleMode()}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      activeChannel.mode === 'TWO_WAY' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-zinc-800'
                    }`}
                  >
                    <MessageSquare className={`h-6 w-6 ${activeChannel.mode === 'TWO_WAY' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Two Way</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-3 tracking-widest px-1">Message Privileges</label>
                <div className="space-y-2">
                  {[
                    { id: 'ALL', label: 'Everyone' },
                    { id: 'ORGANISER', label: 'Organisers Only' },
                    { id: 'SPONSOR', label: 'Sponsors Only' },
                    { id: 'VOLUNTEER', label: 'Volunteers Only' }
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => updatePermissions(['SUPER_ADMIN', 'ADMIN', role.id])}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        activeChannel.allowedToMessage.includes(role.id) ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-zinc-800'
                      }`}
                    >
                      <span className="text-xs font-bold">{role.label}</span>
                      {activeChannel.allowedToMessage.includes(role.id) && <Shield className="h-4 w-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
