/**
 * Media paths stored in the database are either root-relative uploads
 * (e.g. "/uploads/xxx.jpg") or legacy asset paths carried over from the
 * original static site (e.g. "assets/photo.jpg", with no leading slash —
 * they worked there because every public page lived at the site root).
 * The admin back office is served under /admin/*, so those bare paths need
 * a leading slash to resolve correctly in <img> previews there.
 */
function publicPath(value) {
  if (!value) return '';
  if (/^(\/|https?:)/.test(value)) return value;
  return '/' + value;
}

module.exports = { publicPath };
