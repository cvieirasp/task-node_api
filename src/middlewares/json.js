const json = async (req, res) => {
  const buffer = [];

  for await (const chunk of req) {
    buffer.push(chunk);
  }

  try {
    const data = JSON.parse(Buffer.concat(buffer).toString());
    req.body = data;
  } catch {
    req.body = null;
  }

  res.setHeader("Content-Type", "application/json");
};

export default json;
