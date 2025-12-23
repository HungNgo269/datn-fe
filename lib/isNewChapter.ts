export function isNewChapter(date: string | Date): boolean {
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  if (date >= oneMonthAgo) {
    return true;
  }
  return false;
}
