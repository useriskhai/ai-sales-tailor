import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { Home, Package, Building2, Users, PlaySquare, Settings, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: Home },
  { href: '/product', label: 'プロダクト管理', icon: Package },
  { href: '/companies', label: '企業管理', icon: Building2 },
  { href: '/send-groups', label: '送信グループ', icon: Users },
  { href: '/batch-jobs', label: 'バッチジョブ', icon: PlaySquare },
  { href: '/settings', label: '設定', icon: Settings },
];

export const SideMenu: React.FC = () => {
  const router = useRouter();
  const [menuState, setMenuState] = useState<'closed' | 'compact' | 'expanded'>('compact');
  const menuRef = useRef<HTMLElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (menuState !== 'closed') {
          setMenuState('compact');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuState]);

  const toggleMenu = () => {
    setMenuState(prevState => (prevState === 'closed' ? 'compact' : 'closed'));
  };

  const toggleExpand = () => {
    setMenuState(prevState => (prevState === 'expanded' ? 'compact' : 'expanded'));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setMenuState('closed');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-gray-200 dark:bg-gray-700 rounded-md transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={toggleMenu}
        aria-expanded={menuState !== 'closed'}
        aria-controls="side-menu"
        aria-label="メニューを開く"
      >
        {menuState !== 'closed' ? <X size={24} /> : <Menu size={24} />}
      </button>
      <nav
        ref={menuRef}
        id="side-menu"
        className={cn(
          'fixed lg:sticky top-0 left-0 z-10 h-screen overflow-y-auto bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out',
          menuState === 'expanded' ? 'w-64' : 'w-16',
          menuState !== 'closed' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        onKeyDown={handleKeyDown}
        aria-label="サイドメニュー"
      >
        <div className="flex items-center justify-between p-3" onClick={(e) => e.stopPropagation()}>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={menuState === 'expanded' ? "メニューを縮小" : "メニューを展開"}
          >
            <ChevronRight size={20} className={cn("transition-transform", menuState === 'expanded' && "rotate-180")} />
          </button>
        </div>
        <ul className="space-y-2 p-2" onClick={(e) => e.stopPropagation()}>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <span
                  className={cn(
                    'flex items-center p-2 rounded-md transition-all duration-200',
                    router.pathname === item.href
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700',
                    menuState === 'compact' && 'justify-center'
                  )}
                  tabIndex={0}
                  role="menuitem"
                >
                  <item.icon size={20} className={cn(menuState === 'compact' && 'mx-auto')} aria-hidden="true" />
                  {menuState === 'expanded' && <span className="ml-3">{item.label}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};
/*
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import cn from 'classnames'; 
import { Home, Package, Building2, Users, PlaySquare, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; 

const menuItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: Home },
  { href: '/product', label: 'プロダクト管理', icon: Package },
  { href: '/companies', label: '企業管理', icon: Building2 },
  { href: '/send-groups', label: '送信グループ', icon: Users },
  { href: '/batch-jobs', label: 'バッチジョブ', icon: PlaySquare },
  { href: '/settings', label: '設定', icon: Settings },
];

export const SideMenu: React.FC = () => {
  const router = useRouter();
  const [menuState, setMenuState] = useState<'compact' | 'expanded'>('compact');
  const { user } = useAuth();

  if (!user) {
    return null; 
  }

  return (
    <nav
      id="side-menu"
      className={cn(
        'fixed lg:sticky top-12 left-0 z-10 h-50 overflow-y-auto bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out',
        menuState === 'expanded' ? 'w-54' : 'w-15'
      )}
      aria-label="サイドメニュー"
      onMouseEnter={() => setMenuState('expanded')}
      onMouseLeave={() => setMenuState('compact')}
    >
      <div className="flex items-center justify-between p-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuState(menuState === 'expanded' ? 'compact' : 'expanded'); 
          }}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label={menuState === 'expanded' ? "メニューを縮小" : "メニューを展開"}
        >
          <ChevronRight
            size={20}
            className={cn("transition-transform", menuState === 'expanded' && "rotate-180")}
          />
        </button>
      </div>
      
      {menuState === 'expanded' && (
        <div className="absolute inset-0 bg-black opacity-10 pointer-events-none transition-opacity duration-300"></div>
      )}

      <ul className="space-y-2 p-2 relative z-17">
        {menuItems.map((item) => (
          <li key={item.href} className="relative group">
            <Link href={item.href} className="flex items-center p-2 rounded-md transition-all duration-200">
              <item.icon
                size={20}
                className={cn(menuState === 'compact' ? 'mx-auto' : 'mr-7')} 
                aria-hidden="true"
              />
              {menuState === 'expanded' && (
                <span className="ml-3 transition-all duration-300">{item.label}</span>
              )}
            </Link>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
          </li>
        ))}
      </ul>
    </nav>
  );
};
*/