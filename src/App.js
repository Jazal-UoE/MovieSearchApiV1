/** @format */

import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const KEY = "a48a37b8";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");

  const [selectedID, setSelectedID] = useState(null);

  const [movies, isLoading, errorMsg] = useMovies(query);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleClickMovie(imdbID) {
    setSelectedID((currentID) => (currentID !== imdbID ? imdbID : null));
  }

  function handleCloseMovie() {
    setSelectedID(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => {
      const exists = watched.find(
        (watchedmovie) => watchedmovie.imdbID === movie.imdbID
      );
      if (!exists) return [...watched, movie];
      else {
        return watched.map((watchedmovie) => {
          if (watchedmovie.imdbID === movie.imdbID) {
            return movie;
          } else return watchedmovie;
        });
      }
    });

    // localStorage.setItem("watched", JSON.stringify([...watched, movie])); //would have to add this to arrow function if we wanted to implement error handling other cases etc
  }

  function handleRemoveWatched(movieid) {
    setWatched((watched) =>
      watched.filter((moviewatched) => moviewatched.imdbID !== movieid)
    );
  }

  // fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=interstellar`)
  //   .then((res) => res.json())
  //   .then((data) => {
  //     console.log(data.Search);
  //     return setMovies(data.Search);
  //   });

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {!isLoading && !errorMsg && (
            <MovieList
              handleClickMovie={handleClickMovie}
              movies={movies}
              handleCloseMovie={handleCloseMovie}
              selectedID={selectedID}
            />
          )}
          {errorMsg && <ErrorMessage errorMsg={errorMsg} />}
          {isLoading && <Loader />}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              handleCloseMovie={handleCloseMovie}
              selectedID={selectedID}
              handleAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
      <WatchedSummary watched={watched} />
              <WatchedMovieList
                handleRemoveWatched={handleRemoveWatched}
                watched={watched}
              />{" "}
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader"> Loading... </p>;
}

function ErrorMessage({ errorMsg }) {
  return (
    <p className="error">
      {" "}
      <span>🛑</span> {errorMsg}
    </p>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>useEffect</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  // useEffect(() => {
  //   const el = document.querySelector(".search");
  //   console.log(el);
  //   el.focus();
  // }, []);

  const inputElement = useRef(null); //Ref initial value gets stored after the dom has been loaded

  useKey("Enter", () => {
    if (document.activeElement === inputElement.current) return;
    inputElement.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleClickMovie, handleCloseMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleClickMovie={handleClickMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleClickMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => handleClickMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedID,
  handleCloseMovie,
  handleAddWatched,
  watched,
}) {
  const [movieDetails, setMovieDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(() => {
    if (userRating) {
      countRef.current += 1;
      console.log(countRef.current);
      localStorage.setItem("count", countRef.current);
    }
  }, [userRating]);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedID);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedID
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieDetails;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    handleAddWatched(newWatchedMovie);
  }

  useEffect(() => {
    async function loadMovieDetails() {
      try {
        setIsLoading(true);
        var res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}&plot=full`
        );
        var data = await res.json();
        setMovieDetails(data);
        setIsLoading(false);
      } catch (error) {}
    }
    loadMovieDetails();
  }, [selectedID]);

  useEffect(
    function () {
      if (!title) return;

      if (isLoading === true) {
        document.title = "loading...";
        return;
      }

      document.title = `Movie | ${title}`;

      //Cleanup Function
      return () => (document.title = "usePopcorn");
    },
    [title, isLoading]
  );

  useKey("Escape", handleCloseMovie);

  const isTop = imdbRating > 8; //derived state will berecalculated after every render.
  // since we have a effect that will update the imdbrating after launch. we can derive this value each time

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button
              className="btn-back"
              onClick={() => handleCloseMovie({ title })}
            >
              &larr;
            </button>

            <img src={poster} alt={`Poster of ${movieDetails} movie`} />

            <div className="details-overview">
              <h2> {title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span> {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  {" "}
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  <button className="btn-add" onClick={handleAdd}>
                    + Add to list
                  </button>
                </>
              ) : (
                <p>
                  {" "}
                  You have rated this movie {watchedUserRating}/10{" "}
                  <span>⭐️</span>
                </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring{actors}</p>
            <p> Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, handleRemoveWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          handleRemoveWatched={handleRemoveWatched}
          movie={movie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, handleRemoveWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleRemoveWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
