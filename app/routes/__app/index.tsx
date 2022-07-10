import { json, LoaderFunction, useLoaderData } from "remix";

import { requireUserId } from "~/services/session.server";
import { getMostPopularItems, getMostRecentItems } from "~/models/item.server";

interface LoaderData {
  popular: Awaited<ReturnType<typeof getMostPopularItems>>;
  recent: Awaited<ReturnType<typeof getMostRecentItems>>;
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const popular = await getMostPopularItems();
  const recent = await getMostRecentItems();

  return json<LoaderData>({ popular, recent });
};

export default function IndexPage() {
  const { popular, recent } = useLoaderData<LoaderData>();

  const SectionTitle = ({ title }: { title: String }) => (
    <div className="mb-8 border-b border-gray-200 pb-5">
      <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
    </div>
  );

  const ItemList = ({
    items,
  }: {
    items: LoaderData["popular"] | LoaderData["recent"];
  }) => (
    <ul className="-mx-4 mb-16 flex flex-wrap items-center md:flex-nowrap">
      {items.map((item) => (
        <li className="mb-4 w-1/2 px-4 md:w-auto">
          <a target="_blank" rel="noreferrer" href={item.url}>
            <img src={item.image} alt={item.title} />
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-6">
      <SectionTitle title="Most Popular" />
      <ItemList items={popular} />
      <SectionTitle title="Recently Added" />
      <ItemList items={recent} />
    </div>
  );
}
