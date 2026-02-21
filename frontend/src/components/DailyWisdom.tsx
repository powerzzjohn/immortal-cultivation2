import { FC } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import type { Wisdom } from '../types';

interface DailyWisdomProps {
  wisdom: Wisdom | null;
  isLoading?: boolean;
  className?: string;
}

/**
 * 五行属性颜色映射
 */
const elementColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  '金': {
    bg: 'bg-slate-700/30',
    border: 'border-slate-400/50',
    text: 'text-slate-300',
    gradient: 'from-slate-400/20 to-slate-600/20',
  },
  '木': {
    bg: 'bg-green-900/30',
    border: 'border-green-500/50',
    text: 'text-green-400',
    gradient: 'from-green-500/20 to-green-700/20',
  },
  '水': {
    bg: 'bg-blue-900/30',
    border: 'border-blue-400/50',
    text: 'text-blue-400',
    gradient: 'from-blue-400/20 to-blue-600/20',
  },
  '火': {
    bg: 'bg-red-900/30',
    border: 'border-red-500/50',
    text: 'text-red-400',
    gradient: 'from-red-500/20 to-red-700/20',
  },
  '土': {
    bg: 'bg-amber-900/30',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    gradient: 'from-amber-500/20 to-amber-700/20',
  },
};

/**
 * 每日箴言展示组件
 * 展示今日箴言卡片，包含语录内容、出处、五行属性、解读
 * 设计：古风修仙风格，带淡入动画
 */
export const DailyWisdom: FC<DailyWisdomProps> = ({
  wisdom,
  isLoading = false,
  className = '',
}) => {
  // 获取五行属性对应的颜色样式
  const colors = wisdom ? elementColors[wisdom.element] || elementColors['金'] : elementColors['金'];

  // 骨架屏加载状态
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`panel ${className}`}
      >
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-slate-700 rounded" />
            <div className="h-4 bg-slate-700 rounded w-24" />
          </div>
          <div className="h-6 bg-slate-700 rounded w-full mb-2" />
          <div className="h-6 bg-slate-700 rounded w-3/4 mb-4" />
          <div className="h-3 bg-slate-700 rounded w-20 mb-4" />
          <div className="h-16 bg-slate-700/50 rounded w-full" />
        </div>
      </motion.div>
    );
  }

  // 空状态
  if (!wisdom) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`panel ${className}`}
      >
        <div className="text-center py-8 text-immortal-secondary">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无今日箴言</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.gradient} backdrop-blur-md ${className}`}
    >
      {/* 装饰性背景光效 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-immortal-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-immortal-accent/5 rounded-full blur-2xl" />
      
      {/* 顶部装饰线 */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-${colors.text.split('-')[1]}-400/50 to-transparent`} />
      
      <div className="relative p-6">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${colors.text}`} />
            <span className="text-immortal-secondary text-sm font-medium">今日箴言</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
            {wisdom.element}之道
          </span>
        </div>

        {/* 箴言内容 */}
        <blockquote className="mb-4">
          <p className="text-lg text-immortal-text leading-relaxed font-medium">
            &ldquo;{wisdom.content}&rdquo;
          </p>
        </blockquote>

        {/* 出处 */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <BookOpen className="w-4 h-4 text-immortal-secondary" />
          <span className="text-immortal-secondary">出处：</span>
          <span className="text-immortal-primary">{wisdom.source}</span>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-gradient-to-r from-transparent via-immortal-secondary/30 to-transparent mb-4" />

        {/* 解读 */}
        <div className="bg-slate-900/30 rounded-xl p-4">
          <h4 className="text-sm font-medium text-immortal-secondary mb-2">修真解读</h4>
          <p className="text-sm text-immortal-text/90 leading-relaxed">
            {wisdom.interpretation}
          </p>
        </div>

        {/* 底部装饰 */}
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-1 text-immortal-secondary/50">
            <span className="text-xs">✦</span>
            <span className="text-xs">道法自然</span>
            <span className="text-xs">✦</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyWisdom;
