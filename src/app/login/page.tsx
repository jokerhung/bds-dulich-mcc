import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('https://vietunique.vn/Uploads/tour-mu-cang-chai-mua-lua-chin.jpg')",
      }}
    >
      <LoginForm />
    </main>
  );
}
