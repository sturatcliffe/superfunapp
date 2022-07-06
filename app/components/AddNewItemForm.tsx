import { forwardRef, useEffect, useRef, useState } from "react";
import { Form, useSubmit, useTransition } from "remix";
import { SearchIcon, PlusIcon } from "@heroicons/react/outline";

import { SEARCH_ACTION, CREATE_ACTION } from "../routes/__app/users/$userId";
import Input from "./Input";

import type { SearchResult } from "~/services/imdb.server";
import LoadingSpinner from "./LoadingSpinner";

export interface Fields {
  url?: string;
}

interface Props {
  results?: SearchResult[];
  errors?: Fields;
}

const AddNewItemForm = forwardRef<HTMLInputElement, Props>(
  ({ results: resultsProp, errors }, ref) => {
    const submit = useSubmit();
    const transition = useTransition();

    const [results, setResults] = useState<SearchResult[]>([]);

    const formRef = useRef<HTMLFormElement | null>(null);

    let isSubmitting = [SEARCH_ACTION, CREATE_ACTION].includes(
      (transition.submission?.formData.get("action") as string) ?? ""
    );

    useEffect(() => {
      const handleClickAway = (e: any) => {
        if (formRef.current && !formRef.current.contains(e.target)) {
          setResults([]);
        }
      };

      document.addEventListener("mousedown", handleClickAway);

      return () => {
        document.removeEventListener("mousedown", handleClickAway);
      };
    }, []);

    useEffect(() => {
      if (resultsProp && resultsProp.length > 0) {
        setResults(resultsProp);
      }
    }, [resultsProp]);

    return (
      <Form ref={formRef} method="post">
        <input type="hidden" name="action" value={SEARCH_ACTION}></input>
        <fieldset className="flex" disabled={isSubmitting}>
          <div className="relative w-full">
            <Input
              ref={ref}
              name="q"
              placeholder="Search for a title..."
              isSubmitting={isSubmitting}
              submitBtn={
                <button
                  type="submit"
                  className={`${
                    isSubmitting ? "cursor-not-allowed " : ""
                  } rounded-r bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400`}
                >
                  {isSubmitting ? (
                    <LoadingSpinner />
                  ) : (
                    <SearchIcon className="h-5 w-5" />
                  )}
                </button>
              }
              aria-invalid={errors?.url ? true : undefined}
              aria-errormessage={errors?.url ? "url-error" : undefined}
            />
            {results.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 max-h-60 divide-y divide-dashed overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                {results.map((item) => (
                  <li
                    key={item.url}
                    className="flex items-center justify-between p-2 hover:bg-blue-100"
                  >
                    <a
                      target="_blank"
                      href={item.url}
                      className="flex items-center"
                    >
                      <img src={item.image} alt={item.title} className="mr-2" />
                      {item.title}
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const formData = new FormData();
                        formData.set("action", CREATE_ACTION);
                        formData.set("url", item.url);

                        submit(formData, { method: "post" });
                      }}
                      className="justify-self-end rounded-full bg-blue-500 p-2 text-white opacity-50 hover:opacity-100"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </fieldset>
        {errors?.url && (
          <div className="pt-1 text-red-700" id="url=error">
            {errors.url}
          </div>
        )}
      </Form>
    );
  }
);

export default AddNewItemForm;
