import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations } from './translations';
import { 
  Home, 
  FileText, 
  Briefcase, 
  Search, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Menu,
  PlusCircle,
  LayoutDashboard,
  Mic,
  Camera,
  Image as ImageIcon,
  ChevronDown,
  Bell
} from 'lucide-react';

const Dashboard = ({ user, setAuth }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('app_lang') || 'en');

  const t = (key) => translations[language][key] || key;

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_lang', lang);
  };

  React.useEffect(() => {
    setActiveTab('home');
    setDropdownOpen(false);
  }, [user.role]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-profile-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setAuth(null);
    navigate('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const renderContent = () => {
    // User (Client) Panel
    if (user.role === 'client') {
      switch (activeTab) {
        case 'home': return <HomeView user={user} t={t} />;
        case 'complaints': return <ComplaintView user={user} t={t} language={language} />;
        case 'jobs': return <ClientJobsView user={user} t={t} />;
        case 'schemes': return <SchemesView t={t} />;
        case 'track': return <TrackView t={t} />;
        case 'notifications': return <NotificationsView user={user} t={t} />;
        default: return <HomeView user={user} t={t} />;
      }
    } 
    // Employee Panel
    else if (user.role === 'employee') {
      switch (activeTab) {
        case 'home': return <EmployeeHome user={user} t={t} />;
        case 'complaints': return <EmployeeComplaintsView t={t} />;
        case 'post-job': return <PostJobsView user={user} t={t} />;
        case 'notifications': return <NotificationsView user={user} t={t} />;
        case 'schemes': return <PostSchemesView t={t} />;
        case 'applicants': return <JobApplicationsView user={user} t={t} />;
        default: return <EmployeeHome user={user} t={t} />;
      }
    } 
    // Admin Panel
    else if (user.role === 'admin') {
      switch (activeTab) {
        case 'home': return <AdminHome user={user} t={t} />;
        case 'users': return <ManageUsersView t={t} />;
        case 'employees': return <ManageEmployeesView t={t} />;
        case 'notifications': return <NotificationsView user={user} t={t} />;
        case 'applicants': return <JobApplicationsView user={user} t={t} />;
        default: return <AdminHome user={user} t={t} />;
      }
    }
  };

  const getNavItems = () => {
    if (user.role === 'client') {
      return [
        { id: 'home', label: t('home'), icon: <Home size={20} /> },
        { id: 'complaints', label: t('complaints'), icon: <FileText size={20} /> },
        { id: 'jobs', label: t('jobs'), icon: <Briefcase size={20} /> },
        { id: 'schemes', label: t('schemes'), icon: <PlusCircle size={20} /> },
        { id: 'track', label: t('track'), icon: <Search size={20} /> },
        { id: 'notifications', label: t('notifications'), icon: <Bell size={20} /> },
      ];
    } else if (user.role === 'employee') {
      return [
        { id: 'home', label: t('overview'), icon: <LayoutDashboard size={20} /> },
        { id: 'complaints', label: t('userComplaints'), icon: <FileText size={20} /> },
        { id: 'notifications', label: t('notifications'), icon: <Bell size={20} /> },
        { id: 'post-job', label: t('postNewJob'), icon: <PlusCircle size={20} /> },
        { id: 'schemes', label: t('postSchemes'), icon: <Briefcase size={20} /> },
        { id: 'applicants', label: 'Manage Applicants', icon: <Users size={20} /> },
      ];
    } else {
      return [
        { id: 'home', label: t('overview'), icon: <LayoutDashboard size={20} /> },
        { id: 'users', label: t('manageUsers'), icon: <Users size={20} /> },
        { id: 'employees', label: t('manageEmployees'), icon: <ShieldCheck size={20} /> },
        { id: 'notifications', label: t('notifications'), icon: <Bell size={20} /> },
        { id: 'applicants', label: 'Manage Applicants', icon: <Users size={20} /> },
      ];
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="mobile-header">
        <div className="sidebar-logo" style={{ marginBottom: 0, fontSize: '1.2rem' }}>
          <ShieldCheck size={24} />
          <span>{t('dashboardTitle')}</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          <Menu size={28} />
        </button>
      </div>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <ShieldCheck size={32} />
          <span>{t('dashboardTitle')}</span>
        </div>
        
        <nav className="sidebar-nav">
          {getNavItems().map((item) => (
            <div 
              key={item.id} 
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout}>
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="language-selector-pill" style={{ 
            background: '#f1f5f9', 
            padding: '4px', 
            borderRadius: '12px', 
            display: 'flex', 
            gap: '4px',
            border: '1px solid #e2e8f0'
          }}>
            {[
              { id: 'en', label: 'EN' },
              { id: 'hi', label: 'हिन्दी' },
              { id: 'te', label: 'తెలుగు' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: language === lang.id ? 'var(--primary-color)' : 'transparent',
                  color: language === lang.id ? 'white' : '#64748b',
                  transition: 'all 0.2s',
                  boxShadow: language === lang.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
          
          <div className="user-profile-container">
            <div className="user-info-card" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#718096' }}>{user.email}</div>
              </div>
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: 'var(--primary-color)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                {user.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown size={16} style={{ color: '#a0aec0', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">Account Management</div>
                
                <div className="portal-switch-item active">
                  <span>Role: {user.role?.toUpperCase()}</span>
                  <div className="portal-status-dot"></div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <div className="portal-switch-item" onClick={handleLogout} style={{ color: '#e53e3e' }}>
                  <span>{t('logout')}</span>
                  <LogOut size={14} />
                </div>
              </div>
            )}
          </div>
        </header>

        <section className="content-page">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

// --- View Components ---

const ClientJobsView = ({ user, t }) => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [applyStatus, setApplyStatus] = useState({});
  const [phoneInputs, setPhoneInputs] = useState({});

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const url = `/api/jobs${filter !== 'All' ? `?role=${filter}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJobs();
  }, [filter]);

  const handleApply = async (jobId) => {
    const phone = phoneInputs[jobId];
    if (!phone || phone.trim().length < 10) {
      setApplyStatus(prev => ({ ...prev, [jobId]: { type: 'error', text: t('validPhone') } }));
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id || user._id || 'dummy_user_id',
          phone: phone
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        setApplyStatus(prev => ({ ...prev, [jobId]: { type: 'success', text: 'Applied!' } }));
        fetchJobs(); // Refresh to see updated count
      } else {
        setApplyStatus(prev => ({ ...prev, [jobId]: { type: 'error', text: data.error } }));
      }
    } catch (err) {
      setApplyStatus(prev => ({ ...prev, [jobId]: { type: 'error', text: 'Connection error' } }));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="page-title" style={{ margin: 0, border: 'none' }}>{t('availableJobs')}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold', color: '#666' }}>{t('filterByRole')}</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px 15px', borderRadius: '10px', border: '1px solid #ddd', background: 'white', minWidth: '150px' }}
          >
            <option value="All">{t('all')}</option>
            <option value="Construction">Construction</option>
            <option value="Delivery">Delivery</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Security">Security</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div>{t('loadingItems')}</div>
      ) : (
        <div className="grid-2">
          {jobs.map(job => {
            const approvedCount = job.applicants?.filter(a => a.status === 'approved').length || 0;
            const isFull = approvedCount >= job.limit;
            
            // Find current user's application and its status
            const myApplication = job.applicants?.find(a => {
                const appId = a.user?._id || a.user || a._id || a; 
                const currentUserId = user?.id || user?._id;
                return appId && currentUserId && String(appId) === String(currentUserId);
            });
            const hasApplied = !!myApplication;
            const myStatus = myApplication?.status || 'none';
            
            const statusLabel = applyStatus[job._id];

            return (
              <div key={job._id} className="stat-card" style={{ borderLeftColor: isFull ? '#cbd5e0' : '#3498db', opacity: isFull ? 0.8 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.2rem', color: isFull ? '#718096' : 'var(--primary-color)', marginBottom: '5px' }}>{job.title}</h3>
                  <span style={{ fontSize: '0.7rem', background: '#ebf8ff', padding: '2px 8px', borderRadius: '10px', color: '#2b6cb0', fontWeight: 'bold' }}>{job.targetRole}</span>
                </div>
                <p style={{ fontWeight: 'bold', color: '#27ae60', marginBottom: '5px' }}>{job.pay}</p>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>📍 {job.location} | {job.type}</p>
                
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.82rem', color: isFull ? '#e53e3e' : '#718096', fontWeight: '700' }}>
                      {isFull ? t('jobFilled') : `${job.limit - approvedCount} ${t('spotsLeft')}`}
                    </span>
                    {hasApplied && (
                      <span style={{ 
                        fontSize: '0.7rem', 
                        marginTop: '4px',
                        color: myStatus === 'approved' ? '#48bb78' : myStatus === 'pending' ? '#ecc94b' : '#e53e3e',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {t('status')}: {myStatus === 'pending' ? t('waitReply') : myStatus}
                      </span>
                    )}
                  </div>
                  
                  {!hasApplied && !isFull && (
                    <input 
                      type="tel"
                      placeholder={t('phone')}
                      value={phoneInputs[job._id] || ''}
                      onChange={(e) => setPhoneInputs(prev => ({ ...prev, [job._id]: e.target.value }))}
                      style={{ 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd', 
                        fontSize: '0.9rem',
                        width: '140px'
                      }}
                    />
                  )}

                  <button 
                    className="btn-primary" 
                    onClick={() => handleApply(job._id)}
                    disabled={isFull || hasApplied}
                    style={{ 
                      padding: '8px 20px', 
                      fontSize: '0.9rem',
                      background: hasApplied ? (myStatus === 'approved' ? '#c6f6d5' : myStatus === 'rejected' ? '#fed7d7' : '#feebc8') : isFull ? '#cbd5e0' : 'var(--primary-color)',
                      color: hasApplied ? (myStatus === 'approved' ? '#22543d' : myStatus === 'rejected' ? '#822727' : '#744210') : 'white',
                      cursor: (isFull || hasApplied) ? 'not-allowed' : 'pointer',
                      border: hasApplied ? '1px solid currentColor' : 'none'
                    }}
                  >
                    {hasApplied 
                      ? (myStatus === 'approved' ? '✓ ' + myStatus : myStatus === 'rejected' ? '❌ ' + myStatus : '⟳ ' + t('waitReply')) 
                      : (isFull ? t('noVacancy') : t('applyNow'))
                    }
                  </button>
                </div>
                {statusLabel && <p style={{ fontSize: '0.75rem', marginTop: '5px', color: statusLabel.type === 'success' ? 'green' : 'red' }}>{statusLabel.text}</p>}
              </div>
            );
          })}
{jobs.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#a0aec0', background: 'white', borderRadius: '15px' }}>
              {t('noJobs')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const HomeView = ({ user, t }) => {
  const [stats, setStats] = useState({ jobs: 0, schemes: 15, complaints: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await fetch(`/api/stats`);
        if (resp.ok) {
          const data = await resp.json();
          setStats(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="page-title">{t('welcome')}, {user.name}</h1>
      <div className="stat-card-container">
        <div className="stat-card">
          <h3>{t('registeredComplaints')}</h3>
          <div className="value">{stats.complaints}</div>
        </div>
        <div className="stat-card">
          <h3>{t('availableJobs')}</h3>
          <div className="value">{stats.jobs}</div>
        </div>
        <div className="stat-card">
          <h3>{t('newSchemes')}</h3>
          <div className="value">{stats.schemes}</div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
          <h3>{t('recentActivity')}</h3>
          <p style={{ color: '#666', marginTop: '10px' }}>{t('noActivity')}</p>
        </div>
        <div className="card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
          <h3>{t('announcements')}</h3>
          <p style={{ color: '#666', marginTop: '10px' }}>{t('schemeUpdates')}</p>
        </div>
      </div>
    </div>
  );
};

const ComplaintView = ({ user, t, language }) => {
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const streamRef = React.useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    
    // Map our codes to speech recognition language codes
    const langMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      te: 'te-IN'
    };

    recognition.lang = langMap[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  const submitComplaint = async () => {
    if (!subject.trim() || !description.trim()) {
      alert("Please enter both a subject and a description for your complaint.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          description,
          photo: selectedImage,
          userId: user?.id || user?._id || 'mock-user-id'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubject('');
        setDescription('');
        setSelectedImage(null);
        alert(`Your complaint has been registered successfully!\n\nTracking ID: ${data.trackId}`);
      } else {
        alert(data.error || 'Failed to submit complaint');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">{t('registerComplaint')}</h2>
      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="input-group">
          <label>{t('subject')}</label>
          <input 
            type="text" 
            placeholder={t('enterSubject')} 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        
        <div className="input-group" style={{ position: 'relative' }}>
          <label>{t('description')}</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '150px', paddingRight: '50px' }} 
            placeholder={t('describeIssue')}
          ></textarea>
          <button 
            type="button"
            onClick={startVoiceInput}
            title="Use Voice Input"
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '15px',
              background: isListening ? '#e53e3e' : 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            <Mic size={20} />
          </button>
        </div>

        <div className="input-group">
          <label>{t('uploadPhoto')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginTop: '10px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              background: '#f8fafc',
              border: '2px dashed #cbd5e0',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#4a5568',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}>
              <ImageIcon size={20} />
              <span>{t('uploadPhoto')}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>

            <button 
              type="button" 
              onClick={startCamera}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                background: '#ebf8ff',
                border: '2px solid #4299e1',
                borderRadius: '10px',
                cursor: 'pointer',
                color: '#2b6cb0',
                fontWeight: '600'
              }}
            >
              <Camera size={20} />
              <span>{t('takePhoto')}</span>
            </button>

            {selectedImage && (
              <div style={{ position: 'relative' }}>
                <img src={selectedImage} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                <button 
                  onClick={() => setSelectedImage(null)}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {isCameraOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <video ref={videoRef} autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '15px' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
              <button onClick={takePhoto} className="btn-primary" style={{ background: '#48bb78', border: 'none', padding: '15px 40px', fontSize: '1.1rem' }}>CAPTURE</button>
              <button onClick={stopCamera} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '12px', fontSize: '1.1rem', cursor: 'pointer' }}>CANCEL</button>
            </div>
          </div>
        )}

        <button 
          className="btn-primary" 
          style={{ marginTop: '20px', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          onClick={submitComplaint}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('submitting') : t('submitComplaint')}
        </button>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
        }
      `}</style>
    </div>
  );
};

const EmployeeComplaintsView = ({ t }) => {
  const [complaints, setComplaints] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(null);
  const [viewImage, setViewImage] = React.useState(null);

  const fetchComplaints = async () => {
    try {
      const resp = await fetch('/api/complaints');
      if (resp.ok) {
        const data = await resp.json();
        setComplaints(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchComplaints();
  }, []);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      const response = await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h2 className="page-title">{t('userComplaints')}</h2>
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '20px' }}>{t('loadingItems')}</p>
        ) : (
          <div className="table-responsive">
            <table style={{ minWidth: '800px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '15px' }}>{t('trackId')}</th>
                <th style={{ padding: '15px' }}>{t('user')}</th>
                <th style={{ padding: '15px' }}>Evidence</th>
                <th style={{ padding: '15px' }}>{t('subject')}</th>
                <th style={{ padding: '15px' }}>{t('status')}</th>
                <th style={{ padding: '15px' }}>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(comp => (
                <tr key={comp._id}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{comp.trackId}</td>
                  <td style={{ padding: '15px' }}>{comp.user?.name || 'Unknown'}</td>
                  <td style={{ padding: '15px' }}>
                    {comp.photo ? (
                        <div 
                          onClick={() => setViewImage(comp.photo)}
                          style={{ cursor: 'pointer', background: '#f0f4f8', padding: '4px', borderRadius: '8px', width: '50px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <img src={comp.photo} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '4px' }} alt="Proof" />
                        </div>
                    ) : (
                        <span style={{ fontSize: '0.7rem', color: '#cbd5e0' }}>No Proof</span>
                    )}
                  </td>
                  <td style={{ padding: '15px' }}>{comp.subject}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      color: comp.status === 'Resolved' ? '#27ae60' : comp.status === 'In Process' ? '#2980b9' : '#f39c12', 
                      fontWeight: 'bold' 
                    }}>
                      {comp.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {comp.status === 'Pending' && (
                        <button 
                          className="btn-primary" 
                          style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#3498db' }}
                          onClick={() => updateStatus(comp._id, 'In Process')}
                          disabled={updating === comp._id}
                        >
                          {t('review')}
                        </button>
                      )}
                      {comp.status === 'In Process' && (
                        <button 
                          className="btn-primary" 
                          style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#2ecc71' }}
                          onClick={() => updateStatus(comp._id, 'Resolved')}
                          disabled={updating === comp._id}
                        >
                          {t('resolve')}
                        </button>
                      )}
                      {comp.status === 'Resolved' && (
                        <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{t('completed')}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {viewImage && (
        <div 
          onClick={() => setViewImage(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img src={viewImage} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '15px', border: '5px solid white' }} alt="Large" />
            <p style={{ color: 'white', textAlign: 'center', marginTop: '15px', fontWeight: 'bold' }}>Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};

const SchemesView = ({ t }) => {
  const [schemes, setSchemes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/schemes').then(r => r.json()).then(data => {
      setSchemes(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2 className="page-title">{t('schemes')}</h2>
      <div className="grid-2">
        {schemes.map(s => (
          <div key={s._id} className="card scheme-card" style={{ padding: '0', overflow: 'hidden' }}>
            {s.photo && <img src={s.photo} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />}
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>{s.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>{s.description}</p>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                <strong>Eligibility: </strong> {s.eligibility}
              </div>
            </div>
          </div>
        ))}
        {schemes.length === 0 && !loading && (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
            {t('noSchemes')}
          </div>
        )}
      </div>
    </div>
  );
};

const TrackView = ({ t }) => {
  const [trackId, setTrackId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [complaint, setComplaint] = React.useState(null);
  const [error, setError] = React.useState('');

  const handleTrack = async () => {
    if (!trackId.trim()) return;
    setLoading(true);
    setError('');
    setComplaint(null);
    try {
      const response = await fetch(`/api/complaints/track/${trackId.toUpperCase()}`);
      const data = await response.json();
      if (response.ok) {
        setComplaint(data);
      } else {
        setError(data.error || 'Tracking ID not found');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Pending': return 1;
      case 'In Process': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  return (
    <div>
      <h2 className="page-title">{t('trackStatus')}</h2>
      <div className="card" style={{ maxWidth: '100%' }}>
        <p style={{ marginBottom: '20px' }}>{t('enterRefId')}</p>
        <div className="input-group" style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="REF-XXXX-XXXX" 
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
            style={{ textTransform: 'uppercase' }}
          />
          <button className="btn-primary" onClick={handleTrack} disabled={loading}>
            {loading ? '...' : t('trackNow')}
          </button>
        </div>
        {error && <p style={{ color: '#e53e3e', fontSize: '0.9rem', marginTop: '10px' }}>{error}</p>}
      </div>

      {complaint && (
        <div className="card" style={{ maxWidth: '100%', marginTop: '30px', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>{t('complaintDetails')}</h3>
            <span style={{ 
              background: '#ebf8ff', 
              color: '#2b6cb0', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}>{complaint.trackId}</span>
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{complaint.subject}</p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{complaint.description}</p>
          </div>

          <div className="tracking-timeline" style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '10px' }}>
              <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
              <div style={{ 
                position: 'absolute', 
                top: '15px', 
                left: '0', 
                width: `${(getStatusStep(complaint.status) - 1) * 50}%`, 
                height: '2px', 
                background: 'var(--secondary-color)', 
                zIndex: 0,
                transition: 'width 0.5s ease'
              }}></div>
              
              {[
                { label: 'Pending', step: 1 },
                { label: 'In Process', step: 2 },
                { label: 'Resolved', step: 3 }
              ].map((s) => (
                <div key={s.step} style={{ textAlign: 'center', position: 'relative', zIndex: 1, background: 'white', padding: '0 5px' }}>
                  <div style={{ 
                    width: '30px', 
                    height: '30px', 
                    borderRadius: '50%', 
                    background: getStatusStep(complaint.status) >= s.step ? 'var(--secondary-color)' : '#e2e8f0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    boxShadow: getStatusStep(complaint.status) >= s.step ? '0 0 10px rgba(52, 152, 219, 0.4)' : 'none'
                  }}>
                    {getStatusStep(complaint.status) > s.step ? '✓' : s.step}
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: getStatusStep(complaint.status) >= s.step ? 'var(--primary-color)' : '#a0aec0',
                    fontWeight: 'bold'
                  }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#718096' }}>
            <p>{t('registeredOn')}: {new Date(complaint.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const EmployeeHome = ({ user, t }) => {
  const [stats, setStats] = React.useState({ jobs: 0, authoredSchemes: 4 });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await fetch('/api/stats');
        if (resp.ok) {
          const data = await resp.json();
          setStats(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="page-title">{t('overview')}</h1>
      <div className="stat-card-container">
        <div className="stat-card">
          <h3>{t('jobPosts')}</h3>
          <div className="value">{stats.jobs}</div>
        </div>
        <div className="stat-card">
          <h3>{t('authoredSchemes')}</h3>
          <div className="value">{stats.authoredSchemes}</div>
        </div>
      </div>
    </div>
  );
};

const PostJobsView = ({ user, t }) => {
  const [formData, setFormData] = useState({ title: '', location: '', pay: '', type: 'Daily Wage', targetRole: 'Construction', limit: 5, description: '' });
  const [status, setStatus] = useState('');
  const [myJobs, setMyJobs] = useState([]);

  const fetchMyJobs = async () => {
    const resp = await fetch(`/api/jobs/my?userId=${user.id || user._id}`);
    if (resp.ok) {
      const data = await resp.json();
      setMyJobs(data);
    }
  };

  React.useEffect(() => { fetchMyJobs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, postedBy: user?.id || user?._id };
      const resp = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        setStatus('Job posted successfully!');
        setFormData({ title: '', location: '', pay: '', type: 'Daily Wage', targetRole: 'Construction', limit: 5, description: '' });
        fetchMyJobs();
      } else { setStatus('Failed to post job.'); }
    } catch (err) { setStatus('Error connecting to backend.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job post?')) return;
    try {
      const resp = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        setMyJobs(myJobs.filter(j => j._id !== id));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
      <div>
        <h2 className="page-title">{t('postNewJob')}</h2>
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="input-group"><label>Title</label><input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
          <div className="input-group"><label>Location</label><input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required /></div>
          <div className="input-group"><label>Pay</label><input value={formData.pay} onChange={e => setFormData({...formData, pay: e.target.value})} required /></div>
          <button type="submit" className="btn-primary">{t('postJob')}</button>
          {status && <p style={{ color: status.includes('success') ? 'green' : 'red' }}>{status}</p>}
        </form>
      </div>
      <div>
        <h2 className="page-title">Manage Your Jobs</h2>
        <div className="card" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {myJobs.map(job => (
            <div key={job._id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{job.title}</p>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>📍 {job.location}</p>
              </div>
              <button onClick={() => handleDelete(job._id)} style={{ background: '#fff5f5', color: '#e53e3e', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
          {myJobs.length === 0 && <p style={{ textAlign: 'center', color: '#a0aec0' }}>No jobs posted yet.</p>}
        </div>
      </div>
    </div>
  );
};

const NotificationsView = ({ user, t }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const resp = await fetch(`/api/notifications?userId=${user.id || user._id}`);
      if (resp.ok) {
        const data = await resp.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleAction = async (jobId, applicantId, status, notifId) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applicants/${applicantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        // Optionally delete the notification or mark it actioned
        await fetch(`/api/notifications/${notifId}`, { method: 'DELETE' });
        fetchNotifications();
        alert(`Application ${status} successfully!`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
  };

  const clearNotifications = async () => {
    try {
      await fetch(`/api/notifications?userId=${user.id || user._id}`, { method: 'DELETE' });
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="page-title" style={{ margin: 0 }}>{t('notifications')}</h2>
        <button 
          onClick={clearNotifications}
          style={{ 
            background: 'none', 
            border: '1px solid #e2e8f0', 
            padding: '8px 15px', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: '#718096',
            fontWeight: '600'
          }}
        >
          Clear All
        </button>
      </div>

      {loading ? (
        <p>Loading notifications...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notifications.map(notif => (
            <div key={notif._id} className="card" style={{ borderLeft: `4px solid ${notif.type === 'alert' ? '#e53e3e' : notif.type === 'job_application' ? '#48bb78' : '#3182ce'}`, padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#2d3748', fontWeight: '500' }}>{notif.message}</p>
                  <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
                <Bell size={20} style={{ color: notif.type === 'alert' ? '#e53e3e' : notif.type === 'job_application' ? '#48bb78' : '#3182ce' }} />
              </div>
              
              {notif.type === 'job_application' && notif.meta && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #edf2f7', display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleAction(notif.meta.jobId, notif.meta.applicantId, 'approved', notif._id)}
                    style={{ background: '#48bb78', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    ✓ Approve
                  </button>
                  <button 
                    onClick={() => handleAction(notif.meta.jobId, notif.meta.applicantId, 'rejected', notif._id)}
                    style={{ background: '#e53e3e', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    × Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
              <Bell size={40} style={{ margin: '0 auto 15px', opacity: 0.5 }} />
              <p>No new notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PostSchemesView = ({ user, t }) => {
  const [formData, setFormData] = useState({ title: '', description: '', eligibility: '' });
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState('');
  const [mySchemes, setMySchemes] = useState([]);

  const fetchMySchemes = async () => {
    // Note: We'll filter real-time schemes from all schemes for this demo simpler
    const resp = await fetch('/api/schemes');
    if (resp.ok) {
      const data = await resp.json();
      setMySchemes(data.filter(s => String(s.postedBy?._id || s.postedBy) === String(user.id || user._id)));
    }
  };

  React.useEffect(() => { fetchMySchemes(); }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, photo, postedBy: user?.id || user?._id })
      });
      if (resp.ok) {
        setStatus('Scheme posted successfully!');
        setFormData({ title: '', description: '', eligibility: '' });
        setPhoto(null);
        fetchMySchemes();
      }
    } catch (err) { setStatus('Error posting scheme.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheme post?')) return;
    try {
      const resp = await fetch(`/api/schemes/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        setMySchemes(mySchemes.filter(s => s._id !== id));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
      <div>
        <h2 className="page-title">{t('postSchemes')}</h2>
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="input-group">
            <label>Scheme Title</label>
            <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Eligibility Criteria</label>
            <input value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Scheme Photo</label>
            <input type="file" onChange={handlePhoto} />
            {photo && <img src={photo} style={{ width: '100px', marginTop: '10px', borderRadius: '8px' }} />}
          </div>
          <button type="submit" className="btn-primary">{t('postSchemes')}</button>
          {status && <p style={{ color: status.includes('success') ? 'green' : 'red' }}>{status}</p>}
        </form>
      </div>
      <div>
        <h2 className="page-title">Manage Your Schemes</h2>
        <div className="card" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {mySchemes.map(scheme => (
            <div key={scheme._id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{scheme.title}</p>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>📍 {new Date(scheme.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete(scheme._id)} style={{ background: '#fff5f5', color: '#e53e3e', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
          {mySchemes.length === 0 && <p style={{ textAlign: 'center', color: '#a0aec0' }}>No schemes posted yet.</p>}
        </div>
      </div>
    </div>
  );
};

const AdminHome = ({ user, t }) => {
  const [stats, setStats] = React.useState({ clients: 0, employees: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await fetch('/api/stats');
        if (resp.ok) {
          const data = await resp.json();
          setStats(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="page-title">{t('overview')}</h1>
      <div className="stat-card-container">
        <div className="stat-card">
          <h3>{t('manageUsers')}</h3>
          <div className="value">{stats.clients}</div>
        </div>
        <div className="stat-card">
          <h3>{t('manageEmployees')}</h3>
          <div className="value">{stats.employees}</div>
        </div>
      </div>
    </div>
  );
};

const ManageUsersView = ({ t }) => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError('Error loading users. Make sure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // Real-time polling every 10 seconds for dev/demo purpose
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && users.length === 0) return <div style={{ padding: '20px' }}>Loading real-time data...</div>;
  if (error) return <div style={{ padding: '20px', color: '#e53e3e' }}>{error}</div>;

  const handleApprove = async (id) => {
    try {
      const resp = await fetch(`/api/users/${id}/approve`, { method: 'PATCH' });
      if (resp.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, isApproved: true } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="page-title">{t('manageUsers')}</h2>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '15px' }}>Photo</th>
              <th style={{ padding: '15px' }}>{t('user')}</th>
              <th style={{ padding: '15px' }}>Email</th>
              <th style={{ padding: '15px' }}>{t('status')}</th>
              <th style={{ padding: '15px' }}>Action</th>
              <th style={{ padding: '15px' }}>{t('registeredOn')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((dbUser) => (
              <tr key={dbUser._id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                <td style={{ padding: '15px' }}>
                  <img 
                    src={dbUser.picture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                    alt={dbUser.name} 
                    style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                </td>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{dbUser.name}</td>
                <td style={{ padding: '15px', color: '#4a5568' }}>{dbUser.email}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    background: dbUser.isApproved !== false ? '#edf2f7' : '#fff5f5', 
                    color: dbUser.isApproved !== false ? '#4a5568' : '#e53e3e',
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>{dbUser.isApproved !== false ? dbUser.role : 'PENDING APPROVAL'}</span>
                </td>
                <td style={{ padding: '15px' }}>
                    {dbUser.isApproved === false && (
                        <button 
                            onClick={() => handleApprove(dbUser._id)}
                            style={{ background: '#48bb78', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Approve
                        </button>
                    )}
                </td>
                <td style={{ padding: '15px', fontSize: '0.85rem', color: '#718096' }}>
                  {new Date(dbUser.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                  No users found in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const ManageEmployeesView = ({ t }) => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        // Filter for employees
        setUsers(data.filter(u => u.role === 'employee' || u.role === 'worker'));
      } catch (err) {
        console.error(err);
        setError('Error loading employees. Make sure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && users.length === 0) return <div style={{ padding: '20px' }}>Loading real-time employee data...</div>;
  if (error) return <div style={{ padding: '20px', color: '#ef4444' }}>{error}</div>;

  const handleApprove = async (id) => {
    try {
      const resp = await fetch(`/api/users/${id}/approve`, { method: 'PATCH' });
      if (resp.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, isApproved: true } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="page-title">{t('manageEmployees')}</h2>
      <div className="card">
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '15px' }}>Photo</th>
                <th style={{ padding: '15px' }}>Name</th>
                <th style={{ padding: '15px' }}>Email</th>
                <th style={{ padding: '15px' }}>Phone</th>
                <th style={{ padding: '15px' }}>Role</th>
                <th style={{ padding: '15px' }}>Status</th>
                <th style={{ padding: '15px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((dbUser) => (
                <tr key={dbUser._id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '15px' }}>
                    <img 
                      src={dbUser.picture || 'https://ui-avatars.com/api/?name=' + dbUser.name} 
                      alt={dbUser.name} 
                      style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  </td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{dbUser.name}</td>
                  <td style={{ padding: '15px', color: '#4a5568' }}>{dbUser.email}</td>
                  <td style={{ padding: '15px' }}>
                     {dbUser.phone ? (
                       <a href={`tel:${dbUser.phone}`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
                         📞 {dbUser.phone}
                       </a>
                     ) : <span style={{ color: '#cbd5e0' }}>N/A</span>}
                  </td>
                  <td style={{ padding: '15px', textTransform: 'capitalize' }}>{dbUser.role}</td>
                  <td style={{ padding: '15px' }}>
                    <span className={`tag ${dbUser.isApproved !== false ? 'tag-success' : 'tag-error'}`}>
                      {dbUser.isApproved !== false ? 'Active' : 'Pending Approval'}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                      {dbUser.isApproved === false && (
                          <button 
                              onClick={() => handleApprove(dbUser._id)}
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', width: 'auto' }}
                          >
                              Approve
                          </button>
                      )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


const JobApplicationsView = ({ user, t }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const resp = await fetch(`/api/jobs/my?userId=${user.id || user._id}`);
        if (resp.ok) {
          const data = await resp.json();
          setJobs(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyJobs();
  }, [user]);

  return (
    <div>
      <h2 className="page-title">Manage Job Applicants</h2>
      {loading ? (
        <p>Loading your jobs...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {jobs.map(job => (
            <div key={job._id} className="card" style={{ padding: '20px' }}>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{job.title}</h3>
                  <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#718096' }}>📍 {job.location} | Limit: {job.limit}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>{job.applicants.filter(a => a.status === 'approved').length} / {job.limit}</span>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#a0aec0', textTransform: 'uppercase' }}>Slots Filled</p>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Applicants:</h4>
                <div className="table-responsive">
                  <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', fontSize: '0.8rem', color: '#718096', borderBottom: '1px solid #f0f4f8' }}>
                        <th style={{ padding: '10px' }}>Name</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Contact (Approved Only)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.applicants.map((app, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={app.user?.picture || 'https://ui-avatars.com/api/?name=User'} alt="p" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                              <span>{app.user?.name || 'Demo Client'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ 
                              background: app.status === 'approved' ? '#c6f6d5' : app.status === 'pending' ? '#feebc8' : '#fed7d7',
                              color: app.status === 'approved' ? '#22543d' : app.status === 'pending' ? '#744210' : '#822727',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px', fontSize: '0.9rem', fontWeight: 'bold', color: app.status === 'approved' ? '#2d3748' : '#cbd5e0' }}>
                            {app.status === 'approved' ? (app.phone || 'N/A') : '••••••••••'}
                          </td>
                        </tr>
                      ))}
                      {job.applicants.length === 0 && (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#a0aec0' }}>No applicants yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
              <Briefcase size={40} style={{ margin: '0 auto 15px', opacity: 0.5 }} />
              <p>You haven't posted any jobs yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
