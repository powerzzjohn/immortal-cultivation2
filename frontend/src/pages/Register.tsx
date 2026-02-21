import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';

export const Register: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { setAuth, auth } = useAppStore();
  
  useEffect(() => {
    if (auth.token) {
      navigate('/');
    }
  }, [auth.token, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('两次密码不一致');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAuth({ token: data.token, user: data.user });
        alert(`注册成功！你的道号是：${data.user.daoName}`);
        navigate('/bazi-setup');
      } else {
        alert(data.error || '注册失败');
      }
    } catch (error) {
      alert('网络错误');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-immortal-bg">
      <div className="panel w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🦐</span>
          <h1 className="text-2xl font-bold text-gradient mt-2">凡人修仙</h1>
          <p className="text-immortal-secondary mt-2">开启你的修仙之旅</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-immortal-secondary mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-immortal-secondary/30 
                         text-immortal-text focus:outline-none focus:border-immortal-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-immortal-secondary mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-immortal-secondary/30 
                         text-immortal-text focus:outline-none focus:border-immortal-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-immortal-secondary mb-1">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-immortal-secondary/30 
                         text-immortal-text focus:outline-none focus:border-immortal-primary"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-immortal-primary text-immortal-bg font-bold
                       hover:bg-amber-400 transition-colors"
          >
            注册
          </button>
        </form>
        
        <p className="text-center mt-4 text-immortal-secondary">
          已有账号？
          <button
            onClick={() => navigate('/login')}
            className="text-immortal-primary ml-1 hover:underline"
          >
            立即登录
          </button>
        </p>
      </div>
    </div>
  );
};
