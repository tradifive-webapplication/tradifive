import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Camera, ExternalLink, Check, ChevronDown, CheckCircle2, Circle, ArrowRight, ChevronsUpDown, User, Crown, Briefcase } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import defaultAvatar from '@/assets/default-avatar.svg';

const SearchableCombobox = ({ value, onChange, items, placeholder, disabled }: any) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search) return items.slice(0, 50);
    return items.filter((item: any) => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 50);
  }, [items, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all disabled:opacity-50",
            !value && "text-slate-500"
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
             placeholder={`Search ${placeholder.toLowerCase()}...`} 
             value={search} 
             onValueChange={setSearch} 
          />
          <CommandList>
            <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item: any) => (
                <CommandItem
                  key={item.name}
                  value={item.name}
                  onSelect={() => {
                    onChange(item.name);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function ProfileTab({ 
   profile, 
   setProfile, 
   privacySettings, 
   setPrivacySettings, 
   avatarUploadRef, 
   bannerUploadRef,
   isInitialLoading 
}: any) {
   const [newTag, setNewTag] = useState('');
   const [isAddingTag, setIsAddingTag] = useState(false);
   const tags = profile.tags || [];

   const handleAddTag = () => {
       if (newTag.trim() && tags.length < 3) {
           setProfile({ ...profile, tags: [...tags, newTag.trim()] });
           setNewTag('');
           setIsAddingTag(false);
       }
   };

   const handleRemoveTag = (indexToRemove: number) => {
       setProfile({ ...profile, tags: tags.filter((_: string, idx: number) => idx !== indexToRemove) });
   };

   const countries = useMemo(() => Country.getAllCountries(), []);
   const selectedCountryCode = useMemo(() => countries.find(c => c.name === profile.country)?.isoCode, [profile.country, countries]);
   
   const states = useMemo(() => selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) || [] : [], [selectedCountryCode]);
   const selectedStateCode = useMemo(() => states.find(s => s.name === profile.state)?.isoCode, [profile.state, states]);
   
   const cities = useMemo(() => (selectedCountryCode && selectedStateCode) ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) || [] : [], [selectedCountryCode, selectedStateCode]);

   const completenessChecks = useMemo(() => {
      const checks = {
         hasAvatar: !!profile.avatarUrl,
         hasBanner: !!profile.bannerUrl,
         hasTags: tags && tags.length > 0,
         hasBio: !!profile.bio && profile.bio.trim().length > 0,
         hasSocial: !!profile.website
      };
      const completedCount = Object.values(checks).filter(Boolean).length;
      return {
         ...checks,
         percentage: Math.round((completedCount / 5) * 100)
      };
   }, [profile.avatarUrl, profile.bannerUrl, tags, profile.bio, profile.website]);

    return (
       <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Column - Controls */}
          {isInitialLoading ? (
              <div className="flex-1 space-y-6 animate-pulse">
                  <div className="bg-white dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-[#333333] p-6 shadow-sm">
                      <div className="h-6 w-48 bg-slate-200 dark:bg-[#333] rounded mb-6"></div>
                      <div className="h-40 rounded-xl bg-slate-200 dark:bg-[#202020] mb-16 relative">
                          <div className="absolute -bottom-10 left-6">
                              <div className="w-24 h-24 rounded-full border-[6px] border-white dark:border-[#151515] bg-slate-300 dark:bg-[#333]"></div>
                          </div>
                      </div>
                      <div className="space-y-4">
                          <div className="h-10 w-full bg-slate-200 dark:bg-[#333] rounded-xl"></div>
                          <div className="h-24 w-full bg-slate-200 dark:bg-[#333] rounded-xl"></div>
                      </div>
                  </div>
                  <div className="bg-white dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-[#333333] p-6 shadow-sm space-y-4">
                      <div className="h-6 w-32 bg-slate-200 dark:bg-[#333] rounded"></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="h-10 w-full bg-slate-200 dark:bg-[#333] rounded-xl"></div>
                          <div className="h-10 w-full bg-slate-200 dark:bg-[#333] rounded-xl"></div>
                      </div>
                  </div>
              </div>
          ) : (
             <div className="flex-1 space-y-6">
                {/* Profile Appearance */}
                <div className="bg-white dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-[#333333] p-6 shadow-sm dark:shadow-none">
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Appearance</h2>
                     <p className="text-sm text-slate-500 dark:text-[#949ba4]">Customize how your profile looks to other traders.</p>
                  </div>
               </div>

               {/* Banner & Avatar */}
               <div className="relative mb-16">
                  {/* Banner */}
                  <div className="h-40 rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 relative group border border-slate-200 dark:border-[#333333]">
                     {profile.bannerUrl ? (
                        <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')" }}></div>
                     )}
                     <button onClick={() => bannerUploadRef?.current?.click()} className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-[12px] font-semibold rounded-lg transition-colors border border-white/10 z-10">
                        <Camera size={14} /> Change Cover
                     </button>
                  </div>
                  {/* Avatar */}
                  <div className="absolute -bottom-12 left-6">
                     <div className="relative group">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#151515] bg-slate-200 dark:bg-[#2B2B2B] overflow-hidden">
                           <img src={profile.avatarUrl || defaultAvatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }} />
                        </div>
                        <button onClick={() => avatarUploadRef?.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-[#151515] transition-colors shadow-md">
                           <Camera size={14} />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Form Fields */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                     <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">Display Name</label>
                     <input type="text" placeholder="Your Name" value={profile.display_name ?? ""} onChange={e => setProfile({...profile, display_name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1 flex justify-between">Username <Check size={12} className="text-green-500" /></label>
                     <div className="relative">
                        <input type="text" placeholder="@your_username" value={profile.username || ""} onChange={e => setProfile({...profile, username: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all" />
                        <span className="absolute -bottom-5 left-1 text-[10px] text-slate-500 dark:text-[#949ba4]">tradifive.com/<span className="text-green-500">{profile.username || "your_username"}</span></span>
                     </div>
                  </div>
               </div>

               <div className="space-y-1.5 mb-6 mt-6">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1 flex justify-between">
                     Bio <span>{(profile.bio?.length || 0)}/120</span>
                  </label>
                  <textarea value={profile.bio || ""} placeholder="No bio yet. Update your profile to tell others about your trading style." onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all resize-none h-20" maxLength={120} />
               </div>

               <div className="space-y-1.5 mb-6">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">Trading Style Tags</label>
                  <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333]">
                     {tags.map((tag: string, idx: number) => (
                        <div key={idx} className="px-3 py-1.5 rounded-md bg-blue-500/10 text-[#3b82f6] dark:text-[#60a5fa] text-[12px] font-bold flex items-center gap-2">
                           {tag}
                           <button onClick={() => handleRemoveTag(idx)} className="text-slate-400 hover:text-red-500">&times;</button>
                        </div>
                     ))}
                     {isAddingTag ? (
                        <div className="flex items-center gap-1">
                           <input 
                              type="text" 
                              value={newTag} 
                              onChange={e => setNewTag(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                              placeholder="New tag..."
                              autoFocus
                              className="px-2 py-1.5 text-[12px] rounded bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 outline-none w-24"
                           />
                           <button onClick={handleAddTag} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm active:scale-[0.98] text-white rounded-full text-[12px] font-bold">Add</button>
                        </div>
                     ) : (
                        tags.length < 3 && (
                           <button onClick={() => setIsAddingTag(true)} className="px-4 py-1.5 rounded-full bg-slate-200 dark:bg-[#2B2B2B] hover:bg-slate-300 dark:hover:bg-[#3B3B3B] text-slate-700 dark:text-slate-300 text-[12px] font-bold transition-all shadow-sm active:scale-[0.98] flex items-center gap-1">+ Add Tag</button>
                        )
                     )}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1.5">
                     <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">Country</label>
                     <SearchableCombobox 
                        value={profile.country || ""}
                        onChange={(val: string) => setProfile({...profile, country: val, state: '', city: ''})}
                        items={countries}
                        placeholder="Select Country"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">State / Region</label>
                     <SearchableCombobox 
                        value={profile.state || ""}
                        onChange={(val: string) => setProfile({...profile, state: val, city: ''})}
                        items={states}
                        placeholder="Select State"
                        disabled={!profile.country || states.length === 0}
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">City</label>
                     <SearchableCombobox 
                        value={profile.city || ""}
                        onChange={(val: string) => setProfile({...profile, city: val})}
                        items={cities}
                        placeholder="Select City"
                        disabled={!profile.state || cities.length === 0}
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">Website</label>
                     <div className="relative">
                        <input type="text" placeholder="linktr.ee/..." value={profile.website || ""} onChange={e => setProfile({...profile, website: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all pl-9" />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-3 text-slate-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        <ExternalLink size={14} className="absolute right-3 top-3 text-slate-400" />
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1 flex items-center gap-1">Profile Badges Visibility <Circle size={10} className="fill-slate-500 text-slate-500"/></label>
                     <div className="relative">
                        <select 
                           value={profile.badgesVisibility || "Everyone"} 
                           onChange={e => setProfile({...profile, badgesVisibility: e.target.value})}
                           className="w-full appearance-none px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all"
                        >
                           <option value="Everyone">Everyone</option>
                           <option value="Followers Only">Followers Only</option>
                           <option value="Only Me">Only Me</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1 flex items-center gap-1">Account Privacy <Crown size={10} className="text-slate-500"/></label>
                     <label className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <span className="text-[13px] font-medium text-slate-800 dark:text-white">Private Account</span>
                        <div className="relative inline-flex items-center">
                           <input type="checkbox" className="sr-only peer" checked={privacySettings?.is_private || false} onChange={e => setPrivacySettings({...privacySettings, is_private: e.target.checked})} />
                           <div className="w-9 h-5 bg-slate-300 dark:bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                        </div>
                     </label>
                  </div>
               </div>
            </div>
         </div>
         )}

         {/* Right Column - Previews */}
         <div className="w-full xl:w-[350px] shrink-0 space-y-6">
            {/* Live Preview Card */}
            <div className="bg-white dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-[#333333] overflow-hidden shadow-sm dark:shadow-none">
               <div className="p-4 text-[11px] text-slate-500 dark:text-[#949ba4] font-medium border-b border-slate-100 dark:border-[#2a2a2a]">
                  This is how others will see your profile.
               </div>
               
               {isInitialLoading ? (
                  <>
                     <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                     <div className="px-4 pb-4 relative pt-12">
                        <div className="absolute -top-10 left-4 w-20 h-20 rounded-full border-4 border-white dark:border-[#151515] bg-slate-300 dark:bg-slate-700 animate-pulse"></div>
                        <div className="mb-4 mt-2">
                           <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
                           <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4"></div>
                           <div className="space-y-2">
                              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                              <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                           <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                           <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                           <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                        </div>
                        <div className="flex gap-2 mb-4">
                           <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                           <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 dark:border-[#2a2a2a] pt-4">
                           <div className="h-8 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                           <div className="h-8 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                           <div className="h-8 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                        </div>
                     </div>
                  </>
               ) : (
                  <>
                     <div className="h-28 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                        {profile.bannerUrl ? (
                           <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')" }}></div>
                        )}
                     </div>
                     
                     <div className="px-4 pb-4 relative pt-12">
                        <div className="absolute -top-10 left-4 w-20 h-20 rounded-full border-4 border-white dark:border-[#151515] bg-slate-200 dark:bg-[#2B2B2B] overflow-hidden">
                           <img src={profile.avatarUrl || defaultAvatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }} />
                        </div>
                        

                        <div className="mb-4 mt-2">
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              {profile.display_name || "Your Name"}
                           </h3>
                           <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mb-2">@{profile.username || "your_username"}</p>
                           
                           <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                              {profile.bio || "No bio yet. Update your profile to tell others about your trading style."}
                           </p>
                        </div>

                        {(!profile.badgesVisibility || profile.badgesVisibility === "Everyone" || profile.badgesVisibility === "Followers Only") && (
                           <div className="flex items-center gap-2 mb-4">
                              <span className="text-[10px] font-bold text-[#3b82f6] bg-blue-500/10 px-1.5 py-0.5 rounded">👑 Lv 1</span>
                              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-[#2B2B2B] rounded-full overflow-hidden">
                                 <div className="w-[10%] h-full bg-[#3b82f6] rounded-full" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">0/500 XP</span>
                           </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-4">
                           {tags.map((tag: string, idx: number) => (
                              <div key={idx} className="px-2 py-0.5 rounded bg-blue-500/10 text-[#3b82f6] dark:text-[#60a5fa] text-[10px] font-bold border border-blue-500/20">☆ {tag}</div>
                           ))}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-[#949ba4] mb-6 flex-wrap">
                           <div className="flex items-center gap-1 truncate"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> <span className="truncate">{profile.city || "Mumbai, Maharashtra"}</span></div>
                           {profile.website && (
                              <div className="flex items-center gap-1 text-[#3b82f6] hover:underline cursor-pointer truncate"><ExternalLink size={12} className="shrink-0" /> <span className="truncate">{profile.website.replace(/^https?:\/\//, '')}</span></div>
                           )}
                           <div className="flex items-center gap-1 shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Joined Jan 2024</div>
                        </div>

                        <div className="flex justify-between border-t border-slate-100 dark:border-[#2a2a2a] pt-4">
                           <div className="text-center">
                              <div className="text-[14px] font-bold text-slate-900 dark:text-white">0</div>
                              <div className="text-[10px] font-medium text-slate-500">Posts</div>
                           </div>
                           <div className="text-center">
                              <div className="text-[14px] font-bold text-slate-900 dark:text-white">0</div>
                              <div className="text-[10px] font-medium text-slate-500">Followers</div>
                           </div>
                           <div className="text-center">
                              <div className="text-[14px] font-bold text-slate-900 dark:text-white">0</div>
                              <div className="text-[10px] font-medium text-slate-500">Following</div>
                           </div>
                        </div>
                     </div>
                  </>
               )}
            </div>

            {/* Profile Summary Card */}
            <div className="bg-white dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-[#333333] p-6 shadow-sm dark:shadow-none">
               <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider mb-6">Profile Summary</h3>
               
               <div className="flex items-center gap-4 mb-6">
                  {/* Progress Circle Mockup */}
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-slate-100 dark:text-[#2B2B2B]" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${completenessChecks.percentage}, 100`} />
                     </svg>
                     <div className="absolute text-[13px] font-bold text-slate-900 dark:text-white">{completenessChecks.percentage}%</div>
                  </div>
                  <div>
                     <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Profile Completeness</h4>
                     <p className="text-[11px] text-slate-500 dark:text-[#949ba4] leading-tight mt-1">Complete your profile to increase trust and visibility.</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center gap-3">
                     {completenessChecks.hasAvatar ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300 dark:text-[#2B2B2B]" />}
                     <span className={`text-[12px] font-medium ${completenessChecks.hasAvatar ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>Add profile picture</span>
                  </div>
                  <div className="flex items-center gap-3">
                     {completenessChecks.hasBanner ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300 dark:text-[#2B2B2B]" />}
                     <span className={`text-[12px] font-medium ${completenessChecks.hasBanner ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>Add cover photo</span>
                  </div>
                  <div className="flex items-center gap-3">
                     {completenessChecks.hasTags ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300 dark:text-[#2B2B2B]" />}
                     <span className={`text-[12px] font-medium ${completenessChecks.hasTags ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>Add trading style tags</span>
                  </div>
                  <div className="flex items-center gap-3">
                     {completenessChecks.hasBio ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300 dark:text-[#2B2B2B]" />}
                     <span className={`text-[12px] font-medium ${completenessChecks.hasBio ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>Write bio</span>
                  </div>
                  <div className="flex items-center gap-3">
                     {completenessChecks.hasSocial ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300 dark:text-[#2B2B2B]" />}
                     <span className={`text-[12px] font-medium ${completenessChecks.hasSocial ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>Connect social links</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
