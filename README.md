# 🌦️ PM-Accelerator-Weather-App

A full-stack Weather App built using **React** (Frontend) and **Flask** (Backend), as part of my **PM Accelerator Internship Assessment**! This app fetches real-time weather data and also includes a YouTube integration for related weather videos.
# [Focused on functionality with minimal UI design due to time constraints]

---

## 💡 What It Does

This app allows users to:

- 🔍 **Search Current Weather** by:
  - City Name
  - Pincode
  - User's **Current Location** (via geolocation)
    
- 📅 **View 5-Day Forecast** for the searched location
- 📺 **Watch YouTube Videos** related to the searched location
- 📝 **Create Weather Records** by entering and a location (validated using fuzzy matching) and custom **date range** to retrieve temperatures during those dates and stores them in MongoDB,
- 📊 **Retrieve and View** temperature data for all included dates
- ✅ **Input Validation**:
  - Validates if the location is valid
  - Ensures start date is before end date
- 📋 **Manage Weather Records**:
  - View all created records
  - **Update** individual records (modifies date range for a location and fetches new temperatures)
  - **Delete** specific records
- 📥 **Download Weather Records** as a `.json` file
- 🧑‍💼 **About Page** describing the **PM Accelerator Program**

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
    └── src/
        └── components/
            └── About.js
            └── CreatePage.js
            └── ReadPage.js
            └── UpdatePage.js
        └── App.js
├── server/        # Flask Backend
│   └── .env       # Contains WEATHER_API_KEY and MONGO_URI
    └── app.py
    └── requirements.txt
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

## 📸 Screenshots

### 🔹 Export as json functionality- not captured in video
![Export as json](screenshots/Screenshot%20(179).png)

### 🔹 JSON Source file opened- not captured in video
![Export as json](screenshots/Screenshot%20(180).png)

### 🔹 Temperature not fetched due to absence of one call subscription- not captured in video
![Export as json](screenshots/Screenshot%20(182).png)


---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 💡 Author

Made by Stephen Raju Mathew
[LinkedIn](https://www.linkedin.com/in/stephen-raju-mathew





