import { FormEvent, forwardRef, useEffect, useRef, useState } from "react";
import { Form, useSubmit, useTransition } from "remix";
import { PlusIcon } from "@heroicons/react/outline";
import debounce from "lodash.debounce";

import { SEARCH_ACTION, CREATE_ACTION } from "../routes/__app/users/$userId";
import Input from "./Input";

import type { OmdbSearchResponse } from "~/services/omdb.server";
import LoadingSpinner from "./LoadingSpinner";

export interface Fields {
  url?: string;
}

interface Props {
  query?: string;
  result?: OmdbSearchResponse;
  errors?: Fields;
}

const AddNewItemForm = forwardRef<HTMLInputElement, Props>(
  ({ query, result: resultProp, errors }, ref) => {
    const submit = useSubmit();
    const transition = useTransition();

    const [result, setResult] = useState<OmdbSearchResponse | undefined>(
      resultProp
    );

    const formRef = useRef<HTMLFormElement | null>(null);

    let isSubmitting = [SEARCH_ACTION, CREATE_ACTION].includes(
      (transition.submission?.formData.get("action") as string) ?? ""
    );

    useEffect(() => {
      const handleClickAway = (e: any) => {
        if (formRef.current && !formRef.current.contains(e.target)) {
          setResult(undefined);
        }
      };

      document.addEventListener("mousedown", handleClickAway);

      return () => {
        document.removeEventListener("mousedown", handleClickAway);
      };
    }, []);

    useEffect(() => {
      setResult(resultProp);
    }, [resultProp]);

    const search = debounce((query: string) => {
      if (query.length > 0) {
        const formData = new FormData();
        formData.set("action", SEARCH_ACTION);
        formData.set("q", query);

        submit(formData, { method: "post" });
      } else {
        setResult(undefined);
      }
    }, 500);

    return (
      <Form ref={formRef} method="post">
        <fieldset className="flex" disabled={isSubmitting}>
          <div className="relative w-full">
            <Input
              ref={ref}
              name="q"
              placeholder="Search for a title..."
              defaultValue={query}
              onChange={(e: FormEvent<HTMLInputElement>) =>
                search(e.currentTarget.value)
              }
              aria-invalid={errors?.url ? true : undefined}
              aria-errormessage={errors?.url ? "url-error" : undefined}
            />
            {isSubmitting && (
              <LoadingSpinner className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
            )}
            {result?.Search?.length && (
              <ul className="absolute left-0 right-0 z-10 mt-1 max-h-60 divide-y divide-dashed overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                {result.Search.map((item) => (
                  <li
                    key={item.imdbID}
                    className="flex items-center justify-between p-2 hover:bg-blue-100"
                  >
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://imdb.com/title/${item.imdbID}`}
                      className="flex items-center"
                    >
                      {item.Poster !== "N/A" && (
                        <img
                          src={item.Poster}
                          alt={item.Title}
                          className="mr-2 w-24"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold">
                          {item.Title}
                        </span>
                        <span className="text-sm capitalize">
                          {item.Type} ({item.Year})
                        </span>
                      </div>
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const formData = new FormData();
                        formData.set("action", CREATE_ACTION);
                        formData.set("tt", item.imdbID);

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

AddNewItemForm.displayName = "AddNewItemForm";

export default AddNewItemForm;
