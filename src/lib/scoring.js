export function assignmentsForTeam(assignments, teamId) {
  return assignments.filter((a) => a.teamId === teamId);
}

export function assignmentsForJudge(assignments, judgeId) {
  return assignments.filter((a) => a.judgeId === judgeId);
}

export function consolidatedScore(assignments, teamId) {
  const done = assignmentsForTeam(assignments, teamId).filter((a) => a.status === 'submitted');
  if (done.length === 0) return null;
  const avg = done.reduce((sum, a) => sum + a.total, 0) / done.length;
  return Math.round(avg * 10) / 10;
}

export function judgingProgress(assignments) {
  const total = assignments.length;
  const done = assignments.filter((a) => a.status === 'submitted').length;
  return { total, done, pending: total - done };
}

export function rankedTeams(teams, assignments) {
  return teams
    .map((t) => {
      const teamAssignments = assignmentsForTeam(assignments, t.id);
      return {
        ...t,
        score: consolidatedScore(assignments, t.id),
        reviewersTotal: teamAssignments.length,
        reviewersDone: teamAssignments.filter((a) => a.status === 'submitted').length,
      };
    })
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
}
