"use client";

import { useState, useEffect } from "react";
import { Globe, MapPin, Plus, X } from "lucide-react";

const initialCountries = [
  { id: "UK", name: "United Kingdom", region: "Europe", status: "Active", students: "12,400", organiser: "TechEd UK" },
  { id: "JP", name: "Japan", region: "Asia", status: "Active", students: "8,200", organiser: "Japan AI Foundation" },
  { id: "BR", name: "Brazil", region: "Americas", status: "Active", students: "15,100", organiser: "EducaTech Brazil" },
  { id: "ZA", name: "South Africa", region: "Africa", status: "Pending Approval", students: "-", organiser: "AfriAI Connect" },
  { id: "AE", name: "United Arab Emirates", region: "Middle East", status: "Recruiting Organiser", students: "-", organiser: "N/A" },
  { id: "FR", name: "France", region: "Europe", status: "Active", students: "6,800", organiser: "France IA" },
];

export default function CountriesPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", region: "Europe" });

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [manageData, setManageData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('gaio_countries');
    if (saved) {
      try {
        setCountries(JSON.parse(saved));
      } catch (e) {
        setCountries(initialCountries);
      }
    } else {
      setCountries(initialCountries);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gaio_countries', JSON.stringify(countries));
    }
  }, [countries, isLoaded]);

  if (!isLoaded) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newCountry = {
      id: formData.name.substring(0, 2).toUpperCase(),
      name: formData.name,
      region: formData.region,
      status: "Recruiting Organiser",
      students: "-",
      organiser: "N/A"
    };

    setCountries([newCountry, ...countries]);
    setFormData({ name: "", region: "Europe" });
    setIsModalOpen(false);
  };

  const handleOpenManage = (country: any) => {
    setManageData(country);
    setIsManageOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setCountries(countries.map(c => c.id === manageData.id ? manageData : c));
    setIsManageOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this country from the network?")) {
      setCountries(countries.filter(c => c.id !== id));
      setIsManageOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Country Network Management</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Monitor and manage the global network of participating countries and their national organisers.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Add Country
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <div key={country.id} className="col-span-1 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-[#111]">
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">{country.name}</h3>
                  <span className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    country.status === 'Active' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400' :
                    country.status === 'Pending Approval' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-500' :
                    'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {country.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500 dark:text-zinc-400">{country.region}</p>
              </div>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                <MapPin className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-zinc-400">Organiser</span>
                <span className="font-medium text-gray-900 dark:text-white">{country.organiser}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500 dark:text-zinc-400">Students</span>
                <span className="font-medium text-gray-900 dark:text-white">{country.students}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                <button 
                  onClick={() => handleOpenManage(country)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Manage Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-[#111] dark:border dark:border-zinc-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Country</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Country Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Region</label>
                  <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800">
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Americas">Americas</option>
                    <option value="Africa">Africa</option>
                    <option value="Middle East">Middle East</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Add Country</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Modal */}
      {isManageOpen && manageData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-[#111] dark:border dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Country: {manageData.name}</h2>
              <button onClick={() => setIsManageOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Status</label>
                  <select value={manageData.status} onChange={(e) => setManageData({...manageData, status: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800">
                    <option value="Active">Active</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Recruiting Organiser">Recruiting Organiser</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Region</label>
                  <select value={manageData.region} onChange={(e) => setManageData({...manageData, region: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800">
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Americas">Americas</option>
                    <option value="Africa">Africa</option>
                    <option value="Middle East">Middle East</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Organiser Name</label>
                <input type="text" value={manageData.organiser} onChange={(e) => setManageData({...manageData, organiser: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Students Reached</label>
                <input type="text" value={manageData.students} onChange={(e) => setManageData({...manageData, students: e.target.value})} className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 dark:bg-[#1a1a1a] dark:text-white dark:ring-zinc-800" />
              </div>
              <div className="mt-8 flex justify-between items-center pt-6 border-t dark:border-zinc-800">
                <button type="button" onClick={() => handleDelete(manageData.id)} className="text-sm font-bold text-red-600 hover:text-red-500">Remove Country</button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsManageOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
                  <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-500">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
