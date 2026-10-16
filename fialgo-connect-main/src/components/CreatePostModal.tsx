import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Hash, Globe, Crown, Loader2, BarChart2, Smile, Gift, Plus, Trash2,
  Calendar, Heart, MessageCircle, Send, MapPin, Check,
  MoreHorizontal, Share2, Youtube, Music, MessageSquare, Users, ChevronRight, IndianRupee, Brain, X as LucideX, SmilePlus
} from "lucide-react";
import { Image, Video, Document, Bookmark, CloseSquare, ChevronDown, TimeCircle, Chat, InfoCircle, Discovery, TwoUsers, Calendar as IconlyCalendar } from "react-iconly";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId: string;
  mode?: "create" | "edit";
  postId?: string;
  initialContent?: string;
  initialTags?: string[];
  initialMediaUrl?: string | null;
  initialMediaUrls?: string[] | null;
  initialMediaType?: "image" | "video" | "poll" | null;
  variant?: "modal" | "dropdown";
}

const CURATED_GIFS = [
  { name: "Stonks Up", url: "https://media.giphy.com/media/YnkMcHgNIMW4YcX2Xs/giphy.gif" },
  { name: "Bull Charge", url: "https://media.giphy.com/media/Vz8cxO1p6ytS8/giphy.gif" },
  { name: "Bear Roar", url: "https://media.giphy.com/media/H5qyL9DSW0vZTJvBH0/giphy.gif" },
  { name: "Money Rain", url: "https://media.giphy.com/media/LCdPNT81vde3CGKjEC/giphy.gif" },
  { name: "Panic Selling", url: "https://media.giphy.com/media/1EghTrigJJFBEXRQVq/giphy.gif" },
  { name: "HODL Crypto", url: "https://media.giphy.com/media/d0DdMUREKWZQmqZlD8/giphy.gif" },
  { name: "Buy The Dip", url: "https://media.giphy.com/media/tXL4FHPSnVJ0A/giphy.gif" },
  { name: "To The Moon", url: "https://media.giphy.com/media/5wBoP56UsdHGTKGMcS/giphy.gif" }
];

const COMMON_EMOJIS = ["📈", "📉", "🚀", "💎", "🙌", "🐂", "🐻", "💰", "📊", "🔥", "👍", "👏", "🚨", "🎯", "🤔", "😂"];

const PRESET_LOCATIONS = [
  "Maharashtra, India",
  "Delhi, India",
  "Karnataka, India",
  "Gujarat, India",
  "Tamil Nadu, India",
  "New York, USA",
  "London, UK",
  "Dubai, UAE",
  "Singapore",
  "Sydney, Australia"
];


export default function CreatePostModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  mode = "create",
  postId,
  initialContent = "",
  initialTags = [],
  initialMediaUrl = null,
  initialMediaUrls = null,
  initialMediaType = null,
  variant = "modal"
}: CreatePostModalProps) {
  // Base states
  const [content, setContent] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video" | "poll" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Textarea mentions
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

  // Selector for Attachment Type: text/none, image, video, gif, poll, signal
  const [attachmentType, setAttachmentType] = useState<"none" | "image" | "video" | "gif" | "poll" | "signal" | null>("image");

  // Premium details state
  const [locationName, setLocationName] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          if (!res.ok) throw new Error("Failed to fetch location data");
          const data = await res.json();
          
          let locationStr = "Unknown Location";
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county;
            const country = data.address.country;
            if (city && country) {
              locationStr = `${city}, ${country}`;
            } else if (country) {
              locationStr = country;
            } else {
              locationStr = data.display_name.split(',').slice(0, 2).join(',');
            }
          }
          
          setLocationName(locationStr);
          setShowLocationDropdown(false);
          toast.success("Location updated!");
        } catch (error) {
          console.error(error);
          toast.error("Could not resolve location address");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error("Failed to get location. Please allow permissions.");
        setIsDetectingLocation(false);
      }
    );
  };
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInputText, setTagInputText] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  
  // Scheduler ON/OFF states
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showScheduleErrors, setShowScheduleErrors] = useState(false);
  const [allowComments, setAllowComments] = useState(true);

  // Premium Post
  const [isCreator, setIsCreator] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Post Settings
  const [showPostSettings, setShowPostSettings] = useState(false);
  const [postVisibility, setPostVisibility] = useState<"anyone" | "connections">("anyone");
  const [brandPartnership, setBrandPartnership] = useState(false);
  const [postMarket, setPostMarket] = useState<"global" | "indian" | "psychology">("global");
  const [showMarketDropdown, setShowMarketDropdown] = useState(false);

  useEffect(() => {
    if (userId) {
      // Fall back to personal if not tracked
    }
  }, [userId]);

  // Debounced search for real users
  useEffect(() => {
    const val = tagInputText.trim().replace(/^@/, "");
    if (!val || val.length < 2) {
      setUserSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, full_name, display_name, avatar_url")
          .or(`username.ilike.%${val}%,full_name.ilike.%${val}%,display_name.ilike.%${val}%`)
          .limit(8);
        
        if (!error && data) {
          setUserSearchResults(data);
        }
      } catch (err) {
        console.error("Error searching users", err);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [tagInputText]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > 2000) {
      setContent(val.slice(0, 2000));
      toast.warning("Character limit of 2000 reached!");
      return;
    }
    setContent(val);
    
    const pos = e.target.selectionStart;
    setCursorPosition(pos);
    
    const textBeforeCursor = val.substring(0, pos);
    const match = textBeforeCursor.match(/@([\w\.]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentionDropdown(true);
      setTagInputText(match[1]);
    } else {
      setShowMentionDropdown(false);
      setMentionQuery("");
      setTagInputText("");
    }
  };

  const handleSelectMention = (user: any) => {
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    
    const newTextBefore = textBeforeCursor.replace(/@[\w\.]*$/, `@${user.username || user.id.slice(0,8)} `);
    
    setContent(newTextBefore + textAfterCursor);
    setShowMentionDropdown(false);
    setMentionQuery("");
    setTagInputText("");
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Poll states
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  // Signal states
  const [showSignalCreator, setShowSignalCreator] = useState(false);
  const [signalData, setSignalData] = useState({ action: "Buy", asset: "", entry: "", tp: "", sl: "" });

  // Picker toggles
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const lastIsOpenRef = useRef(false);
  const lastPostIdRef = useRef<string | undefined>(undefined);

  // Reset/Initialize state
  useEffect(() => {
    if (isOpen) {
      const isTransitionToOpen = !lastIsOpenRef.current;
      const isDifferentPost = postId !== lastPostIdRef.current;

      if (isTransitionToOpen || isDifferentPost) {
        if (mode === "edit") {
          let parsedLocation = "";
          let parsedContent = initialContent;

          const locMatch = initialContent.match(/^📍\s+(.+)\n/);
          if (locMatch) {
            parsedLocation = locMatch[1];
            parsedContent = parsedContent.replace(/^📍\s+.+\n/, "");
          }

          setLocationName(parsedLocation);
          setContent(parsedContent.trim());
          setTagsList(initialTags.length > 0 ? initialTags : []);

          if (initialMediaType === "poll" && initialMediaUrl) {
            try {
              const parsed = JSON.parse(initialMediaUrl);
              setPollOptions(parsed.options || ["", ""]);
              setShowPollCreator(true);
              setMediaType("poll");
              setMediaPreviews([initialMediaUrl]);
              setMediaFiles([]);
              setAttachmentType("poll");
            } catch (e) {
              setMediaPreviews([initialMediaUrl]);
              setMediaFiles([]);
              setMediaType(initialMediaType);
              setAttachmentType("none");
            }
          } else if (initialMediaUrls && initialMediaUrls.length > 0) {
            setMediaPreviews(initialMediaUrls);
            setMediaFiles([]);
            setMediaType(initialMediaType);
            setShowPollCreator(false);
            setAttachmentType(initialMediaType === "video" ? "video" : "image");
          } else if (initialMediaUrl) {
            setMediaPreviews([initialMediaUrl]);
            setMediaFiles([]);
            setMediaType(initialMediaType);
            setShowPollCreator(false);
            setAttachmentType(initialMediaType === "video" ? "video" : "image");
          } else {
            setMediaPreviews([]);
            setMediaFiles([]);
            setMediaType(null);
            setShowPollCreator(false);
            setShowSignalCreator(false);
            setAttachmentType("none");
          }
          setIsScheduled(false);
          setScheduleDate("");
          setScheduleTime("");
        } else {
          // Defaults
          setLocationName("");
          setContent("");
          setTagsList([]);
          setMediaPreviews([]);
          setMediaFiles([]);
          setMediaType(null);
          setShowPollCreator(false);
          setShowSignalCreator(false);
          setPollOptions(["", ""]);
          setAttachmentType("none");
          setIsScheduled(false);
          setScheduleDate("");
          setScheduleTime("");
          setShowScheduleErrors(false);
          setIsPremium(false);
        }
        setShowEmojiPicker(false);
      }
    }
    lastIsOpenRef.current = isOpen;
    lastPostIdRef.current = postId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, postId, initialContent, initialTags, initialMediaUrl, initialMediaUrls, initialMediaType]);

  const handleAttachmentTypeChange = (type: "none" | "image" | "video" | "gif" | "poll" | "signal") => {
    setAttachmentType(type);
    
    if (type === "none") {
      setMediaPreviews([]);
      setMediaFiles([]);
      setMediaType(null);
      setShowPollCreator(false);
      setShowSignalCreator(false);
    } else if (type === "image") {
      setMediaPreviews([]);
      setMediaFiles([]);
      setMediaType("image");
      setShowPollCreator(false);
      setShowSignalCreator(false);
    } else if (type === "video") {
      setMediaPreviews([]);
      setMediaFiles([]);
      setMediaType("video");
      setShowPollCreator(false);
      setShowSignalCreator(false);
    } else if (type === "gif") {
      setMediaPreviews([CURATED_GIFS[0].url]);
      setMediaFiles([]);
      setMediaType("image");
      setShowPollCreator(false);
      setShowSignalCreator(false);
    } else if (type === "poll") {
      setMediaPreviews([]);
      setMediaFiles([]);
      setMediaType("poll");
      setShowSignalCreator(false);
      setShowPollCreator(true);
      if (pollOptions.length < 2) {
        setPollOptions(["", ""]);
      }
    } else if (type === "signal") {
      setMediaPreviews([]);
      setMediaFiles([]);
      setMediaType("signal" as any); // treating signal as a mediaType internally for structure
      setShowPollCreator(false);
      setShowSignalCreator(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const isVideo = files[0].type.startsWith("video/");

    if (isVideo) {
      // Limit to 1 video
      const file = files[0];
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video is too large! Please upload a file smaller than 50MB.");
        return;
      }
      if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
        toast.error("Unsupported video format! Please upload an MP4 or WebM video.");
        return;
      }
      setMediaFiles([file]);
      setMediaType("video");
      setAttachmentType("video");
      setMediaPreviews([URL.createObjectURL(file)]);
    } else {
      // Limit to max 4 images
      const currentImagesCount = mediaFiles.length;
      const imagesToAdd = files.filter(f => f.type.startsWith("image/"));
      
      if (imagesToAdd.length === 0) {
        toast.error("Please upload image files.");
        return;
      }

      if (currentImagesCount + imagesToAdd.length > 4) {
        toast.error("You can add up to 4 images only!");
        return;
      }

      for (const file of imagesToAdd) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large! Max size is 10MB.`);
          return;
        }
      }

      const newFiles = [...mediaFiles, ...imagesToAdd];
      const newPreviews = [...mediaPreviews, ...imagesToAdd.map(f => URL.createObjectURL(f))];

      setMediaFiles(newFiles);
      setMediaType("image");
      setAttachmentType("image");
      setMediaPreviews(newPreviews);
    }
  };

  const selectPresetGif = (gifUrl: string) => {
    setMediaFiles([]);
    setMediaPreviews([gifUrl]);
    setMediaType("image");
    setAttachmentType("image");
    toast.success("Meme GIF attached!");
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => {
      const next = prev + emoji;
      if (next.length > 2000) {
        toast.warning("Character limit of 2000 reached!");
        return prev;
      }
      return next;
    });
    setShowEmojiPicker(false);
  };

  const addPollOption = () => {
    if (pollOptions.length >= 4) {
      toast.warning("Maximum of 4 options allowed.");
      return;
    }
    setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length <= 2) {
      toast.warning("Minimum of 2 options required.");
      return;
    }
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handlePollOptionChange = (index: number, val: string) => {
    const updated = [...pollOptions];
    updated[index] = val;
    setPollOptions(updated);
  };

  const removeMediaAt = (index: number) => {
    const newFiles = [...mediaFiles];
    if (newFiles.length > index) {
      newFiles.splice(index, 1);
    }
    
    const newPreviews = [...mediaPreviews];
    if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    newPreviews.splice(index, 1);

    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);

    if (newPreviews.length === 0) {
      setMediaType(null);
      setAttachmentType("none");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeMedia = () => {
    mediaPreviews.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setMediaPreviews([]);
    setMediaFiles([]);
    setMediaType(null);
    setAttachmentType("none");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const safeSetLocalPosts = (posts: any[]) => {
      try {
        localStorage.setItem('fialgo_local_posts', JSON.stringify(posts));
      } catch (e) {
        console.warn("localStorage quota exceeded, clearing old posts cache...");
        localStorage.removeItem('fialgo_local_posts');
        try {
           localStorage.setItem('fialgo_local_posts', JSON.stringify(posts.length > 0 ? [posts[0]] : []));
        } catch(e2) {
           console.error("Still exceeding quota for single post", e2);
        }
      }
    };

    if (isScheduled && (!scheduleDate || !scheduleTime)) {
      setShowScheduleErrors(true);
      toast.error("Please pick a valid Date and Time to schedule your post!");
      return;
    }

    if (!content.trim() && mediaPreviews.length === 0 && attachmentType !== "poll") {
      toast.error("Please add some text or media to your post!");
      return;
    }

    let finalPostType = "text";
    let finalMediaUrlVal = mediaPreviews[0] || null;
    let finalMediaUrlsVal = mediaPreviews.length > 0 ? mediaPreviews : null;
    let finalMediaTypeVal = mediaType;

    if (attachmentType === "poll") {
      const validOptions = pollOptions.filter(o => o.trim() !== "");
      if (validOptions.length < 2) {
        toast.error("Please enter at least 2 non-empty poll options!");
        return;
      }
      finalPostType = "poll";
      finalMediaTypeVal = "poll";

      let finalVotes = new Array(validOptions.length).fill(0);
      if (mode === "edit" && initialMediaType === "poll" && initialMediaUrl) {
        try {
          const parsed = JSON.parse(initialMediaUrl);
          if (parsed.votes && parsed.votes.length === validOptions.length) {
            finalVotes = parsed.votes;
          }
        } catch (err) {}
      }

      finalMediaUrlVal = JSON.stringify({
        options: validOptions,
        votes: finalVotes
      });
      finalMediaUrlsVal = null;
    } else if (attachmentType === "signal") {
      if (!signalData.asset || !signalData.entry) {
        toast.error("Asset and Entry Price are required for a signal!");
        return;
      }
      finalPostType = "signal";
      finalMediaTypeVal = "signal";
      finalMediaUrlVal = JSON.stringify(signalData);
      finalMediaUrlsVal = null;
    }

    setIsSubmitting(true);

    let uploadedUrls: string[] = [];
    if (mediaFiles.length > 0) {
      const uploadToast = toast.loading(`Uploading media (1/${mediaFiles.length})...`);
      try {
        for (let i = 0; i < mediaFiles.length; i++) {
          const file = mediaFiles[i];
          if (mediaFiles.length > 1) {
            toast.loading(`Uploading media (${i + 1}/${mediaFiles.length})...`, { id: uploadToast });
          }
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `${userId || 'guest'}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });
          
          if (uploadError) throw uploadError;
          
          const { data } = supabase.storage.from('attachments').getPublicUrl(filePath);
          uploadedUrls.push(data.publicUrl);
        }
        toast.dismiss(uploadToast);
        toast.success("Media uploaded successfully!");
        
        finalMediaUrlVal = uploadedUrls[0] || null;
        finalMediaUrlsVal = uploadedUrls;
      } catch (err: any) {
        toast.dismiss(uploadToast);
        console.error("Upload exception:", err);
        toast.error(`Upload error: ${err?.message || 'Unknown error'}`);
        setIsSubmitting(false);
        return;
      }
    } else if (mediaPreviews.length > 0) {
      // GIFs or existing URLs in edit mode
      uploadedUrls = mediaPreviews;
      finalMediaUrlVal = uploadedUrls[0] || null;
      finalMediaUrlsVal = uploadedUrls;
    }

    try {
      const manualTags = tagsList.map(t => t.replace(/^@/, ""));
      const hashtagRegex = /#(\w+)/g;
      const autoTags: string[] = [];
      let match;
      while ((match = hashtagRegex.exec(content)) !== null) {
        if (!autoTags.includes(match[1])) {
          autoTags.push(match[1]);
        }
      }
      const combinedTags = Array.from(new Set([...manualTags, ...autoTags]));

      let finalContent = "";
      if (locationName.trim()) {
        finalContent += `📍 ${locationName.trim()}\n`;
      }
      finalContent += `${content.trim()}`;

      const createdTime = isScheduled && scheduleDate && scheduleTime
        ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
        : new Date().toISOString();

      const newPostObject = {
        user_id: userId || "mock-user-id",
        content: finalContent,
        media_url: finalMediaUrlVal,
        media_urls: finalMediaUrlsVal,
        media_type: finalMediaTypeVal,
        post_type: finalPostType,
        market: postMarket,
        tags: combinedTags.length > 0 ? combinedTags : null,
        created_at: createdTime,
        likes_count: 0,
        comments_count: 0,
        bookmark_count: 0,
        like_count: 0,
        comment_count: 0,
        share_count: 0,
        view_count: 0,
        is_public: postVisibility === 'anyone',
        allow_comments: allowComments,
        brand_partnership: brandPartnership
      };

      const dbPostObject: any = {
        user_id: userId || "mock-user-id",
        content: finalContent,
        media_url: finalMediaUrlVal,
        media_urls: finalMediaUrlsVal,
        media_type: finalMediaTypeVal,
        post_type: finalPostType,
        tags: combinedTags.length > 0 ? combinedTags : null,
        is_public: postVisibility === 'anyone'
      };

      if (isScheduled && scheduleDate && scheduleTime) {
        dbPostObject.created_at = createdTime;
      }

      if (mode === "create") {
        let insertedId = `local-${Date.now()}`;
        try {
          const { data, error } = await supabase.from("social_posts").insert([dbPostObject]).select();
          if (error) {
            console.warn("Supabase insert failed, using optimistic UI anyway:", error);
          } else if (data && data.length > 0) {
            insertedId = data[0].id;
          }
        } catch (dbErr) {
          console.warn("Supabase insert exception, using optimistic UI anyway:", dbErr);
        }

        // Optimistic UI Update (adds to local state immediately)
        const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
        localPosts.unshift({
          id: insertedId,
          ...newPostObject,
          profiles: {
            id: userId || "mock-user-id",
            first_name: localStorage.getItem("tradifive_cached_display_name")?.split(' ')[0] || "Trader",
            last_name: localStorage.getItem("tradifive_cached_display_name")?.split(' ')[1] || "",
            display_name: localStorage.getItem("tradifive_cached_display_name") || "Trader",
            full_name: localStorage.getItem("tradifive_cached_display_name") || "Trader",
            username: localStorage.getItem("tradifive_cached_username") || "trader",
            avatar_url: localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg",
            bio: "Tradifive Member",
            banner_url: "/default-cover.png"
          }
        });
        safeSetLocalPosts(localPosts);
        
        if (isScheduled) {
          toast.success(`Post scheduled successfully for ${scheduleDate} at ${scheduleTime}!`);
        } else {
          toast.success("Post published successfully!");
        }
      } else {
        if (!postId) throw new Error("Missing postId in Edit Mode");
        try {
          const { error } = await supabase
            .from("social_posts")
            .update({
              content: finalContent,
              media_url: finalMediaUrlVal,
              media_urls: finalMediaUrlsVal,
              post_type: finalPostType,
              tags: combinedTags.length > 0 ? combinedTags : null,
              created_at: createdTime,
              updated_at: new Date().toISOString(),
              is_public: postVisibility === 'anyone'
            })
            .eq("id", postId);
          if (error) {
            console.warn("Supabase update failed, using optimistic UI anyway:", error);
          }
        } catch (dbErr) {
          console.warn("Supabase update exception, using optimistic UI anyway:", dbErr);
        }

        // Optimistic UI Update (updates local state immediately)
        const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
        const idx = localPosts.findIndex((p: any) => p.id === postId);
        if (idx !== -1) {
          localPosts[idx] = {
            ...localPosts[idx],
            content: finalContent,
            media_url: finalMediaUrlVal,
            media_urls: finalMediaUrlsVal,
            media_type: finalMediaTypeVal,
            post_type: finalPostType,
            tags: combinedTags.length > 0 ? combinedTags : null,
            created_at: createdTime,
            updated_at: new Date().toISOString(),
            is_public: postVisibility === 'anyone'
          };
          safeSetLocalPosts(localPosts);
          if (isScheduled) {
            toast.success("Scheduled post updated!");
          } else {
            toast.success("Post details updated!");
          }
        } else {
          // Override editing backup for database mock posts
          localPosts.unshift({
            id: postId,
            user_id: userId || "mock-user-id",
            content: finalContent,
            media_url: finalMediaUrlVal,
            media_urls: finalMediaUrlsVal,
            media_type: finalMediaTypeVal,
            post_type: finalPostType,
            tags: combinedTags.length > 0 ? combinedTags : null,
            created_at: createdTime,
            updated_at: new Date().toISOString(),
            likes_count: 0,
            comments_count: 0,
            bookmark_count: 0,
            like_count: 0,
            comment_count: 0,
            share_count: 0,
            view_count: 0,
            is_public: postVisibility === 'anyone',
            profiles: {
              id: userId || "mock-user-id",
              first_name: localStorage.getItem("tradifive_cached_display_name")?.split(' ')[0] || "Trader",
              last_name: localStorage.getItem("tradifive_cached_display_name")?.split(' ')[1] || "",
              display_name: localStorage.getItem("tradifive_cached_display_name") || "Trader",
              full_name: localStorage.getItem("tradifive_cached_display_name") || "Trader",
              username: localStorage.getItem("tradifive_cached_username") || "trader",
              avatar_url: localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg",
              bio: "Tradifive Member",
              banner_url: "/default-cover.png"
            }
          });
          safeSetLocalPosts(localPosts);
          if (isScheduled) {
            toast.success("Scheduled post updated successfully!");
          } else {
            toast.success("Post details updated successfully!");
          }
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error submitting post:", err);
      toast.error(err.message || "Failed to submit post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" 
          onClick={onClose} 
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#151515] shadow-2xl relative z-50 w-full max-w-[700px] max-h-[90vh] rounded-2xl flex flex-col font-sans border border-slate-200 dark:border-zinc-800 mb-20"
        >
          <div className={showPostSettings ? "hidden" : "flex flex-col h-full flex-grow"}>
            <form onSubmit={handleSubmit} className="flex flex-col h-full flex-grow relative">
              {/* Header */}
              <div className="px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-zinc-800/60 bg-white dark:bg-[#151515] relative z-50 rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
                    >
                     <CloseSquare set="curved" stroke="bold" primaryColor="currentColor" size={22} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                   {/* Market Dropdown */}
                   <div className="relative">
                      <button 
                          type="button" 
                          onClick={() => setShowMarketDropdown(!showMarketDropdown)} 
                          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 text-[13px] font-bold rounded-full px-3 py-1.5 transition-colors whitespace-nowrap shrink-0 shadow-sm"
                      >
                          {postMarket === 'global' ? 'Global (Forex)' : postMarket === 'indian' ? 'Indian Market' : 'Psychology'}
                          <ChevronDown set="curved" stroke="bold" primaryColor="currentColor" size={14} className="text-slate-500 ml-0.5" />
                      </button>

                      {showMarketDropdown && (
                          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl py-1 z-50 text-sm overflow-hidden">
                              <button 
                                  type="button"
                                  onClick={() => { setPostMarket('global'); setShowMarketDropdown(false); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 text-left font-medium"
                              >
                                  <Globe size={14} className="text-slate-500" />
                                  Global (Forex)
                              </button>
                              <button 
                                  type="button"
                                  onClick={() => { setPostMarket('indian'); setShowMarketDropdown(false); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 text-left font-medium"
                              >
                                  <IndianRupee size={14} className="text-slate-500" />
                                  Indian Market
                              </button>
                              <button 
                                  type="button"
                                  onClick={() => { setPostMarket('psychology'); setShowMarketDropdown(false); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 text-left font-medium"
                              >
                                  <Brain size={14} className="text-slate-500" />
                                  Psychology
                              </button>
                          </div>
                      )}
                   </div>

                   {/* Schedule Button */}
                   <button type="button" onClick={() => setIsScheduled(true)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors" title="Schedule">
                        <IconlyCalendar set="curved" stroke="bold" primaryColor="currentColor" size={20} />
                   </button>
                     
                   {/* Post Button */}
                   <button
                      type="submit"
                      disabled={isSubmitting || (!content.trim() && mediaPreviews.length === 0 && attachmentType !== "poll")}
                      className="px-5 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                   >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (mode === "edit" ? "Update" : "Post")}
                   </button>
                </div>
              </div>

              <div className="flex flex-col min-h-0 flex-grow relative">
                <div className="p-5 pb-20 flex-grow overflow-y-auto amazing-scrollbar">
                 {/* User Info Row */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      <img
                        src={localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }}
                      />
                    </div>
                    <div>
                      <div 
                        className="flex flex-col items-start justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 py-1 px-2 -ml-2 rounded-lg transition-colors" 
                        onClick={() => setShowPostSettings(true)}
                      >
                        <div className="flex items-center gap-1">
                           <span className="text-[15px] font-bold text-slate-900 dark:text-white leading-none">
                             {localStorage.getItem("tradifive_cached_display_name") || "Trader"}
                           </span>
                           <ChevronDown set="curved" stroke="bold" primaryColor="currentColor" size={14} className="text-slate-600 dark:text-slate-400 mt-0.5" />
                        </div>
                        <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          Post to {postVisibility === "anyone" ? "Anyone" : "Connections"}
                        </span>
                      </div>
                      {(isCreator || locationName) && (
                        <div className="flex items-center gap-2 mt-1 ml-2">
                          {isCreator && (
                            <button
                              type="button"
                              onClick={() => setIsPremium(!isPremium)}
                              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                                isPremium 
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" 
                                  : "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                              }`}
                            >
                              {isPremium ? <><Crown size={10} /> Premium Substack</> : <><Globe size={10} /> Everyone</>}
                            </button>
                          )}
                          {locationName && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                               <MapPin size={10} /> {locationName}
                               <LucideX size={10} className="ml-1 cursor-pointer hover:text-rose-500" onClick={(e) => { e.stopPropagation(); setLocationName(""); }} />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                 </div>

               {/* Text Area */}
               <div className="relative">
                 <textarea
                   ref={textareaRef}
                   rows={content.split('\n').length > 3 ? Math.min(8, content.split('\n').length) : 4}
                   value={content}
                   onChange={handleTextareaChange}
                   onClick={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                   onKeyUp={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                   placeholder="What's happening in the markets?"
                   className="w-full bg-transparent border-none text-[16px] sm:text-[18px] outline-none resize-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-zinc-500 leading-relaxed font-medium"
                 />
                 
                 {/* Mentions Dropdown */}
                 {showMentionDropdown && userSearchResults.length > 0 && (
                   <div className="absolute left-0 top-full mt-1 w-[260px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 max-h-[180px] overflow-y-auto amazing-scrollbar">
                     {userSearchResults.map((user) => (
                       <div key={user.id} onClick={() => handleSelectMention(user)} className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800/50">
                         <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0"><img src={user.avatar_url} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} /></div>
                         <div className="flex flex-col">
                            <span className="font-semibold dark:text-white leading-tight">{user.display_name}</span> 
                            <span className="text-slate-400 text-xs">@{user.username}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

                {/* Attachment Inline Renders */}
                {attachmentType === "image" && mediaPreviews.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                     {mediaPreviews.map((url, idx) => (
                       <div key={idx} className="relative inline-block">
                          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 w-24 h-24 sm:w-28 sm:h-28">
                             <img src={url} className="w-full h-full object-cover" />
                          </div>
                          <button type="button" onClick={() => removeMediaAt(idx)} className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors z-10">
                             <LucideX size={14} strokeWidth={3} />
                          </button>
                       </div>
                     ))}
                  </div>
                )}
                {attachmentType === "video" && mediaPreviews.length > 0 && (
                    <div className="mt-4 relative inline-block w-full max-w-sm">
                     <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 w-full bg-black flex items-center justify-center min-h-[150px]">
                        <video src={mediaPreviews[0]} className="w-full h-auto max-h-[300px] object-contain" autoPlay muted loop playsInline />
                     </div>
                     <button type="button" onClick={removeMedia} className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors z-10">
                        <LucideX size={14} strokeWidth={3} />
                     </button>
                  </div>
                )}
                
                {/* GIF selector inline */}
                {attachmentType === "gif" && mediaPreviews.length === 0 && (
                 <div className="mt-4 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">Select a Market Meme</span>
                      <LucideX size={14} className="cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => handleAttachmentTypeChange("none")} />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {CURATED_GIFS.map((gif) => (
                        <div key={gif.name} onClick={() => selectPresetGif(gif.url)} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                          <img src={gif.url} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               {/* Poll Creator Inline */}
               {attachmentType === "poll" && (
                 <div className="mt-4 rounded-xl border border-slate-200 dark:border-zinc-800 p-4">
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handlePollOptionChange(i, e.target.value)}
                          placeholder={`Choice ${i + 1}`}
                          maxLength={25}
                          className="flex-1 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                        {pollOptions.length > 2 && (
                          <button type="button" onClick={() => removePollOption(i)} className="text-slate-400 hover:text-rose-500"><LucideX size={18} /></button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 4 && (
                      <button type="button" onClick={addPollOption} className="text-slate-500 dark:text-slate-400 text-sm font-semibold hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 mt-2"><Plus size={16}/> Add choice</button>
                    )}
                 </div>
               )}

               {/* Signal Creator Inline */}
               {attachmentType === "signal" && (
                 <div className="mt-4 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5 p-4">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"><BarChart2 size={16} /> Trading Signal</span>
                       <LucideX size={16} className="cursor-pointer text-indigo-400 hover:text-indigo-600" onClick={() => handleAttachmentTypeChange("none")} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="col-span-2 sm:col-span-1">
                          <div className="flex bg-white dark:bg-[#1C1C1E] rounded-lg border border-slate-200 dark:border-zinc-800 p-1">
                            <button type="button" onClick={() => setSignalData(s => ({ ...s, action: "Buy" }))} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${signalData.action === "Buy" ? "bg-emerald-500 text-white" : "text-slate-500"}`}>Buy / Long</button>
                            <button type="button" onClick={() => setSignalData(s => ({ ...s, action: "Sell" }))} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${signalData.action === "Sell" ? "bg-rose-500 text-white" : "text-slate-500"}`}>Sell / Short</button>
                          </div>
                       </div>
                       <input type="text" value={signalData.asset} onChange={(e) => setSignalData(s => ({ ...s, asset: e.target.value.toUpperCase() }))} placeholder="Asset (e.g. XAUUSD)" className="px-3 py-2 text-sm bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 rounded-lg outline-none focus:border-indigo-500 font-bold uppercase" />
                       <input type="text" value={signalData.entry} onChange={(e) => setSignalData(s => ({ ...s, entry: e.target.value }))} placeholder="Entry Price" className="px-3 py-2 text-sm bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 rounded-lg outline-none focus:border-indigo-500" />
                       <div className="grid grid-cols-2 gap-2">
                         <input type="text" value={signalData.tp} onChange={(e) => setSignalData(s => ({ ...s, tp: e.target.value }))} placeholder="Target (TP)" className="px-3 py-2 text-sm bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 rounded-lg outline-none focus:border-emerald-500 text-emerald-600" />
                         <input type="text" value={signalData.sl} onChange={(e) => setSignalData(s => ({ ...s, sl: e.target.value }))} placeholder="Stop (SL)" className="px-3 py-2 text-sm bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 rounded-lg outline-none focus:border-rose-500 text-rose-600" />
                       </div>
                    </div>
                 </div>
               )}
               
               {/* Schedule Settings Inline */}
               {isScheduled && (
                  <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Calendar size={16} /> Schedule Post</span>
                       <LucideX size={16} className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onClick={() => { setIsScheduled(false); setScheduleDate(""); setScheduleTime(""); }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="px-3 py-2 text-sm bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 rounded-lg outline-none focus:border-blue-500" />
                       <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="px-3 py-2 text-sm bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 rounded-lg outline-none focus:border-blue-500" />
                    </div>
                  </div>
               )}
            </div>
            {/* Action Bar (Footer) */}
             <div className="absolute bottom-0 w-full px-5 py-3 border-t border-slate-100 dark:border-zinc-800/60 bg-white dark:bg-[#151515] rounded-b-2xl">
                <div className="flex items-center justify-between">
                   {/* Toolbelt */}
                   <div className="flex items-center gap-1">
                      {(mediaPreviews.length < 4 && mediaType !== 'video') && (
                        <button type="button" onClick={() => { handleAttachmentTypeChange("image"); setTimeout(() => fileInputRef.current?.click(), 100); }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 transition-colors" title="Add Media">
                           <Image set="curved" stroke="bold" primaryColor="currentColor" size={22} />
                        </button>
                      )}
                      {(mediaPreviews.length === 0 && mediaType !== 'image') && (
                        <button type="button" onClick={() => { handleAttachmentTypeChange("video"); setTimeout(() => fileInputRef.current?.click(), 100); }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 transition-colors hidden sm:block" title="Add Video">
                           <Video set="curved" stroke="bold" primaryColor="currentColor" size={22} />
                        </button>
                      )}
                      <button type="button" onClick={() => handleAttachmentTypeChange(attachmentType === 'poll' ? 'none' : 'poll')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors hidden sm:block text-slate-600 dark:text-slate-400" title={attachmentType === 'poll' ? "Cancel Poll" : "Create Poll"}>
                         {attachmentType === 'poll' ? (
                           <LucideX size={22} strokeWidth={2} />
                         ) : (
                           <Document set="curved" stroke="bold" primaryColor="currentColor" size={22} />
                         )}
                      </button>
                      {isCreator && (
                        <button type="button" onClick={() => handleAttachmentTypeChange("signal")} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 transition-colors" title="Signal">
                          <Document set="curved" stroke="bold" primaryColor="currentColor" size={22} />
                        </button>
                      )}
                      
                      <div className="w-[1px] h-5 bg-slate-300 dark:bg-zinc-700 mx-2"></div>
  
                      <div className="relative">
                        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 transition-colors" title="Emoji">
                          <SmilePlus size={22} strokeWidth={2} />
                        </button>
                        {showEmojiPicker && (
                            <div className="absolute bottom-12 left-0 z-50 drop-shadow-2xl">
                              <EmojiPicker onEmojiClick={(e) => insertEmoji(e.emoji)} theme="dark" />
                            </div>
                        )}
                      </div>
  
                   </div>
                   
                   <div className="flex items-center gap-3 ml-auto text-slate-400 dark:text-slate-400 text-[12px] font-medium">
                      {/* Character Counter */}
                      <span className={`font-bold ${
                        content.length >= 2000 
                          ? "text-rose-500" 
                          : content.length > 1800 
                            ? "text-amber-500" 
                            : "text-slate-400 dark:text-zinc-400"
                      }`}>
                        {content.length}/2000
                      </span>
                      <div className="w-[1px] h-3 bg-slate-200 dark:bg-zinc-800"></div>
                      <span className="hidden sm:inline">Type @ to mention people.</span>
                      <InfoCircle set="curved" stroke="bold" primaryColor="currentColor" size={14} className="ml-1.5" />
                   </div>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple={attachmentType === "image"}
                  accept={attachmentType === "video" ? "video/mp4,video/webm" : "image/*"}
                  className="hidden"
                />
             </div>
              </div>
            </form>
          </div>

          {/* Post Settings View */}
          {showPostSettings && (
             <div className="flex flex-col h-full flex-grow bg-white dark:bg-[#151515] rounded-2xl">
               <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/60 shrink-0 rounded-t-2xl">
                  <h2 className="text-[17px] font-bold text-slate-900 dark:text-white">Post settings</h2>
                  <button type="button" onClick={() => setShowPostSettings(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors">
                     <CloseSquare set="curved" stroke="bold" primaryColor="currentColor" size={22} />
                  </button>
               </div>
               
               <div className="p-5 flex-grow overflow-y-auto">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-4">Who can see your post?</h3>
                  
                  <div className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors mb-2 ${postVisibility === 'anyone' ? 'bg-slate-100 dark:bg-zinc-800/80' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'}`} onClick={() => setPostVisibility('anyone')}>
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                            <Discovery set="curved" stroke="bold" primaryColor="currentColor" size={18} className="text-slate-600 dark:text-slate-400" />
                         </div>
                        <div className="flex flex-col">
                           <span className="font-semibold text-[15px] text-slate-900 dark:text-white">Anyone</span>
                           <span className="text-[13px] text-slate-500">Anyone on or off TradiFive</span>
                        </div>
                     </div>
                     <div className="shrink-0 flex items-center justify-center">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${postVisibility === 'anyone' ? 'border-[#0a66c2] dark:border-[#0a66c2]' : 'border-slate-400'}`}>
                           {postVisibility === 'anyone' && <div className="w-2.5 h-2.5 rounded-full bg-[#0a66c2]" />}
                        </div>
                     </div>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${postVisibility === 'connections' ? 'bg-slate-100 dark:bg-zinc-800/80' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'}`} onClick={() => setPostVisibility('connections')}>
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                            <TwoUsers set="curved" stroke="bold" primaryColor="currentColor" size={18} className="text-slate-600 dark:text-slate-400" />
                         </div>
                        <div className="flex flex-col">
                           <span className="font-semibold text-[15px] text-slate-900 dark:text-white">Connections only</span>
                           <span className="text-[13px] text-slate-500">Connections on TradiFive</span>
                        </div>
                     </div>
                     <div className="shrink-0 flex items-center justify-center">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${postVisibility === 'connections' ? 'border-[#0a66c2]' : 'border-slate-400'}`}>
                           {postVisibility === 'connections' && <div className="w-2.5 h-2.5 rounded-full bg-[#0a66c2]" />}
                        </div>
                     </div>
                  </div>
                  
                  <div className="h-px bg-slate-200 dark:bg-zinc-800/60 w-full my-5" />
                  
                  <div className="flex items-center justify-between px-1">
                     <div className="flex flex-col">
                        <span className="font-semibold text-[15px] text-slate-900 dark:text-white">Comment control</span>
                        <span className="text-[13px] text-slate-500">{allowComments ? "Comments ON" : "Comments OFF"}</span>
                     </div>
                     <div className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${allowComments ? 'bg-green-600' : 'bg-slate-400 dark:bg-zinc-600'}`} onClick={() => setAllowComments(!allowComments)}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${allowComments ? 'translate-x-5' : 'translate-x-0'}`} />
                     </div>
                  </div>

                  <div className="h-px bg-slate-200 dark:bg-zinc-800/60 w-full my-5" />
                  
                  <div className="flex items-center justify-between px-1">
                     <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[15px] text-slate-900 dark:text-white">Brand partnership</span>
                     </div>
                     <div className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${brandPartnership ? 'bg-green-600' : 'bg-slate-400 dark:bg-zinc-600'}`} onClick={() => setBrandPartnership(!brandPartnership)}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${brandPartnership ? 'translate-x-5' : 'translate-x-0'}`} />
                     </div>
                  </div>
               </div>
               
               <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-end gap-3 shrink-0 bg-white dark:bg-[#151515] rounded-b-2xl">
                  <button type="button" onClick={() => setShowPostSettings(false)} className="px-5 py-2 rounded-full font-semibold text-[15px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                     Back
                  </button>
                  <button type="button" onClick={() => setShowPostSettings(false)} className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] transition-colors">
                     Done
                  </button>
               </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
