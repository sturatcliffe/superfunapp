import * as cheerio from "cheerio";

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
