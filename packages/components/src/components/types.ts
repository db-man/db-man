import PropTypes from 'prop-types';

export const linkShape = {
  children: PropTypes.string,
  href: PropTypes.string,
  text: PropTypes.string,
};

export const link = PropTypes.shape(linkShape);

export const columnType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  primary: PropTypes.bool,
  referenceTable: PropTypes.string,
});

export const tableType = PropTypes.shape({
  name: PropTypes.string,
});
