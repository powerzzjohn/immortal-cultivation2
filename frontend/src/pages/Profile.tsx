import { FC, useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';

export const Profile: FC = () => {
  const { auth, bazi } = useAppStore();
  const [cultivation, setCultivation] = useState<any>(null);
  // const [resources, setResources] = useState<any>(null);
  
  useEffect(() => {
    fetchProfileData();
  }, []);
  
  const fetchProfileData = async () => {
    try {
      // 获取修炼数据
      const cultRes = await fetch('/api/cultivation/status', {
        headers: { 'Authorization': `Bearer ${auth.token}` },
      });
      if (cultRes.ok) {
        const data = await cultRes.json();
        setCultivation(data.cultivation);
      }
      
      // TODO: 获取资源数据
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gradient">个人中心</h2>
      
      {/* 用户信息 */}
      <div className="panel">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-immortal-primary/20 flex items-center justify-center text-3xl">
            🦐
          </div>
          <div>
            <h3 className="text-xl font-bold">{auth.user?.daoName}</h3>
            <p className="text-immortal-secondary text-sm">{auth.user?.email}</p>
          </div>
        </div>
      </div>
      
      {/* 八字信息 */}
      {bazi && (
        <div className="panel">
          <h3 className="text-lg font-bold mb-4">八字命格</h3>
          
          <div className="grid grid-cols-4 gap-2 text-center mb-4">
            <div className="stat-card">
              <div className="text-xs text-immortal-secondary">年柱</div>
              <div className="text-lg font-bold">{bazi.yearPillar.stem}{bazi.yearPillar.branch}</div>
              <div className="text-xs text-immortal-secondary">{bazi.yearPillar.element}</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-immortal-secondary">月柱</div>
              <div className="text-lg font-bold">{bazi.monthPillar.stem}{bazi.monthPillar.branch}</div>
              <div className="text-xs text-immortal-secondary">{bazi.monthPillar.element}</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-immortal-secondary">日柱</div>
              <div className="text-lg font-bold">{bazi.dayPillar.stem}{bazi.dayPillar.branch}</div>
              <div className="text-xs text-immortal-secondary">{bazi.dayPillar.element}</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-immortal-secondary">时柱</div>
              <div className="text-lg font-bold">{bazi.hourPillar.stem}{bazi.hourPillar.branch}</div>
              <div className="text-xs text-immortal-secondary">{bazi.hourPillar.element}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="text-sm text-immortal-secondary mb-2">灵根</div>
            <div className="text-xl font-bold text-immortal-primary">{bazi.spiritualRoot.name}</div>
            <p className="text-sm text-immortal-secondary mt-1">{bazi.spiritualRoot.description}</p>
            <div className="mt-2 text-sm">
              修炼加成: <span className="text-immortal-primary font-bold">{bazi.spiritualRoot.bonus}x</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm text-immortal-secondary mb-2">五行分布</div>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="stat-card">
                <div className="text-immortal-metal">金</div>
                <div className="text-xl font-bold">{bazi.elementStats.金}</div>
              </div>
              <div className="stat-card">
                <div className="text-immortal-wood">木</div>
                <div className="text-xl font-bold">{bazi.elementStats.木}</div>
              </div>
              <div className="stat-card">
                <div className="text-immortal-water">水</div>
                <div className="text-xl font-bold">{bazi.elementStats.水}</div>
              </div>
              <div className="stat-card">
                <div className="text-immortal-fire">火</div>
                <div className="text-xl font-bold">{bazi.elementStats.火}</div>
              </div>
              <div className="stat-card">
                <div className="text-immortal-earth">土</div>
                <div className="text-xl font-bold">{bazi.elementStats.土}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 修炼统计 */}
      {cultivation && (
        <div className="panel">
          <h3 className="text-lg font-bold mb-4">修炼统计</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="text-immortal-secondary text-sm">当前境界</div>
              <div className="text-2xl font-bold text-immortal-primary">{cultivation.realmName}</div>
            </div>
            <div className="stat-card">
              <div className="text-immortal-secondary text-sm">当前经验</div>
              <div className="text-2xl font-bold">{cultivation.currentExp}</div>
            </div>
            <div className="stat-card">
              <div className="text-immortal-secondary text-sm">累计经验</div>
              <div className="text-2xl font-bold">{cultivation.totalExp}</div>
            </div>
            <div className="stat-card">
              <div className="text-immortal-secondary text-sm">修炼天数</div>
              <div className="text-2xl font-bold">{cultivation.totalDays}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
