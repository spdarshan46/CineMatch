# 🎬 CineMatch — Full-Stack Movie Discovery Platform

CineMatch is a full-stack movie discovery web application that allows users to discover movies, search by title, filter by genre, sort results, view detailed movie information, and maintain a persistent wishlist.

The application uses **React + Vite** for the frontend, **Node.js + Express** for the backend, **TMDB API** for movie data, and **SQLite** for wishlist persistence.

---

## 1. Setup Instructions

### Prerequisites

* Node.js 20+ (Node.js 22+ recommended)
* npm
* TMDB API Read Access Token (v4)

A TMDB account and API credentials are required because movie information is retrieved from the TMDB API.

### Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
TMDB_ACCESS_TOKEN=your_tmdb_v4_access_token
```

Start the backend:

```bash
node src/server.js
```

The backend will run at:

```text
http://localhost:5000
```

The SQLite database is initialized automatically by the backend.

### Frontend Setup

Open a second terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` directory if required:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

### Production Build

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

# 2. Approach Taken

The application was designed with a separation between the frontend, backend, external movie API, and locally persisted wishlist data.

### Application Flow

```text
React Frontend
      ↓
Axios API Client
      ↓
Express Backend
      ↓
TMDB Service
      ↓
TMDB API
```

The frontend does not communicate directly with TMDB. All movie-related requests go through the backend.

This keeps the TMDB access token on the server and provides the frontend with a consistent API structure.

### Movie Discovery

The Discover page provides:

* Movie search
* Genre filtering
* Sorting
* Pagination
* Wishlist actions

Users can browse popular movies or change the sorting option to highest-rated or newest releases.

### Debounced Search

The search input uses a **400ms debounce**.

Instead of making a request for every character typed, the application waits until the user pauses typing before updating the search state.

This reduces unnecessary API requests.

### URL-Based Discovery State

Search, genre, sorting, and pagination are synchronized with URL query parameters.

For example:

```text
?q=batman&genre=28&sort=popularity.desc&page=1
```

This allows users to:

* Refresh the page without losing their current search/filter state.
* Bookmark a discovery result.
* Use browser back/forward navigation.
* Preserve the current discovery position while navigating through the application.

### Movie Details

The movie details page retrieves detailed information through the backend.

The backend requests both:

* Movie details
* Movie credits

and combines them into a normalized response containing movie information and cast details.

### Wishlist

Users can add or remove movies from their wishlist.

Wishlist data is persisted in a local SQLite database, allowing saved movies to remain available after refreshing or restarting the application.

The frontend uses TanStack Query mutations to provide optimistic wishlist interactions.

---

# 3. Important Technical Decisions

## Backend API Abstraction

The frontend never calls TMDB directly.

Instead, the backend provides endpoints such as:

```text
GET /api/movies/discover
GET /api/movies/search
GET /api/movies/genres
GET /api/movies/:id
```

The backend communicates with TMDB and returns application-specific responses to the frontend.

This provides a clear separation of concerns and keeps external API credentials away from the browser.

---

## TMDB Response Normalization

TMDB provides fields such as:

```text
vote_average
vote_count
poster_path
backdrop_path
release_date
```

The backend converts them into a predictable frontend format:

```text
rating
voteCount
posterUrl
backdropUrl
releaseDate
```

It also provides fallback values for missing information.

For example:

* Missing title → `Untitled`
* Missing overview → `No overview available.`
* Missing poster → `null`

This keeps the React components simpler and reduces defensive handling of the external API structure.

---

## Selective Data Persistence

The complete TMDB movie catalog is not stored in the local database.

Only wishlist information is persisted.

The wishlist stores:

```text
id
movieId
title
overview
posterUrl
backdropUrl
rating
releaseDate
createdAt
```

Storing minimal movie information allows the wishlist page to render saved movies without making additional TMDB requests for every item.

---

## SQLite

SQLite was selected because it provides simple local persistence without requiring an external database server.

The application therefore does not require:

* PostgreSQL
* MySQL
* Docker
* Cloud database infrastructure

This makes the project easier to set up and evaluate locally.

---

## Server-Side Caching

The backend uses `node-cache` to reduce repeated requests to TMDB.

Current cache durations are:

| Endpoint        | Cache Duration |
| --------------- | -------------: |
| Genres          |       24 hours |
| Discover Movies |     15 minutes |
| Search Results  |      5 minutes |
| Movie Details   |         1 hour |

Only successful GET responses are cached.

The middleware also exposes cache status through:

```text
X-Cache-Lookup: HIT
```

or:

```text
X-Cache-Lookup: MISS
```

---

## Request Timeout

The Axios client used for TMDB requests has a **5-second timeout**.

This prevents the application from waiting indefinitely if the external API becomes slow or unavailable.

---

## Request Cancellation

The frontend passes the TanStack Query `AbortController` signal to Axios.

This helps cancel outdated requests when the user changes search parameters quickly and prevents unnecessary requests from continuing after they are no longer needed.

---

## Optimistic Wishlist Updates

The Discover page uses TanStack Query optimistic mutations.

The flow is:

```text
User clicks Wishlist
        ↓
UI updates immediately
        ↓
Request sent to backend
        ↓
   ┌────┴────┐
   ↓         ↓
Success    Failure
   ↓         ↓
Keep      Rollback
update    previous state
```

This provides a fast user experience while still allowing the application to recover from network failures.

---

# 4. Assumptions Made

## Single-User Environment

Authentication was outside the scope of the assessment.

Therefore, the wishlist currently operates as a single-user/local wishlist associated with the local backend database.

## TMDB Availability

The application assumes that TMDB is generally available.

Caching and request timeouts are used to reduce the impact of temporary API issues and repeated requests.

## Local Evaluation

The application is designed to run locally without requiring external infrastructure.

SQLite was therefore chosen instead of a production database server.

## Responsive Usage

The application is intended to work across:

* Mobile
* Tablet
* Desktop

The movie grid uses responsive sizing:

```css
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
```

This allows the number of movie cards per row to adapt to the available screen width.

---

# 5. Known Limitations

## Single-User Wishlist

There is currently no authentication system.

As a result, multiple users cannot maintain separate wishlists.

## Process-Bound Cache

The current cache exists in Node.js process memory.

If the backend is deployed across multiple instances, each instance will have its own cache.

A distributed cache such as Redis would be more suitable for production.

## SQLite Persistence

SQLite is appropriate for local development and assessment evaluation but is not ideal for a horizontally scaled production system.

A production deployment could use PostgreSQL with connection pooling.

## External API Dependency

Movie discovery and movie details depend on the TMDB API.

If TMDB is unavailable or the API credentials are invalid, new movie data cannot be retrieved.

## No Automated Test Suite

The current implementation does not contain a comprehensive automated unit, integration, or end-to-end test suite.

---

# 6. AI Tools Used and How They Were Used

The following AI tools were used during development:

* **ChatGPT**
* **Cursor**
* **Gemini**

AI was used as a development assistance and troubleshooting resource.

Examples of AI-assisted work include:

* Investigating TMDB v3 versus v4 authentication.
* Understanding TMDB authorization headers.
* Generating initial Express route boilerplate.
* Assisting with initial React component and layout boilerplate.
* Troubleshooting Windows-specific development and path issues.
* Investigating Node.js and SQLite compatibility.
* Troubleshooting dependency and configuration issues.
* Exploring implementation approaches and debugging errors.

The application's architecture and important implementation decisions were reviewed and integrated during development.

The following decisions were specifically considered and implemented as part of the application's design:

* Frontend/backend separation.
* TMDB response normalization.
* URL-synchronized discovery state.
* Selective wishlist persistence.
* Optimistic wishlist updates.
* Wishlist rollback behavior.
* Server-side caching.
* Local SQLite persistence.
* Request cancellation and timeout handling.

---

# 7. What I Would Improve With Additional Time

## AI-Powered Movie Assistant

With additional time, I would add an **AI-powered movie assistant** to make CineMatch more personalized and interactive.

The assistant could understand a user's movie interests based on their:

* Wishlist
* Search history
* Preferred genres
* Ratings/interactions
* Recently viewed movies

Users could interact with the assistant using natural language.

For example:

> "Recommend movies similar to the movies in my wishlist."

or:

> "Show me some highly rated action movies."

The assistant could then provide personalized recommendations using the user's interests and available movie metadata.

---

## Personalized Daily Recommendations

I would add a personalized recommendation system that generates daily movie suggestions based on the user's interests.

For example:

```text
User Interests
      ↓
Wishlist + Search Activity
      ↓
Preference Analysis
      ↓
Personalized Recommendations
      ↓
Daily Movie Suggestions
```

This would make the application more useful beyond basic movie discovery.

---

## Personalized Notifications

I would also introduce notifications to bring users back to the application when relevant content becomes available.

For example:

* A new movie matches the user's favorite genre.
* A highly rated movie matches their interests.
* A movie similar to something in their wishlist is released.
* New trending movies match their preferences.
* A personalized daily recommendation is ready.

The goal would be to provide **useful, interest-based notifications rather than generic notifications**.

---

## Authentication and Multi-User Wishlists

I would add authentication so users can have individual accounts and isolated wishlists.

Potential features:

* User registration
* Login/logout
* User-specific wishlist
* Multiple collections
* Favorites
* Watch history

---

## Production Database

I would migrate:

```text
SQLite → PostgreSQL
```

for production deployments.

This would provide better support for concurrent users and scalable deployments.

---

## Distributed Caching

I would migrate:

```text
node-cache → Redis
```

so multiple backend instances can share cached movie responses.

---

## Automated Testing

I would add:

* Unit tests for TMDB normalization.
* Integration tests for movie and wishlist APIs.
* Database tests for wishlist operations.
* End-to-end tests for the main user journey.

Potential tools:

```text
Vitest
MSW
Playwright
```

---

## Improved Validation and Security

I would add stronger API validation and production security measures, including:

* Request schema validation.
* API rate limiting.
* Security headers.
* Input sanitization.
* Authentication/authorization.
* HTTPS in production.

---

# API Endpoints

## Movies

### Get Genres

```http
GET /api/movies/genres
```

### Discover Movies

```http
GET /api/movies/discover
```

Query parameters:

```text
sortBy
genreId
page
```

Example:

```text
/api/movies/discover?sortBy=popularity.desc&genreId=28&page=1
```

### Search Movies

```http
GET /api/movies/search
```

Query parameters:

```text
q
page
```

Example:

```text
/api/movies/search?q=batman&page=1
```

### Movie Details

```http
GET /api/movies/:id
```

Example:

```text
/api/movies/550
```

---

# Wishlist API

### Get Wishlist

```http
GET /api/wishlist
```

### Add Movie

```http
POST /api/wishlist
```

### Remove Movie

```http
DELETE /api/wishlist/:movieId
```

---

# Frontend Routes

| Route        | Description     |
| ------------ | --------------- |
| `/`          | Movie Discovery |
| `/movie/:id` | Movie Details   |
| `/wishlist`  | User Wishlist   |

---

# Project Structure

```text
CineMatch/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── generated/
│   │   │   └── prisma/
│   │   │
│   │   ├── middleware/
│   │   │   └── cacheMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── movieRoutes.js
│   │   │   └── wishlistRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── tmdbService.js
│   │   │
│   │   └── server.js
│   │
│   ├── prisma.config.ts
│   ├── package.json
│   ├── .env
│   └── dev.db
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   │
│   │   ├── components/
│   │   │   ├── MovieCard.jsx
│   │   │   └── SkeletonCard.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── DiscoverPage.jsx
│   │   │   ├── MovieDetailPage.jsx
│   │   │   └── WishlistPage.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# Project Summary

CineMatch demonstrates a complete full-stack movie discovery workflow:

```text
React + Vite
      ↓
TanStack Query + Axios
      ↓
Express + Node.js
      ↓
TMDB API
      +
SQLite Wishlist
      +
Server-Side Caching
      +
Optimistic UI
```

The project focuses on creating a responsive movie discovery experience while maintaining a clear separation between the frontend, backend, external API, caching layer, and persisted wishlist state.

The planned AI assistant and personalized notification system would be the next step toward transforming CineMatch from a movie discovery application into a **personalized movie companion**.
