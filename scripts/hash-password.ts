import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Cách dùng: node scripts/hash-password.ts "mật khẩu của bạn"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log(hash);
console.log(
  '\nLưu ý: khi dán vào .env.local, escape mọi ký tự "$" thành "\\$" ' +
    "(Next.js tự expand biến $NAME trong .env.local nên sẽ làm hỏng hash nếu không escape)."
);
