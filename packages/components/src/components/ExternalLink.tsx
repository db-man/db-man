/**
 * Jump to external website
 * The icon is from wikipedia external link
 */
const ExternalLink = ({ href, text }: { href: string; text: string }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ color: '#1E90FF' }}
    >
      {text}{' '}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 12 12"
      >
        <title>external link</title>
        <path
          fill="#1E90FF"
          d="M6 1h5v5L8.86 3.85 4.7 8 4 7.3l4.15-4.16zM2 3h2v1H2v6h6V8h1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1"
        />
      </svg>
    </a>
  );
};

export default ExternalLink;
