import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import { array, number, object, string } from "yup";

import { requireUserId } from "~/services/session.server";
import {
  getItemsCurrentlyBeingWatched,
  getMostPopularItems,
  getMostRecentItems,
  getMostWatchedItems,
  getRecentlyWatchedItems,
  upsertItem,
} from "~/models/item.server";

import ListItem from "~/components/dashboard/ListItem";

interface DashboardListItem {
  tt: string;
  title: string;
  image: string;
  url: string;
}

interface LoaderData {
  trending: DashboardListItem[];
  recentlyWatched: DashboardListItem[];
  popular: DashboardListItem[];
  mostWatched: DashboardListItem[];
  recent: DashboardListItem[];
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const trending = (await getItemsCurrentlyBeingWatched()).map((item) => {
    return {
      tt: item.tt,
      title: item._max.title,
      image: item._max.image,
      url: item._max.url,
    } as DashboardListItem;
  });
  const recentlyWatched = (await getRecentlyWatchedItems()).map((item) => {
    return {
      tt: item.tt,
      title: item._max.title,
      image: item._max.image,
      url: item._max.url,
    } as DashboardListItem;
  });
  const popular = (await getMostPopularItems()).map((item) => {
    return {
      tt: item.tt,
      title: item._max.title,
      image: item._max.image,
      url: item._max.url,
    } as DashboardListItem;
  });
  const mostWatched = (await getMostWatchedItems()).map((item) => {
    return {
      tt: item.tt,
      title: item._max.title,
      image: item._max.image,
      url: item._max.url,
    } as DashboardListItem;
  });
  const recent = (await getMostRecentItems()).map((item) => {
    return {
      tt: item.tt,
      title: item.title,
      image: item.image,
      url: item.url,
    } as DashboardListItem;
  });

  return json<LoaderData>({
    trending,
    recentlyWatched,
    popular,
    mostWatched,
    recent,
  });
};

const schema = object({
  tt: string().required(),
  title: string().required(),
  description: string().required(),
  image: string().required(),
  url: string().required(),
  referrer: string().required(),
  users: array().of(number().required()).required(),
});

export const action: ActionFunction = async ({ request }) => {
  const currentUserId = await requireUserId(request);
  const formData = await request.formData();

  const tt = formData.get("tt")?.toString() || "";
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const image = formData.get("image")?.toString() || "";
  const url = formData.get("url")?.toString() || "";
  const referrer = formData.get("referrer")?.toString() || "";
  const users = formData.getAll("users").map((x) => parseInt(x?.toString()));

  try {
    await schema.validate({
      tt,
      title,
      description,
      image,
      url,
      referrer,
      users,
    });
  } catch {
    throw new Error("Something went wrong...");
  }

  for (const user of users) {
    await upsertItem({
      tt,
      title,
      description,
      image,
      url,
      userId: parseInt(user.toString()),
      createdById: currentUserId,
    });
  }

  return redirect(referrer);
};

const SectionTitle = ({ title }: { title: String }) => (
  <div className="mb-8 border-b border-gray-200 pb-5">
    <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
  </div>
);

const ItemList = ({ items }: { items: DashboardListItem[] }) => {
  return (
    <ul className="-mx-4 mb-16 flex flex-wrap items-center">
      {items.map((item) => (
        <ListItem
          key={item.tt}
          tt={item.tt}
          title={item.title}
          url={item.url}
          image={item.image}
        />
      ))}
    </ul>
  );
};

export default function IndexPage() {
  const { trending, recentlyWatched, popular, mostWatched, recent } =
    useLoaderData<LoaderData>();

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
