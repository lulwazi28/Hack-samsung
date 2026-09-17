import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

const HackathonContext = createContext();

const INITIAL_PROFILE = {
  name: 'Student',
  email: '',
  avatar: '',
  bio: '',
  university: '',
  techStack: [],
  skills: [],
  github: '',
  socials: {
    linkedin: '',
    twitter: '',
    portfolio: '',
  }
};

const INITIAL_HACKATHONS = [
  {
    id: 'ws-1',
    name: 'Autumn Build 2026',
    organizer: 'Samsung Innovation Hub',
    description: 'Build futuristic mobile and IoT applications powered by Samsung SDKs and cutting-edge GenAI.',
    startDate: 'Oct 15, 2026',
    endDate: 'Oct 18, 2026',
    deadline: 'Oct 10, 2026',
    status: 'active',
    isAccepting: true,
    maxTeamSize: 4,
    tags: ['GenAI', 'IoT', 'Mobile', 'Cloud'],
    participantsCount: 42,
  },
  {
    id: 'ws-2',
    name: 'Spring Hack 2026',
    organizer: 'Samsung Pay Labs',
    description: 'Architect secure decentralized finance apps and seamless payment workflows for global users.',
    startDate: 'Nov 01, 2026',
    endDate: 'Nov 05, 2026',
    deadline: 'Oct 25, 2026',
    status: 'active',
    isAccepting: true,
    maxTeamSize: 5,
    tags: ['FinTech', 'Security', 'Web3', 'Payments'],
    participantsCount: 118,
  }
];

const INITIAL_APPLICATIONS = [];

export function HackathonProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('hj_student_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [hackathons, setHackathons] = useState(INITIAL_HACKATHONS);
  const [applications, setApplications] = useState([]);

  // Fetch real hackathons / workspaces from Supabase
  const refreshWorkspaces = async () => {
    try {
      const { data, error } = await supabase.from('workspaces').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const formatted = data.map((ws) => ({
          id: ws.id,
          name: ws.name,
          organizer: ws.organizer || 'Samsung Hub',
          description: ws.description || 'Build innovative products using Samsung SDKs and Cloud technologies.',
          startDate: ws.start_date || 'Oct 15, 2026',
          endDate: ws.end_date || 'Oct 18, 2026',
          deadline: ws.deadline || 'Oct 10, 2026',
          status: ws.status || 'active',
          isAccepting: ws.is_accepting !== false,
          maxTeamSize: ws.max_team_size || 4,
          tags: ws.tags || ['AI/ML', 'Mobile', 'Cloud'],
          participantsCount: ws.participants_count || 0,
        }));
        setHackathons(formatted);
      }
    } catch (err) {
      console.warn('Workspace fetch fallback:', err);
    }
  };

  useEffect(() => {
    refreshWorkspaces();
  }, []);

  // Fetch real applications for the active student email from Supabase
  useEffect(() => {
    async function fetchUserApplications() {
      if (!profile?.email) {
        setApplications([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('workspace_applications')
          .select('*')
          .eq('applicant_email', profile.email);

        if (data) {
          const formatted = data.map((app) => ({
            id: app.id,
            workspaceId: app.workspace_id,
            studentProfile: profile,
            message: app.message,
            status: app.status, // 'Pending' | 'Approved' | 'Declined'
            appliedAt: new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          }));
          setApplications(formatted);
        } else {
          setApplications([]);
        }
      } catch (err) {
        console.warn('Applications fetch fallback:', err);
        setApplications([]);
      }
    }
    fetchUserApplications();
  }, [profile?.email]);

  useEffect(() => {
    localStorage.setItem('hj_student_profile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = async (newProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('hj_student_profile', JSON.stringify(newProfile));
      await supabase.auth.updateUser({
        data: {
          full_name: newProfile.name,
          avatar_url: newProfile.avatar,
          university: newProfile.university,
          bio: newProfile.bio,
          tech_stack: newProfile.techStack,
          skills: newProfile.skills,
        },
      });
    } catch (e) {
      console.warn('Supabase auth metadata update fallback:', e);
    }
  };

  const applyToHackathon = async (workspaceId, message) => {
    // Check if already applied
    const existing = applications.find(a => a.workspaceId === workspaceId);
    if (existing) return existing;

    const newApp = {
      id: `app-${Date.now()}`,
      workspaceId,
      studentProfile: profile,
      message: message || 'Enthusiastic to contribute and build cool products!',
      status: 'Pending',
      appliedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setApplications(prev => [newApp, ...prev]);

    // Persist application to Supabase workspace_applications table
    try {
      await supabase.from('workspace_applications').insert([{
        workspace_id: workspaceId,
        applicant_name: profile.name,
        applicant_email: profile.email,
        applicant_university: profile.university || 'University',
        applicant_bio: profile.bio || '',
        applicant_tech_stack: profile.techStack || [],
        applicant_skills: profile.skills || [],
        message: message || 'Enthusiastic to contribute and build cool products!',
        status: 'Pending',
      }]);
    } catch (e) {
      console.warn('Supabase application insert fallback:', e);
    }

    return newApp;
  };

  const updateApplicationStatus = (appId, newStatus) => {
    setApplications(prev =>
      prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
    );
  };

  const getApplicationForWorkspace = (workspaceId) => {
    return applications.find(a => a.workspaceId === workspaceId);
  };

  const hasWorkspaceAccess = (workspaceId) => {
    const app = getApplicationForWorkspace(workspaceId);
    return app?.status === 'Approved';
  };

  return (
    <HackathonContext.Provider
      value={{
        profile,
        updateProfile,
        hackathons,
        refreshWorkspaces,
        applications,
        applyToHackathon,
        updateApplicationStatus,
        getApplicationForWorkspace,
        hasWorkspaceAccess,
      }}
    >
      {children}
    </HackathonContext.Provider>
  );
}

export function useHackathon() {
  return useContext(HackathonContext);
}
