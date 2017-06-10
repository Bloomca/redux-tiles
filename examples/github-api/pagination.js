/**
 * @overview parsing githubs header link
 */

export default function parseHeaders({ link }) {
  if (!link) {
    return {
      end: true,
    };
  }

  const els = link.split(',');
  const pagination = els.reduce((hash, str) => {
    const rels = str.match(/page=(\d+).+?rel="(.+?)"/);
    hash[rels[2]] = Number(rels[1]);
    return hash;
  }, {});

  if (!pagination.last) {
    pagination.end = true;
  }

  return pagination;
}