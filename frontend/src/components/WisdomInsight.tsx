import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Send, History, X, Edit2, Trash2, Sparkles } from 'lucide-react';
import type { WisdomInsight as WisdomInsightType } from '../types';

interface WisdomInsightProps {
  wisdomId: string;
  insights: WisdomInsightType[];
  isLoading?: boolean;
  onSubmit: (content: string) => Promise<void>;
  onDelete?: (insightId: string) => Promise<void>;
  className?: string;
}

/**
 * 箴言感悟输入组件
 * 输入框让用户记录对箴言的感悟，历史感悟列表展示
 */
export const WisdomInsightComponent: FC<WisdomInsightProps> = ({
  wisdomId,
  insights,
  isLoading = false,
  onSubmit,
  onDelete,
  className = '',
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当 wisdomId 改变时，清空输入
  useEffect(() => {
    setContent('');
    setError(null);
  }, [wisdomId]);

  // 提交感悟
  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('请输入感悟内容');
      return;
    }

    if (content.length > 500) {
      setError('感悟内容不能超过500字');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content.trim());
      setContent('');
      setShowHistory(true); // 提交后显示历史列表
    } catch (err) {
      setError('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除感悟
  const handleDelete = async (insightId: string) => {
    if (!onDelete) return;
    
    if (!confirm('确定要删除这条感悟吗？')) {
      return;
    }

    try {
      await onDelete(insightId);
    } catch (err) {
      setError('删除失败，请重试');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`panel ${className}`}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-immortal-primary" />
          <h3 className="text-lg font-bold text-immortal-text">感悟心得</h3>
        </div>
        
        {insights.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-sm text-immortal-secondary hover:text-immortal-primary transition-colors"
          >
            {showHistory ? (
              <>
                <X className="w-4 h-4" />
                <span>收起</span>
              </>
            ) : (
              <>
                <History className="w-4 h-4" />
                <span>历史 ({insights.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 输入区域 */}
      <div className="relative mb-4">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          placeholder="记录你对今日箴言的感悟..."
          maxLength={500}
          disabled={isSubmitting}
          className="w-full h-28 bg-slate-800/50 border border-immortal-secondary/30 rounded-xl p-4 pr-12
                     text-immortal-text placeholder-immortal-secondary/50
                     focus:outline-none focus:border-immortal-primary/50 focus:ring-1 focus:ring-immortal-primary/30
                     resize-none transition-all disabled:opacity-50"
        />
        
        {/* 字数统计 */}
        <div className={`absolute bottom-3 right-3 text-xs ${
          content.length > 450 ? 'text-red-400' : 'text-immortal-secondary/50'
        }`}>
          {content.length}/500
        </div>
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提交按钮 */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-immortal-secondary/70">
          每日记录感悟，有助于领悟大道
        </p>
        
        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-2.5 bg-immortal-primary text-immortal-bg font-medium rounded-xl
                     hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-immortal-primary/20"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-immortal-bg/30 border-t-immortal-bg rounded-full animate-spin" />
              <span>提交中...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>记录感悟</span>
            </>
          )}
        </motion.button>
      </div>

      {/* 历史感悟列表 */}
      <AnimatePresence>
        {showHistory && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-6 border-t border-immortal-secondary/20">
              <h4 className="text-sm font-medium text-immortal-secondary mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                历史感悟
              </h4>
              
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-slate-800/30 rounded-xl p-4 border border-immortal-secondary/10 
                                 hover:border-immortal-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-immortal-text/90 leading-relaxed mb-2">
                            {insight.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-immortal-secondary/60">
                            <Edit2 className="w-3 h-3" />
                            <span>{formatDate(insight.createdAt)}</span>
                            {insight.updatedAt !== insight.createdAt && (
                              <span className="text-immortal-primary/60">(已编辑)</span>
                            )}
                          </div>
                        </div>
                        
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(insight.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg 
                                       text-immortal-secondary hover:text-red-400 hover:bg-red-400/10
                                       transition-all"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 空状态 */}
      {!showHistory && insights.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center py-6 text-immortal-secondary/50"
        >
          <PenLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">写下你的第一篇感悟，开启修真之路</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WisdomInsightComponent;
