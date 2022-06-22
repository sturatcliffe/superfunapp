import { forwardRef, useEffect, useRef, useState } from "react";
import { Form, useSubmit, useTransition } from "remix";

import { SEARCH_ACTION, CREATE_ACTION } from "../routes/__app/users/$userId";
import Input from "./Input";

import type { SearchResult } from "~/services/imdb.server";

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
              aria-invalid={errors?.url ? true : undefined}
              aria-errormessage={errors?.url ? "url-error" : undefined}
            />
            {!isSubmitting && results.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 max-h-60 divide-y divide-dashed overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                {results.map((item) => (
                  <li key={item.url} className="p-2 hover:bg-blue-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const formData = new FormData();
                        formData.set("action", CREATE_ACTION);
                        formData.set("url", item.url);

                        submit(formData, { method: "post" });
                      }}
                      className="flex items-center"
                    >
                      <img src={item.image} alt={item.title} className="mr-2" />
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="submit"
            className={`${
              isSubmitting ? "cursor-not-allowed opacity-50 " : ""
            } ml-4 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400`}
          >
            {isSubmitting ? (
              <span className="flex justify-start">
                <svg
                  className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Searching...</span>
              </span>
            ) : (
              "Search"
            )}
          </button>
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
