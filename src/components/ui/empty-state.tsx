interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
}

import React from 'react';
import Link from 'next/link';

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-white/20">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white/80 mb-2">{title}</h3>
      <p className="text-white/40 max-w-xs leading-relaxed text-sm">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold transition-all shadow-lg shadow-indigo-600/20 text-sm"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold transition-all shadow-lg shadow-indigo-600/20 text-sm"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
