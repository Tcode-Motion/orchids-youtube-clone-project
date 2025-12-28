"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Masthead from '@/components/sections/masthead';
import { 
  Upload, 
  X, 
  Film, 
  Image as ImageIcon, 
  Globe, 
  Lock, 
  Users,
  Check,
  Loader2,
  Sparkles,
  Zap,
  Play,
  ArrowRight
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  name: string;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    visibility: 'public',
    is_short: false,
  });

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      if (cats) setCategories(cats);
    }
    fetchData();
  }, []);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
      
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        if (video.duration <= 60) {
          setFormData(prev => ({ ...prev, is_short: true }));
        }
      };
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !formData.title) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      let channel_id;
      
      if (!user) throw new Error("Auth required");

      const { data: channel } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (channel) {
        channel_id = channel.id;
      } else {
        const { data: newChannel, error: channelErr } = await supabase
          .from('channels')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Creator',
            handle: `@${user.email?.split('@')[0] || 'creator'}${Date.now()}`,
            description: 'New channel on VidStream',
            subscriber_count: 0,
            video_count: 0,
            is_verified: false,
          })
          .select()
          .single();
        
        if (channelErr) throw channelErr;
        channel_id = newChannel.id;
      }

      setUploadProgress(10);

      let video_url = '';
      let thumbnail_url = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1074&auto=format&fit=crop';

      // 1. Upload Video
      const videoPath = `videos/${Date.now()}_${videoFile.name.replace(/\s/g, '_')}`;
      const { data: videoUpload, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoFile);

      if (videoError) throw new Error(`Video upload failed: ${videoError.message}`);
      
      if (videoUpload) {
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(videoPath);
        video_url = publicUrl;
      }

      setUploadProgress(50);

      // 2. Upload Thumbnail
      if (thumbnailFile) {
        const thumbPath = `thumbnails/${Date.now()}_${thumbnailFile.name.replace(/\s/g, '_')}`;
        const { data: thumbUpload, error: thumbError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbPath, thumbnailFile);

        if (!thumbError && thumbUpload) {
          const { data: { publicUrl } } = supabase.storage
            .from('thumbnails')
            .getPublicUrl(thumbPath);
          thumbnail_url = publicUrl;
        }
      }

      setUploadProgress(80);

      // 3. Get metadata
      const videoEl = document.createElement('video');
      videoEl.src = videoPreview;
      await new Promise<void>((resolve) => {
        videoEl.onloadedmetadata = () => resolve();
        videoEl.onerror = () => resolve();
      });
      const duration = Math.floor(videoEl.duration) || 0;

      // 4. Insert DB record
      const { data: newVideo, error: insertError } = await supabase
        .from('videos')
        .insert({
          channel_id,
          category_id: formData.category_id || null,
          title: formData.title,
          description: formData.description,
          thumbnail_url,
          video_url,
          duration,
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          is_live: false,
          is_short: formData.is_short,
          is_private: formData.visibility === 'private',
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setUploadProgress(100);
      setTimeout(() => {
        router.push(`/watch?v=${newVideo.id}`);
      }, 800);

    } catch (err: any) {
      console.error('Transmission failed:', err);
      setError(err.message || 'System error during transmission');
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <Masthead />
        <div className="pt-18 flex items-center justify-center min-h-[calc(100vh-72px)] px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 bg-white/5 border border-white/10 rounded-[40px] max-w-md w-full backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 blur-[80px]" />
            <div className="w-24 h-24 bg-indigo-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-indigo-500 shadow-inner">
              <Upload size={48} />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-4">Neural Uplink</h1>
            <p className="text-white/40 mb-10 leading-relaxed">Authorization required to establish a broadcast signal. Please authenticate to continue.</p>
            <button 
              onClick={() => router.push('/auth')}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In to VidStream
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Masthead />
      <div className="pt-18 pb-20">
        <div className="max-w-6xl mx-auto p-6 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Broadcast Center</h1>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">VidStream Neural Uplink 1.0</p>
            </div>
          </div>

          {!videoFile ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-[40px] p-20 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-white/[0.02] transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-28 h-28 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-white/20 group-hover:text-indigo-500 group-hover:bg-indigo-500/10 transition-all group-hover:scale-110">
                <Upload size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Initiate Transmission</h3>
              <p className="text-white/30 text-lg mb-10 max-w-sm mx-auto">Select a neural media file to begin the broadcasting protocol.</p>
              <button className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 hover:scale-[1.05]">
                SELECT SIGNAL
              </button>
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-8"
              >
                {uploading && (
                  <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[32px] backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                        <span className="font-bold text-indigo-400 uppercase tracking-widest text-xs">
                          {uploadProgress < 100 ? 'Transmitting Signal...' : 'Neural Synchronization...'}
                        </span>
                      </div>
                      <span className="font-black text-white text-lg">{uploadProgress}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    {error}
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-10 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] px-1">Broadcast Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Define your transmission..."
                        className="w-full h-14 px-6 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-lg font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] px-1">Signal Context</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Provide the neural metadata..."
                        rows={6}
                        className="w-full p-6 bg-white/[0.03] border border-white/10 rounded-[32px] focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm leading-relaxed resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] px-1">Neural Category</label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                          className="w-full h-14 px-6 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500/50 text-sm font-semibold text-white/80 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0f0f12]">Unclassified</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-[#0f0f12]">{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] px-1">Signal Protocol</label>
                        <div className="flex bg-white/[0.03] border border-white/10 rounded-2xl p-1 h-14">
                          {['public', 'private'].map((v) => (
                            <button
                              key={v}
                              onClick={() => setFormData(prev => ({ ...prev, visibility: v }))}
                              className={`flex-1 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${formData.visibility === v ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                            >
                              {v === 'public' ? <div className="flex items-center justify-center gap-2"><Globe size={14} /> Global</div> : <div className="flex items-center justify-center gap-2"><Lock size={14} /> Encrypted</div>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <button
                      onClick={() => { setVideoFile(null); setVideoPreview(''); }}
                      className="px-8 h-14 rounded-2xl font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all w-full sm:w-auto"
                      disabled={uploading}
                    >
                      Abort Mission
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!formData.title || uploading}
                      className="px-12 h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 hover:scale-[1.02] flex items-center justify-center gap-3 w-full sm:w-auto"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Establish Uplink</span>
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] px-1">Visual Signature</label>
                    <div className="aspect-video bg-black rounded-[24px] overflow-hidden border border-white/5 relative group">
                      <video src={videoPreview} className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-12 h-12 text-white fill-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] px-1">Neural Thumbnail</label>
                    <div 
                      onClick={() => thumbnailInputRef.current?.click()}
                      className={`aspect-video rounded-[24px] border-2 border-dashed cursor-pointer overflow-hidden transition-all relative group ${thumbnailPreview ? 'border-transparent' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.02]'}`}
                    >
                      {thumbnailPreview ? (
                        <>
                          <img src={thumbnailPreview} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Zap className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/20 group-hover:text-indigo-500 transition-colors">
                          <ImageIcon size={32} className="mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Upload Keyframe</p>
                        </div>
                      )}
                    </div>
                    <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                  </div>

                  <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/30">
                      <span>Signal Strength</span>
                      <span className="text-indigo-400">Optimal</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                        <Film size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{videoFile.name}</p>
                        <p className="text-[10px] text-white/30 font-bold uppercase mt-0.5">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Neural Stream</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
