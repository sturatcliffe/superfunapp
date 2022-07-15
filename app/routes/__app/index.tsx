import { json, LoaderFunction, useLoaderData } from "remix";

import { requireUserId } from "~/services/session.server";
import {
  getItemsCurrentlyBeingWatched,
  getMostPopularItems,
  getMostRecentItems,
  getMostWatchedItems,
  getRecentlyWatchedItems,
} from "~/models/item.server";

interface LoaderData {
  trending: Awaited<ReturnType<typeof getItemsCurrentlyBeingWatched>>;
  recentlyWatched: Awaited<ReturnType<typeof getRecentlyWatchedItems>>;
  popular: Awaited<ReturnType<typeof getMostPopularItems>>;
  mostWatched: Awaited<ReturnType<typeof getMostWatchedItems>>;
  recent: Awaited<ReturnType<typeof getMostRecentItems>>;
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const trending = await getItemsCurrentlyBeingWatched();
  const recentlyWatched = await getRecentlyWatchedItems();
  const popular = await getMostPopularItems();
  const mostWatched = await getMostWatchedItems();
  const recent = await getMostRecentItems();

  return json<LoaderData>({
    trending,
    recentlyWatched,
    popular,
    mostWatched,
    recent,
  });
};

export default function IndexPage() {
  const { trending, recentlyWatched, popular, mostWatched, recent } =
    useLoaderData<LoaderData>();

  const SectionTitle = ({ title }: { title: String }) => (
    <div className="mb-8 border-b border-gray-200 pb-5">
      <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
    </div>
  );

  const ItemList = ({
    items,
  }: {
    items:
      | LoaderData["trending"]
      | LoaderData["recentlyWatched"]
      | LoaderData["popular"]
      | LoaderData["mostWatched"]
      | LoaderData["recent"];
  }) => (
    <ul className="-mx-4 mb-16 flex flex-wrap items-center md:flex-nowrap">
      {items.map((item, index) => (
        <li key={index} className="mb-4 w-1/2 px-4 md:w-1/4">
          <a target="_blank" rel="noreferrer" href={item.url}>
            <img src={item.image} alt={item.title} />
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-6">
      <SectionTitle title="Trending Now" />
      <ItemList items={trending} />
      <SectionTitle title="Recently Watched" />
      <ItemList items={recentlyWatched} />
      <SectionTitle title="Most Popular Additions" />
      <ItemList items={popular} />
      <SectionTitle title="Most Watched" />
      <ItemList items={mostWatched} />
      <SectionTitle title="Recent Additions" />
      <ItemList items={recent} />
    </div>
  );
}
