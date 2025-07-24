'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Something went wrong!</h2>
      <p className="text-gray-700 mb-4">{error.message || 'An error occurred while loading conversations'}</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}