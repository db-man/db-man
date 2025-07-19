import PropTypes from 'prop-types';

function SuccessMessage({
  message,
  url,
}: {
  message: string;
  url: string | undefined;
}) {
  console.debug('Commit link:', url); // eslint-disable-line no-console

  return (
    <div>
      {message}{' '}
      <a href={url} target="_blank" rel="noreferrer">
        Commit link
      </a>
    </div>
  );
}

SuccessMessage.propTypes = {
  url: PropTypes.string.isRequired,
};

export default SuccessMessage;
