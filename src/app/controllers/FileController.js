import File from '../models/File';

class FileControlller {
  async store(req, res) {
    const { files } = req;

    const filesResponse = await Promise.all(
      files.map(f => {
        const { originalname: name, filename: path } = f;

        return File.create({ name, path });
      })
    );

    return res.json(filesResponse);
  }
}

export default new FileControlller();
