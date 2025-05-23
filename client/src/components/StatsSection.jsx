import { useState } from "react";
import { statsAPI } from "../services/stat-api.js";

const StatsSection = () => {
  const [systemOverview, setSystemOverview] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSystemOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await statsAPI.getSystemOverview();
      setSystemOverview(data);
    } catch (err) {
      setError("Failed to fetch system overview");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await statsAPI.getPopularBooks();
      setPopularBooks(data);
    } catch (err) {
      setError("Failed to fetch popular books");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Statistics</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">System Overview</h3>
        <button
          onClick={fetchSystemOverview}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Overview"}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {systemOverview && (
          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-3 border rounded-md bg-blue-50">
                <h4 className="font-medium text-blue-800">Total Books</h4>
                <p className="text-2xl font-bold">
                  {systemOverview.total_books}
                </p>
              </div>
              <div className="p-3 border rounded-md bg-green-50">
                <h4 className="font-medium text-green-800">Total Users</h4>
                <p className="text-2xl font-bold">
                  {systemOverview.total_users?.count || 0}
                </p>
              </div>
              <div className="p-3 border rounded-md bg-amber-50">
                <h4 className="font-medium text-amber-800">Active Loans</h4>
                <p className="text-2xl font-bold">
                  {systemOverview.books_borrowed?.count || 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 border rounded-md bg-purple-50">
                <h4 className="font-medium text-purple-800">Books Available</h4>
                <p className="text-2xl font-bold">
                  {systemOverview.books_available}
                </p>
              </div>
              <div className="p-3 border rounded-md bg-red-50">
                <h4 className="font-medium text-red-800">Overdue Loans</h4>
                <p className="text-2xl font-bold">
                  {systemOverview.overdue_loans?.count || 0}
                </p>
              </div>
              <div className="p-3 border rounded-md bg-indigo-50">
                <h4 className="font-medium text-indigo-800">
                  Today's Activity
                </h4>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm">Loans</p>
                    <p className="text-xl font-bold">
                      {systemOverview.loans_today?.count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Returns</p>
                    <p className="text-xl font-bold">
                      {systemOverview.returns_today?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Popular Books</h3>
        <button
          onClick={fetchPopularBooks}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Popular Books"}
        </button>

        {popularBooks.length > 0 && (
          <div className="mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loans
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popularBooks.map((book) => (
                  <tr key={book.book_id || book._id || book.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book.book_id || book._id || book.id}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book.title}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book.author}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book.borrow_count || book.loanCount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsSection;
