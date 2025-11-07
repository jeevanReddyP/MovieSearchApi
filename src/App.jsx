import { useEffect, useState, useCallback } from "react";
import "./App.css";

const API_KEY = "d7cfb4ed26e01fb0065b04d10501b5c9";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Debounce
  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // ✅ Throttle
  function throttle(func, limit) {
    let lastRun;
    let lastFunc;
    return function (...args) {
      const now = Date.now();
      if (!lastRun) {
        func.apply(this, args);
        lastRun = now;
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if (now - lastRun >= limit) {
            func.apply(this, args);
            lastRun = Date.now();
          }
        }, limit - (now - lastRun));
      }
    };
  }

  // ✅ Fetch Movies
  const fetchMovies = useCallback(() => {
    setLoading(true);
    setErrorMsg("");

    const url = query
      ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${currentPage}&region=IN`
      : `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${currentPage}&region=IN`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);

        if (data.results?.length > 0) {
          setMovies(data.results);
        } else {
          setMovies([]);
          setErrorMsg("No movies found");
        }
      })
      .catch(() => {
        setLoading(false);
        setErrorMsg("Error fetching movies");
      });
  }, [query, currentPage]);

  // ✅ Initial + dependency fetch
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // ✅ Debounced search
  const handleSearch = debounce((value) => {
    setQuery(value);
    setCurrentPage(1);
  }, 500);

  // ✅ Throttled pagination
  const handlePrev = throttle(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, 500);

  const handleNext = throttle(() => {
    setCurrentPage((prev) => prev + 1);
  }, 500);

  return (
    <div className="container">
      <h1>🎬 Movie Explorer</h1>

      <input
        type="text"
        placeholder="Search movies…"
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div className="pagination">
        <button onClick={handlePrev}>Prev</button>
        <span>Page: {currentPage}</span>
        <button onClick={handleNext}>Next</button>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {errorMsg && <p className="error">{errorMsg}</p>}

      <div className="movie-list">
        {movies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <img
              src={
                movie.poster_path
                  ? IMAGE_BASE + movie.poster_path
                  : "https://via.placeholder.com/200x300"
              }
              alt={movie.title}
            />

            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p>{movie.release_date}</p>
              <p>{movie.overview?.slice(0, 100)}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
