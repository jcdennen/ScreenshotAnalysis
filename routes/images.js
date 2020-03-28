const express = require('express');
const router = express.Router();
const { createWorker } = require('tesseract.js');
const filename = './public/images/example.jpg'

/* GET image base page */
router.get('/', function(req, res, next) {
  res.render('images', { title: 'Image Uploader: In Progress' });
});

/* GET example screenshot */
router.get('/example', function(req, res, next) {

	// worker without logging
	const worker = createWorker();

	// woker with logging
	// const worker = createWorker({
	//   logger: x => console.log(x),
	// });

	// Process and return response
	(async () => {
	  await worker.load();
	  await worker.loadLanguage('eng');
	  await worker.initialize('eng');
	  const { data } = await worker.recognize(filename);

	  // respond as JSON (for now)
	  // there are definitely some better ways of handling the response, but we'll get there in time
	  // will likely offload this to the front end, then same the results
	  res.send(data.lines.filter(function(line) {
	  	return line.confidence >= 85.0; // anything less than this isn't relavant
	  }));
	  await worker.terminate();
	})();
});

/**
 * POST new image (TODO)
 * - process image
 * - save image file
 * - save results as JSON (for later use)
*/
router.post('/upload', function(req, res, next) {

  res.send('TODO');
});

module.exports = router;
