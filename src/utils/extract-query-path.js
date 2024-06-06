const extractQueryParams = (query) => {
  return query
    .substr(1)
    .split("&")
    .reduce((queryParams, param) => {
      const [key, value] = param.split("=");
      return { ...queryParams, [key]: value };
    }, {});
};

export default extractQueryParams;
