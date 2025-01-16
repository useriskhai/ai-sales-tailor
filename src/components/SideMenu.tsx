"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Package, 
  Building2, 
  Users, 
  PlaySquare, 
  Settings, 
  ChevronRight,
  Menu,
  LucideIcon,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const menuItems: MenuItem[] = [
  { 
    href: '/dashboard', 
    label: 'ダッシュボード', 
    icon: Home, 
    description: 'アクティビティの概要'
  },
  { 
    href: '/templates', 
    label: 'テンプレート', 
    icon: FileText, 
    description: 'メールテンプレートの管理'
  },
  { 
    href: '/batch-jobs', 
    label: 'バッチジョブ', 
    icon: PlaySquare, 
    description: '自動化タスクの管理'
  },
  { 
    href: '/product', 
    label: 'プロダクト管理', 
    icon: Package, 
    description: 'プロダクト情報の管理'
  },
  { 
    href: '/companies', 
    label: '企業管理', 
    icon: Building2, 
    description: '取引先企業の管理'
  },
  { 
    href: '/send-groups', 
    label: '送信グループ', 
    icon: Users, 
    description: '送信先グループの管理'
  },
];

export function SideMenu() {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState<'compact' | 'expanded'>('expanded');
  const { user, loading } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="fixed lg:sticky top-0 h-screen bg-card border-r flex flex-col z-10 w-[64px]">
        <div className="flex items-center h-14 px-4 border-b justify-center">
          <Image src="/logo.png" alt="Logo" width={24} height={24} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.nav
      initial={false}
      animate={{
        width: menuState === 'expanded' ? '280px' : '64px',
      }}
      className="fixed lg:sticky top-0 h-screen bg-card border-r flex flex-col z-10"
    >
      <div className="flex items-center h-14 px-4 border-b">
        <AnimatePresence mode="wait">
          {menuState === 'expanded' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Logo" width={24} height={24} />
                <span className="font-semibold">SalesTailor</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuState('compact')}
                className="hover:bg-accent"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.button
              onClick={() => setMenuState('expanded')}
              className="p-2 rounded-md hover:bg-accent"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <ScrollArea className="flex-1 py-2">
        {menuItems.map((item) => (
          <MenuItem
            key={item.href}
            item={item}
            isExpanded={menuState === 'expanded'}
            isActive={pathname === item.href}
          />
        ))}
      </ScrollArea>
    </motion.nav>
  );
}

interface MenuItemProps {
  item: MenuItem;
  isExpanded: boolean;
  isActive: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isExpanded, isActive }) => {
  const IconComponent = item.icon;
  
  if (!IconComponent) {
    console.error('Icon component is undefined for:', item.label);
    return null;
  }

  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ backgroundColor: "var(--accent)" }}
        className={cn(
          "flex items-center px-4 py-3 mx-2 rounded-md transition-colors relative",
          isActive && "bg-accent text-accent-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-primary before:rounded-r"
        )}
      >
        <IconComponent className={cn(
          "w-5 h-5 flex-shrink-0",
          isActive ? "text-primary" : "text-muted-foreground"
        )} />
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 overflow-hidden"
            >
              <p className={cn(
                "text-sm font-medium",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>{item.label}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}