"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shield, User, Lock, Mail, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function InviteOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invite, setInvite] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Verify token from localStorage
    const invites = JSON.parse(localStorage.getItem('gaio_invites') || '[]');
    const found = invites.find((i: any) => i.token === token && !i.used);
    
    if (found) {
      setInvite(found);
    } else {
      setError("This invitation link is invalid or has already been used.");
    }
    setIsVerifying(false);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    setIsSubmitting(true);
    
    try {
      // 1. Create the user
      const newUser = {
        id: `U-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roles: invite.roles,
        allowedSections: invite.allowedSections,
        status: "Active",
        lastLogin: "Never"
      };

      const users = JSON.parse(localStorage.getItem('gaio_system_users_v3') || '[]');
      localStorage.setItem('gaio_system_users_v3', JSON.stringify([...users, newUser]));

      // 2. Mark invite as used
      const invites = JSON.parse(localStorage.getItem('gaio_invites') || '[]');
      const updatedInvites = invites.map((i: any) => i.token === token ? { ...i, used: true } : i);
      localStorage.setItem('gaio_invites', JSON.stringify(updatedInvites));

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      alert("Failed to provision account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-[3rem] p-12 shadow-2xl border-4 border-red-600/10 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Invalid Token</h1>
        <p className="text-sm text-gray-500 font-bold leading-relaxed mb-8">{error}</p>
        <button onClick={() => router.push('/login')} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Return to Gateway</button>
      </div>
    </div>
  );

  if (isSuccess) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-[3rem] p-12 shadow-2xl border-4 border-green-600/10 text-center animate-in zoom-in-95 duration-500">
        <div className="h-20 w-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Identity Provisioned</h1>
        <p className="text-sm text-gray-500 font-bold leading-relaxed mb-8">Your account has been successfully created. Redirecting to secure gateway...</p>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-green-600 animate-progress origin-left"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#050505] p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-12">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/40">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">Join GAIO Network</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            {invite.roles.map((r: string) => (
              <span key={r} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                {r.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] rounded-[3rem] p-12 shadow-2xl border-4 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User className="h-32 w-32" />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  required 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="IDENTITY NAME" 
                  className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm shadow-inner text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Secure Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  required 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="COMMUNICATION ENDPOINT" 
                  className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm shadow-inner text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Access Cipher</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    required 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="PASSWORD" 
                    className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm shadow-inner text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Confirm Cipher</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    required 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="REPEAT" 
                    className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm shadow-inner text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all" 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-4 bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-600/40 uppercase tracking-[0.4em] text-xs hover:bg-blue-500 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              Provision My Account
              <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
          GAIO Global Infrastructure • Secure Onboarding Portal v3.1
        </p>
      </div>
    </div>
  );
}
