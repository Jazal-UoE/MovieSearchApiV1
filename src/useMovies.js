/** @format */
import { useState, useEffect } from "react";
const KEY = "a48a37b8";
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setErrorMsg("");

        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok)
          throw new Error("Something went wrong with fetching movies");

        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie not found");

        setMovies(data.Search);
        setErrorMsg("");
      } catch (error) {
        if (error.name !== "AbortError") {
          setErrorMsg(error.message);
          console.log(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setErrorMsg("");
      return; //return so we break out of arrow function
    }

    fetchMovies();
    return () => controller.abort();
  }, [query]);
  return [movies, isLoading, errorMsg];
}
