const OfflinePage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded border border-red-800 bg-red-200 p-4 text-red-800">
        <h1 className="mb-4 text-3xl font-bold">Oooops...</h1>
        <p className="mb-2">
          You appear to be offline, and this page has not been cached!
        </p>
        <p>
          If you visit again with an active internet connection, it will be
          cached for the next time you go offline!
        </p>
      </div>
    </div>
  );
};

export default OfflinePage;
