"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlaySquare, PlusCircle, Library, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: PlaySquare, label: 'Shorts', href: '/shorts' },
    { icon: PlusCircle, label: '', href: '/upload', isCreate: true },
    { icon: Library, label: 'Subscriptions', href: '/subscriptions' },
    { icon: User, label: 'You', href: '/feed/you' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] z-[1000] safe-area-inset-bottom">
      <div className="flex items-center justify-around h-12">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (item.isCreate) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center"
              >
                <div className="w-9 h-7 bg-[#0f0f0f] rounded-lg flex items-center justify-center">
                  <PlusCircle size={20} className="text-white" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive ? "text-[#0f0f0f]" : "text-[#606060]"
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-0.5 leading-3">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
