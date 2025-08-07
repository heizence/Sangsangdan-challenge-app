export const dateFormatter = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().substring(0, 10);
};
