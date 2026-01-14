# Changelog

All notable changes to MediTutor will be documented in this file.

## [1.0.0] - 2024-01-14

### Added
- ✅ Initial release - migrat de la Lovable Cloud (Supabase) la self-hosted
- ✅ Backend Node.js + Express + PostgreSQL
- ✅ Frontend React 18 + TypeScript + Vite
- ✅ JWT Authentication (înlocuiește Supabase Auth)
- ✅ Row Level Security per user
- ✅ Docker support cu docker-compose
- ✅ API RESTful complet:
  - Authentication (login/register)
  - Clients (CRUD complet)
  - Sessions (CRUD + mark paid)
  - Notes (CRM)
  - Grades (note academice)
  - Objectives (obiective învățare)
  - Journals (jurnal ședințe)
  - Materials (upload fișiere)
  - Stats (statistici dashboard/financiare)
- ✅ File upload local (înlocuiește Supabase Storage)
- ✅ PostgreSQL schema completă cu toate tabelele
- ✅ Migrații automate
- ✅ Documentație completă (README, QUICKSTART, API)
- ✅ Scripts instalare (install.bat pentru Windows, install.sh pentru Linux/Mac)

### Features
- Dashboard cu statistici live
- Management clienți (elevi)
- Management ședințe cu tracking plăți
- CRM cu note persistente
- Progress tracking (note, obiective, jurnal)
- Materiale didactice cu upload
- Statistici financiare cu export
- Responsive design (mobile-friendly)

### Security
- Password hashing (bcryptjs)
- JWT tokens cu expirare
- CORS protection
- Helmet security headers
- SQL injection protection (parameterized queries)
- Input validation (express-validator)

### Technical
- TypeScript pentru type safety
- React Query pentru state management
- Tailwind CSS pentru styling
- shadcn/ui pentru componente
- Nginx pentru frontend serving în Docker
- Health check endpoint
- Error handling centralizat

## [Planned] - Future Releases

### v1.1.0
- [ ] Export Excel rapoarte
- [ ] Email notifications
- [ ] Rate limiting API
- [ ] Backup automat programat

### v1.2.0
- [ ] Calendar sync (Google Calendar)
- [ ] Two-factor authentication
- [ ] Dark mode
- [ ] Multi-language support

### v2.0.0
- [ ] Mobile app (React Native)
- [ ] Pagini complete pentru toate funcționalitățile
- [ ] Advanced analytics
- [ ] Payment integration
