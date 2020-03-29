/**
* NOTE: this is largely based on an example provided by LogRocket, and serves as a learning tool
* https://blog.logrocket.com/how-to-extract-text-from-an-image-using-javascript-8fe282fb0e71/
*/
const recognitionImageElement = document.querySelector('#recognition-image-input');
const recognitionConfidenceElement = document.querySelector('#recognition-confidence-input');
const recognitionProgressElement = document.querySelector('#recognition-progress');
const recognitionTextElement = document.querySelector('#recognition-text');
const labeledImageElement = document.querySelector('#labeled-image');

const setImageSrc = (image, imageFile) => {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = function() {
            if (typeof fr.result !== 'string') {
                return reject(null);
            }
            image.src = fr.result;
            return resolve();
        };
        fr.onerror = reject;
        fr.readAsDataURL(imageFile);
    });
};

recognitionImageElement.addEventListener('change', () => {
    if (!recognitionImageElement.files) {
        return null;
    }
    const file = recognitionImageElement.files[0];

// use Tesseracts Workers
const worker = Tesseract.createWorker({
    logger: ({ progress, status }) => {
        if (!progress || !status || status !== 'recognizing text') {
            return null;
        }
        const p = (progress * 100).toFixed(2);
        recognitionProgressElement.textContent = `${status}: ${p}%`;
        recognitionProgressElement.value = p;
    }
});

(async () => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data } = await worker.recognize(file);

    await worker.terminate();

    // I'm more interested in pulling out the lines and performing some analysis on them (more to come)
    const lines = data.lines.filter((line) => {
        return line.confidence >= 85; // generally, anything less than 85 is bad
    });
    console.log((lines.length ? lines :  "couldn't find anything with enough confidence"));

    // The rest is related to the example this is built off of
    const labeledImage = document.createElement('img');
    await setImageSrc(labeledImage, file);

    const paragraphsElements = data.paragraphs.map(({ text }) => {
        const p = document.createElement('p');
        p.textContent = text;
        return p;
    });
    recognitionTextElement.append(...paragraphsElements);

    const wordsElements = data.words
        .filter(({ confidence }) => {
            return confidence > parseInt(recognitionConfidenceElement.value, 10);
        })
        .map((word) => {
            const div = document.createElement('div');
            const { x0, x1, y0, y1 } = word.bbox;
            div.classList.add('word-element');
            Object.assign(div.style, {
                top: `${y0}px`,
                left: `${x0}px`,
                width: `${x1 - x0}px`,
                height: `${y1 - y0}px`,
                border: '1px solid black',
                position: 'absolute',
            });
            return div;
        });

    labeledImageElement.appendChild(labeledImage);
    labeledImageElement.append(...wordsElements);
    })();
});
