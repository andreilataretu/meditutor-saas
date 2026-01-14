# MediTutor - Deploy pe Render.com

## 📋 Pași pentru deploy:

### 1. Push pe GitHub

```bash
# Inițializează Git (dacă nu e deja)
git init

# Adaugă toate fișierele
git add .

# Commit
git commit -m "Initial commit - MediTutor SaaS platform"

# Conectează cu repository-ul tău GitHub
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# Push
git branch -M main
git push -u origin main
```

**Înlocuiește `USERNAME/REPO-NAME` cu datele tale!**

### 2. Deploy pe Render

1. **Mergi pe**: https://render.com
2. **Login** cu GitHub
3. Click **"New +"** → **"Blueprint"**
4. **Conectează repository-ul** tău GitHub
5. Render detectează automat `render.yaml` ✅
6. Click **"Apply"** → Render creează automat:
   - PostgreSQL database (gratuit)
   - Backend API service
   - Frontend static site

### 3. Așteaptă deployment (~5 minute)

- Render va instala dependențele
- Va rula migrațiile automat
- Va genera SSL certificate (HTTPS gratuit)

### 4. Gata! 🎉

Vei primi 2 URL-uri:
- **Frontend**: `https://meditutor-frontend.onrender.com`
- **Backend API**: `https://meditutor-backend.onrender.com`

## ⚙️ Variabile de mediu (setate automat)

Render setează automat toate variabilele din `render.yaml`:
- ✅ `DATABASE_URL` - conectare PostgreSQL
- ✅ `JWT_SECRET` - generat automat securizat
- ✅ `CORS_ORIGIN` - URL-ul frontend-ului
- ✅ `VITE_API_URL` - URL-ul backend-ului

## 🔄 Update aplicație

După orice modificare:

```bash
git add .
git commit -m "Update feature X"
git push
```

Render va redeploya automat în 2-3 minute!

## 💡 Tips:

- **Free tier**: Serviciile dorm după 15 min inactivitate (se trezesc în 30 sec)
- **Logs**: Dashboard Render → Service → Logs tab
- **Database**: Render Dashboard → Database → Connection string

## ⚠️ Limitare free tier:

După 90 zile, database-ul PostgreSQL gratuit își șterge datele. 
Pentru persistență permanentă: upgrade la $7/lună pentru PostgreSQL.

## 🆘 Probleme?

- **Build fails**: Verifică logs în Render Dashboard
- **Database connection**: Verifică că migrația a rulat (vezi logs)
- **CORS errors**: Render setează automat CORS_ORIGIN

---

**Ready to deploy? Rulează comenzile din Secțiunea 1!** 🚀
