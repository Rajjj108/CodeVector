export const calculateStreak = (submissions) => {
  const dates = submissions.map((s) =>
    new Date(s.createdAt).toDateString()
  );

  const unique = [...new Set(dates)].sort(
    (a, b) => new Date(b) - new Date(a)
  );

  let streak = 0;
  let today = new Date();

  for (let i = 0; i < unique.length; i++) {
    const diff =
      (today - new Date(unique[i])) /
      (1000 * 60 * 60 * 24);

    if (diff <= 1) {
      streak++;
      today = new Date(unique[i]);
    } else {
      break;
    }
  }

  return streak;
};