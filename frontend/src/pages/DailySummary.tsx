import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Clock,
  Sparkles,
  Gem,
  TrendingUp,
  Calendar,
  RefreshCw,
  Wind,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { wisdomApi } from '../api';
import { DailyWisdom } from '../components/DailyWisdom';
import { WisdomInsightComponent } from '../components/WisdomInsight';
import type { WisdomDailySummary, Wisdom, WisdomInsight as WisdomInsightType } from '../types';

/**
 * 每日总结页面
 * 展示当日修炼统计：
 * - 修炼时长、经验值获得
 * - 境界进度条
 * - 灵石收入
 * - 今日箴言
 * - 修炼建议（根据五行属性）
 */
export const DailySummary: FC = () => {
  const navigate = useNavigate();
  const { auth: _auth } = useAppStore();
  
  const [summary, setSummary] = useState<WisdomDailySummary | null>(null);
  const [wisdom, setWisdom] = useState<Wisdom | null>(null);
  const [insights, setInsights] = useState<WisdomInsightType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取每日总结数据
  const fetchDailySummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await wisdomApi.getDailySummary();
      setSummary(response.data.summary);
      setWisdom(response.data.wisdom);
    } catch (err: any) {
      console.error('获取每日总结失败:', err);
      setError(err.response?.data?.message || '获取每日总结失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取今日箴言
  const fetchDailyWisdom = async () => {
    try {
      const response = await wisdomApi.getDailyWisdom();
      setWisdom(response.data.wisdom);
    } catch (err: any) {
      console.error('获取今日箴言失败:', err);
    }
  };

  // 获取感悟列表
  const fetchInsights = async () => {
    if (!wisdom?.id) return;
    
    try {
      const response = await wisdomApi.getInsights(wisdom.id);
      setInsights(response.data.insights);
    } catch (err: any) {
      console.error('获取感悟列表失败:', err);
    }
  };

  // 提交感悟
  const handleSubmitInsight = async (content: string) => {
    if (!wisdom?.id) throw new Error('暂无箴言');
    
    const response = await wisdomApi.createInsight({
      wisdomId: wisdom.id,
      content,
    });
    
    // 添加到列表开头
    setInsights(prev => [response.data.insight, ...prev]);
  };

  // 删除感悟
  const handleDeleteInsight = async (insightId: string) => {
    await wisdomApi.deleteInsight(insightId);
    setInsights(prev => prev.filter(i => i.id !== insightId));
  };

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDailySummary(), fetchDailyWisdom()]);
    setIsRefreshing(false);
  };

  // 首次加载
  useEffect(() => {
    fetchDailySummary();
    fetchDailyWisdom();
  }, []);

  // 当箴言加载后，获取相关感悟
  useEffect(() => {
    if (wisdom?.id) {
      fetchInsights();
    }
  }, [wisdom?.id]);

  // 格式化时间
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  // 获取当前日期
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen bg-immortal-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-immortal-bg/80 backdrop-blur-md border-b border-immortal-secondary/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-immortal-secondary hover:text-immortal-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          
          <h1 className="text-lg font-bold text-immortal-text">每日总结</h1>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-immortal-secondary/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-immortal-primary ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 py-6 space-y-6"
      >
        {/* 日期显示 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-immortal-secondary"
        >
          <Calendar className="w-4 h-4" />
          <span>{today}</span>
        </motion.div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchDailySummary}
              className="mt-2 text-sm text-immortal-primary hover:underline"
            >
              重试
            </button>
          </div>
        )}

        {/* 修炼统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-immortal-primary" />
            今日修炼
          </h2>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-slate-700/50 rounded-xl" />
                ))}
              </div>
              <div className="h-4 bg-slate-700/50 rounded w-full" />
            </div>
          ) : summary ? (
            <>
              {/* 统计数据 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="stat-card text-center">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-immortal-primary" />
                  <div className="text-xl font-bold text-immortal-text">
                    {formatMinutes(summary.cultivationStats.todayMinutes)}
                  </div>
                  <div className="text-xs text-immortal-secondary">修炼时长</div>
                </div>
                
                <div className="stat-card text-center">
                  <Sparkles className="w-5 h-5 mx-auto mb-2 text-immortal-primary" />
                  <div className="text-xl font-bold text-immortal-text">
                    +{summary.cultivationStats.expGained}
                  </div>
                  <div className="text-xs text-immortal-secondary">获得经验</div>
                </div>
                
                <div className="stat-card text-center">
                  <Gem className="w-5 h-5 mx-auto mb-2 text-immortal-primary" />
                  <div className="text-xl font-bold text-immortal-text">
                    +{summary.cultivationStats.spiritStones}
                  </div>
                  <div className="text-xs text-immortal-secondary">灵石收入</div>
                </div>
              </div>

              {/* 境界进度 */}
              <div className="bg-slate-800/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-immortal-primary" />
                    <span className="text-sm text-immortal-secondary">境界进度</span>
                  </div>
                  <span className="text-sm font-bold text-immortal-primary">
                    {summary.realmProgress.currentRealm}
                  </span>
                </div>
                
                <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${summary.realmProgress.progress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-immortal-primary to-amber-400 rounded-full"
                  />
                </div>
                
                <div className="flex justify-between text-xs text-immortal-secondary mt-2">
                  <span>{summary.realmProgress.currentExp} 经验</span>
                  <span>{summary.realmProgress.progress.toFixed(1)}%</span>
                  <span>{summary.realmProgress.nextRealmExp} 经验</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-immortal-secondary">
              <p>暂无今日修炼数据</p>
            </div>
          )}
        </motion.div>

        {/* 今日箴言 */}
        <DailyWisdom 
          wisdom={wisdom} 
          isLoading={isLoading} 
        />

        {/* 修炼建议 */}
        {summary?.suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="panel border-immortal-primary/30"
          >
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-immortal-primary" />
              修炼建议
            </h3>
            <p className="text-immortal-text/90 leading-relaxed">
              {summary.suggestion}
            </p>
          </motion.div>
        )}

        {/* 感悟输入 */}
        <WisdomInsightComponent
          wisdomId={wisdom?.id || ''}
          insights={insights}
          isLoading={isLoading}
          onSubmit={handleSubmitInsight}
          onDelete={handleDeleteInsight}
        />

        {/* 底部间距 */}
        <div className="h-8" />
      </motion.main>
    </div>
  );
};

export default DailySummary;
