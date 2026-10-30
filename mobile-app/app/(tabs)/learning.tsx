import React, { useState, useEffect, useCallback } from 'react';
import ComingSoonVeil from '../../components/ComingSoonVeil';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, StatusBar, Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Play, Clock, Star, Lock, Award, PackageOpen, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../utils/supabase';
import { useStore } from '../store';
import { useAppTheme } from '../../hooks/useAppTheme';
import UpgradeGate from '../components/UpgradeGate';

const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

interface Course {
  id: string;
  title: string;
  instructor: string;
  level: string;
  duration: string;
  lessons_count: number;
  rating: number;
  students_count: number;
  price: string;
  is_free: boolean;
  thumbnail_url?: string;
}

const EmptyState = ({ isDark }: { isDark: boolean }) => (
  <View style={{ alignItems: 'center', paddingVertical: 70, gap: 14 }}>
    <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: isDark ? '#1e2535' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
      <BookOpen size={32} color={isDark ? '#475569' : '#94a3b8'} />
    </View>
    <Text style={{ fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center' }}>
      No courses yet
    </Text>
    <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: isDark ? '#475569' : '#cbd5e1', textAlign: 'center', maxWidth: 260, lineHeight: 21 }}>
      Trading courses and learning materials will appear here once published by instructors.
    </Text>
  </View>
);

export default function Learning() {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useAppTheme();
  const profile = useStore(state => state.currentUser);

  const [level, setLevel]     = useState('All');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCourses(data);
      } else {
        setCourses([]);
      }
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const onRefresh = () => { setRefreshing(true); fetchCourses(); };

  const filtered = courses.filter(c => level === 'All' || c.level === level);

  const s = React.useMemo(() => {
    if (!isDark) return globalStyles;
    const shadowed: any = {};
    for (const key in globalStyles) {
      shadowed[key] = { ...(globalStyles as any)[key] };
      const bg = shadowed[key].backgroundColor;
      if (bg === '#fff' || bg === '#ffffff') shadowed[key].backgroundColor = theme.card;
      else if (bg === '#f8fafc' || bg === '#f4f4f6') shadowed[key].backgroundColor = theme.background;
      const c = shadowed[key].color;
      if (c === '#0f172a' || c === '#1e293b') shadowed[key].color = theme.text;
      const bc = shadowed[key].borderColor;
      if (bc === '#f1f5f9' || bc === '#e2e8f0') shadowed[key].borderColor = theme.cardBorder;
    }
    if (shadowed.levelActive) shadowed.levelActive.backgroundColor = theme.text;
    if (shadowed.levelTxtActive) shadowed.levelTxtActive.color = theme.background;
    return shadowed;
  }, [isDark, theme]);

  return (
    <UpgradeGate feature="learning">
      <View style={s.container}>
        <StatusBar barStyle="light-content" />

        <View style={[s.header, { paddingTop: insets.top + 20 }]}>
          <Image source={require('../../assets/images/top-glow.png')}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: insets.top + 160 }} resizeMode="stretch" />
          <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={18} color="#fff" />
              </View>
              <Text style={s.headerTitle}>Learning Hub</Text>
            </View>
            <Text style={s.headerSub}>Master trading with expert-led courses</Text>
          </View>
        </View>

        <View style={s.mainCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 14 }}>
            {LEVELS.map(l => (
              <TouchableOpacity key={l} style={[s.levelPill, level === l && s.levelActive]} onPress={() => { h(); setLevel(l); }}>
                <Text style={[s.levelTxt, level === l && s.levelTxtActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={{ marginTop: 12, fontSize: 14, fontFamily: 'Inter_500Medium', color: isDark ? '#64748b' : '#94a3b8' }}>Loading courses...</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 120 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
            >
              {filtered.length === 0 ? (
                <EmptyState isDark={isDark} />
              ) : (
                filtered.map(course => (
                  <TouchableOpacity key={course.id} style={s.courseCard} onPress={h}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.courseLevel}>{course.level}</Text>
                        <Text style={s.courseTitle}>{course.title}</Text>
                        <Text style={s.courseInstructor}>{course.instructor}</Text>
                      </View>
                      <View style={[s.priceBadge, { backgroundColor: course.is_free ? '#dcfce7' : '#eef2ff' }]}>
                        <Text style={[s.priceText, { color: course.is_free ? '#16a34a' : '#6366f1' }]}>
                          {course.is_free ? 'FREE' : course.price}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} color="#94a3b8" />
                        <Text style={s.metaTxt}>{course.duration}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Play size={13} color="#94a3b8" />
                        <Text style={s.metaTxt}>{course.lessons_count} lessons</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Star size={13} color="#f59e0b" fill="#f59e0b" />
                        <Text style={s.metaTxt}>{course.rating?.toFixed(1)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      <ComingSoonVeil
        featureTitle="Trading Academy"
        subtitle="Algorithmic trading masterclasses, video tutorials & quant tools are launching soon."
      />
    </View>
    </UpgradeGate>
  );
}

const globalStyles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#000' },
  header:       { backgroundColor: 'transparent', zIndex: 10 },
  headerTitle:  { fontSize: 26, fontFamily: 'Inter_900Black', color: '#fff' },
  headerSub:    { fontSize: 13, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  mainCard:     { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden' },
  levelPill:    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
  levelActive:  { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  levelTxt:     { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#64748b' },
  levelTxtActive: { color: '#fff' },
  courseCard:   { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  courseLevel:  { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#6366f1', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  courseTitle:  { fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: '#0f172a', marginBottom: 2 },
  courseInstructor: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b', marginBottom: 10 },
  priceBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  priceText:    { fontSize: 12, fontFamily: 'Inter_800ExtraBold' },
  metaTxt:      { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
});
