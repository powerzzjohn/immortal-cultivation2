import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Clock,
  Sparkles,
  TrendingUp,
  Calendar,
  RefreshCw,
  Wind,
  Quote,
  Lightbulb,
  Compass,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { summaryApi, wisdomApi } from '../api';
import { DailyWisdom } from '../components/DailyWisdom';
import type { AIDailySummary, Wisdom } from '../types';

/**
 * AI每日总结页面
 * 
 * 功能：
 * - 显示今日修炼数据
 * - AI生成的个性化总结（问候、回顾、感悟、智慧、建议、金句）
 * - 今日箴言
 * - 历史总结入口
 * - 分享功能
 */
export const DailySummary: FC = () => {
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState<AIDailySummary | null>(null);
  const [wisdom, setWisdom] = useState<Wisdom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoldenQuote, setShowGoldenQuote] = useState(false);

  // 获取今日总结
  const fetchTodaySummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await summaryApi.getTodaySummary();
      
      if (response.data.summary) {
        setSummary(response.data.summary);
      } else {
        setSummary(null);
      }
    } catch (err: any) {
      console.error('获取今日总结失败:', err);
      setError(err.response?.data?.message || '获取总结失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 生成AI总结
  const generateSummary = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // 获取地理位置（如果用户允许）
      let latitude = 39.9042;
      let longitude = 116.4074;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (e) {
        // 使用默认位置（北京）
        console.log('无法获取位置，使用默认');
      }
      
      const response = await summaryApi.generateSummary(latitude, longitude);
      
      if (response.data.summary) {
        setSummary(response.data.summary);
        // 显示金句动画
        setShowGoldenQuote(true);
        setTimeout(() => setShowGoldenQuote(false), 3000);
      }
    } catch (err: any) {
      console.error('生成总结失败:', err);
      setError(err.response?.data?.message || '生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
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

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTodaySummary(), fetchDailyWisdom()]);
    setIsRefreshing(false);
  };

  // 分享金句
  const handleShare = () => {
    if (summary?.goldenQuote) {
      const text = `「${summary.goldenQuote}」—— 来自凡人修仙\n\n今日修炼${summary.todayMinutes}分钟，${summary.greeting}`;
      
      if (navigator.share) {
        navigator.share({
          title: '凡人修仙 - 今日金句',
          text,
        });
      } else {
        navigator.clipboard.writeText(text);
        alert('金句已复制到剪贴板');
      }
    }
  };

  // 首次加载
  useEffect(() => {
    fetchTodaySummary();
    fetchDailyWisdom();
  }, []);

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

  // 获取问候时段
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨';
    if (hour < 12) return '上午';
    if (hour < 18) return '下午';
    return '晚上';
  };

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
              onClick={fetchTodaySummary}
              className="mt-2 text-sm text-immortal-primary hover:underline"
            >
              重试
            </button>
          </div>
        )}

        {/* 未生成状态 */}
        {!isLoading && !summary && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-immortal-primary/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-immortal-primary" />
            </div>
            <h2 className="text-xl font-bold text-immortal-text mb-2">今日总结尚未生成</h2>
            <p className="text-immortal-secondary mb-6 max-w-sm mx-auto">
              完成今日修炼后，AI将为你生成个性化的修炼总结
            </p>
            <button
              onClick={generateSummary}
              disabled={isGenerating}
              className="btn-primary px-8 py-3"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>AI生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>生成今日总结</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* AI总结内容 */}
        {summary && (
          <>
            {/* 问候语 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <h2 className="text-2xl font-bold text-immortal-text">
                {summary.greeting}
              </h2>
              <p className="text-immortal-secondary mt-1">
                这里是{getGreetingTime()}的修炼总结
              </p>
            </motion.div>

            {/* 修炼统计 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="panel"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-immortal-primary" />
                今日修炼
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="stat-card text-center">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-immortal-primary" />
                  <div className="text-xl font-bold text-immortal-text">
                    {formatMinutes(summary.todayMinutes)}
                  </div>
                  <div className="text-xs text-immortal-secondary">修炼时长</div>
                </div>
                
                <div className="stat-card text-center">
                  <Sparkles className="w-5 h-5 mx-auto mb-2 text-immortal-primary" />
                  <div className="text-xl font-bold text-immortal-text">
                    +{summary.expGained}
                  </div>
                  <div className="text-xs text-immortal-secondary">获得经验</div>
                </div>
                
                <div className="stat-card text-center">
                  <Wind className="w-5 h-5 mx-auto mb-2 text-immortal-primary" />
                  <div className="text-xl font-bold text-immortal-text">
                    x{summary.bonusApplied.toFixed(2)}
                  </div>
                  <div className="text-xs text-immortal-secondary">天时加成</div>
                </div>
              </div>
            </motion.div>

            {/* 修炼回顾 */}
            {summary.cultivationReview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="panel"
              >
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-immortal-primary" />
                  修炼回顾
                </h3>
                <p className="text-immortal-text/90 leading-relaxed">
                  {summary.cultivationReview}
                </p>
              </motion.div>
            )}

            {/* 修炼感悟 */}
            {summary.insight && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="panel border-immortal-primary/30"
              >
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-immortal-primary" />
                  修炼感悟
                </h3>
                <p className="text-immortal-text/90 leading-relaxed">
                  {summary.insight}
                </p>
              </motion.div>
            )}

            {/* 金丹工程智慧 */}
            {summary.wisdom && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="panel bg-gradient-to-br from-immortal-primary/5 to-transparent"
              >
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-immortal-primary" />
                  金丹工程智慧
                </h3>
                <p className="text-immortal-text/90 leading-relaxed">
                  {summary.wisdom}
                </p>
              </motion.div>
            )}

            {/* 明日建议 */}
            {summary.suggestion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="panel"
              >
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-immortal-primary" />
                  明日建议
                </h3>
                <p className="text-immortal-text/90 leading-relaxed">
                  {summary.suggestion}
                </p>
              </motion.div>
            )}

            {/* 金句卡片 */}
            <AnimatePresence>
              {summary.goldenQuote && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    scale: showGoldenQuote ? [1, 1.02, 1] : 1,
                  }}
                  transition={{ delay: 0.6 }}
                  className="relative panel bg-gradient-to-br from-immortal-primary/10 via-immortal-secondary/5 to-immortal-primary/10 border-immortal-primary/30"
                >
                  <div className="absolute top-4 left-4">
                    <Quote className="w-8 h-8 text-immortal-primary/30" />
                  </div>
                  
                  <div className="pt-8 pb-4 px-4 text-center">
                    <p className="text-xl font-medium text-immortal-text leading-relaxed">
                      「{summary.goldenQuote}」
                    </p>
                  </div>
                  
                  <div className="flex justify-center pb-2">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1 text-sm text-immortal-secondary hover:text-immortal-primary transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>分享金句</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 再次生成按钮 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center pt-4"
            >
              <button
                onClick={generateSummary}
                disabled={isGenerating}
                className="text-sm text-immortal-secondary hover:text-immortal-primary transition-colors flex items-center gap-1"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? '重新生成中...' : '重新生成总结'}</span>
              </button>
            </motion.div>
          </>
        )}

        {/* 今日箴言 */}
        <DailyWisdom 
          wisdom={wisdom} 
          isLoading={isLoading} 
        />

        {/* 底部间距 */}
        <div className="h-8" />
      </motion.main>
    </div>
  );
};

export default DailySummary;
