# 🔓 DarkTunnel Decryptor

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.11">
  <img src="https://img.shields.io/badge/Flask-3.0.3-green?style=for-the-badge&logo=flask&logoColor=white" alt="Flask 3.0.3">
  <img src="https://img.shields.io/badge/Railway-Deployed-8A2BE2?style=for-the-badge&logo=railway&logoColor=white" alt="Railway">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License">
</p>

<p align="center">
  <strong>Web-based VPN configuration file decryptor for multiple VPN apps</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-supported-formats">Supported Formats</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-credits">Credits</a>
</p>

---

## 📸 Screenshots

<p align="center">
  <img src="https://i.imgur.com/placeholder1.png" alt="DarkTunnel Decryptor UI" width="800">
  <br>
  <em>Clean, dark-themed UI with drag & drop support</em>
</p>

<p align="center">
  <img src="https://i.imgur.com/placeholder2.png" alt="Decryption Result" width="800">
  <br>
  <em>Beautiful JSON output with copy & download functionality</em>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Multi-Format Support** | Decrypt configs from 5 different VPN apps |
| 🖱️ **Drag & Drop** | Simply drag your config files into the browser |
| 🔍 **Auto Detection** | Automatically detects file type from content/extension |
| 📋 **Copy to Clipboard** | One-click copy of decrypted results |
| 💾 **Download JSON** | Save decrypted config as formatted JSON |
| 🎨 **Dark Theme** | Eye-friendly dark mode UI |
| 📱 **Responsive** | Works perfectly on desktop, tablet, and mobile |
| 🚀 **Fast & Lightweight** | Built with Flask and modern web technologies |
| 🔒 **Secure** | All processing happens server-side, no data stored |

---

## 📂 Supported Formats

| App | Extension | Decryptor File | Status |
|-----|-----------|----------------|--------|
| **Dark Tunnel** | `.dark` | `darktunnel.py` | ✅ Fully Supported |
| **HTTP Custom** | `.hc` | `httpcustom.py` | ✅ Fully Supported |
| **HTTP Injector** | `.ehi` | `httpinjector.py` | ✅ Fully Supported |
| **NPV Tunnel** | `.npv` | `npvtunnel.py` | ✅ Fully Supported |
| **SSC Custom** | `.ssc` | `ssccustom.py` | ✅ Fully Supported |

---

## 🏗️ Architecture
