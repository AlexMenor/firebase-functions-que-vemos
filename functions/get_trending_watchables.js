const functions = require("firebase-functions");
const watchables = require("../serialized_data.json");

exports.getTrendingWatchables = functions.https.onRequest(
  (request, response) => {
    let result = watchables;

    const { type, search, orderBy } = request.query;

    if (type === "MOVIE" || type === "SERIES")
      result = result.filter((watchable) => watchable.type === type);

    if (search)
      result = result.filter(
        ({ title, synopsis }) =>
          title.includes(search) || synopsis.includes(search)
      );

    if (orderBy) {
      const [field, order] = orderBy.split(",");

      if (order === "ASC") result.sort((a, b) => a[field] - b[field]);
      else result.sort((a, b) => b[field] - a[field]);
    }

    response.send(result);
  }
);
