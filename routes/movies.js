const router = require("express").Router();
const Movie = require("../models/Movie");
const movies = require("../config/movies.json");

router.post("/movies", async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 0;
		const limit = parseInt(req.query.limit) || 5;
		const regexQuery = req.body || null;
		
		let sort = req.query.sort || "rating";
		let genre = req.query.genre || "All";
		let direction = req.query.direction || "asc";

		const genreOptions = [
			"Action",
			"Romance",
			"Fantasy",
			"Drama",
			"Crime",
			"Adventure",
			"Thriller",
			"Sci-fi",
			"Music",
			"Family",
		];

		genre === "All"
			? (genre = [...genreOptions])
			: (genre = req.query.genre.split(","));
		req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

		let sortBy = {};
		sortBy[sort] = direction;
		
		const movies = await Movie.find(regexQuery)
			.where("genre")
			.in([...genre])
			.sort(sortBy)
			.skip(page * limit)
			.limit(limit);

		const total = await Movie.countDocuments({
			genre: { $in: [...genre] },
			...regexQuery
		});

		const response = {
			error: false,
			total,
			page: page,
			limit,
			genres: genreOptions,
			movies,
		};

		res.status(200).json(response);
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: true, message: "Internal Server Error" });
	}
});

// const insertMovies = async () => {
//     try {
//         const docs = await Movie.insertMany(movies);
//         return Promise.resolve(docs);
//     } catch (err) {
//         return Promise.reject(err)
//     }
// };

// insertMovies()
//     .then((docs) => console.log(docs))
//     .catch((err) => console.log(err))

module.exports = router;
