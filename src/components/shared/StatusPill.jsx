const TONES = {
  success: 'bg-successlight text-success',
  warning: 'bg-warninglight text-warning',
  danger: 'bg-dangerlight text-danger',
  neutral: 'bg-app text-muted',
  primary: 'bg-primarylight text-primary',
};

export default function StatusPill({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-display font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}
