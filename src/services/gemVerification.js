// Initial product rule for the prototype. Tune with the team before using shared data.
export const GEM_USER_VERIFY_MIN_RATINGS = 5;
export const GEM_USER_VERIFY_MIN_AVERAGE = 4;

export function getGemVerification(evidence = {}) {
  const ratingCount = Math.max(0, Number(evidence.ratingCount) || 0);
  const averageRating = Math.max(0, Number(evidence.averageRating) || 0);
  const aiChecked = evidence.aiChecked === true || typeof evidence.aiPassed === 'boolean';
  const aiPassed = evidence.aiPassed === true;
  const userVerified = evidence.userVerified === true || (
    ratingCount >= GEM_USER_VERIFY_MIN_RATINGS && averageRating >= GEM_USER_VERIFY_MIN_AVERAGE
  );
  const adminApproved = evidence.adminApproved === true;
  const fullyVerified = aiPassed && userVerified && adminApproved;

  return {
    aiChecked,
    aiPassed,
    ratingCount,
    averageRating,
    userVerified,
    adminApproved,
    fullyVerified,
    stage: fullyVerified ? 'Verified by all' : userVerified ? 'User verified' : adminApproved ? 'Admin approved' : aiPassed ? 'Possible location' : aiChecked ? 'AI checked · needs review' : 'AI screening pending'
  };
}
