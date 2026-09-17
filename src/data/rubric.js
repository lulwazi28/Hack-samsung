export const RUBRIC = [
  { id: 'innovation', label: 'Innovation & Originality', max: 2 },
  { id: 'problem', label: 'Problem Definition & Impact', max: 2 },
  { id: 'technical', label: 'Technical Implementation', max: 2 },
  { id: 'functionality', label: 'Functionality & Execution', max: 2 },
  { id: 'ux', label: 'User Experience & Presentation', max: 1 },
  { id: 'scalability', label: 'Scalability & Future Potential', max: 1 },
];

export const RUBRIC_TOTAL = RUBRIC.reduce((sum, r) => sum + r.max, 0);
