import * as cheerio from "cheerio";

export interface SearchResult {
  url: string;
  title: string;
  image: string;
}

export const searchImdb = async (q: string) => {
  const imdbUrl = new URL("https://imdb.com/find");
  imdbUrl.searchParams.set("q", q);
  imdbUrl.searchParams.set("s", "tt");

  const imdbDocument = await (await fetch(imdbUrl.toString())).text();
  const $ = cheerio.load(imdbDocument);

  const results: SearchResult[] = [];

  $("table.findList")
    .first()
    .find("tr")
    .each((index, elem) => {
      const anchorElem = $(elem).find(".primary_photo a");
      const url = `https://www.imdb.com${anchorElem.attr("href")}`;
      const image = anchorElem.find("img").attr("src");
      const title = $(elem).find(".result_text").text().trim();

      if (!url || !image || !title) return;

      results.push({ url, title, image });
    });

  return results;
};

export const scrapeImdbData = async (url: string) => {
  const imdbDocument = await (await fetch(url)).text();
  const $ = cheerio.load(imdbDocument);

  const rawTitle = $("meta[property='twitter:title']").attr("content");
  const title = rawTitle?.substring(0, rawTitle.length - 7);
  const description = $("meta[property='twitter:description']").attr("content");
  const image = $("meta[property='twitter:image']").attr("content");

  return {
    title,
    description,
    image,
  };
};
