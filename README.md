# Document Management System com GitHub Copilot

## Executar localmente

Requisitos: Node.js 24 ou superior.

- Backend: `cd backend && npm install && npm start` (porta padrão 3000)
- Testes do backend: `cd backend && npm test`
- Frontend: `cd frontend && npm install && npm run dev` (porta 5173, proxy `/api` para o backend)

Variáveis de ambiente do backend (opcionais; valores inválidos impedem a inicialização):

| Variável            | Padrão            | Uso                            |
| ------------------- | ----------------- | ------------------------------ |
| PORT                | 3000              | Porta do backend               |
| STORAGE_DIR         | `backend/storage` | Pasta de gravação dos arquivos |
| MAX_FILE_SIZE_BYTES | 10485760 (10 MB)  | Limite de tamanho por arquivo  |

Identificação: as rotas de documentos exigem o cabeçalho `X-User-Id` (até 64 caracteres). Não há autenticação nesta fase; o valor é informado pelo cliente e deve ser tratado como identificação, não como prova de identidade.

Especificação completa: [docs/specs/dms-spec.md](docs/specs/dms-spec.md).

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey alexandremoura!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/treinamentos-serpro/document-management-system-alexandre-moura/issues/1)

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

