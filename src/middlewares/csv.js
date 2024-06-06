import { parse } from "csv-parse";

const csv = async (req, res) => {
  const buffer = [];

  for await (const chunk of req) {
    buffer.push(chunk);
  }

  try {
    const csvData = Buffer.concat(buffer).toString();
    const records = await new Promise((resolve, reject) => {
      parse(
        csvData,
        {
          delimiter: ",", // Define o delimitador
          columns: true, // Define que o CSV tem cabeçalhos
          skip_empty_lines: true, // Pula linhas vazias
        },
        (err, records) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(records);
          }
        }
      );
    });

    req.body = records;
  } catch {
    req.body = [];
  }

  res.setHeader("Content-Type", "application/json");
};

export default csv;
