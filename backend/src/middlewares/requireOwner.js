const MAX_OWNER_LENGTH = 64;

function requireOwner(req, res, next) {
  const owner = (req.get('X-User-Id') || '').trim();
  if (!owner) {
    return res.status(401).json({ error: 'Informe o cabeçalho X-User-Id.' });
  }
  if (owner.length > MAX_OWNER_LENGTH) {
    return res
      .status(400)
      .json({ error: `O cabeçalho X-User-Id deve ter no máximo ${MAX_OWNER_LENGTH} caracteres.` });
  }
  req.owner = owner;
  return next();
}

module.exports = { requireOwner };
