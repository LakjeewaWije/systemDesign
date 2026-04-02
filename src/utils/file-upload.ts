import * as fs from 'fs/promises';

export const saveLocalAsync = async (file: any, directoryPath: string) => {
  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(directoryPath, { recursive: true });

    // Generate a unique filename
    const timestamp = new Date().getTime();
    const randomString = Array(16)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');

    await fs.writeFile(
      `${directoryPath}/${timestamp}-${file.originalname}-${randomString}.${file.originalname.split('.').pop()}`,
      file.buffer,
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
