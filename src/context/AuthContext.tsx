"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  allowedSections?: string[];
}

interface Notification {
  id: string;
  message: string;
  section: string;
  timestamp: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  notifications: Notification[];
  addNotification: (message: string, section: string) => void;
  clearNotifications: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { user: sbUser } = session;
          setUser({
            id: sbUser.id,
            name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
            email: sbUser.email || '',
            role: sbUser.user_metadata?.role || (sbUser.email === 'admin@gaio.uk' ? 'SUPER_ADMIN' : 'USER'),
            roles: sbUser.user_metadata?.roles || (sbUser.email === 'admin@gaio.uk' ? ['SUPER_ADMIN', 'GLOBAL_ADMIN'] : ['USER']),
            allowedSections: sbUser.user_metadata?.allowedSections || (sbUser.email === 'admin@gaio.uk' ? [
              "Global Dashboard", "Global Communication", "Global Mailbox", "Country Network",
              "Organiser Management", "Organiser Mailbox", "Sponsors & Partners", "Sponsor Mailbox",
              "Tender Management", "Event Management", "Volunteer Network", "Volunteer Mailbox",
              "Recognition", "Settings"
            ] : ["Global Dashboard", "Settings"])
          });
        }
      } catch (err) {
        console.error("Error checking Supabase session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const { user: sbUser } = session;
        setUser({
          id: sbUser.id,
          name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
          email: sbUser.email || '',
          role: sbUser.user_metadata?.role || (sbUser.email === 'admin@gaio.uk' ? 'SUPER_ADMIN' : 'USER'),
          roles: sbUser.user_metadata?.roles || (sbUser.email === 'admin@gaio.uk' ? ['SUPER_ADMIN', 'GLOBAL_ADMIN'] : ['USER']),
          allowedSections: sbUser.user_metadata?.allowedSections || (sbUser.email === 'admin@gaio.uk' ? [
            "Global Dashboard", "Global Communication", "Global Mailbox", "Country Network",
            "Organiser Management", "Organiser Mailbox", "Sponsors & Partners", "Sponsor Mailbox",
            "Tender Management", "Event Management", "Volunteer Network", "Volunteer Mailbox",
            "Recognition", "Settings"
          ] : ["Global Dashboard", "Settings"])
        });
      } else {
        setUser(null);
      }
    });

    const savedNotifs = localStorage.getItem('gaio_notifications_list');
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addNotification = (message: string, section: string) => {
    setNotifications(prev => {
      const newNotif: Notification = {
        id: Date.now().toString(),
        message,
        section,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const next = [newNotif, ...prev].slice(0, 20); // Keep last 20
      localStorage.setItem('gaio_notifications_list', JSON.stringify(next));
      return next;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('gaio_notifications_list', JSON.stringify([]));
  };

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
      return;
    }

    // GLOBAL PAGE-LEVEL SECURITY GUARD
    if (!isLoading && user) {
      const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.roles?.includes('SUPER_ADMIN');
      if (!isSuperAdmin) {
        // Map pathnames to Section Names used in permissions
        const pathMap: Record<string, string> = {
          '/': 'Global Dashboard',
          '/communication': 'Global Communication',
          '/mailbox': 'Global Mailbox',
          '/countries': 'Country Network',
          '/organisers': 'Organiser Management',
          '/organisers/mailbox': 'Organiser Mailbox',
          '/sponsors': 'Sponsors & Partners',
          '/sponsors/mailbox': 'Sponsor Mailbox',
          '/tenders': 'Tender Management',
          '/events': 'Event Management',
          '/volunteers': 'Volunteer Network',
          '/volunteers/mailbox': 'Volunteer Mailbox',
          '/recognition': 'Recognition',
          '/settings': 'Settings',
          '/admin': 'Admin Console'
        };

        const currentSection = pathMap[pathname];
        
        // If the section is known and not allowed, block access
        // Note: We always allow access to Dashboard and Settings as fallback
        if (currentSection && 
            currentSection !== 'Global Dashboard' && 
            currentSection !== 'Settings' &&
            !user.allowedSections?.includes(currentSection)) {
          
          alert(`Access Denied: You do not have permission to view the ${currentSection} section.`);
          router.push('/');
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        console.error('Supabase login error:', error.message);
        return false;
      }

      if (data.user) {
        router.push('/');
        return true;
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
    }
    return false;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, notifications, addNotification, clearNotifications }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
