# 🌦️ PM-Accelerator-Weather-App

A full-stack Weather App built using **React** (Frontend) and **Flask** (Backend), as part of my **PM Accelerator Internship Assessment**! This app fetches real-time weather data and also includes a YouTube integration for related weather videos.

---

## 🚀 Tech Stack

- **Frontend:** React
- **Backend:** Flask
- **Database:** MongoDB Atlas
- **APIs:** OpenWeatherMap API, YouTube Data API v3

---

## 📦 Project Structure

```
PM-Accelerator-Weather-App/
├── client/        # React Frontend
│   └── .env       # Contains YOUTUBE_API_KEY
├── server/        # Flask Backend
│   └── .env       # Contains WEATHER_API_KEY and MONGO_URI
└── README.md
```

---

## ⚙️ How to Run the Project

### 🔹 Frontend (React)

```bash
cd client
npm install
npm start
```

Create a `.env` file inside the `client` folder and add:

```env
YOUTUBE_API_KEY=your_youtube_api_key
```

---

### 🔹 Backend (Flask)

```bash
cd server
python -m venv venv
source venv/bin/activate     # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Create a `.env` file inside the `server` folder and add:

```env
WEATHER_API_KEY=your_openweather_api_key
MONGO_URI=your_mongodb_connection_string
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 💡 Author

Made with 💙 by [Your Name]  
[LinkedIn](https://www.linkedin.com/in/your-profile) • [Portfolio](https://your-portfolio.com)





