const multer = require('multer');

function handleMulterError(error, res) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Arquivo acima do tamanho máximo permitido.' });
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Campo de arquivo inesperado. Use "file".' });
  }
  return res.status(400).json({ error: error.message });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }
  if (error instanceof multer.MulterError) {
    return handleMulterError(error, res);
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Corpo JSON inválido.' });
  }
  console.error(error);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

module.exports = { errorHandler };
