import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';

export const BaziSetup: FC = () => {
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();
  const { auth, setBazi } = useAppStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/bazi/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ year, month, day, hour, minute }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data.bazi);
        setBazi(data.bazi);
      } else {
        alert(data.error || '计算失败');
      }
    } catch (error) {
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };
  
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-immortal-bg px-4">
        <div className="panel w-full max-w-md">
          <h2 className="text-2xl font-bold text-gradient text-center mb-6">八字命格测算结果</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="stat-card">
                <div className="text-xs text-immortal-secondary">年柱</div>
                <div className="text-lg font-bold">{result.yearPillar.stem}{result.yearPillar.branch}</div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-immortal-secondary">月柱</div>
                <div className="text-lg font-bold">{result.monthPillar.stem}{result.monthPillar.branch}</div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-immortal-secondary">日柱</div>
                <div className="text-lg font-bold">{result.dayPillar.stem}{result.dayPillar.branch}</div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-immortal-secondary">时柱</div>
                <div className="text-lg font-bold">{result.hourPillar.stem}{result.hourPillar.branch}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="text-sm text-immortal-secondary mb-2">灵根判定</div>
              <div className="text-2xl font-bold text-immortal-primary">{result.spiritualRoot.name}</div>
              <div className="text-sm text-immortal-secondary mt-1">{result.spiritualRoot.description}</div>
              <div className="text-sm mt-2">
                修炼加成: <span className="text-immortal-primary font-bold">{result.spiritualRoot.bonus}x</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="text-sm text-immortal-secondary mb-2">五行分布</div>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div>金:{result.elementStats.金}</div>
                <div>木:{result.elementStats.木}</div>
                <div>水:{result.elementStats.水}</div>
                <div>火:{result.elementStats.火}</div>
                <div>土:{result.elementStats.土}</div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-lg bg-immortal-primary text-immortal-bg font-bold
                         hover:bg-amber-400 transition-colors"
            >
              开始修炼
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-immortal-bg px-4">
      <div className="panel w-full max-w-md">
        <h2 className="text-2xl font-bold text-gradient text-center mb-2">设置生辰八字</h2>
        <p className="text-immortal-secondary text-center text-sm mb-6">
          准确测算你的命格五行，确定灵根属性
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm text-immortal-secondary mb-1">年</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min="1900"
                max="2100"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-immortal-secondary/30 
                           text-immortal-text focus:outline-none focus:border-immortal-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-immortal-secondary mb-1">月</label>
              <input
                type="number"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                min="1"
                max="12"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-immortal-secondary/30 
                           text-immortal-text focus:outline-none focus:border-immortal-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-immortal-secondary mb-1">日</label>
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value))}
                min="1"
                max="31"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-immortal-secondary/30 
                           text-immortal-text focus:outline-none focus:border-immortal-primary"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-immortal-secondary mb-1">时 (0-23)</label>
              <input
                type="number"
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value))}
                min="0"
                max="23"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-immortal-secondary/30 
                           text-immortal-text focus:outline-none focus:border-immortal-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-immortal-secondary mb-1">分</label>
              <input
                type="number"
                value={minute}
                onChange={(e) => setMinute(parseInt(e.target.value))}
                min="0"
                max="59"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-immortal-secondary/30 
                           text-immortal-text focus:outline-none focus:border-immortal-primary"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-immortal-primary text-immortal-bg font-bold
                       hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {loading ? '测算中...' : '测算八字'}
          </button>
        </form>
      </div>
    </div>
  );
};
