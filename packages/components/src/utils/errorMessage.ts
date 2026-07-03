export const getErrorDetail = (err: unknown) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
};

export const buildErrorMessage = (prefix: string, err: unknown) => {
  const detail = getErrorDetail(err);
  return detail ? `${prefix} Reason: ${detail}` : prefix;
};
