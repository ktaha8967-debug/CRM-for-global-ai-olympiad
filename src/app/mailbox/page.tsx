"use client";

import { useState, useEffect } from "react";
import { 
  Inbox, 
  Send, 
  Trash2, 
  Settings, 
  PenSquare, 
  Search, 
  Mail, 
  Clock,
  MoreVertical,
  X,
  Paperclip,
  RefreshCw,
  Star,
  Archive,
  AlertCircle,
  CheckCircle2,
  FolderOpen
} from "lucide-react";

export default function MailboxPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [activeFolder, setActiveFolder] = useState("INBOX");
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  
  // Accounts State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Modals
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSmtpOpen, setIsSmtpOpen] = useState(false);

  // Forms
  const [composeData, setComposeData] = useState({ to: "", subject: "", body: "" });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gaio_mail_accounts_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAccounts(parsed);
        if (parsed.length > 0) setSelectedAccount(parsed[0]);
      } else {
        // Fallback to legacy
        const legacy = localStorage.getItem('gaioMailConfig');
        if (legacy) {
          const config = JSON.parse(legacy);
          const initial = [{ ...config, id: 'legacy', name: 'Global Main', category: 'Global' }];
          setAccounts(initial);
          setSelectedAccount(initial[0]);
        }
      }
    }
  }, []);

  const fetchEmails = async (labelId = activeFolder) => {
    if (!selectedAccount || !selectedAccount.user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mailbox/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labelId,
          imapHost: selectedAccount.imapHost,
          imapPort: selectedAccount.imapPort,
          user: selectedAccount.user,
          pass: selectedAccount.pass
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Connection failed");
      setEmails(data);
      if (data.length > 0 && data[0].isGmail) setIsGmailConnected(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [activeFolder, selectedAccount]);

  const handleGmailConnect = () => {
    window.location.href = '/api/auth/google';
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeData.to || !composeData.subject || !selectedAccount) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/mailbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: selectedAccount.smtpHost,
          smtpPort: selectedAccount.smtpPort,
          user: selectedAccount.user,
          pass: selectedAccount.pass,
          to: composeData.to,
          subject: composeData.subject,
          body: composeData.body
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send email");

      setIsComposeOpen(false);
      setComposeData({ to: "", subject: "", body: "" });
      alert("Email sent successfully!");
      fetchEmails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStar = (id: string) => {
    setEmails(emails.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  };

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In this view, we just allow temporary override or redirect to admin
    alert("Please use the Admin Panel to permanently configure mail accounts.");
    setIsSmtpOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 overflow-hidden relative">
      
      {/* Mail Sidebar */}
      <div className="flex w-64 flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111]">
        <div className="p-4 space-y-3">
          {/* Account Switcher */}
          <div className="relative group">
            <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block px-1">Active Mailbox</label>
            <select 
              value={selectedAccount?.id || ""} 
              onChange={(e) => setSelectedAccount(accounts.find(a => a.id === e.target.value))}
              className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-lg px-3 py-2 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.category}: {acc.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-[26px] pointer-events-none text-blue-600">
              <MoreVertical className="h-3 w-3" />
            </div>
          </div>

          <button 
            onClick={() => setIsComposeOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <PenSquare className="h-4 w-4" />
            Compose
          </button>
          
          {!isGmailConnected && (
            <button 
              onClick={handleGmailConnect}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <img src="https://www.google.com/favicon.ico" className="h-4 w-4" alt="Google" />
              Connect Gmail
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-1 px-3">
            {[
              { id: "INBOX", label: "Inbox", icon: Inbox },
              { id: "STARRED", label: "Starred", icon: Star },
              { id: "SENT", label: "Sent", icon: Send },
              { id: "TRASH", label: "Trash", icon: Trash2 },
              { id: "SPAM", label: "Spam", icon: AlertCircle },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveFolder(item.id); setSelectedEmail(null); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeFolder === item.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                }`}
              >
                <item.icon className={`h-4 w-4 ${activeFolder === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Email List */}
      <div className={`flex w-96 flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111] ${selectedEmail ? 'hidden lg:flex' : 'flex-1'}`}>
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-zinc-800">
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search mail..." className="w-full rounded-md border-0 bg-gray-50 py-2 pl-9 text-sm ring-1 ring-inset ring-gray-200 dark:bg-zinc-800/50 dark:text-white dark:ring-zinc-800" />
          </div>
          <button onClick={() => fetchEmails()} disabled={isLoading} className={`p-2 text-gray-500 hover:text-blue-600 rounded-md ${isLoading ? 'animate-spin' : ''}`}>
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        
        {error && (
          <div className="p-3 m-4 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-100 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {emails.length === 0 && !isLoading ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400 opacity-40">
              <Mail className="h-12 w-12 mb-2" />
              <p className="text-sm">Empty folder</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
              {emails.map((email) => (
                <li key={email.id} className="relative group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 transition-opacity ${!email.read ? 'opacity-100' : 'opacity-0'}`} />
                  <div className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer ${selectedEmail?.id === email.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`} onClick={() => setSelectedEmail(email)}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }}
                      className={`shrink-0 transition-colors ${email.starred ? 'text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`}
                    >
                      <Star className={`h-4 w-4 ${email.starred ? 'fill-current' : ''}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm truncate pr-2 ${!email.read ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-400'}`}>
                          {email.sender}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{email.date}</span>
                      </div>
                      <p className={`text-sm truncate ${!email.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500 truncate mt-0.5">
                        {email.preview}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Reading Pane */}
      <div className={`flex flex-1 flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111] ${!selectedEmail ? 'hidden lg:flex' : 'flex'}`}>
        {selectedEmail ? (
          <>
            <div className="border-b border-gray-100 p-6 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedEmail(null)} className="lg:hidden p-2 -ml-2 text-gray-400"><X className="h-5 w-5" /></button>
                  <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-md dark:hover:bg-zinc-800"><Archive className="h-5 w-5" /></button>
                  <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-md dark:hover:bg-zinc-800"><Trash2 className="h-5 w-5" /></button>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <span className="bg-gray-100 px-2 py-1 rounded dark:bg-zinc-800">{activeFolder}</span>
                  <MoreVertical className="h-5 w-5" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{selectedEmail.subject}</h2>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedEmail.sender.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">{selectedEmail.sender}</span>
                    <span className="text-xs text-gray-500">{selectedEmail.date}</span>
                  </div>
                  <div className="text-xs text-gray-500">to me</div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 prose prose-blue dark:prose-invert max-w-none">
              <div className="text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {selectedEmail.content}
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-400 opacity-20">
            <Mail className="h-24 w-12 mb-4" />
            <p className="text-lg font-medium">No conversation selected</p>
          </div>
        )}
      </div>

      {/* Compose & Config Modals remain similar but with updated styling */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl dark:bg-[#111] dark:border dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
              <span className="text-sm font-bold">New Message</span>
              <button onClick={() => setIsComposeOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSendEmail} className="p-0">
              <input type="email" placeholder="Recipients" required value={composeData.to} onChange={(e) => setComposeData({...composeData, to: e.target.value})} className="w-full px-6 py-3 border-b dark:border-zinc-800 bg-transparent focus:ring-0" />
              <input type="text" placeholder="Subject" required value={composeData.subject} onChange={(e) => setComposeData({...composeData, subject: e.target.value})} className="w-full px-6 py-3 border-b dark:border-zinc-800 bg-transparent focus:ring-0" />
              <textarea placeholder="Write your message..." required value={composeData.body} onChange={(e) => setComposeData({...composeData, body: e.target.value})} className="w-full h-96 px-6 py-4 bg-transparent focus:ring-0 resize-none" />
              <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-900/50 flex justify-between items-center">
                <button type="button" className="text-gray-400 hover:text-gray-600"><Paperclip className="h-5 w-5" /></button>
                <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">Send</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSmtpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 dark:bg-[#111] dark:border dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-6">Manual Mail Config</h2>
            <form onSubmit={handleConfigSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="IMAP Host" value={mailConfig.imapHost} onChange={e => setMailConfig({...mailConfig, imapHost: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-zinc-900 dark:border-zinc-800" />
                <input placeholder="IMAP Port" value={mailConfig.imapPort} onChange={e => setMailConfig({...mailConfig, imapPort: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-zinc-900 dark:border-zinc-800" />
              </div>
              <input placeholder="Email User" value={mailConfig.user} onChange={e => setMailConfig({...mailConfig, user: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-zinc-900 dark:border-zinc-800" />
              <input type="password" placeholder="Password / App Password" value={mailConfig.pass} onChange={e => setMailConfig({...mailConfig, pass: e.target.value})} className="w-full p-2.5 rounded-lg border dark:bg-zinc-900 dark:border-zinc-800" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsSmtpOpen(false)} className="flex-1 py-2.5 rounded-lg border dark:border-zinc-800 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700">Save & Sync</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
