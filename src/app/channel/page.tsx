"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function ChannelRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: channel } = await supabase
          .from('channels')
          .select('handle')
          .eq('user_id', user.id)
          .single();
        
        if (channel) {
          router.replace(`/channel/${channel.handle.replace('@', '')}`);
          return;
        }
      }
      router.replace('/');
    }
    redirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-4 border-[#065fd4] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
