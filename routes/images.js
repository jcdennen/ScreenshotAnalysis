const express = require('express');
const router = express.Router();
const { createWorker } = require('tesseract.js');

/* GET image base page - a way for users to test with their own image on the front end */
router.get('/', (req, res, next) => {
	res.render('images', { title: 'Image Uploader (WIP)' });
});

/* GET example screenshot results in JSON*/
router.get('/json-example', (req, res, next) => {

	// create our worker
	const worker = createWorker();

	// an example image we'll use to pull text from
	const filename = './public/images/example.jpg'

	// Example: woker with logging/progress updates (this is too noisy)
	// const worker = createWorker({
	//   logger: x => console.log(x),
	// });

	// Process and return response
	// there are definitely some better ways of handling the response, but we'll get there in time
	// I'll likely offload this to the front end, then display the results
	(async () => {
		await worker.load();
		await worker.loadLanguage('eng');
		await worker.initialize('eng');
		const { data } = await worker.recognize(filename);

		res.send(data.lines.filter((line) => {
	  	return line.confidence >= 85.0; // 85 really is that perfect number ( so far ...)
	  }));
		await worker.terminate();
	})();
});

/**
 * POST new image
 * - would be nice for other people to upload their own image and try it
 * - process image
 * - save image file
 * - save results as JSON (for later use)
 */
router.post('/upload', (req, res, next) => {
	res.send('TODO');
});

// ayye I'm workin on it alright?
router.get('/upload', (req, res, next) => {
	res.send('TODO');
});

module.exports = router;
