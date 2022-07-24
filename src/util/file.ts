import fs from 'fs';

const deleteFile = (filePath: any) => {
    if (filePath)
        fs.unlink(filePath, (err: any) => {
            if (err) {
                throw (err);
            }
        });
}

export default deleteFile;