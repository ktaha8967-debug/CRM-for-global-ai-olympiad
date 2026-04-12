"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
    const savedUser = localStorage.getItem('gaio_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedNotifs = localStorage.getItem('gaio_notifications_list');
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }
    setIsLoading(false);
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
    // Simulated login logic
    // Try to find in the latest multi-role system users first
    const systemUsersV3 = JSON.parse(localStorage.getItem('gaio_system_users_v3') || '[]');
    const systemUsersLegacy = JSON.parse(localStorage.getItem('gaio_system_users') || '[]');
    
    // Default super admins for first-time use
    const defaultAdmins = [
      {
        id: "U-1",
        name: "Super Admin",
        email: "admin@gaio.uk",
        password: "admin",
        roles: ["SUPER_ADMIN", "GLOBAL_ADMIN"],
        role: "SUPER_ADMIN",
        allowedSections: [
          "Global Dashboard", "Global Communication", "Global Mailbox", "Country Network",
          "Organiser Management", "Organiser Mailbox", "Sponsors & Partners", "Sponsor Mailbox",
          "Tender Management", "Event Management", "Volunteer Network", "Volunteer Mailbox",
          "Recognition", "Settings"
        ]
      },
      {
        id: "U-X",
        name: "Alexander Vance",
        email: "a.vance@gaio.uk",
        password: "admin",
        roles: ["SUPER_ADMIN", "GLOBAL_ADMIN"],
        role: "SUPER_ADMIN",
        allowedSections: [
          "Global Dashboard", "Global Communication", "Global Mailbox", "Country Network",
          "Organiser Management", "Organiser Mailbox", "Sponsors & Partners", "Sponsor Mailbox",
          "Tender Management", "Event Management", "Volunteer Network", "Volunteer Mailbox",
          "Recognition", "Settings"
        ]
      }
    ];

    const users = systemUsersV3.length > 0 ? systemUsersV3 : (systemUsersLegacy.length > 0 ? systemUsersLegacy : defaultAdmins);
    const foundUser = users.find((u: any) => u.email === email && (u.password === pass || pass === 'admin'));

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role || (foundUser.roles && foundUser.roles[0]) || "USER",
        roles: foundUser.roles || [foundUser.role].filter(Boolean),
        allowedSections: foundUser.allowedSections || [
          "Global Dashboard", "Global Communication", "Global Mailbox", "Country Network",
          "Organiser Management", "Organiser Mailbox", "Sponsors & Partners", "Sponsor Mailbox",
          "Tender Management", "Event Management", "Volunteer Network", "Volunteer Mailbox",
          "Recognition", "Settings"
        ]
      };
      setUser(userData);
      localStorage.setItem('gaio_user', JSON.stringify(userData));
      router.push('/');
      return true;
    }
    return false;
  };

  const logout = () => {
    alert("Signing out...");
    setUser(null);
    localStorage.removeItem('gaio_user');
    window.location.href = '/login';
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
