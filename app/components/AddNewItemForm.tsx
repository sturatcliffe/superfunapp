import { FC, useEffect, useRef } from "react";
import { Form, useTransition } from "remix";

import Input from "./Input";

export interface Fields {
  url?: string;
}

interface Props {
  errors?: Fields;
}

const CREATE_ACTION = "create";

const AddNewItemForm: FC<Props> = ({ errors }) => {
  const urlRef = useRef<HTMLInputElement>(null);
  const transition = useTransition();

  let isSubmitting =
    transition.submission?.formData.get("action") === CREATE_ACTION;

  useEffect(() => {
    if (errors?.url) {
      urlRef.current?.focus();
    }
    if (!isSubmitting && !errors) {
      if (urlRef.current) {
        urlRef.current.value = "";
        urlRef.current.focus();
      }
    }
  }, [errors, isSubmitting]);

  return (
    <Form method="post">
      <input type="hidden" name="action" value={CREATE_ACTION}></input>
      <fieldset className="flex" disabled={isSubmitting}>
        <div className="w-full">
          <Input
            ref={urlRef}
            name="url"
            placeholder="Enter an IMDB URL..."
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={errors?.url ? true : undefined}
            aria-errormessage={errors?.url ? "url-error" : undefined}
          />
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
              <span>Saving...</span>
            </span>
          ) : (
            "Save"
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
};

export default AddNewItemForm;
