import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('buildai_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      if (userData.user_type === 'admin') setCurrentView('admin-dashboard');
      else if (userData.user_type === 'contractor') setCurrentView('contractor-dashboard');
      else setCurrentView('user-dashboard');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('buildai_user', JSON.stringify(userData));
    setUser(userData);
    if (userData.user_type === 'admin') setCurrentView('admin-dashboard');
    else if (userData.user_type === 'contractor') setCurrentView('contractor-dashboard');
    else setCurrentView('user-dashboard');
  };

  const logout = () => {
    localStorage.removeItem('buildai_user');
    setUser(null);
    setCurrentView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

    if (user) {
    if (currentView === 'admin-dashboard') return <AdminDashboard user={user} logout={logout} />;
    if (currentView === 'contractor-dashboard') return <ContractorDashboard user={user} logout={logout} setCurrentView={setCurrentView} />;
    if (currentView === 'user-dashboard') return <UserDashboard user={user} logout={logout} setCurrentView={setCurrentView} refreshKey={currentView} />;
    if (currentView === 'planner') return <PlannerView user={user} logout={logout} setCurrentView={setCurrentView} />;
    if (currentView === 'marketplace') return <ContractorMarketplace user={user} setCurrentView={setCurrentView} />;
  }

  if (currentView === 'login') return <LoginPage onLogin={handleLogin} setCurrentView={setCurrentView} />;
  if (currentView === 'register') return <RegisterPage setCurrentView={setCurrentView} />;

  return <LandingPage setCurrentView={setCurrentView} />;
}

function LandingPage({ setCurrentView }) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="glass-card border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center">
              <span className="text-xl">🏗️</span>
            </div>
            <span className="text-xl font-black gradient-text">BuildAI</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCurrentView('login')} className="px-4 py-2 text-slate-300 hover:text-white">Login</button>
            <button onClick={() => setCurrentView('register')} className="px-4 py-2 bg-gradient-to-r from-sky-500 to-fuchsia-500 rounded-lg font-medium">Sign Up</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black mb-4">
            <span className="gradient-text">Construction Planning</span>
            <br />Made Simple
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            AI-powered construction planning, contractor marketplace, and real-time project tracking all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setCurrentView('register')} className="px-8 py-4 bg-gradient-to-r from-sky-500 to-fuchsia-500 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-sky-500/25 transition-all">
              Get Started Free
            </button>
            <button onClick={() => setCurrentView('login')} className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg transition-all">
              Login
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: '📊', title: 'AI Cost Prediction', desc: 'Get accurate cost estimates based on area, location, and materials' },
            { icon: '👷', title: 'Contractor Marketplace', desc: 'Find verified contractors, compare bids, and hire the best' },
            { icon: '📈', title: 'Real-time Tracking', desc: 'Track progress, manage teams, and monitor budgets live' }
          ].map((feature, i) => (
            <div key={i} className="glass-card rounded-2xl p-8 text-center hover:border-sky-500/50 transition-all">
              <span className="text-5xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Choose Your Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={() => setCurrentView('register')} className="p-6 rounded-xl border-2 border-slate-600 hover:border-sky-500 transition-all text-center group">
              <span className="text-5xl mb-3 block">🏠</span>
              <h3 className="text-lg font-bold mb-1">Homeowner</h3>
              <p className="text-sm text-slate-400 mb-3">Plan and manage your construction project</p>
              <span className="text-sky-400 text-sm group-hover:underline">Register as User →</span>
            </button>
            <button onClick={() => setCurrentView('register')} className="p-6 rounded-xl border-2 border-slate-600 hover:border-purple-500 transition-all text-center group">
              <span className="text-5xl mb-3 block">👷</span>
              <h3 className="text-lg font-bold mb-1">Contractor</h3>
              <p className="text-sm text-slate-400 mb-3">Find projects and submit bids</p>
              <span className="text-purple-400 text-sm group-hover:underline">Register as Contractor →</span>
            </button>
            <button onClick={() => setCurrentView('login')} className="p-6 rounded-xl border-2 border-slate-600 hover:border-yellow-500 transition-all text-center group">
              <span className="text-5xl mb-3 block">⚙️</span>
              <h3 className="text-lg font-bold mb-1">Administrator</h3>
              <p className="text-sm text-slate-400 mb-3">Manage users and oversee platform</p>
              <span className="text-yellow-400 text-sm group-hover:underline">Admin Login →</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoginPage({ onLogin, setCurrentView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoading(false);
      setError('Cannot connect to server. Make sure backend is running on port 5000.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md">
        <button onClick={() => setCurrentView('landing')} className="text-slate-400 hover:text-white mb-4">← Back</button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏗️</span>
          </div>
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-slate-400 mt-1">Login to your BuildAI account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-sky-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-sky-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-fuchsia-500 rounded-xl font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-sky-500/25 transition-all">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          <p>Don't have an account? <button onClick={() => setCurrentView('register')} className="text-sky-400 hover:underline">Register</button></p>
          <p className="mt-3 p-3 bg-slate-800/50 rounded-lg">Admin: admin@buildai.com / admin123</p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ setCurrentView }) {
  const [userType, setUserType] = useState('user');
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', location: '', experience: 5, hourly_rate: 500, specializations: [], bio: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const specializations = [
    { id: 'structural', name: 'Structural Engineering' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'finishing', name: 'Finishing & Interiors' },
    { id: 'roofing', name: 'Roofing' },
    { id: 'landscaping', name: 'Landscaping' },
    { id: 'painting', name: 'Painting' },
    { id: 'flooring', name: 'Flooring' }
  ];

  const toggleSpec = (specId) => {
    setForm(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specId)
        ? prev.specializations.filter(s => s !== specId)
        : [...prev.specializations, specId]
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, user_type: userType })
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setCurrentView('login'), 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setLoading(false);
      setError('Cannot connect to server. Make sure backend is running on port 5000.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">Registration Successful!</h2>
          <p className="text-slate-400 mb-4">Redirecting to login page...</p>
          <div className="animate-pulse text-slate-500">Please wait...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button onClick={() => setCurrentView('landing')} className="text-slate-400 hover:text-white mb-4">← Back</button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-slate-400 mt-1">Join BuildAI today</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { value: 'user', label: 'User', icon: '🏠', desc: 'Plan projects' },
            { value: 'contractor', label: 'Contractor', icon: '👷', desc: 'Find work' }
          ].map(type => (
            <button key={type.value} onClick={() => setUserType(type.value)}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${userType === type.value ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
              <span className="text-2xl">{type.icon}</span>
              <div className="text-sm font-medium mt-1">{type.label}</div>
              <div className="text-xs text-slate-400">{type.desc}</div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Full Name *</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Phone *</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required minLength={6}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
          </div>

          {userType === 'contractor' && (
            <>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
                  placeholder="City, State" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Experience (years)</label>
                  <input type="number" value={form.experience} onChange={(e) => setForm({...form, experience: parseInt(e.target.value)})}
                    min="0" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Hourly Rate (₹)</label>
                  <input type="number" value={form.hourly_rate} onChange={(e) => setForm({...form, hourly_rate: parseInt(e.target.value)})}
                    min="0" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {specializations.map(spec => (
                    <button type="button" key={spec.id} onClick={() => toggleSpec(spec.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${form.specializations.includes(spec.id) ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                      {spec.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} rows={3}
                  placeholder="Tell clients about your experience..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-fuchsia-500 rounded-xl font-bold disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-400">
          Already have an account? <button onClick={() => setCurrentView('login')} className="text-sky-400 hover:underline">Login</button>
        </div>
      </div>
    </div>
  );
}

function UserDashboard({ user, logout, setCurrentView, refreshKey }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [architectForm, setArchitectForm] = useState({
    plotLength: '', plotBreadth: '', description: '', floors: 1, parking: true, garden: false,
    bedrooms: 2, bathrooms: 2, kitchen: 1, hall: 1
  });
  const [architectResult, setArchitectResult] = useState(null);
  const [generatingLayout, setGeneratingLayout] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', location: '', area: '', budget: '', materialQuality: 'standard',
    constructionType: 'contractor', parking: false, garden: false, smartHome: false,
    startDate: '', deadline: ''
  });
  const [issueForm, setIssueForm] = useState({ type: 'general', severity: 'medium', description: '' });
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectReports, setProjectReports] = useState([]);
  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch projects when component mounts or refreshKey changes
  useEffect(() => {
    setActiveTab('overview');
    setSelectedProjectId(null);
    fetchUserProjects();
    fetchNotifications();
  }, [user.id, refreshKey]);

  // Refresh projects when tab changes to projects
  useEffect(() => {
    if (activeTab === 'projects') {
      fetchUserProjects();
    }
  }, [activeTab, user.id]);

  // Fetch reports when selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectReports(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchUserProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/contractors/user-projects/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects || []);
        // Select first project if none selected
        if (data.projects?.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data.projects[0].project_id);
        }
      }
    } catch (err) { 
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchProjectReports = async (projectId) => {
    try {
      const response = await fetch(`${API_URL}/contractors/project-reports/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setProjectReports(data.reports || []);
      }
    } catch (err) { 
      console.error('Failed to fetch reports:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/notifications`, {
        headers: { 'X-User-ID': user.id }
      });
      const data = await response.json();
      if (data.success) setNotifications(data.notifications || []);
    } catch (err) { console.error('Failed to fetch notifications'); }
  };

  const handleAcceptBid = async (bidId, projectId) => {
    try {
      const response = await fetch(`${API_URL}/contractors/bids/${bidId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        alert('Bid accepted successfully!');
        fetchUserProjects();
      }
    } catch (err) { alert('Failed to accept bid'); }
  };

  const handleRejectBid = async (bidId) => {
    try {
      const response = await fetch(`${API_URL}/contractors/bids/${bidId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        alert('Bid rejected');
        fetchUserProjects();
      }
    } catch (err) { alert('Failed to reject bid'); }
  };

  const handleAcceptCounterOffer = async (bidId) => {
    if (!confirm('Accept this counter-offer? The contractor will be automatically confirmed and the project will start immediately.')) return;
    try {
      const response = await fetch(`${API_URL}/contractors/accept-counter-offer/${bidId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        alert('🎉 Counter-offer accepted! Project has started.');
        fetchUserProjects();
        fetchNotifications();
      }
    } catch (err) { alert('Failed to accept counter-offer'); }
  };

  const handleStartProject = async (projectId) => {
    if (!confirm('Are you sure you want to start this project?')) return;
    try {
      const response = await fetch(`${API_URL}/start-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId })
      });
      const data = await response.json();
      if (data.success) {
        alert('Project started successfully!');
        fetchUserProjects();
      }
    } catch (err) { alert('Failed to start project'); }
  };

  const handleCompleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to mark this project as completed?')) return;
    try {
      const response = await fetch(`${API_URL}/complete-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId })
      });
      const data = await response.json();
      if (data.success) {
        alert('🎉 Congratulations! Project marked as completed!');
        fetchUserProjects();
      }
    } catch (err) { alert('Failed to complete project'); }
  };

  const handleUncompleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to reopen this project? It will be marked as in progress again.')) return;
    try {
      const response = await fetch(`${API_URL}/uncomplete-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId })
      });
      const data = await response.json();
      if (data.success) {
        alert('Project reopened and marked as in progress.');
        fetchUserProjects();
      }
    } catch (err) { alert('Failed to reopen project'); }
  };

  const openEditModal = () => {
    if (!selectedProject) return;
    setEditForm({
      name: selectedProject.name || '',
      location: selectedProject.location || '',
      area: selectedProject.area || '',
      budget: selectedProject.budget || '',
      materialQuality: selectedProject.material_quality || 'standard',
      constructionType: selectedProject.construction_type || 'contractor',
      parking: Boolean(selectedProject.parking),
      garden: Boolean(selectedProject.garden),
      smartHome: Boolean(selectedProject.smart_home),
      startDate: selectedProject.start_date || '',
      deadline: selectedProject.deadline || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/update-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProjectId,
          ...editForm
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Project updated successfully!');
        setShowEditModal(false);
        fetchUserProjects();
      }
    } catch (err) { alert('Failed to update project'); }
    setLoading(false);
  };

  const reportIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    const projectId = selectedProjectId || projects[0]?.project_id || 'PRJ-DEFAULT';
    try {
      const response = await fetch(`${API_URL}/tracking/issues/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          user_id: user.id,
          type: issueForm.type,
          description: issueForm.description,
          severity: issueForm.severity
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowIssueModal(false);
        setIssueForm({ type: 'general', severity: 'medium', description: '' });
        alert('Issue reported successfully!');
      }
    } catch (err) { alert('Failed to report issue'); }
    setLoading(false);
  };

  const generateArchitectLayout = async (e) => {
    e.preventDefault();
    setGeneratingLayout(true);
    setArchitectResult(null);
    
    try {
      const response = await fetch(`${API_URL}/architect/generate-layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_length: parseFloat(architectForm.plotLength),
          plot_breadth: parseFloat(architectForm.plotBreadth),
          description: architectForm.description,
          floors: parseInt(architectForm.floors),
          parking: architectForm.parking,
          garden: architectForm.garden,
          rooms: {
            bedrooms: parseInt(architectForm.bedrooms),
            bathrooms: parseInt(architectForm.bathrooms),
            kitchen: parseInt(architectForm.kitchen),
            hall: parseInt(architectForm.hall)
          }
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setArchitectResult(data.layout);
      } else {
        alert('Failed to generate layout: ' + (data.message || 'Please try again'));
      }
    } catch (err) { 
      console.error('Error:', err);
      alert('Failed to connect to server');
    }
    setGeneratingLayout(false);
  };

  const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

  const selectedProject = projects.find(p => p.project_id === selectedProjectId);
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const pendingBids = projects.reduce((acc, p) => acc + p.bids.filter(b => b.status === 'pending').length, 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'projects', label: 'My Projects', icon: '📋' },
    { id: 'architect', label: 'Design', icon: '🏠' },
    { id: 'track', label: 'Track Progress', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="glass-card border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center">
              <span className="text-xl">🏗️</span>
            </div>
            <span className="text-xl font-black gradient-text">BuildAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Welcome, {user.full_name}</span>
            <button onClick={logout} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <button onClick={() => setShowIssueModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg flex items-center gap-2 text-sm">
            <span>🚨</span> Report Issue
          </button>
        </div>

        <div className="flex gap-2 mb-8 border-b border-slate-700">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'text-sky-400 border-b-2 border-sky-400' 
                  : 'text-slate-400 hover:text-white'
              }`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{notifications.filter(n => !n.is_read).length}</div>
                <div className="text-sm text-slate-400">New Notifications</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{activeProjects}</div>
                <div className="text-sm text-slate-400">Active Projects</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">{pendingBids}</div>
                <div className="text-sm text-slate-400">Pending Bids</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">{projects.length}</div>
                <div className="text-sm text-slate-400">Total Projects</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>🔔</span> Recent Notifications
                </h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No notifications</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className={`p-3 rounded-lg ${n.is_read ? 'bg-slate-800/50' : 'bg-sky-500/10 border border-sky-500/30'}`}>
                        <div className="font-medium text-sm">{n.title}</div>
                        <div className="text-xs text-slate-400">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>📋</span> Recent Projects
                </h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {projects.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No projects yet</p>
                  ) : (
                    projects.slice(0, 5).map((proj) => (
                      <div key={proj.id} className="p-3 rounded-lg bg-slate-800/50">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm">{proj.name}</div>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            proj.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            proj.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {proj.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{proj.location || 'No location'} • {proj.bids?.length || 0} bids</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => setCurrentView('planner')} className="glass-card rounded-2xl p-6 text-left hover:border-sky-500/50 transition-all group">
                <span className="text-4xl mb-3 block">📐</span>
                <h3 className="text-xl font-bold mb-2">New Project</h3>
                <p className="text-slate-400 text-sm">Create a construction plan with AI cost estimation</p>
                <span className="text-sky-400 text-sm mt-3 block group-hover:underline">Start Planning →</span>
              </button>

              <button onClick={() => setCurrentView('marketplace')} className="glass-card rounded-2xl p-6 text-left hover:border-purple-500/50 transition-all group">
                <span className="text-4xl mb-3 block">👷</span>
                <h3 className="text-xl font-bold mb-2">Contractor Marketplace</h3>
                <p className="text-slate-400 text-sm">Browse contractors and submit project bids</p>
                <span className="text-purple-400 text-sm mt-3 block group-hover:underline">Browse Now →</span>
              </button>

              <button onClick={() => setActiveTab('projects')} className="glass-card rounded-2xl p-6 text-left hover:border-green-500/50 transition-all group">
                <span className="text-4xl mb-3 block">📊</span>
                <h3 className="text-xl font-bold mb-2">Manage Projects</h3>
                <p className="text-slate-400 text-sm">View all projects and manage bids</p>
                <span className="text-green-400 text-sm mt-3 block group-hover:underline">View All →</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">My Projects</h2>
              <button onClick={() => setCurrentView('planner')} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-sm">
                + New Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <span className="text-6xl mb-4 block">📋</span>
                <h3 className="text-xl font-bold mb-2">No Projects Yet</h3>
                <p className="text-slate-400 mb-4">Create your first project to start getting bids from contractors</p>
                <button onClick={() => setCurrentView('planner')} className="px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-xl font-semibold">
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  {projects.map(proj => (
                    <button key={proj.id} onClick={() => setSelectedProjectId(proj.project_id)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        selectedProjectId === proj.project_id 
                          ? 'bg-sky-500/20 border-2 border-sky-500' 
                          : 'bg-slate-800/50 border-2 border-transparent hover:border-slate-600'
                      }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{proj.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          proj.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          proj.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{proj.location || 'No location'}</div>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="text-sky-400">{proj.bids?.length || 0} bids</span>
                        <span>{proj.bids?.filter(b => b.status === 'accepted').length > 0 ? '✓ Hired' : 'Open'}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-2">
                  {selectedProject ? (
                    <div className="glass-card rounded-xl p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-bold">{selectedProject.name}</h3>
                          <p className="text-slate-400">{selectedProject.location || 'No location'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={openEditModal} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
                            ✏️ Edit
                          </button>
                          {selectedProject.status === 'in_progress' && (
                            <button onClick={() => handleCompleteProject(selectedProject.project_id)} 
                              className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-sm">
                              ✅ Complete
                            </button>
                          )}
                          {selectedProject.status === 'completed' && (
                            <button onClick={() => handleUncompleteProject(selectedProject.project_id)} 
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm">
                              ↩️ Mark Incomplete
                            </button>
                          )}
                          <span className={`px-3 py-1 rounded-lg text-sm ${
                            selectedProject.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            selectedProject.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            selectedProject.status === 'awaiting_confirmation' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {selectedProject.status === 'awaiting_confirmation' ? 'Waiting Confirmation' : selectedProject.status}
                          </span>
                        </div>
                      </div>

                      {selectedProject.status === 'completed' && (
                        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🎉</span>
                            <div>
                              <div className="font-bold text-green-400">Project Completed!</div>
                              <p className="text-sm text-slate-400">This project has been marked as completed. If you need to make changes, you can reopen it.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedProject.status === 'awaiting_confirmation' && (
                        <div className="mb-4 p-4 bg-orange-500/20 border border-orange-500/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">⏳</span>
                            <div>
                              <div className="font-bold text-orange-400">Awaiting Contractor Confirmation</div>
                              <p className="text-sm text-slate-400">The selected contractor needs to confirm the project assignment. You will be notified once they respond.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-green-400">{formatCurrency(selectedProject.total_cost)}</div>
                          <div className="text-xs text-slate-400">AI Estimate</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-400">{formatCurrency(selectedProject.budget)}</div>
                          <div className="text-xs text-slate-400">Your Budget</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-blue-400">{selectedProject.timeline_days || 0}</div>
                          <div className="text-xs text-slate-400">Days</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-purple-400">{selectedProject.bids?.length || 0}</div>
                          <div className="text-xs text-slate-400">Bids</div>
                        </div>
                      </div>

                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>📨</span> Bids Received ({selectedProject.bids?.filter(b => b.status === 'pending').length || 0} pending)
                      </h4>
                      
                      {selectedProject.bids?.length === 0 && (
                        <div className="text-center py-8 bg-slate-800/30 rounded-xl">
                          <span className="text-4xl mb-3 block">👷</span>
                          <p className="text-slate-400 mb-3">No bids received yet</p>
                          {selectedProject.status === 'planning' && (
                            <button onClick={() => setCurrentView('marketplace')} 
                              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium">
                              👷 Find Contractors
                            </button>
                          )}
                        </div>
                      )}
                      
                      {selectedProject.bids?.length > 0 && (
                        <div className="space-y-4">
                          {selectedProject.bids.map(bid => (
                            <div key={bid.id} className={`p-4 rounded-xl border-2 ${
                              bid.status === 'accepted' ? 'border-green-500 bg-green-500/10' :
                              bid.status === 'rejected' ? 'border-red-500/50 bg-red-500/5 opacity-50' :
                              'border-slate-600 bg-slate-800/50'
                            }`}>
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="font-bold">{bid.contractor_name || 'Contractor'}</div>
                                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                                    {bid.rating && <span>⭐ {bid.rating.toFixed(1)}</span>}
                                    {bid.experience && <span>• {bid.experience} years exp</span>}
                                  </div>
                                  {bid.specializations?.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                      {bid.specializations.slice(0, 3).map((spec, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 bg-slate-700 rounded">{spec}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-green-400">{formatCurrency(bid.amount)}</div>
                                  {bid.timeline_days > 0 && (
                                    <div className="text-xs text-slate-400">{bid.timeline_days} days</div>
                                  )}
                                </div>
                              </div>
                              
                              {bid.proposal && (
                                <div className="text-sm text-slate-300 mb-3 p-2 bg-slate-800/50 rounded">
                                  {bid.proposal}
                                </div>
                              )}

                              {bid.status === 'pending' && (
                                <div className="mt-3">
                                  <div className="text-sm text-slate-400 mb-3">
                                    Accept this bid to hire this contractor, or reject to look for other options.
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => handleAcceptBid(bid.id, selectedProject.project_id)}
                                      className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium text-sm">
                                      ✓ Accept Bid
                                    </button>
                                    <button onClick={() => handleRejectBid(bid.id)}
                                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
                                      ✗ Reject
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {bid.status === 'accepted' && (
                                <div className="mt-3 p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xl font-bold">
                                      {bid.contractor_name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                      <div className="font-bold text-green-400">{bid.contractor_name}</div>
                                      <div className="flex items-center gap-2 text-sm text-slate-400">
                                        {bid.rating && <span>⭐ {bid.rating.toFixed(1)}</span>}
                                        {bid.experience && <span>• {bid.experience} years</span>}
                                      </div>
                                    </div>
                                  </div>
                                  {bid.specializations?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {bid.specializations.slice(0, 4).map((spec, i) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-slate-700 rounded">{spec}</span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="text-green-400 font-medium text-sm">✓ This bid has been accepted</div>
                                  <div className="text-xs text-slate-400 mt-1">
                                    Waiting for contractor confirmation to start the project
                                  </div>
                                </div>
                              )}
                              
                              {bid.status === 'rejected' && (
                                <div className="text-red-400 text-sm">Rejected</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Project Reports Section */}
                      {selectedProject?.status === 'in_progress' && (
                        <div className="mt-6 pt-6 border-t border-slate-700">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold flex items-center gap-2">
                              <span>📋</span> Contractor Reports ({projectReports.length})
                            </h4>
                            <button onClick={() => setCurrentView('marketplace')} 
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm flex items-center gap-1">
                              👷 Find Contractor
                            </button>
                          </div>
                          
                          {projectReports.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 bg-slate-800/30 rounded-xl">
                              <p>No reports from contractor yet</p>
                              <p className="text-xs mt-1">Contractor will submit progress reports here</p>
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                              {projectReports.map((report, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border-l-4 ${
                                  report.report_type === 'milestone' ? 'border-green-500 bg-green-500/10' :
                                  report.report_type === 'issue' ? 'border-red-500 bg-red-500/10' :
                                  'border-blue-500 bg-blue-500/10'
                                }`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded text-xs ${
                                        report.report_type === 'milestone' ? 'bg-green-500/30 text-green-400' :
                                        report.report_type === 'issue' ? 'bg-red-500/30 text-red-400' :
                                        'bg-blue-500/30 text-blue-400'
                                      }`}>
                                        {report.report_type?.replace('_', ' ')}
                                      </span>
                                      {report.progress > 0 && (
                                        <span className="text-xs text-slate-400">Progress: {report.progress}%</span>
                                      )}
                                    </div>
                                    <span className="text-xs text-slate-400">
                                      {new Date(report.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-300">{report.description}</p>
                                  <div className="text-xs text-slate-500 mt-2">By: {report.contractor_name}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="glass-card rounded-xl p-12 text-center text-slate-400">
                      Select a project to view details and bids
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'architect' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">AI Architectural Designer</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>🏗️</span> Enter Plot Details
                </h3>
                <form onSubmit={generateArchitectLayout} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Plot Length (ft)</label>
                      <input type="number" value={architectForm.plotLength} onChange={(e) => setArchitectForm({...architectForm, plotLength: e.target.value})}
                        required placeholder="e.g., 40" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Plot Breadth (ft)</label>
                      <input type="number" value={architectForm.plotBreadth} onChange={(e) => setArchitectForm({...architectForm, plotBreadth: e.target.value})}
                        required placeholder="e.g., 30" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Floors</label>
                      <input type="number" min="1" max="5" value={architectForm.floors} onChange={(e) => setArchitectForm({...architectForm, floors: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Bedrooms</label>
                      <input type="number" min="1" max="10" value={architectForm.bedrooms} onChange={(e) => setArchitectForm({...architectForm, bedrooms: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Bathrooms</label>
                      <input type="number" min="1" max="10" value={architectForm.bathrooms} onChange={(e) => setArchitectForm({...architectForm, bathrooms: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Kitchen</label>
                      <input type="number" min="1" max="5" value={architectForm.kitchen} onChange={(e) => setArchitectForm({...architectForm, kitchen: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Hall/Living</label>
                      <input type="number" min="1" max="5" value={architectForm.hall} onChange={(e) => setArchitectForm({...architectForm, hall: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={architectForm.parking} onChange={(e) => setArchitectForm({...architectForm, parking: e.target.checked})}
                        className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-sky-500" />
                      <span>Include Car Parking Area</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={architectForm.garden} onChange={(e) => setArchitectForm({...architectForm, garden: e.target.checked})}
                        className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-sky-500" />
                      <span>Include Garden/Landscaping</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Additional Requirements (Optional)</label>
                    <textarea value={architectForm.description} onChange={(e) => setArchitectForm({...architectForm, description: e.target.value})}
                      rows={3} placeholder="Describe your requirements, style preferences, special features..."
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none" />
                  </div>

                  <button type="submit" disabled={generatingLayout}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2">
                    {generatingLayout ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Generating Layout...
                      </>
                    ) : (
                      <>
                        <span>🎨</span> Generate Architectural Layout
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>📐</span> Generated Layout
                </h3>
                {architectResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                      <div className="flex items-center gap-2 text-green-400 font-medium">
                        <span>✅</span> Layout Generated Successfully
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400">Plot Area</div>
                        <div className="font-bold text-lg">{architectResult.plot_details?.area || 0} sq ft</div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400">Built-up Area</div>
                        <div className="font-bold text-lg">{architectResult.stats?.built_up_area || 0} sq ft</div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400">Carpet Area</div>
                        <div className="font-bold text-lg">{architectResult.stats?.carpet_area || 0} sq ft</div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400">Floors</div>
                        <div className="font-bold text-lg">{architectResult.plot_details?.floors || 1}</div>
                      </div>
                    </div>

                    {architectResult.layout && (
                      <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-xs text-sky-400 whitespace-pre-wrap font-mono">
                          {architectResult.layout}
                        </pre>
                      </div>
                    )}

                    {architectResult.description && (
                      <div className="bg-slate-800/50 p-4 rounded-xl">
                        <div className="font-medium mb-2">AI Description:</div>
                        <p className="text-sm text-slate-300">{architectResult.description}</p>
                      </div>
                    )}
                    
                    {architectResult.image_base64 && (
                      <div className="bg-white rounded-xl p-4">
                        <div className="font-medium mb-2 text-slate-300">Floor Plan Image:</div>
                        <img 
                          src={`data:image/png;base64,${architectResult.image_base64}`} 
                          alt="Floor Plan" 
                          className="w-full rounded-lg"
                        />
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:image/png;base64,${architectResult.image_base64}`;
                            link.download = 'floorplan.png';
                            link.click();
                          }}
                          className="mt-3 w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium"
                        >
                          Download Floor Plan
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-6xl mb-4">📐</span>
                    <p className="text-slate-400">Enter your plot details and click<br />"Generate Architectural Layout"<br />to see the AI-designed floor plan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'track' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Track Progress</h2>
            
            {selectedProject ? (
              <div className="space-y-6">
                {selectedProject.status !== 'completed' && selectedProject.status !== 'in_progress' && (
                  <div className="glass-card rounded-xl p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">👷</span>
                        <div>
                          <h3 className="text-xl font-bold">Find a Contractor</h3>
                          <p className="text-slate-400">Browse contractors and get bids for your project</p>
                        </div>
                      </div>
                      <button onClick={() => setCurrentView('marketplace')} 
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold">
                        👷 Browse Contractors
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Project Phases & Progress</h3>
                    
                    {selectedProject.status === 'in_progress' ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-sky-500 to-fuchsia-500 rounded-full w-2/3"></div>
                          </div>
                          <div className="flex justify-between mt-2 text-sm text-slate-400">
                            <span>Started</span>
                            <span>In Progress</span>
                            <span>Deadline</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-6">
                          {[
                            { phase: 'Foundation', status: 'completed', icon: '🏗️' },
                            { phase: 'Structure', status: 'completed', icon: '🧱' },
                            { phase: 'Electrical', status: 'in_progress', icon: '💡' },
                            { phase: 'Finishing', status: 'pending', icon: '🎨' }
                          ].map((phase, i) => (
                            <div key={i} className={`p-4 rounded-xl text-center ${
                              phase.status === 'completed' ? 'bg-green-500/20 border-2 border-green-500/50' :
                              phase.status === 'in_progress' ? 'bg-sky-500/20 border-2 border-sky-500/50' :
                              'bg-slate-800/50 border-2 border-transparent'
                            }`}>
                              <span className="text-2xl">{phase.icon}</span>
                              <div className="font-medium mt-2">{phase.phase}</div>
                              <div className={`text-xs mt-1 ${
                                phase.status === 'completed' ? 'text-green-400' :
                                phase.status === 'in_progress' ? 'text-sky-400' :
                                'text-slate-400'
                              }`}>
                                {phase.status === 'completed' ? '✓ Done' : 
                                 phase.status === 'in_progress' ? '⟳ In Progress' : '○ Pending'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <span className="text-5xl mb-4 block">📊</span>
                        <p>Track progress once a contractor accepts a bid and starts working</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="glass-card rounded-xl p-4">
                      <h4 className="font-bold mb-3">Project Stats</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Budget</span>
                          <span className="text-green-400">{formatCurrency(selectedProject.budget)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Timeline</span>
                          <span className="text-blue-400">{selectedProject.timeline_days || 0} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Area</span>
                          <span>{selectedProject.area || 0} sq ft</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Quality</span>
                          <span className="capitalize">{selectedProject.material_quality || 'Standard'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                      <h4 className="font-bold mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <button onClick={() => setShowIssueModal(true)}
                          className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-sm text-left px-3">
                          🚨 Report Issue
                        </button>
                        {selectedProject.status !== 'in_progress' && (
                          <button onClick={() => setCurrentView('marketplace')}
                            className="w-full py-2 bg-purple-600/50 hover:bg-purple-600 rounded-lg text-sm text-left px-3">
                            👷 Find Contractor
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Reports Section */}
                {selectedProject.status === 'in_progress' && (
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span>📅</span> Weekly Reports & Progress Updates
                    </h3>
                    
                    {projectReports.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 bg-slate-800/30 rounded-xl">
                        <span className="text-4xl mb-3 block">📋</span>
                        <p>No reports from contractor yet</p>
                        <p className="text-xs mt-1">Contractor will submit weekly/daily reports here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Group reports by date/week */}
                        {(() => {
                          const groupedReports = {};
                          projectReports.forEach(report => {
                            const date = new Date(report.created_at);
                            const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate()) / 7)}`;
                            const dateKey = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                            const key = `${dateKey}`;
                            if (!groupedReports[key]) {
                              groupedReports[key] = [];
                            }
                            groupedReports[key].push(report);
                          });
                          
                          return Object.entries(groupedReports).map(([date, reports]) => (
                            <div key={date} className="border border-slate-700 rounded-xl overflow-hidden">
                              <div className="bg-slate-800/50 px-4 py-2 font-bold text-slate-300 flex items-center gap-2">
                                <span>📅</span> {date}
                              </div>
                              <div className="p-4 space-y-3">
                                {reports.map((report, idx) => (
                                  <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                                    report.report_type === 'phase' ? 'border-green-500 bg-green-500/10' :
                                    report.report_type === 'issue' ? 'border-red-500 bg-red-500/10' :
                                    report.report_type === 'weekly' ? 'border-blue-500 bg-blue-500/10' :
                                    'border-purple-500 bg-purple-500/10'
                                  }`}>
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                          report.report_type === 'phase' ? 'bg-green-500/30 text-green-400' :
                                          report.report_type === 'issue' ? 'bg-red-500/30 text-red-400' :
                                          report.report_type === 'weekly' ? 'bg-blue-500/30 text-blue-400' :
                                          'bg-purple-500/30 text-purple-400'
                                        }`}>
                                          {report.report_type === 'phase' ? '🏗️ Phase' :
                                           report.report_type === 'issue' ? '⚠️ Issue' :
                                           report.report_type === 'weekly' ? '📅 Weekly' :
                                           report.report_type === 'daily' ? '📊 Daily' : '📋 Report'}
                                        </span>
                                        {report.progress > 0 && (
                                          <span className="text-xs text-slate-400">Progress: {report.progress}%</span>
                                        )}
                                      </div>
                                      <span className="text-xs text-slate-500">
                                        {new Date(report.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-300">{report.description}</p>
                                    <div className="text-xs text-slate-500 mt-2">By: {report.contractor_name}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-12 text-center">
                <span className="text-6xl mb-4 block">📈</span>
                <h3 className="text-xl font-bold mb-2">No Active Project</h3>
                <p className="text-slate-400 mb-4">Accept a bid to start tracking your project progress</p>
                <button onClick={() => setActiveTab('projects')} className="px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-xl font-semibold">
                  View My Projects
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {showIssueModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><span>🚨</span> Report Issue</h2>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={reportIssue} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Issue Type</label>
                <select value={issueForm.type} onChange={(e) => setIssueForm({...issueForm, type: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white">
                  <option value="general">General Issue</option>
                  <option value="safety">Safety Hazard</option>
                  <option value="delay">Project Delay</option>
                  <option value="quality">Quality Issue</option>
                  <option value="material">Material Shortage</option>
                  <option value="worker">Worker Issue</option>
                  <option value="payment">Payment Issue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Severity</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(sev => (
                    <button type="button" key={sev} onClick={() => setIssueForm({...issueForm, severity: sev})}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all ${
                        issueForm.severity === sev ? (
                          sev === 'high' ? 'border-red-500 bg-red-500/20 text-red-400' :
                          sev === 'medium' ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400' :
                          'border-blue-500 bg-blue-500/20 text-blue-400'
                        ) : 'border-slate-600 text-slate-400'
                      }`}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea value={issueForm.description} onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                  required rows={4} placeholder="Describe the issue in detail..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><span>✏️</span> Edit Project</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Project Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Location</label>
                <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Area (sq ft)</label>
                  <input type="number" value={editForm.area} onChange={(e) => setEditForm({...editForm, area: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Budget (₹)</label>
                  <input type="number" value={editForm.budget} onChange={(e) => setEditForm({...editForm, budget: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Construction Type</label>
                <select value={editForm.constructionType} onChange={(e) => setEditForm({...editForm, constructionType: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white">
                  <option value="contractor">Full Contractor</option>
                  <option value="self">Self Construction</option>
                  <option value="hybrid">Hybrid (Material + Labor)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Material Quality</label>
                <select value={editForm.materialQuality} onChange={(e) => setEditForm({...editForm, materialQuality: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white">
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <label className="block text-sm text-slate-400 mb-3">Add-ons</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={editForm.parking} onChange={(e) => setEditForm({...editForm, parking: e.target.checked})}
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600" />
                    <span>🅿️ Parking Space</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={editForm.garden} onChange={(e) => setEditForm({...editForm, garden: e.target.checked})}
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600" />
                    <span>🌳 Garden/Landscaping</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={editForm.smartHome} onChange={(e) => setEditForm({...editForm, smartHome: e.target.checked})}
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600" />
                    <span>🏠 Smart Home Features</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                  <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Deadline</label>
                  <input type="date" value={editForm.deadline} onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 rounded-xl font-semibold disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PlannerView({ user, logout, setCurrentView }) {
  const TOTAL_STEPS = 7;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '', location: '', projectType: '', area: '', rooms: '', floors: '1',
    budget: '', startDate: '', deadline: '', materialQuality: 'standard',
    constructionType: 'contractor', parking: false, garden: false, smartHome: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/create-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user.id
        })
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.analysis);
        // Store project_id for reference
        if (data.project_id) {
          localStorage.setItem('last_created_project', data.project_id);
          alert(`Project saved successfully!\nProject ID: ${data.project_id}`);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed. Make sure backend is running.');
    }
    setLoading(false);
  };

  const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  const steps = ['Basic Details', 'Project Size', 'Budget & Timeline', 'Material Quality', 'Construction Model', 'Add-ons', 'Review & Submit'];

  if (results) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white">
        <header className="glass-card border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center">
                <span className="text-xl">🏗️</span>
              </div>
              <span className="text-xl font-bold gradient-text">BuildAI</span>
            </div>
            <button onClick={() => setCurrentView('user-dashboard')} className="px-4 py-2 bg-slate-700 rounded-lg">Back to Dashboard</button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-8">Project Analysis: {formData.projectName || 'Your Project'}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-sm text-slate-400">Estimated Cost</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(results.cost.totalCost)}</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-sm text-slate-400">Timeline</div>
              <div className="text-2xl font-bold text-blue-400">{results.timeline.totalDays} Days</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">👷</div>
              <div className="text-sm text-slate-400">Workers Needed</div>
              <div className="text-2xl font-bold text-yellow-400">{results.timeline.workersNeeded}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Cost Breakdown</h3>
              {Object.entries(results.cost.breakdown).map(([key, value]) => (
                <div key={key} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-slate-400">{key}</span>
                    <span>{formatCurrency(value)}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-fuchsia-500 rounded-full" style={{ width: `${(value / results.cost.totalCost) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Construction Phases</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.timeline.phases.map((phase, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center font-bold">{i + 1}</div>
                    <div className="flex-1">
                      <div className="font-medium">{phase.name}</div>
                      <div className="text-xs text-slate-400">Day {phase.startDay} - {phase.endDay}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sky-400">{formatCurrency(phase.cost)}</div>
                      <div className="text-xs text-slate-400">{phase.duration} days</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <button onClick={() => setCurrentView('user-dashboard')} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold">
              ✓ View My Projects
            </button>
            <button onClick={() => setCurrentView('marketplace')} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold">
              Find Contractors
            </button>
            <button onClick={() => setResults(null)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold">
              Create Another
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="glass-card border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center">
              <span className="text-xl">🏗️</span>
            </div>
            <span className="text-xl font-bold gradient-text">BuildAI</span>
          </div>
          <button onClick={() => setCurrentView('user-dashboard')} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">Back to Dashboard</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex gap-2 mb-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full ${i < currentStep ? 'bg-gradient-to-r from-sky-500 to-fuchsia-500' : 'bg-slate-700'}`} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            {steps.map((step, i) => (
              <span key={i} className={i + 1 === currentStep ? 'text-sky-400 font-medium' : ''}>{step}</span>
            ))}
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">{error}</div>}

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">{steps[currentStep - 1]}</h2>

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Project Name</label>
                <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} placeholder="My Dream Home"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City or GPS location"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Project Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['House', 'Building', 'Apartment', 'Commercial'].map(type => (
                    <button key={type} onClick={() => setFormData(prev => ({ ...prev, projectType: type }))}
                      className={`p-4 rounded-xl border-2 ${formData.projectType === type ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Total Area (sq ft)</label>
                <input type="number" name="area" value={formData.area} onChange={handleChange} placeholder="e.g., 2000"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Number of Rooms</label>
                  <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} placeholder="e.g., 4"
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Number of Floors</label>
                  <input type="number" name="floors" value={formData.floors} onChange={handleChange} min="1"
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Budget (₹)</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="e.g., 5000000"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Deadline</label>
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-3">
              {[{ value: 'basic', label: 'Basic', desc: 'Budget-friendly', price: '₹850/sq ft' },
                { value: 'standard', label: 'Standard', desc: 'Good quality balance', price: '₹1,250/sq ft' },
                { value: 'premium', label: 'Premium', desc: 'Luxury finish', price: '₹1,900/sq ft' }
              ].map(option => (
                <button key={option.value} onClick={() => setFormData(prev => ({ ...prev, materialQuality: option.value }))}
                  className={`w-full p-4 rounded-xl border-2 text-left ${formData.materialQuality === option.value ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600'}`}>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.desc}</div>
                    </div>
                    <div className="text-sky-400 font-medium">{option.price}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-3">
              {[{ value: 'client', label: 'Client Provides', icon: '👤', desc: 'You buy materials' },
                { value: 'contractor', label: 'Contractor Provides', icon: '👷', desc: 'Contractor handles everything' },
                { value: 'hybrid', label: 'Hybrid Model', icon: '🔄', desc: 'Shared responsibility' }
              ].map(option => (
                <button key={option.value} onClick={() => setFormData(prev => ({ ...prev, constructionType: option.value }))}
                  className={`w-full p-4 rounded-xl border-2 text-left ${formData.constructionType === option.value ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-3">
              {[{ name: 'parking', label: 'Parking Space', icon: '🅿️' },
                { name: 'garden', label: 'Garden', icon: '🌳' },
                { name: 'smartHome', label: 'Smart Home', icon: '🏠' }
              ].map(option => (
                <label key={option.name} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer ${formData[option.name] ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600'}`}>
                  <input type="checkbox" name={option.name} checked={formData[option.name]} onChange={handleChange} className="w-5 h-5" />
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4">
              <p className="text-slate-400">Review your project details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 p-4 rounded-xl"><div className="text-xs text-slate-400">Project Name</div><div className="font-medium">{formData.projectName || 'Not specified'}</div></div>
                <div className="bg-slate-800/50 p-4 rounded-xl"><div className="text-xs text-slate-400">Location</div><div className="font-medium">{formData.location || 'Not specified'}</div></div>
                <div className="bg-slate-800/50 p-4 rounded-xl"><div className="text-xs text-slate-400">Area</div><div className="font-medium">{formData.area ? `${formData.area} sq ft` : 'Not specified'}</div></div>
                <div className="bg-slate-800/50 p-4 rounded-xl"><div className="text-xs text-slate-400">Budget</div><div className="font-medium">{formData.budget ? `₹${parseInt(formData.budget).toLocaleString()}` : 'Not specified'}</div></div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium ${currentStep === 1 ? 'text-slate-600' : 'hover:text-white hover:bg-slate-700'}`}>
              ← Previous
            </button>
            {currentStep < TOTAL_STEPS ? (
              <button onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-fuchsia-500">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 disabled:opacity-50">
                {loading ? 'Analyzing...' : 'Submit Project ✓'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ContractorMarketplace({ user, setCurrentView }) {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [bidForm, setBidForm] = useState({ amount: '', timeline_days: '', proposal: '' });
  const [filters, setFilters] = useState({ specialization: '', location: '' });

  useEffect(() => { fetchContractors(); }, [filters]);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.location) params.append('location', filters.location);
      const response = await fetch(`${API_URL}/contractors/list?${params}`);
      const data = await response.json();
      if (data.success) setContractors(data.contractors);
    } catch (err) { console.error('Failed to fetch contractors'); }
    setLoading(false);
  };

  const submitBid = async () => {
    if (!selectedContractor || !bidForm.amount) return;
    try {
      const response = await fetch(`${API_URL}/contractors/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'PROJ-' + Date.now(),
          contractor_id: selectedContractor.user_id,
          amount: parseFloat(bidForm.amount),
          timeline_days: parseInt(bidForm.timeline_days) || 0,
          proposal: bidForm.proposal
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Bid submitted successfully!');
        setShowBidModal(false);
        setBidForm({ amount: '', timeline_days: '', proposal: '' });
      }
    } catch (err) { alert('Failed to submit bid'); }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="glass-card border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xl">👷</span>
            </div>
            <span className="text-xl font-bold">Contractor Marketplace</span>
          </div>
          <button onClick={() => setCurrentView('user-dashboard')} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">Back to Dashboard</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Find Contractors</h1>
        <p className="text-slate-400 mb-8">Browse verified contractors for your project</p>

        <div className="glass-card rounded-xl p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Specialization</label>
              <select value={filters.specialization} onChange={(e) => setFilters({...filters, specialization: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white">
                <option value="">All Specializations</option>
                <option value="structural">Structural Engineering</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="finishing">Finishing & Interiors</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Location</label>
              <input type="text" value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})}
                placeholder="City name" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
            </div>
            <div className="flex items-end">
              <button onClick={fetchContractors} className="w-full py-3 bg-sky-600 hover:bg-sky-500 rounded-xl font-medium">
                Search Contractors
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading contractors...</p>
          </div>
        ) : contractors.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold mb-2">No contractors found</h3>
            <p className="text-slate-400">Try adjusting your filters or register as a contractor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contractors.map((c) => (
              <div key={c.id} className="glass-card rounded-2xl p-6 hover:border-purple-500/50 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{c.name}</h3>
                    <p className="text-slate-400 text-sm">{c.location || 'Location not specified'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-medium">{c.rating?.toFixed(1) || 4.5}</span>
                      <span className="text-slate-500 text-sm">({c.projects_completed || 0} projects)</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {c.specialization?.map((spec, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">{spec}</span>
                  ))}
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experience</span>
                    <span>{c.experience || 5} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hourly Rate</span>
                    <span className="text-green-400 font-medium">₹{c.hourly_rate || 500}/hr</span>
                  </div>
                </div>
                <button onClick={() => { setSelectedContractor(c); setShowBidModal(true); }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium">
                  Submit Bid Request
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showBidModal && selectedContractor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Submit Bid Request</h2>
              <button onClick={() => setShowBidModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                  {selectedContractor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold">{selectedContractor.name}</h3>
                  <p className="text-slate-400 text-sm">★ {selectedContractor.rating?.toFixed(1) || 4.5}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Your Budget (₹) *</label>
                <input type="number" value={bidForm.amount} onChange={(e) => setBidForm({...bidForm, amount: e.target.value})} required
                  placeholder="Enter your budget" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Timeline (days)</label>
                <input type="number" value={bidForm.timeline_days} onChange={(e) => setBidForm({...bidForm, timeline_days: e.target.value})}
                  placeholder="Expected completion time" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Project Details</label>
                <textarea value={bidForm.proposal} onChange={(e) => setBidForm({...bidForm, proposal: e.target.value})} rows={4}
                  placeholder="Describe your project requirements..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none" />
              </div>
              <button onClick={submitBid} className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold">
                Submit Bid Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContractorDashboard({ user, logout, setCurrentView }) {
  const [myBids, setMyBids] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [pendingConfirmations, setPendingConfirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showModifyBidModal, setShowModifyBidModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);
  const [reportForm, setReportForm] = useState({ report_type: 'progress', description: '', progress: 50 });
  const [modifyBidForm, setModifyBidForm] = useState({ amount: '', timeline_days: '', proposal: '' });
  const [issueForm, setIssueForm] = useState({ type: 'general', severity: 'medium', description: '' });
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { 
    fetchMyBids(); 
    fetchMyProjects();
    fetchNotifications();
    fetchPendingConfirmations();
  }, []);

  const fetchMyBids = async () => {
    try {
      const response = await fetch(`${API_URL}/contractors/my-bids/${user.id}`);
      const data = await response.json();
      if (data.success) setMyBids(data.bids);
    } catch (err) { console.error('Failed to fetch bids'); }
    setLoading(false);
  };

  const fetchMyProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/contractors/contractor-projects/${user.id}`);
      const data = await response.json();
      if (data.success) setMyProjects(data.projects || []);
    } catch (err) { console.error('Failed to fetch projects'); }
  };

  const fetchPendingConfirmations = async () => {
    try {
      const response = await fetch(`${API_URL}/contractors/pending-confirmations/${user.id}`);
      const data = await response.json();
      if (data.success) setPendingConfirmations(data.projects || []);
    } catch (err) { console.error('Failed to fetch pending confirmations'); }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/notifications`, {
        headers: { 'X-User-ID': user.id }
      });
      const data = await response.json();
      if (data.success) setNotifications(data.notifications || []);
    } catch (err) { console.error('Failed to fetch notifications'); }
  };

  const openReportModal = (project) => {
    setSelectedProject(project);
    setReportForm({ report_type: 'progress', description: '', progress: 50 });
    setShowReportModal(true);
  };

  const handleConfirmProject = async (projectId) => {
    if (!confirm('Are you sure you want to confirm this project? Once confirmed, you will be responsible for completing it.')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contractors/confirm-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          contractor_id: user.id
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Project confirmed! You can now start working on it.');
        fetchMyProjects();
        fetchMyBids();
        fetchNotifications();
        fetchPendingConfirmations();
      }
    } catch (err) { alert('Failed to confirm project'); }
    setLoading(false);
  };

  const handleRejectProject = async (projectId) => {
    if (!confirm('Are you sure you want to reject this project?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contractors/reject-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          contractor_id: user.id
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Project rejected.');
        fetchMyProjects();
        fetchMyBids();
        fetchPendingConfirmations();
      }
    } catch (err) { alert('Failed to reject project'); }
    setLoading(false);
  };

  const handleAcceptPendingBid = async (bidId, projectId) => {
    if (!confirm('Accept this bid? You will be assigned to this project and need to confirm it.')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contractors/bids/${bidId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        alert('Bid accepted! Project assigned to you.');
        fetchMyBids();
        fetchMyProjects();
      }
    } catch (err) { alert('Failed to accept bid'); }
    setLoading(false);
  };

  const handleRejectPendingBid = async (bidId) => {
    if (!confirm('Are you sure you want to reject this bid?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contractors/bids/${bidId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        alert('Bid rejected.');
        fetchMyBids();
      }
    } catch (err) { alert('Failed to reject bid'); }
    setLoading(false);
  };

  const openModifyBidModal = (bid) => {
    setSelectedBid(bid);
    setModifyBidForm({
      amount: bid.amount?.toString() || '',
      timeline_days: bid.timeline_days?.toString() || '',
      proposal: bid.proposal || '',
      isPending: bid.status === 'pending'
    });
    setShowModifyBidModal(true);
  };

  const handleModifyBid = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contractors/update-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bid_id: selectedBid?.id,
          amount: parseFloat(modifyBidForm.amount),
          timeline_days: parseInt(modifyBidForm.timeline_days),
          proposal: modifyBidForm.proposal,
          counter_offer: modifyBidForm.isPending
        })
      });
      const data = await response.json();
      if (data.success) {
        if (data.counter_offer) {
          alert('Counter-offer sent to user! They will review and accept it.');
        } else {
          alert('Bid updated successfully!');
        }
        setShowModifyBidModal(false);
        fetchMyBids();
      }
    } catch (err) { alert('Failed to update bid'); }
    setLoading(false);
  };

  const handleModifyAndAccept = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contractors/update-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bid_id: selectedBid?.id,
          amount: parseFloat(modifyBidForm.amount),
          timeline_days: parseInt(modifyBidForm.timeline_days),
          proposal: modifyBidForm.proposal
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowModifyBidModal(false);
        handleAcceptPendingBid(selectedBid?.id, selectedBid?.project_id);
      }
    } catch (err) { alert('Failed to update bid'); }
    setLoading(false);
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contractors/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProject.project_id,
          contractor_id: user.id,
          report_type: reportForm.report_type,
          description: reportForm.description,
          progress: reportForm.progress
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Report submitted successfully!');
        setShowReportModal(false);
        fetchMyProjects();
      }
    } catch (err) { alert('Failed to submit report'); }
    setLoading(false);
  };

  const reportIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tracking/issues/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'PRJ-DEFAULT',
          user_id: user.id,
          type: issueForm.type,
          description: issueForm.description,
          severity: issueForm.severity
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowIssueModal(false);
        setIssueForm({ type: 'general', severity: 'medium', description: '' });
        alert('Issue reported successfully!');
      }
    } catch (err) { alert('Failed to report issue'); }
    setLoading(false);
  };

  const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

  const acceptedBids = myBids.filter(b => b.status === 'accepted');
  const pendingBids = myBids.filter(b => b.status === 'pending');
  const rejectedBids = myBids.filter(b => b.status === 'rejected');
  const totalEarnings = acceptedBids.reduce((sum, b) => sum + (b.amount || 0), 0);
  const profileCompleteness = [
    user.full_name, user.email, user.phone,
    user.contractor?.location, user.contractor?.experience,
    user.contractor?.specializations?.length > 0
  ].filter(Boolean).length;
  const profilePercent = Math.round((profileCompleteness / 7) * 100);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="glass-card border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold">
              {user.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.full_name}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <span className="text-yellow-400">★</span> {user.contractor?.rating?.toFixed(1) || 4.5} Rating
                <span className="text-slate-500">•</span>
                <span className={user.contractor?.verified ? 'text-green-400' : 'text-yellow-400'}>
                  {user.contractor?.verified ? '✓ Verified' : '⏳ Pending Verification'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowIssueModal(true)} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg flex items-center gap-2 border border-red-500/30">
              <span>🚨</span> Report Issue
            </button>
            <button onClick={logout} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'confirmations', label: 'Confirmations', icon: '✅' },
            { id: 'bids', label: 'My Bids', icon: '📋' },
            { id: 'projects', label: 'Projects', icon: '🏗️' },
            { id: 'profile', label: 'Profile', icon: '👤' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="glass-card rounded-xl p-4 border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">💰</div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{formatCurrency(totalEarnings)}</div>
                    <div className="text-xs text-slate-400">Total Earnings</div>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 border-l-4 border-blue-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">📋</div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{myBids.length}</div>
                    <div className="text-xs text-slate-400">Total Bids</div>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 border-l-4 border-purple-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">✅</div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{acceptedBids.length}</div>
                    <div className="text-xs text-slate-400">Won Bids</div>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 border-l-4 border-yellow-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">⏳</div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{pendingBids.length}</div>
                    <div className="text-xs text-slate-400">Pending</div>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 border-l-4 border-sky-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">🏗️</div>
                  <div>
                    <div className="text-2xl font-bold text-sky-400">{user.contractor?.projects_completed || 0}</div>
                    <div className="text-xs text-slate-400">Completed</div>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 border-l-4 border-orange-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">📈</div>
                  <div>
                    <div className="text-2xl font-bold text-orange-400">{myBids.length > 0 ? Math.round((acceptedBids.length / myBids.length) * 100) : 0}%</div>
                    <div className="text-xs text-slate-400">Win Rate</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>📊</span> Bid Statistics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-400">Won Bids</span>
                      <span>{acceptedBids.length}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${myBids.length > 0 ? (acceptedBids.length / myBids.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-yellow-400">Pending</span>
                      <span>{pendingBids.length}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: `${myBids.length > 0 ? (pendingBids.length / myBids.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400">Lost</span>
                      <span>{rejectedBids.length}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${myBids.length > 0 ? (rejectedBids.length / myBids.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>👤</span> Profile Completion
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Complete your profile to get more bids</span>
                    <span className="text-purple-400 font-bold">{profilePercent}%</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${profilePercent}%` }} />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Profile Photo', done: true },
                    { label: 'Contact Info', done: user.phone },
                    { label: 'Location', done: user.contractor?.location },
                    { label: 'Specializations', done: user.contractor?.specializations?.length > 0 },
                    { label: 'Experience', done: user.contractor?.experience > 0 },
                    { label: 'Portfolio', done: false },
                    { label: 'License/Certification', done: false }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={item.done ? 'text-green-400' : 'text-slate-500'}>{item.done ? '✓' : '○'}</span>
                      <span className={item.done ? 'text-white' : 'text-slate-400'}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>🔔</span> Recent Notifications
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No new notifications</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className={`p-3 rounded-lg ${n.is_read ? 'bg-slate-800/50' : 'bg-purple-500/10 border border-purple-500/30'}`}>
                        <div className="font-medium text-sm">{n.title}</div>
                        <div className="text-xs text-slate-400 mt-1">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>🎯</span> Specializations & Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(user.contractor?.specializations || ['structural', 'finishing']).map((spec, i) => (
                  <span key={i} className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
                    {spec}
                  </span>
                ))}
                <span className="px-4 py-2 bg-slate-800 text-slate-400 rounded-full text-sm">+ Add Skill</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => setShowIssueModal(true)} className="glass-card rounded-xl p-6 text-left hover:border-red-500/50 transition-all group">
                <span className="text-4xl mb-3 block">🚨</span>
                <h3 className="text-lg font-bold mb-1">Report Issue</h3>
                <p className="text-sm text-slate-400">Report a problem with your work</p>
                <span className="text-red-400 text-sm mt-2 block group-hover:underline">Report Now →</span>
              </button>
              <button className="glass-card rounded-xl p-6 text-left hover:border-blue-500/50 transition-all group">
                <span className="text-4xl mb-3 block">📊</span>
                <h3 className="text-lg font-bold mb-1">Performance Report</h3>
                <p className="text-sm text-slate-400">View detailed analytics</p>
                <span className="text-blue-400 text-sm mt-2 block group-hover:underline">View Report →</span>
              </button>
              <button className="glass-card rounded-xl p-6 text-left hover:border-green-500/50 transition-all group">
                <span className="text-4xl mb-3 block">💰</span>
                <h3 className="text-lg font-bold mb-1">Earnings Summary</h3>
                <p className="text-sm text-slate-400">Track your income and payments</p>
                <span className="text-green-400 text-sm mt-2 block group-hover:underline">View Summary →</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'confirmations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Project Confirmations</h2>
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⏳</span>
                <div>
                  <h3 className="text-lg font-bold">Pending Confirmations ({pendingConfirmations.length})</h3>
                  <p className="text-sm text-slate-400">Review and confirm projects assigned to you</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {pendingConfirmations.map((project) => (
                  <div key={project.id} className="p-4 bg-slate-800/50 rounded-xl border-l-4 border-orange-500">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{project.project_name}</h4>
                        <p className="text-sm text-slate-400">📍 {project.location || 'Location not specified'}</p>
                        <div className="flex gap-4 mt-2">
                          <p className="text-sm text-green-400 font-medium">💰 Contract Value: {formatCurrency(project.bid_amount || project.amount)}</p>
                          <p className="text-sm text-blue-400">📅 Timeline: {project.timeline_days || 0} days</p>
                          <p className="text-sm text-purple-400">📐 Area: {project.area || 0} sq ft</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <p className="text-sm text-slate-400">👤 Owner: {project.owner_name}</p>
                          <p className="text-sm text-slate-500">📧 {project.owner_email}</p>
                          {project.owner_phone && <p className="text-sm text-slate-500">📱 {project.owner_phone}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleConfirmProject(project.project_id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium text-sm">
                          ✓ Confirm Project
                        </button>
                        <button 
                          onClick={() => handleRejectProject(project.project_id)}
                          className="px-4 py-2 bg-red-600/50 hover:bg-red-600 rounded-lg text-sm">
                          ✗ Decline
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-orange-400 bg-orange-500/10 px-3 py-2 rounded-lg">
                      ⚠️ You must confirm before the project can start
                    </p>
                  </div>
                ))}
                {pendingConfirmations.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <span className="text-5xl mb-4 block">✅</span>
                    <p>No pending confirmations</p>
                    <p className="text-sm">Win bids to get project assignments</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bids' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Bids ({myBids.length})</h2>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">✓ Won: {acceptedBids.length}</span>
                <span className="text-yellow-400">⏳ Pending: {pendingBids.length}</span>
                <span className="text-red-400">✗ Lost: {rejectedBids.length}</span>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-20 text-slate-400">Loading bids...</div>
            ) : myBids.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <span className="text-6xl mb-4 block">📋</span>
                <h3 className="text-xl font-bold mb-2">No bids submitted yet</h3>
                <p className="text-slate-400">Start bidding on projects to grow your business</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBids.map((bid) => (
                  <div key={bid.id} className={`glass-card rounded-xl p-5 border-l-4 ${
                    bid.status === 'accepted' ? 'border-green-500' :
                    bid.status === 'rejected' ? 'border-red-500' : 'border-yellow-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{bid.project_id}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            bid.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                            bid.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {bid.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex gap-6 text-sm text-slate-400">
                          <span>📅 Timeline: {bid.timeline_days || '-'} days</span>
                          <span>📍 Location: Mumbai</span>
                          <span>📅 Submitted: {new Date(bid.created_at).toLocaleDateString()}</span>
                        </div>
                        {bid.proposal && (
                          <p className="mt-2 text-sm text-slate-300">{bid.proposal}</p>
                        )}
                        
                        {bid.status === 'pending' && (
                          <div className="mt-4">
                            <div className="text-sm text-slate-400 mb-3">
                              ✏️ Edit your bid and send counter-offer to user, OR accept the project directly
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openModifyBidModal(bid)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-sm">
                                ✏️ Send Counter-Offer
                              </button>
                              <button 
                                onClick={() => handleAcceptPendingBid(bid.id, bid.project_id)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium text-sm">
                                ✓ Accept & Move to Confirmations
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {bid.status === 'accepted' && (
                          <div className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <div className="text-sm text-green-400 font-medium mb-2">
                              ✓ Bid Accepted! Go to "Confirmations" tab to confirm the project.
                            </div>
                            <button 
                              onClick={() => openModifyBidModal(bid)}
                              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm">
                              ✏️ Modify Bid
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-400">{formatCurrency(bid.amount)}</div>
                        <div className="text-sm text-slate-400">Bid Amount</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Projects ({myProjects.length})</h2>
            {myProjects.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <span className="text-6xl mb-4 block">🏗️</span>
                <h3 className="text-xl font-bold mb-2">No active projects</h3>
                <p className="text-slate-400">Win bids to see your projects here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProjects.map((proj) => (
                  <div key={proj.id} className="glass-card rounded-xl p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{proj.project_name || proj.project_id}</h3>
                        <p className="text-slate-400 text-sm">Owner: {proj.owner_name}</p>
                        <p className="text-slate-400 text-sm">{proj.location}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        proj.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        proj.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="text-green-400">
                          {proj.status === 'completed' ? '100%' : proj.status === 'in_progress' ? 'In Progress' : '0%'}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${
                          proj.status === 'completed' ? 'bg-green-500 w-full' :
                          proj.status === 'in_progress' ? 'bg-blue-500 w-1/2' :
                          'bg-yellow-500 w-0'
                        }`} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-slate-400">Contract</div>
                        <div className="font-medium text-green-400">{formatCurrency(proj.amount)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Timeline</div>
                        <div className="font-medium">{proj.timeline_days || '-'} days</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Area</div>
                        <div className="font-medium">-</div>
                      </div>
                    </div>
                    {proj.status !== 'completed' && (
                      <button 
                        onClick={() => openReportModal(proj)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                        📝 Submit Report
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold mb-6">Business Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
                    {user.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{user.full_name}</h4>
                    <p className="text-slate-400">{user.email}</p>
                    <p className="text-slate-400">{user.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="text-slate-400 text-sm">Location</div>
                    <div className="font-medium">{user.contractor?.location || 'Not set'}</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="text-slate-400 text-sm">Experience</div>
                    <div className="font-medium">{user.contractor?.experience || 0} years</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="text-slate-400 text-sm">Hourly Rate</div>
                    <div className="font-medium text-green-400">₹{user.contractor?.hourly_rate || 0}/hr</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="text-slate-400 text-sm">Projects Completed</div>
                    <div className="font-medium">{user.contractor?.projects_completed || 0}</div>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-2">Specializations</div>
                  <div className="flex flex-wrap gap-2">
                    {(user.contractor?.specializations || ['structural', 'finishing']).map((spec, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">{spec}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold mb-6">Performance Stats</h3>
              <div className="space-y-6">
                <div className="text-center p-6 bg-slate-800/50 rounded-xl">
                  <div className="text-5xl font-bold text-yellow-400 mb-2">★ {user.contractor?.rating?.toFixed(1) || 4.5}</div>
                  <div className="text-slate-400">Overall Rating</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                    <div className="text-3xl font-bold text-green-400">{myBids.length > 0 ? Math.round((acceptedBids.length / myBids.length) * 100) : 0}%</div>
                    <div className="text-sm text-slate-400">Win Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                    <div className="text-3xl font-bold text-purple-400">{formatCurrency(totalEarnings)}</div>
                    <div className="text-sm text-slate-400">Total Earned</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span>Response Rate</span>
                    <span className="text-green-400">98%</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span>On-time Delivery</span>
                    <span className="text-green-400">92%</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span>Client Satisfaction</span>
                    <span className="text-yellow-400">4.8/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showIssueModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><span>🚨</span> Report Issue</h2>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={reportIssue} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Issue Type</label>
                <select value={issueForm.type} onChange={(e) => setIssueForm({...issueForm, type: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white">
                  <option value="general">General Issue</option>
                  <option value="safety">Safety Hazard</option>
                  <option value="delay">Project Delay</option>
                  <option value="quality">Quality Issue</option>
                  <option value="material">Material Shortage</option>
                  <option value="worker">Worker Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="client">Client Issue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Severity</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(sev => (
                    <button type="button" key={sev} onClick={() => setIssueForm({...issueForm, severity: sev})}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all ${
                        issueForm.severity === sev ? (
                          sev === 'high' ? 'border-red-500 bg-red-500/20 text-red-400' :
                          sev === 'medium' ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400' :
                          'border-blue-500 bg-blue-500/20 text-blue-400'
                        ) : 'border-slate-600 text-slate-400'
                      }`}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea value={issueForm.description} onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                  required rows={4} placeholder="Describe the issue in detail..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Submit Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><span>📝</span> Submit Project Report</h2>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="mb-4 p-3 bg-slate-800/50 rounded-xl">
              <div className="font-medium">{selectedProject?.project_name || selectedProject?.project_id}</div>
              <div className="text-sm text-slate-400">Owner: {selectedProject?.owner_name}</div>
            </div>
            <form onSubmit={submitReport} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Report Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setReportForm({...reportForm, report_type: 'weekly'})}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      reportForm.report_type === 'weekly' ? 'border-purple-500 bg-purple-500/20' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                    <span className="text-lg">📅</span>
                    <div className="font-medium text-sm">Weekly Update</div>
                    <div className="text-xs text-slate-400">Regular progress report</div>
                  </button>
                  <button type="button" onClick={() => setReportForm({...reportForm, report_type: 'phase'})}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      reportForm.report_type === 'phase' ? 'border-purple-500 bg-purple-500/20' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                    <span className="text-lg">🏗️</span>
                    <div className="font-medium text-sm">Phase Complete</div>
                    <div className="text-xs text-slate-400">Milestone/Phase done</div>
                  </button>
                  <button type="button" onClick={() => setReportForm({...reportForm, report_type: 'issue'})}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      reportForm.report_type === 'issue' ? 'border-red-500 bg-red-500/20' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                    <span className="text-lg">⚠️</span>
                    <div className="font-medium text-sm">Issue Alert</div>
                    <div className="text-xs text-slate-400">Problem/risk report</div>
                  </button>
                  <button type="button" onClick={() => setReportForm({...reportForm, report_type: 'daily'})}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      reportForm.report_type === 'daily' ? 'border-purple-500 bg-purple-500/20' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                    <span className="text-lg">📊</span>
                    <div className="font-medium text-sm">Daily Log</div>
                    <div className="text-xs text-slate-400">Daily work summary</div>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Overall Progress ({reportForm.progress}%)</label>
                <input type="range" min="0" max="100" value={reportForm.progress} 
                  onChange={(e) => setReportForm({...reportForm, progress: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Report Description</label>
                <textarea value={reportForm.description} onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  required rows={5} placeholder={
                    reportForm.report_type === 'weekly' ? 'Describe this week\'s progress, work completed, materials used...' :
                    reportForm.report_type === 'phase' ? 'Which phase is completed? What was accomplished? Next steps...' :
                    reportForm.report_type === 'daily' ? 'What work was done today? Workers present, materials used...' :
                    'Describe the issue or risk encountered...'
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modify Bid Modal */}
      {showModifyBidModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><span>✏️</span> Modify Bid</h2>
              <button onClick={() => setShowModifyBidModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            {modifyBidForm.isPending ? (
              <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl">
                <p className="text-sm text-blue-400">
                  📝 Edit your bid details below. You can then choose to accept or reject the project.
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/50 rounded-xl">
                <p className="text-sm text-orange-400">
                  ⚠️ You can modify your bid before confirming the project. Changes will be visible to the user.
                </p>
              </div>
            )}
            <form onSubmit={modifyBidForm.isPending ? handleModifyBid : handleModifyBid} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Bid Amount (₹)</label>
                <input type="number" value={modifyBidForm.amount} onChange={(e) => setModifyBidForm({...modifyBidForm, amount: e.target.value})}
                  required className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Timeline (days)</label>
                <input type="number" value={modifyBidForm.timeline_days} onChange={(e) => setModifyBidForm({...modifyBidForm, timeline_days: e.target.value})}
                  required className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Proposal / Notes</label>
                <textarea value={modifyBidForm.proposal} onChange={(e) => setModifyBidForm({...modifyBidForm, proposal: e.target.value})}
                  rows={4} placeholder="Update your proposal, notes, or conditions..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModifyBidModal(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold">
                  Cancel
                </button>
                {modifyBidForm.isPending ? (
                  <button type="button" onClick={handleModifyAndAccept} disabled={loading}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold disabled:opacity-50">
                    {loading ? 'Updating...' : '✓ Edit & Accept'}
                  </button>
                ) : (
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-semibold disabled:opacity-50">
                    {loading ? 'Updating...' : 'Update Bid'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ user, logout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAllData(); }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/dashboard`);
      const data = await response.json();
      if (data.success) setStats(data);
    } catch (err) { console.error('Failed to fetch stats'); }

    if (activeTab === 'users' || activeTab === 'contractors') {
      try {
        const response = await fetch(`${API_URL}/admin/all-users-full${activeTab === 'contractors' ? '?type=contractor' : ''}`);
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
          setContractors(data.users.filter(u => u.user_type === 'contractor'));
        }
      } catch (err) { console.error('Failed to fetch users'); }
    }

    if (activeTab === 'issues') {
      try {
        const response = await fetch(`${API_URL}/admin/all-issues`);
        const data = await response.json();
        if (data.success) setIssues(data.issues || []);
      } catch (err) { console.error('Failed to fetch issues'); }
    }

    if (activeTab === 'projects') {
      try {
        const response = await fetch(`${API_URL}/admin/projects`);
        const data = await response.json();
        if (data.success) setProjects(data.projects || []);
      } catch (err) { console.error('Failed to fetch projects'); }
    }

    if (activeTab === 'bids') {
      try {
        const response = await fetch(`${API_URL}/admin/all-bids`);
        const data = await response.json();
        if (data.success) setBids(data.bids || []);
      } catch (err) { console.error('Failed to fetch bids'); }
    }

    setLoading(false);
  };

  const toggleUserStatus = async (userId) => {
    try {
      await fetch(`${API_URL}/admin/users/${userId}/toggle-status`, { method: 'POST' });
      fetchAllData();
    } catch (err) { console.error('Failed to toggle status'); }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`${API_URL}/admin/users/${userId}/delete`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) { console.error('Failed to delete user'); }
  };

  const verifyContractor = async (contractorId) => {
    try {
      await fetch(`${API_URL}/admin/contractors/verify/${contractorId}`, { method: 'POST' });
      fetchAllData();
    } catch (err) { console.error('Failed to verify contractor'); }
  };

  const resolveIssue = async (issueId) => {
    try {
      await fetch(`${API_URL}/admin/issues/${issueId}/resolve`, { method: 'POST' });
      fetchAllData();
    } catch (err) { console.error('Failed to resolve issue'); }
  };

  const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'All Users', icon: '👥' },
    { id: 'contractors', label: 'Contractors', icon: '👷' },
    { id: 'projects', label: 'Projects', icon: '🏗️' },
    { id: 'bids', label: 'Bids', icon: '📋' },
    { id: 'issues', label: 'Issues', icon: '⚠️' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="glass-card border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <span className="text-xl">⚙️</span>
            </div>
            <div>
              <span className="text-xl font-bold">Admin Panel</span>
              <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">Administrator</span>
            </div>
          </div>
          <button onClick={logout} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Logout</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'Total Users', value: stats.stats.total_users, color: 'sky' },
                    { label: 'Contractors', value: stats.stats.total_contractors, color: 'purple' },
                    { label: 'Projects', value: stats.stats.total_projects, color: 'green' },
                    { label: 'Total Bids', value: stats.stats.total_bids, color: 'blue' },
                    { label: 'Pending Bids', value: stats.stats.pending_bids, color: 'yellow' },
                    { label: 'Open Issues', value: stats.stats.open_issues, color: 'red' }
                  ].map((stat, i) => (
                    <div key={i} className="glass-card rounded-xl p-4 text-center">
                      <div className={`text-4xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                      <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">All Users ({users.length})</h2>
                <div className="glass-card rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">User</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                                {u.full_name.charAt(0)}
                              </div>
                              <span className="font-medium">{u.full_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${u.user_type === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : u.user_type === 'contractor' ? 'bg-purple-500/20 text-purple-400' : 'bg-sky-500/20 text-sky-400'}`}>
                              {u.user_type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => toggleUserStatus(u.id)} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs hover:bg-yellow-500/30">
                                {u.is_active ? 'Ban' : 'Activate'}
                              </button>
                              <button onClick={() => deleteUser(u.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'contractors' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Contractors ({contractors.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contractors.map((c) => (
                    <div key={c.id} className="glass-card rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold">
                            {c.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold">{c.full_name}</div>
                            <div className="text-sm text-slate-400">ID: CON-{c.id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${c.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">Email</span><span>{c.email}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Rating</span><span className="text-yellow-400">★ {c.rating || 4.5}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Projects Done</span><span>{c.projects_completed || 0}</span></div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2">
                        <button onClick={() => verifyContractor(c.id)} className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30">✓ Verify</button>
                        <button onClick={() => toggleUserStatus(c.id)} className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30">{c.is_active ? 'Suspend' : 'Activate'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">All Projects ({projects.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((p) => (
                    <div key={p.id} className="glass-card rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">{p.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'completed' ? 'bg-green-500/20 text-green-400' : p.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {p.status || 'planning'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-slate-400">Owner</span><div className="font-medium">{p.owner_name}</div></div>
                        <div><span className="text-slate-400">Location</span><div className="font-medium">{p.location || '-'}</div></div>
                        <div><span className="text-slate-400">Area</span><div className="font-medium">{p.area ? `${p.area} sq ft` : '-'}</div></div>
                        <div><span className="text-slate-400">Budget</span><div className="font-medium text-green-400">{formatCurrency(p.budget)}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bids' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">All Bids ({bids.length})</h2>
                <div className="glass-card rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Project</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Contractor</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {bids.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-medium">{b.project_name || b.project_id}</td>
                          <td className="px-4 py-3">{b.contractor_name}</td>
                          <td className="px-4 py-3 text-green-400 font-medium">{formatCurrency(b.amount)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'accepted' ? 'bg-green-500/20 text-green-400' : b.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'issues' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Issues ({issues.filter(i => i.status === 'open').length} open)</h2>
                {issues.length === 0 ? (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <span className="text-6xl mb-4 block">✅</span>
                    <h3 className="text-xl font-bold mb-2">No Issues</h3>
                    <p className="text-slate-400">All issues have been resolved!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {issues.map((issue) => (
                      <div key={issue.id} className={`glass-card rounded-xl p-6 border-l-4 ${issue.severity === 'high' ? 'border-red-500' : issue.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg">{issue.issue_type}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${issue.severity === 'high' ? 'bg-red-500/20 text-red-400' : issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>{issue.severity}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${issue.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{issue.status}</span>
                            </div>
                            <p className="text-slate-300">{issue.description}</p>
                            <div className="text-sm text-slate-500 mt-2">Project: {issue.project_id}</div>
                          </div>
                          {issue.status !== 'resolved' && (
                            <button onClick={() => resolveIssue(issue.id)} className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">Resolve</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
