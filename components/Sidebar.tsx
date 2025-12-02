import React from 'react';
import { BotIcon, PlusIcon, MenuIcon, HistoryIcon, SparkleIcon, TrashIcon } from './Icons';

interface SidebarProps {
  onNewChat: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat, isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-[2px] transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container - Material 3 Navigation Drawer */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40
        w-[300px] md:w-[280px] 
        bg-[#1D1B20] md:bg-[#141218] 
        flex flex-col
        rounded-r-[28px] md:rounded-none
        transform transition-transform duration-300 cubic-bezier(0.2, 0.0, 0, 1.0)
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        md:border-r border-[#49454F]/20
      `}>
        {/* Header Area */}
        <div className="px-6 min-h-[64px] flex items-center justify-between mt-2">
           <div className="flex items-center gap-3">
             <div className="text-[#D0BCFF]">
                <SparkleIcon size={24} />
             </div>
             <span className="font-bold text-lg tracking-wide text-[#E6E0E9]">Luntra</span>
           </div>
           <button onClick={toggleSidebar} className="md:hidden text-[#CAC4D0] p-2 hover:bg-[#49454F]/20 rounded-full">
             <MenuIcon size={20} />
           </button>
        </div>

        {/* Floating Action Button (FAB) for New Chat */}
        <div className="px-4 py-4">
            <button 
                onClick={() => {
                    onNewChat();
                    if (window.innerWidth < 768) toggleSidebar();
                }}
                className="
                  group relative w-full h-14 
                  bg-[#4F378B] hover:bg-[#6750A4] 
                  text-[#EADDFF] 
                  rounded-[16px] 
                  flex items-center justify-center gap-3
                  shadow-md hover:shadow-lg transition-all duration-300
                  active:scale-[0.98]
                  overflow-hidden
                "
            >
                {/* Ripple container */}
                <div className="absolute inset-0 rounded-[16px] bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <PlusIcon size={24} />
                <span className="font-medium text-[15px] tracking-wide">New Chat</span>
            </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
            <div className="px-4 py-3 text-[11px] font-medium text-[#D0BCFF] tracking-wider uppercase opacity-80">
                Recent
            </div>
            
            <div className="space-y-1">
                {/* Mock recent items for UI demonstration */}
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-[#E6E0E9] hover:bg-[#49454F]/20 rounded-full transition-colors group">
                    <HistoryIcon size={20} className="text-[#CAC4D0] group-hover:text-[#E6E0E9]" />
                    <span className="truncate font-medium">Project Ideas</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-[#E6E0E9] hover:bg-[#49454F]/20 rounded-full transition-colors group">
                     <HistoryIcon size={20} className="text-[#CAC4D0] group-hover:text-[#E6E0E9]" />
                    <span className="truncate font-medium">React Components</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-[#E6E0E9] hover:bg-[#49454F]/20 rounded-full transition-colors group">
                     <HistoryIcon size={20} className="text-[#CAC4D0] group-hover:text-[#E6E0E9]" />
                    <span className="truncate font-medium">Gemini Integration</span>
                </button>
            </div>
        </div>

        {/* Clear Chat Button */}
        <div className="px-3 pb-2 mt-2 border-t border-[#49454F]/20 pt-2">
            <button 
                onClick={() => {
                    onNewChat();
                    if (window.innerWidth < 768) toggleSidebar();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 text-[#E6E0E9] hover:bg-[#49454F]/20 rounded-full transition-colors group"
            >
                <TrashIcon size={20} className="text-[#CAC4D0] group-hover:text-[#FFB4AB] transition-colors" />
                <span className="font-medium text-sm group-hover:text-[#FFB4AB] transition-colors">Clear conversation</span>
            </button>
        </div>

        {/* Bottom Profile Section */}
        <div className="p-3 mb-2">
            <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#49454F]/20 rounded-full transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#D0BCFF] text-[#381E72] flex items-center justify-center text-xs font-bold shadow-sm">
                    L
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-[#E6E0E9]">User Account</span>
                    <span className="text-[10px] text-[#CAC4D0]">Basic Plan</span>
                </div>
            </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
