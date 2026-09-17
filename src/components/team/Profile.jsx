import { useState } from 'react';
import { User, Github, Linkedin, Twitter, Globe, CheckCircle2, AlertCircle, Plus, X, GraduationCap, Code, Award, Upload, Image as ImageIcon } from 'lucide-react';
import { useHackathon } from '../../context/HackathonContext.jsx';

// Client-side image compression using HTML5 Canvas
function compressImage(file, maxWidth = 250, maxHeight = 250, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function StudentProfile() {
  const { profile, updateProfile } = useHackathon();

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    avatar: profile?.avatar || '',
    bio: profile?.bio || '',
    university: profile?.university || '',
    github: profile?.github || '',
    linkedin: profile?.socials?.linkedin || '',
    twitter: profile?.socials?.twitter || '',
    portfolio: profile?.socials?.portfolio || '',
  });

  const [techStack, setTechStack] = useState(profile?.techStack || []);
  const [newTech, setNewTech] = useState('');

  const [skills, setSkills] = useState(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file);
      setFormData(prev => ({ ...prev, avatar: compressedDataUrl }));
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      await updateProfile({
        ...profile,
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        bio: formData.bio,
        university: formData.university,
        techStack,
        skills,
        github: formData.github,
        socials: {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          portfolio: formData.portfolio,
        },
      });

      setNotification({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Profile save error:', err);
      setNotification({ type: 'error', message: 'Failed to save profile changes. Please try again.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const addTechTag = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTechTag = (tag) => {
    setTechStack(techStack.filter(t => t !== tag));
  };

  const addSkillTag = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkillTag = (tag) => {
    setSkills(skills.filter(s => s !== tag));
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold text-ink">Student Profile & Settings</h1>
          <p className="text-xs text-muted">Keep your bio, skills, university, and social links up to date for hackathon organizers.</p>
        </div>

        {notification && (
          <div className={`px-3.5 py-2 rounded-md text-xs font-medium flex items-center gap-2 border transition-all ${
            notification.type === 'success'
              ? 'bg-successlight text-success border-success/30'
              : 'bg-dangerlight text-danger border-danger/30'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {notification.message}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-3 group">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary text-white font-display text-3xl font-semibold flex items-center justify-center">
                  {formData.name?.charAt(0) || 'S'}
                </div>
              )}

              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium"
              >
                <Upload className="h-4 w-4 mb-0.5" />
                Change
              </label>
            </div>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <h2 className="font-display font-medium text-ink text-base">{formData.name}</h2>
            <p className="text-xs text-muted mb-4">{formData.university || 'Student'}</p>

            <div className="space-y-2">
              <label
                htmlFor="avatar-upload"
                className="w-full py-1.5 px-3 bg-app hover:bg-border/40 text-ink border border-border rounded-md text-xs font-display font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                {isCompressing ? 'Uploading...' : 'Upload Picture'}
              </label>

              <div>
                <label className="block text-left text-xs font-medium text-muted mb-1 mt-3">Or Image URL</label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-xs text-muted uppercase tracking-wide flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" /> Links & Socials
            </h3>

            <div>
              <label className="block text-xs text-muted mb-1 flex items-center gap-1">
                <Github className="h-3.5 w-3.5" /> GitHub Profile
              </label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1 flex items-center gap-1">
                <Linkedin className="h-3.5 w-3.5 text-primary" /> LinkedIn
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1 flex items-center gap-1">
                <Twitter className="h-3.5 w-3.5 text-sky-500" /> Twitter / X
              </label>
              <input
                type="url"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/username"
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-emerald-600" /> Portfolio Website
              </label>
              <input
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                placeholder="https://yourportfolio.dev"
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-ink flex items-center gap-2 border-b border-border pb-3">
              <User className="h-4 w-4 text-primary" /> Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1 flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5 text-primary" /> University / Institution
              </label>
              <input
                type="text"
                placeholder="e.g. Stanford University..."
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">Bio / Overview</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Describe your background and what you love building..."
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-ink flex items-center gap-2 border-b border-border pb-3">
              <Code className="h-4 w-4 text-primary" /> Tech Stack & Tools
            </h3>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {techStack.map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded bg-primarylight text-primary text-xs font-medium border border-primary/20 flex items-center gap-1">
                  {tech}
                  <button type="button" onClick={() => removeTechTag(tech)} className="hover:text-danger">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTechTag(); } }}
                placeholder="Add technology (e.g. React, Python)..."
                className="flex-1 px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
              />
              <button
                type="button"
                onClick={addTechTag}
                className="px-3.5 py-2 bg-primary hover:bg-primarydark text-white rounded-md text-xs font-display font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-ink flex items-center gap-2 border-b border-border pb-3">
              <Award className="h-4 w-4 text-primary" /> Core Skills
            </h3>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {skills.map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded bg-successlight text-success text-xs font-medium border border-success/20 flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkillTag(skill)} className="hover:text-danger">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkillTag(); } }}
                placeholder="Add skill (e.g. UI/UX Design, API Architecture)..."
                className="flex-1 px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
              />
              <button
                type="button"
                onClick={addSkillTag}
                className="px-3.5 py-2 bg-success hover:bg-emerald-700 text-white rounded-md text-xs font-display font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primarydark text-white rounded-md text-xs font-display font-semibold transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
