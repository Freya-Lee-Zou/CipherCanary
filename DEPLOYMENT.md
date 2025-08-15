# 🚀 CipherCanary Deployment Guide

## 🌐 **Option 1: GitHub Pages (Recommended for Demo)**

### **Step 1: Enable GitHub Pages**
1. Go to your repository: `https://github.com/Freya-Lee-Zou/CipherCanary`
2. Click **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose **gh-pages** branch and **/ (root)** folder
5. Click **Save**

### **Step 2: Deploy Frontend**
```bash
# Install gh-pages package
cd frontend
npm install --save-dev gh-pages

# Build and deploy
npm run deploy
```

### **Step 3: Access Your App**
Your app will be available at: `https://freya-lee-zou.github.io/CipherCanary`

---

## 🔧 **Option 2: Netlify (Full-Stack Hosting)**

### **Step 1: Deploy to Netlify**
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **New site from Git**
3. Connect your GitHub repository
4. Set build settings:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/build`
5. Click **Deploy site**

### **Step 2: Configure Environment Variables**
In Netlify dashboard:
- Go to **Site settings** → **Environment variables**
- Add: `REACT_APP_API_URL` = `https://your-site.netlify.app/.netlify/functions/api`

### **Step 3: Access Your App**
Your app will be available at: `https://your-site.netlify.app`

---

## 🐳 **Option 3: Docker + VPS (Production)**

### **Step 1: Deploy Backend**
```bash
# On your VPS
git clone https://github.com/Freya-Lee-Zou/CipherCanary.git
cd CipherCanary

# Start backend services
docker-compose up -d db redis api
```

### **Step 2: Deploy Frontend**
```bash
# Build frontend
cd frontend
npm run build

# Serve with nginx or any web server
# Copy build folder to your web server directory
```

---

## 📱 **Quick GitHub Pages Setup**

### **Automatic Deployment (Recommended)**
The GitHub Actions workflow will automatically deploy your app when you push to main:

1. **Push your code** (already done!)
2. **Wait for GitHub Actions** to complete
3. **Enable GitHub Pages** in repository settings
4. **Your app is live!**

### **Manual Deployment**
```bash
# In your repository
cd frontend
npm install
npm run build

# Install gh-pages globally
npm install -g gh-pages

# Deploy
gh-pages -d build
```

---

## 🔍 **Testing Your Deployment**

### **Frontend Features**
- ✅ Responsive design
- ✅ Dark theme
- ✅ Navigation menu
- ✅ Dashboard layout

### **Backend Features (GitHub Pages)**
- ⚠️ **Limited**: Only static content
- ⚠️ **No database**: Can't store data
- ⚠️ **No real encryption**: Demo only

### **Backend Features (Netlify)**
- ✅ **Serverless functions**: Basic API endpoints
- ✅ **Encryption simulation**: Demo functionality
- ✅ **CORS enabled**: Frontend can call API

---

## 🎯 **What You'll See**

### **GitHub Pages Version**
- Beautiful UI with navigation
- Dashboard with algorithm cards
- Login/Register forms (non-functional)
- Responsive design on all devices

### **Netlify Version**
- All GitHub Pages features
- Working API endpoints
- Encryption/decryption simulation
- Real-time data updates

---

## 🚨 **Important Notes**

### **GitHub Pages Limitations**
- **No backend**: Can't run Python/FastAPI
- **No database**: Can't store user data
- **Static only**: No server-side processing
- **Perfect for**: Demos, portfolios, documentation

### **Netlify Advantages**
- **Serverless backend**: JavaScript functions
- **Free tier**: Generous limits
- **Custom domains**: Professional URLs
- **CDN**: Fast global delivery

---

## 🎉 **Next Steps After Deployment**

1. **Test your app** at the deployed URL
2. **Share the link** with others
3. **Customize the design** and add features
4. **Consider upgrading** to full hosting for production use

---

## 📞 **Need Help?**

- **GitHub Issues**: Create an issue in your repository
- **Documentation**: Check the main README.md
- **Community**: Ask questions in GitHub Discussions

---

*Your CipherCanary app will be live and accessible to anyone with the URL! 🚀*
