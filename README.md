# StayFinder — Hotel Management CRUD

A responsive hotel directory built with React, Redux Toolkit, Express and PostgreSQL. It uses native parameterized SQL queries and stores uploaded images on the Node.js server.

## Requirements

- Node.js 18 or newer
- PostgreSQL 13 or newer
- npm

## 1. Create the database

Open PostgreSQL or pgAdmin and run:

```sql
CREATE DATABASE hotel_directory;
```

The API creates the `hotels` table automatically when it starts.

## 2. Configure the backend

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and update the PostgreSQL connection:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/hotel_directory
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

## 3. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
```

Copy `.env.example` to `.env` if you need to change the API address:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

Start React:

```bash
npm run dev
```

Open `http://localhost:5173`.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/hotels?search=&minPrice=&maxPrice=&limit=6&offset=0` | Search, filter and paginate hotels |
| GET | `/api/hotels/:id` | Get one hotel |
| POST | `/api/hotels` | Create a hotel |
| PUT | `/api/hotels/:id` | Update a hotel |
| DELETE | `/api/hotels/:id` | Delete a hotel |

Create and update requests use `multipart/form-data`. The image field is optional for updates and required only if you want to add or replace a picture.

## Project structure

```text
hotel-management-crud/
├── client/
│   └── src/
│       ├── components/
│       ├── features/hotels/
│       ├── pages/
│       ├── App.jsx
│       ├── main.jsx
│       ├── store.js
│       └── styles.css
├── server/
│   └── src/
│       ├── middleware/
│       ├── routes/
│       ├── db.js
│       ├── server.js
│       └── validation.js
└── README.md
```

## Notes

- Images are saved in `server/uploads`; the directory is created automatically.
- Hotel records are stored in PostgreSQL.
- SQL queries use parameters to avoid SQL injection.
- The detail page displays the saved coordinates on OpenStreetMap. The browser Geolocation API is also available through the current-location button and requires user permission.
- For production, configure a persistent disk for the uploads directory and set the correct frontend origin in `CLIENT_URL`.
