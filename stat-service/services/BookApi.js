import axios from "axios";
import dotenv from "dotenv";
import {
  createCircuitBreaker,
  createDefaultFallback,
} from "../utilities/circuitBreaker.js";

dotenv.config();

const BOOK_SERVICE_URL =
  process.env.BOOK_SERVICE_URL || "http://localhost:8082/api";

// Create an axios instance for book-service with improved timeouts
const bookApiClient = axios.create({
  baseURL: BOOK_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: process.env.API_TIMEOUT || 5000, // 5 second timeout default
});

const getBookStatsFn = async () => {
  try {
    const response = await bookApiClient.get("/books/stats");
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching book stats: ${error.message}`);
  }
};
// Create circuit breaker for getBookStats
const getBookStatsBreaker = createCircuitBreaker(
  getBookStatsFn,
  "getBookStats",
  { timeout: 3000 } // Lower timeout for read operations
);
// Define fallback function
getBookStatsBreaker.fallback(
  createDefaultFallback("Book service - getBookStats", null)
);
// Circuit-breaker wrapped function
export const getBookStats = async () => {
  return getBookStatsBreaker.fire();
};

// Base function for getting a book by ID
const getBookByIdFn = async (bookId) => {
  try {
    const response = await bookApiClient.get(`/books/${bookId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(`Error fetching book: ${error.message}`);
  }
};

// Create circuit breaker for getBookById
const getBookByIdBreaker = createCircuitBreaker(
  getBookByIdFn,
  "getBookById",
  { timeout: 3000 } // Lower timeout for read operations
);

// Define fallback function
getBookByIdBreaker.fallback(
  createDefaultFallback("Book service - getBookById", null)
);

// Circuit-breaker wrapped function
export const getBookById = async (bookId) => {
  return getBookByIdBreaker.fire(bookId);
};

// Base function for decreasing book availability
const decreaseBookAvailabilityFn = async (bookId) => {
  try {
    const response = await bookApiClient.patch(
      `/books/${bookId}/decrease-availability`
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error decreasing book availability: ${error.message}`);
  }
};

// Create circuit breaker for decreaseBookAvailability
const decreaseBookAvailabilityBreaker = createCircuitBreaker(
  decreaseBookAvailabilityFn,
  "decreaseBookAvailability",
  { timeout: 6000 } // Higher timeout for write operations
);

// Define fallback for decrease availability (critical operation)
decreaseBookAvailabilityBreaker.fallback((bookId, error) => {
  console.error(
    `Circuit breaker fallback for decreaseBookAvailability: ${error.message}`
  );
  throw new Error(
    `Book service unavailable: Cannot decrease book availability at this time`
  );
});

// Circuit-breaker wrapped function
export const decreaseBookAvailability = async (bookId) => {
  return decreaseBookAvailabilityBreaker.fire(bookId);
};

// Base function for increasing book availability
const increaseBookAvailabilityFn = async (bookId) => {
  try {
    const response = await bookApiClient.patch(
      `/books/${bookId}/increase-availability`
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error increasing book availability: ${error.message}`);
  }
};

// Create circuit breaker for increaseBookAvailability
const increaseBookAvailabilityBreaker = createCircuitBreaker(
  increaseBookAvailabilityFn,
  "increaseBookAvailability",
  { timeout: 6000 } // Higher timeout for write operations
);

// Define fallback for increase availability (critical operation)
increaseBookAvailabilityBreaker.fallback((bookId, error) => {
  console.error(
    `Circuit breaker fallback for increaseBookAvailability: ${error.message}`
  );
  throw new Error(
    `Book service unavailable: Cannot increase book availability at this time`
  );
});

// Circuit-breaker wrapped function
export const increaseBookAvailability = async (bookId) => {
  return increaseBookAvailabilityBreaker.fire(bookId);
};

// Base function for updating book availability
const updateBookAvailabilityFn = async (bookId, availableCopies, operation) => {
  try {
    const response = await bookApiClient.patch(
      `/books/${bookId}/availability`,
      { available_copies: availableCopies, operation }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error updating book availability: ${error.message}`);
  }
};

// Create circuit breaker for updateBookAvailability
const updateBookAvailabilityBreaker = createCircuitBreaker(
  updateBookAvailabilityFn,
  "updateBookAvailability",
  { timeout: 6000 } // Higher timeout for write operations
);

// Define fallback for update availability (critical operation)
updateBookAvailabilityBreaker.fallback(
  (bookId, availableCopies, operation, error) => {
    console.error(
      `Circuit breaker fallback for updateBookAvailability: ${error.message}`
    );
    throw new Error(
      `Book service unavailable: Cannot update book availability at this time`
    );
  }
);

// Circuit-breaker wrapped function
export const updateBookAvailability = async (
  bookId,
  availableCopies,
  operation
) => {
  return updateBookAvailabilityBreaker.fire(bookId, availableCopies, operation);
};

// Health check function to verify book service is online
export const checkBookServiceHealth = async () => {
  try {
    const response = await bookApiClient.get("/books?per_page=1");
    return { status: "ok", message: "Book service is healthy" };
  } catch (error) {
    return {
      status: "error",
      message: `Book service health check failed: ${error.message}`,
    };
  }
};

export default {
  getBookById,
  decreaseBookAvailability,
  increaseBookAvailability,
  updateBookAvailability,
  checkBookServiceHealth,
};
