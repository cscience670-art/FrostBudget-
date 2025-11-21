import AuthForm from '@/components/AuthForm'
import { Test } from "@/components/test-component-file"; // او نفس الملف لو موجود فوق

const SignUp = async () => {

  return (
    <section className="flex-center size-full max-sm:px-6">
      <Test />  {/* ← هكذا نستدعي المكوّن */}
      <AuthForm type="sign-up" />
    </section>
  );
};

export default SignUp;
