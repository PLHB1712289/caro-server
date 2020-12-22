const generateIDUser = () => {
  return "xxxxxxxxxx".replace(/[x]/g, function (c) {
    const r = Math.floor(Math.random() * 10);
    return r.toString();
  });
};

module.exports = generateIDUser;
