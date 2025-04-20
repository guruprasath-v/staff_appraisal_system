const bcrypt = require("bcrypt");
bcrypt.hash('admin@124', 10).then((hash) => {
  console.log(hash);
});

