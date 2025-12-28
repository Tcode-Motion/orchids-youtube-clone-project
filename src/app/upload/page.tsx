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
  ChevronDown,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

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

    try {
      let channel_id = '11111111-1111-1111-1111-111111111101';
      
      if (user) {
        const { data: channel } = await supabase
          .from('channels')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (channel) {
          channel_id = channel.id;
        } else {
          const { data: newChannel } = await supabase
            .from('channels')
            .insert({
              user_id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Creator',
              handle: `@${user.email?.split('@')[0] || 'creator'}${Date.now()}`,
              description: 'Welcome to my channel!',
              subscriber_count: 0,
              video_count: 0,
              is_verified: false,
            })
            .select()
            .single();
          
          if (newChannel) channel_id = newChannel.id;
        }
      }

      setUploadProgress(20);

      let video_url = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      let thumbnail_url = 'https://i.ytimg.com/vi/0e3GPea1Tyg/maxresdefault.jpg';

      const videoPath = `videos/${Date.now()}_${videoFile.name}`;
      const { data: videoUpload, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoFile);

      if (!videoError && videoUpload) {
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(videoPath);
        video_url = publicUrl;
      }

      setUploadProgress(60);

      if (thumbnailFile) {
        const thumbPath = `thumbnails/${Date.now()}_${thumbnailFile.name}`;
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

      const video = document.createElement('video');
      video.src = videoPreview;
      
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => resolve();
      });

      const duration = Math.floor(video.duration) || 300;

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

      setUploadProgress(100);

      if (insertError) throw insertError;

      setTimeout(() => {
        router.push(`/watch?v=${newVideo.id}`);
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f9f9f9]">
        <Masthead />
        <div className="pt-[56px] flex items-center justify-center min-h-[calc(100vh-56px)]">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 bg-[#f2f2f2] rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload size={40} className="text-[#606060]" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Sign in to upload</h1>
            <p className="text-[#606060] mb-6">Create and share videos with the VidStream community</p>
            <button 
              onClick={() => router.push('/auth')}
              className="px-6 py-3 bg-[#065fd4] text-white rounded-full font-medium hover:bg-[#0556be] transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Masthead />
      <div className="pt-[56px]">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-6">Upload video</h1>

          {!videoFile ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#ccc] rounded-xl p-12 text-center cursor-pointer hover:border-[#065fd4] hover:bg-[#f8faff] transition-all"
            >
              <div className="w-24 h-24 bg-[#f2f2f2] rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload size={40} className="text-[#606060]" />
              </div>
              <p className="text-lg font-medium mb-2">Drag and drop video files to upload</p>
              <p className="text-[#606060] text-sm mb-4">Your videos will be private until you publish them.</p>
              <button className="px-6 py-3 bg-[#065fd4] text-white rounded-full font-medium hover:bg-[#0556be] transition-colors">
                SELECT FILES
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {uploading && (
                <div className="p-4 bg-[#e8f0fe] border-b border-[#c2d7f8]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#065fd4]">
                      {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                    </span>
                    <span className="text-sm text-[#065fd4]">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-[#c2d7f8] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#065fd4] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title (required)</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Add a title that describes your video"
                        className="w-full px-4 py-3 border border-[#ccc] rounded-lg focus:outline-none focus:border-[#065fd4] text-sm"
                        maxLength={100}
                      />
                      <div className="text-right text-xs text-[#606060] mt-1">{formData.title.length}/100</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell viewers about your video"
                        rows={5}
                        className="w-full px-4 py-3 border border-[#ccc] rounded-lg focus:outline-none focus:border-[#065fd4] text-sm resize-none"
                        maxLength={5000}
                      />
                      <div className="text-right text-xs text-[#606060] mt-1">{formData.description.length}/5000</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                        className="w-full px-4 py-3 border border-[#ccc] rounded-lg focus:outline-none focus:border-[#065fd4] text-sm bg-white"
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Visibility</label>
                      <div className="space-y-2">
                        {[
                          { value: 'public', icon: Globe, label: 'Public', desc: 'Everyone can watch' },
                          { value: 'unlisted', icon: Users, label: 'Unlisted', desc: 'Anyone with the link can watch' },
                          { value: 'private', icon: Lock, label: 'Private', desc: 'Only you can watch' },
                        ].map(option => (
                          <label 
                            key={option.value}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              formData.visibility === option.value 
                                ? 'border-[#065fd4] bg-[#e8f0fe]' 
                                : 'border-[#ccc] hover:bg-[#f2f2f2]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="visibility"
                              value={option.value}
                              checked={formData.visibility === option.value}
                              onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                              className="hidden"
                            />
                            <option.icon size={20} className={formData.visibility === option.value ? 'text-[#065fd4]' : 'text-[#606060]'} />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{option.label}</p>
                              <p className="text-xs text-[#606060]">{option.desc}</p>
                            </div>
                            {formData.visibility === option.value && (
                              <Check size={20} className="text-[#065fd4]" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_short}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_short: e.target.checked }))}
                          className="w-5 h-5 rounded border-[#ccc] text-[#065fd4] focus:ring-[#065fd4]"
                        />
                        <div>
                          <p className="font-medium text-sm">This is a Short</p>
                          <p className="text-xs text-[#606060]">Short videos (under 60 seconds) appear in Shorts feed</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="w-80 shrink-0">
                    <div className="sticky top-20 space-y-4">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Thumbnail</label>
                        <div 
                          onClick={() => thumbnailInputRef.current?.click()}
                          className={`aspect-video border-2 border-dashed rounded-lg cursor-pointer overflow-hidden transition-colors ${
                            thumbnailPreview ? 'border-transparent' : 'border-[#ccc] hover:border-[#065fd4]'
                          }`}
                        >
                          {thumbnailPreview ? (
                            <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#606060]">
                              <ImageIcon size={32} className="mb-2" />
                              <p className="text-sm">Upload thumbnail</p>
                            </div>
                          )}
                        </div>
                        <input
                          ref={thumbnailInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailSelect}
                          className="hidden"
                        />
                      </div>

                      <div className="text-sm text-[#606060]">
                        <p className="font-medium text-[#0f0f0f] mb-1">Video filename</p>
                        <p className="truncate">{videoFile.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#e5e5e5]">
                  <button
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview('');
                      setThumbnailFile(null);
                      setThumbnailPreview('');
                      setFormData({
                        title: '',
                        description: '',
                        category_id: '',
                        visibility: 'public',
                        is_short: false,
                      });
                    }}
                    className="px-6 py-2 text-[#065fd4] font-medium hover:bg-[#e8f0fe] rounded-full transition-colors"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!formData.title || uploading}
                    className="px-6 py-2 bg-[#065fd4] text-white font-medium rounded-full hover:bg-[#0556be] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading && <Loader2 size={16} className="animate-spin" />}
                    {uploading ? 'Uploading...' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
