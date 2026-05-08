const bcrypt = require('bcryptjs');
const password = 'Admin@12345';
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log(hash);
});
