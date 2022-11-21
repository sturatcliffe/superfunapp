import { z } from "zod";

const BASE_URL = "https://www.omdbapi.com/";
const API_KEY = process.env.OMDB_API_KEY;

const retrieveResponseSchema = z.object({
  Title: z.string(),
  Year: z.string(),
  Rated: z.string(),
  Released: z.string(),
  Runtime: z.string(),
  Genre: z.string(),
  Director: z.string(),
  Writer: z.string(),
  Actors: z.string(),
  Plot: z.string(),
  Language: z.string(),
  Country: z.string(),
  Awards: z.string(),
  Poster: z.string(),
  Ratings: z.array(
    z.object({
      Source: z.string(),
      Value: z.string(),
    })
  ),
  Metascore: z.string(),
  imdbRating: z.string(),
  imdbVotes: z.string(),
  imdbID: z.string(),
  Type: z.string(),
  totalSeasons: z.string().optional(),
  Response: z.string().transform(Boolean),
});

export type OmdbRetrieveResponse = z.infer<typeof retrieveResponseSchema>;

export const retrieve = async (tt: string) => {
  const res = await fetch(`${BASE_URL}?i=${tt}&apikey=${API_KEY}`);

  if (!res.ok)
    throw new Error(
      `Failed to retrieve title from OMDB API, Please try again later.`
    );

  const parsed = retrieveResponseSchema.safeParse(await res.json());

  if (!parsed.success)
    throw new Error("Unexpected response received from OMDB API.");

  const { data } = parsed;

  if (data.Type === "game") throw new Error("Games are not supported.");

  return data;
};

const searchResponseSchema = z.object({
  Search: z
    .array(
      z.object({
        Title: z.string(),
        Year: z.string(),
        imdbID: z.string(),
        Type: z.string(),
        Poster: z.string(),
      })
    )
    .optional(),
  totalResults: z.string().optional().transform(Number),
  Response: z.string().transform(Boolean),
  Error: z.string().optional(),
});

export type OmdbSearchResponse = z.infer<typeof searchResponseSchema>;

export const search = async (q: string) => {
  const res = await fetch(`${BASE_URL}?s=${q}&apikey=${API_KEY}`);

  if (!res.ok)
    throw new Error("Failed to load search results, please try again later.");

  const parsed = searchResponseSchema.safeParse(await res.json());

  if (!parsed.success)
    throw new Error(
      "Unexpected response received from OMDB, Please try again later."
    );

  const { data } = parsed;

  if (data.Search) data.Search = data.Search.filter((x) => x.Type !== "game");

  return data;
};
