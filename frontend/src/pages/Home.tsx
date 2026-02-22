import { FC, useState, useEffect, useRef } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Sun, Mountain, Timer, Sparkles } from 'lucide-react';

export const Home: FC = () => {
  const [cultivating, setCultivating] = useState(false);
  const [cultivateTime, setCultivateTime] = useState(0);
  const [celestialData, setCelestialData] = useState<any>(null);
  const [cultivationData, setCultivationData] = useState<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { auth, bazi } = useAppStore();
  
  // 获取修炼状态
  useEffect(() => {
    fetchCultivationStatus();
    fetchCelestialData();
  }, []);
  
  // 修炼计时器
  useEffect(() => {
    if (cultivating) {
      intervalRef.current = setInterval(() => {
        setCultivateTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cultivating]);
  
  const fetchCultivationStatus = async () => {
    try {
      const response = await fetch('/api/cultivation/status', {
        headers: { 'Authorization': `Bearer ${auth.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCultivationData(data.cultivation);
        setCultivating(data.cultivation.isCultivating);
      }
    } catch (error) {
      console.error('获取修炼状态失败:', error);
    }
  };
  
  const fetchCelestialData = async () => {
    try {
      const response = await fetch('/api/celestial/now', {
        headers: { 'Authorization': `Bearer ${auth.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCelestialData(data);
      }
    } catch (error) {
      console.error('获取天时数据失败:', error);
    }
  };
  
  const startCultivation = async () => {
    try {
      const response = await fetch('/api/cultivation/start', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` },
      });
      if (response.ok) {
        setCultivating(true);
        setCultivateTime(0);
      }
    } catch (error) {
      alert('开始修炼失败');
    }
  };
  
  const stopCultivation = async () => {
    const minutes = Math.floor(cultivateTime / 60);
    const expGained = Math.floor(minutes * (celestialData?.bonus?.total || 1));
    
    try {
      const response = await fetch('/api/cultivation/stop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minutes, expGained }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCultivating(false);
        setCultivateTime(0);
        fetchCultivationStatus();
        
        let message = `修炼结束！获得 ${data.expGained} 点经验`;
        if (data.spiritStonesReward > 0) {
          message += `，${data.spiritStonesReward} 灵石`;
        }
        if (data.levelUp) {
          message += `\n恭喜突破到${data.newRealm}！`;
        }
        alert(message);
      }
    } catch (error) {
      alert('停止修炼失败');
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-6">
      {/* 修炼主界面 */}
      <div className="panel text-center">
        <h2 className="text-lg text-immortal-secondary mb-2">
          当前境界: <span className="text-immortal-primary font-bold">{cultivationData?.realmName || '炼气'}</span>
        </h2>
        
        {/* 修炼按钮 */}
        <div className="my-8">
          <button
            onClick={cultivating ? stopCultivation : startCultivation}
            className={`cultivation-button ${cultivating ? 'cultivating' : ''}`}
          >
            {cultivating ? (
              <div>
                <div className="text-3xl font-bold">{formatTime(cultivateTime)}</div>
                <div className="text-sm">点击停止</div>
              </div>
            ) : (
              <div>
                <div className="text-2xl">开始</div>
                <div className="text-sm">修炼</div>
              </div>
            )}
          </button>
        </div>
        
        {/* 境界进度 */}
        {cultivationData && (
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between text-sm text-immortal-secondary mb-1">
              <span>境界进度</span>
              <span>{cultivationData.currentExp} / {cultivationData.nextRealmExp}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-immortal-primary to-amber-400 transition-all"
                style={{ width: `${cultivationData.progress}%` }}
              />
            </div>
            <div className="text-xs text-immortal-secondary mt-1">
              {cultivationData.progress.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
      
      {/* 修炼统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <Timer className="w-5 h-5 mx-auto mb-1 text-immortal-primary" />
          <div className="text-2xl font-bold">{cultivationData?.todayMinutes || 0}</div>
          <div className="text-xs text-immortal-secondary">今日修炼(分)</div>
        </div>
        <div className="stat-card text-center">
          <Sparkles className="w-5 h-5 mx-auto mb-1 text-immortal-primary" />
          <div className="text-2xl font-bold">{cultivationData?.totalDays || 0}</div>
          <div className="text-xs text-immortal-secondary">修炼天数</div>
        </div>
        <div className="stat-card text-center">
          <Mountain className="w-5 h-5 mx-auto mb-1 text-immortal-primary" />
          <div className="text-2xl font-bold">{cultivationData?.totalExp || 0}</div>
          <div className="text-xs text-immortal-secondary">累计经验</div>
        </div>
      </div>
      
      {/* 天时数据 */}
      {celestialData && (
        <div className="panel">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-immortal-primary" />
            今日天时
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="stat-card">
              <div className="text-immortal-secondary">天气</div>
              <div className="text-lg">{celestialData.weather.weather} {celestialData.weather.temperature}°C</div>
            </div>
            <div className="stat-card">
              <div className="text-immortal-secondary">月相</div>
              <div className="text-lg">{celestialData.moonPhase.name}</div>
            </div>
            <div className="stat-card">
              <div className="text-immortal-secondary">五运六气</div>
              <div className="text-lg">{celestialData.wuYunLiuQi.mainQi.name}</div>
            </div>
            <div className="stat-card">
              <div className="text-immortal-secondary">子午流注</div>
              <div className="text-lg">{celestialData.ziWuLiuZhu.meridian}</div>
            </div>
          </div>
          
          {/* 加成显示 */}
          <div className="mt-4 stat-card border-immortal-primary/30">
            <div className="flex justify-between items-center">
              <span className="text-immortal-secondary">今日修炼加成</span>
              <span className="text-2xl font-bold text-immortal-primary">
                {((celestialData.bonus.total - 1) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* 灵根信息 */}
      {bazi?.spiritualRoot && (
        <div className="panel">
          <h3 className="text-lg font-bold mb-2">灵根: {bazi.spiritualRoot.name}</h3>
          <p className="text-sm text-immortal-secondary">{bazi.spiritualRoot.description}</p>
          <div className="mt-2 text-sm">
            修炼加成: <span className="text-immortal-primary font-bold">{bazi.spiritualRoot.bonus}x</span>
          </div>
        </div>
      )}
    </div>
  );
};
