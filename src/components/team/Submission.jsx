import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

const STEPS = ['Project Details', 'Upload Files', 'Review & Submit'];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-display font-semibold shrink-0 ${
                  done ? 'bg-primary text-white' : active ? 'bg-primary text-white' : 'bg-app text-muted border border-border'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : stepNum}
              </div>
              <span className={`text-sm font-display whitespace-nowrap ${active ? 'text-ink font-medium' : 'text-muted'}`}>
                {label}
              </span>
            </div>
            {stepNum < STEPS.length && <div className="flex-1 h-px bg-border mx-4" />}
          </div>
        );
      })}
    </div>
  );
}

function UploadField({ label, hint, accept, multiple, files, onAdd, onRemove }) {
  const inputId = `upload-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-muted">{label}</label>
        <label htmlFor={inputId} className="text-xs font-display text-primary hover:underline cursor-pointer">
          Add file{multiple ? 's' : ''}
        </label>
      </div>
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const picked = Array.from(e.target.files || []);
          if (picked.length) onAdd(picked);
          e.target.value = '';
        }}
      />
      <div className="border border-dashed border-border rounded-md px-4 py-3">
        {files.length === 0 ? (
          <p className="text-sm text-muted">{hint}</p>
        ) : (
          <ul className="space-y-1.5">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between text-sm">
                <span className="truncate">{f.name}</span>
                <span className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-muted tabular-nums">{formatBytes(f.size)}</span>
                  <button type="button" onClick={() => onRemove(i)} className="text-xs text-muted hover:text-danger transition-colors">
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Submission() {
  const { team } = useOutletContext();
  const [step, setStep] = useState(1);

  const [details, setDetails] = useState({ title: '', summary: '' });
  const [projectFiles, setProjectFiles] = useState([]);
  const [presentation, setPresentation] = useState([]);
  const [video, setVideo] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const totalFiles = projectFiles.length + presentation.length + video.length + images.length;

  function goNext() {
    if (step === 1 && (!details.title.trim() || !details.summary.trim())) {
      setError('Add a project title and summary before continuing.');
      return;
    }
    if (step === 2 && presentation.length === 0) {
      setError('Add at least a presentation file before continuing.');
      return;
    }
    setError('');
    setStep((s) => Math.min(3, s + 1));
  }

  function goBack() {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    try {
      if (team?.id) {
        const { error: updateErr } = await supabase
          .from('teams')
          .update({
            name: details.title || team.name,
            one_liner: details.summary,
            description: details.summary,
            submitted: true,
          })
          .eq('id', team.id);

        if (updateErr) console.error('Failed to update submission in Supabase:', updateErr);
      }
    } catch (e) {
      console.error('Error submitting project:', e);
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-successlight text-success flex items-center justify-center mx-auto mb-4">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-semibold mb-1">Project submitted</h1>
          <p className="text-sm text-muted mb-6">Judges can now review {details.title || 'your project'}.</p>
          <Link to="/team" className="text-sm font-display text-primary hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link to="/team" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-4">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      <h1 className="font-display text-2xl font-semibold mb-6">Submit Your Project</h1>

      <StepIndicator current={step} />

      <div className="bg-card border border-border rounded-xl p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wide mb-1">
              Project Information
            </h2>
            <div>
              <label className="block text-xs text-muted mb-1.5">Team name</label>
              <input
                type="text"
                disabled
                value={team.name}
                className="w-full bg-app border border-border rounded-md px-3 py-2 text-sm text-muted"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5" htmlFor="title">Project title</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Smart Water Management System"
                value={details.title}
                onChange={(e) => setDetails((d) => ({ ...d, title: e.target.value }))}
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5" htmlFor="summary">Project summary</label>
              <textarea
                id="summary"
                rows={4}
                placeholder="Our solution uses IoT sensors and AI to monitor water usage and detect leaks, helping communities save water and reduce costs."
                value={details.summary}
                onChange={(e) => setDetails((d) => ({ ...d, summary: e.target.value }))}
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow resize-none"
              />
              <p className="text-xs text-muted mt-1 text-right tabular-nums">{details.summary.length}/300</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wide">Upload Files</h2>
            <UploadField
              label="Project files (PDF, DOC, etc.)"
              hint="No files added yet"
              multiple
              files={projectFiles}
              onAdd={(p) => setProjectFiles((f) => [...f, ...p])}
              onRemove={(i) => setProjectFiles((f) => f.filter((_, idx) => idx !== i))}
            />
            <UploadField
              label="Presentation (PPT, PDF)"
              hint="No presentation added yet"
              accept=".pdf,.ppt,.pptx"
              files={presentation}
              onAdd={(p) => setPresentation([p[0]])}
              onRemove={() => setPresentation([])}
            />
            <UploadField
              label="Video (MP4, MOV, etc.)"
              hint="No video added yet"
              accept="video/*"
              files={video}
              onAdd={(p) => setVideo([p[0]])}
              onRemove={() => setVideo([])}
            />
            <UploadField
              label="Images (JPG, PNG, etc.)"
              hint="No images added yet"
              accept="image/*"
              multiple
              files={images}
              onAdd={(p) => setImages((f) => [...f, ...p])}
              onRemove={(i) => setImages((f) => f.filter((_, idx) => idx !== i))}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wide">Review & Submit</h2>
            <div>
              <p className="text-xs text-muted mb-1">Project title</p>
              <p className="text-sm font-display">{details.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Summary</p>
              <p className="text-sm">{details.summary}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Files attached</p>
              <p className="text-sm">
                {totalFiles} file{totalFiles !== 1 ? 's' : ''} — {presentation.length ? presentation[0].name : 'no presentation'}
                {video.length ? `, ${video[0].name}` : ''}
              </p>
            </div>
            <p className="text-xs text-muted border-t border-border pt-4">
              Once submitted, judges can view this project. You can keep editing until judging closes.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-danger mt-4">{error}</p>}

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="px-4 py-2 rounded-md font-display text-sm font-medium text-ink border border-border hover:bg-app transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="px-5 py-2.5 rounded-md font-display text-sm font-semibold text-white bg-primary hover:bg-primarydark transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-md font-display text-sm font-semibold text-white bg-primary hover:bg-primarydark transition-colors"
            >
              Submit Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
