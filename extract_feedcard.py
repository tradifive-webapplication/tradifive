import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

feed_card_start = 54
feed_card_end = 395

feed_card_lines = lines[feed_card_start:feed_card_end]

imports = """import React, { useState, useRef } from "react";
import { Search, Plus, X, MoreHorizontal, Heart, MessageCircle, Bookmark, UserPlus, UserCheck, Flame, ShieldCheck, TrendingUp, Layers, Eye, Calendar, Globe, Sliders, PlayCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import CommentModal from "@/components/CommentModal";
import { FeedPost } from "@/hooks/useHomeData";

"""

with open('src/components/FeedCard.tsx', 'w', encoding='utf-8') as f:
    f.write(imports)
    f.writelines([line.replace('function FeedCard({', 'export default function FeedCard({') for line in feed_card_lines])

new_home_lines = lines[:feed_card_start] + lines[feed_card_end:]
with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_home_lines)

print('Extracted FeedCard successfully.')
