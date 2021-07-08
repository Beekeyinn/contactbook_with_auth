const path = require('path');
const fs = require('fs');

const deleteFile = (filePath) => {
	fs.unlink(path.join(process.cwd(), filePath), (err) => {
		if (err) {
			console.log(err);
		}
		console.log('File Deleted');
	});
};

module.exports = { deleteFile };
